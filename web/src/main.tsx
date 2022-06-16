import { AssetLoader } from "@/components/AssetLoader";
import { ErrorBoundary, ErrorOverlay } from "@/components/ErrorOverlay";
import { PixiLoader } from "@/components/PixiLoader";
import { Router } from "@/components/Router";
import { useWindowSize } from "@/hooks/useWindowSize";
import { ChakraProvider } from "@chakra-ui/react";
import { Stage } from "@inlet/react-pixi";
import React, { Suspense } from "react";
import { render } from "react-dom";
import { chakraTheme, colors, colorToNumber } from "./theme";

const PixiRoot = ({ children }: { children: React.ReactNode }) => {
  const { width, height } = useWindowSize();

  return (
    <div>
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
        {children}
      </Stage>
    </div>
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
        <PixiRoot>
          <ErrorBoundary>
            <Suspense fallback={<PixiLoader />}>
              <AssetLoader>
                <Router />
              </AssetLoader>
            </Suspense>
          </ErrorBoundary>
        </PixiRoot>
      </ErrorOverlay>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
