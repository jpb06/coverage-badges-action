import { Effect, pipe } from 'effect';
import { glob } from 'glob';

import { GlobError } from './errors/glob.error';

export const globEffect = (paths: string | string[]) =>
  pipe(
    Effect.tryPromise({
      try: async () => await glob(paths),
      catch: (e) =>
        new GlobError({
          cause: e,
        }),
    }),
    Effect.withSpan('globEffect', {
      attributes: {
        paths,
      },
    }),
  );
