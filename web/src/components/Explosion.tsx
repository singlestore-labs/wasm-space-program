import { AssetSprite } from "@/components/AssetSprite";
import { cellToWorld } from "@/data/coordinates";
import { easeElasticOut } from "d3-ease";

type Props = {
  cellX: number;
  cellY: number;
  progress: number;
};

const EASE = easeElasticOut.amplitude(1).period(0.5);

export const Explosion = ({ cellX, cellY, progress }: Props) => {
  const [x, y] = cellToWorld(cellX, cellY);
  const scale = EASE(progress);

  return (
    <AssetSprite
      name="explosion"
      x={x}
      y={y}
      scale={scale}
      alpha={progress > 0.5 ? 1 - progress : 1}
    />
  );
};
