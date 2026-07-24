#!/usr/bin/env node
/**
 * Guarded workflow entrypoint for verified child closeout (#2773 correction).
 *
 * Wraps the closeout executor as the sanctioned invocation boundary. The guard
 * does not broaden GitHub capabilities; it re-exports the corrected evaluate
 * and execute APIs and delegates CLI execution to the underlying module.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export {
  buildCloseoutIdentity,
  collectGitHubCloseoutState,
  evaluateCloseoutSuccessorTransaction,
  executeCloseoutSuccessorTransaction,
  mutateGitHubCloseoutState,
} from './child-closeout.mjs';

import { main } from './child-closeout.mjs';

const isDirect =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      process.stderr.write(`error: ${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    },
  );
}
