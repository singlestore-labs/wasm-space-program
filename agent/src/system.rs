use crate::entity::PackedEntitySummary;
use crate::interface::EntitySummary;
use bytes_cast::BytesCast;
use std::iter::IntoIterator;
use std::mem;
use std::slice::Iter;

#[derive(Clone)]
pub struct System {
    entities: Vec<EntitySummary>,
}

impl<'a> IntoIterator for &'a System {
    type Item = &'a EntitySummary;
    type IntoIter = Iter<'a, EntitySummary>;

    fn into_iter(self) -> Self::IntoIter {
        self.entities.iter()
    }
}

impl TryFrom<Vec<u8>> for System {
    type Error = String;

    fn try_from(value: Vec<u8>) -> Result<Self, Self::Error> {
        let packed_size = mem::size_of::<PackedEntitySummary>();
        let extra_bytes = value.len() % packed_size;
        if extra_bytes != 0 {
            return Err(format!(
                "packed system is not a multiple of {} bytes",
                packed_size
            ));
        }

        let count = value.len() / packed_size;
        let entities = match PackedEntitySummary::slice_from_bytes(&value, count) {
            Ok((entities, _)) => entities,
            Err(e) => return Err(format!("{}", e)),
        };
        Ok(System {
            entities: entities.iter().map(EntitySummary::from).collect(),
        })
    }
}
