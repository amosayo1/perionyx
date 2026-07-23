import http from "http";

export async function setupServer(): Promise<http.Server> {
  const server = http.createServer((_req, res) => {
    res.writeHead(200);
    res.end("ok");
  });
  return new Promise((resolve) => {
    server.listen(0, () => resolve(server));
  });
}
