import { AssetContext } from "@/components/AssetLoader";
import { Sprite } from "@inlet/react-pixi";
import { ComponentProps, useContext } from "react";

export const Sprites = {
  ship: [
    "AI_Entity_Opt4",
    "AI_Entity_Opt5",
    "AI_Entity_Opt6",
    "AI_Entity_Opt7",
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
  size?: "1x" | "2x";
} & ComponentProps<typeof Sprite>;

export const AssetSprite = ({ name, size="1x", variantIdx = 0, ...rest }: Props) => {
  const { spritesheet } = useContext(AssetContext);
  const variant = Sprites[name][variantIdx % Sprites[name].length];
  const fullName = `${variant}_${size}.png`;
  return (
    <Sprite roundPixels texture={spritesheet.textures[fullName]} {...rest} />
  );
};
