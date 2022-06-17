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
  cid: number;
  width: number;
  height: number;
};

export const SolarSystem = (props: Props) => {
  const { width, height, cid } = props;

  const { starsTile } = useContext(AssetContext);
  const clientConfig = useAtomValue(clientConfigAtom);

  const { data: entities } = useSWR(
    ["queryEntities", cid],
    () => queryEntities(clientConfig, cid),
    {
      refreshInterval: 1000,
      dedupingInterval: 10,
    }
  );

  return (
    <Viewport
      screenHeight={height}
      screenWidth={width}
      worldHeight={SOLAR_SYSTEM_SIZE_PX}
      worldWidth={SOLAR_SYSTEM_SIZE_PX}
      clamp
    >
      <TilingSprite
        texture={starsTile}
        width={SOLAR_SYSTEM_SIZE_PX}
        height={SOLAR_SYSTEM_SIZE_PX}
        tilePosition={[0, 0]}
        tileScale={[1, 1]}
      />
      <DebugOnly>
        <DebugGrid />
      </DebugOnly>
      <Container sortableChildren>
        {entities && <EntityTracker entities={entities} />}
      </Container>
    </Viewport>
  );
};
