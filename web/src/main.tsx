import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { chakraTheme } from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <h1>hello world</h1>
    </ChakraProvider>
  </React.StrictMode>
);
