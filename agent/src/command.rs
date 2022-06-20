const MASK_U2: u8 = 0b11;
const MASK_U4: u8 = 0b1111;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CommandWithMemory {
    cmd: Command,
    memory: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Command {
    Hold,
    Move(Direction, u8),
    Upgrade(Component),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Direction {
    North = 0,
    East = 1,
    South = 2,
    West = 3,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Component {
    Blasters = 0,
    Thrusters = 1,
    Harvesters = 2,
}

impl Command {
    pub fn with_memory(&self, memory: u64) -> CommandWithMemory {
        CommandWithMemory {
            cmd: self.clone(),
            memory,
        }
    }
}

impl TryFrom<u8> for Direction {
    type Error = &'static str;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        Ok(match value {
            0 => Direction::North,
            1 => Direction::East,
            2 => Direction::South,
            3 => Direction::West,
            _ => return Err("Invalid direction"),
        })
    }
}

impl TryFrom<u8> for Component {
    type Error = &'static str;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        Ok(match value {
            0 => Component::Blasters,
            1 => Component::Thrusters,
            2 => Component::Harvesters,
            _ => return Err("Invalid component"),
        })
    }
}

impl TryFrom<u8> for Command {
    type Error = &'static str;

    fn try_from(v: u8) -> Result<Self, Self::Error> {
        let cmd = v >> 6;
        match cmd {
            0b00 => Ok(Command::Hold),
            0b01 => Ok(Command::Move(
                Direction::try_from((v >> 4) & MASK_U2)?,
                v & MASK_U4,
            )),
            0b10 => Ok(Command::Upgrade(Component::try_from(v & MASK_U2)?)),
            _ => Err("Invalid command"),
        }
    }
}

impl TryFrom<u64> for Command {
    type Error = &'static str;

    fn try_from(v: u64) -> Result<Self, Self::Error> {
        // command is stored in highest byte
        let cmd: u8 = (v >> (8 * 7)) as u8;
        Command::try_from(cmd)
    }
}

impl From<Command> for u8 {
    fn from(cmd: Command) -> Self {
        match cmd {
            Command::Hold => 0b00,
            Command::Move(dir, dist) => {
                let enc_cmd = 0b01 << 6;
                let enc_dir = (dir as u8) << 4;
                let enc_dis = dist & MASK_U4;
                enc_cmd | enc_dir | enc_dis
            }
            Command::Upgrade(comp) => {
                let enc_cmd = 0b10 << 6;
                let enc_com = (comp as u8) & MASK_U2;
                enc_cmd | enc_com
            }
        }
    }
}

impl From<Command> for u64 {
    fn from(cmd: Command) -> Self {
        let enc: u8 = cmd.into();
        // command is stored in the highest byte
        (enc as u64) << (8 * 7)
    }
}

impl From<CommandWithMemory> for u64 {
    fn from(cm: CommandWithMemory) -> Self {
        let enc: u8 = cm.cmd.into();
        // command is stored in the highest byte
        (enc as u64) << (8 * 7) & cm.memory
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn round_trip(cmd: Command) {
        let encoded: u8 = cmd.into();
        let decoded = Command::try_from(encoded).unwrap();
        assert_eq!(cmd, decoded);
    }

    #[test]
    fn test_hold() {
        round_trip(Command::Hold);
    }

    #[test]
    fn test_move() {
        let dirs = [
            Direction::North,
            Direction::East,
            Direction::South,
            Direction::West,
        ];
        let dists = 0..16;

        for dir in dirs.iter() {
            for dist in dists.clone() {
                round_trip(Command::Move(*dir, dist));
            }
        }
    }

    #[test]
    fn test_upgrade() {
        let components = [
            Component::Blasters,
            Component::Thrusters,
            Component::Harvesters,
        ];

        for comp in components.iter() {
            round_trip(Command::Upgrade(*comp));
        }
    }
}
