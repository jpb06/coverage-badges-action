import { getInput } from '@actions/core';
import { exec } from '@actions/exec';
import { Effect } from 'effect';
import { describe, beforeEach, expect, vi, it } from 'vitest';

import { pushBadges } from './push-badges';

vi.mock('@actions/exec');
vi.mock('@actions/core');

describe('pushBadges function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should push changes', async () => {
    const branchName = 'master';

    vi.mocked(getInput).mockReturnValueOnce('Updating coverage badges');

    await Effect.runPromise(pushBadges(branchName));

    expect(exec).toHaveBeenCalledTimes(5);
    expect(exec).toHaveBeenNthCalledWith(
      1,
      'git checkout',
      [branchName],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(3, 'git add', ['./badges'], undefined);
    expect(exec).toHaveBeenNthCalledWith(
      4,
      'git commit',
      ['-m', 'Updating coverage badges'],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(
      5,
      `git push origin ${branchName}`,
      undefined,
      undefined,
    );
  });
});
