// Minimal React example for himaia-sdk. Drop into a Vite/CRA project:
//   npm install himaia-sdk
// Then render <HimaiaPlayer apiKey="mvk_live_..." />.
//
// What it does: lists the v0.2 starter personas, lets the user pick one,
// types an input, hits the API, and plays the returned audio. ~50 lines
// of substance — everything else is JSX scaffolding.

import { useEffect, useMemo, useState } from "react";
import { HimaiaClient, type StarterSummary } from "himaia-sdk";

export function HimaiaPlayer({ apiKey }: { apiKey: string }) {
  // useMemo with [apiKey] — single client per apiKey value. Avoids the
  // common `useRef(new HimaiaClient(...))` trap that allocates per render.
  const client = useMemo(() => new HimaiaClient({ apiKey }), [apiKey]);
  const [starters, setStarters] = useState<StarterSummary[]>([]);
  const [persona, setPersona] = useState("");
  const [input, setInput] = useState("It's been a long week and I don't know where to start.");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .listPersonas()
      .then((r) => {
        setStarters(r.starters);
        if (r.starters.length > 0) setPersona(r.starters[0]!.id);
      })
      .catch((e) => setError(String(e)));
  }, [client]);

  // Revoke the current blob URL when it changes or the component unmounts.
  useEffect(() => {
    if (!audioUrl) return;
    return () => URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function speak() {
    if (!persona || !input.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const result = await client.generate({ mode: "voiced", persona, input });
      setAudioUrl(URL.createObjectURL(result.audio));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, fontFamily: "system-ui" }}>
      <h2>himaia voice — quick demo</h2>
      <select value={persona} onChange={(e) => setPersona(e.target.value)} style={{ width: "100%" }}>
        {starters.map((s) => (
          <option key={s.id} value={s.id}>{s.name} — {s.tagline}</option>
        ))}
      </select>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        style={{ width: "100%", marginTop: 12 }}
      />
      <button onClick={speak} disabled={loading || !persona} style={{ marginTop: 12 }}>
        {loading ? "Generating…" : "Speak"}
      </button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {audioUrl && <audio controls src={audioUrl} style={{ marginTop: 12, width: "100%" }} />}
    </div>
  );
}
