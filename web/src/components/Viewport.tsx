import { viewportAtom } from "@/data/atoms";
import { PixiComponent, useApp } from "@inlet/react-pixi";
import { useAtom } from "jotai";
import { Viewport as PixiViewport } from "pixi-viewport";
import * as PIXI from "pixi.js";

type ViewportProps = {
  screenWidth: number;
  screenHeight: number;
  worldWidth: number;
  worldHeight: number;

  children?: React.ReactNode;
};

type PixiComponentViewportProps = ViewportProps & {
  app: PIXI.Application;

  initialX: number;
  initialY: number;
  initialScale: number;

  setViewport: (viewport: { x: number; y: number; scale: number }) => void;
};

const PixiComponentViewport = PixiComponent("Viewport", {
  create: (props: PixiComponentViewportProps) => {
    const { screenWidth, screenHeight, worldWidth, worldHeight, app } = props;
    const viewport = new PixiViewport({
      screenWidth,
      screenHeight,
      worldWidth,
      worldHeight,
      ticker: app.ticker,
      interaction: app.renderer.plugins.interaction,
    });

    viewport.drag().pinch().wheel().clampZoom({
      minScale: 0.1,
      maxScale: 10,
    });

    // set initial values
    viewport.setZoom(props.initialScale);
    viewport.moveCorner(props.initialX, props.initialY);

    viewport.on("moved-end", (viewport: PixiViewport) => {
      const {
        corner: { x, y },
        scale: { _x: scale },
      } = viewport;
      props.setViewport({ x, y, scale });
    });

    return viewport;
  },
});

export const Viewport = (props: ViewportProps) => {
  const [{ x, y, scale }, setViewport] = useAtom(viewportAtom);
  const app = useApp();

  return (
    <PixiComponentViewport
      app={app}
      setViewport={setViewport}
      initialScale={scale}
      initialX={x}
      initialY={y}
      {...props}
    />
  );
};
