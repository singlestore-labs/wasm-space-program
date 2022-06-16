import { ClientConfig, Query } from "@/data/client";
import { Bounds } from "@/data/coordinates";

export const queryEntitiesInBounds = (
  config: ClientConfig,
  cid: number,
  bounds: Bounds
) =>
  Query(
    config,
    `
      SELECT
        *
      FROM entity
      WHERE
        cid = ?
        AND x >= ?  AND x < ?
        AND y >= ?  AND y < ?
      ORDER BY x, y
    `,
    cid,
    bounds.x,
    bounds.x + bounds.width,
    bounds.y,
    bounds.y + bounds.height
  );
