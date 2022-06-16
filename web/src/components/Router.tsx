import { SolarSystem } from "@/components/SolarSystem";
import { cidAtom } from "@/data/atoms";
import { useWindowSize } from "@/hooks/useWindowSize";
import { colors } from "@/theme";
import { Text } from "@inlet/react-pixi";
import { useAtomValue } from "jotai";
import { TextStyle } from "pixi.js";

export const Router = () => {
  const { width, height } = useWindowSize();

  // determine if we are looking at a particular solar system or the entire universe
  const cid = useAtomValue(cidAtom);

  return cid !== null ? (
    <SolarSystem width={width} height={height} cid={cid} />
  ) : (
    <Text
      text="universe coming soon"
      style={new TextStyle({ fontSize: 50, fill: colors.primary })}
    />
  );
};
