import test from "node:test";
import assert from "node:assert/strict";
import { runWithOptionalLock } from "../src/lib/browser-lock.ts";

test("blocked and missing Web Locks still allow exactly one local draw", async () => {
  let draws = 0;
  await runWithOptionalLock(undefined, "daily", () => { draws++; });
  assert.equal(draws, 1);
  const blocked = { request: async () => { throw new Error("SecurityError"); } } as Pick<LockManager, "request">;
  await runWithOptionalLock(blocked, "daily", () => { draws++; });
  assert.equal(draws, 2);
});

test("an error inside the protected task is not retried", async () => {
  let draws = 0;
  const locks = { request: async (_name: string, callback: () => void) => callback() } as Pick<LockManager, "request">;
  await assert.rejects(runWithOptionalLock(locks, "daily", () => { draws++; throw new Error("failed task"); }), /failed task/);
  assert.equal(draws, 1);
});
