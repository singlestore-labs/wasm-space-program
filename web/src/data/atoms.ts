import { FetchConnectConfig } from "@/data/backend";
import { ClientConfig } from "@/data/client";
import { atom } from "jotai";
import { atomFamily, atomWithHash } from "jotai/utils";

export const debugAtom = atomWithHash("debug", false, {
  replaceState: true,
});

export const debugPlaygroundAtom = atomWithHash("play", false, {
  replaceState: true,
});

export const unhandledErrorAtom = atom<null | Error>(null);

const connectConfigAtom = atom(FetchConnectConfig);

export const connectEndpointsAtom = atom(
  (get) => get(connectConfigAtom).endpoints
);

export const connectEndpointIdxAtom = atom(0);

export const clientConfigAtom = atom<ClientConfig>((get) => {
  const config = get(connectConfigAtom);
  const idx = get(connectEndpointIdxAtom);
  const endpoints = get(connectEndpointsAtom);
  if (idx < 0 || idx >= endpoints.length) {
    throw new Error("connectEndpointIdx out of range");
  }
  return {
    ...config,
    endpoint: endpoints[idx],
  };
});

export const viewportAtom = atomWithHash(
  "v",
  { x: 0, y: 0, scale: 1 },
  {
    serialize: ({ x, y, scale }) =>
      `${Math.round(x)}_${Math.round(y)}_${Math.round(scale * 100)}`,
    deserialize: (s) => {
      const [x, y, rawScale] = s.split("_").map((i) => parseInt(i, 10));
      if (
        x === undefined ||
        y === undefined ||
        rawScale === undefined ||
        isNaN(x) ||
        isNaN(y) ||
        isNaN(rawScale)
      ) {
        return { x: 0, y: 0, scale: 1 };
      }
      const scale = rawScale / 100;
      return { x, y, scale };
    },
    replaceState: true,
  }
);

export const sidAtom = atomWithHash<null | number>("sid", null, {
  replaceState: true,
});

// use setFollowEntity(RESET) to clear
export const followEntityAtom = atomWithHash<number | null>("follow", null);

export const tickDurationMsAtom = atomFamily(() => atom(0));
