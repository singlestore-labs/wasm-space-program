use std::io::Read;

use crate::cell::Cell;
use crate::command::{Command, CommandWithMemory, Component};
use crate::interface::Entity;
use crate::point::Point;
use bytes_cast::{unaligned, BytesCast};

#[derive(BytesCast)]
#[repr(C)]
struct Memory {
    last_shield: u8,
    fear: u8,
}

pub fn step(e: Entity, cell: Cell) -> (Command, Memory) {
    let memory_bytes = e.memory_bytes();
    let (memory, _) = Memory::from_bytes(&memory_bytes).expect("failed to parse memory");
    let mut newMemory = *memory.clone();
    if memory.last_shield > e.shield {
        // we're being attacked!
        newMemory.fear = 1;
    }

    // consider gear upgrades
    // TODO: only upgrade gear if we can get to a energy node with remaining energy
    if e.harvesters < 2 && e.energy > 50 {
        return (Command::Upgrade(Component::Harvesters), newMemory);
    }
    if e.thrusters < 2 && e.energy > 100 {
        return (Command::Upgrade(Component::Thrusters), newMemory);
    }
    if e.blasters < 2 && e.energy > 100 {
        return (Command::Upgrade(Component::Blasters), newMemory);
    }
    if e.harvesters < 5 && e.energy > 100 {
        return (Command::Upgrade(Component::Harvesters), newMemory);
    }
    if e.thrusters < 5 && e.energy > 100 {
        return (Command::Upgrade(Component::Thrusters), newMemory);
    }
    if e.blasters < 5 && e.energy > 100 {
        return (Command::Upgrade(Component::Blasters), newMemory);
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
                (Command::Move(dir, dist), newMemory)
            } else {
                (Command::Hold, newMemory)
            }
        })
        .unwrap_or((Command::Hold, newMemory))
}
