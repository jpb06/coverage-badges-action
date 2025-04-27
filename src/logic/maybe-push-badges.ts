import { Effect, pipe } from 'effect';

import { GithubActions } from '@effects/deps/github-actions';

import { hasCoverageEvolved } from './coverage/has-coverage-evolved.js';
import { pushBadges } from './git/push-badges.js';
import { setGitConfig } from './git/set-git-config.js';
import { getTargetBranch } from './github/get-target-branch.js';

export const maybePushBadges = (
  shouldCommit: boolean,
  badgesExist: boolean,
  outputPath: string,
  currentBranch: string,
) =>
  pipe(
    Effect.gen(function* () {
      const { info } = yield* GithubActions;

      if (!shouldCommit) {
        yield* info("ℹ️ `no-commit` set to true: badges won't be committed");
        return;
      }

      const hasEvolved = yield* hasCoverageEvolved(badgesExist, outputPath);
      if (!hasEvolved) {
        yield* info('✅ Coverage has not evolved, no action required.');
        return;
      }

      yield* info('🚀 Pushing badges to the repo');
      yield* setGitConfig();

      const targetBranch = yield* getTargetBranch(currentBranch);
      yield* pushBadges(targetBranch, outputPath);
    }),
    Effect.withSpan('maybe-push-badges', {
      attributes: {
        shouldCommit,
        badgesExist,
        outputPath,
        currentBranch,
      },
    }),
  );
