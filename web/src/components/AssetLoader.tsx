if (import.meta.hot) {
  // force full reload if changed
  import.meta.hot.accept(() => import.meta.hot?.invalidate());
}

import { PixiLoader } from "@/components/PixiLoader";
import spritesheetData from "@assets/sprites/spritesheet.json";
import spritesheetUrl from "@assets/sprites/spritesheet.png";
import starsTileUrl from "@assets/stars_tile.png";
import { useApp } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import { createContext, useEffect, useState } from "react";

export const AssetContext = createContext({} as Assets);

export type Assets = {
  spritesheet: PIXI.Spritesheet;
  starsTile: PIXI.Texture;
};
type AssetName = keyof Assets;

type Props = {
  children: React.ReactNode;
};

const loadTextures = (
  app: PIXI.Application,
  urls: { [key in AssetName]: string }
): Promise<{ [key in AssetName]: PIXI.Texture }> =>
  new Promise((resolve, reject) => {
    for (const [name, url] of Object.entries(urls)) {
      app.loader.add(name, url);
    }

    app.loader.load((_, resources) => {
      const out = {} as { [key in AssetName]: PIXI.Texture };
      for (const name of Object.keys(urls)) {
        const maybeTexture = resources[name]?.texture;
        if (maybeTexture) {
          out[name as AssetName] = maybeTexture;
        } else {
          reject(new Error(`failed to load texture: ${name}`));
        }
      }
      resolve(out);
    });
  });

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

const initializeAssets = async (textures: {
  [key in AssetName]: PIXI.Texture;
}): Promise<Assets> => {
  const spritesheet = await createSpritesheet(
    textures.spritesheet,
    spritesheetData
  );
  return {
    spritesheet,
    starsTile: textures.starsTile,
  };
};

export const AssetLoader = ({ children }: Props) => {
  const app = useApp();
  const [assets, setAssets] = useState<null | Assets>(null);

  useEffect(() => {
    setAssets(null);
    (async () => {
      const textures = await loadTextures(app, {
        spritesheet: spritesheetUrl,
        starsTile: starsTileUrl,
      });
      const assets = await initializeAssets(textures);
      setAssets(assets);
    })();
  }, [app]);

  if (!assets) {
    return <PixiLoader />;
  }

  return (
    <AssetContext.Provider value={assets}>{children}</AssetContext.Provider>
  );
};
