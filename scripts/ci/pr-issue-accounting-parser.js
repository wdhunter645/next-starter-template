function issueUrlBelongsToCurrentRepo(issueUrl, owner, repo) {
  try {
    const url = new URL(issueUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    return url.hostname.toLowerCase() === 'github.com'
      && parts.length === 4
      && parts[0].toLowerCase() === owner.toLowerCase()
      && parts[1].toLowerCase() === repo.toLowerCase()
      && parts[2] === 'issues'
      && /^\d+$/.test(parts[3]);
  } catch (_error) {
    return false;
  }
}

function issueNumberFromRef(ref, owner, repo) {
  const value = (ref || '').trim().replace(/[).,;]+$/g, '');
  const local = value.match(/^#(\d+)$/);
  if (local) return Number(local[1]);
  if (!issueUrlBelongsToCurrentRepo(value, owner, repo)) return null;
  const parts = new URL(value).pathname.split('/').filter(Boolean);
  return Number(parts[3]);
}

function normalizeIssueReferenceLine(line) {
  return (line || '')
    .trim()
    .replace(/^[>\s]*[-*+]\s+/, '')
    .replace(/[`*_]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pushIssueRef(refs, invalidRefs, ref, source, owner, repo) {
  const issueNumber = issueNumberFromRef(ref, owner, repo);
  if (!issueNumber || Number.isNaN(issueNumber)) {
    invalidRefs.push({ ref, source });
    return;
  }
  refs.push({ issueNumber, source });
}

function issueRefTokens(value) {
  const tokenPattern = /#\d+|https:\/\/github\.com\/[^\s)]+\/[^\s)]+\/issues\/\d+\/?/gi;
  return (value || '').match(tokenPattern) || [];
}

function semanticIssueRefsFromLine(line, owner, repo) {
  const refs = [];
  const invalidRefs = [];
  const normalizedLine = normalizeIssueReferenceLine(line);
  const semantic = normalizedLine.match(/^(?:related\s+)?issue\b(?:\s*:)?\s*(.*)$/i);
  if (!semantic) return { refs, invalidRefs, matched: false };

  const tokens = issueRefTokens(semantic[1]);
  for (const token of tokens) {
    pushIssueRef(refs, invalidRefs, token, 'primary-body-line', owner, repo);
  }
  return { refs, invalidRefs, matched: true };
}

function semanticLineContainsIssueNumber(line, issueNumber) {
  const normalizedLine = normalizeIssueReferenceLine(line);
  const semantic = normalizedLine.match(/^(?:related\s+)?issue\b(?:\s*:)?\s*(.*)$/i);
  if (!semantic) return false;

  return issueRefTokens(semantic[1]).some((token) => {
    const value = token.trim().replace(/[).,;]+$/g, '');
    const local = value.match(/^#(\d+)$/);
    if (local) return Number(local[1]) === issueNumber;

    try {
      const parts = new URL(value).pathname.split('/').filter(Boolean);
      return parts.length === 4 && parts[2] === 'issues' && Number(parts[3]) === issueNumber;
    } catch (_error) {
      return false;
    }
  });
}

function closingIssueRefsFromLine(line, owner, repo) {
  const refs = [];
  const invalidRefs = [];
  const closingPattern = /\b(?:closes|close|closed|fixes|fix|fixed|resolves|resolve|resolved)\s+(#\d+|https:\/\/github\.com\/[^\s)]+\/[^\s)]+\/issues\/\d+\/?)/gi;
  let closing;
  while ((closing = closingPattern.exec(line || '')) !== null) {
    pushIssueRef(refs, invalidRefs, closing[1], 'closing-keyword-body-line', owner, repo);
  }
  return { refs, invalidRefs };
}

function issueRefsFromBody(body, owner, repo) {
  const refs = [];
  const invalidRefs = [];
  const lines = (body || '').split('\n');

  for (const line of lines) {
    if (/OPS\s+Tracker/i.test(line)) continue;
    if (/Umbrella\s+Tracker/i.test(line)) continue;

    const semantic = semanticIssueRefsFromLine(line, owner, repo);
    refs.push(...semantic.refs);
    invalidRefs.push(...semantic.invalidRefs);
    if (semantic.matched) continue;

    const closing = closingIssueRefsFromLine(line, owner, repo);
    refs.push(...closing.refs);
    invalidRefs.push(...closing.invalidRefs);
  }

  return { refs, invalidRefs };
}

function issueRefsFromBranch(ref) {
  const refs = [];
  const patterns = [
    /(?:^|[-_/])issue[-_/]?(\d+)(?:$|[-_/])/i,
    /(?:^|[-_/])(\d{3,6})(?:[-_/][A-Za-z]|$)/,
  ];
  for (const pattern of patterns) {
    const match = (ref || '').match(pattern);
    if (match) {
      refs.push({ issueNumber: Number(match[1]), source: 'branch-name' });
      break;
    }
  }
  return refs;
}

function issueRefsFromTrustedSources(body, branchRef, owner, repo) {
  const bodyRefs = issueRefsFromBody(body, owner, repo);
  const branchRefs = bodyRefs.refs.length === 0 ? issueRefsFromBranch(branchRef) : [];
  return {
    refs: [...bodyRefs.refs, ...branchRefs],
    invalidRefs: bodyRefs.invalidRefs,
  };
}

function canonicalIssueLine(issueNumber) {
  return `- **Issue:** #${issueNumber}`;
}

function normalizeIssueLine(body, issueNumber) {
  const canonical = canonicalIssueLine(issueNumber);
  const lines = (body || '').split('\n');
  let replaced = false;
  const normalized = lines.map((line) => {
    if (/OPS\s+Tracker/i.test(line) || /Umbrella\s+Tracker/i.test(line)) return line;
    if (semanticLineContainsIssueNumber(line, issueNumber)) {
      if (!replaced) {
        replaced = true;
        return canonical;
      }
      return null;
    }
    return line;
  }).filter((line) => line !== null);

  if (!replaced) {
    return `${canonical}\n\n${body || ''}`.trimEnd();
  }
  return normalized.join('\n').trimEnd();
}

module.exports = {
  canonicalIssueLine,
  issueNumberFromRef,
  issueRefsFromBody,
  issueRefsFromBranch,
  issueRefsFromTrustedSources,
  issueUrlBelongsToCurrentRepo,
  normalizeIssueLine,
  normalizeIssueReferenceLine,
  semanticLineContainsIssueNumber,
};
