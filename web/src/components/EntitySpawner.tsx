import { clientConfigAtom, spawnStrategyAtom } from "@/data/atoms";
import { Vector, vectorDistance, worldToCell } from "@/data/coordinates";
import { EntityKind, spawnEntity } from "@/data/queries";
import { Container } from "@inlet/react-pixi";
import { useAtomValue } from "jotai";
import * as PIXI from "pixi.js";
import { useCallback, useEffect, useState } from "react";

type Props = {
  sid: number;
  width: number;
  height: number;
  onSpawn: () => Promise<unknown>;
};

export const EntitySpawner = ({ sid, width, height, onSpawn }: Props) => {
  const strategy = useAtomValue(spawnStrategyAtom);
  const clientConfig = useAtomValue(clientConfigAtom);
  const [pointerDownLoc, setPointerDownLoc] = useState<Vector | null>(null);
  const [kind, setKind] = useState<EntityKind>("Ship");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "1":
          setKind("Ship");
          console.log("set spawn kind to Ship");
          break;
        case "2":
          setKind("EnergyNode");
          console.log("set spawn kind to EnergyNode");
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handlePointerDown = useCallback((e: PIXI.InteractionEvent) => {
    setPointerDownLoc([e.data.global.x, e.data.global.y]);
  }, []);

  const handlePointerUp = useCallback(
    async (e: PIXI.InteractionEvent) => {
      if (pointerDownLoc) {
        const upVec: Vector = [e.data.global.x, e.data.global.y];
        const distance = vectorDistance(pointerDownLoc, upVec);

        if (distance < 10) {
          const upLocal = e.data.getLocalPosition(e.currentTarget);
          const [cellX, cellY] = worldToCell(upLocal.x, upLocal.y);
          await spawnEntity(clientConfig, sid, kind, cellX, cellY, strategy);
          await onSpawn();
          console.log("spawned entity", kind, strategy);
        }

        setPointerDownLoc(null);
      }
    },
    [clientConfig, kind, onSpawn, pointerDownLoc, sid, strategy]
  );

  return (
    <Container
      interactive={true}
      hitArea={new PIXI.Rectangle(0, 0, width, height)}
      pointerdown={handlePointerDown}
      pointerup={handlePointerUp}
    />
  );
};
