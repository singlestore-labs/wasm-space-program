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
  target?: EntityRow;
  selected?: boolean;
  energizing?: boolean;
  onClick?: () => void;
};

export const Entity = ({
  entity,
  target,
  selected,
  energizing,
  onClick,
}: Props) => {
  const [position, setPosition] = useState([entity.x, entity.y] as Vector);
  const [x, y] = cellToWorld(Math.round(position[0]), Math.round(position[1]));

  const hasReachedDestination = vectorEqual(position, [entity.x, entity.y]);

  let name: SpriteName = "energyNode";
  if (entity.kind === EntityKind.Ship) {
    // only show energizing when we are at our final position
    // otherwise we will start glowing as soon as we start moving
    // towards an energy node
    name = energizing && hasReachedDestination ? "shipEmpowered" : "ship";
  }

  useTick((delta: number) => {
    if (hasReachedDestination) {
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
  }, entity.kind === EntityKind.Ship && !hasReachedDestination);

  // show a temporary energy node at our target location while we animate towards it
  let tempEnergyNode;
  if (
    entity.kind === EntityKind.Ship &&
    !hasReachedDestination &&
    energizing &&
    target
  ) {
    const [tempX, tempY] = cellToWorld(entity.x, entity.y);
    tempEnergyNode = (
      <AssetSprite
        name="energyNode"
        x={tempX}
        y={tempY}
        variantIdx={target.eid}
      />
    );
  }

  return (
    <>
      <AssetSprite
        name={name}
        variantIdx={entity.eid}
        x={x}
        y={y}
        buttonMode={onClick !== undefined}
        interactive={onClick !== undefined}
        pointerdown={onClick}
        selected={selected}
      />
      {tempEnergyNode}
    </>
  );
};
