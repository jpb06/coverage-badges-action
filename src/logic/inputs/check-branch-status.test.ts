import { getInput, info } from '@actions/core';
import { Effect } from 'effect';
import { describe, afterEach, expect, vi, it } from 'vitest';

import { checkBranchStatus } from './check-branch-status';

vi.mock('@actions/core');

describe('isBranchValidForBadgesGeneration function', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not fail when no branches were specified as input and current branch is master', () => {
    vi.mocked(getInput).mockReturnValueOnce('');

    expect(() => {
      Effect.runSync(checkBranchStatus('master', true));
    }).not.toThrow();
    expect(info).toHaveBeenCalledTimes(1);
  });

  it('should not fail when no branches were specified as input and current branch is main', () => {
    vi.mocked(getInput).mockReturnValueOnce('');

    expect(() => {
      Effect.runSync(checkBranchStatus('main', true));
    }).not.toThrow();
    expect(info).toHaveBeenCalledTimes(1);
  });

  it('should fail if branch is not allowed', () => {
    vi.mocked(getInput).mockReturnValueOnce('yolo,bro,master,cool');

    expect(() => {
      Effect.runSync(checkBranchStatus('main', true));
    }).toThrow();
    expect(info).toHaveBeenCalledTimes(0);
  });
});
