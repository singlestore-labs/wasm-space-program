use crate::interface::{Entity, EntitySummary};
use crate::point::Point;
use bytes_cast::{unaligned, BytesCast};

pub mod kind {
    pub const SHIP: u8 = 1;
    pub const ENERGY_NODE: u8 = 1;
}

#[derive(BytesCast)]
#[repr(C)]
pub struct PackedEntitySummary {
    pub kind: u8,
    pub danger: u8,
    pub x: unaligned::U32Ne,
    pub y: unaligned::U32Ne,
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
