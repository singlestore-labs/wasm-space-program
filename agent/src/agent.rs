use crate::cell::Cell;
use crate::command::{Command, Component};
use crate::interface::Entity;
use crate::plan::AgentMemory;
use crate::point::Point;
use crate::strategy::{agent, agent_strategy};

mod strategy {
    use super::*;

    agent_strategy! {
        increment_memory(mem, _last, _e, _cell) => {
            mem[0] = mem[0].saturating_add(10);
            None
        }
    }

    agent_strategy! {
        upgrade_harvestors(_mem, _last, e, _cell) =>
            (e.harvesters < 2 && e.energy > 50).then(|| Command::Upgrade(Component::Harvesters))
    }

    agent_strategy! {
        upgrade_thrusters(_mem, _last, e, _cell) =>
            (e.thrusters < 2 && e.energy > 50).then(|| Command::Upgrade(Component::Thrusters))
    }

    agent_strategy! {
        upgrade_blasters(_mem, _last, e, _cell) =>
            (e.blasters < 2 && e.energy > 50).then(|| Command::Upgrade(Component::Blasters))
    }

    agent_strategy! {
        chase_energy(_mem, _last, e, cell) => {
            let position = e.position();

            let mut target_distance: f32 = f32::MAX;
            let mut target: Option<Point> = None;

            for n in cell {
                if n.is_energy_node() {
                    let dist = position.distance(&n.position());
                    if dist < target_distance {
                        target_distance = dist;
                        target = Some(n.position());
                    }
                }
            }

            target.and_then(|t| {
                let (dir, mut dist) = position.direction_and_distance(&t);
                (dist > 0).then(|| {
                    dist = dist.min(e.thrusters);
                    Command::Move(dir, dist)
                })
            })
        }
    }
}

agent!(
    name = all_strategies,
    strategy::increment_memory,
    strategy::upgrade_blasters,
    strategy::upgrade_harvestors,
    strategy::upgrade_thrusters,
    strategy::chase_energy,
);
