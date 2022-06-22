wit_bindgen_rust::export!("interface.wit");

use crate::agent;
use crate::command::Command;
use crate::plan::Plan;
use crate::system::System;
pub use interface::{Entity, EntitySummary};

pub struct Interface;
impl interface::Interface for Interface {
    fn pack(e: EntitySummary) -> Vec<u8> {
        e.into()
    }

    fn step(e: Entity, last_plan_enc: u64, encoded_system: Vec<u8>) -> u64 {
        let last_plan: Plan = last_plan_enc.try_into().unwrap();
        let system = System::try_from(encoded_system).unwrap();
        let mut mem = last_plan.memory;

        let next_cmd =
            agent::all_strategies(&mut mem, &last_plan.cmd, &e, &system).unwrap_or(Command::Hold);

        Plan::new(next_cmd, mem)
            .try_into()
            .expect("failed to encode plan")
    }

    fn decodeplan(p: u64) -> String {
        match Plan::try_from(p) {
            Ok(plan) => format!("{:?} Memory{:02X?}", plan.cmd, plan.memory),
            Err(e) => format!("error: {}", e),
        }
    }

    fn applyplan(e: Entity, p: u64) -> Vec<Entity> {
        let plan = Plan::try_from(p).expect("failed to decode plan");

        let cost = plan.cmd.energy_cost();
        if e.energy < cost {
            // not enough energy to execute the plan
            return vec![e];
        }

        // apply command
        let mut out = e;
        plan.cmd.apply(&mut out);
        vec![out]
    }
}
