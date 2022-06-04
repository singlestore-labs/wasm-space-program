create database if not exists vec;
use vec;

create rowstore table if not exists entity (
  cid BIGINT NOT NULL,
  eid BIGINT NOT NULL AUTO_INCREMENT,

  vec BLOB NOT NULL,

  PRIMARY KEY (cid, eid),
  SHARD KEY (cid)
);

create or replace function step -- returns table
  as wasm from infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from infile "agent/agent.wit";

replace into entity values
    (0, 1, json_array_pack('[0, 0, 5, 3]')),
    (0, 2, json_array_pack('[50, 50, -2, 1]')),
    (0, 3, json_array_pack('[0, 25, 0, 10]')),
    (0, 4, json_array_pack('[0, 0, 0, 1]')),
    (0, 5, json_array_pack('[5, 15, 0, -1]'));

insert into entity select
    (rand() * 100000) :> bigint as cid,
    null as eid,
    json_array_pack(concat(
        '[',
        (rand(eid+now()) * 100), ',', (rand(eid+now()) * 100), ',',
        if(rand(eid+1+now()) > 0.5, 1, -1), ',', if(rand(eid+1+now()) > 0.5, 1, -1),
        ']'
    ))
    from entity;

create view debug as select cid, eid, json_array_unpack(vec) from entity;

create view cell as (
  select
    cid,
    group_concat(vec separator '') as vec
  from entity
  group by cid
);

create view entity_next as (
  select
    entity.cid, entity.eid,
    step(entity.eid, group_concat(cell.vec separator '')) as vec
  from entity
  inner join entity cell on (
    entity.cid = cell.cid
    and entity.eid != cell.eid
  )
  group by entity.cid, entity.eid
);

update entity
inner join entity_next on (
  entity.cid = entity_next.cid
  and entity.eid = entity_next.eid
)
set vec = entity_next.vec
where entity.cid % 2 = 0;