use crate::command::{Command, Component};
use crate::interface::Entity;
use crate::plan::AgentMemory;
use crate::point::Point;
use crate::strategy::{agent, agent_strategy};
use crate::system::System;

mod strategy {
    use crate::command::Direction;

    use super::*;

    agent_strategy! {
        upgrade_harvestors(_mem, _last, e, _system) =>
            (e.harvesters < 5 && e.energy > 50).then(|| Command::Upgrade(Component::Harvesters))
    }

    agent_strategy! {
        upgrade_thrusters(_mem, _last, e, _system) =>
            (e.thrusters < 5 && e.energy > 50).then(|| Command::Upgrade(Component::Thrusters))
    }

    agent_strategy! {
        upgrade_blasters(_mem, _last, e, _system) =>
            (e.blasters < 5 && e.energy > 50).then(|| Command::Upgrade(Component::Blasters))
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
}

agent!(
    name = all_strategies,
    strategy::upgrade_harvestors,
    strategy::upgrade_thrusters,
    strategy::upgrade_blasters,
    strategy::chase_energy,
    strategy::random_move,
);
