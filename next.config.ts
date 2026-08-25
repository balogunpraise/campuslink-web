import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @microsoft/signalr does isomorphic transport detection (browser
  // WebSocket vs. Node's `ws`) via a dynamic require, which Next's server
  // bundler can't statically analyze — without this it 500s on every route
  // under (app), since ChatSocketProvider/CallSocketProvider (client
  // components, but still module-evaluated during the server render pass)
  // import it from the shared layout. This defers to Node's native require
  // instead of trying to bundle it, which only matters for that server-side
  // module evaluation — the actual connection only ever runs in the browser.
  serverExternalPackages: ["@microsoft/signalr"],
};

export default nextConfig;
