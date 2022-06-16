import { Code, HTMLChakraProps, ThemingProps } from "@chakra-ui/react";

export interface Props extends HTMLChakraProps<"code">, ThemingProps<"Code"> {}

export const CodeBlock = ({ children, ...props }: Props) => (
  <Code
    as="pre"
    borderRadius="md"
    overflow="auto"
    display="block"
    px={6}
    py={4}
    minW={0}
    {...props}
  >
    {children}
  </Code>
);
