// Public types for himaia-sdk. Mirrors the API contract documented in
// `apps/api/src/routes/generate.ts` and `apps/api/src/routes/personas.ts`.

export type Mode = "basic" | "voiced" | "cinematic";
export type Fidelity = "verbatim" | "shape" | "rewrite";
export type Move =
  | "encourage"
  | "challenge"
  | "reframe"
  | "direct"
  | "witness"
  | "soothe"
  | "celebrate"
  | "question"
  | "warn"
  | "inform";

export type SceneInput = {
  format?: string;
  dialogue_act?: string;
};

export type PersonaOverrides = {
  personaName?: string;
  userName?: string;
  userGoal?: string;
  toneNudges?: string;
};

// Discriminated by `mode`. The SDK's generate() method narrows on this so
// `client.generate({ mode: "voiced", text: "x" })` is a compile-time error.

export type BasicRequest = {
  mode: "basic";
  text: string;
  voice?: string;
  tone?: string;
  expressiveness?: number;
  languageCode?: string;
};

export type VoicedRequest = {
  mode: "voiced";
  // Either a registered starter id ("himaia/<slug>" or "himaia/<slug>@<version>"),
  // or a full inline persona doc (your forked .persona.yaml as JSON). The runtime
  // validates the inline doc against the v0.2 spec and runs it directly — no
  // upload, no account state.
  persona: string | Record<string, unknown>;
  input: string;
  scene?: SceneInput;
  // Per-call override for how closely the spoken turn follows `input`.
  // verbatim: read input as-is (persona owns delivery only).
  // shape (default behavior): tighten + fit to idiolect, keep key phrases.
  // rewrite: input is a brief; persona writes freely.
  // Wins over the persona's `voice.fidelity_default` and any scene override.
  fidelity?: Fidelity;
  voice?: string;
  tone?: string;
  expressiveness?: number;
  languageCode?: string;
};

export type CinematicRequest = {
  mode: "cinematic";
  context: string;
  persona_id?: string;
  move?: Move;
  fidelity?: Fidelity;
  target_seconds?: number;
  overrides?: PersonaOverrides;
  voice?: string;
  tone?: string;
  expressiveness?: number;
  languageCode?: string;
};

export type GenerateRequest = BasicRequest | VoicedRequest | CinematicRequest;

export type GenerateResult = {
  audio: Blob;
  /** Raw response headers, lowercased. Includes x-himaia-* fields. */
  headers: Record<string, string>;
  durationSeconds: number | null;
  chargeCents: number | null;
  callId: string | null;
};

// Response of GET /v1/personas. Two parallel rosters: legacy built-in personas
// (used by Cinematic pipeline) and the v0.2 YAML starters (used by Voiced).

export type BuiltinPersona = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "builtin" | "user";
  scope: "built_in" | "user";
  defaults: { tone: string; move: Move; voice?: string };
};

export type StarterSummary = {
  id: string; // "himaia/<slug>"
  version: string;
  name: string;
  tagline: string;
  description?: string;
  archetype?: string;
  age_register?: string;
  locale: string;
  scene_formats: string[];
  scene_dialogue_acts: string[];
  greetings_count: number;
  examples_count: number;
  safety: { age_gate: string; romantic?: string };
  license: string;
  author: { handle: string; url?: string };
};

export type ListPersonasResult = {
  personas: BuiltinPersona[];
  starters: StarterSummary[];
};
