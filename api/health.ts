/**
 * GET /api/health — Vercel function.
 *
 * Thin shell: all behaviour lives in the shared adapter so the Express server
 * and this function cannot drift apart.
 */
import { createHealthHandler } from '../src/server/vercelAdapter';

export default createHealthHandler();
