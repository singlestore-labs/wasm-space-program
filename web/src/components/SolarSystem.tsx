import { AssetContext } from "@/components/AssetLoader";
import { DebugGrid } from "@/components/DebugGrid";
import { DebugOnly } from "@/components/DebugOnly";
import { EntityTracker } from "@/components/EntityTracker";
import { Minimap } from "@/components/Minimap";
import { Viewport } from "@/components/Viewport";
import { clientConfigAtom } from "@/data/atoms";
import { SOLAR_SYSTEM_SIZE_PX } from "@/data/coordinates";
import { queryEntities } from "@/data/queries";
import { useSolarSystemIndexes } from "@/hooks/useSolarSystemIndexes";
import { Container, TilingSprite } from "@inlet/react-pixi";
import { useAtomValue } from "jotai";
import { Rectangle } from "pixi.js";
import { useContext, useState } from "react";
import useSWR from "swr";

type Props = {
  sid: number;
  width: number;
  height: number;
  onOpenMap: () => void;
};

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 200;
const MINIMAP_MARGIN = 16;

export const SOLAR_SYSTEM_MARGIN_PX = 800;
const WORLD_SIZE_PX = SOLAR_SYSTEM_SIZE_PX + SOLAR_SYSTEM_MARGIN_PX * 2;

export const SolarSystem = (props: Props) => {
  const { width, height, sid, onOpenMap } = props;

  const { starsTile } = useContext(AssetContext);
  const clientConfig = useAtomValue(clientConfigAtom);

  const { data: entities } = useSWR(
    ["queryEntities", sid, clientConfig],
    () => queryEntities(clientConfig, sid),
    {
      refreshInterval: 1000,
    }
  );

  const { explosionIndex, cells } = useSolarSystemIndexes(entities);
  const [viewportBounds, setViewportBounds] = useState<Rectangle | undefined>();

  let minimapViewportBounds: Rectangle | undefined;
  if (viewportBounds) {
    const { x, y, width, height } = viewportBounds;
    const ssx = Math.max(SOLAR_SYSTEM_MARGIN_PX, x) - SOLAR_SYSTEM_MARGIN_PX;
    const ssy = Math.max(SOLAR_SYSTEM_MARGIN_PX, y) - SOLAR_SYSTEM_MARGIN_PX;
    const w =
      ssx + width > SOLAR_SYSTEM_SIZE_PX ? SOLAR_SYSTEM_SIZE_PX - ssx : width;
    const h =
      ssy + height > SOLAR_SYSTEM_SIZE_PX ? SOLAR_SYSTEM_SIZE_PX - ssy : height;
    const scaleX = MINIMAP_WIDTH / SOLAR_SYSTEM_SIZE_PX;
    const scaleY = MINIMAP_HEIGHT / SOLAR_SYSTEM_SIZE_PX;

    minimapViewportBounds = new Rectangle(
      ssx * scaleX,
      ssy * scaleY,
      w * scaleX,
      h * scaleY
    );
  }

  return (
    <>
      <Viewport
        screenHeight={height}
        screenWidth={width}
        worldHeight={WORLD_SIZE_PX}
        worldWidth={WORLD_SIZE_PX}
        onBoundsChanged={setViewportBounds}
        clamp
      >
        <TilingSprite
          texture={starsTile}
          width={WORLD_SIZE_PX}
          height={WORLD_SIZE_PX}
          tilePosition={[0, 0]}
          tileScale={[1, 1]}
        />
        <Container
          x={SOLAR_SYSTEM_MARGIN_PX}
          y={SOLAR_SYSTEM_MARGIN_PX}
          width={SOLAR_SYSTEM_SIZE_PX}
          height={SOLAR_SYSTEM_SIZE_PX}
        >
          <DebugOnly>
            <DebugGrid
              width={SOLAR_SYSTEM_SIZE_PX}
              height={SOLAR_SYSTEM_SIZE_PX}
            />
          </DebugOnly>
          <EntityTracker cells={cells} explosionIndex={explosionIndex} />
        </Container>
      </Viewport>

      <Minimap
        x={width - MINIMAP_WIDTH - MINIMAP_MARGIN}
        y={height - MINIMAP_HEIGHT - MINIMAP_MARGIN}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        onOpenMap={onOpenMap}
        cells={cells}
        viewport={minimapViewportBounds}
      />
    </>
  );
};
