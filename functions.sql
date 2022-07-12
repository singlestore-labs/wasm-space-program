create or replace function pack as wasm
  from local infile "agent/target/wasm32-wasi/release/agent.wasm"
  with wit from local infile "agent/interface.wit";

create or replace function decodeplan as wasm
  from local infile "agent/target/wasm32-wasi/release/agent.wasm"
  with wit from local infile "agent/interface.wit";

create or replace function applyplan returns table as wasm
  from local infile "agent/target/wasm32-wasi/release/agent.wasm"
  with wit from local infile "agent/interface.wit";

create or replace function strategy_default as wasm
  from local infile "agent/target/wasm32-wasi/release/agent.wasm"
  with wit from local infile "agent/interface.wit";
replace into entity_strategy values ("strategy_default");

-- add custom strategies here, make sure to also register them in the
-- entity_strategy table

create or replace function strategy_flee as wasm
  from local infile "agent/target/wasm32-wasi/release/agent.wasm"
  with wit from local infile "agent/interface.wit";
replace into entity_strategy values ("strategy_flee");

create or replace function strategy_battle as wasm
  from local infile "agent/target/wasm32-wasi/release/agent.wasm"
  with wit from local infile "agent/interface.wit";
replace into entity_strategy values ("strategy_battle");

delimiter //

create or replace function distance_2d (x1 int, y1 int, x2 int, y2 int)
returns float as
begin
  return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
end //

delimiter ;
