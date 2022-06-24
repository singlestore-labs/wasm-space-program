import { WarpSpeed } from "@/components/WarpSpeed";
import { useEase } from "@/hooks/useEase";
import { easeExpIn, easeLinear, easeSinOut } from "d3-ease";
import { ComponentProps } from "react";
import { useTimeoutWhen } from "rooks";

type Props = {
  durationMS: number;
  onComplete: () => void;
} & Omit<ComponentProps<typeof WarpSpeed>, "speed">;

export const WarpTransition = ({ durationMS, onComplete, ...rest }: Props) => {
  useTimeoutWhen(onComplete, durationMS);

  const { value: speed } = useEase(
    (t) => {
      if (t < 0.2) {
        return easeExpIn(t * 5);
      } else if (t < 0.8) {
        return 1;
      }
      return 1 - easeSinOut((t - 0.8) * 5);
    },
    {
      duration: durationMS,
      initialValue: 0,
      loop: true,
    }
  );

  const { value: alpha } = useEase(
    (t) => {
      if (t < 0.2) {
        return easeLinear(t * 5);
      } else if (t < 0.8) {
        return 1;
      }
      return 1 - easeSinOut((t - 0.8) * 5);
    },
    {
      duration: durationMS,
      initialValue: 0,
      loop: true,
    }
  );

  return <WarpSpeed {...rest} speed={speed * 0.8} alpha={alpha} />;
};
