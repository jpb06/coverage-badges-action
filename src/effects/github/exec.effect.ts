import { exec, type ExecOptions } from '@actions/exec';
import { Effect } from 'effect';

import { GithubActionError } from './errors/github-action.error';

export const execEffect = (
  commandLine: string,
  args?: string[],
  options?: ExecOptions | undefined,
) =>
  Effect.tryPromise({
    try: async () => await exec(commandLine, args, options),
    catch: (e) =>
      new GithubActionError({
        cause: e,
      }),
  });
