use std::{cmp, fmt};

use crate::interface::Entity;

const MASK_U2: u8 = 0b11;
const MASK_U4: u8 = 0b1111;

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

#[derive(Debug)]
pub enum CommandDecodeError {
    ExtraBytes,
    InvalidDirection,
    InvalidComponent,
    InvalidCommand,
    BytesCastErr(bytes_cast::FromBytesError),
}

impl Command {
    pub fn energy_cost(&self) -> u16 {
        match self {
            Command::Hold => 1,
            Command::Move(_, _) => 2,
            Command::Upgrade(_) => 50,
        }
    }

    pub fn apply(&self, e: &mut Entity) {
        e.energy = e.energy.saturating_sub(self.energy_cost());
        match self {
            Command::Hold => {}
            Command::Move(dir, dist) => match dir {
                Direction::North => e.y = e.y.saturating_sub(*dist as u32),
                Direction::East => e.x = cmp::min(e.x.saturating_add(*dist as u32), 99),
                Direction::South => e.y = cmp::min(e.y.saturating_add(*dist as u32), 99),
                Direction::West => e.x = e.x.saturating_sub(*dist as u32),
            },
            Command::Upgrade(comp) => match comp {
                Component::Blasters => e.blasters = e.blasters.saturating_add(1),
                Component::Thrusters => e.thrusters = e.thrusters.saturating_add(1),
                Component::Harvesters => e.harvesters = e.harvesters.saturating_add(1),
            },
        }
    }
}

impl fmt::Display for CommandDecodeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CommandDecodeError::ExtraBytes => write!(f, "extra bytes"),
            CommandDecodeError::InvalidDirection => write!(f, "invalid direction"),
            CommandDecodeError::InvalidComponent => write!(f, "invalid component"),
            CommandDecodeError::InvalidCommand => write!(f, "invalid command"),
            CommandDecodeError::BytesCastErr(e) => e.fmt(f),
        }
    }
}

impl TryFrom<u8> for Direction {
    type Error = CommandDecodeError;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        Ok(match value {
            0 => Direction::North,
            1 => Direction::East,
            2 => Direction::South,
            3 => Direction::West,
            _ => return Err(CommandDecodeError::InvalidDirection),
        })
    }
}

impl TryFrom<u8> for Component {
    type Error = CommandDecodeError;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        Ok(match value {
            0 => Component::Blasters,
            1 => Component::Thrusters,
            2 => Component::Harvesters,
            _ => return Err(CommandDecodeError::InvalidComponent),
        })
    }
}

impl TryFrom<u8> for Command {
    type Error = CommandDecodeError;

    fn try_from(v: u8) -> Result<Self, Self::Error> {
        let cmd = v >> 6;
        match cmd {
            0b00 => Ok(Command::Hold),
            0b01 => Ok(Command::Move(
                Direction::try_from((v >> 4) & MASK_U2)?,
                v & MASK_U4,
            )),
            0b10 => Ok(Command::Upgrade(Component::try_from(v & MASK_U2)?)),
            _ => Err(CommandDecodeError::InvalidCommand),
        }
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
