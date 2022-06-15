import { App } from "@/components/App";
import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import { render } from "react-dom";
import { SWRWrapper } from "./data/swr";
import { chakraTheme } from "./theme";

render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <SWRWrapper>
        <App />
      </SWRWrapper>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
