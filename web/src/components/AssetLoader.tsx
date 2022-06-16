if (import.meta.hot) {
  // force full reload if changed
  import.meta.hot.accept(() => import.meta.hot?.invalidate());
}

import { PixiLoader } from "@/components/PixiLoader";
import spritesheetData from "@assets/sprites/spritesheet.json";
import spritesheetUrl from "@assets/sprites/spritesheet.png";
import { useApp } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import { createContext, useEffect, useState } from "react";

export type Assets = {
  spritesheet: PIXI.Spritesheet;
};

export const AssetContext = createContext({} as Assets);

type Props = {
  children: React.ReactNode;
};

const createSpritesheet = (
  texture: PIXI.Texture,
  data: PIXI.ISpritesheetData
): Promise<PIXI.Spritesheet> =>
  new Promise((resolve) => {
    const spritesheet = new PIXI.Spritesheet(texture, data);
    spritesheet.parse(() => {
      resolve(spritesheet);
    });
  });

const loadTexture = (
  app: PIXI.Application,
  url: string
): Promise<PIXI.Texture> =>
  new Promise((resolve, reject) => {
    const maybeResource = app.loader.resources[url];
    if (maybeResource?.texture) {
      return resolve(maybeResource.texture);
    }

    app.loader.add(url).load((_, resources) => {
      const resource = resources[url];
      if (resource?.texture) {
        resolve(resource.texture);
      }
      reject(new Error(`failed to load texture at url: ${url}`));
    });
  });

export const AssetLoader = ({ children }: Props) => {
  const app = useApp();
  const [assets, setAssets] = useState<null | Assets>(null);

  useEffect(() => {
    setAssets(null);
    (async () => {
      const texture = await loadTexture(app, spritesheetUrl);
      const spritesheet = await createSpritesheet(texture, spritesheetData);
      setAssets({ spritesheet });
    })();
  }, [app]);

  if (!assets) {
    return <PixiLoader />;
  }

  return (
    <AssetContext.Provider value={assets}>{children}</AssetContext.Provider>
  );
};
