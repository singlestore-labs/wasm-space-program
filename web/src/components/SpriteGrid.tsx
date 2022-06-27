import { AssetSprite, SpriteName, Sprites } from "@/components/AssetSprite";
import { cellToWorld } from "@/data/coordinates";

type Props = { selected?: boolean };

export const SpriteGrid = ({ selected }: Props) => {
  const spriteGrid = [];
  const gridWidth = 5;
  let offset = 0;

  for (const [name, variants] of Object.entries(Sprites)) {
    for (let i = 0; i < variants.length; i++) {
      const [x, y] = cellToWorld(
        offset % gridWidth,
        Math.floor(offset / gridWidth)
      );
      offset += 1;

      spriteGrid.push(
        <AssetSprite
          key={`${name}_${i}`}
          name={name as SpriteName}
          variantIdx={i}
          x={x * 2}
          y={y * 2}
          selected={selected}
          zIndex={0}
        />
      );
    }
  }
  return <>{spriteGrid}</>;
};
