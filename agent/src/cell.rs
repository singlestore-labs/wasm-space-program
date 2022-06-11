use crate::interface::EntitySummary;

pub struct Cell {
    pub entities: Vec<EntitySummary>,
}

impl IntoIterator for Cell {
    type Item = EntitySummary;
    type IntoIter = std::vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.entities.into_iter()
    }
}
