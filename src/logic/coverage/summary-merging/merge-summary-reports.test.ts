import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { describe, expect, it, vi } from 'vitest';

import { makeFsTestLayer } from '@tests/layers';
import { summaryFileMockData } from '@tests/mock-data';

describe('mergeSummaryReports function', () => {
  const dummyPath = './cool';

  it('should return summary averages', async () => {
    const readFileStringMock = vi
      .fn()
      .mockReturnValueOnce(
        Effect.succeed(
          summaryFileMockData({
            lines: 30,
            statements: 20,
            functions: 10,
            branches: 5,
          }),
        ),
      )
      .mockReturnValueOnce(
        Effect.succeed(
          summaryFileMockData({
            lines: 60,
            statements: 70,
            functions: 90,
            branches: 60,
          }),
        ),
      )
      .mockReturnValueOnce(
        Effect.succeed(
          summaryFileMockData({
            lines: 100,
            statements: 50,
            functions: 30,
            branches: 90,
          }),
        ),
      );

    const { FsTestLayer } = makeFsTestLayer({
      readFileString: readFileStringMock,
    });

    const { mergeSummaryReports } = await import('./merge-summary-reports.js');

    const result = await runPromise(
      pipe(
        mergeSummaryReports([dummyPath, dummyPath, dummyPath]),
        Effect.provide(FsTestLayer),
      ),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(result).toStrictEqual({
      total: {
        lines: { pct: 63.33 },
        statements: { pct: 46.67 },
        functions: { pct: 43.33 },
        branches: { pct: 51.67 },
      },
    });
  });
});
