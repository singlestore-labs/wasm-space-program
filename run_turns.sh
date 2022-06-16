#!/usr/bin/env bash

DATABASE=game
export TIMEFORMAT="turn time: %R"

while true;
do
    time mysql -u root -h 172.17.0.4 -ptest ${DATABASE} -e "call run_turn();"
    sleep 1
done