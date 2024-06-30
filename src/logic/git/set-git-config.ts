import { getInput } from '@actions/core';
import { context } from '@actions/github';
import { Effect, pipe } from 'effect';

import { execEffect } from '../../effects/github';

export const setGitConfig = () =>
  pipe(
    Effect.gen(function* () {
      const userEmail = getInput('commit-user-email');
      const userName = getInput('commit-user');

      yield* Effect.all([
        execEffect('git config', [
          '--global',
          'user.name',
          userName.length === 0 ? context.actor : userName,
        ]),
        execEffect('git config', [
          '--global',
          'user.email',
          userEmail.length === 0
            ? `${context.actor}@users.noreply.github.com`
            : userEmail,
        ]),
      ]);
    }),
    Effect.withSpan('setGitConfig'),
  );
