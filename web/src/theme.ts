import { extendTheme } from "@chakra-ui/react";
import "@fontsource/inter/variable-full.css";
import "@fontsource/source-code-pro/variable.css";

export const chakraTheme = extendTheme({
  fonts: {
    heading: "InterVariable, sans-serif",
    body: "InterVariable, sans-serif",
    mono: '"Source Code ProVariable", monospace',
  },
  components: {
    Link: {
      color: "blue.300",
    },
  },
});
