import { Battle } from "@/components/Battle";
import { Entity } from "@/components/Entity";
import { Explosion } from "@/components/Explosion";
import { selectedObjectAtom } from "@/data/atoms";
import { map2d, SOLAR_SYSTEM_SIZE_CELLS } from "@/data/coordinates";
import { EntityKind, EntityKindsByValue, EntityRow } from "@/data/queries";
import { Cell, ExplosionIndex } from "@/hooks/useSolarSystemIndexes";
import { useSetAtom } from "jotai";

type Props = {
  explosionIndex: ExplosionIndex;
  cells: Cell[];
};

export const EntityTracker = ({ explosionIndex, cells }: Props) => {
  const setSelectedEntity = useSetAtom(selectedObjectAtom);

  const selectEntity = (entity: EntityRow) =>
    setSelectedEntity({
      id: entity.eid,
      kind: EntityKindsByValue[entity.kind] as EntityKind,
    });

  // render cell index
  const nodes = [];
  for (const cell of cells) {
    if (cell.kind === "entity") {
      const targetEnergyNode =
        cell.entities.find((entity) => entity.kind === EntityKind.EnergyNode) ||
        cell.entities[0];
      nodes.push(
        <Entity
          key={cell.entity.eid}
          entity={cell.entity}
          target={targetEnergyNode}
          energizing={cell.energizing}
          selected={cell.selected}
          onClick={() => selectEntity(cell.entity)}
        />
      );
    } else if (cell.kind === "battle") {
      const entity =
        cell.entities.find((entity) => entity.kind === EntityKind.Ship) ||
        cell.entities[0];
      nodes.push(
        <Battle
          key={`battle-${entity.x}-${entity.y}`}
          cellX={entity.x}
          cellY={entity.y}
          onClick={() => selectEntity(entity)}
          selected={cell.selected}
        />
      );
    }
  }

  const explosions = [];
  for (const [loc, progress] of explosionIndex) {
    const [x, y] = map2d(loc, SOLAR_SYSTEM_SIZE_CELLS);
    explosions.push(
      <Explosion key={loc} cellX={x} cellY={y} progress={progress} />
    );
  }

  return (
    <>
      {nodes}
      {explosions}
    </>
  );
};
