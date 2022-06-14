import { SolarSystem } from "@/components/SolarSystem";
import { Center, Flex, Spinner } from "@chakra-ui/react";
import { Suspense } from "react";

export const App = () => {
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
        <SolarSystem />
      </Flex>
    </Suspense>
  );
};
