const REQUIRED_NAMES = new Set(['GATE — Quality Checks', 'GATE — Secret Scan', 'GATE — Reviewer Response Completion']);

export function normalizeCiEvidence(runs = []) {
  return runs.map((run) => ({
    id: run.id,
    name: run.name,
    required: REQUIRED_NAMES.has(run.name) || run.required === true,
    status: run.status,
    conclusion: run.conclusion || null,
    headSha: run.headSha || null,
  }));
}

export function requiredChecksGreen(checks = []) {
  return checks.filter((check) => check.required).every((check) => check.status === 'completed' && check.conclusion === 'success');
}
