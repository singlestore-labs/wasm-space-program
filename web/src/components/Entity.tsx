import { AssetSprite } from "@/components/AssetSprite";
import {
  cellToWorld,
  Vector,
  vectorAdd,
  vectorDivide,
  vectorEqual,
  vectorMagnitude,
  vectorMultiply,
  vectorSubtract,
} from "@/data/coordinates";
import { EntityKind, EntityRow } from "@/data/queries";
import { useTick } from "@inlet/react-pixi";
import { useState } from "react";

type Props = {
  entity: EntityRow;
  follow?: boolean;
};

const EntityKindToName = {
  [EntityKind.Ship]: "ship" as const,
  [EntityKind.EnergyNode]: "energyNode" as const,
};

export const Entity = ({ entity, follow }: Props) => {
  const name = EntityKindToName[entity.kind];

  const [position, setPosition] = useState([entity.x, entity.y] as Vector);
  const [x, y] = cellToWorld(Math.round(position[0]), Math.round(position[1]));

  useTick((delta: number) => {
    if (vectorEqual(position, [entity.x, entity.y])) {
      return;
    }

    const distance = vectorSubtract([entity.x, entity.y], position);
    const distanceMagnitude = vectorMagnitude(distance);

    if (distanceMagnitude < 1) {
      return setPosition([entity.x, entity.y]);
    }

    const direction = vectorDivide(distance, distanceMagnitude);
    const speed = delta * 0.1;
    const newPosition = vectorAdd(position, vectorMultiply(direction, speed));
    setPosition(newPosition);
  }, entity.kind === EntityKind.Ship);

  // TODO: need to know size - 1x or 2x

  return (
    <AssetSprite
      name={name}
      tint={follow ? 0xff0000 : 0xffffff}
      variantIdx={entity.eid}
      size="1x"
      x={x}
      y={y}
      zIndex={entity.kind === EntityKind.Ship ? entity.eid : -1 * entity.eid}
    />
  );
};
