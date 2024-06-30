import { getMultilineInput } from '@actions/core';
import { Effect, pipe } from 'effect';

import { globEffect } from '../../../effects/glob/glob.effect';

import { NoJsonSummariesProvidedError } from './errors/no-json-summaries-provided.error';
import { type ValidatedPath, validatePath } from './validate-path';

export const getValidPaths = pipe(
  Effect.gen(function* () {
    const maybeGlobPaths = getMultilineInput('coverage-summary-path');

    const array = yield* Effect.forEach(
      maybeGlobPaths,
      (globPath) =>
        Effect.gen(function* () {
          const matchingPaths = yield* globEffect(globPath);

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
  Effect.withSpan('getValidPaths'),
);
