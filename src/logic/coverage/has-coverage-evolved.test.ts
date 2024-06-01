import { exec } from '@actions/exec';
import { Effect } from 'effect';
import { describe, expect, vi, it } from 'vitest';

import { hasCoverageEvolved } from './has-coverage-evolved';

vi.mock('@actions/exec');

describe('hasCoverageEvolved function', () => {
  const outputPath = './badges';

  it('should return true if coverage folder does not exist', async () => {
    const result = await Effect.runPromise(
      hasCoverageEvolved(false, outputPath),
    );

    expect(result).toBe(true);
  });

  it('should return true if diff returns one', async () => {
    vi.mocked(exec).mockResolvedValueOnce(1);

    const result = await Effect.runPromise(
      hasCoverageEvolved(true, outputPath),
    );

    expect(result).toBe(true);
  });

  it('should return false if diff returns zero', async () => {
    vi.mocked(exec).mockResolvedValueOnce(0);

    const result = await Effect.runPromise(
      hasCoverageEvolved(true, outputPath),
    );

    expect(result).toBe(false);
  });
});
