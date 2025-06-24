import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { describe, expect, it, vi } from 'vitest';

import { makeFsTestLayer } from '@tests/layers';

import { doBadgesExist } from './do-badges-exist.js';

describe('doBadgesExist function', () => {
  const outputPath = './badges';

  it('should return false if one file does not exist', async () => {
    const existsMock = vi
      .fn()
      .mockReturnValueOnce(Effect.succeed(false))
      .mockReturnValueOnce(Effect.succeed(true))
      .mockReturnValueOnce(Effect.succeed(true))
      .mockReturnValueOnce(Effect.succeed(true))
      .mockReturnValueOnce(Effect.succeed(true));

    const { FsTestLayer } = makeFsTestLayer({
      exists: existsMock,
    });

    const result = await runPromise(
      pipe(
        doBadgesExist(outputPath, [
          { path: './coverage/coverage-summary.json' },
        ]),
        Effect.provide(FsTestLayer),
      ),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toBe(false);
  });

  it('should return true if all files exist', async () => {
    const existsMock = vi
      .fn()
      .mockReturnValueOnce(Effect.succeed(true))
      .mockReturnValueOnce(Effect.succeed(true))
      .mockReturnValueOnce(Effect.succeed(true))
      .mockReturnValueOnce(Effect.succeed(true))
      .mockReturnValueOnce(Effect.succeed(true));

    const { FsTestLayer } = makeFsTestLayer({
      exists: existsMock,
    });

    const result = await runPromise(
      pipe(
        doBadgesExist(outputPath, [
          { path: './coverage/coverage-summary.json' },
        ]),
        Effect.provide(FsTestLayer),
      ),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toBe(true);
  });
});
