import { DebugGrid } from "@/components/DebugGrid";
import { DebugOnly } from "@/components/DebugOnly";
import { Entity } from "@/components/Entity";
import { SpriteGrid } from "@/components/SpriteGrid";
import { Viewport } from "@/components/Viewport";
import { clientConfigAtom, followEntityAtom } from "@/data/atoms";
import { SOLAR_SYSTEM_SIZE_PX } from "@/data/coordinates";
import { queryEntities } from "@/data/queries";
import { Container } from "@inlet/react-pixi";
import { useAtomValue } from "jotai";
import useSWR from "swr";

type Props = {
  cid: number;
  width: number;
  height: number;
};

export const SolarSystem = (props: Props) => {
  const { width, height, cid } = props;
  // const [bounds, setBounds] = useState<Bounds | null>(null);

  // const onBoundsChanged = useCallback(
  //   (bounds: Bounds) => setBounds(worldToCellBounds(bounds)),
  //   []
  // );

  const followEntity = useAtomValue(followEntityAtom);

  const clientConfig = useAtomValue(clientConfigAtom);
  const { data } = useSWR(
    ["entitiesInBounds", cid],
    () => {
      return queryEntities(clientConfig, cid);
    },
    {
      refreshInterval: 1000,
      dedupingInterval: 10,
    }
  );

  const entities = [];
  if (data) {
    for (const entity of data) {
      entities.push(
        <Entity
          key={entity.eid}
          entity={entity}
          follow={entity.eid === followEntity}
        />
      );
    }
  }

  return (
    <Viewport
      screenHeight={height}
      screenWidth={width}
      worldHeight={SOLAR_SYSTEM_SIZE_PX}
      worldWidth={SOLAR_SYSTEM_SIZE_PX}
      // onBoundsChanged={onBoundsChanged}
    >
      <DebugOnly>
        <DebugGrid />
        <Container y={-140}>
          <SpriteGrid />
        </Container>
      </DebugOnly>
      <Container sortableChildren>{entities}</Container>
    </Viewport>
  );
};
