import { info } from '@actions/core';
import { Effect } from 'effect';

import { hasCoverageEvolved } from './coverage/has-coverage-evolved';
import { pushBadges } from './git/push-badges';
import { setGitConfig } from './git/set-git-config';
import { getTargetBranch } from './github/get-target-branch';

export const maybePushBadges = (
  shouldCommit: boolean,
  badgesExist: boolean,
  outputPath: string,
  currentBranch: string,
) =>
  Effect.gen(function* () {
    if (!shouldCommit) {
      info("ℹ️ `no-commit` set to true: badges won't be committed");
      return;
    }

    const hasEvolved = yield* hasCoverageEvolved(badgesExist, outputPath);
    if (!hasEvolved) {
      info('✅ Coverage has not evolved, no action required.');
      return;
    }

    info('🚀 Pushing badges to the repo');
    yield* setGitConfig();

    const targetBranch = getTargetBranch(currentBranch);
    yield* pushBadges(targetBranch, outputPath);
  });
