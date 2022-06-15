import { FetchConnectConfig } from "@/data/backend";
import { ClientConfig } from "@/data/client";
import { atom } from "jotai";
import { atomFamily, atomWithHash } from "jotai/utils";

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

// n: number to round
// d: number of decimal places
const round = (n: number, d: number) => {
  const places = Math.pow(10, d);
  return Math.round(n * places) / places;
};

export const viewportAtom = atomWithHash(
  "v",
  { x: 0, y: 0, scale: 1 },
  {
    serialize: ({ x, y, scale }) =>
      `${round(x, 2)}_${round(y, 2)}_${round(scale, 2)}`,
    deserialize: (s) => {
      const [x, y, scale] = s.split("_").map(parseFloat);
      if (
        x === undefined ||
        y === undefined ||
        scale === undefined ||
        isNaN(x) ||
        isNaN(y) ||
        isNaN(scale)
      ) {
        return { x: 0, y: 0, scale: 1 };
      }
      return { x, y, scale };
    },
    replaceState: true,
  }
);

// use setFollowEntity(RESET) to clear
export const followEntityAtom = atomWithHash<number | null>("follow", null);

export const tickDurationMsAtom = atomFamily(() => atom(0));
