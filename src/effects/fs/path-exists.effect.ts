import { Effect } from 'effect';
import { pathExists as fsPathExists } from 'fs-extra';

import { FsError } from './errors/fs.error';

export const pathExistsEffect = (path: string) =>
  Effect.tryPromise({
    try: async () => await fsPathExists(path),
    catch: (e) =>
      new FsError({
        cause: e,
      }),
  });
