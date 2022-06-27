import { SOLAR_SYSTEM_SIZE_CELLS } from "@/data/coordinates";
import { EntityKind } from "@/data/queries";
import { Cell } from "@/hooks/useSolarSystemIndexes";
import { Container, Graphics, Text } from "@inlet/react-pixi";
import { Graphics as PixiGraphics, Rectangle, TextStyle } from "pixi.js";
import { useCallback, useState } from "react";

type Props = {
  onOpenMap: () => void;
  x: number;
  y: number;
  width: number;
  height: number;
  cells: Cell[];
  viewport?: Rectangle;
};

export const Minimap = ({
  onOpenMap,
  x,
  y,
  width,
  height,
  cells,
  viewport,
}: Props) => {
  const [hovering, setHovering] = useState(false);
  const cellWidthPx = width / SOLAR_SYSTEM_SIZE_CELLS;
  const cellHeightPx = height / SOLAR_SYSTEM_SIZE_CELLS;

  const worldToMinimapCell = useCallback(
    (cellX: number, cellY: number) => {
      const x = cellX * cellWidthPx;
      const y = cellY * cellHeightPx;
      return [x, y] as const;
    },
    [cellWidthPx, cellHeightPx]
  );

  let hoverOverlay;
  if (hovering) {
    hoverOverlay = (
      <Container width={width} height={height}>
        <Graphics
          draw={(g) => {
            g.clear();

            // shade the minimap a bit
            g.beginFill(0x0, 0.1);
            g.drawRect(0, 0, width, height);
            g.endFill();
            g.lineStyle(2, 0xffffff, 1);

            // draw little arrow in top left
            const len = 8;
            g.moveTo(len, len * 2);
            g.lineTo(len, len);
            g.lineTo(len * 2, len);
            g.moveTo(len, len);
            g.lineTo(len * 2, len * 2);
          }}
        />
        <Text
          x={24}
          y={16}
          text="Universe Map"
          style={
            new TextStyle({
              fontFamily: "Source Code ProVariable",
              fontSize: 20,
              fill: 0xffffff,
            })
          }
        />
      </Container>
    );
  }

  const drawCells = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      // draw bg
      g.lineStyle({
        width: 3,
        color: 0x0,
        alignment: 1,
      });
      g.beginFill(0x1e0a78);
      g.drawRect(0, 0, width, height);
      g.endFill();

      // draw viewport
      if (viewport) {
        g.lineStyle({
          width: 1,
          color: 0xffffff,
          alignment: 1,
          native: true,
        });
        g.drawRect(viewport.x, viewport.y, viewport.width, viewport.height);
      }

      // reset linestyle
      g.lineStyle(0, 0, 0);

      // draw cells
      for (const cell of cells) {
        if (cell.kind === "entity") {
          const { entity } = cell;
          const [x, y] = worldToMinimapCell(entity.x, entity.y);
          if (entity.kind === EntityKind.EnergyNode) {
            g.beginFill(0x10e576);
          } else if (entity.kind === EntityKind.Ship) {
            g.beginFill(0xffffff);
          }
          g.drawRect(x, y, cellWidthPx, cellHeightPx);
        } else if (cell.kind === "battle") {
          const { entities } = cell;
          const entity0 = entities[0];
          const [x, y] = worldToMinimapCell(entity0.x, entity0.y);
          g.beginFill(0xff0000);
          g.drawRect(x, y, cellWidthPx, cellHeightPx);
        }
      }
    },
    [
      cellHeightPx,
      cellWidthPx,
      cells,
      height,
      viewport,
      width,
      worldToMinimapCell,
    ]
  );

  return (
    <Container
      x={x}
      y={y}
      width={width}
      height={height}
      interactive
      buttonMode
      hitArea={new Rectangle(0, 0, width, height)}
      pointerover={() => setHovering(true)}
      pointerout={() => setHovering(false)}
      pointerdown={onOpenMap}
    >
      <Graphics draw={drawCells} />
      {hoverOverlay}
    </Container>
  );
};
