import type { CoverageSummary } from 'node-coverage-badges';

export type SummaryKeys = Exclude<keyof CoverageSummary, 'total'>;
