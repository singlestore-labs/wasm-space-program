use crate::{command::Command, interface::Entity, plan::AgentMemory, system::System};

pub type Strategy =
    fn(mem: &mut AgentMemory, last: &Command, entity: &Entity, system: &System) -> Option<Command>;

macro_rules! chain_strategies {
    ( name = $name:ident, $($strategies:expr),* $(,)? ) => {
        #[allow(unused_variables)]
        pub fn $name(
            mem: &mut AgentMemory,
            last: &Command,
            entity: &Entity,
            system: &System,
        ) -> Option<Command> {
            $(
                if let Some(cmd) = $strategies(mem, last, entity, system) {
                    return Some(cmd)
                }
            )*

            None
        }
    };
}
pub(crate) use chain_strategies;

macro_rules! agent_strategy {
    ( $name:ident($mem:ident, $last:ident, $entity:ident, $system:ident) => $body:expr ) => {
        #[allow(dead_code)]
        pub fn $name(
            $mem: &mut AgentMemory,
            $last: &Command,
            $entity: &Entity,
            $system: &System,
        ) -> Option<Command> {
            $body
        }
    };
}
pub(crate) use agent_strategy;
