import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { describe, expect, it } from 'vitest';

import { summaryFileMockData } from '@tests/mock-data';

import { makeFsTestLayer } from '../../../../../tests/layers/fs.test-layer.js';

describe('validatePath effect', () => {
  it('should return undefined if report file does not exist', async () => {
    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(false),
    });

    const { validatePath } = await import('./validate-path.js');

    const result = await runPromise(
      pipe(
        validatePath('./cool/story/bro/coverage/coverage-summary.json')(
          './cool/story/bro/coverage/coverage-summary.json',
        ),
        Effect.provide(FsTestLayer),
      ),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toBeUndefined();
  });

  it('should handle glob paths', async () => {
    const globPath = './apps/**/coverage/coverage-summary.json';
    const resolvedPath = 'apps/front/coverage/coverage-summary.json';

    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: Effect.succeed(
        summaryFileMockData({
          branches: 10,
          functions: 20,
          lines: 30,
          statements: 40,
        }),
      ),
    });

    const { validatePath } = await import('./validate-path.js');

    const result = await runPromise(
      pipe(validatePath(globPath)(resolvedPath), Effect.provide(FsTestLayer)),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toStrictEqual({
      path: 'apps/front/coverage/coverage-summary.json',
      subPath: 'front',
    });
  });

  it('should handle glob paths not starting with ./', async () => {
    const globPath = 'apps/**/coverage/coverage-summary.json';
    const resolvedPath = 'apps/front/coverage/coverage-summary.json';

    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: Effect.succeed(
        summaryFileMockData({
          branches: 10,
          functions: 20,
          lines: 30,
          statements: 40,
        }),
      ),
    });

    const { validatePath } = await import('./validate-path.js');

    const result = await runPromise(
      pipe(validatePath(globPath)(resolvedPath), Effect.provide(FsTestLayer)),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toStrictEqual({
      path: 'apps/front/coverage/coverage-summary.json',
      subPath: 'front',
    });
  });

  it('should handle basic subPaths paths', async () => {
    const globPath = './apps/front/coverage/coverage-summary.json';
    const resolvedPath = 'apps/front/coverage/coverage-summary.json';

    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: Effect.succeed(
        summaryFileMockData({
          branches: 10,
          functions: 20,
          lines: 30,
          statements: 40,
        }),
      ),
    });

    const { validatePath } = await import('./validate-path.js');

    const result = await runPromise(
      pipe(validatePath(globPath)(resolvedPath), Effect.provide(FsTestLayer)),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toStrictEqual({
      path: 'apps/front/coverage/coverage-summary.json',
      subPath: 'apps/front',
    });
  });
});
