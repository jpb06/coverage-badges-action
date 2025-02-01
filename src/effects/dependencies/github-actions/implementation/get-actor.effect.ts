import { context } from '@actions/github';
import { Effect, pipe } from 'effect';

import { GithubActionsLayerError } from '../errors/github-actions-layer.error.js';

export const getActorEffect = () =>
  pipe(
    Effect.try({
      try: () => context.actor,
      catch: (e) =>
        new GithubActionsLayerError({
          cause: e,
        }),
    }),
    Effect.withSpan('github-actions-layer/get-actor'),
  );
