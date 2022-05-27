create database if not exists game;
use game;

-- Each entity is assigned to a cell (cid)
-- Each cell has a fixed size of 100 x 100 units
-- Entity position is relative to it's cell

create rowstore table if not exists entity (
  cid BIGINT NOT NULL,
  eid BIGINT NOT NULL AUTO_INCREMENT,

  position BLOB NOT NULL
    COMMENT "(x, y) position encoded as a I32 vector",
  velocity BLOB NOT NULL
    COMMENT "(x, y) velocity encoded as a I32 vector",

  see_count INT NOT NULL
    COMMENT "the number of entities this entity can currently see",

  primary key (cid, eid),
  shard key (cid)
);

-- The physics system reads position and velocity components and returns a new position component
-- It knows that cells have a fixed size of 100 x 100
-- TODO: the physics system should also know about any obstacles in order to implement collision detection
delimiter //
create or replace function physics_system(_position BLOB, _velocity BLOB) returns BLOB as
declare
  _position_new blob = vector_add_i32(_position, _velocity);
  _x_new int = vector_kth_element_i32(_position_new, 0);
  _y_new int = vector_kth_element_i32(_position_new, 1);
begin
  -- prevent entites from going out of bounds
  if _x_new < 0 || _x_new > 100 || _y_new < 0 || _y_new > 100 then
    return _position;
  end if;

  return _position_new;
end //
delimiter ;


-- The sight system returns the number of entities this entity can see
-- each entity can see in a radius of 10 units
delimiter //
create or replace function sight_system(_position blob, _entities JSON) returns INT as
declare
  _count int = 0;
  _arr array(json) = json_to_array(_entities);
  _pos blob;
  _dist int;
begin
  for i in 0 .. length(_arr) - 1 loop
    _pos = unhex(json_extract_string(_arr[i], "position"));
    _dist = euclidean_distance_i32(_position, _pos);

    if _dist < 10 then
      _count = _count + 1;
    end if;
  end loop;

  return _count;
end //
delimiter ;

drop view if exists entity_next;
create view entity_next as
  select
    entity.cid, entity.eid,
    physics_system(entity.position, entity.velocity) as position,
    entity.velocity,
    sight_system(
      entity.position,
      json_agg(json_build_object(
          "position", hex(neighbor.position)
      ))
    ) as see_count
  from entity
  left join entity neighbor on (
    entity.cid = neighbor.cid
    AND entity.eid != neighbor.eid
  )
  group by entity.cid, entity.eid;

delimiter //
create or replace procedure run_systems(_loop_count int) as
begin
  FOR i in 0 .. (_loop_count - 1) LOOP
    insert into entity
    select * from entity_next
    on duplicate key update
      position = values(position),
      velocity = values(velocity),
      see_count = values(see_count);
  END LOOP;
end //
delimiter ;

-- seed data
replace into entity values
    (0, 1, json_array_pack_i32('[0, 0]'), json_array_pack_i32('[5, 3]'), 0),
    (0, 2, json_array_pack_i32('[50, 50]'), json_array_pack_i32('[-2, 1]'), 0),
    (0, 3, json_array_pack_i32('[0, 25]'), json_array_pack_i32('[0, 10]'), 0),
    (0, 4, json_array_pack_i32('[0, 0]'), json_array_pack_i32('[1, 0]'), 0),
    (0, 5, json_array_pack_i32('[15, 0]'), json_array_pack_i32('[-1, 0]'), 0);

drop view if exists debug_entities;
create view debug_entities as
select
  cid,
  eid,
  json_array_unpack_i32(position) as position,
  json_array_unpack_i32(velocity) as velocity,
  see_count
from entity;