import { useTick } from "@inlet/react-pixi";
import { useReducer } from "react";

type Options = {
  initialValue: number;
  duration: number;
  onComplete?: () => void;
  loop?: boolean;
};

type State = {
  time: number;
  value: number;
  progress: number;
  complete: boolean;
};

export const chainEaseFns =
  (...fns: ((t: number) => number)[]) =>
  (t: number) => {
    const breakpoint = 1 / fns.length;
    const idx = Math.floor(t / breakpoint);
    const fn = fns[idx];
    if (fn === undefined) {
      return 1;
    }
    return fn(t * fns.length);
  };

//fns.reduce((acc, fn) => fn(acc), t);

export const useEase = (ease: (t: number) => number, opts: Options) => {
  const [{ value, progress, complete }, dispatch] = useReducer(
    (s: State, deltaMS: number) => {
      const time = s.time + deltaMS;
      const progress = time / opts.duration;
      const newComplete = time >= opts.duration;
      if (newComplete && !s.complete) {
        opts.onComplete?.();
        if (opts.loop) {
          return {
            time: 0,
            progress: 0,
            value: opts.initialValue,
            complete: false,
          };
        }
      }
      return {
        time,
        progress,
        value: opts.initialValue + ease(progress),
        complete: newComplete,
      };
    },
    { time: 0, progress: 0, value: opts.initialValue, complete: false }
  );

  useTick((_, ticker) => dispatch(ticker.deltaMS), !complete);

  return [value, progress, complete] as const;
};
