import { spawnSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { appendBridgeLog } from './notify.mjs';

export function resolveAgentBinary(config) {
  const candidates = config.cliBinaryCandidates || ['agent', 'cursor'];
  for (const name of candidates) {
    if (name === 'cursor') {
      const r = spawnSync('cursor', ['agent', 'status'], { encoding: 'utf8' });
      // status may be non-zero when not logged in, but binary exists if no ENOENT
      if (!r.error) return { kind: 'cursor-agent', bin: 'cursor' };
    } else {
      const r = spawnSync(name, ['status'], { encoding: 'utf8' });
      if (!r.error) return { kind: 'agent', bin: name };
    }
  }
  return null;
}

export function cliAuthPreflight(config) {
  const resolved = resolveAgentBinary(config);
  if (!resolved) {
    return { ok: false, reason: 'cli_binary_missing' };
  }
  const args = resolved.kind === 'cursor-agent' ? ['agent', 'status'] : ['status'];
  const r = spawnSync(resolved.bin, args, {
    encoding: 'utf8',
    env: process.env,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`.trim();
  if (/not logged in/i.test(out) || /unauthorized/i.test(out)) {
    return { ok: false, reason: 'cli_not_authenticated', detail: out.slice(0, 200), resolved };
  }
  if (r.error) {
    return { ok: false, reason: 'cli_exec_error', detail: String(r.error), resolved };
  }
  // Some versions exit non-zero when not logged in already handled; accept 0 or ambiguous success text
  if (r.status !== 0 && !/logged in|email|@/i.test(out)) {
    return { ok: false, reason: 'cli_auth_check_failed', detail: out.slice(0, 200), resolved };
  }
  return { ok: true, resolved, detail: out.slice(0, 200) };
}

function buildPrompt({ issueNumber, resumeUrl, responseUrl, action, workspace }) {
  return [
    'MODE: IMPLEMENTATION',
    'Runtime: local',
    `Source Issue: #${issueNumber}`,
    'Read Agent.md and the mandatory documentation chain before any repo work.',
    `Canonical CHATGPT RESPONSE: ${responseUrl || '(see issue)'}`,
    `LOCAL CURSOR RESUME: ${resumeUrl || '(see issue)'}`,
    'Next local action (exactly one):',
    `- ${action}`,
    'Do not broaden scope. Post CHATGPT HANDOFF when blocked, PR-ready, or complete.',
    `Workspace: ${workspace}`,
  ].join('\n');
}

export function resolveWorkspace(config) {
  if (process.env.LGFC_CURSOR_BRIDGE_WORKSPACE) {
    return process.env.LGFC_CURSOR_BRIDGE_WORKSPACE;
  }
  const hint = config.defaultWorkspaceHint || 'next-starter-template/next-starter-template';
  const home = os.homedir();
  const candidate = path.join(home, hint);
  if (fs.existsSync(candidate)) return candidate;
  const alt = path.join(home, 'next-starter-template');
  if (fs.existsSync(alt)) return alt;
  return process.cwd();
}

/**
 * Launch local Cursor Agent in non-interactive print mode with structured lifecycle output.
 * A successful spawn is not agent acceptance; bridge.mjs waits for system/init.
 */
export function launchLocalAgent(config, { issueNumber, resume, response, action }) {
  const pre = cliAuthPreflight(config);
  if (!pre.ok) return { error: pre.reason, detail: pre.detail };

  const workspace = resolveWorkspace(config);
  const prompt = buildPrompt({
    issueNumber,
    resumeUrl: resume?.url,
    responseUrl: response?.url,
    action,
    workspace,
  });

  const resolved = pre.resolved;
  const commonArgs = [
    '-p',
    prompt,
    '--output-format',
    'stream-json',
    '--workspace',
    workspace,
    '--trust',
  ];
  const args = resolved.kind === 'cursor-agent' ? ['agent', ...commonArgs] : commonArgs;

  if (config.prohibitYolo !== false) {
    // never add --yolo / --force
  }

  appendBridgeLog(
    config,
    `launch ${resolved.bin} ${args.filter((a) => a !== prompt).join(' ')} prompt_len=${prompt.length}`,
  );

  const child = spawn(resolved.bin, args, {
    cwd: workspace,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return { child, workspace, prompt, resolved };
}
