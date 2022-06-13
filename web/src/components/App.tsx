import { Universe } from "@/components/Universe";
import { Center, Flex, Spinner } from "@chakra-ui/react";
import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

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
        <Routes>
          <Route path="/" element={<Universe />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Flex>
    </Suspense>
  );
};
