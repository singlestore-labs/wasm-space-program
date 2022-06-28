export type ConnectConfig = {
  endpoints: string[];
  username: string;
  password: string;
  database: string;
};

export const FetchConnectConfig = async (): Promise<ConnectConfig> => {
  const connectURL = import.meta.env.VITE_BACKEND_URL + "/connect";
  console.log("Loading connection config from " + connectURL);
  try {
    const response = await fetch(connectURL);
    if (!response.ok) {
      throw new Error(
        `Received error response from server (${response.status}): ${response.statusText}`
      );
    }
    return (await response.json()) as ConnectConfig;
  } catch (err) {
    throw new Error(`Failed to load connection config: ${err}`);
  }
};
