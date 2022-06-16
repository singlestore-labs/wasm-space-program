import { AlertStatus, useToast } from "@chakra-ui/react";
import { ReactNode } from "react";
import { SWRConfig } from "swr";

export const SWRWrapper = ({ children }: { children: ReactNode }) => {
  const toast = useToast();
  const handleError = (err: Error) => {
    console.error(err);
    const t = {
      id: "swr-error",
      title: "An error occurred",
      description: err.message,
      status: "error" as AlertStatus,
      duration: 5000,
      isClosable: true,
    };
    if (toast.isActive(t.id)) {
      toast.update(t.id, t);
    } else {
      toast(t);
    }
  };

  return <SWRConfig value={{ onError: handleError }}>{children}</SWRConfig>;
};