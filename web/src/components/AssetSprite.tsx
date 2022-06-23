import { AssetContext } from "@/components/AssetLoader";
import { CELL_SIZE_PX } from "@/data/coordinates";
import { Sprite } from "@inlet/react-pixi";
import { ComponentProps, useContext } from "react";

export const Sprites = {
  ship: [
    "AI_Entity_Opt4",
    "AI_Entity_Opt5",
    "AI_Entity_Opt6",
    "AI_Entity_Opt7",
  ] as const,
  shipEmpowered: [
    "AI_Entity_Opt4A_Powerup",
    "AI_Entity_Opt5A_Powerup",
    "AI_Entity_Opt6A_Powerup",
    "AI_Entity_Opt7A_Powerup",
  ] as const,
  battle: ["Battle_Token_Opt2"] as const,
  explosion: ["Battle_Token_Opt3"] as const,
  energyNode: [
    "Power_Source_Opt2",
    "Power_Source_Opt3",
    "Power_Source_Opt4",
  ] as const,
  wormhole: ["Wormhole_Opt1", "Wormhole_Opt2", "Wormhole_Opt3"] as const,
  solarSystem: ["SolarS_Opt1", "SolarS_Opt3"] as const,
};

export type SpriteName = keyof typeof Sprites;

type Props = {
  name: SpriteName;
  variantIdx?: number;
  x: number;
  y: number;
} & ComponentProps<typeof Sprite>;

export const AssetSprite = ({ name, variantIdx = 0, x, y, ...rest }: Props) => {
  const { spritesheet } = useContext(AssetContext);
  const variant = Sprites[name][variantIdx % Sprites[name].length];
  const fullName = `${variant}_2x.png`;
  const texture = spritesheet.textures[fullName];

  let width: number, height: number;
  if (texture.width > texture.height) {
    width = CELL_SIZE_PX;
    height = (CELL_SIZE_PX * texture.height) / texture.width;
  } else {
    width = (CELL_SIZE_PX * texture.width) / texture.height;
    height = CELL_SIZE_PX;
  }

  return (
    <Sprite
      roundPixels
      texture={texture}
      width={width}
      height={height}
      anchor={[0.5, 0.5]}
      x={x + CELL_SIZE_PX / 2}
      y={y + CELL_SIZE_PX / 2}
      {...rest}
    />
  );
};
