import { getInput, info } from '@actions/core';
import { Effect } from 'effect';
import { TaggedError } from 'effect/Data';

export class BranchNotAllowedForGenerationError extends TaggedError(
  'branch-not-allowed-for-generation',
)<{
  cause?: unknown;
  message?: string;
}> {}

export const checkBranchStatus = (
  currentBranch: string,
  shouldCommit: boolean,
) =>
  Effect.gen(function* () {
    if (!shouldCommit) {
      return;
    }

    const input = getInput('branches');
    if (input === '*') {
      return;
    }

    let branches = input.split(',');
    if (branches.length === 1 && branches[0].length === 0) {
      info(`ℹ️ No branches specified, defaulting to master and main`);
      branches = ['master', 'main'];
    }

    const isWithinAllowedBranches = branches.includes(currentBranch);
    if (!isWithinAllowedBranches) {
      return yield* Effect.fail(
        new BranchNotAllowedForGenerationError({
          message:
            '🛑 Current branch does not belong to the branches allowed for badges generation, task dropped.',
        }),
      );
    }
  });
