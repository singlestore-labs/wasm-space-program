import { ConnectConfig, FetchConnectConfig } from "@/data/backend";
import { ClientConfig } from "@/data/client";
import { atom, selector } from "recoil";

const connectConfigSelector = selector<ConnectConfig>({
  key: "connectConfig",
  get: FetchConnectConfig,
});

export const connectEndpointsSelector = selector<string[]>({
  key: "connectEndpoints",
  get: ({ get }) => get(connectConfigSelector).endpoints,
});

export const connectEndpointIdxAtom = atom<number>({
  key: "connectEndpointIdx",
  default: 0,
});

export const clientConfigSelector = selector<ClientConfig>({
  key: "clientConfig",
  get: ({ get }) => {
    const config = get(connectConfigSelector);
    const idx = get(connectEndpointIdxAtom);
    const endpoints = get(connectEndpointsSelector);
    if (idx < 0 || idx >= endpoints.length) {
      throw new Error("connectEndpointIdx out of range");
    }
    return {
      ...config,
      endpoint: endpoints[idx],
    };
  },
});
