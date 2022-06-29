use crate::command::{Command, Component};
use crate::interface::Entity;
use crate::plan::{AgentMemory, Plan};
use crate::point::Point;
use crate::strategy::{agent_strategy, chain_strategies, Strategy};
use crate::system::System;

mod strategy {
    use crate::command::Direction;

    use super::*;

    agent_strategy! {
        upgrade_harvestors(_mem, _last, e, _system) =>
            (e.harvesters < 5 && e.energy > (50 * (e.harvesters as u16))).then(|| Command::Upgrade(Component::Harvesters))
    }

    agent_strategy! {
        upgrade_thrusters(_mem, _last, e, _system) =>
            (e.thrusters < 5 && e.energy > (50 * (e.thrusters as u16))).then(|| Command::Upgrade(Component::Thrusters))
    }

    agent_strategy! {
        upgrade_blasters(_mem, _last, e, _system) =>
            (e.blasters < 5 && e.energy > (50 * (e.blasters as u16))).then(|| Command::Upgrade(Component::Blasters))
    }

    agent_strategy! {
        chase_energy(_mem, _last, e, system) => {
            let position = e.position();

            let mut target_distance: f32 = f32::MAX;
            let mut target: Option<Point> = None;

            for n in system {
                if n.is_energy_node() {
                    let dist = position.distance(&n.position());
                    if dist < target_distance {
                        target_distance = dist;
                        target = Some(n.position());
                    }
                }
            }

            // if we find a target, move towards it or stay on it
            target.map(|t| {
                let (dir, mut dist) = position.direction_and_distance(&t);
                if dist > 0 {
                    dist = dist.min(e.thrusters);
                    Command::Move(dir, dist)
                } else {
                    Command::Hold
                }
            })
        }
    }

    agent_strategy! {
        random_move(mem, last, e, _system) => {
            let dir = {
                // use a counter to randomly change direction every so often
                mem[0] = mem[0].wrapping_add(1) % 10;
                if mem[0] == 0 {
                    // every 10th turn, pick a random direction
                    Direction::random()
                } else if let Command::Move(dir, _) = last {
                    // otherwise move the same direction we are moving
                    *dir
                } else {
                    // else pick a random direction
                    Direction::random()
                }
            };

            Some(Command::Move(dir, e.thrusters))
        }
    }

    agent_strategy! {
        flee_move(_mem, _last, e, system) => {
            let position = e.position();

            let mut target_distance: f32 = f32::MAX;
            let mut target: Option<Point> = None;

            // is there an enemy nearby?
            for n in system {
                // find the closest enemy
                if n.is_ship() {
                    let dist = position.distance(&n.position());
                    if dist < target_distance {
                        target_distance = dist;
                        target = Some(n.position());
                    }
                }
            }

            // if there is an enemy, run the other way
            target.map(|t| {
                let (dir, mut dist) = position.direction_and_distance(&t);
                dist = dist.min(e.thrusters);

                // move in the opposite direction
                // we never hold (stand and fight), we run!
                Command::Move(dir.opposite(), dist)
            })

            // if this were a little smarter...
            // it would keep track of ships that are actively advancing/chasing
        }
    }

    agent_strategy! {
        battle_move(_mem, _last, e, system) => {
            let position = e.position();

            let mut target_distance: f32 = f32::MAX;
            let mut target: Option<Point> = None;

            // is there an enemy nearby?
            for n in system {
                // find the closest enemy
                if n.is_ship() {
                    let dist = position.distance(&n.position());
                    if dist < target_distance {
                        target_distance = dist;
                        target = Some(n.position());
                    }
                }
            }

            // if we find a target, move towards it or stay on it
            target.map(|t| {
                let (dir, mut dist) = position.direction_and_distance(&t);
                if dist > 0 {
                    dist = dist.min(e.thrusters);
                    Command::Move(dir, dist)
                } else {
                    Command::Hold // battle
                }
            })
        }
    }
}

chain_strategies!(
    name = strategy_default,
    strategy::upgrade_harvestors,
    strategy::upgrade_thrusters,
    strategy::upgrade_blasters,
    strategy::chase_energy,
    strategy::random_move,
);

chain_strategies!(name = strategy_random, strategy::random_move,);

chain_strategies!(name = strategy_flee,
    strategy::flee_move,
    strategy::upgrade_thrusters,
    strategy::chase_energy,
    strategy::upgrade_harvestors,
    strategy::random_move,
);

chain_strategies!(name = strategy_battle,
    strategy::battle_move,
    strategy::upgrade_blasters,
    strategy::upgrade_thrusters,
    strategy::chase_energy,
    strategy::upgrade_harvestors,
    strategy::random_move,
);

pub fn execute_strategy(
    strategy: Strategy,
    e: Entity,
    last_plan_enc: u64,
    encoded_system: Vec<u8>,
) -> u64 {
    let last_plan: Plan = last_plan_enc.try_into().unwrap();
    let system = System::try_from(encoded_system).unwrap();
    let mut mem = last_plan.memory;

    let next_cmd = strategy(&mut mem, &last_plan.cmd, &e, &system).unwrap_or(Command::Hold);

    Plan::new(next_cmd, mem)
        .try_into()
        .expect("failed to encode plan")
}
