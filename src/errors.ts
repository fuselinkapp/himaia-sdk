// MaiaError — all SDK-thrown errors funnel through this single class.
// No per-status taxonomy until a real consumer asks for one — premature
// abstraction risk is higher than the cost of one extra status check.

export class MaiaError extends Error {
  status: number;
  code: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "MaiaError";
    this.status = status;
    if (code !== undefined) this.code = code;
  }

  static async fromResponse(res: Response): Promise<MaiaError> {
    const status = res.status;
    let body = "";
    try {
      body = await res.text();
    } catch {
      // ignore — response stream may already be consumed
    }
    // Try to extract a structured `message` and `code` from a JSON body;
    // fall back to the raw text or a status-only message.
    let message = body || `HTTP ${status}`;
    let code: string | undefined;
    if (body) {
      try {
        const parsed = JSON.parse(body) as { message?: unknown; code?: unknown };
        if (typeof parsed.message === "string") message = parsed.message;
        if (typeof parsed.code === "string") code = parsed.code;
      } catch {
        // not JSON — keep the raw text
      }
    }
    return new MaiaError(message, status, code);
  }
}
