import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import { describe, expect, it } from 'vitest';

import { makeGithubActionsTestLayer } from '@tests/layers';

import { pushBadges } from './push-badges.js';

describe('pushBadges function', () => {
  it('should push changes', async () => {
    const branchName = 'master';

    const { GithubActionsTestLayer, execMock, getInputMock } =
      makeGithubActionsTestLayer({
        getInput: Effect.succeed('Updating coverage badges'),
        exec: Effect.succeed(1),
      });

    await runPromise(
      pipe(pushBadges(branchName), Effect.provide(GithubActionsTestLayer)),
      {
        stripCwd: true,
        hideStackTrace: true,
      },
    );

    expect(getInputMock).toHaveBeenCalledTimes(1);
    expect(getInputMock).toHaveBeenCalledWith('commit-message');

    expect(execMock).toHaveBeenCalledTimes(5);
    expect(execMock).toHaveBeenNthCalledWith(1, 'git checkout', [branchName]);
    expect(execMock).toHaveBeenNthCalledWith(3, 'git add', ['./badges']);
    expect(execMock).toHaveBeenNthCalledWith(4, 'git commit', [
      '-m',
      'Updating coverage badges',
    ]);
    expect(execMock).toHaveBeenNthCalledWith(
      5,
      `git push origin ${branchName}`,
    );
  });
});
