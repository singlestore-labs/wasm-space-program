import { GlobalInfo } from "@/components/GlobalInfo";
import { SelectedInfo } from "@/components/SelectedInfo";
import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

type Props = { children: ReactNode };
export const InfoOverlay = ({ children }: Props) => {
  return (
    <>
      <Box userSelect="none" position="fixed" top={4} left={4}>
        <GlobalInfo />
      </Box>
      <Box userSelect="none" position="fixed" bottom={4} left={4}>
        <SelectedInfo />
      </Box>
      {children}
    </>
  );
};
