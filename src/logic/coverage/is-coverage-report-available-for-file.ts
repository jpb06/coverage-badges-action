import { Effect } from 'effect';
import {
  type CoverageSummary,
  type FileCoverageTotal,
} from 'node-coverage-badges';

import { pathExistsEffect, readJsonEffect } from '../../effects/fs';

const isPercentageUndefined = (element?: FileCoverageTotal) =>
  element?.pct === undefined;

interface CoverageReport {
  total?: CoverageSummary;
}

export const isCoverageReportAvailableForFile = (coverageSummaryPath: string) =>
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
  });