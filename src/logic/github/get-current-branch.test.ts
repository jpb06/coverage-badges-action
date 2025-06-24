import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { beforeAll, describe, expect, it } from 'vitest';

import { makeGithubActionsTestLayer } from '@tests/layers';

describe('getCurrentBranch function', () => {
  beforeAll(() => {
    process.env.GITHUB_HEAD_REF = undefined;
    process.env.GITHUB_REF_NAME = undefined;
  });

  it('should fail when branch name could not be defined', async () => {
    process.env.GITHUB_HEAD_REF = undefined;
    process.env.GITHUB_REF_NAME = undefined;

    const { GithubActionsTestLayer, warningMock } = makeGithubActionsTestLayer({
      info: Effect.void,
      warning: Effect.void,
    });

    const { getCurrentBranch } = await import('./get-current-branch.js');

    const program = pipe(
      getCurrentBranch,
      Effect.provide(GithubActionsTestLayer),
    );

    await expect(program).toFailWithTag({
      _tag: 'github-missing-current-branch',
      message: '🚨 Unable to get current branch from github event.',
    });

    expect(warningMock).toHaveBeenCalledTimes(2);
  });

  it('should return the current branch', async () => {
    const branchName = 'master';
    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    const { GithubActionsTestLayer, infoMock } = makeGithubActionsTestLayer({
      info: Effect.void,
      warning: Effect.void,
    });

    const { getCurrentBranch } = await import('./get-current-branch.js');

    const result = await runPromise(
      pipe(getCurrentBranch, Effect.provide(GithubActionsTestLayer)),
      {
        stripCwd: true,
        hideStackTrace: true,
      },
    );

    expect(result).toBe(branchName);
    expect(infoMock).toHaveBeenCalledWith(`ℹ️ Current branch is ${branchName}`);
  });

  it('should return the current branch from ref name env var', async () => {
    const branchName = 'master';
    process.env.GITHUB_HEAD_REF = undefined;
    process.env.GITHUB_REF_NAME = branchName;

    const { GithubActionsTestLayer, infoMock } = makeGithubActionsTestLayer({
      info: Effect.void,
      warning: Effect.void,
    });

    const { getCurrentBranch } = await import('./get-current-branch.js');

    const result = await runPromise(
      pipe(getCurrentBranch, Effect.provide(GithubActionsTestLayer)),
      {
        stripCwd: true,
        hideStackTrace: true,
      },
    );

    expect(result).toBe(branchName);
    expect(infoMock).toHaveBeenCalledWith(`ℹ️ Current branch is ${branchName}`);
  });
});
