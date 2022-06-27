import {
  ImageCenterTag,
  ImageFloatRightTag,
  MarkdownText,
} from "@/components/MarkdownText";
import architectureURL from "@assets/architecture_diagram.png";
import turnResolutionURL from "@assets/turn_resolution_simple.png";
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  TabProps,
  Tabs,
} from "@chakra-ui/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const InfoModal = ({ isOpen, onClose }: Props) => {
  const tabStyle: TabProps = {
    px: 3,
    py: 2,
    borderBottom: "2px solid #4f34c7",
    fontWeight: 600,
  };
  const tabSelected: TabProps = {
    borderBottom: "2px solid #c0b7eb",
    backgroundColor: "#4f34c7",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl">
      <ModalOverlay backgroundColor="rgba(79, 52, 199, 0.75)" />
      <ModalContent borderRadius={0} border="2px solid #000">
        <ModalBody backgroundColor="#1e0a78" p={0}>
          <ModalCloseButton variant={"ghost"} top={4} right={4} />

          <Tabs variant="unstyled" size="sm">
            <Box px={6} py={4}>
              <Box color="#fff" fontSize="xl" fontWeight={800}>
                Information
              </Box>
              <TabList gap={4} mt={2}>
                <Tab
                  {...tabStyle}
                  _active={tabSelected}
                  _hover={tabSelected}
                  _selected={tabSelected}
                >
                  Game info
                </Tab>
                <Tab
                  {...tabStyle}
                  _active={tabSelected}
                  _hover={tabSelected}
                  _selected={tabSelected}
                >
                  Architecture
                </Tab>
              </TabList>
            </Box>

            <TabPanels
              backgroundColor="#311b92"
              maxHeight="75vh"
              overflowX="auto"
            >
              <TabPanel px={6} py={4}>
                <GameInfo />
              </TabPanel>
              <TabPanel px={6} py={4}>
                <Architecture />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const GameInfo = () => {
  return (
    <MarkdownText>
      {`
        ### About
        In this demo we simulate a fake universe full of thousands of solar
        systems. In each solar system there are many space ships and energy
        nodes. Each space ship is controlled by an AI written in Rust and
        deployed into SingleStore using our new [Code Engine (Powered by Wasm)][1].

        [1]: https://docs.singlestore.com/managed-service/en/reference/code-engine---powered-by-wasm.html

        ![${ImageFloatRightTag}](${turnResolutionURL})
        ### Turn resolution
        1. All ships can see entities up to 8 cells away.
        2. Each ship decides what to do from the following options:
            - **Hold (energy: 1):** The ship stays where it is.
            - **Move (energy: 2):** The ship moves up to its speed in a
              cardinal direction.
            - **Upgrade (energy: 50):** The ship upgrades its Blasters,
              Harvesters, or Thrusters.
        3. All actions are resolved at the same time in a single database
            transaction and the game rules are applied.

        ### Detailed rules
        - Ships at the same location will fight. Damage is calculated based on
          the number of blasters each ship has.
        - Ships alone in a call with energy nodes will consume some amount of
          energy based on the number of harvesters the ship has.
        - A ship may only move up to N cells per turn where N is the number of
          thrusters the ship has.
        - Each ship has a shield which recharges 1% per turn if the ship is not
          in combat.
        - Any ship which looses all of its shield explodes, leaving behind all
          of its energy at the ships location.
        - Any ship which runs out of energy explodes leaving nothing behind.
      `}
    </MarkdownText>
  );
};

const Architecture = () => {
  return (
    <MarkdownText>
      {`
        ### Architecture
        This game runs entirely within [SingleStore][s2] and the browser.
        SingleStore, a scale out relational database optimized for transactions
        and analytics, stores the game state and handles turn resolution. The
        game client is runs in the browser and communicates directly with
        SingleStore over our HTTP based [Data API][data-api].

        ![${ImageCenterTag}](${architectureURL})

        [s2]: https://www.singlestore.com
        [data-api]: https://docs.singlestore.com/managed-service/en/reference/data-api.html
      `}
    </MarkdownText>
  );
};
