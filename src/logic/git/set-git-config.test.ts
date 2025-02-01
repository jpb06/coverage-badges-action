import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { describe, expect, it, vi } from 'vitest';

import { makeGithubActionsTestLayer } from '@tests/layers';

import { setGitConfig } from './set-git-config.js';

describe('setGitConfig function', () => {
  const actor = 'actor';

  it('should use default values for commit user', async () => {
    const { GithubActionsTestLayer, execMock } = makeGithubActionsTestLayer({
      getInput: Effect.succeed(''),
      exec: Effect.succeed(1),
      getActor: Effect.succeed(actor),
    });

    await runPromise(
      pipe(setGitConfig(), Effect.provide(GithubActionsTestLayer)),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(execMock).toHaveBeenCalledTimes(2);
    expect(execMock).toHaveBeenNthCalledWith(1, 'git config', [
      '--global',
      'user.name',
      actor,
    ]);
    expect(execMock).toHaveBeenNthCalledWith(2, 'git config', [
      '--global',
      'user.email',
      `${actor}@users.noreply.github.com`,
    ]);
  });

  it('should use custom values for commit user', async () => {
    const email = 'yolo@cool.org';
    const name = 'yolo bro';

    const { GithubActionsTestLayer, execMock } = makeGithubActionsTestLayer({
      getInput: vi
        .fn()
        .mockReturnValueOnce(Effect.succeed(email))
        .mockReturnValueOnce(Effect.succeed(name)),
      exec: Effect.succeed(1),
      getActor: Effect.succeed(actor),
    });

    await runPromise(
      pipe(setGitConfig(), Effect.provide(GithubActionsTestLayer)),
      { stripCwd: true, hideStackTrace: true },
    );

    expect(execMock).toHaveBeenCalledTimes(2);
    expect(execMock).toHaveBeenNthCalledWith(1, 'git config', [
      '--global',
      'user.name',
      name,
    ]);
    expect(execMock).toHaveBeenNthCalledWith(2, 'git config', [
      '--global',
      'user.email',
      email,
    ]);
  });
});
