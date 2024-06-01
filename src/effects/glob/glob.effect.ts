import { Effect } from 'effect';
import { glob } from 'glob';

import { GlobError } from './errors/glob.error';

export const globEffect = (paths: string | string[]) =>
  Effect.tryPromise({
    try: async () => await glob(paths),
    catch: (e) =>
      new GlobError({
        cause: e,
      }),
  });
