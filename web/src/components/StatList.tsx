import { Box, Flex, Stack, StackProps } from "@chakra-ui/react";

type Props = {
  stats: { label: string; value: string }[];
} & StackProps;

export const StatList = ({ stats, ...rest }: Props) => {
  return (
    <Stack fontSize="md" spacing={0} {...rest}>
      {stats.map((item, idx) => (
        <Flex key={idx}>
          <Box flex="1" pr={8}>
            {item.label}
          </Box>
          <Box textAlign="right">{item.value}</Box>
        </Flex>
      ))}
    </Stack>
  );
};
