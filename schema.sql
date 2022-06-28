create database if not exists game;
use game;

create rowstore reference table if not exists turn_id_sequence (
  next_val int primary key
);
insert into turn_id_sequence values (0);

-- turns tracks stats about the last 100 turns
create rowstore reference table if not exists turns (
  slot BIGINT NOT NULL PRIMARY KEY,
  tid BIGINT NOT NULL UNIQUE,
  start_time DATETIME(6) DEFAULT NOW(6) SERIES TIMESTAMP,
  end_time DATETIME(6) DEFAULT NULL
);

create table if not exists solar_system (
  sid BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  x INT UNSIGNED NOT NULL,
  y INT UNSIGNED NOT NULL
);

create rowstore table if not exists entity (
  sid BIGINT NOT NULL,
  eid BIGINT NOT NULL AUTO_INCREMENT,

  kind TINYINT UNSIGNED NOT NULL
    COMMENT "1 = ship, 2 = energy node",

  x INT UNSIGNED NOT NULL,
  y INT UNSIGNED NOT NULL,

  energy      SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  shield      TINYINT  UNSIGNED NOT NULL DEFAULT 100,
  blasters    TINYINT  UNSIGNED NOT NULL DEFAULT 2,
  thrusters   TINYINT  UNSIGNED NOT NULL DEFAULT 2,
  harvesters  TINYINT  UNSIGNED NOT NULL DEFAULT 2,

  -- last_plan is 8 bytes
  -- the first byte is the last command
  -- the remaining bytes (7) is memory
  last_plan BIGINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (sid, eid),
  SHARD KEY (sid)
);

source functions.sql;

drop view if exists entity_next;
create view entity_next as (
  select
    entity.sid, entity.eid,
    step(
      row(
        entity.kind,
        entity.x,
        entity.y,
        entity.energy,
        entity.shield,
        entity.blasters,
        entity.thrusters,
        entity.harvesters
      ),
      entity.last_plan,
      group_concat(pack(row(
        coalesce(neighbor.kind, 0),
        coalesce(neighbor.blasters, 0),
        coalesce(neighbor.x, 0),
        coalesce(neighbor.y, 0)
      )) separator '')
    ) as plan
  from entity
  left join entity neighbor on (
    entity.sid = neighbor.sid
    and entity.eid != neighbor.eid
    -- entities can only see a certain radius around them
    -- tune this radius based on the cell density and performance requirements
    and distance_2d(
      entity.x, entity.y,
      neighbor.x, neighbor.y
    ) < 16
  )
  where entity.kind = 1 -- ship
  group by entity.sid, entity.eid
);

drop view if exists debug_next;
create view debug_next as (
  select
    entity.sid, entity.eid, entity.x, entity.y, 
    decodeplan(plan)
  from entity natural join entity_next
);

drop view if exists entity_damage;
create view entity_damage as (
  select
    a.sid,
    a.eid,
    sum(b.blasters) as damage
  from entity a
  inner join entity b on (
    a.sid = b.sid
    and a.eid != b.eid
    and a.x = b.x
    and a.y = b.y
  )
  where a.kind = 1 and b.kind = 1
  group by a.sid, a.eid
);

drop view if exists cells_with_multiple_systems;
create view cells_with_multiple_systems as (
  select x, y from (
    select x, y, count(*) as c from solar_system
    group by x, y
  )
  where c > 1
);

drop view if exists cells_with_multiple_entities;
create view cells_with_multiple_entities as (
  select x, y from (
    select x, y, count(*) as c from entity
    group by x, y
  )
  where c > 1
);

drop view if exists entities_without_conflict;
create view entities_without_conflict as (
  select a.*
  from entity a
  left join entity b on (
    a.sid = b.sid
    and a.eid != b.eid
    and a.x = b.x
    and a.y = b.y
    and b.kind = 1
  )
  where b.eid is null and a.kind = 1
  group by a.sid, a.eid
);

drop view if exists entity_harvest;
create view entity_harvest as (
  select
    entity.sid,
    entity.eid,
    sum(least(entity.harvesters, energy_node.energy)) as harvested
  from entities_without_conflict entity
  join entity energy_node on (
    entity.sid = energy_node.sid
    and entity.x = energy_node.x
    and entity.y = energy_node.y
    and energy_node.kind = 2
  )
  group by entity.sid, entity.eid
);

delimiter //

create or replace procedure run_turn()
as declare
  turn_id bigint;
