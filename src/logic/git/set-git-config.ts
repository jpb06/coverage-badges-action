import { Effect, pipe } from 'effect';

import { GithubActions } from '@effects/deps/github-actions';

export const setGitConfig = () =>
  pipe(
    Effect.gen(function* () {
      const { exec, getInput, getActor } = yield* GithubActions;

      const userEmail = yield* getInput('commit-user-email');
      const userName = yield* getInput('commit-user');

      const actor = yield* getActor();
      yield* Effect.all([
        exec('git config', [
          '--global',
          'user.name',
          userName.length === 0 ? actor : userName,
        ]),
        exec('git config', [
          '--global',
          'user.email',
          userEmail.length === 0
            ? `${actor}@users.noreply.github.com`
            : userEmail,
        ]),
      ]);
    }),
    Effect.withSpan('set-git-config'),
  );
