/**
 * Adapter that exposes the existing Express AI router as Vercel functions.
 *
 * Why an adapter rather than a rewrite: the business logic (validation, the
 * OpenRouter call, safe error normalisation, correlation ids, structured
 * logging) already lives in `buildAiRouter()`. Reimplementing it per function
 * would duplicate that logic six times and let the copies drift. Instead each
 * function is a thin shell that mounts the same router.
 *
 * Vercel hands us Node `IncomingMessage`/`ServerResponse` objects, which
 * Express can consume directly, so no request/response translation is needed.
 *
 * Documented limitation: rate limiting is in-process (`rateLimiter.ts`).
 * Vercel routes requests across many concurrently-scaled instances and freezes
 * them between invocations, so this limit is NOT a global or distributed
 * control and must not be treated as abuse protection. A shared or edge-based
 * limiter remains a separate public-launch requirement.
 */

import express from 'express';
import type { Request, Response } from 'express';
import { buildAiRouter } from './aiRoutes';

/**
 * Vercel's request/response shape is Node's, so these structural types are
 * enough. Declaring them locally avoids adding `@vercel/node` as a dependency.
 */
export interface VercelLikeRequest {
  method?: string;
  url?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

export interface VercelLikeResponse {
  statusCode: number;
  headersSent?: boolean;
  setHeader(name: string, value: string | number): void;
  end(chunk?: any): void;
  write(chunk: any): void;
}

export type VercelHandler = (
  req: VercelLikeRequest,
  res: VercelLikeResponse
) => void | Promise<void>;

/** Match the body cap used by server.ts and the route tests. */
const JSON_BODY_LIMIT = '1mb';

/** Shared Express app used by every AI function (created once per instance). */
function getAiApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use('/api/ai', buildAiRouter());
  return app;
}

/**
 * Build a Vercel function handler for the AI router.
 *
 * The app is created once per function instance (warm invocations reuse it),
 * which also means in-process rate-limiter state persists across warm calls
 * within one instance — but never across instances.
 */
export function createAiHandler(): VercelHandler {
  let app: express.Express | undefined;

  return async (req, res) => {
    if (!app) app = getAiApp();

    const expressReq = req as unknown as Request;
    const expressRes = res as unknown as Response;

    // Vercel parses a JSON body before invoking the function and consumes the
    // raw stream. Express's json() must therefore be skipped when a body was
    // already supplied, or it would wait on an exhausted stream.
    if (expressReq.body === undefined) {
      const parse = express.json({ limit: JSON_BODY_LIMIT });
      await new Promise<void>((resolve) => {
        // A parse failure (payload over the 1 MB cap, malformed JSON) leaves
        // req.body undefined. The request continues into the router, which
        // rejects it with a 400 from the request validators — that is the
        // documented contract, so the error is not forwarded to Express here
        // (doing so would turn the 400 into a 500).
        parse(expressReq, expressRes, () => resolve());
      });
    }

    await new Promise<void>((resolve, reject) => {
      let settled = false;

      /**
       * Settle exactly once. Listeners are detached on settlement so a warm
       * invocation does not accumulate handlers on the response object.
       */
      function settle(err?: unknown): void {
        if (settled) return;
        settled = true;
        expressRes.removeListener('finish', onFinish);
        expressRes.removeListener('close', onClose);
        if (err !== undefined) reject(err);
        else resolve();
      }

      // A matched route responds without ever calling next(), so settlement is
      // driven by the response lifecycle. `close` covers a client that
      // disconnects mid-request: the socket is gone, so nothing is sent.
      const onFinish = () => settle();
      const onClose = () => settle();
      expressRes.once('finish', onFinish);
      expressRes.once('close', onClose);

      try {
        app!(expressReq, expressRes, (err?: unknown) => {
          // Reached only when no route matched, or nothing handled an error.
          try {
            if (!expressRes.headersSent) {
              if (err) {
                expressRes.status(500).json({
                  error: 'An unexpected error occurred. Please try again later.',
                });
              } else {
                expressRes.status(404).json({ error: 'Not found.' });
              }
            }
          } catch (sendErr) {
            // Surface the failure rather than leaving the promise pending.
            settle(sendErr);
            return;
          }

          // If the response already ended without emitting `finish`, settle now.
          if ((expressRes as any).writableEnded) settle();
        });
      } catch (err) {
        settle(err);
      }
    });
  };
}

/**
 * Handler for `GET /api/health`.
 *
 * Mirrors the health route in server.ts: no auth, no AI, no key access.
 */
export function createHealthHandler(): VercelHandler {
  return (req, res) => {
    if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed.' }));
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
  };
}