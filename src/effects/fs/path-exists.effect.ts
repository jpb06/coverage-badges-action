import { Effect, pipe } from 'effect';
import { pathExists as fsPathExists } from 'fs-extra';
import { FsError } from 'node-coverage-badges';

export const pathExistsEffect = (path: string) =>
  pipe(
    Effect.tryPromise({
      try: async () => await fsPathExists(path),
      catch: (e) =>
        new FsError({
          cause: e,
        }),
    }),
    Effect.withSpan('pathExistsEffect', {
      attributes: {
        path,
      },
    }),
  );
