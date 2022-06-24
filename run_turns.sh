#!/usr/bin/env bash

DATABASE=game
export TIMEFORMAT="turn time: %R"

HOST=172.17.0.4
PASSWORD=test

while true;
do
    time mysql -u root -h $HOST -p$PASSWORD ${DATABASE} -e "call run_turn();"
    sleep 1
done