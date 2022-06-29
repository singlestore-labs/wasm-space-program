import { ClientConfig, Query, QueryOne } from "@/data/client";
import { invert } from "lodash-es";
import { Rectangle } from "pixi.js";

export const EntityKind = {
  Ship: 1 as const,
  EnergyNode: 2 as const,
};

export type EntityKind = keyof typeof EntityKind;

export const EntityKindsByValue = invert(EntityKind);

export const EntityKindStrings = {
  [EntityKind.Ship]: "Ship",
  [EntityKind.EnergyNode]: "Energy Node",
};

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

export const querySolarSystemsInBounds = (
  config: ClientConfig,
  bounds: Rectangle
) =>
  Query<SolarSystemRow>(
    config,
    `
    SELECT sid, x, y FROM solar_system
    WHERE
      x BETWEEN ? AND ?
      AND y BETWEEN ? AND ?
  `,
    bounds.x,
    bounds.x + bounds.width,
    bounds.y,
    bounds.y + bounds.height
  );

export type SolarSystemInfoRow = {
  sid: number;
  x: number;
  y: number;
  numShips: number;
  numEnergyNodes: number;
  totalEnergy: number;
};

export const querySolarSystem = (config: ClientConfig, sid: number) =>
  QueryOne<SolarSystemInfoRow>(
    config,
    `
      SELECT
        sid, x, y,
        ifnull((
          select count(*) from entity
          where entity.sid = solar_system.sid
          and entity.kind = 1
        ), 0) as numShips,
        ifnull((
          select count(*) from entity
          where entity.sid = solar_system.sid
          and entity.kind = 2
        ), 0) as numEnergyNodes,
        ifnull((
          select sum(energy) from entity
          where entity.sid = solar_system.sid
        ), 0) as totalEnergy
      FROM solar_system
      WHERE sid = ?
    `,
    sid
  );

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

export const queryEntitiesByEntityLocation = (
  config: ClientConfig,
  eid: number
) =>
  Query<EntityRow>(
    config,
    `
      SELECT same_location.*
      FROM entity
      LEFT JOIN entity same_location ON (
        entity.sid = same_location.sid
        and ((
          entity.x = same_location.x
          and entity.y = same_location.y
        ) or (
          entity.eid = same_location.eid
        ))
      )
      WHERE entity.eid = ?
      ORDER BY same_location.eid
    `,
    eid
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

export const queryEntityMaybe = (config: ClientConfig, eid: number) =>
  queryEntity(config, eid).catch(() => null);

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

export const queryTurnInfo = (config: ClientConfig) =>
  QueryOne<{ avgTurnTime: number; avgWrites: number }>(
    config,
    `
      select
        avg(timestampdiff(microsecond, start_time, end_time)) :> bigint as avgTurnTime,
        ifnull(avg(writes), 0) :> bigint as avgWrites
      from turns
      where end_time is not null
    `
  );

export const queryNumSystems = (config: ClientConfig) =>
  QueryOne<{ c: number }>(
    config,
    "select count(*) as c from solar_system"
  ).then((r) => r.c);

export const queryAvgEntitiesPerSystem = (config: ClientConfig) =>
  Query<{ kind: number; count: number }>(
    config,
    `
      select kind, ifnull(avg(c), 0) :> int as count
      from (
        select kind, count(*) as c
        from entity
        group by sid, kind
      )
      group by kind
    `
  ).then((rows) =>
    rows.reduce(
      (acc, row) => {
        acc[EntityKindsByValue[row.kind] as EntityKind] = row.count;
        return acc;
      },
      { Ship: 0, EnergyNode: 0 }
    )
  );

export const queryGlobalStats = async (config: ClientConfig) => {
  const [numEntities, turnInfo, avgEntitiesPerSystem, numSystems] =
    await Promise.all([
      queryNumEntitiesByKind(config),
      queryTurnInfo(config),
      queryAvgEntitiesPerSystem(config),
      queryNumSystems(config),
    ]);
  return {
    numEntities,
    turnInfo,
    avgEntitiesPerSystem,
    numSystems,
  };
};
