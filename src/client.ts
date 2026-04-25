import { HimaiaError } from "./errors.js";
import type {
  GenerateRequest,
  GenerateResult,
  ListPersonasResult,
} from "./types.js";

const DEFAULT_BASE_URL = "https://api.himaia.dev";

export type HimaiaClientOptions = {
  /** Bearer token from the himaia dashboard. */
  apiKey: string;
  /** Override the API origin. Defaults to https://api.himaia.dev. */
  baseUrl?: string;
  /** Inject a custom fetch — useful for tests, edge runtimes, or polyfills. */
  fetch?: typeof fetch;
};

export class HimaiaClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: HimaiaClientOptions) {
    if (!opts?.apiKey) throw new Error("HimaiaClient: apiKey is required");
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    // `window.fetch` / `globalThis.fetch` must be called with the global as
    // `this` in some browser engines — calling a bare reference throws
    // "Illegal invocation" in Chromium. Bind defensively when the caller
    // didn't already supply a bound override.
    const rawFetch = opts.fetch ?? globalThis.fetch;
    if (typeof rawFetch !== "function") {
      throw new Error(
        "HimaiaClient: no fetch available. Pass `fetch` in options on a runtime that doesn't ship it.",
      );
    }
    this.fetchImpl = opts.fetch ?? rawFetch.bind(globalThis);
  }

  /**
   * GET /v1/personas — built-in TS personas + v0.2 YAML starters in one call.
   */
  async listPersonas(): Promise<ListPersonasResult> {
    const res = await this.fetchImpl(`${this.baseUrl}/v1/personas`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw await HimaiaError.fromResponse(res);
    const body = (await res.json()) as Partial<ListPersonasResult>;
    return {
      personas: body.personas ?? [],
      starters: body.starters ?? [],
    };
  }

  /**
   * POST /v1/generate — returns the audio blob + the call's response headers.
   * Discriminated by `mode`; the SDK type-checks the request shape per mode.
   */
  async generate(req: GenerateRequest): Promise<GenerateResult> {
    const res = await this.fetchImpl(`${this.baseUrl}/v1/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw await HimaiaError.fromResponse(res);

    const audio = await res.blob();
    const headers = lowercaseHeaders(res.headers);
    const seconds = parseFloat(headers["x-maia-seconds"] ?? "");
    const cents = parseInt(headers["x-maia-charge-cents"] ?? "", 10);
    return {
      audio,
      headers,
      durationSeconds: Number.isFinite(seconds) ? seconds : null,
      chargeCents: Number.isFinite(cents) ? cents : null,
      callId: headers["x-maia-call-id"] ?? null,
    };
  }
}

function lowercaseHeaders(h: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  h.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}
