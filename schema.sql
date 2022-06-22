create database if not exists game;
use game;

create rowstore table if not exists entity (
  cid BIGINT NOT NULL,
  eid BIGINT NOT NULL AUTO_INCREMENT,

  kind TINYINT UNSIGNED NOT NULL
    COMMENT "1 = ship, 2 = energy node",

  x INT UNSIGNED NOT NULL,
  y INT UNSIGNED NOT NULL,

  energy      SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  shield      TINYINT  UNSIGNED NOT NULL DEFAULT 100,
  blasters    TINYINT  UNSIGNED NOT NULL DEFAULT 1,
  thrusters   TINYINT  UNSIGNED NOT NULL DEFAULT 1,
  harvesters  TINYINT  UNSIGNED NOT NULL DEFAULT 1,

  -- last_plan is 8 bytes
  -- the first byte is the last command
  -- the remaining bytes (7) is memory
  last_plan BIGINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (cid, eid),
  SHARD KEY (cid)
);

create or replace function pack as wasm
  from local infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from local infile "agent/interface.wit";

create or replace function step as wasm
  from local infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from local infile "agent/interface.wit";

create or replace function decodeplan as wasm
  from local infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from local infile "agent/interface.wit";

create or replace function applyplan returns table as wasm
  from local infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from local infile "agent/interface.wit";

drop view if exists entity_next;
create view entity_next as (
  select
    entity.cid, entity.eid,
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
        neighbor.kind,
        neighbor.blasters,
        neighbor.x,
        neighbor.y
      )) separator '')
    ) as plan
  from entity
  inner join entity neighbor on (
    entity.cid = neighbor.cid
    and entity.eid != neighbor.eid
  )
  where entity.kind = 1 -- ship
  group by entity.cid, entity.eid
);

drop view if exists debug_next;
create view debug_next as (
  select
    entity.cid, entity.eid, entity.x, entity.y, 
    decodeplan(plan)
  from entity natural join entity_next
);

drop view if exists entity_damage;
create view entity_damage as (
  select
    a.cid,
    a.eid,
    sum(b.blasters) as damage
  from entity a
  inner join entity b on (
    a.cid = b.cid
    and a.eid != b.eid
    and a.x = b.x
    and a.y = b.y
  )
  where a.kind = 1 and b.kind = 1
  group by a.cid, a.eid
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
    a.cid = b.cid
    and a.eid != b.eid
    and a.x = b.x
    and a.y = b.y
    and b.kind = 1
  )
  where b.eid is null and a.kind = 1
  group by a.cid, a.eid
);

drop view if exists entity_harvest;
create view entity_harvest as (
  select
    entity.cid,
    entity.eid,
    sum(least(entity.harvesters, energy_node.energy)) as harvested
  from entities_without_conflict entity
  join entity energy_node on (
    entity.cid = energy_node.cid
    and entity.x = energy_node.x
    and entity.y = energy_node.y
    and energy_node.kind = 2
  )
  group by entity.cid, entity.eid
);

delimiter //

create or replace procedure run_turn()
as declare
begin
  -- gather and apply entity commands
  update entity
  left join entity_next on (
    entity.cid = entity_next.cid
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
    entity.cid = entity_damage.cid
    and entity.eid = entity_damage.eid
  )
  set entity.shield = entity.shield - entity_damage.damage;

  -- convert dead entities into energy nodes
  update entity
  set
    kind = 2
  where shield <= 0;

  -- entities harvest energy
  update entity
  join entity_harvest on (
    entity.cid = entity_harvest.cid
    and entity.eid = entity_harvest.eid
  )
  set energy = entity.energy + entity_harvest.harvested;

  -- entities not in conflict recover shield
  update entity
  join entities_without_conflict nonconflict on (
    entity.cid = nonconflict.cid
    and entity.eid = nonconflict.eid
  )
  set shield = entity.shield + 1
  where entity.shield < 100;

  -- energy nodes loose energy when harvested
  update entity energy_node
  join entities_without_conflict harvesting_entity on (
    energy_node.cid = harvesting_entity.cid
    and energy_node.x = harvesting_entity.x
    and energy_node.y = harvesting_entity.y
  )
  set energy = energy_node.energy - least(energy_node.energy, harvesting_entity.harvesters)
  where energy_node.kind = 2;

  -- remove energyless entities
  delete from entity where energy <= 0;

end //

delimiter ;

-- WEB API

drop user if exists web;
create user web identified by 'wasm-space-program';
grant select on game.* to web;

/*
insert into entity
    (cid, eid,  kind,   x,  y, thrusters)
values
    (0,   null, 1,      0,  0, 2),
    (0,   null, 1,     10, 10, 3),
    (0,   null, 1,     20, 20, 4),
    (0,   null, 1,     30, 40, 5);

insert into entity set
    cid = 0, eid = null,
    kind = 1,
    x = 10,
    y = 20,
    energy = 100,
    shield = 100,
    blasters = 1,
    thrusters = 1,
    harvesters = 1;

create table cids (cid bigint AUTO_INCREMENT primary key);
insert into cids values (null);
insert into cids select null from cids;

-- create ships
insert into entity (cid, eid, kind, x, y)
select cid, null, 1, floor(rand(now() + cid) * 100), floor(rand(now() + cid + 1) * 100)
from cids;

insert into entity (cid, eid, kind, x, y)
select cid, null, 1, floor(rand(now() + eid) * 100), floor(rand(now() + eid + 1) * 100)
from entity;

-- create energy nodes
insert into entity (cid, eid, kind, x, y)
select cid, null, 2, floor(rand(now() + cid) * 100), floor(rand(now() + cid + 1) * 100)
from cids;

insert into entity (cid, eid, kind, x, y)
select cid, null, 2, floor(rand(now() + eid) * 100) as x, floor(rand(now() + eid + 1) * 100) as y
from entity;

-- remove cells containing multiple entities
delete entity from entity
join cells_with_multiple_entities mult
on (entity.x = mult.x and entity.y = mult.y);

-- backup and restore
create table entity_backup as select * from entity;
insert into entity select * from entity_backup;

update entity
  set blasters = 10, harvesters = 50, thrusters = 10
where kind = 1;
*/
