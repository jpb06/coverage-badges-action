import { Effect } from 'effect';
import { readJson as fsReadJson } from 'fs-extra';

import { FsError } from './errors/fs.error';

export const readJsonEffect = <T>(path: string) =>
  Effect.tryPromise<T, FsError>({
    try: async () => await fsReadJson(path),
    catch: (e) =>
      new FsError({
        cause: e,
      }),
  });
