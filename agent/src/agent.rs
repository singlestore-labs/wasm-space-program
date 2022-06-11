use crate::cell::Cell;
use crate::command::Command;
use crate::interface::Entity;
use crate::point::Point;

pub fn step(e: Entity, cell: Cell) -> Command {
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
