import Fastify from 'fastify';

export interface FrameworkOptions {
  /**
   * Port of the HTTP server
   */
  port: number;
  /**
   * Host of the HTTP server
   */
  host?: string;
  /**
   * Enable logging
   */
  logger?: boolean;
}

export const server = async ({
  port,
  host,
  logger,
}: FrameworkOptions) => {
  const httpServer = Fastify({
    // maxParamLength: 5000, // Required by tRPC
    logger,
  });

  // await httpServer.register(cors, corsOptions);

  return {
    start: (callback: (
      server: typeof httpServer,
      error: Error | null,
      address: string,
    ) => void) => {
      httpServer.listen(
        { host, port },
        (err, address) => callback(httpServer, err, address),
      );
    },
  };
};
