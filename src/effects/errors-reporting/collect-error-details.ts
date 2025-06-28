import { FetchHttpClient } from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
import { Console, Effect, Layer, pipe } from 'effect';
import type { Cause } from 'effect/Cause';
import { captureErrors, prettyPrintFromCapturedErrors } from 'effect-errors';

import { GithubActions } from '@effects/deps/github-actions';

export const collectErrorDetails = <E>(cause: Cause<E>) =>
  pipe(
    Effect.gen(function* () {
      const captured = yield* captureErrors(cause, {
        stripCwd: true,
      });
      const message = prettyPrintFromCapturedErrors(captured, {
        hideStackTrace: true,
        stripCwd: true,
      });

      yield* Console.error(message);

      const { setFailed } = yield* GithubActions;

      setFailed('❌ Github action workflow failure');
    }),
    Effect.scoped,
    Effect.provide(Layer.mergeAll(FetchHttpClient.layer, NodeFileSystem.layer)),
    Effect.withSpan('collect-error-details'),
  );
