import { ClientConfig, Query } from "@/data/client";
import { Bounds } from "@/data/coordinates";

export const EntityKind = {
  Ship: 1 as const,
  EnergyNode: 2 as const,
};

export type EntityKind = keyof typeof EntityKind;

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

export const queryEntitiesInBounds = (
  config: ClientConfig,
  sid: number,
  bounds: Bounds
) =>
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
        AND x >= ?  AND x < ?
        AND y >= ?  AND y < ?
      ORDER BY sid, eid
    `,
    sid,
    bounds.x,
    bounds.x + bounds.width,
    bounds.y,
    bounds.y + bounds.height
  );
