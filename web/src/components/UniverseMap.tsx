import { AssetContext } from "@/components/AssetLoader";
import { AssetSprite } from "@/components/AssetSprite";
import { DebugGrid } from "@/components/DebugGrid";
import { DebugOnly } from "@/components/DebugOnly";
import { Viewport } from "@/components/Viewport";
import { clientConfigAtom } from "@/data/atoms";
import { cellToWorld, UNIVERSE_SIZE_PX } from "@/data/coordinates";
import { querySolarSystems } from "@/data/queries";
import { TilingSprite } from "@inlet/react-pixi";
import { useAtomValue } from "jotai";
import { useContext } from "react";
import useSWR from "swr";

type Props = {
  width: number;
  height: number;
  onWarp: (sid: number) => void;
  onClose: () => void;
};

export const UniverseMap = ({ onWarp, height, width }: Props) => {
  const { starsTile } = useContext(AssetContext);
  const clientConfig = useAtomValue(clientConfigAtom);
  const { data: systems } = useSWR(["querySolarSystems", clientConfig], () =>
    querySolarSystems(clientConfig)
  );

  const rendered = systems
    ? systems.map((system) => {
        const { sid, x, y } = system;
        const [worldX, worldY] = cellToWorld(x, y);
        return (
          <AssetSprite
            key={sid}
            name="solarSystem"
            variantIdx={sid}
            x={worldX}
            y={worldY}
            interactive
            buttonMode
            pointerdown={() => onWarp(sid)}
          />
        );
      })
    : null;

  return (
    <Viewport
      screenHeight={height}
      screenWidth={width}
      worldHeight={UNIVERSE_SIZE_PX}
      worldWidth={UNIVERSE_SIZE_PX}
      clamp
    >
      <TilingSprite
        texture={starsTile}
        width={UNIVERSE_SIZE_PX}
        height={UNIVERSE_SIZE_PX}
        tilePosition={[0, 0]}
        tileScale={[1, 1]}
      />
      <DebugOnly>
        <DebugGrid width={UNIVERSE_SIZE_PX} height={UNIVERSE_SIZE_PX} />
      </DebugOnly>
      {rendered}
    </Viewport>
  );
};
