import { AssetSprite } from "@/components/AssetSprite";
import { cellToWorld, CELL_SIZE_PX } from "@/data/coordinates";
import { useEase } from "@/hooks/useEase";
import { easeElasticOut } from "d3-ease";

type Props = {
  cellX: number;
  cellY: number;
  onAnimationComplete: () => void;
  zIndex: number;
};

export const Explosion = ({
  cellX,
  cellY,
  onAnimationComplete,
  zIndex,
}: Props) => {
  const [scale, progress] = useEase(easeElasticOut.amplitude(1).period(0.5), {
    initialValue: 0.1,
    duration: 800,
    onComplete: onAnimationComplete,
  });
  const [x, y] = cellToWorld(cellX, cellY);

  return (
    <AssetSprite
      name="explosion"
      anchor={[0.5, 0.5]}
      x={x + CELL_SIZE_PX / 2}
      y={y + CELL_SIZE_PX / 2}
      scale={scale}
      alpha={progress > 0.5 ? 1 - progress : 1}
      zIndex={zIndex}
    />
  );
};
