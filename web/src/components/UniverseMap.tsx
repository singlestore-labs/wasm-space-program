import { AssetContext } from "@/components/AssetLoader";
import { AssetSprite } from "@/components/AssetSprite";
import { DebugGrid } from "@/components/DebugGrid";
import { DebugOnly } from "@/components/DebugOnly";
import { Viewport } from "@/components/Viewport";
import {
  clientConfigAtom,
  selectedObjectAtom,
  sidAtom,
  viewportAtom,
} from "@/data/atoms";
import { cellToWorld, UNIVERSE_SIZE_PX } from "@/data/coordinates";
import { querySolarSystems } from "@/data/queries";
import { TilingSprite } from "@inlet/react-pixi";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useContext } from "react";
import { useEffectOnceWhen } from "rooks";
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
  const [selectedObject, setSelectedObject] = useAtom(selectedObjectAtom);
  const setViewport = useSetAtom(viewportAtom);
  const sid = useAtomValue(sidAtom);

  const { data: systems } = useSWR(["querySolarSystems", clientConfig], () =>
    querySolarSystems(clientConfig)
  );

  useEffectOnceWhen(() => {
    if (selectedObject && systems) {
      const system = systems.find((s) => s.sid === selectedObject.id);
      if (system) {
        const [worldX, worldY] = cellToWorld(system.x, system.y);
        setViewport({
          x: worldX,
          y: worldY,
          scale: 1,
        });
      }
    }
  }, !!(systems && selectedObject?.kind === "SolarSystem" && selectedObject?.id === sid));

  const selectSolarSystem = useCallback(
    (sid: number) => {
      setSelectedObject({ kind: "SolarSystem", id: sid });
    },
    [setSelectedObject]
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
            pointerover={() => selectSolarSystem(sid)}
            pointerout={() => setSelectedObject(null)}
            selected={selectedObject?.id === sid}
          />
        );
      })
    : null;

  return (
    <Viewport
      screenWidth={width}
      screenHeight={height}
      worldWidth={UNIVERSE_SIZE_PX}
      worldHeight={UNIVERSE_SIZE_PX}
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
