import { FileSystem } from '@effect/platform/FileSystem';
import { Effect, pipe } from 'effect';

import type { ValidatedPath } from './get-valid-paths/index.js';

const files = [
  'coverage-branches.svg',
  'coverage-functions.svg',
  'coverage-total.svg',
  'coverage-lines.svg',
  'coverage-statements.svg',
];

const maybeAddSubPath = (path: string | undefined) => {
  if (path === undefined) {
    return '';
  }

  return path?.endsWith('/') ? path : `${path}/`;
};

const validatePath =
  (outputPath: string, exists: FileSystem['exists']) =>
  ({ subPath }: ValidatedPath) =>
    pipe(
      Effect.all(
        files.map((file) =>
          exists(`${outputPath}/${maybeAddSubPath(subPath)}${file}`),
        ),
        { concurrency: 'unbounded' },
      ),
      Effect.map((result) => result.every((exists) => exists)),
    );

export const doBadgesExist = (outputPath: string, paths: ValidatedPath[]) =>
  pipe(
    Effect.gen(function* () {
      const { exists } = yield* FileSystem;

      const result = yield* Effect.forEach(
        paths,
        validatePath(outputPath, exists),
        {
          concurrency: 'unbounded',
        },
      );

      return result.every((allExist) => allExist);
    }),
    Effect.withSpan('do-badges-exist', {
      attributes: {
        outputPath,
        paths,
      },
    }),
  );
