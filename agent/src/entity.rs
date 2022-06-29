// BytesCast generates some identity operations so we need to ignore this
#![allow(clippy::identity_op)]

use crate::interface::{Entity, EntitySummary};
use crate::point::Point;
use bytes_cast::BytesCast;

pub mod kind {
    pub const SHIP: u8 = 1;
    pub const ENERGY_NODE: u8 = 2;
}

#[derive(BytesCast)]
#[repr(C)]
pub struct PackedEntitySummary {
    pub kind: u8,
    pub danger: u8,
    pub x: u8,
    pub y: u8,
}

impl Entity {
    pub fn position(&self) -> Point {
        Point {
            x: self.x as i32,
            y: self.y as i32,
        }
    }

    pub fn is_ship(&self) -> bool {
        self.kind == kind::SHIP
    }

    pub fn is_energy_node(&self) -> bool {
        self.kind == kind::ENERGY_NODE
    }
}

impl EntitySummary {
    pub fn position(&self) -> Point {
        Point {
            x: self.x as i32,
            y: self.y as i32,
        }
    }

    pub fn is_ship(&self) -> bool {
        self.kind == kind::SHIP
    }

    pub fn is_energy_node(&self) -> bool {
        self.kind == kind::ENERGY_NODE
    }
}

impl From<EntitySummary> for Vec<u8> {
    fn from(e: EntitySummary) -> Self {
        PackedEntitySummary {
            kind: e.kind,
            danger: e.danger,
            x: e.x as u8,
            y: e.y as u8,
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn entity_packed_size() {
        let ent = PackedEntitySummary {
            kind: kind::SHIP,
            danger: 0,
            x: 128,
            y: 128,
        };
        assert_eq!(ent.as_bytes().len(), 4);
    }
}
