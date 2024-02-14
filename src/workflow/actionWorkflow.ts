import { getInput, info, setFailed } from '@actions/core';
import { generateBadges } from 'node-coverage-badges';

import { doBadgesExist } from '../logic/coverage/doBadgesExist';
import { hasCoverageEvolved } from '../logic/coverage/hasCoverageEvolved';
import { isCoverageReportAvailable } from '../logic/coverage/isCoverageReportAvailable';
import { pushBadges } from '../logic/git/pushBadges';
import { setGitConfig } from '../logic/git/setGitConfig';
import { getCurrentBranch } from '../logic/github/getCurrentBranch';
import { getTargetBranch } from '../logic/github/getTargetBranch';
import { isBranchValidForBadgesGeneration } from '../logic/inputs/isBranchValidForBadgesGeneration';

export const actionWorkflow = async (): Promise<void> => {
  try {
    const currentBranch = getCurrentBranch();
    const shouldCommit = getInput('no-commit') !== 'true';
    if (shouldCommit) {
      const isBranchValid = isBranchValidForBadgesGeneration(currentBranch);
      if (!isBranchValid) {
        return info(
          '🛑 Current branch does not belong to the branches allowed for badges generation, task dropped.',
        );
      }
    }

    const isReportAvailable = await isCoverageReportAvailable();
    if (!isReportAvailable) {
      return setFailed(
        '❌ Coverage report is missing. Did you forget to run tests or to add `json-summary` to coverageReporters in your test runner config?',
      );
    }

    const summaryPathInput = getInput('coverage-summary-path');
    const badgesIconInput = getInput('badges-icon');
    const summaryPath = summaryPathInput === '' ? undefined : summaryPathInput;
    const badgesIcon = badgesIconInput === '' ? undefined : badgesIconInput;

    const outputPath = getInput('output-folder');
    // this must be checked before generating badges (duh!)
    const badgesExist = await doBadgesExist(outputPath);

    info(
      `ℹ️ Generating badges from ${
        summaryPath ? summaryPath : 'default coverage summary path'
      }`,
    );
    await generateBadges(summaryPath, outputPath, badgesIcon);

    if (!shouldCommit) {
      return info("ℹ️ `no-commit` set to true: badges won't be committed");
    }

    const hasEvolved = await hasCoverageEvolved(badgesExist, outputPath);
    if (!hasEvolved) {
      return info('✅ Coverage has not evolved, no action required.');
    }

    info('🚀 Pushing badges to the repo');
    await setGitConfig();

    const targetBranch = getTargetBranch(currentBranch);
    await pushBadges(targetBranch, outputPath);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith('❌')) {
        return setFailed(error.message);
      }

      return setFailed(
        `❌ Oh no! An error occured: ${(error as { message: string }).message}`,
      );
    }

    return setFailed(`❌ Oh no! An unknown error occured`);
  }
};
