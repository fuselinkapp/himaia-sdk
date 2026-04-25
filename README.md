# @maia/sdk

> TypeScript client for the Maia Voice API.

Wraps `POST /v1/generate` and `GET /v1/personas`. Two methods, one
`MaiaClient` class, fetch-based — runs in browsers, Node 18+, Bun,
Deno, and edge runtimes.

Apache-2.0. Source: [github.com/maia-voice/sdk](https://github.com/maia-voice/sdk).

## Install

```bash
npm install @maia/sdk
```

## Quick start

```ts
import { MaiaClient } from "@maia/sdk";

const client = new MaiaClient({ apiKey: process.env.MAIA_KEY! });

// Hear the starters.
const { starters } = await client.listPersonas();

// Speak.
const { audio } = await client.generate({
  mode: "voiced",
  persona: "maia/warm_confidant",
  input: "It's been a long week and I don't know where to start.",
});

const url = URL.createObjectURL(audio);
new Audio(url).play();
```

## API

### `new MaiaClient(options)`

| Option   | Type           | Default                | Notes |
|----------|----------------|------------------------|-------|
| `apiKey` | `string`       | required               | Bearer token from the [Maia dashboard](https://himaia.dev). |
| `baseUrl`| `string`       | `https://api.himaia.dev`  | Override for self-hosted / staging. |
| `fetch`  | `typeof fetch` | `globalThis.fetch`     | Inject for tests, polyfills, edge runtimes. |

### `client.listPersonas()` → `Promise<ListPersonasResult>`

Returns `{ personas, starters }`:

- `personas` — built-in TS roster used by the Pro pipeline.
- `starters` — v0.2 YAML personas (`maia/<slug>`) used by Voiced.

### `client.generate(req)` → `Promise<GenerateResult>`

Discriminated by `mode`:

- `{ mode: "basic", text, voice?, tone?, ... }` — plain text → TTS.
- `{ mode: "voiced", persona, input, scene?, voice?, ... }` — single-call persona-driven (recommended for chat / NPC apps).
- `{ mode: "pro", context, persona_id?, format?, fidelity?, ... }` — three-stage cinematic pipeline.

Returns:

```ts
{
  audio: Blob,                       // audio/wav
  headers: Record<string, string>,   // lowercased x-maia-* response headers
  durationSeconds: number | null,
  chargeCents: number | null,
  callId: string | null,
}
```

## Errors

Every non-2xx throws `MaiaError`:

```ts
import { MaiaError } from "@maia/sdk";

try {
  await client.generate({ mode: "voiced", persona: "maia/warm_confidant", input: "" });
} catch (err) {
  if (err instanceof MaiaError) {
    console.error(err.status, err.code, err.message);
  }
  throw err;
}
```

`status` is the HTTP status. `code` is the API's machine-readable
code when present (e.g. `"low_balance"`). `message` is the
human-readable string from the API body.

The SDK does **not** auto-retry. Wrap your own retry logic if you
need it; we resisted prescribing one because the right retry policy
depends on the call site (chat replies want fast-fail; batch
generation wants exponential backoff).

## React example

A 50-line `MaiaPlayer` component is in
[`examples/react-player.tsx`](https://github.com/maia-voice/sdk/blob/main/examples/react-player.tsx).
Drop it into Vite or CRA, pass an `apiKey` prop, done.

## What's not in here

- **Streaming TTS.** The API doesn't stream audio yet; the SDK will
  follow when it does.
- **Auto-retry.** See above.
- **Per-status error subclasses** (`InsufficientBalanceError`, etc.)
  — `err.status` + `err.code` is enough for one-off catches.
- **A CLI binary.** Programmatic only.

## License

Apache-2.0. See `LICENSE`. Made by [Maia](https://himaia.dev).

The `voice.persona` spec the API consumes is also Apache-2.0:
[github.com/maia-voice/voice-persona](https://github.com/maia-voice/voice-persona).
