import { useTick } from "@inlet/react-pixi";
import { useCallback, useReducer } from "react";

type Options = {
  initialValue: number;
  duration: number;
  onChange?: (value: number) => void;
  onComplete?: () => void;
  loop?: boolean;
};

type State = {
  time: number;
  value: number;
  progress: number;
  complete: boolean;
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const useEase = (ease: (t: number) => number, opts: Options) => {
  type Action =
    | {
        type: "tick";
        deltaMS: number;
      }
    | {
        type: "reset";
      };

  const [{ value, progress, complete }, dispatch] = useReducer(
    (s: State, action: Action) => {
      switch (action.type) {
        case "reset": {
          return {
            time: 0,
            progress: 0,
            value: opts.initialValue,
            complete: false,
          };
        }
        case "tick": {
          const time = s.time + action.deltaMS;
          const progress = time / opts.duration;
          const newComplete = time >= opts.duration;

          const value = clamp(opts.initialValue + ease(progress), 0, 1);
          opts.onChange?.(value);

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
            value,
            complete: newComplete,
          };
        }
      }
    },
    { time: 0, progress: 0, value: opts.initialValue, complete: false }
  );

  useTick(
    (_, ticker) =>
      dispatch({
        type: "tick",
        deltaMS: ticker.deltaMS,
      }),
    !complete
  );

  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return { value, progress, complete, reset };
};
