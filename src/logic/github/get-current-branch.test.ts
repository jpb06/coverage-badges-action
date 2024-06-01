import { Effect } from 'effect';
import { beforeAll, describe, expect, it } from 'vitest';

import { mockActionsCore } from '../../tests/mocks';

describe('getCurrentBranch function', () => {
  const { info, warning } = mockActionsCore();

  beforeAll(() => {
    process.env.GITHUB_HEAD_REF = undefined;
    process.env.GITHUB_REF_NAME = undefined;
  });

  it('should fail when branch name could not be defined', async () => {
    process.env.GITHUB_HEAD_REF = undefined;
    process.env.GITHUB_REF_NAME = undefined;

    const { getCurrentBranch } = await import('./get-current-branch');

    await expect(getCurrentBranch).toFailWithTag({
      _tag: 'github-missing-current-branch',
      message: '🚨 Unable to get current branch from github event.',
    });

    expect(warning).toHaveBeenCalledTimes(2);
  });

  it('should return the current branch', async () => {
    const branchName = 'master';
    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    const { getCurrentBranch } = await import('./get-current-branch');

    const result = await Effect.runPromise(getCurrentBranch);

    expect(result).toBe(branchName);
    expect(info).toHaveBeenCalledWith(`ℹ️ Current branch is ${branchName}`);
  });

  it('should return the current branch from ref name env var', async () => {
    const branchName = 'master';
    process.env.GITHUB_HEAD_REF = undefined;
    process.env.GITHUB_REF_NAME = branchName;

    const { getCurrentBranch } = await import('./get-current-branch');

    const result = await Effect.runPromise(getCurrentBranch);

    expect(result).toBe(branchName);
    expect(info).toHaveBeenCalledWith(`ℹ️ Current branch is ${branchName}`);
  });
});
