create database if not exists wat;
use wat;

create rowstore table if not exists entity (
  cid BIGINT NOT NULL,
  eid BIGINT NOT NULL AUTO_INCREMENT,

  x float NOT NULL,
  y float NOT NULL,
  dx float NOT NULL,
  dy float NOT NULL,

  primary key (cid, eid),
  shard key (cid)
);

create or replace function step returns table
  as wasm from infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from infile "agent/agent.wit";

create database if not exists game;
use game;

-- Each entity is assigned to a cell (cid)
-- Each cell has a fixed size of 100 x 100 units
-- Entity position is relative to it's cell

create rowstore table if not exists entity (
  cid BIGINT NOT NULL,
  eid BIGINT NOT NULL AUTO_INCREMENT,

  vec BLOB NOT NULL,

  primary key (cid, eid),
  shard key (cid)
);

create rowstore table foo (id blob);
insert into foo values ('x');
create or replace function step returns table
  as wasm from infile "agent/target/wasm32-wasi/debug/agent.wasm"
  with wit from infile "agent/agent.wit";
select step(id) from foo;

-- seed data
replace into entity values
    (0, 1, json_array_pack('[0, 0, 5, 3]')),
    (0, 2, json_array_pack('[50, 50, -2, 1]')),
    (0, 3, json_array_pack('[0, 25, 0, 10]')),
    (0, 4, json_array_pack('[0, 0, 0, 1]')),
    (0, 5, json_array_pack('[5, 15, 0, -1]'));

replace into entity values
    (0, 1, 0, 0, 5, 3),
    (0, 2, 50, 50, -2, 1),
    (0, 3, 0, 25, 0, 10),
    (0, 4, 0, 0, 0, 1),
    (0, 5, 5, 15, 0, -1);

insert into entity
select
  (rand() * 100000) :> bigint as cid,
  null as eid,
  (rand(eid+now()) * 100) as x,
  (rand(eid+now()) * 100) as y,
  if(rand(eid+1+now()) > 0.5, 1, -1) as dx,
  if(rand(eid+1+now()) > 0.5, 1, -1) as dy
from entity;

select
  entity.cid, entity.eid,
  entity_next.*
from entity
left join (
  select json_agg(json_build_object("x", x, "y", y)) as neighbors
  from entity neighbor
  where 
    entity.cid = neighbor.cid
    AND entity.eid != neighbor.eid
  group by entity.cid, entity.eid
) neighbor on (
    entity.cid = neighbor.cid
    AND entity.eid != neighbor.eid
)
join step(
  row(entity.x, entity.y, entity.dx, entity.dy),
  json_agg(neighbor.*)
) as entity_next
group by entity.cid, entity.eid;

with enriched as (
  select
    entity.cid, entity.eid,
    any_value(entity.x) x,
    any_value(entity.y) y,
    any_value(entity.dx) dx,
    any_value(entity.dy) dy,
    if(any_value(neighbor.x) is null, "[]",
      json_agg(json_build_object(
        "x", neighbor.x,
        "y", neighbor.y
    ))) as neighbors
  from entity
  left join entity as neighbor on (
    entity.cid = neighbor.cid
    AND entity.eid != neighbor.eid
  )
  group by entity.cid, entity.eid
)
insert into entity
select
  cid, eid, entity_next.*
from enriched, step(
  row(x,y,dx,dy),
  neighbors
) as entity_next
on duplicate key update
  x = values(x),
  y = values(y),
  dx = values(dx),
  dy = values(dy);

update entity join (
  select
    cid, eid, entity_next.*
  from (
    select
      entity.cid, entity.eid,
      any_value(entity.x) x,
      any_value(entity.y) y,
      any_value(entity.dx) dx,
      any_value(entity.dy) dy,
      if(any_value(neighbor.x) is null, "[]",
        json_agg(json_build_object(
          "x", neighbor.x,
          "y", neighbor.y
      ))) as neighbors
    from entity
    left join entity as neighbor on (
      entity.cid = neighbor.cid
      AND entity.eid != neighbor.eid
    )
    group by entity.cid, entity.eid
  ) enriched, step(
    row(x,y,dx,dy),
    neighbors
  ) as entity_next
) entity_next on (
  entity.cid = entity_next.cid
  and entity.eid = entity_next.eid
)
set
  x = entity_next.x,
  y = entity_next.y,
  dx = entity_next.dx,
  dy = entity_next.dy;


-- compute json agg of each cell
select
  cid,
  group_concat(concat(x,y,dx,dy))
from entity
group by cid;