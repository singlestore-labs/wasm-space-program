import { AssetSprite, SpriteName, Sprites } from "@/components/AssetSprite";
import { cellToWorld } from "@/data/coordinates";

export const SpriteGrid = () => {
  const spriteGrid = [];
  let cellX = 0;
  for (const [name, variants] of Object.entries(Sprites)) {
    for (let i = 0; i < variants.length; i++) {
      for (const size of ["1x", "2x"] as const) {
        const [x, y] = cellToWorld(cellX, size === "1x" ? 0 : 1);

        spriteGrid.push(
          <AssetSprite
            key={`${name}_${i}_${size}`}
            name={name as SpriteName}
            variantIdx={i}
            x={x}
            y={y}
          />
        );
      }
      cellX += 2;
    }
  }
  return <>{spriteGrid}</>;
};
