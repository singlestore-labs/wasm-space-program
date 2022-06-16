import { ClientConfig, Query } from "@/data/client";
import { Bounds } from "@/data/coordinates";

export const EntityKind = {
  Ship: 1 as const,
  EnergyNode: 2 as const,
};

export type EntityKind = keyof typeof EntityKind;

export type EntityRow = {
  cid: number;
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

export const queryEntities = (config: ClientConfig, cid: number) =>
  Query<EntityRow>(
    config,
    `
      SELECT
        cid, eid,
        kind, x, y,
        energy, shield, blasters, thrusters, harvesters
      FROM entity
      WHERE
        cid = ?
      ORDER BY cid, eid
    `,
    cid
  );

export const queryEntitiesInBounds = (
  config: ClientConfig,
  cid: number,
  bounds: Bounds
) =>
  Query<EntityRow>(
    config,
    `
      SELECT
        cid, eid,
        kind, x, y,
        energy, shield, blasters, thrusters, harvesters
      FROM entity
      WHERE
        cid = ?
        AND x >= ?  AND x < ?
        AND y >= ?  AND y < ?
      ORDER BY cid, eid
    `,
    cid,
    bounds.x,
    bounds.x + bounds.width,
    bounds.y,
    bounds.y + bounds.height
  );
