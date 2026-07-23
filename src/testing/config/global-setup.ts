import { setupServer } from "./server";

export async function setup() {
  const server = await setupServer();
  return async () => {
    await server.close();
  };
}
