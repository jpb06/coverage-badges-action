import { Effect, pipe } from 'effect';

import { GithubActions } from '@effects/deps/github-actions';

export const getTargetBranch = (currentBranch: string) =>
  pipe(
    Effect.gen(function* () {
      const { getInput } = yield* GithubActions;
      const targetBranch = yield* getInput('target-branch');

      const hasTargetBranch = targetBranch !== '';
      if (hasTargetBranch) {
        return targetBranch;
      }

      return currentBranch;
    }),
    Effect.withSpan('get-target-branch', { attributes: { currentBranch } }),
  );
