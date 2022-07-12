import { DebugPlayground } from "@/components/DebugPlayground";
import { SolarSystem } from "@/components/SolarSystem";
import { UniverseMap } from "@/components/UniverseMap";
import { WarpTransition } from "@/components/WarpTransition";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import {
  clientConfigAtom,
  debugPlaygroundAtom,
  selectedObjectAtom,
  sidAtom,
  viewportAtom,
} from "@/data/atoms";
import { SOLAR_SYSTEM_SIZE_PX } from "@/data/coordinates";
import { querySolarSystem } from "@/data/queries";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import useSWR from "swr";

export const Router = () => {
  const { width, height } = useWindowSize();

  const [sid, setSid] = useAtom(sidAtom);
  const setViewport = useSetAtom(viewportAtom);
  const [selectedObject, setSelectedObject] = useAtom(selectedObjectAtom);
  const debugPlayground = useAtomValue(debugPlaygroundAtom);
  const clientConfig = useAtomValue(clientConfigAtom);

  const [showUniverseMap, setShowUniverseMap] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const { data: selectedSolarSystem } = useSWR(
    ["querySolarSystem", selectedObject, clientConfig],
    () => {
      if (selectedObject) {
        return querySolarSystem(clientConfig, selectedObject.id);
      }
    },
    {
      isPaused: () => selectedObject?.kind !== "SolarSystem",
    }
  );

  const transitionToSolarSystem = useCallback(
    (sid: number) => {
      setShowUniverseMap(false);
      setTransitioning(true);
      setSid(sid);
      setViewport({
        x: SOLAR_SYSTEM_SIZE_PX / 2,
        y: SOLAR_SYSTEM_SIZE_PX / 2,
        scale: 1,
      });
      setSelectedObject({
        kind: "SolarSystem",
        id: sid,
      });
    },
    [setSelectedObject, setSid, setViewport]
  );

  const openUniverseMap = useCallback(() => {
    if (sid !== null) {
      setSelectedObject({
        kind: "SolarSystem",
        id: sid,
      });
    }
    setShowUniverseMap(true);
  }, [setSelectedObject, sid]);

  if (debugPlayground) {
    return <DebugPlayground width={width} height={height} />;
  }

  if (transitioning) {
    return (
      <WarpTransition
        durationMS={2000}
        onComplete={() => setTransitioning(false)}
        width={width}
        height={height}
      />
    );
  } else if (showUniverseMap) {
    return (
      <UniverseMap
        width={width}
        height={height}
        onWarp={transitionToSolarSystem}
        selectedSolarSystem={selectedSolarSystem}
      />
    );
  } else if (sid !== null) {
    return (
      <SolarSystem
        width={width}
        height={height}
        sid={sid}
        onOpenMap={openUniverseMap}
      />
    );
  } else {
    return (
      <WelcomeScreen width={width} height={height} onEnter={openUniverseMap} />
    );
  }
};
