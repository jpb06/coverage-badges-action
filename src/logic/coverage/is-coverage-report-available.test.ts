import { Effect } from 'effect';
import { pathExists, readJson } from 'fs-extra';
import { describe, expect, vi, it } from 'vitest';

import { isCoverageReportAvailableForFile } from './is-coverage-report-available-for-file';

vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
  readJson: vi.fn(),
}));

describe('isCoverageReportAvailable function', () => {
  const path = 'whatevs';

  it('should return false if coverage report does not exist', async () => {
    vi.mocked(pathExists).mockImplementationOnce(() => false as never);

    const result = await Effect.runPromise(
      isCoverageReportAvailableForFile(path),
    );

    expect(result).toBe(false);
  });

  it('should return false if coverage report is missing', async () => {
    vi.mocked(pathExists).mockImplementationOnce(() => true as never);
    vi.mocked(readJson).mockImplementationOnce(() => undefined as never);

    const result = await Effect.runPromise(
      isCoverageReportAvailableForFile(path),
    );

    expect(result).toBe(false);
  });

  it('should return false if coverage report is empty', async () => {
    vi.mocked(pathExists).mockImplementationOnce(() => true as never);
    const emptyFn = () => ({});
    vi.mocked(readJson).mockImplementationOnce(emptyFn as never);

    const result = await Effect.runPromise(
      isCoverageReportAvailableForFile(path),
    );

    expect(result).toBe(false);
  });

  it('should return false if coverage report has missing details', async () => {
    vi.mocked(pathExists).mockImplementationOnce(() => true as never);
    const summary = { total: { branches: { pct: 20 } } };
    vi.mocked(readJson).mockImplementationOnce(() => summary as never);

    const result = await Effect.runPromise(
      isCoverageReportAvailableForFile(path),
    );

    expect(result).toBe(false);
  });

  it('should return true', async () => {
    vi.mocked(pathExists).mockImplementationOnce(() => true as never);
    const summary = {
      total: {
        branches: { pct: 90 },
        functions: { pct: 70 },
        lines: { pct: 100 },
        statements: { pct: 60 },
      },
    };
    vi.mocked(readJson).mockImplementationOnce(() => summary as never);

    const result = await Effect.runPromise(
      isCoverageReportAvailableForFile(path),
    );

    expect(result).toBe(true);
  });
});
