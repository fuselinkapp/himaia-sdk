// Public types for himaia-sdk. Mirrors the API contract documented in
// `apps/api/src/routes/generate.ts` and `apps/api/src/routes/personas.ts`.

export type Mode = "basic" | "voiced" | "pro";
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
  persona: string; // "himaia/<slug>" or "himaia/<slug>@<version>"
  input: string;
  scene?: SceneInput;
  voice?: string;
  tone?: string;
  expressiveness?: number;
  languageCode?: string;
};

export type CinematicRequest = {
  mode: "pro";
  context: string;
  persona_id?: string;
  format?: string;
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
  /** Raw response headers, lowercased. Includes x-maia-* fields. */
  headers: Record<string, string>;
  durationSeconds: number | null;
  chargeCents: number | null;
  callId: string | null;
};

// Response of GET /v1/personas. Two parallel rosters: legacy built-in personas
// (used by Pro pipeline) and the v0.2 YAML starters (used by Voiced).

export type BuiltinPersona = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "core" | "specialist" | "user";
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
