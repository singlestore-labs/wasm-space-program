import { AssetContext } from "@/components/AssetLoader";
import { DebugGrid } from "@/components/DebugGrid";
import { Entity } from "@/components/Entity";
import { SpriteGrid } from "@/components/SpriteGrid";
import { Viewport } from "@/components/Viewport";
import { SOLAR_SYSTEM_SIZE_PX } from "@/data/coordinates";
import { EntityKind } from "@/data/queries";
import { TilingSprite } from "@inlet/react-pixi";
import { useContext } from "react";

type Props = {
  width: number;
  height: number;
};
export const DebugPlayground = ({ width, height }: Props) => {
  const { starsTile } = useContext(AssetContext);

  return (
    <Viewport
      screenHeight={height}
      screenWidth={width}
      worldHeight={10000}
      worldWidth={10000}
    >
      <TilingSprite
        texture={starsTile}
        width={SOLAR_SYSTEM_SIZE_PX}
        height={SOLAR_SYSTEM_SIZE_PX}
        tilePosition={[0, 0]}
        tileScale={[1, 1]}
      />
      <DebugGrid />
      <SpriteGrid />

      <Entity
        entity={{
          cid: 0,
          eid: 1,
          kind: EntityKind.Ship,
          x: 20,
          y: 20,
          energy: 0,
          shield: 0,
          blasters: 0,
          harvesters: 0,
          thrusters: 0,
        }}
      />
    </Viewport>
  );
};
