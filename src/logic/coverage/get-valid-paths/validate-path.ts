import { Effect } from 'effect';

import { type FsError } from '../../../effects/fs/errors/fs.error';
import { isCoverageReportAvailableForFile } from '../is-coverage-report-available-for-file';

export interface ValidatedPath {
  path: string;
  outputPath?: string;
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
        const regex = new RegExp(`^${pathChunks[0]}(.*)${pathChunks[1]}$`);

        return { path, outputPath: regex.exec(path)?.[1] };
      }

      // assuming we get something ending with '/coverage/coverage-summary.json' ...
      const subPath = path.substring(
        0,
        path.lastIndexOf('/coverage/coverage-summary.json'),
      );
      const hasSubpath = subPath !== '.' && subPath !== '';

      return {
        path,
        outputPath: hasSubpath ? subPath : undefined,
      };
    });
