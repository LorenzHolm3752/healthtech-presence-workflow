import assert from "node:assert/strict";
import { announceOperationalUpdate } from "./presence-service.js";

const calls: Array<{ path: string; body?: unknown }> = [];
const fake = { createChannel: async (channel: string) => { calls.push({ path: "create", body: { channel } }); }, getPresence: async () => [{ id: "nurse-1" }], publish: async (...args: unknown[]) => { calls.push({ path: "publish", body: args }); } };
const result = await announceOperationalUpdate({ channel: "clinic:triage", account_id: "acct-1", kind: "care-team-note", message: "A clinician is online." }, fake as never);
assert.equal(result.published, true);
assert.equal(calls[1].path, "publish");
assert.equal((calls[1].body as unknown[])[1], "operational.update");
console.log("presence decision test passed");
