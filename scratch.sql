create database game;
use game;

-- entity state contains all of the mutable data for each entity
drop table entity_state;
create rowstore table entity_state (
    cid bigint not null,
    eid bigint not null auto_increment,
    position blob not null, -- (x, y) position encoded as a I32 vector
    velocity blob not null, -- (x, y) velocity encoded as a I32 vector

    primary key (eid)
);

-- entity props contains all the immutable data for each entity
create table entity_props (
    eid int not null,
    team enum('red', 'blue') not null,

    primary key (eid)
);

replace into entity_state values
    (1, json_array_pack_i32('[0, 0]'), json_array_pack_i32('[1, 1]')),
    (2, json_array_pack_i32('[0, 0]'), json_array_pack_i32('[-1, -1]')),
    (3, json_array_pack_i32('[0, 0]'), json_array_pack_i32('[0, 1]'));

delete from entity_state;
insert into entity_state values (null, json_array_pack_i32('[0, 0]'), json_array_pack_i32('[1, 1]'));
insert into entity_state select null,
    json_array_pack_i32(
        json_array_push_double(
            json_array_push_double('[]', (rand(eid+now()) * 1000) :> int),
            (rand(eid+1+now()) * 1000) :> int
        )
    ),
    json_array_pack_i32(
        json_array_push_double(
            json_array_push_double('[]', if(rand(eid+1+now()) > 0.5, 1, -1)),
            if(rand(eid+now()) > 0.5, 1, -1)
        )
    ) from entity_state;

select eid, json_array_unpack_i32(position) as pos, json_array_unpack_i32(velocity) as vel
from entity_state
order by eid;

delimiter //
create or replace function simulate(_position BLOB, _velocity BLOB, _neighbors JSON) returns JSON as
begin
     return json_build_object("position", hex(vector_add_i32(_position, _velocity)), "velocity", hex(_velocity));
end //
delimiter ;

drop view if exists entity_state_next;
create view entity_state_next as
select
    eid,
    unhex(_next::$position) as position,
    unhex(_next::$velocity) as velocity
from (
    select entity.eid, simulate(
        entity.position,
        entity.velocity,
        json_agg(json_build_object(
            "position", hex(neighbors.position),
            "velocity", hex(neighbors.velocity)
        ))
    ) as _next
    from entity_state entity
    left join entity_state neighbors on (
        entity.eid != neighbors.eid
        and euclidean_distance_i32(entity.position, neighbors.position) < 20
    )
    group by entity.eid
);

drop all from plancache;
select * from information_schema.plancache;

insert into entity_state (eid, position, velocity)
select eid, position, velocity from entity_state_next
on duplicate key update position = values(position), velocity = values(velocity);

select eid, json_array_unpack_i32(position) as pos, json_array_unpack_i32(velocity) as vel
from entity_state
order by eid;

select eid, json_array_unpack_i32(position), json_array_unpack_i32(velocity)
from entity_state_next
order by eid;


create table foo (
    eid bigint not null auto_increment,
    x int,
    y int,
    primary key (eid)
);

-- 0,0 is close to 5,5 and 10,10
-- 5,5 is close to 0,0 and 10,10 and 15,15
-- 10,10 is close to 0,0 and 5,5 and 15,15
-- 15,15 is close to 5,5 and 10,10
insert into foo values (null, 0, 0), (null, 5, 5), (null, 10, 10), (null, 15, 15);
insert into foo select null, rand(now() + eid) * 1000, rand(now() + eid + 1) * 1000 from foo;

select count(*) from (
select
    entity.*,
    count(neighbor.eid)
from foo entity
left join foo neighbor on (
    -- entity.eid != neighbor.eid
    (entity.x - (entity.x % 10)) = (neighbor.x - (neighbor.x % 30))
    and (entity.y - (entity.y % 10)) = (neighbor.y - (neighbor.y % 30))
    and dist(entity.x, entity.y, neighbor.x, neighbor.y) < 10
)
group by entity.eid
order by entity.eid
);

delimiter //
create or replace function dist(ax int, ay int, bx int, _by int) returns int as
begin
     return sqrt(pow(bx - ax, 2) + pow(_by - ay, 2));
end //
delimiter ;

select dist(0,0,5,5);



