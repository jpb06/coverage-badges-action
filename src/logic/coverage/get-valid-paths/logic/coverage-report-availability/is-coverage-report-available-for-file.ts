import { FileSystem } from '@effect/platform/FileSystem';
import { Effect, pipe } from 'effect';
import type { FileCoverageTotal } from 'node-coverage-badges';

import { readJsonEffect } from '@effects/deps/fs/read-json/index.js';

import type { CoverageReport } from '../../../../../types/coverage-report.type.js';

const isPercentageUndefined = (element?: FileCoverageTotal) =>
  element?.pct === undefined;

export const isCoverageReportAvailableForFile = (coverageSummaryPath: string) =>
  pipe(
    Effect.gen(function* () {
      const { exists } = yield* FileSystem;
      const coverageExists = yield* exists(coverageSummaryPath);
      if (!coverageExists) {
        return false;
      }

      const data = yield* readJsonEffect<CoverageReport>(coverageSummaryPath);
      if (data?.total === undefined) {
        return false;
      }

      if (
        isPercentageUndefined(data.total.branches) ||
        isPercentageUndefined(data.total.functions) ||
        isPercentageUndefined(data.total.lines) ||
        isPercentageUndefined(data.total.statements)
      ) {
        return false;
      }

      return true;
    }),
    Effect.withSpan('is-coverage-report-available-for-file', {
      attributes: {
        coverageSummaryPath,
      },
    }),
  );
