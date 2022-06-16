import { debugAtom } from "@/data/atoms";
import { useAtomValue } from "jotai";

export const DebugOnly = (props: { children: React.ReactNode }) => {
  const debug = useAtomValue(debugAtom);
  if (!debug) {
    return null;
  }
  return <>{props.children}</>;
};
