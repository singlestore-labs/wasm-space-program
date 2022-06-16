import {
  Bounds,
  boundsContains,
  CELL_SIZE_PX,
  SOLAR_SYSTEM_SIZE_PX,
  worldToCell,
} from "@/data/coordinates";
import { colors, colorToNumber } from "@/theme";
import { Graphics } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import { useCallback } from "react";

type Props = {
  highlightCells?: Bounds | null;
};

export const DebugGrid = ({ highlightCells }: Props) => (
  <Graphics
    draw={useCallback(
      (g: PIXI.Graphics) => {
        g.clear();
        g.lineStyle(4, colorToNumber(colors.white), 0.25);
        for (let x = 0; x < SOLAR_SYSTEM_SIZE_PX; x += CELL_SIZE_PX) {
          for (let y = 0; y < SOLAR_SYSTEM_SIZE_PX; y += CELL_SIZE_PX) {
            const [xCell, yCell] = worldToCell(x, y);
            if (
              highlightCells &&
              boundsContains(highlightCells, xCell, yCell)
            ) {
              g.beginFill(colorToNumber(colors.red[900]), 1);
              g.drawRect(x, y, CELL_SIZE_PX, CELL_SIZE_PX);
              g.endFill();
            }

            // move to the bottom left of the cell
            g.moveTo(x, y + CELL_SIZE_PX);
            // draw line to top left of the cell
            g.lineTo(x, y);
            // draw line to top right of the cell
            g.lineTo(x + CELL_SIZE_PX, y);
            // if we are drawing the last column, draw a line to the bottom right of the cell
            if (x === SOLAR_SYSTEM_SIZE_PX - CELL_SIZE_PX) {
              g.lineTo(x + CELL_SIZE_PX, y + CELL_SIZE_PX);
            }
            // if we are drawing the last row, draw a line to the bottom left of the cell
            if (y === SOLAR_SYSTEM_SIZE_PX - CELL_SIZE_PX) {
              // move to bottom left
              g.moveTo(x, y + CELL_SIZE_PX);
              // draw to bottom right
              g.lineTo(x + CELL_SIZE_PX, y + CELL_SIZE_PX);
            }
          }
        }
      },
      [highlightCells]
    )}
  />
);
