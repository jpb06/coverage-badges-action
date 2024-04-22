import { getInput } from '@actions/core';
import { pathExists, readJson } from 'fs-extra';
import { type CoverageSummary, type FileCoverageTotal } from 'node-coverage-badges';

const isUndefined = (element?: FileCoverageTotal) => element?.pct === undefined;

interface CoverageReport {
  total?: CoverageSummary;
}

export const isCoverageReportAvailable = async (): Promise<boolean> => {
  const coverageSummaryPath = getInput('coverage-summary-path');

  const coverageExists = await pathExists(coverageSummaryPath);
  if (!coverageExists) {
    return false;
  }

  const data: CoverageReport = await readJson(coverageSummaryPath);
  if (data?.total === undefined) {
    return false;
  }

  if (
    isUndefined(data.total.branches) ||
    isUndefined(data.total.functions) ||
    isUndefined(data.total.lines) ||
    isUndefined(data.total.statements)
  ) {
    return false;
  }

  return true;
};
