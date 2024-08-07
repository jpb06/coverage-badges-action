import { Effect, pipe } from 'effect';

import { execEffect } from '../../effects/github';

export const hasCoverageEvolved = (badgesExist: boolean, outputPath: string) =>
  pipe(
    Effect.gen(function* () {
      if (!badgesExist) {
        return true;
      }

      const code = yield* execEffect(
        'git diff',
        ['--quiet', `${outputPath}/*`],
        {
          ignoreReturnCode: true,
        },
      );
      const hasChanged = code === 1;

      return hasChanged;
    }),
    Effect.withSpan('hasCoverageEvolved', {
      attributes: {
        badgesExist,
        outputPath,
      },
    }),
  );
