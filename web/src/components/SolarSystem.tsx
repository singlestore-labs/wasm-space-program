import { DebugGrid } from "@/components/DebugGrid";
import { DebugOnly } from "@/components/DebugOnly";
import { Viewport } from "@/components/Viewport";
import { clientConfigAtom } from "@/data/atoms";
import {
  Bounds,
  SOLAR_SYSTEM_SIZE_PX,
  worldToCellBounds,
} from "@/data/coordinates";
import { queryEntitiesInBounds } from "@/data/queries";
import { useAtomValue } from "jotai";
import { useCallback, useState } from "react";
import useSWR from "swr";

type Props = {
  cid: number;
  width: number;
  height: number;
};

export const SolarSystem = (props: Props) => {
  const { width, height, cid } = props;
  const [bounds, setBounds] = useState<Bounds | null>(null);

  const onBoundsChanged = useCallback(
    (bounds: Bounds) => setBounds(worldToCellBounds(bounds)),
    []
  );

  const clientConfig = useAtomValue(clientConfigAtom);
  const { data } = useSWR(["entitiesInBounds", cid, bounds], () => {
    if (bounds) {
      return queryEntitiesInBounds(clientConfig, cid, bounds);
    }
  });

  // TODO: display entities!
  // console.log(data);

  return (
    <Viewport
      screenHeight={height}
      screenWidth={width}
      worldHeight={SOLAR_SYSTEM_SIZE_PX}
      worldWidth={SOLAR_SYSTEM_SIZE_PX}
      onBoundsChanged={onBoundsChanged}
    >
      <DebugOnly>
        <DebugGrid highlightCells={bounds} />
      </DebugOnly>
    </Viewport>
  );
};
