import { AssetSprite, SpriteName } from "@/components/AssetSprite";
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
  selected?: boolean;
  onClick?: () => void;
};

export const Entity = ({ entity, selected, onClick }: Props) => {
  let name: SpriteName = "energyNode";
  if (entity.kind === EntityKind.Ship) {
    name = selected ? "shipEmpowered" : "ship";
  }

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
  }, entity.kind === EntityKind.Ship && !vectorEqual(position, [entity.x, entity.y]));

  return (
    <AssetSprite
      name={name}
      variantIdx={entity.eid}
      x={x}
      y={y}
      zIndex={entity.kind === EntityKind.Ship ? entity.eid : -1 * entity.eid}
      buttonMode
      interactive={onClick !== undefined}
      pointerdown={onClick}
    />
  );
};
