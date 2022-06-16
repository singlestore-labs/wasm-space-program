import { AssetSprite } from "@/components/AssetSprite";
import { cellToWorld } from "@/data/coordinates";
import { EntityKind, EntityRow } from "@/data/queries";

type Props = {
  entity: EntityRow;
  follow: boolean;
};

const EntityKindToName = {
  [EntityKind.Ship]: "ship" as const,
  [EntityKind.EnergyNode]: "energyNode" as const,
};

export const Entity = ({ entity, follow }: Props) => {
  const name = EntityKindToName[entity.kind];
  const [x, y] = cellToWorld(entity.x, entity.y);

  return (
    <AssetSprite
      name={name}
      tint={follow ? 0xff0000 : 0xffffff}
      variantIdx={entity.eid}
      size="1x"
      x={x}
      y={y}
      zIndex={-1 * entity.kind}
    />
  );
};
