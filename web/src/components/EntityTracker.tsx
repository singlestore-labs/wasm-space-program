import { Entity } from "@/components/Entity";
import { Explosion } from "@/components/Explosion";
import { selectedObjectAtom } from "@/data/atoms";
import { EntityKind, EntityKindsByValue, EntityRow } from "@/data/queries";
import { useAtom } from "jotai";
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

export const EntityTracker = ({ entities }: Props) => {
  const [selectedEntity, setSelectedEntity] = useAtom(selectedObjectAtom);

  const entityIndexRef = useRef(new Map() as EntityIndex);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const debouncedForceUpdate = useDebounce(forceUpdate, 100);

  useEffect(() => {
    // when the entity list changes, we need to update the indexes accordingly
    const entityIndex = entityIndexRef.current;

    const newEntityById = new Map(
      entities.map((entity) => [entity.eid, entity])
    );

    let numDead = 0;

    // update or kill previous entities
    for (const [eid, tracker] of entityIndex) {
      const newEntity = newEntityById.get(eid);

      if (newEntity) {
        // update the tracker's entity
        tracker.entity = newEntity;
      } else {
        if (tracker.entity.kind === EntityKind.Ship) {
          // a missing ship is a dead ship
          tracker.dead = true;
        } else {
          // a missing something else is just missing
          entityIndex.delete(eid);
        }
      }

      if (tracker.dead) {
        numDead++;
      }
    }

    // insert new entities that we haven't seen before
    for (const entity of newEntityById.values()) {
      if (!entityIndex.has(entity.eid)) {
        entityIndex.set(entity.eid, { entity, dead: false });
      }
    }

    // if there are many active dead entities, immediately remove all
    // dead entities - this is a hack until explosion animations don't involve a
    // ticker per component
    if (numDead > 50) {
      for (const [eid, tracker] of entityIndex) {
        if (tracker.dead) {
          entityIndex.delete(eid);
        }
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
          zIndex={Number.MAX_VALUE}
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
          selected={
            selectedEntity?.kind !== "SolarSystem" &&
            tracker.entity.eid === selectedEntity?.id
          }
          onClick={() =>
            setSelectedEntity({
              id: tracker.entity.eid,
              kind: EntityKindsByValue[tracker.entity.kind] as EntityKind,
            })
          }
        />
      );
    }
  }

  return <>{nodes}</>;
};
