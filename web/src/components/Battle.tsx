import { AssetSprite } from "@/components/AssetSprite";
import { cellToWorld } from "@/data/coordinates";

type Props = {
  cellX: number;
  cellY: number;
  onClick?: () => void;
  selected?: boolean;
};

export const Battle = ({ cellX, cellY, onClick, selected }: Props) => {
  const [x, y] = cellToWorld(cellX, cellY);
  return (
    <AssetSprite
      name="battle"
      x={x}
      y={y}
      buttonMode={onClick !== undefined}
      interactive={onClick !== undefined}
      pointerdown={onClick}
      selected={selected}
    />
  );
};
