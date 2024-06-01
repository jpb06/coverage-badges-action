import { Effect } from 'effect';

import { catchMainTaskErrors } from './catch-main-task-errors';

export const promisifiedActionWorkflow = async (): Promise<void> => {
  await Effect.runPromise(catchMainTaskErrors());
};
