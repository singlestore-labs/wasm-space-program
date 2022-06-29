// BytesCast generates some identity operations so we need to ignore this
#![allow(clippy::identity_op)]

use std::fmt::{self};

use crate::command::{Command, CommandDecodeError};
use bytes_cast::BytesCast;

pub type AgentMemory = [u8; 7];

pub struct Plan {
    pub cmd: Command,
    pub memory: AgentMemory,
}

impl Plan {
    pub fn new(cmd: Command, memory: AgentMemory) -> Self {
        Self { cmd, memory }
    }
}

#[derive(BytesCast, Clone, Copy)]
#[repr(C)]
pub struct PackedPlan {
    cmd: u8,
    memory: AgentMemory,
}

#[derive(Debug)]
pub enum PlanDecodeError {
    ExtraBytes,
    CommandDecodeError(CommandDecodeError),
    BytesCastErr(bytes_cast::FromBytesError),
}

impl fmt::Display for PlanDecodeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PlanDecodeError::ExtraBytes => write!(f, "extra bytes"),
            PlanDecodeError::CommandDecodeError(e) => e.fmt(f),
            PlanDecodeError::BytesCastErr(e) => e.fmt(f),
        }
    }
}

impl TryFrom<u64> for Plan {
    type Error = PlanDecodeError;

    fn try_from(value: u64) -> Result<Self, Self::Error> {
        let value_bytes = value.to_ne_bytes();
        let (packed, extra_bytes) =
            PackedPlan::from_bytes(&value_bytes).map_err(PlanDecodeError::BytesCastErr)?;

        if !extra_bytes.is_empty() {
            return Err(PlanDecodeError::ExtraBytes);
        }

        let command = Command::try_from(packed.cmd).map_err(PlanDecodeError::CommandDecodeError)?;

        Ok(Plan {
            cmd: command,
            memory: packed.memory,
        })
    }
}

impl TryFrom<Plan> for u64 {
    type Error = std::array::TryFromSliceError;

    fn try_from(plan: Plan) -> Result<Self, Self::Error> {
        let packed = PackedPlan {
            cmd: plan.cmd.into(),
            memory: plan.memory,
        };
        let bytes = packed.as_bytes();
        let bytes_arr: [u8; 8] = bytes.try_into()?;
        Ok(u64::from_ne_bytes(bytes_arr))
    }
}
