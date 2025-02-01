import { warning } from '@actions/core';
import { Effect, pipe } from 'effect';

import { GithubActionsLayerError } from '../errors/github-actions-layer.error.js';

export const warningEffect = (message: string) =>
  pipe(
    Effect.try({
      try: () => warning(message),
      catch: (e) =>
        new GithubActionsLayerError({
          cause: e,
        }),
    }),
    Effect.withSpan('github-actions-layer/warning', {
      attributes: {
        message,
      },
    }),
  );
