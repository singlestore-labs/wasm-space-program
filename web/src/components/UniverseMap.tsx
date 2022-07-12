import { AssetContext } from "@/components/AssetLoader";
import { AssetSprite } from "@/components/AssetSprite";
import { DebugGrid } from "@/components/DebugGrid";
import { DebugOnly } from "@/components/DebugOnly";
import { Viewport } from "@/components/Viewport";
import {
  clientConfigAtom,
  selectedObjectAtom,
  viewportAtom,
} from "@/data/atoms";
import { cellToWorld, UNIVERSE_SIZE_PX, worldToCell } from "@/data/coordinates";
import { querySolarSystemsInBounds, SolarSystemRow } from "@/data/queries";
import { swrLaggy } from "@/data/swr";
import { TilingSprite } from "@inlet/react-pixi";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Rectangle } from "pixi.js";
import { useCallback, useContext, useState } from "react";
import { useEffectOnceWhen } from "rooks";
import useSWR from "swr";

type Props = {
  selectedSolarSystem?: SolarSystemRow;
  width: number;
  height: number;
  onWarp: (sid: number) => void;
};

export const UniverseMap = ({
  onWarp,
  height,
  width,
  selectedSolarSystem,
}: Props) => {
  const { starsTile } = useContext(AssetContext);
  const clientConfig = useAtomValue(clientConfigAtom);
  const [selectedObject, setSelectedObject] = useAtom(selectedObjectAtom);
  const setViewport = useSetAtom(viewportAtom);

  const [moved, setMoved] = useState(false);

  const [viewportBounds, setViewportBounds] = useState(
    new Rectangle(0, 0, 0, 0)
  );

  const onBoundsChanged = useCallback((bounds: Rectangle) => {
    const [x, y] = worldToCell(bounds.x, bounds.y);
    const [width, height] = worldToCell(bounds.width, bounds.height);
    setViewportBounds(new Rectangle(x, y, width, height));
    setMoved(true);
  }, []);

  const { data: systems } = useSWR(
    ["querySolarSystemsInBounds", clientConfig, viewportBounds],
    () => querySolarSystemsInBounds(clientConfig, viewportBounds),
    {
      use: [swrLaggy],
    }
  );

  useEffectOnceWhen(() => {
    if (selectedSolarSystem && !moved) {
      const [worldX, worldY] = cellToWorld(
        selectedSolarSystem.x,
        selectedSolarSystem.y
      );
      setViewport((vp) => ({
        x: worldX,
        y: worldY,
        scale: vp.scale,
      }));
    }
  }, !!selectedSolarSystem);

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
            pointertap={() => onWarp(sid)}
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
      onBoundsChanged={onBoundsChanged}
      clamp
      clampScale={{
        minScale: 1,
        maxScale: 5,
      }}
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
