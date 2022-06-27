import { AssetContext } from "@/components/AssetLoader";
import { DebugPlayground } from "@/components/DebugPlayground";
import { SolarSystem } from "@/components/SolarSystem";
import { UniverseMap } from "@/components/UniverseMap";
import { WarpTransition } from "@/components/WarpTransition";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import {
  debugPlaygroundAtom,
  selectedObjectAtom,
  sidAtom,
  viewportAtom,
} from "@/data/atoms";
import { SOLAR_SYSTEM_SIZE_PX } from "@/data/coordinates";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useContext, useState } from "react";

export const Router = () => {
  const { width, height } = useWindowSize();

  const [sid, setSid] = useAtom(sidAtom);
  const setViewport = useSetAtom(viewportAtom);
  const setSelectedObject = useSetAtom(selectedObjectAtom);
  const debugPlayground = useAtomValue(debugPlaygroundAtom);
  const { starsTile } = useContext(AssetContext);

  const [showUniverseMap, setShowUniverseMap] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

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
      setSelectedObject(null);
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

  const closeUniverseMap = useCallback(() => {
    setSelectedObject(null);
    setShowUniverseMap(true);
  }, [setSelectedObject]);

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
        onClose={closeUniverseMap}
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
