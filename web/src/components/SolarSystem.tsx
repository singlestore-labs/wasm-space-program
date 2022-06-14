import { followEntityAtom, viewportAtom } from "@/data/atoms";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect } from "react";

const GRID_SIZE = 50; // px, square
const SIZE = 1000; // grid cells, square

export const SolarSystem = () => {
  const [viewport, setViewport] = useAtom(viewportAtom);
  const [followEntity, setFollowEntity] = useAtom(followEntityAtom);

  useEffect(() => {
    let i = 0;
    const intervalID = setInterval(() => {
      setFollowEntity(i++);
      if (i > 10) {
        setFollowEntity(RESET);
      }
      setViewport({
        x: viewport.x + i++,
        y: viewport.y + i++,
        zoom: viewport.zoom + i++,
      });
    }, 1000);
    return () => clearInterval(intervalID);
  }, []);

  console.log(viewport, followEntity);
  return <h1>Solar System</h1>;
};
