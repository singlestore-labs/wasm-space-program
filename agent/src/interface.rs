wit_bindgen_rust::export!("interface.wit");

use crate::agent;
use crate::cell::Cell;
use crate::command::{Command, Component, Direction};
pub use interface::{Entity, EntitySummary};
use std::cmp;

pub struct Interface;
impl interface::Interface for Interface {
    fn pack(e: EntitySummary) -> Vec<u8> {
        e.into()
    }

    fn step(e: Entity, encoded_cell: Vec<u8>) -> u8 {
        let cell = Cell::try_from(encoded_cell).unwrap();
        let command = agent::step(e, cell);
        command.into()
    }

    fn decodecmd(m: u8) -> String {
        match Command::try_from(m) {
            Ok(cmd) => format!("{:?}", cmd),
            Err(e) => format!("error: {}", e),
        }
    }

    fn applycmd(e: Entity, cmd: u8) -> Vec<Entity> {
        vec![match Command::try_from(cmd).unwrap() {
            Command::Hold => Entity {
                energy: e.energy.saturating_sub(1),
                ..e
            },
            Command::Move(dir, dist) => match dir {
                Direction::North => Entity {
                    energy: e.energy.saturating_sub(2),
                    y: e.y.saturating_sub(dist as u32),
                    ..e
                },
                Direction::East => Entity {
                    energy: e.energy.saturating_sub(2),
                    x: cmp::min(e.x.saturating_add(dist as u32), 99),
                    ..e
                },
                Direction::South => Entity {
                    energy: e.energy.saturating_sub(2),
                    y: cmp::min(e.y.saturating_add(dist as u32), 99),
                    ..e
                },
                Direction::West => Entity {
                    energy: e.energy.saturating_sub(2),
                    x: e.x.saturating_sub(dist as u32),
                    ..e
                },
            },
            Command::Upgrade(comp) => match comp {
                Component::Blasters => Entity {
                    energy: e.energy.saturating_sub(50),
                    blasters: e.blasters.saturating_add(1),
                    ..e
                },
                Component::Thrusters => Entity {
                    energy: e.energy.saturating_sub(50),
                    thrusters: e.thrusters.saturating_add(1),
                    ..e
                },
                Component::Harvesters => Entity {
                    energy: e.energy.saturating_sub(50),
                    harvesters: e.harvesters.saturating_add(1),
                    ..e
                },
            },
        }]
    }
}
