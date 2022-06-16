use crate::cell::Cell;
use crate::command::{Command, Component};
use crate::interface::Entity;
use crate::point::Point;

pub fn step(e: Entity, cell: Cell) -> Command {
    // consider gear upgrades
    // TODO: only upgrade gear if we can get to a energy node with remaining energy
    if e.harvesters < 2 && e.energy > 50 {
        return Command::Upgrade(Component::Harvesters);
    }
    if e.thrusters < 2 && e.energy > 100 {
        return Command::Upgrade(Component::Thrusters);
    }
    if e.blasters < 2 && e.energy > 100 {
        return Command::Upgrade(Component::Blasters);
    }
    if e.harvesters < 5 && e.energy > 100 {
        return Command::Upgrade(Component::Harvesters);
    }
    if e.thrusters < 5 && e.energy > 100 {
        return Command::Upgrade(Component::Thrusters);
    }
    if e.blasters < 5 && e.energy > 100 {
        return Command::Upgrade(Component::Blasters);
    }

    let position = e.position();

    let mut target_distance: f32 = f32::MAX;
    let mut target: Option<Point> = None;

    for n in cell {
        if n.kind == 2 {
            let dist = position.distance(&n.position());
            if dist < target_distance {
                target_distance = dist;
                target = Some(n.position());
            }
        }
    }

    target
        .map(|t| {
            let (dir, mut dist) = position.direction_and_distance(&t);
            if dist > 0 {
                dist = dist.min(e.thrusters);
                Command::Move(dir, dist)
            } else {
                Command::Hold
            }
        })
        .unwrap_or(Command::Hold)
}
