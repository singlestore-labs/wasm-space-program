wit_bindgen_rust::export!("interface.wit");

use crate::agent::{execute_strategy, strategy_battle, strategy_default, strategy_flee};
use crate::plan::Plan;
pub use interface::{Entity, EntitySummary};

pub struct Interface;
impl interface::Interface for Interface {
    fn pack(e: EntitySummary) -> Vec<u8> {
        e.into()
    }

    fn strategy_default(e: Entity, last_plan_enc: u64, encoded_system: Vec<u8>) -> u64 {
        execute_strategy(strategy_default, e, last_plan_enc, encoded_system)
    }

    fn strategy_flee(e: Entity, last_plan_enc: u64, encoded_system: Vec<u8>) -> u64 {
        execute_strategy(strategy_flee, e, last_plan_enc, encoded_system)
    }

    fn strategy_battle(e: Entity, last_plan_enc: u64, encoded_system: Vec<u8>) -> u64 {
        execute_strategy(strategy_battle, e, last_plan_enc, encoded_system)
    }

    fn decodeplan(p: u64) -> String {
        match Plan::try_from(p) {
            Ok(plan) => format!("{:?} Memory{:02X?}", plan.cmd, plan.memory),
            Err(e) => format!("error: {}", e),
        }
    }

    fn applyplan(e: Entity, p: u64) -> Vec<Entity> {
        let plan = Plan::try_from(p).expect("failed to decode plan");
        let mut out = e;

        let cost = plan.cmd.energy_cost();
        if e.energy < cost {
            // not enough energy to execute the plan
            // consume one energy to do nothing
            out.energy = out.energy.saturating_sub(1);
        } else {
            // apply command
            plan.cmd.apply(&mut out);
        }

        vec![out]
    }
}
