/**
 * Minimal ambient types for the single Cloudflare Pages Function in this repository.
 *
 * The canonical generator is `npx wrangler types`, which writes a worker-configuration.d.ts from
 * wrangler.jsonc. That requires adding wrangler as a devDependency. This project has exactly one
 * function with no bindings beyond plain string secrets, and deploys through the Pages Git
 * integration rather than `wrangler deploy`, so pulling in that toolchain would add dependency
 * and audit surface for two type names. These declarations cover precisely what is used.
 *
 * If bindings are ever added (KV, D1, R2, Durable Objects), delete this file, add wrangler and
 * run `npx wrangler types` instead - hand-maintaining binding types would drift.
 */

interface EventContext<Env = unknown, P extends string = string, Data = Record<string, unknown>> {
  request: Request;
  functionPath: string;
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
  next(input?: Request | string, init?: RequestInit): Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

type PagesFunction<
  Env = unknown,
  P extends string = string,
  Data = Record<string, unknown>,
> = (context: EventContext<Env, P, Data>) => Response | Promise<Response>;
