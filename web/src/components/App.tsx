import { SolarSystem } from "@/components/SolarSystem";
import { useWindowSize } from "@/hooks/useWindowSize";
import { colors, colorToNumber } from "@/theme";
import { Center, Flex, Spinner } from "@chakra-ui/react";
import { Stage } from "@inlet/react-pixi";
import { Suspense } from "react";

export const App = () => {
  const { width, height } = useWindowSize();
  const loadingFallback = (
    <Center height="100vh">
      <Spinner
        size="xl"
        speed="0.85s"
        thickness="3px"
        emptyColor="neutral.200"
        color="primary"
      />
    </Center>
  );

  return (
    <Suspense fallback={loadingFallback}>
      <Flex height="100vh" direction="column">
        <Stage
          width={width}
          height={height}
          options={{
            backgroundColor: colorToNumber(colors.black),
            resolution: 2,
            antialias: true,
            autoDensity: true,
          }}
        >
          <SolarSystem width={width} height={height} />
        </Stage>
      </Flex>
    </Suspense>
  );
};
