import { PixiLoader } from "@/components/PixiLoader";
import { useTimeoutWhen } from "rooks";

type Props = {
  durationMS: number;
  onComplete: () => void;
};

export const WarpTransition = ({ durationMS, onComplete }: Props) => {
  useTimeoutWhen(onComplete, durationMS);
  return <PixiLoader />;
};
