// node --test test/client.test.mjs
// Build first: pnpm build.

import { test } from "node:test";
import assert from "node:assert/strict";

import { HimaiaClient, HimaiaError } from "../dist/index.js";

// Tiny fetch mock — controls (status, headers, body) per call.
function mockFetch(plan) {
  const calls = [];
  const queue = Array.isArray(plan) ? [...plan] : [plan];
  const fn = async (url, init) => {
    calls.push({ url: String(url), init });
    const resp = queue.shift() ?? plan;
    const headers = new Headers(resp.headers ?? {});
    return {
      ok: (resp.status ?? 200) < 400,
      status: resp.status ?? 200,
      headers,
      text: async () => (typeof resp.body === "string" ? resp.body : JSON.stringify(resp.body ?? {})),
      json: async () => (typeof resp.body === "string" ? JSON.parse(resp.body) : resp.body ?? {}),
      blob: async () => new Blob([resp.body ?? new Uint8Array()], { type: "audio/wav" }),
    };
  };
  return { fn, calls };
}

test("listPersonas returns {personas, starters}", async () => {
  const { fn, calls } = mockFetch({
    body: { personas: [{ id: "mentor" }], starters: [{ id: "himaia/warm_confidant" }] },
  });
  const client = new HimaiaClient({ apiKey: "himaia_test_x", fetch: fn });
  const result = await client.listPersonas();
  assert.equal(result.personas.length, 1);
  assert.equal(result.starters.length, 1);
  assert.equal(calls[0].url, "https://api.himaia.dev/v1/personas");
  assert.equal(calls[0].init.headers.Authorization, "Bearer himaia_test_x");
});

test("generate posts the right body and parses response headers", async () => {
  const { fn, calls } = mockFetch({
    body: new Uint8Array([1, 2, 3, 4]),
    headers: {
      "x-maia-call-id": "call_abc",
      "x-maia-seconds": "4.123",
      "x-maia-charge-cents": "7",
    },
  });
  const client = new HimaiaClient({ apiKey: "himaia_test_x", fetch: fn });
  const result = await client.generate({
    mode: "voiced",
    persona: "himaia/warm_confidant",
    input: "It's been a long week.",
    scene: { format: "comfort", dialogue_act: "reassure" },
  });
  assert.ok(result.audio instanceof Blob);
  assert.equal(result.callId, "call_abc");
  assert.equal(result.durationSeconds, 4.123);
  assert.equal(result.chargeCents, 7);

  const sent = JSON.parse(calls[0].init.body);
  assert.equal(sent.mode, "voiced");
  assert.equal(sent.persona, "himaia/warm_confidant");
  assert.deepEqual(sent.scene, { format: "comfort", dialogue_act: "reassure" });
  assert.equal(calls[0].init.headers["Content-Type"], "application/json");
});

test("non-2xx throws HimaiaError with status + parsed body message", async () => {
  const { fn } = mockFetch({
    status: 402,
    body: { message: "insufficient balance (need ≥5¢)", code: "low_balance" },
  });
  const client = new HimaiaClient({ apiKey: "himaia_test_x", fetch: fn });
  await assert.rejects(
    () => client.generate({ mode: "voiced", persona: "himaia/warm_confidant", input: "x" }),
    (err) =>
      err instanceof HimaiaError &&
      err.status === 402 &&
      /insufficient balance/.test(err.message) &&
      err.code === "low_balance",
  );
});

test("baseUrl override works", async () => {
  const { fn, calls } = mockFetch({ body: { personas: [], starters: [] } });
  const client = new HimaiaClient({
    apiKey: "himaia_test_x",
    baseUrl: "http://localhost:8080",
    fetch: fn,
  });
  await client.listPersonas();
  assert.equal(calls[0].url, "http://localhost:8080/v1/personas");
});

test("constructor rejects missing apiKey", () => {
  assert.throws(
    () => new HimaiaClient({ apiKey: "", fetch: globalThis.fetch }),
    /apiKey is required/,
  );
});

test("HimaiaError.fromResponse handles a body that fails to read", async () => {
  // Mock a 500 whose .text() rejects (e.g. already-consumed stream).
  const fn = async () => ({
    ok: false,
    status: 500,
    headers: new Headers(),
    text: async () => { throw new Error("body already consumed"); },
    json: async () => ({}),
    blob: async () => new Blob([]),
  });
  const client = new HimaiaClient({ apiKey: "himaia_test_x", fetch: fn });
  await assert.rejects(
    () => client.listPersonas(),
    (err) => err instanceof HimaiaError && err.status === 500,
  );
});
