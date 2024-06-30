import { runPromise } from 'effect-errors';
import { pathExists } from 'fs-extra';
import { describe, expect, vi, it } from 'vitest';

import { doBadgesExist } from './do-badges-exist';

vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
}));

describe('doBadgesExist function', () => {
  const outputPath = './badges';

  it('should return false if one file does not exist', async () => {
    vi.mocked(pathExists)
      .mockImplementationOnce(() => false as never)
      .mockImplementationOnce(() => true as never)
      .mockImplementationOnce(() => true as never)
      .mockImplementationOnce(() => true as never)
      .mockImplementationOnce(() => true as never);

    const result = await runPromise(
      doBadgesExist(outputPath, [{ path: './coverage/coverage-summary.json' }]),
    );

    expect(result).toBe(false);
  });

  it('should return true if all files exist', async () => {
    vi.mocked(pathExists)
      .mockImplementationOnce(() => true as never)
      .mockImplementationOnce(() => true as never)
      .mockImplementationOnce(() => true as never)
      .mockImplementationOnce(() => true as never)
      .mockImplementationOnce(() => true as never);

    const result = await runPromise(
      doBadgesExist(outputPath, [{ path: './coverage/coverage-summary.json' }]),
    );

    expect(result).toBe(true);
  });
});
