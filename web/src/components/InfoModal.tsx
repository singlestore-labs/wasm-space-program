import {
  ImageCenterTag,
  ImageFloatRightTag,
  MarkdownText,
} from "@/components/MarkdownText";
import { SOLAR_SYSTEM_MARGIN_PX } from "@/components/SolarSystem";
import {
  clientConfigAtom,
  selectedObjectAtom,
  sidAtom,
  viewportAtom,
} from "@/data/atoms";
import {
  ColumnDescription,
  QueryTuplesWithColumns,
  Tuple,
} from "@/data/client";
import { cellToWorld } from "@/data/coordinates";
import {
  EntityKind,
  EntityKindsByValue,
  EntityKindStrings,
  findBattle,
  queryEntityMaybe,
} from "@/data/queries";
import architectureURL from "@assets/architecture_diagram.png";
import turnResolutionURL from "@assets/turn_resolution_simple.png";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  TabProps,
  Tabs,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import useSWR from "swr";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const InfoModal = ({ isOpen, onClose }: Props) => {
  const tabStyle: TabProps = {
    px: 3,
    py: 2,
    fontWeight: 600,
    borderBottom: "2px solid transparent",
  };
  const tabSelected: TabProps = {
    borderBottom: "2px solid #fff",
  };
  const tabHover: TabProps = {
    ...tabSelected,
    backgroundColor: "rgba(255,255,255,0.1)",
  };

  const CustomTab = (props: TabProps) => (
    <Tab
      {...tabStyle}
      _active={tabSelected}
      _hover={tabHover}
      _selected={tabSelected}
      {...props}
    />
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay backgroundColor="rgba(24, 6, 103, 0.5)" />
      <ModalContent borderRadius={0} border="2px solid #000" mb={0}>
        <ModalBody backgroundColor="#4f34c7" p={0}>
          <ModalCloseButton variant={"ghost"} top={4} right={4} />

          <Tabs variant="unstyled" size="sm">
            <Box px={6} py={4}>
              <Box color="#fff" fontSize="xl" fontWeight={800}>
                Information
              </Box>
              <TabList gap={4} mt={2}>
                <CustomTab>Game info</CustomTab>
                <CustomTab>Architecture</CustomTab>
                <CustomTab>Find entity</CustomTab>
                <CustomTab>Run query</CustomTab>
              </TabList>
            </Box>

            <TabPanels
              backgroundColor="#311B92"
              overflowX="auto"
              maxHeight="calc(75vh - 30px)"
            >
              <TabPanel px={6} py={4}>
                <GameInfo />
              </TabPanel>
              <TabPanel px={6} py={4}>
                <Architecture />
              </TabPanel>
              <TabPanel px={6} py={4}>
                <FindEntity onClose={onClose} />
              </TabPanel>
              <TabPanel px={6} py={4}>
                <RunQuery />
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
        1. All ships can see entities up to 16 cells away.
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
        game client runs in the browser and communicates directly with
        SingleStore over our [Data API][data-api].

        ![${ImageCenterTag}](${architectureURL})

        [s2]: https://www.singlestore.com
        [data-api]: https://docs.singlestore.com/managed-service/en/reference/data-api.html
      `}
    </MarkdownText>
  );
};

const FindEntity = ({ onClose }: { onClose: () => void }) => {
  const clientConfig = useAtomValue(clientConfigAtom);

  const setSelectedEntity = useSetAtom(selectedObjectAtom);
  const setSid = useSetAtom(sidAtom);
  const setViewport = useSetAtom(viewportAtom);

  const [eid, setEid] = useState(0);

  const { data: targetEntity } = useSWR(
    ["queryEntityMaybe", eid, clientConfig],
    () => queryEntityMaybe(clientConfig, eid)
  );

  const warp = useCallback(() => {
    if (!targetEntity) {
      return;
    }

    setSid(targetEntity.sid);
    setSelectedEntity({
      kind: EntityKindsByValue[targetEntity.kind] as EntityKind,
      id: targetEntity.eid,
    });

    const [worldX, worldY] = cellToWorld(targetEntity.x, targetEntity.y);
    setViewport({
      x: worldX + SOLAR_SYSTEM_MARGIN_PX,
      y: worldY + SOLAR_SYSTEM_MARGIN_PX,
      scale: 1,
    });

    onClose();
  }, [onClose, setSelectedEntity, setSid, setViewport, targetEntity]);

  const onFindBattle = useCallback(async () => {
    const battleEid = await findBattle(clientConfig);
    if (battleEid) {
      setEid(battleEid);
    }
  }, [clientConfig]);

  return (
    <>
      <Heading size="lg" my={4}>
        Find entity
      </Heading>
      <FormControl isInvalid={!targetEntity}>
        <InputGroup>
          <InputLeftAddon>Entity ID:</InputLeftAddon>
          <Input
            value={eid}
            onChange={(e) => setEid(parseInt(e.target.value, 10))}
            type="number"
          />
        </InputGroup>
        <FormErrorMessage>Entity not found</FormErrorMessage>
        {targetEntity && (
          <FormHelperText>
            Target entity: {EntityKindStrings[targetEntity.kind]} in solar
            system {targetEntity.sid} at location {targetEntity.x},{" "}
            {targetEntity.y}
          </FormHelperText>
        )}
      </FormControl>
      <Button
        mt={4}
        width="100%"
        disabled={!targetEntity}
        onClick={warp}
        colorScheme="purple"
      >
        Warp!
      </Button>
      <Button mt={4} width="100%" onClick={onFindBattle} colorScheme="purple">
        Find an entity in battle
      </Button>
    </>
  );
};

const DEFAULT_QUERY = `
select strategy, count(*) as num_ships
from entity
where
  kind = 1
group by strategy
order by num_ships desc
`.trim();

const RunQuery = () => {
  const clientConfig = useAtomValue(clientConfigAtom);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [results, setResults] = useState<[ColumnDescription[], Tuple[]] | null>(
    null
  );
  const [error, setError] = useState(null as string | null);

  const runQuery = useCallback(async () => {
    try {
      const result = await QueryTuplesWithColumns(clientConfig, query);
      setResults(result);
      setError(null);
    } catch (err) {
      setResults(null);
      setError(err instanceof Error ? err.message : `unknown error: ${err}`);
    }
  }, [clientConfig, query]);

  return (
    <>
      <MarkdownText>
        {`
          ### Run query
          Use the text box below to run any select query against SingleStore.
          This feature takes advantage of the [Data API][data-api] to run the
          query directly from your browser.

          [data-api]: https://docs.singlestore.com/managed-service/en/reference/data-api.html
        `}
      </MarkdownText>
      <Textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        resize="vertical"
        rows={query.split("\n").length}
      />
      <Button colorScheme="purple" mt={4} onClick={runQuery}>
        Run query
      </Button>
      {error ? (
        <Alert status="error" mt={4}>
          <AlertIcon />
          <AlertTitle>Query failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <QueryResults results={results} />
      )}
    </>
  );
};

const QueryResults = ({
  results,
}: {
  results?: [ColumnDescription[], Tuple[]] | null;
}) => {
  if (!results || results[1].length === 0) {
    return (
      <Alert status="info" mt={4}>
        <AlertIcon />
        <AlertTitle>No results</AlertTitle>
        <AlertDescription>
          No results were returned from the query.
        </AlertDescription>
      </Alert>
    );
  }

  const [columnDescs, tuples] = results;
  const columns = columnDescs.map((c) => <Th key={c.name}>{c.name}</Th>);

  const rows = tuples.map((row, idx) => (
    <Tr key={idx}>
      {row.map((v) => (
        <Td key={v?.toString()}>{v}</Td>
      ))}
    </Tr>
  ));

  return (
    <TableContainer
      borderWidth={1}
      borderColor="purple.400"
      mt={4}
      borderRadius={4}
    >
      <Table variant="primary" size="sm">
        <Thead>
          <Tr>{columns}</Tr>
        </Thead>
        <Tbody>{rows}</Tbody>
      </Table>
    </TableContainer>
  );
};
