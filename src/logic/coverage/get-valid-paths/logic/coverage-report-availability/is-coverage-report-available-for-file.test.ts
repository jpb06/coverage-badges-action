import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { describe, expect, it } from 'vitest';

import { makeFsTestLayer } from '@tests/layers';
import { summaryFileMockData } from '@tests/mock-data';

import { isCoverageReportAvailableForFile } from './is-coverage-report-available-for-file.js';

describe('isCoverageReportAvailableForFile function', () => {
  const path = 'whatevs';

  it('should return false if coverage report does not exist', async () => {
    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(false),
    });

    const result = await runPromise(
      pipe(isCoverageReportAvailableForFile(path), Effect.provide(FsTestLayer)),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toBe(false);
  });

  it('should return false if coverage report is missing', async () => {
    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: Effect.succeed(''),
    });

    const result = await runPromise(
      pipe(isCoverageReportAvailableForFile(path), Effect.provide(FsTestLayer)),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toBe(false);
  });

  it('should return false if coverage report is empty', async () => {
    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: Effect.succeed(JSON.stringify({})),
    });

    const result = await runPromise(
      pipe(isCoverageReportAvailableForFile(path), Effect.provide(FsTestLayer)),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toBe(false);
  });

  it('should return false if coverage report has missing details', async () => {
    const summary = { total: { branches: { pct: 20 } } };
    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: Effect.succeed(JSON.stringify(summary)),
    });

    const result = await runPromise(
      pipe(isCoverageReportAvailableForFile(path), Effect.provide(FsTestLayer)),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toBe(false);
  });

  it('should return true', async () => {
    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: Effect.succeed(
        summaryFileMockData({
          lines: 100,
          statements: 60,
          functions: 70,
          branches: 90,
        }),
      ),
    });

    const result = await runPromise(
      pipe(isCoverageReportAvailableForFile(path), Effect.provide(FsTestLayer)),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toBe(true);
  });
});
