// himaia-sdk — TypeScript client for the himaia voice API.
// Apache-2.0. https://github.com/fuselinkapp/himaia-sdk

export { HimaiaClient } from "./client.js";
export type { HimaiaClientOptions } from "./client.js";

export { HimaiaError } from "./errors.js";

export type {
  Mode,
  Fidelity,
  Move,
  SceneInput,
  PersonaOverrides,
  BasicRequest,
  VoicedRequest,
  CinematicRequest,
  GenerateRequest,
  GenerateResult,
  BuiltinPersona,
  StarterSummary,
  ListPersonasResult,
} from "./types.js";
