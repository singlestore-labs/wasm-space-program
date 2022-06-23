import { StatList } from "@/components/StatList";
import { clientConfigAtom, selectedEntityIdAtom } from "@/data/atoms";
import { formatNumber } from "@/data/format";
import {
  EntityKind,
  EntityKindsByValue,
  EntityRow,
  queryEntity,
} from "@/data/queries";
import { CloseIcon } from "@chakra-ui/icons";
import { Box, BoxProps, Flex, IconButton } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import useSWR from "swr";

type Props = BoxProps;

export const SelectedInfo = (props: Props) => {
  const clientConfig = useAtomValue(clientConfigAtom);
  const [eid, setEid] = useAtom(selectedEntityIdAtom);

  const { data: entity } = useSWR(
    ["queryEntity", eid, clientConfig],
    () => {
      if (eid !== null) {
        return queryEntity(clientConfig, eid);
      }
    },
    {
      isPaused: () => eid === null,
      refreshInterval: 1000,
      dedupingInterval: 10,
    }
  );

  if (eid === null || !entity) {
    return null;
  }

  const kind = EntityKindsByValue[entity.kind];

  return (
    <Box
      {...props}
      backgroundColor="#311B92"
      border="2px solid #FF00FF"
      minWidth={300}
    >
      <Flex
        backgroundColor="#B300B3"
        padding={2}
        color="#fff"
        fontWeight={600}
        fontSize="lg"
      >
        <Box flex={1}>
          {kind}: 0x{entity.eid.toString(16).toUpperCase()}
        </Box>
        <IconButton
          aria-label="Close"
          icon={<CloseIcon />}
          size="xs"
          variant="outline"
          onClick={() => setEid(null)}
        />
      </Flex>
      {entity.kind === EntityKind.Ship ? (
        <>
          <HealthBar value={entity.shield} />
          <ShipStats entity={entity} />
        </>
      ) : (
        <>
          <EnergyNodeStats entity={entity} />
        </>
      )}
    </Box>
  );
};

type ShieldBarProps = {
  value: number;
};

export const HealthBar = ({ value }: ShieldBarProps) => {
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

type ShipStatsProps = {
  entity: EntityRow;
};

export const ShipStats = ({ entity }: ShipStatsProps) => {
  const stats = [
    { label: "Energy", value: formatNumber(entity.energy) },
    { label: "Blasters", value: formatNumber(entity.blasters) },
    { label: "Thrusters", value: formatNumber(entity.thrusters) },
    { label: "Harvesters", value: formatNumber(entity.harvesters) },
  ];

  return <StatList p={2} stats={stats} />;
};

type EnergyNodeStatsProps = {
  entity: EntityRow;
};

export const EnergyNodeStats = ({ entity }: EnergyNodeStatsProps) => {
  const stats = [{ label: "Energy", value: formatNumber(entity.energy) }];

  return <StatList p={2} stats={stats} />;
};
