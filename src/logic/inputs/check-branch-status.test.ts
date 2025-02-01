import { Effect, pipe } from 'effect';
import { runSync } from 'effect-errors';
import { describe, expect, it } from 'vitest';

import { makeGithubActionsTestLayer } from '@tests/layers';

import { checkBranchStatus } from './check-branch-status.js';

describe('isBranchValidForBadgesGeneration function', () => {
  it('should not fail when no branches were specified as input and current branch is master', () => {
    const { GithubActionsTestLayer, infoMock } = makeGithubActionsTestLayer({
      getInput: Effect.succeed(''),
      info: Effect.void,
    });

    expect(() => {
      runSync(
        pipe(
          checkBranchStatus('master', true),
          Effect.provide(GithubActionsTestLayer),
        ),
      );
    }).not.toThrow();

    expect(infoMock).toHaveBeenCalledTimes(1);
  });

  it('should not fail when no branches were specified as input and current branch is main', () => {
    const { GithubActionsTestLayer, infoMock } = makeGithubActionsTestLayer({
      getInput: Effect.succeed(''),
      info: Effect.void,
    });

    expect(() => {
      runSync(
        pipe(
          checkBranchStatus('main', true),
          Effect.provide(GithubActionsTestLayer),
        ),
      );
    }).not.toThrow();

    expect(infoMock).toHaveBeenCalledTimes(1);
  });

  it('should fail if branch is not allowed', () => {
    const { GithubActionsTestLayer, infoMock } = makeGithubActionsTestLayer({
      getInput: Effect.succeed('yolo,bro,master,cool'),
      info: Effect.void,
    });

    expect(() => {
      Effect.runSync(
        pipe(
          checkBranchStatus('main', true),
          Effect.provide(GithubActionsTestLayer),
        ),
      );
    }).toThrow();

    expect(infoMock).toHaveBeenCalledTimes(0);
  });
});
