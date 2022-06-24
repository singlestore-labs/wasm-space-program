import { StatList } from "@/components/StatList";
import {
  clientConfigAtom,
  connectConfigAtom,
  connectEndpointIdxAtom,
} from "@/data/atoms";
import { formatMs, formatNumber } from "@/data/format";
import { queryGlobalStats } from "@/data/queries";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AccordionProps,
  Box,
  HStack,
  Select,
} from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { ChangeEvent } from "react";
import useSWR from "swr";

type Props = AccordionProps;

export const GlobalInfo = (props: Props) => {
  return (
    <Accordion
      {...props}
      backgroundColor="#311B92"
      border="2px solid #000"
      allowToggle
    >
      <AccordionItem border={0}>
        <AccordionButton borderBottom="2px solid #4f34c7">
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
  );
};

const WorkspaceDropdown = () => {
  const { endpoints } = useAtomValue(connectConfigAtom);
  const [endpointIdx, setEndpointIdx] = useAtom(connectEndpointIdxAtom);

  const handleChange = (evt: ChangeEvent<HTMLSelectElement>) =>
    setEndpointIdx(parseInt(evt.target.value, 10));

  return (
    <HStack pt={1} pb={3}>
      <Box fontSize="sm" flex={1}>
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
      label: "Average Turn Time",
      value: formatMs(stats.avgTurnTime),
    },
    {
      label: "# solar systems",
      value: formatNumber(stats.numSystems),
    },
    {
      label: "Average ships per system",
      value: formatNumber(stats.avgShipsPerSystem),
    },
    {
      label: "# ships",
      value: formatNumber(stats.numEntities.Ship),
    },
    {
      label: "# energy nodes",
      value: formatNumber(stats.numEntities.EnergyNode),
    },
  ];

  return <StatList minWidth={280} stats={info} />;
};
