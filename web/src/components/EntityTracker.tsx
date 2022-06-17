import { Entity } from "@/components/Entity";
import { Explosion } from "@/components/Explosion";
import { followEntityAtom } from "@/data/atoms";
import { EntityRow } from "@/data/queries";
import { useAtomValue } from "jotai";
import { useEffect, useReducer, useRef } from "react";
import { useDebounce } from "rooks";

type Props = {
  entities: EntityRow[];
};

type Tracker = {
  entity: EntityRow;
  dead: boolean;
};

// index of entities by entity id
type EntityIndex = Map<number, Tracker>;

// index mapping from cellX to cellY to list of entity ids
type CellIndex = Map<number, Map<number, number[]>>;

export const EntityTracker = ({ entities }: Props) => {
  const followEntity = useAtomValue(followEntityAtom);

  const entityIndexRef = useRef(new Map() as EntityIndex);
  const cellIndexRef = useRef(new Map() as CellIndex);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const debouncedForceUpdate = useDebounce(forceUpdate, 100);

  useEffect(() => {
    // when the entity list changes, we need to update the indexes accordingly
    const entityIndex = entityIndexRef.current;
    const cellIndex = cellIndexRef.current;

    const newEntityById = new Map(
      entities.map((entity) => [entity.eid, entity])
    );

    // update or kill previous entities
    for (const [eid, tracker] of entityIndex) {
      const newEntity = newEntityById.get(eid);

      if (newEntity) {
        // update the tracker's entity
        tracker.entity = newEntity;

        // an entity has died if it's kind has changed
        if (tracker.entity.kind !== newEntity.kind) {
          tracker.dead = true;
        }
      } else {
        tracker.dead = true;

        // if (tracker.entity.kind === EntityKind.Ship) {
        //   // a missing ship is a dead ship
        //   tracker.dead = true;
        // }
        // } else {
        //   // a missing something else is just missing
        //   // TODO: consider a "consuming" energy node animation
        //   entityIndex.delete(eid);
        // }
      }
    }

    // insert new entities that we haven't seen before
    for (const entity of newEntityById.values()) {
      if (!entityIndex.has(entity.eid)) {
        entityIndex.set(entity.eid, { entity, dead: false });
      }
    }

    // for now we always cause a re-render
    forceUpdate();
  }, [entities]);

  const removeEntity = (eid: number) => {
    entityIndexRef.current.delete(eid);
    debouncedForceUpdate();
  };

  const nodes = [];
  for (const tracker of entityIndexRef.current.values()) {
    if (tracker.dead) {
      nodes.push(
        <Explosion
          zIndex={Infinity}
          key={tracker.entity.eid}
          cellX={tracker.entity.x}
          cellY={tracker.entity.y}
          onAnimationComplete={() => removeEntity(tracker.entity.eid)}
        />
      );
    } else {
      nodes.push(
        <Entity
          key={tracker.entity.eid}
          entity={tracker.entity}
          follow={tracker.entity.eid === followEntity}
        />
      );
    }
  }

  return <>{nodes}</>;
};
