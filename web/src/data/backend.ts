export type ConnectConfig = {
  endpoints: string[];
  username: string;
  password: string;
  database: string;
};

export const FetchConnectConfig = async (): Promise<ConnectConfig> => {
  const connectURL = import.meta.env.VITE_BACKEND_URL + "/connect";
  let response = await fetch(connectURL);
  if (!response.ok) {
    throw new Error(`Failed to load connection config from ${connectURL}`);
  }
  return (await response.json()) as ConnectConfig;
};
