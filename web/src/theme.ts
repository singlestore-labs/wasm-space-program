import { extendTheme } from "@chakra-ui/react";
import "@fontsource/inter/variable-full.css";
import "@fontsource/source-code-pro/variable.css";

export const chakraTheme = extendTheme({
  fonts: {
    heading: "InterVariable, sans-serif",
    body: "InterVariable, sans-serif",
    mono: '"Source Code ProVariable", monospace',
  },
  colors: {
    transparent: "transparent",
    black: "#151117", // neutral.0
    white: "#F1F0F5", // neutral.900
    primary: "#C552FF", // purple.900
    text: {
      default: "#F1F0F5", // neutral.900
      unfocused: "#B5B2BF", // neutral.800
      disabled: "#494552", // neutral.500
    },
    neutral: {
      0: "#151117",
      100: "#1C181F",
      200: "#221F26",
      300: "#29262E",
      500: "#494552",
      700: "#858191",
      800: "#B5B2BF",
      900: "#F1F0F5",
    },
    green: {
      200: "#183828",
      900: "#37AD73",
    },
    indigo: {
      100: "#241A52",
      600: "#957FF5",
    },
    magenta: {
      200: "#520052",
      900: "#FF7BFF",
    },
    purple: {
      200: "#22102B",
      400: "#502566",
      600: "#8C34B8",
      800: "#B245E6",
      900: "#C552FF",
    },
    red: {
      200: "#471F2B",
      900: "#EB4258",
    },
    yellow: {
      200: "#3D2A02",
      900: "#EBB642",
    },
  },
  styles: {
    global: {
      "html, body": {
        color: "text.default",
        backgroundColor: "black",
      },
      a: {
        color: "text.focused",
      },
    },
  },
});
