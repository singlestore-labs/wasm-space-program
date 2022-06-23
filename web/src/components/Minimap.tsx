import { Container, Graphics, Text } from "@inlet/react-pixi";
import { Rectangle, TextStyle } from "pixi.js";
import { useState } from "react";

type Props = {
  onOpenMap: () => void;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const Minimap = ({ onOpenMap, x, y, width, height }: Props) => {
  const [hovering, setHovering] = useState(false);

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
      <Graphics
        draw={(g) => {
          g.clear();
          g.beginFill(0x1e0a78);
          g.drawRect(0, 0, width, height);
          g.endFill();
        }}
      />
      {hoverOverlay}
    </Container>
  );
};
