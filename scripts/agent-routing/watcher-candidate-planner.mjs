export function rankWatcherCandidates(candidates = []) {
  return candidates
    .filter((candidate) => candidate.responsibility === 'chatgpt' && candidate.safety > 0)
    .map((candidate) => ({
      ...candidate,
      score: candidate.safety * 1000 + candidate.priority * 100 + candidate.unblockValue * 10 + candidate.objectiveImpact + (candidate.hasAlert ? 5 : 0),
    }))
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));
}
