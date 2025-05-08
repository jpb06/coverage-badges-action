import type { SummaryKeys } from '../types/summary-keys.type.js';

const sumArray = (array: number[]) => array.reduce((total, n) => total + n, 0);

export const getAverage = (
  key: SummaryKeys,
  sums: Record<SummaryKeys, number[]>,
) => Number((sumArray(sums[key]) / sums[key].length).toFixed(2));
