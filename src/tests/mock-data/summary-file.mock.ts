import type { SummaryKeys } from '../../logic/coverage/summary-merging/types/summary-keys.type.js';

type SummaryValues = Record<SummaryKeys, number>;

export const summaryFileMockData = ({
  branches,
  functions,
  lines,
  statements,
}: SummaryValues) =>
  JSON.stringify({
    total: {
      branches: { pct: branches },
      functions: { pct: functions },
      lines: { pct: lines },
      statements: { pct: statements },
    },
  });
