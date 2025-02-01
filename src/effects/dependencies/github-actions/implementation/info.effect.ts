import { info } from '@actions/core';
import { Effect, pipe } from 'effect';

import { GithubActionsLayerError } from '../errors/github-actions-layer.error.js';

export const infoEffect = (message: string) =>
  pipe(
    Effect.try({
      try: () => info(message),
      catch: (e) =>
        new GithubActionsLayerError({
          cause: e,
        }),
    }),
    Effect.withSpan('github-actions-layer/info', {
      attributes: {
        message,
      },
    }),
  );
