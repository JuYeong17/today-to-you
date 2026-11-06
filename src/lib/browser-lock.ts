/** Storage/privacy settings may block Web Locks even when the API exists. */
export async function runWithOptionalLock(
  locks: Pick<LockManager, "request"> | undefined,
  name: string,
  task: () => void,
): Promise<void> {
  if (!locks) { task(); return; }
  let entered = false;
  try {
    await locks.request(name, () => { entered = true; task(); });
  } catch (error) {
    // Only fall back when acquisition failed; never execute a failed task twice.
    if (entered) throw error;
    task();
  }
}
