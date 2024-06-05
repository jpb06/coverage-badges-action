import { Effect } from 'effect';
import { type FsError } from 'node-coverage-badges';

import { isCoverageReportAvailableForFile } from '../is-coverage-report-available-for-file';

export interface ValidatedPath {
  path: string;
  subPath?: string;
}

export const validatePath =
  (maybeGlobPath: string) =>
  (path: string): Effect.Effect<ValidatedPath | undefined, FsError> =>
    Effect.gen(function* () {
      const isValid = yield* isCoverageReportAvailableForFile(path);
      if (!isValid) {
        return undefined;
      }

      const isGlobPath = maybeGlobPath.includes('**');
      if (isGlobPath) {
        const pathChunks = maybeGlobPath.split('**');
        const pattern = `^${pathChunks[0].slice(2)}(.*)${pathChunks[1]}$`;
        const regex = new RegExp(pattern);

        return { path, subPath: regex.exec(path)?.[1] };
      }

      // assuming we get something ending with '/coverage/coverage-summary.json' ...
      const subPath = path.substring(
        0,
        path.lastIndexOf('/coverage/coverage-summary.json'),
      );
      const hasSubpath = subPath !== '.' && subPath !== '';

      return {
        path,
        subPath: hasSubpath ? subPath : undefined,
      };
    });
