import { selectedObjectAtom } from "@/data/atoms";
import { map1d, SOLAR_SYSTEM_SIZE_CELLS } from "@/data/coordinates";
import { EntityKind, EntityRow } from "@/data/queries";
import { useTick } from "@inlet/react-pixi";
import { useAtomValue } from "jotai";
import { useEffect, useReducer, useRef, useState } from "react";

// index of entities by entity id
type EntityIndex = Map<number, EntityRow>;

// index of explosion progress by explosion location (1d)
export type ExplosionIndex = Map<number, number>;

export type Cell =
  | {
      kind: "entity";
      entity: EntityRow;
      selected: boolean;
      energizing?: boolean;
    }
  | {
      kind: "battle";
      entities: EntityRow[];
      selected: boolean;
    };

export const useSolarSystemIndexes = (entities?: EntityRow[]) => {
  const selectedEntity = useAtomValue(selectedObjectAtom);
  const entityIndexRef = useRef(new Map() as EntityIndex);
  const explosionIndexRef = useRef(new Map() as ExplosionIndex);
  const [cellList, setCellList] = useState([] as Cell[]);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!entities) {
      return;
    }

    // when the entity list changes, we need to update the indexes accordingly
    const entityIndex = entityIndexRef.current;
    const explosionIndex = explosionIndexRef.current;

    const newEntityById = new Map(
      entities.map((entity) => [entity.eid, entity])
    );

    const createExplosion = (x: number, y: number) => {
      const loc = map1d(x, y, SOLAR_SYSTEM_SIZE_CELLS);
      explosionIndex.set(loc, 0);
    };

    // update or kill previous entities
    for (const [eid, entity] of entityIndex) {
      const newEntity = newEntityById.get(eid);

      if (newEntity) {
        if (newEntity.kind !== entity.kind) {
          // ship turned into an energy node
          createExplosion(newEntity.x, newEntity.y);
        }

        // update the entity in the index
        entityIndex.set(eid, newEntity);
      } else {
        // entity is missing!

        // a missing ship should explode
        if (entity.kind === EntityKind.Ship) {
          createExplosion(entity.x, entity.y);
        }

        entityIndex.delete(eid);
      }
    }

    // insert new entities that we haven't seen before
    for (const entity of entities) {
      if (!entityIndex.has(entity.eid)) {
        entityIndex.set(entity.eid, entity);
      }
    }

    // build a cell index
    const cellIndex = new Map<number, EntityRow[]>();
    for (const entity of entityIndex.values()) {
      const loc = map1d(entity.x, entity.y, SOLAR_SYSTEM_SIZE_CELLS);
      const cell = cellIndex.get(loc) || [];
      cellIndex.set(loc, [...cell, entity]);
    }

    // build cell list
    const newCellList = [] as Cell[];
    for (const [, cell] of cellIndex) {
      // inspect cell to decide what to render
      let numShips = 0,
        numEnergyNodes = 0;
      for (const entity of cell) {
        if (entity.kind === EntityKind.Ship) {
          numShips++;
        } else if (entity.kind === EntityKind.EnergyNode) {
          numEnergyNodes++;
        }
      }

      const selected = cell.some((e) => e.eid === selectedEntity?.id);

      if (numShips === 1) {
        // 1 ship
        // 1 ship + 1 or more energy nodes
        const entity = cell.find((e) => e.kind === EntityKind.Ship) || cell[0];
        newCellList.push({
          kind: "entity",
          entity: entity,
          energizing: numEnergyNodes > 0,
          selected,
        });
      } else if (numEnergyNodes > 0 && numShips === 0) {
        // 1 or more energy nodes
        newCellList.push({
          kind: "entity",
          entity: cell[0],
          selected,
        });
      } else if (numShips > 1) {
        // 2 or more ships
        newCellList.push({
          kind: "battle",
          entities: cell,
          selected,
        });
      }
    }

    setCellList(newCellList);
  }, [entities, selectedEntity?.id]);

  // animate explosions
  useTick((_, ticker) => {
    const explosionIndex = explosionIndexRef.current;
    for (const [loc, progress] of explosionIndex) {
      const newProgress = progress + ticker.deltaMS / 800;
      if (newProgress >= 1) {
        explosionIndex.delete(loc);
      } else {
        explosionIndex.set(loc, newProgress);
      }
    }

    forceUpdate();
  }, explosionIndexRef.current.size > 0);

  return { explosionIndex: explosionIndexRef.current, cells: cellList };
};
