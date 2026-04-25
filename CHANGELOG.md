# Changelog

## 0.1.0 — initial release

First public release. Apache-2.0.

### Surface

- `HimaiaClient` class with `listPersonas()` and `generate()` methods.
- `HimaiaError` with `status` and `code` fields.
- TypeScript types matching the API contract: `BasicRequest`,
  `VoicedRequest`, `CinematicRequest` (discriminated by `mode`),
  `GenerateResult`, `ListPersonasResult`, `StarterSummary`,
  `BuiltinPersona`, etc.

### Runtime

- ESM only. Pure fetch-based; no node-only deps.
- Custom `fetch` injection via the constructor for tests, polyfills,
  and edge runtimes.
- Returns audio as a `Blob` (works in browsers, Node 18+, Bun, Deno,
  edge). Server-side consumers who want raw bytes call `.arrayBuffer()`.

### Examples

- `examples/react-player.tsx` — 50-line `HimaiaPlayer` component.

### Known gaps

- No streaming TTS (API doesn't stream yet; tracked).
- No auto-retry / rate-limit handling.
- No per-status error subclasses.
- No CLI binary.
