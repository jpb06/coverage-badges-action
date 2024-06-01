import { Effect } from 'effect';
import { describe, expect, it, vi, afterEach } from 'vitest';

import { GithubActionError } from '../effects/github/errors/github-action.error';
import { BranchNotAllowedForGenerationError } from '../logic/inputs/check-branch-status';
import { mockActionsCore } from '../tests/mocks';

import { mainTask } from './main-task';

vi.mock('./main-task');

describe('catchMainTaskErrors effect', () => {
  const { info, setFailed } = mockActionsCore();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call info when a BranchNotAllowedForGenerationError occurs', async () => {
    const errorMessage = 'error-message';
    const effect = Effect.fail(
      new BranchNotAllowedForGenerationError({
        message: errorMessage,
      }),
    );
    vi.mocked(mainTask).mockReturnValueOnce(effect);

    const { catchMainTaskErrors } = await import('./catch-main-task-errors');

    await Effect.runPromise(catchMainTaskErrors());

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(errorMessage);
  });

  it('should call setFailed when any other effect error occurs', async () => {
    const errorMessage = 'error-message';
    const effect = Effect.fail(
      new GithubActionError({
        message: errorMessage,
      }),
    );
    vi.mocked(mainTask).mockReturnValueOnce(effect);

    const { catchMainTaskErrors } = await import('./catch-main-task-errors');

    await Effect.runPromise(catchMainTaskErrors());

    expect(info).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(errorMessage);
  });

  it('should call setFailed with a generic error', async () => {
    const errorMessage = 'error-message';
    const effect = Effect.sync(() => {
      throw new Error(errorMessage);
    });
    vi.mocked(mainTask).mockReturnValueOnce(effect);

    const { catchMainTaskErrors } = await import('./catch-main-task-errors');

    await Effect.runPromise(catchMainTaskErrors());

    expect(info).toHaveBeenCalledTimes(0);
    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(new Error(errorMessage));
  });
});
