import { FetchConnectConfig } from "@/data/backend";
import { ClientConfig } from "@/data/client";
import { atom } from "jotai";
import { atomWithHash } from "jotai/utils";

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

type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

const viewportXAtom = atomWithHash("x", 0);
const viewportYAtom = atomWithHash("y", 0);
const viewportZoomAtom = atomWithHash("zoom", 0);

export const viewportAtom = atom(
  (get) =>
    ({
      x: get(viewportXAtom),
      y: get(viewportYAtom),
      zoom: get(viewportZoomAtom),
    } as Viewport),
  (get, set, v: Viewport) => {
    set(viewportXAtom, v.x);
    set(viewportYAtom, v.y);
    set(viewportZoomAtom, v.zoom);
  }
);

// use setFollowEntity(RESET) to clear
export const followEntityAtom = atomWithHash<number | null>("follow", null);

if (import.meta.hot) {
  import.meta.hot.decline();
}
