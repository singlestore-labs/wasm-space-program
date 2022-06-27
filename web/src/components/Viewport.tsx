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
  clamp?: boolean;

  onBoundsChanged?: (bounds: PIXI.Rectangle) => void;
  onScaleChanged?: (scale: number) => void;

  children?: React.ReactNode;
};

type PixiComponentViewportProps = ViewportProps & {
  app: PIXI.Application;

  x: number;
  y: number;
  scale: number;

  setViewport: (viewport: { x: number; y: number; scale: number }) => void;
};

const PixiComponentViewport = PixiComponent("Viewport", {
  create: (props: PixiComponentViewportProps) => {
    const { screenWidth, screenHeight, worldWidth, worldHeight, clamp, app } =
      props;

    const viewport = new PixiViewport({
      screenWidth,
      screenHeight,
      worldWidth,
      worldHeight,
      ticker: app.ticker,
      interaction: app.renderer.plugins.interaction,
    });

    viewport.drag().pinch().wheel().clampZoom({
      minScale: 0.3,
      maxScale: 5,
    });

    if (clamp) {
      viewport.clamp({
        left: 0,
        right: worldWidth,
        top: 0,
        bottom: worldHeight,
        direction: "all",
        underflow: "center",
      });
    }

    // set initial values
    viewport.setZoom(props.scale);
    viewport.moveCenter(props.x, props.y);

    // trigger callbacks on initial values
    props.onBoundsChanged?.(viewport.getVisibleBounds());
    props.onScaleChanged?.(viewport.scale.x);

    viewport.on("moved-end", (viewport: PixiViewport) => {
      const {
        center: { x, y },
        scale: { _x: scale },
      } = viewport;
      props.setViewport({ x, y, scale });
      props.onBoundsChanged?.(viewport.getVisibleBounds());
      props.onScaleChanged?.(viewport.scale.x);
    });

    return viewport;
  },

  applyProps(instance, oldProps, newProps) {
    if (oldProps.scale !== newProps.scale) {
      instance.setZoom(newProps.scale);
    }
    if (oldProps.x !== newProps.x || oldProps.y !== newProps.y) {
      instance.moveCenter(newProps.x, newProps.y);
    }
    if (
      oldProps.screenWidth !== newProps.screenWidth ||
      oldProps.screenHeight !== newProps.screenHeight
    ) {
      instance.resize(newProps.screenWidth, newProps.screenHeight);
    }
  },
});

export const Viewport = (props: ViewportProps) => {
  const [{ x, y, scale }, setViewport] = useAtom(viewportAtom);
  const app = useApp();

  return (
    <PixiComponentViewport
      app={app}
      setViewport={setViewport}
      scale={scale}
      x={x}
      y={y}
      {...props}
    />
  );
};
