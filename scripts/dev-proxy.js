// The CORS proxy `npm run dev` falls back to (see `toProxyUrl` in
// src/utils.ts): http://localhost:36325/<host>/<path> fetches
// https://<host>/<path> and answers with CORS headers, standing in for the
// Cloudflare worker production uses. Many book sites (Project Gutenberg among
// them) send no CORS headers, so without this, opening a book by url fails in
// a plain browser. Electron and the native apps don't need it.
//
// Listens on 127.0.0.1 only: it fetches whatever it is asked to, so it must
// never be reachable from another machine.
import http from "node:http";
import { Readable } from "node:stream";

const PORT = 36325;

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
  "access-control-expose-headers": "*",
};

// Headers that describe the browser's connection to this proxy rather than
// the request itself, or that would make the upstream site see the app's
// origin and apply CORS-style checks of its own.
const DROP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "origin",
  "referer",
  "content-length",
  "accept-encoding",
]);

// fetch decompresses the body, so the upstream encoding and length no longer
// describe what is sent on.
const DROP_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-encoding",
  "set-cookie",
]);

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS).end();
    return;
  }

  const path = (req.url ?? "/").slice(1);
  if (!path) {
    res.writeHead(400, CORS).end("Usage: /<host>/<path>");
    return;
  }
  const target = /^https?:\/\//.test(path) ? path : `https://${path}`;

  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    if (!DROP_REQUEST_HEADERS.has(name) && typeof value === "string") {
      headers[name] = value;
    }
  }

  try {
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await readBody(req) : undefined,
      redirect: "follow",
    });

    const responseHeaders = { ...CORS };
    const encoded = upstream.headers.has("content-encoding");
    upstream.headers.forEach((value, name) => {
      if (DROP_RESPONSE_HEADERS.has(name)) return;
      if (encoded && name === "content-length") return;
      responseHeaders[name] = value;
    });
    res.writeHead(upstream.status, responseHeaders);

    if (upstream.body && req.method !== "HEAD") {
      Readable.fromWeb(upstream.body).pipe(res);
    } else {
      res.end();
    }
    console.log(`${req.method} ${target} ${upstream.status}`);
  } catch (error) {
    console.log(`${req.method} ${target} failed: ${error.message}`);
    res.writeHead(502, CORS).end();
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use; is the proxy already running?`);
    process.exit(1);
  }
  throw error;
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Dev CORS proxy on http://localhost:${PORT}/<host>/<path>`);
});
