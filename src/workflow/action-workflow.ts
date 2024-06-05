import { runPromise } from 'effect-errors';

import { catchMainTaskErrors } from './catch-main-task-errors';

export const promisifiedActionWorkflow = async (): Promise<void> => {
  await runPromise(catchMainTaskErrors());
};
