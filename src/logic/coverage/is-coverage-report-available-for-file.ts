import { Effect, pipe } from 'effect';
import { type FileCoverageTotal } from 'node-coverage-badges';

import { pathExistsEffect, readJsonEffect } from '../../effects/fs';
import { type CoverageReport } from '../types/coverage-report.type';

const isPercentageUndefined = (element?: FileCoverageTotal) =>
  element?.pct === undefined;

export const isCoverageReportAvailableForFile = (coverageSummaryPath: string) =>
  pipe(
    Effect.gen(function* () {
      const coverageExists = yield* pathExistsEffect(coverageSummaryPath);
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
    Effect.withSpan('isCoverageReportAvailableForFile', {
      attributes: {
        coverageSummaryPath,
      },
    }),
  );
