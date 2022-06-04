#!/usr/bin/env bash

NUM_SHARDS=8

update_shard() {
    local num_shards="${1}"
    local shard="${2}"
    mysql -u root -h 172.17.0.4 --local-infile -ptest vec <<EOF
        update entity
        inner join entity_next on (
        entity.cid = entity_next.cid
        and entity.eid = entity_next.eid
        )
        set vec = entity_next.vec
        where entity.cid % ${num_shards} = ${shard};
EOF
}

echo "updating entities in ${NUM_SHARDS} txns"

for shard in $(seq ${NUM_SHARDS}); do
    update_shard ${NUM_SHARDS} $(($shard-1)) &
done

wait