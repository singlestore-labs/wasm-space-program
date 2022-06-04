use vec;

DELIMITER //
create or replace FUNCTION avg_init() RETURNS RECORD(d BLOB) AS
  BEGIN
    RETURN ROW("");
  END //

create or replace FUNCTION avg_iter(state RECORD(d BLOB), v blob) RETURNS RECORD(d BLOB) AS
  BEGIN
    RETURN ROW(concat(state.d, '-', v));
  END //

create or replace FUNCTION avg_merge(state1 RECORD(d BLOB), state2 RECORD(d BLOB)) RETURNS RECORD(d BLOB) AS
  BEGIN
    RETURN row(concat(state1.d, state2.d));
  END //

create or replace FUNCTION avg_terminate(state RECORD(d BLOB)) RETURNS BLOB AS
  BEGIN
    RETURN state.d;
  END //
DELIMITER ;

create or replace AGGREGATE avg_udaf(blob) RETURNS blob
  WITH STATE RECORD(d BLOB)
  INITIALIZE WITH avg_init
  ITERATE WITH avg_iter
  MERGE WITH avg_merge
  TERMINATE WITH avg_terminate;