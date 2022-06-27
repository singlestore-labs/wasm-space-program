import { CodeBlock } from "@/components/CodeBlock";
import { unhandledErrorAtom } from "@/data/atoms";
import { SQLError } from "@/data/client";
import { RepeatIcon, WarningTwoIcon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import React, { ReactNode } from "react";
import { SWRConfig } from "swr";
import dedent from "ts-dedent";

type Props = { children: ReactNode };

export const ErrorOverlay = ({ children }: Props) => {
  const error = useAtomValue(unhandledErrorAtom);
  return error ? <Error error={error} /> : <>{children}</>;
};

export const ErrorBoundary = ({ children }: Props) => {
  const setError = useSetAtom(unhandledErrorAtom);
  return (
    <ErrorBoundaryInternal onError={setError}>
      <SWRConfig value={{ onError: setError, dedupingInterval: 100 }}>
        {children}
      </SWRConfig>
    </ErrorBoundaryInternal>
  );
};

const Error = ({ error }: { error: Error }) => {
  const setError = useSetAtom(unhandledErrorAtom);

  let info;
  if (error instanceof SQLError) {
    info = (
      <>
        <Text textAlign="center">
          An error occurred while running the following query:
        </Text>
        <CodeBlock>{dedent(error.sql)}</CodeBlock>
      </>
    );
  }

  return (
    <Container maxW="container.md" my={10}>
      <Stack gap={4}>
        <Center>
          <WarningTwoIcon boxSize={20} color="red.200" />
        </Center>
        <Heading size="xl" textAlign="center">
          {error.message}
        </Heading>
        {info}
        <HStack justify="center" gap={4}>
          <Button
            onClick={() => setError(null)}
            backgroundColor="neutral.500"
            size="sm"
          >
            Dismiss Error
          </Button>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            colorScheme="purple"
            leftIcon={<RepeatIcon />}
          >
            Reload
          </Button>
        </HStack>
      </Stack>
    </Container>
  );
};

type ErrorBoundaryProps = {
  children: ReactNode;
  onError: (error: Error) => void;
};

class ErrorBoundaryInternal extends React.Component<ErrorBoundaryProps> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.handlePromiseRejection = this.handlePromiseRejection.bind(this);
  }

  componentDidMount() {
    window.addEventListener("unhandledrejection", this.handlePromiseRejection);
  }

  componentWillUnmount() {
    window.removeEventListener(
      "unhandledrejection",
      this.handlePromiseRejection
    );
  }

  handlePromiseRejection(ev: PromiseRejectionEvent) {
    this.props.onError(ev.reason);
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}
