import {
  Bounds,
  boundsContains,
  CELL_SIZE_PX,
  worldToCell,
} from "@/data/coordinates";
import { colors, colorToNumber } from "@/theme";
import { Graphics } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import { useCallback } from "react";

type Props = {
  highlightCells?: Bounds | null;
  width: number;
  height: number;
};

const gridColor = colorToNumber(colors.purple[500]);
const gridAlpha = 0.25;
const gridLineWidth = 2;
const highlightTint = colorToNumber(colors.red[900]);

export const DebugGrid = ({ highlightCells, width, height }: Props) => (
  <Graphics
    draw={useCallback(
      (g: PIXI.Graphics) => {
        g.clear();
        g.lineStyle(gridLineWidth, gridColor, gridAlpha);
        for (let x = 0; x < width; x += CELL_SIZE_PX) {
          for (let y = 0; y < height; y += CELL_SIZE_PX) {
            const [xCell, yCell] = worldToCell(x, y);
            if (
              highlightCells &&
              boundsContains(highlightCells, xCell, yCell)
            ) {
              g.beginFill(highlightTint, 0.2);
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
            if (x === width - CELL_SIZE_PX) {
              g.lineTo(x + CELL_SIZE_PX, y + CELL_SIZE_PX);
            }
            // if we are drawing the last row, draw a line to the bottom left of the cell
            if (y === height - CELL_SIZE_PX) {
              // move to bottom left
              g.moveTo(x, y + CELL_SIZE_PX);
              // draw to bottom right
              g.lineTo(x + CELL_SIZE_PX, y + CELL_SIZE_PX);
            }
          }
        }
      },
      [height, highlightCells, width]
    )}
  />
);
