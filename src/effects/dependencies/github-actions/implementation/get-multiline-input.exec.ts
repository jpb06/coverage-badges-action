import { getMultilineInput, type InputOptions } from '@actions/core';
import { Effect, pipe } from 'effect';

import { GithubActionsLayerError } from '../errors/github-actions-layer.error.js';

export const getMultilineInputEffect = (name: string, options?: InputOptions) =>
  pipe(
    Effect.try({
      try: () => getMultilineInput(name, options),
      catch: (e) =>
        new GithubActionsLayerError({
          cause: e,
        }),
    }),
    Effect.withSpan('github-actions-layer/get-multiline-input', {
      attributes: {
        name,
        options,
      },
    }),
  );
