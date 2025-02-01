import { Effect, pipe } from 'effect';

import { GithubActions } from '@effects/deps/github-actions';

export const pushBadges = (branchName: string, source = './badges') =>
  pipe(
    Effect.gen(function* () {
      const { exec, getInput } = yield* GithubActions;

      const commitMessage = yield* getInput('commit-message');
      return yield* Effect.all([
        exec('git checkout', [branchName]),
        exec('git status'),
        exec('git add', [source]),
        exec('git commit', ['-m', commitMessage]),
        exec(`git push origin ${branchName}`),
      ]);
    }),
    Effect.withSpan('push-badges', {
      attributes: {
        branchName,
        source,
      },
    }),
  );
