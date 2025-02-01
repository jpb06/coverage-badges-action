import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { describe, expect, it } from 'vitest';

import { makeGithubActionsTestLayer } from '@tests/layers';

import { hasCoverageEvolved } from './has-coverage-evolved.js';

describe('hasCoverageEvolved function', () => {
  const outputPath = './badges';

  it('should return true if coverage folder does not exist', async () => {
    const { GithubActionsTestLayer } = makeGithubActionsTestLayer({
      exec: Effect.succeed(1),
    });

    const result = await runPromise(
      pipe(
        hasCoverageEvolved(false, outputPath),
        Effect.provide(GithubActionsTestLayer),
      ),
      {
        stripCwd: true,
        hideStackTrace: true,
      },
    );

    expect(result).toBe(true);
  });

  it('should return true if diff returns one', async () => {
    const { GithubActionsTestLayer } = makeGithubActionsTestLayer({
      exec: Effect.succeed(1),
    });

    const result = await runPromise(
      pipe(
        hasCoverageEvolved(true, outputPath),
        Effect.provide(GithubActionsTestLayer),
      ),
      {
        stripCwd: true,
        hideStackTrace: true,
      },
    );

    expect(result).toBe(true);
  });

  it('should return false if diff returns zero', async () => {
    const { GithubActionsTestLayer } = makeGithubActionsTestLayer({
      exec: Effect.succeed(0),
    });

    const result = await runPromise(
      pipe(
        hasCoverageEvolved(true, outputPath),
        Effect.provide(GithubActionsTestLayer),
      ),
      {
        stripCwd: true,
        hideStackTrace: true,
      },
    );

    expect(result).toBe(false);
  });
});
