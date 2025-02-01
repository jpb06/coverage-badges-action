import { Effect, pipe } from 'effect';
import { glob } from 'glob';

import { GlobError } from './errors/glob.error.js';

export const globEffect = (paths: string | string[]) =>
  pipe(
    Effect.tryPromise({
      try: async () => await glob(paths),
      catch: (e) =>
        new GlobError({
          cause: e,
        }),
    }),
    Effect.withSpan('glob-effect', {
      attributes: {
        paths,
      },
    }),
  );
