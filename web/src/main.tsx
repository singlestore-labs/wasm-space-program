import { AssetLoader } from "@/components/AssetLoader";
import { ErrorBoundary, ErrorOverlay } from "@/components/ErrorOverlay";
import { InfoOverlay } from "@/components/InfoOverlay";
import { PixiLoader } from "@/components/PixiLoader";
import { Router } from "@/components/Router";
import { useWindowSize } from "@/hooks/useWindowSize";
import { Center, ChakraProvider, Spinner, useConst } from "@chakra-ui/react";
import { Container, Stage } from "@inlet/react-pixi";
import { CRTFilter } from "@pixi/filter-crt";
import React, { Suspense } from "react";
import { render } from "react-dom";
import { chakraTheme } from "./theme";

const SimpleLoader = () => (
  <Center height="100vh">
    <Spinner
      size="xl"
      speed="0.85s"
      thickness="3px"
      emptyColor="gray.200"
      color="blue.500"
    />
  </Center>
);

const PixiRoot = ({ children }: { children: React.ReactNode }) => {
  const { width, height } = useWindowSize();
  const filter = useConst(
    () =>
      new CRTFilter({
        curvature: 10,
        lineWidth: 1.5,
        lineContrast: 0.4,
        seed: Math.random(),
        vignetting: 0.2,
        vignettingAlpha: 0.4,
        vignettingBlur: 0.7,
      })
  );

  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundColor: 0x17075a,
        resolution: 2,
        antialias: true,
        autoDensity: true,
      }}
    >
      <Container filters={[filter]}>{children}</Container>
    </Stage>
  );
};

/*
  BEFORE EDITING THE TREE BELOW
  READ ME!!!!!!!!!!!

  The <PixiRoot> component creates a NEW renderer which is contained within a Pixi Application.
  This means that context defined outside of the <PixiRoot> component will not be
  available to components within the <PixiRoot> component.

  Context sharing between renderers is still open as of React 18
  https://github.com/facebook/react/issues/13332

  Until then, you need to be absolutely careful to ensure that all of the
  context we need in the application is defined below PixiRoot (and works within a PixiRoot).

  In addition, any code that want's to render to the DOM must use React Portals.
*/
render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <ErrorOverlay>
        <ErrorBoundary>
          <Suspense fallback={<SimpleLoader />}>
            <InfoOverlay>
              <PixiRoot>
                <React.StrictMode>
                  <ErrorBoundary>
                    <Suspense fallback={<PixiLoader />}>
                      <AssetLoader>
                        <Router />
                      </AssetLoader>
                    </Suspense>
                  </ErrorBoundary>
                </React.StrictMode>
              </PixiRoot>
            </InfoOverlay>
          </Suspense>
        </ErrorBoundary>
      </ErrorOverlay>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
