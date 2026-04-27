# Changelog

## 0.3.0 — persona roster pruning

### Breaking

- `BuiltinPersona.category` is now `"builtin" | "user"` (was `"core" | "specialist" | "user"`). The `"specialist"` distinction is gone; everything that ships with himaia is `"builtin"`.
- The `sales-closer`, `language-tutor`, and `fitness-coach` slugs were dropped from the built-in roster. They auto-redirect to `presenter` / `teacher` / `announcer` respectively at the API edge — your calls keep working, but `GET /v1/personas` no longer returns them.

## 0.2.1 — README

- Document the Voiced `fidelity` field (was exported in 0.2.0 but undocumented).
- Switch the cinematic example from legacy `mode: "pro"` to `mode: "cinematic"`.

## 0.2.0 — header rename + fidelity override

### Breaking

- Response headers renamed from `x-maia-*` to `x-himaia-*` to match the
  product brand. Affects `result.callId`, `result.seconds`, `result.charge`,
  `result.fidelity`, etc. — they will read as `null`/`0` against any
  pre-0.2.0 server. Upgrade the API runtime alongside the SDK.

### Added

- `VoicedRequest.fidelity` — per-call override (`verbatim` | `shape` |
  `rewrite`) that wins over the persona's `voice.fidelity_default` and
  any scene override.

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
