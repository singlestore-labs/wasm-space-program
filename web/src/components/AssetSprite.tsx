import { AssetContext } from "@/components/AssetLoader";
import { CELL_SIZE_PX } from "@/data/coordinates";
import { Graphics, Sprite } from "@inlet/react-pixi";
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
  logo: ["Logo1A_V1"] as const,
};

export type SpriteName = keyof typeof Sprites;

export const SELECTED_COLORS_YELLOW = {
  fill: 0xfffade,
  stroke: 0xffb000,
};

export const SELECTED_COLORS_PINK = {
  fill: 0xffbfff,
  stroke: 0xff00ff,
};

const nameToSelectedColors = {
  ship: SELECTED_COLORS_PINK,
  shipEmpowered: SELECTED_COLORS_PINK,
  battle: SELECTED_COLORS_PINK,
  explosion: SELECTED_COLORS_PINK,
  energyNode: SELECTED_COLORS_PINK,
  wormhole: SELECTED_COLORS_PINK,
  solarSystem: SELECTED_COLORS_YELLOW,
  logo: SELECTED_COLORS_PINK,
};

type Props = {
  name: SpriteName;
  variantIdx?: number;
  x: number;
  y: number;
  selected?: boolean;
} & ComponentProps<typeof Sprite>;

export const AssetSprite = ({
  name,
  variantIdx = 0,
  x,
  y,
  selected,
  ...rest
}: Props) => {
  const { spritesheet } = useContext(AssetContext);
  const variant = Sprites[name][variantIdx % Sprites[name].length];
  const fullName = `${variant}.png`;
  const texture = spritesheet.textures[fullName];

  let width: number, height: number;
  if (texture.width > texture.height) {
    width = CELL_SIZE_PX;
    height = (CELL_SIZE_PX * texture.height) / texture.width;
  } else {
    width = (CELL_SIZE_PX * texture.width) / texture.height;
    height = CELL_SIZE_PX;
  }

  const margin = 4;
  const selectedBg = (
    <Graphics
      x={x - margin}
      y={y - margin}
      width={CELL_SIZE_PX + margin * 2}
      height={CELL_SIZE_PX + margin * 2}
      cacheAsBitmap
      draw={(ctx) => {
        const colors = nameToSelectedColors[name];
        ctx.clear();
        ctx.lineStyle({
          width: 2,
          color: colors.stroke,
          alignment: 0,
        });
        ctx.beginFill(colors.fill, 1);
        ctx.drawRect(
          0,
          0,
          CELL_SIZE_PX + margin * 2,
          CELL_SIZE_PX + margin * 2
        );
        ctx.endFill();
      }}
    />
  );

  return (
    <>
      {selected && selectedBg}
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
    </>
  );
};

type BaseAssetSpriteProps = {
  name: SpriteName;
  variantIdx?: number;
} & ComponentProps<typeof Sprite>;

export const BaseAssetSprite = ({
  name,
  variantIdx = 0,
  ...rest
}: BaseAssetSpriteProps) => {
  const { spritesheet } = useContext(AssetContext);
  const variant = Sprites[name][variantIdx % Sprites[name].length];
  const fullName = `${variant}.png`;
  const texture = spritesheet.textures[fullName];
  return <Sprite roundPixels texture={texture} {...rest} />;
};
