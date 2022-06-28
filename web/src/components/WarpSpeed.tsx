// This animation is inspired by the star-warp example from Pixi.js
// https://github.com/pixijs/examples/blob/main/examples/js/demos-advanced/star-warp.js

import { Container, Sprite, useTick } from "@inlet/react-pixi";
import starUrl from "assets/star.png";
import { useReducer, useRef } from "react";

const NUM_STARS = 1000;
const FOV = 20;
const STAR_BASE_SIZE = 0.05;
const STAR_STRETCH = 5;

type Star = {
  x: number;
  y: number;
  z: number;
  sprite: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
  };
};

type State = {
  cameraZ: number;
  stars: Star[];
};

const initializeStars = (stars: Star[]) => {
  for (let i = 0; i < NUM_STARS; i++) {
    const star = {
      x: 0,
      y: 0,
      z: 0,
      sprite: {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    };
    randomizeStar(0, star, true);
    stars.push(star);
  }
};

const randomizeStar = (cameraZ: number, star: Star, initial?: boolean) => {
  star.z = initial
    ? Math.random() * 2000
    : cameraZ + Math.random() * 1000 + 2000;

  // Calculate star positions with radial random coordinate so no star hits the camera.
  const deg = Math.random() * Math.PI * 2;
  const distance = Math.random() * 50 + 1;
  star.x = Math.cos(deg) * distance;
  star.y = Math.sin(deg) * distance;
};

type Props = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  alpha?: number;
  speed: number;
};

export const WarpSpeed = ({
  x = 0,
  y = 0,
  width,
  height,
  alpha = 1,
  speed,
}: Props) => {
  const stateRef = useRef<State>({ cameraZ: 0, stars: [] });
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useTick((delta) => {
    const s = stateRef.current;

    if (s.stars.length === 0) {
      initializeStars(s.stars);
    }

    s.cameraZ += delta * 10 * speed;

    for (const star of s.stars) {
      if (star.z < s.cameraZ) {
        randomizeStar(s.cameraZ, star);
      }

      // map star 3d position to 2d
      const z = star.z - s.cameraZ;
      star.sprite.x = star.x * (FOV / z) * width + width / 2;
      star.sprite.y = star.y * (FOV / z) * width + height / 2;

      // calculate star scale & rotation.
      const dxCenter = star.sprite.x - width / 2;
      const dyCenter = star.sprite.y - height / 2;
      const distanceCenter = Math.sqrt(
        dxCenter * dxCenter + dyCenter * dyCenter
      );
      const distanceScale = Math.max(0, (2000 - z) / 2000);
      star.sprite.scaleX = distanceScale * STAR_BASE_SIZE;
      // Star is looking towards center so that y axis is towards center.
      // Scale the star depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
      star.sprite.scaleY =
        distanceScale * STAR_BASE_SIZE +
        (distanceScale * speed * STAR_STRETCH * distanceCenter) / width;
      star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }

    forceUpdate();
  });

  return (
    <Container x={x} y={y} alpha={alpha}>
      {stateRef.current.stars.map((star, i) => (
        <Sprite
          key={i}
          image={starUrl}
          x={star.sprite.x}
          y={star.sprite.y}
          scale={[star.sprite.scaleX, star.sprite.scaleY]}
          rotation={star.sprite.rotation}
        />
      ))}
    </Container>
  );
};
