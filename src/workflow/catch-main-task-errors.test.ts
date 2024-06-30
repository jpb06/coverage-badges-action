import { Effect } from 'effect';
import { runPromise } from 'effect-errors';
import { describe, expect, it, vi, afterEach } from 'vitest';

import { GithubActionError } from '../effects/github/errors/github-action.error';
import { BranchNotAllowedForGenerationError } from '../logic/inputs/check-branch-status';
import { mockActionsCore } from '../tests/mocks';

import { mainTask } from './main-task';

vi.mock('./main-task');

describe('catchMainTaskErrors effect', () => {
  const { info } = mockActionsCore();

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

    await runPromise(catchMainTaskErrors());

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(errorMessage);
  });

  it('should fail', async () => {
    const errorMessage = 'error-message';
    const effect = Effect.fail(
      new GithubActionError({
        message: errorMessage,
      }),
    );
    vi.mocked(mainTask).mockReturnValueOnce(effect);

    const { catchMainTaskErrors } = await import('./catch-main-task-errors');

    await expect(catchMainTaskErrors()).toFailWithTag({
      _tag: 'github-action-error',
      message: errorMessage,
    });

    expect(info).toHaveBeenCalledTimes(0);
  });
});
