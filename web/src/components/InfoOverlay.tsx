import { GlobalInfo } from "@/components/GlobalInfo";
import { InfoModal } from "@/components/InfoModal";
import { SelectedInfo } from "@/components/SelectedInfo";
import { Box, Image, LinkOverlay, useDisclosure } from "@chakra-ui/react";
import { ReactNode } from "react";

import singlestoreLogoUrl from "@assets/singlestore_logo_light.svg";

type Props = { children: ReactNode };
export const InfoOverlay = ({ children }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box userSelect="none" position="fixed" top={4} left={4}>
        <GlobalInfo onOpenInfo={onOpen} />
      </Box>
      <Box userSelect="none" position="fixed" bottom={4} left={4}>
        <SelectedInfo />
      </Box>
      <Box position="fixed" top={8} right={8}>
        <LinkOverlay href="https://www.singlestore.com" target="_blank">
          <Image src={singlestoreLogoUrl} width="150px" />
        </LinkOverlay>
      </Box>

      {children}
      <InfoModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};
