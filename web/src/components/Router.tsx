import { DebugPlayground } from "@/components/DebugPlayground";
import { SolarSystem } from "@/components/SolarSystem";
import { debugPlaygroundAtom, sidAtom } from "@/data/atoms";
import { useWindowSize } from "@/hooks/useWindowSize";
import { colors } from "@/theme";
import { Text } from "@inlet/react-pixi";
import { useAtomValue } from "jotai";
import { TextStyle } from "pixi.js";

export const Router = () => {
  const { width, height } = useWindowSize();

  const sid = useAtomValue(sidAtom);
  const debugPlayground = useAtomValue(debugPlaygroundAtom);

  if (debugPlayground) {
    return <DebugPlayground width={width} height={height} />;
  }

  // determine if we are looking at a particular solar system or the entire universe
  return sid !== null ? (
    <SolarSystem width={width} height={height} sid={sid} />
  ) : (
    <Text
      text="universe coming soon"
      style={new TextStyle({ fontSize: 50, fill: colors.primary })}
    />
  );
};
