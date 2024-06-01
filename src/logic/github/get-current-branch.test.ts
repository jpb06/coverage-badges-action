import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';

import { mockActionsCore, mockProcess } from '../../tests/mocks';

describe('getCurrentBranch function', () => {
  const { info, warning } = mockActionsCore();

  it('should fail when branch name could not be defined', async () => {
    await mockProcess({});

    const { getCurrentBranch } = await import('./get-current-branch');

    await expect(getCurrentBranch).toFailWithTag({
      _tag: 'github-missing-current-branch',
      message: '🚨 Unable to get current branch from github event.',
    });

    expect(warning).toHaveBeenCalledTimes(2);
  });

  it('should return the current branch', async () => {
    const branchName = 'master';
    await mockProcess({
      env: {
        GITHUB_HEAD_REF: branchName,
        GITHUB_REF_NAME: undefined,
      },
    });

    const { getCurrentBranch } = await import('./get-current-branch');

    const result = await Effect.runPromise(getCurrentBranch);

    expect(result).toBe(branchName);
    expect(info).toHaveBeenCalledWith(`ℹ️ Current branch is ${branchName}`);
  });

  it('should return the current branch from ref name env var', async () => {
    const branchName = 'master';

    await mockProcess({
      env: {
        GITHUB_HEAD_REF: undefined,
        GITHUB_REF_NAME: branchName,
      },
    });

    const { getCurrentBranch } = await import('./get-current-branch');

    const result = await Effect.runPromise(getCurrentBranch);

    expect(result).toBe(branchName);
    expect(info).toHaveBeenCalledWith(`ℹ️ Current branch is ${branchName}`);
  });
});
