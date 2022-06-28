import { BaseAssetSprite } from "@/components/AssetSprite";
import { WarpSpeed } from "@/components/WarpSpeed";
import { colors } from "@/theme";
import { Container, Text, useTick } from "@inlet/react-pixi";
import { Rectangle, TextStyle } from "pixi.js";
import { useState } from "react";

type Props = {
  onEnter: () => void;
  width: number;
  height: number;
};

export const WelcomeScreen = ({ onEnter, width, height }: Props) => {
  const [hover, setHover] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [blink, setBlink] = useState(false);

  useTick((delta, ticker) => {
    setBlink(ticker.lastTime % 1000 < 500);
    if (hover && speed < 0.8) {
      setSpeed(speed + 0.02 * delta);
    } else if (!hover && speed > 0) {
      setSpeed(Math.max(0, speed - 0.02 * delta));
    }
  });

  return (
    <>
      <WarpSpeed width={width} height={height} speed={speed} />
      <Container
        pointerdown={onEnter}
        interactive
        buttonMode
        pointerover={() => setHover(true)}
        pointerout={() => setHover(false)}
        hitArea={new Rectangle(0, 0, width, height)}
      >
        <BaseAssetSprite
          name="logo"
          x={width / 2}
          y={height / 2}
          anchor={0.5}
          width={150}
          height={150}
        />
        <Text
          x={width / 2}
          y={height / 2 + 100}
          anchor={0.5}
          text="Wasm Space Program"
          style={
            new TextStyle({
              fontFamily: "Source Code ProVariable",
              fontWeight: "600",
              fontSize: 35,
              fill: colors.primary,
              align: "center",
            })
          }
          isSprite
        />
        <Text
          x={width / 2}
          y={height / 2 + 145}
          anchor={0.5}
          text="<click to enter>"
          alpha={blink ? 0.5 : 1}
          style={
            new TextStyle({
              fontFamily: "Source Code ProVariable",
              fontWeight: "600",
              fontSize: 25,
              fill: colors.primary,
              align: "center",
            })
          }
          isSprite
        />
      </Container>
    </>
  );
};
