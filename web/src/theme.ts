import { extendTheme } from "@chakra-ui/react";
import "@fontsource/inter/variable-full.css";
import "@fontsource/source-code-pro/variable.css";
import memoize from "fast-memoize";

const colorscheme = {
  neutral: {
    0: "#F1F0F5",
    100: "#B5B2BF",
    200: "#858191",
    300: "#64606f",
    400: "#494552",
    500: "#38343e",
    600: "#29262E",
    700: "#221F26",
    800: "#1C181F",
    900: "#151117",
  },
  green: {
    200: "#37AD73",
    900: "#183828",
  },
  indigo: {
    100: "#957FF5",
    600: "#241A52",
  },
  magenta: {
    200: "#FF7BFF",
    900: "#520052",
  },
  purple: {
    200: "#C552FF",
    400: "#B245E6",
    500: "#9d3ccd",
    600: "#8C34B8",
    700: "#6b2c8b",
    800: "#502566",
    900: "#22102B",
  },
  red: {
    200: "#EB4258",
    900: "#471F2B",
  },
  yellow: {
    200: "#ebb642",
    900: "#3D2A02",
  },
};

export const colors = {
  ...colorscheme,
  gray: colorscheme.neutral,
  black: colorscheme.neutral[900],
  white: colorscheme.neutral[0],
  primary: colorscheme.purple[200],
  text: {
    default: colorscheme.neutral[0],
    unfocused: colorscheme.neutral[200],
    disabled: colorscheme.neutral[500],
  },
};

export const colorToNumber = memoize((c: string): number =>
  Number(c.replace("#", "0x"))
);

export const chakraTheme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: "dark",
  },
  fonts: {
    heading: "InterVariable, sans-serif",
    body: "InterVariable, sans-serif",
    mono: '"Source Code ProVariable", monospace',
  },
  colors,
});
