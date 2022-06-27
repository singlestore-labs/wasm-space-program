import { StatList } from "@/components/StatList";
import { clientConfigAtom, selectedObjectAtom } from "@/data/atoms";
import { formatNumber } from "@/data/format";
import {
  EntityRow,
  queryEntity,
  querySolarSystem,
  SolarSystemInfoRow,
} from "@/data/queries";
import { CloseIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import useSWR from "swr";

export const SelectedInfo = () => {
  const clientConfig = useAtomValue(clientConfigAtom);
  const [selectedObject, setSelectedObject] = useAtom(selectedObjectAtom);

  const selectedKind = selectedObject?.kind;
  const paused = selectedKind === undefined;

  const { data: entity } = useSWR(
    ["queryEntity", selectedObject, clientConfig],
    () => {
      if (selectedObject !== null) {
        return queryEntity(clientConfig, selectedObject.id);
      }
    },
    {
      isPaused: () => paused || selectedKind === "SolarSystem",
      refreshInterval: 1000,
      dedupingInterval: 10,
    }
  );

  const { data: solarSystem } = useSWR(
    ["querySolarSystem", selectedObject, clientConfig],
    () => {
      if (selectedObject !== null) {
        return querySolarSystem(clientConfig, selectedObject.id);
      }
    },
    {
      isPaused: () => paused || selectedKind !== "SolarSystem",
      refreshInterval: 1000,
      dedupingInterval: 10,
    }
  );

  if (paused) {
    return null;
  }

  const clearSelected = () => setSelectedObject(null);

  if (selectedKind === "Ship" && entity) {
    return <ShipInfo entity={entity} onClose={clearSelected} />;
  }
  if (selectedKind === "EnergyNode" && entity) {
    return <EnergyNodeInfo entity={entity} onClose={clearSelected} />;
  }
  if (selectedKind === "SolarSystem" && solarSystem) {
    return <SolarSystemInfo system={solarSystem} />;
  }
  return null;
};

const ShipInfo = ({
  entity,
  onClose,
}: {
  entity: EntityRow;
  onClose: () => void;
}) => (
  <InfoBox
    stroke="#ff00ff"
    fill="#b300b3"
    title={`Ship: 0x${entity.eid.toString(16).toUpperCase()}`}
    onClose={onClose}
  >
    <HealthBar value={entity.shield} />
    <StatList
      p={2}
      stats={[
        { label: "Energy", value: formatNumber(entity.energy) },
        { label: "Blasters", value: formatNumber(entity.blasters) },
        { label: "Thrusters", value: formatNumber(entity.thrusters) },
        { label: "Harvesters", value: formatNumber(entity.harvesters) },
      ]}
    />
  </InfoBox>
);

const EnergyNodeInfo = ({
  entity,
  onClose,
}: {
  entity: EntityRow;
  onClose: () => void;
}) => (
  <InfoBox
    stroke="#ff00ff"
    fill="#b300b3"
    title={`Energy Node: 0x${entity.eid.toString(16).toUpperCase()}`}
    onClose={onClose}
  >
    <StatList
      p={2}
      stats={[{ label: "Energy", value: formatNumber(entity.energy) }]}
    />
  </InfoBox>
);

const SolarSystemInfo = ({ system }: { system: SolarSystemInfoRow }) => (
  <InfoBox
    stroke="#FFB000"
    fill="#9E6D00"
    title={`Solar System: 0x${system.sid.toString(16).toUpperCase()}`}
  >
    <StatList
      p={2}
      stats={[{ label: "# Ships", value: formatNumber(system.numShips) }]}
    />
    <StatList
      p={2}
      stats={[
        { label: "# Energy Nodes", value: formatNumber(system.numEnergyNodes) },
      ]}
    />
    <StatList
      p={2}
      stats={[
        { label: "Total Energy", value: formatNumber(system.totalEnergy) },
      ]}
    />
  </InfoBox>
);

type InfoBoxProps = {
  stroke: string;
  fill: string;
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
};

const InfoBox = ({ stroke, fill, title, onClose, children }: InfoBoxProps) => (
  <Box backgroundColor="#311B92" border={`2px solid ${stroke}`} minWidth={300}>
    <Flex
      backgroundColor={fill}
      padding={2}
      color="#fff"
      fontWeight={600}
      fontSize="lg"
    >
      <Box flex={1}>{title}</Box>
      {onClose && (
        <IconButton
          aria-label="Close"
          icon={<CloseIcon />}
          size="xs"
          variant="outline"
          onClick={onClose}
        />
      )}
    </Flex>
    {children}
  </Box>
);

const HealthBar = ({ value }: { value: number }) => {
  return (
    <Box
      borderWidth="2px 0px"
      borderStyle="solid"
      borderColor="#00E676"
      backgroundColor="#1B1A21"
      position="relative"
    >
      <Box
        width={`${value}%`}
        height="100%"
        position="absolute"
        top={0}
        left={0}
        backgroundColor="#00873F"
      />
      <Flex
        px={2}
        py={0.5}
        position="relative"
        fontSize="sm"
        fontWeight="600"
        color="#fff"
      >
        <Box flex={1}>Shield</Box>
        <Box>{value}%</Box>
      </Flex>
    </Box>
  );
};
