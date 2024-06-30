import { Effect, pipe } from 'effect';

import { readJsonEffect } from '../../../effects/fs';
import { type CoverageReport } from '../../types/coverage-report.type';

import { getAverage } from './get-average';
import { maybeAdd } from './maybe-add';

export const mergeSummaryReports = (summaryPaths: string[]) =>
  pipe(
    Effect.gen(function* () {
      const summariesData = yield* Effect.all(
        summaryPaths.map((path) => readJsonEffect<CoverageReport>(path)),
        { concurrency: 'unbounded' },
      );

      const initial = {
        lines: [] as number[],
        statements: [] as number[],
        functions: [] as number[],
        branches: [] as number[],
      };
      const sums = summariesData
        .filter((d) => d.total !== undefined)
        .map((d) => d.total)
        .reduce((acc, curr) => {
          maybeAdd('branches', acc, curr);
          maybeAdd('functions', acc, curr);
          maybeAdd('lines', acc, curr);
          maybeAdd('statements', acc, curr);

          return acc;
        }, initial);

      return {
        total: {
          lines: { pct: getAverage('lines', sums) },
          statements: { pct: getAverage('statements', sums) },
          functions: { pct: getAverage('functions', sums) },
          branches: { pct: getAverage('branches', sums) },
        },
      };
    }),
    Effect.withSpan('mergeSummaryReports', {
      attributes: {
        summaryPaths,
      },
    }),
  );
