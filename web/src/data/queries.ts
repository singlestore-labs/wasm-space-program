import { ClientConfig, Query, QueryOne } from "@/data/client";
import { invert } from "lodash-es";

export const EntityKind = {
  Ship: 1 as const,
  EnergyNode: 2 as const,
};

export type EntityKind = keyof typeof EntityKind;

export const EntityKindsByValue = invert(EntityKind);

export type EntityRow = {
  sid: number;
  eid: number;
  kind: typeof EntityKind[keyof typeof EntityKind];
  x: number;
  y: number;

  energy: number;
  shield: number;
  blasters: number;
  thrusters: number;
  harvesters: number;
};

export type SolarSystemRow = {
  sid: number;
  x: number;
  y: number;
};

export const querySolarSystems = (config: ClientConfig) =>
  Query<SolarSystemRow>(config, `SELECT sid, x, y FROM solar_system`);

export const queryEntities = (config: ClientConfig, sid: number) =>
  Query<EntityRow>(
    config,
    `
      SELECT
        sid, eid,
        kind, x, y,
        energy, shield, blasters, thrusters, harvesters
      FROM entity
      WHERE
        sid = ?
      ORDER BY sid, eid
    `,
    sid
  );

export const queryEntity = (config: ClientConfig, eid: number) =>
  QueryOne<EntityRow>(
    config,
    `
      SELECT
        sid, eid,
        kind, x, y,
        energy, shield, blasters, thrusters, harvesters
      FROM entity
      WHERE
        eid = ?
    `,
    eid
  );

export const queryNumEntitiesByKind = (config: ClientConfig) =>
  Query<{ kind: number; count: number }>(
    config,
    "select kind, count(*) as count from entity group by kind"
  ).then((rows) =>
    rows.reduce(
      (acc, row) => {
        acc[EntityKindsByValue[row.kind] as EntityKind] = row.count;
        return acc;
      },
      { Ship: 0, EnergyNode: 0 }
    )
  );

export const queryAvgTurnTime = (config: ClientConfig) =>
  QueryOne<{ t: number }>(
    config,
    "select avg(end_time - start_time) as t from turns where end_time is not null"
  ).then((r) => r.t);

export const queryNumSystems = (config: ClientConfig) =>
  QueryOne<{ c: number }>(
    config,
    "select count(distinct sid) as c from entity"
  ).then((r) => r.c);

export const queryAvgShipsPerSystem = (config: ClientConfig) =>
  QueryOne<{ a: number }>(
    config,
    `
      select ifnull(avg(c), 0) :> int as a
      from (
        select count(*) as c
        from entity
        where kind = ?
        group by sid
      )
    `,
    EntityKind.Ship
  ).then((r) => r.a);

export const queryGlobalStats = async (config: ClientConfig) => {
  const [numEntities, avgTurnTime, avgShipsPerSystem, numSystems] =
    await Promise.all([
      queryNumEntitiesByKind(config),
      queryAvgTurnTime(config),
      queryAvgShipsPerSystem(config),
      queryNumSystems(config),
    ]);
  return {
    numEntities,
    avgTurnTime,
    avgShipsPerSystem,
    numSystems,
  };
};
