import { getInput } from '@actions/core';
import { Effect, pipe } from 'effect';

import { doBadgesExist } from '../logic/coverage/do-badges-exist';
import { getValidPaths } from '../logic/coverage/get-valid-paths/get-valid-paths';
import { generateBadges } from '../logic/generate-badges';
import { getCurrentBranch } from '../logic/github/get-current-branch';
import { checkBranchStatus } from '../logic/inputs/check-branch-status';
import { maybePushBadges } from '../logic/maybe-push-badges';

export const mainTask = () =>
  pipe(
    Effect.gen(function* () {
      const currentBranch = yield* getCurrentBranch;
      const shouldCommit = getInput('no-commit') !== 'true';

      yield* checkBranchStatus(currentBranch, shouldCommit);

      const summaryFilesPaths = yield* getValidPaths;

      const outputPath = getInput('output-folder');

      const badgesExist = yield* doBadgesExist(outputPath, summaryFilesPaths);

      yield* generateBadges(summaryFilesPaths, outputPath);
      yield* maybePushBadges(
        shouldCommit,
        badgesExist,
        outputPath,
        currentBranch,
      );
    }),
    Effect.withSpan('mainTask'),
  );
