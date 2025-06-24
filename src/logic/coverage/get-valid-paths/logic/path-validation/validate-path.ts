import type { PlatformError } from '@effect/platform/Error';
import type { FileSystem } from '@effect/platform/FileSystem';
import { Effect, pipe } from 'effect';

import type { JsonParsingError } from '@effects/deps/fs/read-json/index.js';

import type { ValidatedPath } from '../../types/validated-types.type.js';
import { isCoverageReportAvailableForFile } from '../coverage-report-availability/index.js';

export const validatePath =
  (maybeGlobPath: string) =>
  (
    path: string,
  ): Effect.Effect<
    ValidatedPath | undefined,
    PlatformError | JsonParsingError,
    FileSystem
  > =>
    pipe(
      Effect.gen(function* () {
        const isValid = yield* isCoverageReportAvailableForFile(path);
        if (!isValid) {
          return undefined;
        }

        const isGlobPath = maybeGlobPath.includes('**');
        if (isGlobPath) {
          const pathChunks = maybeGlobPath.split('**');
          const pattern = `^${pathChunks[0].startsWith('./') ? pathChunks[0].slice(2) : pathChunks[0]}(.*)${pathChunks[1]}$`;
          const regex = new RegExp(pattern);

          const maybeSubPath = regex.exec(path)?.[1];
          return { path, subPath: maybeSubPath };
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
      }),
      Effect.withSpan('validate-path', {
        attributes: {
          maybeGlobPath,
          path,
        },
      }),
    );
