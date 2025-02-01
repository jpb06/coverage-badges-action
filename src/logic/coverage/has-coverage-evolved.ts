import { Effect, pipe } from 'effect';

import { GithubActions } from '@effects/deps/github-actions';

export const hasCoverageEvolved = (badgesExist: boolean, outputPath: string) =>
  pipe(
    Effect.gen(function* () {
      if (!badgesExist) {
        return true;
      }

      const { exec } = yield* GithubActions;
      const code = yield* exec('git diff', ['--quiet', `${outputPath}/*`], {
        ignoreReturnCode: true,
      });
      const hasChanged = code === 1;

      return hasChanged;
    }),
    Effect.withSpan('has-coverage-evolved', {
      attributes: {
        badgesExist,
        outputPath,
      },
    }),
  );
