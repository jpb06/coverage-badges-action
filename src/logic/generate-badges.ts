import { info, getInput } from '@actions/core';
import { Effect } from 'effect';
import { generateBadgesEffect } from 'node-coverage-badges';

import { type ValidatedPath } from './coverage/get-valid-paths/validate-path';

export const generateBadges = (
  summaryFilesPaths: ValidatedPath[],
  outputPath: string,
) =>
  Effect.gen(function* () {
    if (summaryFilesPaths.length > 1) {
      info(`✅ Found ${summaryFilesPaths.length} summary files`);
      summaryFilesPaths.forEach(({ path }) => {
        info(`📁 ${path}`);
      });
    }
    info(`🚀 Generating badges ...`);
    const badgesIconInput = getInput('badges-icon');
    const badgesIcon = badgesIconInput === '' ? undefined : badgesIconInput;

    yield* Effect.forEach(
      summaryFilesPaths,
      ({ path, subPath }) =>
        generateBadgesEffect(
          path,
          subPath !== undefined ? `${outputPath}/${subPath}` : outputPath,
          badgesIcon,
        ),
      {
        concurrency: 'unbounded',
      },
    );
  });
