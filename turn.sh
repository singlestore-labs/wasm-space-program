#!/usr/bin/env bash

NUM_SHARDS=32
DATABASE=v2

update_shard() {
    local num_shards="${1}"
    local shard="${2}"
    mysql -u root -h 172.17.0.4 --local-infile -ptest ${DATABASE} <<EOF
        insert into commands
        select * from entity_next
        where cid % ${num_shards} = ${shard};
EOF
}

echo "creating command table"

mysql -u root -h 172.17.0.4 --local-infile -ptest ${DATABASE} <<EOF
    drop table if exists commands;
    create rowstore global temporary table commands (
        cid bigint not null,
        eid bigint not null,
        cmd tinyint not null,

        primary key (cid, eid),
        shard key (cid)
    );
EOF

echo "generating entity commands in ${NUM_SHARDS} txns"

for shard in $(seq ${NUM_SHARDS}); do
    update_shard ${NUM_SHARDS} $(($shard-1)) &
done

wait