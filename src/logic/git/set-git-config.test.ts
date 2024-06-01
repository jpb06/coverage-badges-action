import { getInput } from '@actions/core';
import { exec } from '@actions/exec';
import { context } from '@actions/github';
import { Effect } from 'effect';
import { describe, beforeEach, expect, vi, it } from 'vitest';

import { setGitConfig } from './set-git-config';

vi.mock('@actions/exec');
vi.mock('@actions/github');
vi.mock('@actions/core');

describe('setGitConfig function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use default values for commit user', async () => {
    vi.mocked(getInput).mockReturnValue('');

    await Effect.runPromise(setGitConfig());

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(
      1,
      'git config',
      ['--global', 'user.name', context.actor],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(
      2,
      'git config',
      ['--global', 'user.email', `${context.actor}@users.noreply.github.com`],
      undefined,
    );
  });

  it('should use custom values for commit user', async () => {
    const email = 'yolo@cool.org';
    const name = 'yolo bro';
    vi.mocked(getInput).mockReturnValueOnce(email).mockReturnValueOnce(name);

    await Effect.runPromise(setGitConfig());

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(
      1,
      'git config',
      ['--global', 'user.name', name],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(
      2,
      'git config',
      ['--global', 'user.email', email],
      undefined,
    );
  });
});
