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

create or replace function pack as wasm
  from local infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from local infile "agent/interface.wit";

create or replace function step as wasm
  from local infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from local infile "agent/interface.wit";

create or replace function decodecmd as wasm
  from local infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from local infile "agent/interface.wit";

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
        neighbor.blasters,
        neighbor.x,
        neighbor.y
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

create view debug_next as (
  select
    entity.cid, entity.eid, entity.x, entity.y, 
    decodecmd(cmd)
  from entity natural join entity_next
);

/*
create table cids (cid bigint AUTO_INCREMENT primary key);
insert into cids values (null);
insert into cids select null from cids;

-- create ships
insert into entity (cid, eid, kind, x, y)
select cid, null, 1, rand(now() + cid) * 1000, rand(now() + cid + 1) * 1000
from cids;

-- create energy nodes
insert into entity (cid, eid, kind, x, y)
select cid, null, 2, rand(now() + cid) * 1000, rand(now() + cid + 1) * 1000
from cids;
*/

-- WEB API

create user web identified by 'wasm-space-program';
grant select on game.* to web;