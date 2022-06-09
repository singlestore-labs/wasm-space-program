drop all from plancache;
create database if not exists game;
use game;

create rowstore table if not exists entity (
  cid BIGINT NOT NULL,
  eid BIGINT NOT NULL AUTO_INCREMENT,

  kind tinyint not null
    comment "1 = ship, 2 = energy node",

  x int not null,
  y int not null,

  energy      smallint  not null default 100,
  shield      tinyint   not null default 100,
  blasters    tinyint   not null default 1,
  thrusters   tinyint   not null default 1,
  harvesters  tinyint   not null default 1,

  PRIMARY KEY (cid, eid),
  SHARD KEY (cid)
);

SET GLOBAL wasm_max_linear_memory_size = default;

create or replace function pack as wasm
  from infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from infile "agent/agent.wit";

create or replace function step as wasm
  from infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from infile "agent/agent.wit";

create or replace function decodecmd as wasm
  from infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from infile "agent/agent.wit";

insert into entity
    (cid, eid,  kind,   x,  y)
values
    (0,   null, 1,      0,  0),
    (0,   null, 1,     10, 10),
    (0,   null, 1,     20, 20),
    (0,   null, 1,     30, 40);

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
      group_concat(pack(row(
        neighbor.kind,
        neighbor.x,
        neighbor.y,
        neighbor.energy,
        neighbor.shield,
        neighbor.blasters,
        neighbor.thrusters,
        neighbor.harvesters
      )) separator '')
    ) as cmd
  from entity
  inner join entity neighbor on (
    entity.cid = neighbor.cid
    and entity.eid != neighbor.eid
  )
  where entity.kind = 1 -- ship
  group by entity.cid, entity.eid
);

/*
create table cids (cid bigint AUTO_INCREMENT primary key);
insert into cids values (null);
insert into cids select null from cids;

-- create ships
insert into entity (cid, eid, kind, x, y)
select cid, null, 1, rand(now() + cid) * 1000, rand(now() + cid) * 1000
from cids;

-- create energy nodes
insert into entity (cid, eid, kind, x, y)
select cid, null, 2, rand(now() + cid) * 1000, rand(now() + cid) * 1000
from cids;
*/