import { info } from '@actions/core';
import { Effect, pipe } from 'effect';

import { mainTask } from './main-task';

export const catchMainTaskErrors = () =>
  pipe(
    mainTask(),
    Effect.catchTag('branch-not-allowed-for-generation', (cause) =>
      Effect.sync(() => {
        info(cause.message);
      }),
    ),
  );
