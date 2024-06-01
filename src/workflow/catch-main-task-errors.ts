import { info, setFailed } from '@actions/core';
import { Effect, pipe } from 'effect';
import { match } from 'ts-pattern';

import { mainTask } from './main-task';

export const catchMainTaskErrors = () =>
  pipe(
    mainTask(),
    Effect.catchAllCause((cause) => {
      if (cause._tag === 'Fail') {
        return Effect.sync(() => {
          match(cause.error._tag)
            .with('branch-not-allowed-for-generation', () => {
              info(cause.error.message);
            })
            .otherwise(() => {
              setFailed(cause.error.message);
            });
        });
      }

      if (cause._tag === 'Die') {
        return Effect.sync(() => {
          setFailed(cause.defect as never);
        });
      }

      return Effect.sync(() => {
        setFailed(`❌ Oh no! An unknown error occured`);
      });
    }),
  );
