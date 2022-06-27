import { AssetContext } from "@/components/AssetLoader";
import { DebugGrid } from "@/components/DebugGrid";
import { DebugOnly } from "@/components/DebugOnly";
import { EntityTracker } from "@/components/EntityTracker";
import { Viewport } from "@/components/Viewport";
import { clientConfigAtom } from "@/data/atoms";
import { SOLAR_SYSTEM_SIZE_PX } from "@/data/coordinates";
import { queryEntities } from "@/data/queries";
import { Container, TilingSprite } from "@inlet/react-pixi";
import { useAtomValue } from "jotai";
import { useContext } from "react";
import useSWR from "swr";

type Props = {
  sid: number;
  width: number;
  height: number;
};

const SOLAR_SYSTEM_MARGIN_PX = 800;
const WORLD_SIZE_PX = SOLAR_SYSTEM_SIZE_PX + SOLAR_SYSTEM_MARGIN_PX * 2;

export const SolarSystem = (props: Props) => {
  const { width, height, sid } = props;

  const { starsTile } = useContext(AssetContext);
  const clientConfig = useAtomValue(clientConfigAtom);

  const { data: entities } = useSWR(
    ["queryEntities", sid, clientConfig],
    () => queryEntities(clientConfig, sid),
    {
      refreshInterval: 1000,
      dedupingInterval: 10,
    }
  );

  return (
    <Viewport
      screenHeight={height}
      screenWidth={width}
      worldHeight={WORLD_SIZE_PX}
      worldWidth={WORLD_SIZE_PX}
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
        sortableChildren
      >
        <DebugOnly>
          <DebugGrid
            width={SOLAR_SYSTEM_SIZE_PX}
            height={SOLAR_SYSTEM_SIZE_PX}
          />
        </DebugOnly>
        {entities && <EntityTracker entities={entities} />}
      </Container>
    </Viewport>
  );
};
