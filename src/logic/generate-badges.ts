import { info, getInput } from '@actions/core';
import { Effect } from 'effect';
import {
  generateBadgesEffect,
  generateBadgesFromValuesEffect,
} from 'node-coverage-badges';

import { type ValidatedPath } from './coverage/get-valid-paths/validate-path';
import { mergeSummaryReports } from './coverage/summary-merging/merge-summary-reports';

export const generateBadges = (
  summaryFilesPaths: ValidatedPath[],
  outputPath: string,
) =>
  Effect.gen(function* () {
    if (summaryFilesPaths.length > 1) {
      info(`✅ Found ${summaryFilesPaths.length} summary files`);
      summaryFilesPaths.forEach(({ path, subPath }) => {
        info(`📁 ${path} (subPath = ${subPath})`);
      });
    }
    info(`🚀 Generating badges ...`);
    const badgesIconInput = getInput('badges-icon');
    const badgesIcon = badgesIconInput === '' ? undefined : badgesIconInput;

    yield* Effect.forEach(
      summaryFilesPaths,
      ({ path, subPath }) => {
        const writePath =
          subPath !== undefined ? `${outputPath}/${subPath}` : outputPath;

        return generateBadgesEffect(path, writePath, badgesIcon);
      },
      { concurrency: 'unbounded' },
    );

    if (summaryFilesPaths.length > 1) {
      const averageValues = yield* mergeSummaryReports(
        summaryFilesPaths.map((v) => v.path),
      );
      yield* generateBadgesFromValuesEffect(
        averageValues,
        `${outputPath}/coverage-average`,
        badgesIcon,
      );
    }
  });
