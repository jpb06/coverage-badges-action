import { Effect, pipe } from 'effect';
import { readJson as fsReadJson } from 'fs-extra';
import { FsError } from 'node-coverage-badges';

export const readJsonEffect = <T>(path: string) =>
  pipe(
    Effect.tryPromise<T, FsError>({
      try: async () => await fsReadJson(path),
      catch: (e) =>
        new FsError({
          cause: e,
        }),
    }),
    Effect.withSpan('readJsonEffect', {
      attributes: {
        path,
      },
    }),
  );
