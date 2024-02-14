import { getInput, info } from '@actions/core';
import { describe, afterEach, expect, vi, it } from 'vitest';

import { isBranchValidForBadgesGeneration } from './isBranchValidForBadgesGeneration';

vi.mock('@actions/core');

describe('isBranchValidForBadgesGeneration function', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when no branches were specified as input and current branch is master', () => {
    vi.mocked(getInput).mockReturnValueOnce('');

    const result = isBranchValidForBadgesGeneration('master');

    expect(info).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('should return true when no branches were specified as input and current branch is main', () => {
    vi.mocked(getInput).mockReturnValueOnce('');

    const result = isBranchValidForBadgesGeneration('main');

    expect(info).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('should return true if branch is allowed', () => {
    vi.mocked(getInput).mockReturnValueOnce('yolo,bro,master,cool');

    const result = isBranchValidForBadgesGeneration('master');

    expect(info).toHaveBeenCalledTimes(0);
    expect(result).toBe(true);
  });

  it('should return false if branch is not allowed', () => {
    vi.mocked(getInput).mockReturnValueOnce('yolo,bro,cool');

    const result = isBranchValidForBadgesGeneration('master');

    expect(info).toHaveBeenCalledTimes(0);
    expect(result).toBe(false);
  });
});
