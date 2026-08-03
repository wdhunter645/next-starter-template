import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

/**
 * Atomically write JSON with restrictive permissions (temp file + rename).
 */
export function atomicWriteJson(filePath, value, mode = 0o600) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const tmp = path.join(
    dir,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  try {
    fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, { mode });
    fs.renameSync(tmp, filePath);
    try {
      fs.chmodSync(filePath, mode);
    } catch {
      /* ignore chmod races on some hosts */
    }
  } finally {
    if (fs.existsSync(tmp)) {
      try {
        fs.unlinkSync(tmp);
      } catch {
        /* ignore */
      }
    }
  }
  return filePath;
}

/**
 * Atomically replace a file with bytes from another path (same-filesystem rename).
 */
export function atomicReplaceFile(sourcePath, destPath, mode = 0o644) {
  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const tmp = path.join(dir, `.${path.basename(destPath)}.${process.pid}.${Date.now()}.tmp`);
  fs.copyFileSync(sourcePath, tmp);
  try {
    fs.chmodSync(tmp, mode);
  } catch {
    /* ignore */
  }
  fs.renameSync(tmp, destPath);
  return destPath;
}

export function freeDiskMb(targetPath) {
  try {
    if (typeof fs.statfsSync === 'function') {
      const st = fs.statfsSync(targetPath);
      return Math.floor((st.bavail * st.bsize) / (1024 * 1024));
    }
  } catch {
    /* fall through */
  }
  try {
    const r = spawnSync('df', ['-Pm', targetPath], { encoding: 'utf8' });
    if (r.status !== 0) return null;
    const lines = (r.stdout || '').trim().split(/\n/);
    if (lines.length < 2) return null;
    const parts = lines[lines.length - 1].trim().split(/\s+/);
    const avail = Number(parts[3]);
    return Number.isFinite(avail) ? avail : null;
  } catch {
    return null;
  }
}

export function hostnameSafe() {
  try {
    return os.hostname();
  } catch {
    return 'unknown';
  }
}
