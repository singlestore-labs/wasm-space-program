import { AlertStatus, useToast } from "@chakra-ui/react";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import { BareFetcher, Key, SWRConfig, SWRConfiguration, SWRHook } from "swr";

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

// copied from swr docs and converted to typescript
// https://swr.vercel.app/docs/middleware#keep-previous-result
export const swrLaggy = (useSWRNext: SWRHook) => {
  return <Data, Error>(
    key: Key,
    fetcher: BareFetcher<Data> | null,
    config: SWRConfiguration<Data, Error, BareFetcher<Data>>
  ) => {
    // Use a ref to store previous returned data.
    const laggyDataRef = useRef<Data | undefined>();

    // Actual SWR hook.
    const swr = useSWRNext(key, fetcher, config);

    useEffect(() => {
      // Update ref if data is not undefined.
      if (swr.data !== undefined) {
        laggyDataRef.current = swr.data;
      }
    }, [swr.data]);

    // Expose a method to clear the laggy data, if any.
    const resetLaggy = useCallback(() => {
      laggyDataRef.current = undefined;
    }, []);

    // Fallback to previous data if the current data is undefined.
    const dataOrLaggyData =
      swr.data === undefined ? laggyDataRef.current : swr.data;

    // Is it showing previous data?
    const isLagging =
      swr.data === undefined && laggyDataRef.current !== undefined;

    // Also add a `isLagging` field to SWR.
    return Object.assign({}, swr, {
      data: dataOrLaggyData,
      isLagging,
      resetLaggy,
    });
  };
};
