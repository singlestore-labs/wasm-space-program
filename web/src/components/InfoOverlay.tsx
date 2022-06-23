import { GlobalInfo } from "@/components/GlobalInfo";
import { SelectedInfo } from "@/components/SelectedInfo";
import { ReactNode } from "react";

type Props = { children: ReactNode };
export const InfoOverlay = ({ children }: Props) => {
  return (
    <>
      <GlobalInfo position="fixed" top={4} left={4} />
      <SelectedInfo position="fixed" bottom={4} left={4} />
      {children}
    </>
  );
};
