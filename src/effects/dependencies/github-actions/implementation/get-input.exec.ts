import { getInput, type InputOptions } from '@actions/core';
import { Effect, pipe } from 'effect';

import { GithubActionsLayerError } from '../errors/github-actions-layer.error.js';

export const getInputEffect = (name: string, options?: InputOptions) =>
  pipe(
    Effect.try({
      try: () => getInput(name, options),
      catch: (e) =>
        new GithubActionsLayerError({
          cause: e,
        }),
    }),
    Effect.withSpan('github-actions-layer/get-input', {
      attributes: {
        name,
        options,
      },
    }),
  );
