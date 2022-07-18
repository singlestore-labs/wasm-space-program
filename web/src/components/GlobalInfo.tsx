import { StatList } from "@/components/StatList";
import {
  clientConfigAtom,
  connectConfigAtom,
  connectEndpointIdxAtom,
} from "@/data/atoms";
import { formatMs, formatNumber } from "@/data/format";
import { queryGlobalStats } from "@/data/queries";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Select,
  Stack,
} from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { ChangeEvent, useState } from "react";
import useSWR from "swr";

type Props = {
  onOpenInfo: () => void;
};

export const GlobalInfo = ({ onOpenInfo }: Props) => {
  const [showStats, setShowStats] = useState(false);

  return (
    <>
      <Flex
        backgroundColor="#311B92"
        px={4}
        py={2}
        position="relative"
        _hover={{
          backgroundColor: "#3a20ae",
        }}
        cursor="pointer"
        onClick={() => setShowStats(!showStats)}
      >
        <Box flex={1} fontWeight={600} fontSize="lg" mr={8}>
          Information
        </Box>
        <Icon
          as={showStats ? ChevronUpIcon : ChevronDownIcon}
          position="relative"
          top="5px"
          width="1em"
          height="1em"
          fontSize="1.25em"
        />
      </Flex>
      {showStats && <InfoPanel onOpenInfo={onOpenInfo} />}
    </>
  );
};

const InfoPanel = ({ onOpenInfo }: Props) => {
  return (
    <Stack
      backgroundColor="#311B92"
      px={4}
      py={2}
      borderTop="2px solid #4F34C7"
      spacing={3}
    >
      <WorkspaceDropdown />
      <StatTable />
      <Button onClick={onOpenInfo}>More info</Button>
    </Stack>
  );
};

const WorkspaceDropdown = () => {
  const { endpoints } = useAtomValue(connectConfigAtom);
  const [endpointIdx, setEndpointIdx] = useAtom(connectEndpointIdxAtom);

  const handleChange = (evt: ChangeEvent<HTMLSelectElement>) =>
    setEndpointIdx(parseInt(evt.target.value, 10));

  return (
    <HStack>
      <Box fontSize="md" flex={1}>
        Workspace:
      </Box>
      <Select
        size="sm"
        fontWeight={500}
        value={endpointIdx}
        onChange={handleChange}
      >
        {endpoints.map((_, idx) => (
          <option key={idx} value={idx}>
            workspace {idx}
          </option>
        ))}
      </Select>
    </HStack>
  );
};

const StatTable = () => {
  const clientConfig = useAtomValue(clientConfigAtom);
  const { data: stats } = useSWR(
    ["globalStats", clientConfig],
    () => queryGlobalStats(clientConfig),
    {
      refreshInterval: 1000,
    }
  );

  if (!stats) {
    return null;
  }

  const info = [
    {
      label: "Avg turn time",
      value: formatMs(stats.turnInfo.avgTurnTime),
    },
    {
      label: "Avg writes per turn",
      value: formatNumber(stats.turnInfo.avgWrites),
    },
    {
      label: "# solar systems",
      value: formatNumber(stats.numSystems),
    },
    {
      label: "# ships",
      value: formatNumber(stats.numEntities.Ship),
    },
    {
      label: "Avg ships / system",
      value: formatNumber(stats.avgEntitiesPerSystem.Ship),
    },
    {
      label: "# energy nodes",
      value: formatNumber(stats.numEntities.EnergyNode),
    },
    {
      label: "Avg energy nodes / system",
      value: formatNumber(stats.avgEntitiesPerSystem.EnergyNode),
    },
  ];

  return <StatList minWidth={300} stats={info} />;
};
