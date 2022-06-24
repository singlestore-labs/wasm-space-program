import { WarpSpeed } from "@/components/WarpSpeed";
import { useEase } from "@/hooks/useEase";
import { useWindowSize } from "@/hooks/useWindowSize";
import { Container, Sprite, Text } from "@inlet/react-pixi";
import logoUrl from "assets/sprites/Logo1A_V1.png";
import { easeExpInOut } from "d3-ease";
import { TextStyle } from "pixi.js";

const EASE_OLIVER = (x: number) => 1 - Math.exp(-Math.exp((x - 0.8) / 0.07));

export const PixiLoader = () => {
  const { width, height } = useWindowSize();

  const { value: rotation, progress } = useEase(
    (t) => {
      if (t < 0.5) {
        return EASE_OLIVER(t * 2);
      }
      return 1 - easeExpInOut((t - 0.5) * 2);
    },
    {
      duration: 4000,
      initialValue: 0,
      loop: true,
    }
  );

  const dots = ".".repeat(Math.ceil(progress * 20) % 4).padEnd(3, " ");

  return (
    <Container x={width / 2} y={height / 2}>
      <WarpSpeed
        x={-(width / 2)}
        y={-(height / 2)}
        alpha={0.2}
        width={width}
        height={height}
        speed={0.5}
      />
      <Sprite
        image={logoUrl}
        anchor={0.5}
        scale={2 + rotation * 0.3}
        rotation={rotation * Math.PI * 32}
        // alpha={0.4 + rotation}
      />
      <Text
        anchor={0.5}
        y={240}
        x={30}
        text={"loading" + dots}
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
};
