import type { CoverageSummary } from 'node-coverage-badges';

import type { SummaryKeys } from '../types/summary-keys.type.js';

export const maybeAdd = (
  key: SummaryKeys,
  acc: {
    lines: number[];
    statements: number[];
    functions: number[];
    branches: number[];
  },
  curr: CoverageSummary | undefined,
) => {
  const value = curr?.[key].pct;
  if (value !== undefined) {
    acc[key].push(value);
  }
};
