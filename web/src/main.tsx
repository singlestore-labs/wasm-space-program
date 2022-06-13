import { App } from "@/components/App";
import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { SWRWrapper } from "./data/swr";
import { chakraTheme } from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <SWRWrapper>
          <RecoilRoot>
            <App />
          </RecoilRoot>
        </SWRWrapper>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
