import { setFailed } from '@actions/core';
import { Effect, pipe } from 'effect';

import { GithubActionsLayerError } from '../errors/github-actions-layer.error.js';

export const setFailedEffect = (message: string) =>
  pipe(
    Effect.try({
      try: () => setFailed(message),
      catch: (e) =>
        new GithubActionsLayerError({
          cause: e,
        }),
    }),
    Effect.withSpan('github-actions-layer/set-failed', {
      attributes: {
        message,
      },
    }),
  );
