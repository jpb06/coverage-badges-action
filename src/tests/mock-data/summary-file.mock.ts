export const summaryFileMockData = (
  branches: number,
  functions: number,
  lines: number,
  statements: number,
) => ({
  total: {
    branches: { pct: branches },
    functions: { pct: functions },
    lines: { pct: lines },
    statements: { pct: statements },
  },
});
