use crate::cell::Cell;
use crate::command::Command;
use crate::interface::{Entity, EntitySummary};
use crate::point::Point;
use bytes_cast::{unaligned, BytesCast};
use std::mem;

impl Entity {
    pub fn position(&self) -> Point {
        Point {
            x: self.x as i32,
            y: self.y as i32,
        }
    }

    pub fn last_cmd(&self) -> Result<Command, &'static str> {
        Command::try_from(self.memory)
    }

    pub fn memory_bytes(&self) -> Vec<u8> {
        // mask out the highest byte as it contains the last command
        self.memory.to_ne_bytes()[1..].into()
    }
}

impl EntitySummary {
    pub fn position(&self) -> Point {
        Point {
            x: self.x as i32,
            y: self.y as i32,
        }
    }
}

impl From<EntitySummary> for Vec<u8> {
    fn from(e: EntitySummary) -> Self {
        PackedEntitySummary {
            kind: e.kind,
            danger: e.danger,
            x: e.x.into(),
            y: e.y.into(),
        }
        .as_bytes()
        .into()
    }
}

impl From<&PackedEntitySummary> for EntitySummary {
    fn from(e: &PackedEntitySummary) -> Self {
        EntitySummary {
            kind: e.kind,
            danger: e.danger,
            x: e.x.into(),
            y: e.y.into(),
        }
    }
}

impl TryFrom<Vec<u8>> for Cell {
    type Error = String;

    fn try_from(value: Vec<u8>) -> Result<Self, Self::Error> {
        let packed_size = mem::size_of::<PackedEntitySummary>();
        let extra_bytes = value.len() % packed_size;
        if extra_bytes != 0 {
            return Err(format!("cell is not a multiple of {} bytes", packed_size));
        }

        let count = value.len() / packed_size;
        let entities = match PackedEntitySummary::slice_from_bytes(&value, count) {
            Ok((entities, _)) => entities,
            Err(e) => return Err(format!("{}", e)),
        };
        Ok(Cell {
            entities: entities.iter().map(EntitySummary::from).collect(),
        })
    }
}

#[derive(BytesCast)]
#[repr(C)]
struct PackedEntitySummary {
    kind: u8,
    danger: u8,
    x: unaligned::U32Ne,
    y: unaligned::U32Ne,
}
