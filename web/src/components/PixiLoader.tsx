import { colors } from "@/theme";
import { Container, Sprite, Text, useApp, useTick } from "@inlet/react-pixi";
import { TextStyle } from "pixi.js";
import { useState } from "react";

export const PixiLoader = () => {
  const [rotation, setRotation] = useState(0);

  const app = useApp();
  useTick((_, ticker) => {
    const t = ticker.lastTime;
    setRotation(Math.sin(t / 1000 + Math.PI * 2) * 10);
  });

  return (
    <Container x={app.screen.width / 2} y={app.screen.height / 2}>
      <Sprite
        image="https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png"
        anchor={0.5}
        scale={5}
        rotation={rotation}
      />
      <Text
        text="Loading..."
        x={-50}
        y={120}
        style={
          new TextStyle({
            fontSize: 20,
            fontFamily: '"Source Code ProVariable", monospace',
            fill: colors.white,
          })
        }
      />
    </Container>
  );
};
