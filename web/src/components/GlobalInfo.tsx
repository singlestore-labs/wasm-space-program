import { StatList } from "@/components/StatList";
import {
  clientConfigAtom,
  connectConfigAtom,
  connectEndpointIdxAtom,
} from "@/data/atoms";
import { formatMs, formatNumber } from "@/data/format";
import { queryGlobalStats } from "@/data/queries";
import { InfoIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  HStack,
  Select,
} from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { ChangeEvent } from "react";
import useSWR from "swr";

type Props = {
  onOpenInfo: () => void;
};

export const GlobalInfo = ({ onOpenInfo }: Props) => {
  return (
    <>
      <Flex
        backgroundColor="#311B92"
        border="2px 2px 0 2px solid #000"
        borderBottom="2px solid #4f34c7"
        px={4}
        py={2}
        position="relative"
        _hover={{
          backgroundColor: "#3a20ae",
        }}
        cursor="pointer"
        onClick={onOpenInfo}
      >
        <Box flex={1} fontWeight={600} fontSize="lg">
          Information
        </Box>
        <InfoIcon position="relative" top="5px" right="2px" />
      </Flex>
      <Accordion
        backgroundColor="#311B92"
        border="0 2px 2px 2px solid #000"
        allowToggle
        py={0}
        my={0}
      >
        <AccordionItem border={0}>
          <AccordionButton
            borderBottom="2px solid #4f34c7"
            _hover={{
              backgroundColor: "#3a20ae",
            }}
          >
            <Box
              flex={1}
              pr={2}
              textAlign="left"
              color="#fff"
              fontWeight={600}
              fontSize="lg"
            >
              Universe Stats
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <WorkspaceDropdown />
            <StatTable />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
};

const WorkspaceDropdown = () => {
  const { endpoints } = useAtomValue(connectConfigAtom);
  const [endpointIdx, setEndpointIdx] = useAtom(connectEndpointIdxAtom);

  const handleChange = (evt: ChangeEvent<HTMLSelectElement>) =>
    setEndpointIdx(parseInt(evt.target.value, 10));

  return (
    <HStack pt={1} pb={3}>
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
      suspense: true,
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
