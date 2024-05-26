import { Effect, pipe } from 'effect';

import { pathExistsEffect } from '../../effects/fs';

import { type ValidatedPath } from './get-valid-paths/validate-path';

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

export const doBadgesExist = (outputPath: string, paths: ValidatedPath[]) =>
  pipe(
    Effect.forEach(
      paths,
      ({ outputPath: outputSubPath }) =>
        pipe(
          Effect.all(
            files.map((file) =>
              pathExistsEffect(
                `${outputPath}/${maybeAddSubPath(outputSubPath)}${file}`,
              ),
            ),
            {
              concurrency: 'unbounded',
            },
          ),
          Effect.map((result) => result.every((exists) => exists)),
        ),
      {
        concurrency: 'unbounded',
      },
    ),
    Effect.map((result) => result.every((allExist) => allExist)),
  );
