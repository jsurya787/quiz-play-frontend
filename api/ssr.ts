import { pathToFileURL } from 'node:url';
import path from 'node:path';

type NodeHandler = (req: any, res: any) => unknown | Promise<unknown>;

let cachedHandler: NodeHandler | null = null;

async function getSsrHandler(): Promise<NodeHandler> {
  if (cachedHandler) return cachedHandler;

  // Built by `ng build && ng run LearnGround:server`
  const serverEntry = path.join(
    process.cwd(),
    'dist',
    'LearnGround',
    'server',
    'server.mjs',
  );

  const mod: any = await import(pathToFileURL(serverEntry).href);

  // `src/server.ts` exports `reqHandler` via `createNodeRequestHandler(app)`
  const handler: NodeHandler | undefined =
    mod.reqHandler ?? mod.default ?? mod.handler ?? mod.app;

  if (!handler) {
    throw new Error(
      'SSR handler not found. Expected export: reqHandler (or default).',
    );
  }

  cachedHandler = handler;
  return handler;
}

export default async function handler(req: any, res: any) {
  const ssr = await getSsrHandler();
  return ssr(req, res);
}

