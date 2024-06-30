import { runPromise } from 'effect-errors';
import { describe, it, expect } from 'vitest';

import { mockFsExtra } from '../../../tests/mocks';

describe('mergeSummaryReports function', () => {
  const dummyPath = './cool';
  const { readJson } = mockFsExtra();

  it('should return summary averages', async () => {
    readJson
      .mockResolvedValueOnce({
        total: {
          lines: { pct: 30 },
          statements: { pct: 20 },
          functions: { pct: 10 },
          branches: { pct: 5 },
        },
      })
      .mockResolvedValueOnce({
        total: {
          lines: { pct: 60 },
          statements: { pct: 70 },
          functions: { pct: 90 },
          branches: { pct: 60 },
        },
      })
      .mockResolvedValueOnce({
        total: {
          lines: { pct: 100 },
          statements: { pct: 50 },
          functions: { pct: 30 },
          branches: { pct: 90 },
        },
      });

    const { mergeSummaryReports } = await import('./merge-summary-reports');

    const result = await runPromise(
      mergeSummaryReports([dummyPath, dummyPath, dummyPath]),
    );

    expect(result).toStrictEqual({
      total: {
        lines: { pct: 63.333333333333336 },
        statements: { pct: 46.666666666666664 },
        functions: { pct: 43.333333333333336 },
        branches: { pct: 51.666666666666664 },
      },
    });
  });
});
