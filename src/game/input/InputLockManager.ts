export type InputLockReason =
  | "transition"
  | "settings"
  | "phase-hint"
  | "background"
  | "navigation";

/** Combina bloqueios independentes sem permitir que um fluxo libere outro. */
export class InputLockManager {
  private readonly reasons = new Set<InputLockReason>();

  constructor(initialReasons: InputLockReason[] = []) {
    this.reset(initialReasons);
  }

  get locked(): boolean {
    return this.reasons.size > 0;
  }

  has(reason: InputLockReason): boolean {
    return this.reasons.has(reason);
  }

  lock(reason: InputLockReason): boolean {
    const sizeBefore = this.reasons.size;
    this.reasons.add(reason);
    return this.reasons.size !== sizeBefore;
  }

  unlock(reason: InputLockReason): boolean {
    return this.reasons.delete(reason);
  }

  reset(initialReasons: InputLockReason[] = []): void {
    this.reasons.clear();
    initialReasons.forEach((reason) => this.reasons.add(reason));
  }
}
