import { AssetContext } from "@/components/AssetLoader";
import { DebugGrid } from "@/components/DebugGrid";
import { SpriteGrid } from "@/components/SpriteGrid";
import { Viewport } from "@/components/Viewport";
import { CELL_SIZE_PX, SOLAR_SYSTEM_SIZE_PX } from "@/data/coordinates";
import { Container, TilingSprite } from "@inlet/react-pixi";
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
      <DebugGrid width={SOLAR_SYSTEM_SIZE_PX} height={SOLAR_SYSTEM_SIZE_PX} />
      <Container x={CELL_SIZE_PX*30} y={CELL_SIZE_PX*30}>
        <SpriteGrid />
      </Container>
      <Container x={CELL_SIZE_PX*44} y={CELL_SIZE_PX*30}>
        <SpriteGrid selected />
      </Container>

      {/* <PixiLoader /> */}

      {/* <WarpTransition
      
        durationMS={3000}
        onComplete={() => console.log("warp complete")}
        x={500}
        y={500}
        width={500}
        height={500}
      /> */}
    </Viewport>
  );
};
