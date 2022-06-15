import { useCallback, useState } from "react";
import { useOnWindowResize } from "rooks";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useOnWindowResize(
    useCallback(
      () =>
        setWindowSize({ width: window.innerWidth, height: window.innerHeight }),
      []
    )
  );

  return windowSize;
};
