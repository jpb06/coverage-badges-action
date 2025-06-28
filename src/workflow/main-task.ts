import { Effect, pipe } from 'effect';

import { GithubActions } from '@effects/deps/github-actions';

import { doBadgesExist } from '../logic/coverage/do-badges-exist.js';
import { getValidPaths } from '../logic/coverage/get-valid-paths/get-valid-paths.js';
import { generateBadges } from '../logic/generate-badges.js';
import { getCurrentBranch } from '../logic/github/get-current-branch.js';
import { checkBranchStatus } from '../logic/inputs/check-branch-status.js';
import { maybePushBadges } from '../logic/maybe-push-badges.js';

export const mainTask = () =>
  pipe(
    Effect.gen(function* () {
      const { getInput } = yield* GithubActions;

      const noCommitInput = yield* getInput('no-commit');
      const shouldCommit = noCommitInput !== 'true';
      const currentBranch = yield* getCurrentBranch;

      yield* checkBranchStatus(currentBranch, shouldCommit);

      const summaryFilesPaths = yield* getValidPaths;

      const outputPath = yield* getInput('output-folder');

      const badgesExist = yield* doBadgesExist(outputPath, summaryFilesPaths);

      yield* generateBadges(summaryFilesPaths, outputPath);
      yield* maybePushBadges(
        shouldCommit,
        badgesExist,
        outputPath,
        currentBranch,
      );
    }),
    Effect.catchTag('branch-not-allowed-for-generation', (cause) =>
      Effect.gen(function* () {
        const { info } = yield* GithubActions;

        yield* info(cause.message);
      }),
    ),
    Effect.withSpan('main-task'),
  );