begin
  start transaction;

  -- generate our turn id
  update turn_id_sequence set next_val = last_insert_id(next_val + 1);
  turn_id = last_insert_id();

  -- start the turn timer
  replace into turns (slot, tid) values (turn_id % 10, turn_id);

  -- gather and apply entity commands
  update entity
  left join entity_next on (
    entity.sid = entity_next.sid
    and entity.eid = entity_next.eid
  )
  join applyplan(
    row(
      entity.kind,
      entity.x,
      entity.y,
      entity.energy,
      entity.shield,
      entity.blasters,
      entity.thrusters,
      entity.harvesters
    ),
    ifnull(entity_next.plan, 0) :> BIGINT UNSIGNED
  ) as applied
  set
    x = applied.x,
    y = applied.y,
    energy = applied.energy,
    shield = applied.shield,
    blasters = applied.blasters,
    thrusters = applied.thrusters,
    harvesters = applied.harvesters,
    last_plan = ifnull(entity_next.plan, entity.last_plan) :> BIGINT UNSIGNED
  where entity.kind = 1;

  -- resolve battles
  update entity
  join entity_damage on (
    entity.sid = entity_damage.sid
    and entity.eid = entity_damage.eid
  )
  set entity.shield = entity.shield - entity_damage.damage;

  -- convert dead entities into energy nodes
  update entity set kind = 2
  where shield <= 0 and kind = 1;

  -- entities harvest energy
  update entity
  join entity_harvest on (
    entity.sid = entity_harvest.sid
    and entity.eid = entity_harvest.eid
  )
  set energy = entity.energy + entity_harvest.harvested;

  -- entities not in conflict recover shield
  update entity
  join entities_without_conflict nonconflict on (
    entity.sid = nonconflict.sid
    and entity.eid = nonconflict.eid
  )
  set shield = entity.shield + 1
  where entity.shield < 100;

  -- energy nodes loose energy when harvested
  update entity energy_node
  join entities_without_conflict harvesting_entity on (
    energy_node.sid = harvesting_entity.sid
    and energy_node.x = harvesting_entity.x
    and energy_node.y = harvesting_entity.y
  )
  set energy = energy_node.energy - least(energy_node.energy, harvesting_entity.harvesters)
  where energy_node.kind = 2;

  -- remove energyless entities
  delete from entity where energy <= 0;

  -- finalize the turn
  update turns set end_time = NOW(6) where tid = turn_id;

  commit;
exception when others then rollback;
end //

create or replace procedure spawn(min_ships int, min_energy_nodes int)
as declare
  turn_id bigint;
begin
  start transaction;

  insert into entity (sid, kind, x, y)
  select
    sid, 1 as kind,
    floor(rand(now() + sid) * 100) as x,
    floor(rand(now() + sid + 1) * 100) as y
  from solar_system
  where
    (
      select count(*) from entity
      where entity.sid = solar_system.sid
        and entity.kind = 1
    ) < min_ships;

  insert into entity (sid, kind, x, y)
  select
    sid, 2 as kind,
    floor(rand(now() + sid) * 100) as x,
    floor(rand(now() + sid + 1) * 100) as y
  from solar_system
  where
    (
      select count(*) from entity
      where entity.sid = solar_system.sid
        and entity.kind = 2
    ) < min_energy_nodes;

  commit;
exception when others then rollback;
end //

delimiter ;

-- WEB API

drop user if exists web;
create user web identified by 'wasm-space-program';
grant select on game.* to web;

/*
insert into entity
    (sid, eid,  kind,   x,  y, thrusters)
values
    (40275,   null, 1,      5,  5, 2),
    (40275,   null, 1,     10, 10, 3),
    (40275,   null, 2,     15, 15, 4),
    (40275,   null, 1,     20, 20, 5);

insert into entity (sid, eid,  kind,   x,  y)
values
    (0,   null, 2,      10,  15);

insert into entity set
    sid = 0, eid = null,
    kind = 1,
    x = 10,
    y = 20,
    energy = 100,
    shield = 100,
    blasters = 1,
    thrusters = 1,
    harvesters = 1;

-- generate solar systems
insert into solar_system (x, y) values (floor(rand(now()) * 500), floor(rand(now() + 1) * 500));
insert into solar_system (x, y) select floor(rand(now() + sid) * 500) x, floor(rand(now() + sid + 1) * 500) y from solar_system;

-- remove solar_systems that overlap
delete solar_system from solar_system
join cells_with_multiple_systems mult
on (solar_system.x = mult.x and solar_system.y = mult.y);

-- create ships
insert into entity (sid, eid, kind, x, y)
select sid, null, 1, floor(rand(now() + sid) * 100), floor(rand(now() + sid + 1) * 100)
from solar_system;

insert into entity (sid, eid, kind, x, y)
select sid, null, 1, floor(rand(now() + eid) * 100), floor(rand(now() + eid + 1) * 100)
from entity where kind = 1;

-- create energy nodes
insert into entity (sid, eid, kind, x, y)
select sid, null, 2, floor(rand(now() + sid) * 100), floor(rand(now() + sid + 1) * 100)
from solar_system;

insert into entity (sid, eid, kind, x, y)
select sid, null, 2, floor(rand(now() + eid) * 100) as x, floor(rand(now() + eid + 1) * 100) as y
from entity where kind = 2;

-- remove cells containing multiple entities
delete entity from entity
join cells_with_multiple_entities mult
on (entity.x = mult.x and entity.y = mult.y);

-- backup
create table solar_system_backup as select * from solar_system;
create table entity_backup as select * from entity;

-- restore
insert into solar_system select * from solar_system_backup;
insert into entity select * from entity_backup;

update entity
  set blasters = 10, harvesters = 50, thrusters = 10
where kind = 1;
*/
