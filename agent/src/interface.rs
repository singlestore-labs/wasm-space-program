wit_bindgen_rust::export!("interface.wit");

use crate::agent;
use crate::cell::Cell;
use crate::command::Command;
pub use interface::{Entity, EntitySummary};

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
}
