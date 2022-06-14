import { App } from "@/components/App";
import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { SWRWrapper } from "./data/swr";
import { chakraTheme } from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <SWRWrapper>
        <App />
      </SWRWrapper>
    </ChakraProvider>
  </React.StrictMode>
);
