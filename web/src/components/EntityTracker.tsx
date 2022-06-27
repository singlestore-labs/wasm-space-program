import { Battle } from "@/components/Battle";
import { Entity } from "@/components/Entity";
import { Explosion } from "@/components/Explosion";
import { selectedObjectAtom } from "@/data/atoms";
import { map1d, map2d, SOLAR_SYSTEM_SIZE_CELLS } from "@/data/coordinates";
import { EntityKind, EntityKindsByValue, EntityRow } from "@/data/queries";
import { useTick } from "@inlet/react-pixi";
import { useAtom } from "jotai";
import { useEffect, useReducer, useRef } from "react";

type Props = {
  entities: EntityRow[];
};

// index of entities by entity id
type EntityIndex = Map<number, EntityRow>;

// index of explosion progress by explosion location (1d)
type ExplosionIndex = Map<number, number>;

// index of entities by location (1d)
type CellIndex = Map<number, EntityRow[]>;

const createExplosion = (idx: ExplosionIndex, x: number, y: number) => {
  const loc = map1d(x, y, SOLAR_SYSTEM_SIZE_CELLS);
  idx.set(loc, 0);
};

export const EntityTracker = ({ entities }: Props) => {
  const [selectedEntity, setSelectedEntity] = useAtom(selectedObjectAtom);

  const entityIndexRef = useRef(new Map() as EntityIndex);
  const explosionIndexRef = useRef(new Map() as ExplosionIndex);
  const cellIndexRef = useRef(new Map() as CellIndex);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    // when the entity list changes, we need to update the indexes accordingly
    const entityIndex = entityIndexRef.current;
    const explosionIndex = explosionIndexRef.current;

    const newEntityById = new Map(
      entities.map((entity) => [entity.eid, entity])
    );

    // update or kill previous entities
    for (const [eid, entity] of entityIndex) {
      const newEntity = newEntityById.get(eid);

      if (newEntity) {
        if (newEntity.kind !== entity.kind) {
          // ship turned into an energy node
          createExplosion(explosionIndex, newEntity.x, newEntity.y);
        }

        // update the entity in the index
        entityIndex.set(eid, newEntity);
      } else {
        // entity is missing!

        // a missing ship should explode
        if (entity.kind === EntityKind.Ship) {
          createExplosion(explosionIndex, entity.x, entity.y);
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

    // rebuild the cell index
    const cellIndex = cellIndexRef.current;
    cellIndex.clear();
    for (const entity of entityIndex.values()) {
      const loc = map1d(entity.x, entity.y, SOLAR_SYSTEM_SIZE_CELLS);
      const cell = cellIndex.get(loc) || [];
      cellIndex.set(loc, [...cell, entity]);
    }

    forceUpdate();
  }, [entities]);

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

  const selectEntity = (entity: EntityRow) =>
    setSelectedEntity({
      id: entity.eid,
      kind: EntityKindsByValue[entity.kind] as EntityKind,
    });

  // render cell index
  const cells = [];
  for (const [loc, cell] of cellIndexRef.current) {
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

    if (numShips === 1) {
      // 1 ship
      // 1 ship + 1 or more energy nodes
      const entity = cell[0];
      cells.push(
        <Entity
          key={entity.eid}
          entity={entity}
          energizing={numEnergyNodes > 0}
          selected={cell.some((e) => e.eid === selectedEntity?.id)}
          onClick={() => selectEntity(entity)}
        />
      );
    } else if (numEnergyNodes > 0 && numShips === 0) {
      // 1 or more energy nodes
      const entity = cell[0];
      cells.push(
        <Entity
          key={entity.eid}
          entity={entity}
          selected={cell.some((e) => e.eid === selectedEntity?.id)}
          onClick={() => selectEntity(entity)}
        />
      );
    } else if (numShips > 1) {
      // 2 or more ships
      const [x, y] = map2d(loc, SOLAR_SYSTEM_SIZE_CELLS);
      cells.push(
        <Battle
          key={`battle-${loc}`}
          cellX={x}
          cellY={y}
          onClick={() => selectEntity(cell[0])}
          selected={cell.some((e) => e.eid === selectedEntity?.id)}
        />
      );
    }
  }

  const explosions = [];
  for (const [loc, progress] of explosionIndexRef.current) {
    const [x, y] = map2d(loc, SOLAR_SYSTEM_SIZE_CELLS);
    explosions.push(
      <Explosion key={loc} cellX={x} cellY={y} progress={progress} />
    );
  }

  return (
    <>
      {cells}
      {explosions}
    </>
  );
};
