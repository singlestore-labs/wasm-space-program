macro_rules! agent {
    ( name = $name:ident, $($strategies:expr),* $(,)? ) => {
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

macro_rules! agent_strategy {
    ( $name:ident($mem:ident, $last:ident, $entity:ident, $system:ident) => $body:expr ) => {
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

pub(crate) use agent;
pub(crate) use agent_strategy;
