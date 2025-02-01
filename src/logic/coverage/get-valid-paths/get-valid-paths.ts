import { Effect, pipe } from 'effect';

import { GithubActions } from '@effects/deps/github-actions';
import { globEffect } from '@effects/deps/glob';

import { NoJsonSummariesProvidedError } from './errors/no-json-summaries-provided.error.js';
import { validatePath } from './logic/path-validation/validate-path.js';
import type { ValidatedPath } from './types/validated-types.type.js';

export const getValidPaths = pipe(
  Effect.gen(function* () {
    const { getMultilineInput } = yield* GithubActions;
    const maybeGlobPaths = yield* getMultilineInput('coverage-summary-path');

    const array = yield* Effect.forEach(
      maybeGlobPaths,
      (globPath) =>
        Effect.gen(function* () {
          const matchingPaths: string[] = yield* globEffect(globPath);

          return yield* Effect.forEach(matchingPaths, validatePath(globPath), {
            concurrency: 'unbounded',
          });
        }),
      { concurrency: 'unbounded' },
    );

    const validPaths = array
      .flat()
      .filter((path): path is ValidatedPath => path !== undefined);

    if (validPaths.length === 0) {
      return yield* Effect.fail(
        new NoJsonSummariesProvidedError({
          message:
            '❌ No valid coverage reports provided. Perhaps you forgot to run tests or to add `json-summary` to coverageReporters in your test runner config?',
        }),
      );
    }

    return validPaths;
  }),
  Effect.withSpan('get-valid-paths'),
);
