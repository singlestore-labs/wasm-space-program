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

delimiter //

create or replace function distance_2d (x1 int, y1 int, x2 int, y2 int)
returns float as
begin
  return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
end //

delimiter ;
