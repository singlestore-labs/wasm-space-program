import { Viewport } from "@/components/Viewport";
import { colors, colorToNumber } from "@/theme";
import { useConst } from "@chakra-ui/react";
import { Graphics, Sprite } from "@inlet/react-pixi";
import spaceshipUrl from "assets/spaceship.svg";
import * as PIXI from "pixi.js";
import { useCallback } from "react";

const GRID_SIZE = 40; // px, square
const SIZE = 100; // grid cells, square

type Props = {
  width: number;
  height: number;
};

const randomCell = () => {
  const x = Math.floor(Math.random() * SIZE) * GRID_SIZE;
  const y = Math.floor(Math.random() * SIZE) * GRID_SIZE;
  return { x, y };
};

export const SolarSystem = (props: Props) => {
  const { width, height } = props;

  const worldWidth = SIZE * GRID_SIZE;
  const worldHeight = SIZE * GRID_SIZE;

  const ships = useConst(() =>
    Array.from({ length: 1000 }, () => randomCell()).map(({ x, y }, idx) => (
      <Sprite key={idx} x={x} y={y} height={GRID_SIZE} image={spaceshipUrl} />
    ))
  );

  return (
    <Viewport
      screenHeight={height}
      screenWidth={width}
      worldHeight={worldHeight}
      worldWidth={worldWidth}
    >
      <Graphics
        draw={useCallback((g: PIXI.Graphics) => {
          g.clear();
          g.lineStyle(1, colorToNumber(colors.white), 1);
          for (let x = 0; x < worldWidth; x += GRID_SIZE) {
            for (let y = 0; y < worldHeight; y += GRID_SIZE) {
              g.moveTo(x, y + GRID_SIZE);
              g.lineTo(x, y);
              g.lineTo(x + GRID_SIZE, y);
            }
          }
        }, [])}
      />
      {ships}
    </Viewport>
  );
};
