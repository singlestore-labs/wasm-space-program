import { AssetSprite } from "@/components/AssetSprite";
import { cellToWorld } from "@/data/coordinates";

type Props = {
  cellX: number;
  cellY: number;
};

export const Battle = ({ cellX, cellY }: Props) => {
  const [x, y] = cellToWorld(cellX, cellY);
  return <AssetSprite zIndex={0} name="battle" x={x} y={y} />;
};
