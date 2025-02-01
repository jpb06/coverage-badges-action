import { type ExecOptions, exec } from '@actions/exec';
import { Effect, pipe } from 'effect';

import { GithubActionsLayerError } from '../errors/github-actions-layer.error.js';

export const execEffect = (
  commandLine: string,
  args?: string[],
  options?: ExecOptions,
) =>
  pipe(
    Effect.tryPromise({
      try: async () => await exec(commandLine, args, options),
      catch: (e) =>
        new GithubActionsLayerError({
          cause: e,
        }),
    }),
    Effect.withSpan('github-actions-layer/exec', {
      attributes: {
        commandLine,
        args,
        options,
      },
    }),
  );
