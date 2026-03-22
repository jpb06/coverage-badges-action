import { Effect, pipe } from 'effect';
import {
  generateBadgesEffect,
  generateBadgesFromValuesEffect,
} from 'node-coverage-badges';

import { GithubActions } from '@effects/deps/github-actions';

import type { ValidatedPath } from './coverage/get-valid-paths/index.js';
import { mergeSummaryReports } from './coverage/summary-merging/merge-summary-reports.js';

export const generateBadges = (
  summaryFilesPaths: ValidatedPath[],
  outputPath: string,
) =>
  pipe(
    Effect.gen(function* () {
      const { getInput, info } = yield* GithubActions;

      if (summaryFilesPaths.length > 1) {
        yield* info(`✅ Found ${summaryFilesPaths.length} summary files`);
        yield* Effect.forEach(
          summaryFilesPaths,
          ({ path, subPath }) => info(`📁 ${path} (subPath = ${subPath})`),
          { concurrency: 'unbounded' },
        );
      }

      yield* info('🚀 Generating badges ...');
      const badgesIconInput = yield* getInput('badges-icon');
      const badgesIcon = badgesIconInput === '' ? undefined : badgesIconInput;

      const labelPrefixInput = yield* getInput('badges-labels-prefix');
      const labelPrefix =
        labelPrefixInput === '' ? undefined : labelPrefixInput;

      yield* Effect.forEach(
        summaryFilesPaths,
        ({ path, subPath }) => {
          const writePath =
            subPath === undefined ? outputPath : `${outputPath}/${subPath}`;
          return generateBadgesEffect(
            path,
            writePath,
            badgesIcon,
            labelPrefix,
            true,
          );
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
    }),
    Effect.withSpan('generate-badges', {
      attributes: {
        summaryFilesPaths,
        outputPath,
      },
    }),
  );
