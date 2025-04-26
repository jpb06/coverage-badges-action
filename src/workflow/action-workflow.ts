import { NodeFileSystem } from '@effect/platform-node';
import { Effect, Layer, pipe } from 'effect';
import { runPromise } from 'effect-errors';

import { GithubActionsLayerLive } from '@effects/deps/github-actions';
import { LoggerConsoleLive } from '@effects/deps/logger';
import { collectErrorDetails } from '@effects/errors';

import { mainTask } from './main-task.js';

export const actionWorkflow = () =>
  runPromise(
    pipe(
      mainTask(),
      Effect.sandbox,
      Effect.catchAll(collectErrorDetails),
      Effect.provide(
        Layer.mergeAll(
          LoggerConsoleLive,
          GithubActionsLayerLive,
          NodeFileSystem.layer,
        ),
      ),
      Effect.withSpan('action-workflow'),
    ),
  );
