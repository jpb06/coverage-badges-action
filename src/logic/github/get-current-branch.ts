import { Effect, pipe } from 'effect';

import { GithubActions } from '@effects/deps/github-actions';
import { getGithubEnv } from '@effects/env';

import { GithubMissingCurrentBranchError } from './errors/github-missing-current-branch.error.js';

const isEmpty = (value: string | undefined) =>
  value === undefined || value === 'undefined' || value === '';

export const getCurrentBranch = pipe(
  Effect.gen(function* () {
    const { githubHeadRef, githubRefName } = yield* getGithubEnv;
    let currentBranch = githubHeadRef;

    if (isEmpty(currentBranch)) {
      currentBranch = githubRefName;
    }

    const { warning, info } = yield* GithubActions;

    if (isEmpty(currentBranch)) {
      yield* warning(`🗯️ GITHUB_HEAD_REF: ${githubHeadRef}`);
      yield* warning(`🗯️ GITHUB_REF_NAME: ${githubRefName}`);

      return yield* Effect.fail(
        new GithubMissingCurrentBranchError({
          message: '🚨 Unable to get current branch from github event.',
        }),
      );
    }

    yield* info(`ℹ️ Current branch is ${currentBranch}`);

    return yield* Effect.succeed(currentBranch);
  }),
  Effect.withSpan('get-current-branch'),
);
