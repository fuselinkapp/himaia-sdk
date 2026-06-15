// Public types for himaia-sdk. Mirrors the API contract documented in
// `apps/api/src/routes/generate.ts` and `apps/api/src/routes/personas.ts`.
//
// VoicePersona shape below is a structural alias of the type exported by
// `apps/voice-persona/src/types.ts`. Once `voice-persona` is added as a
// package dependency (add `"voice-persona": "workspace:*"` to devDependencies
// and run `pnpm install`), replace this inline definition with:
//   import type { VoicePersona } from "voice-persona";
// and remove the local alias. The API compiler already validates the full shape
// at runtime, so any structural superset will round-trip cleanly.
//
// INTEGRATION NOTE: keep this alias in sync with apps/voice-persona/src/types.ts
// whenever new fields are added to the spec.

// Scalar types mirroring voice-persona spec.
type _Scalar5 = "none" | "low" | "mid" | "high" | "max";
type _Fidelity = "verbatim" | "shape" | "rewrite";
type _Pitch = "low" | "mid" | "high";
type _Texture = "soft" | "clear" | "raspy" | "breathy" | "nasal";
type _Rate = "rushed" | "steady" | "unhurried" | "deliberate";
type _PitchRange = "narrow" | "standard" | "wide";
type _Level3 = "low" | "mid" | "high";
type _Valence = "negative" | "neutral" | "positive";
type _AgeGate = "none" | "13+" | "18+";
type _RomanticLevel = "none" | "warm_not_sexual" | "romantic" | "explicit";
type _AgeRegister = "child" | "teen" | "adult" | "elder" | "none";
type _GenderPresentation = "fem" | "masc" | "neutral" | "none";
type _WontDoCategory = "tone" | "romantic" | "violence" | "politics" | "self_harm" | "medical" | "other";
type _ArrayMergeOp = { $append?: string[]; $prepend?: string[]; $replace?: string[]; $remove?: string[] };

/** Structural alias for the voice.persona v0.2.1 document shape.
 *  Pass directly to VoicedRequest.persona for inline persona calls. */
export type VoicePersonaDoc = {
  spec_version: "0.2";
  id: string;
  version: string;
  name: string;
  locale: string;
  extends?: string;
  identity: {
    tagline: string;
    description?: string;
    archetype?: string;
    age_register?: _AgeRegister;
    gender_presentation?: _GenderPresentation;
    sociolect?: string;
  };
  pov?: {
    values?: string[];
    beliefs?: string[];
    taboos?: string[];
    wont_do?: { text: string; category: _WontDoCategory }[];
  };
  idiolect?: {
    signatures?: string[];
    banned_phrases?: string[];
    register_shifts?: { peer?: string; authority?: string; stranger?: string };
    formality?: _Scalar5;
    humor?: _Scalar5;
    warmth?: _Scalar5;
    directness?: _Scalar5;
    vulgarity?: _Scalar5;
    disfluency?: "none" | "sparing" | "natural";
    sentence_length?: "short" | "medium" | "long" | "varied";
  };
  voice?: {
    timbre?: { warmth?: _Scalar5; pitch?: _Pitch; texture?: _Texture };
    prosody?: {
      rate?: _Rate;
      pitch_range?: _PitchRange;
      energy?: _Level3;
      arousal?: _Level3;
      valence?: _Valence;
    };
    preferred_id?: string;
    fidelity_default?: _Fidelity;
    /** v0.2.1: paralinguistic cues — max 12 entries, each <= 24 chars. */
    delivery_cues?: string[];
  };
  pronunciation_overrides?: Record<string, string>;
  emotional_range?: { floor?: _Scalar5; ceiling?: _Scalar5 };
  greetings?: string[];
  examples?: {
    scene: { format?: string; dialogue_act?: string };
    user: string;
    assistant: string;
  }[];
  scenes?: {
    format?: Record<string, {
      prosody?: VoicePersonaDoc["voice"] extends { prosody?: infer P } ? P : never;
      idiolect?: Partial<NonNullable<VoicePersonaDoc["idiolect"]>> & {
        signatures?: string[] | _ArrayMergeOp;
        banned_phrases?: string[] | _ArrayMergeOp;
      };
      dialogue_act_default?: string;
      greetings?: string[] | { $append?: string[] };
      fidelity_default?: _Fidelity;
      /** v0.2.1 */
      direction?: string;
    }>;
    dialogue_act?: Record<string, {
      prosody?: VoicePersonaDoc["voice"] extends { prosody?: infer P } ? P : never;
      idiolect?: Partial<NonNullable<VoicePersonaDoc["idiolect"]>> & {
        signatures?: string[] | _ArrayMergeOp;
        banned_phrases?: string[] | _ArrayMergeOp;
      };
      fidelity_default?: _Fidelity;
      /** v0.2.1 */
      direction?: string;
    }>;
  };
  safety: {
    age_gate: _AgeGate;
    romantic?: _RomanticLevel;
    self_harm_policy?: string;
    political_stance?: string;
    licensed_voice?: boolean;
  };
  extensions?: Record<string, unknown>;
  author: { handle: string; url?: string };
  license: string;
  changelog?: { version: string; date: string; notes: string }[];
};

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
  // Passing a VoicePersonaDoc gives compile-time validation of the inline shape.
  // A plain Record<string,unknown> is still accepted for backward compatibility.
  persona: string | VoicePersonaDoc | Record<string, unknown>;
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

// Response of GET /v1/personas. Two parallel rosters: built-in personas used
// by the Cinematic pipeline, and the open v0.2 YAML starters used by Voiced.

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
