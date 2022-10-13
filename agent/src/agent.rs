use crate::command::{Command, Component};
use crate::interface::Entity;
use crate::plan::{AgentMemory, Plan};
use crate::point::Point;
use crate::strategy::{agent_strategy, chain_strategies, Strategy};
use crate::system::System;

// we have 7 bytes of memory to use for flags, keep track of the flag indexes here:
const FLAG_FLEE_COUNTER: usize = 0;
const FLAG_FLEE_DIRECTION: usize = 1;
const FLAG_BATTLE_ENABLED: usize = 2;
const FLAG_RANDOM_COUNTER: usize = 3;

#[allow(dead_code)]
const FLAG_DANCE_INDEX: usize = 4;
#[allow(dead_code)]
const FLAG_DANCE_DIST: usize = 5;

mod strategy {
    use crate::command::Direction;

    use super::*;

    agent_strategy! {
        upgrade_harvestors(_mem, _last, e, _system) =>
            (e.harvesters < 10 && e.energy > (50 * (e.harvesters as u16))).then_some(Command::Upgrade(Component::Harvesters))
    }

    agent_strategy! {
        upgrade_thrusters(_mem, _last, e, _system) =>
            (e.thrusters < 8 && e.energy > (50 * (e.thrusters as u16))).then_some(Command::Upgrade(Component::Thrusters))
    }

    agent_strategy! {
        upgrade_blasters(_mem, _last, e, _system) =>
            (e.blasters < 8 && e.energy > (50 * (e.blasters as u16))).then_some(Command::Upgrade(Component::Blasters))
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
                mem[FLAG_RANDOM_COUNTER] = mem[FLAG_RANDOM_COUNTER].wrapping_add(1) % 10;
                if mem[FLAG_RANDOM_COUNTER] == 0 {
                    // every 10th turn, pick the next direction
                    if let Command::Move(dir, _) = last {
                        dir.rotate()
                    } else {
                        Direction::random()
                    }
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
        flee_move(mem, _last, e, system) => {
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

                        // only consider targets that are close enough to be dangerous
                        target = if target_distance <= 4.0 {
                            Some(n.position())
                        } else {
                            None
                        }
                    }
                }
            }

            // if there is an enemy, run the other way
            target.map(|t| {
                let (mut dir, _) = position.direction_and_distance(&t);

                // in general we want to run the other way
                dir = dir.opposite();

                if position == t {
                    // they are on top of us! break in a random direction
                    dir = Direction::random();
                }

                // set flee counter to keep running for a little while
                mem[FLAG_FLEE_COUNTER] = 2;
                // set flee direction to be perpendicular to our chase vector
                mem[FLAG_FLEE_DIRECTION] = dir.rotate() as u8;

                Command::Move(dir, e.thrusters)
            }).or_else(|| {
                // check flee counter and keep running even if we don't see anything
                if mem[FLAG_FLEE_COUNTER] > 0 {
                    mem[FLAG_FLEE_COUNTER] = mem[FLAG_FLEE_COUNTER].saturating_sub(1);
                    let dir: Direction = mem[FLAG_FLEE_DIRECTION].try_into().unwrap_or_else(|_| Direction::random());
                    Some(Command::Move(dir, e.thrusters))
                } else {
                    None
                }
            })
        }
    }

    agent_strategy! {
        battle_move(mem, _last, e, system) => {
            // if we ever have > 100 energy, upgrade blasters!
            if e.energy > 100 && e.blasters < 15 {
                return Some(Command::Upgrade(Component::Blasters))
            }

            if e.energy > 100 && e.shield > 60 {
                // ready for battle!
                mem[FLAG_BATTLE_ENABLED] = 1;
            } else if e.energy < 50 || e.shield < 20 {
                // we are too weak for battle... :(
                mem[FLAG_BATTLE_ENABLED] = 0;
            }

            if mem[FLAG_BATTLE_ENABLED] == 0 {
                return None
            }

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

    agent_strategy! {
        dance(mem, last, _e, _system) => {
            let dir = {
                if let Command::Move(last_dir, _) = last {
                    mem[FLAG_DANCE_INDEX] = mem[FLAG_DANCE_INDEX].saturating_sub(1);
                    if mem[FLAG_DANCE_INDEX] == 0 {
                        mem[FLAG_DANCE_DIST] = mem[FLAG_DANCE_DIST].wrapping_add(1) % 6;
                        mem[FLAG_DANCE_INDEX] = mem[FLAG_DANCE_DIST];
                        last_dir.rotate()
                    } else {
                        *last_dir
                    }
                } else {
                    Direction::random()
                }
            };

            Some(Command::Move(dir, 1))
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

chain_strategies!(
    name = strategy_flee,
    strategy::flee_move,
    strategy::upgrade_thrusters,
    strategy::upgrade_harvestors,
    strategy::chase_energy,
    strategy::random_move,
);

chain_strategies!(
    name = strategy_battle,
    strategy::battle_move,
    strategy::upgrade_harvestors,
    strategy::upgrade_thrusters,
    strategy::chase_energy,
    strategy::random_move,
);

chain_strategies!(name = strategy_blank,);

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
