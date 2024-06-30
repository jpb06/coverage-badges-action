import { info, warning } from '@actions/core';
import { Effect, pipe } from 'effect';

import { GithubMissingCurrentBranchError } from './errors/github-missing-current-branch.error';

const isEmpty = (value: string | undefined) =>
  value === undefined || value === 'undefined' || value === '';

export const getCurrentBranch = pipe(
  Effect.gen(function* () {
    let currentBranch = process.env.GITHUB_HEAD_REF;

    if (isEmpty(currentBranch)) {
      currentBranch = process.env.GITHUB_REF_NAME;
    }

    if (isEmpty(currentBranch)) {
      warning(`🗯️ GITHUB_HEAD_REF: ${process.env.GITHUB_HEAD_REF}`);
      warning(`🗯️ GITHUB_REF_NAME: ${process.env.GITHUB_REF_NAME}`);

      return yield* Effect.fail(
        new GithubMissingCurrentBranchError({
          message: '🚨 Unable to get current branch from github event.',
        }),
      );
    }

    info(`ℹ️ Current branch is ${currentBranch}`);

    return yield* Effect.succeed(currentBranch);
  }),
  Effect.withSpan('getCurrentBranch'),
);
