import { exec, type ExecOptions } from '@actions/exec';
import { Effect, pipe } from 'effect';

import { GithubActionError } from './errors/github-action.error';

export const execEffect = (
  commandLine: string,
  args?: string[],
  options?: ExecOptions | undefined,
) =>
  pipe(
    Effect.tryPromise({
      try: async () => await exec(commandLine, args, options),
      catch: (e) =>
        new GithubActionError({
          cause: e,
        }),
    }),
    Effect.withSpan('execEffect', {
      attributes: {
        commandLine,
        args,
        options,
      },
    }),
  );
