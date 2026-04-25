// @maia/sdk — TypeScript client for the Maia Voice API.
// Apache-2.0. https://github.com/fuselinkapp/maia-sdk

export { MaiaClient } from "./client.js";
export type { MaiaClientOptions } from "./client.js";

export { MaiaError } from "./errors.js";

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
