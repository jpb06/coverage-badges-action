import { NodeFileSystem } from '@effect/platform-node';
import { Effect, Layer, pipe } from 'effect';
import { runPromise } from 'effect-errors';
import {
  generateBadgesEffect,
  generateBadgesFromValuesEffect,
} from 'node-coverage-badges';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { anyObject, arrayIncludes, mockFn } from 'vitest-mock-extended';

import { globEffect } from '@effects/deps/glob';
import { makeFsTestLayer, makeGithubActionsTestLayer } from '@tests/layers';
import { summaryFileMockData } from '@tests/mock-data';

import { mainTask } from './main-task.js';

vi.mock('node-coverage-badges');
vi.mock('@effects/deps/glob');

describe('mainTask function', () => {
  const branchName = 'main';
  const targetBranch = 'targetBranch';
  const outputPath = './badges';
  const commitMessage = 'chore: badges';
  const actor = 'yolobro';

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    process.env.GITHUB_HEAD_REF = undefined;
    process.env.GITHUB_REF_NAME = undefined;
  });

  it('should fail if current branch could not be computed', async () => {
    process.env.GITHUB_HEAD_REF = undefined;
    process.env.GITHUB_REF_NAME = undefined;

    const { GithubActionsTestLayer, warningMock } = makeGithubActionsTestLayer({
      getInput: Effect.succeed(''),
      warning: Effect.void,
    });

    const program = pipe(
      mainTask(),
      Effect.provide(
        Layer.mergeAll(GithubActionsTestLayer, NodeFileSystem.layer),
      ),
    );

    await expect(program).toFailWithTag({
      _tag: 'github-missing-current-branch',
      message: '🚨 Unable to get current branch from github event.',
    });

    expect(warningMock).toHaveBeenCalledTimes(2);
  });

  it('should fail if branch is not allowed, from allowed branches default value', async () => {
    const branchName = 'cool';
    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    const getInputMock = mockFn();
    getInputMock.calledWith('no-commit').mockReturnValueOnce('');
    getInputMock.calledWith('branches').mockReturnValue(Effect.succeed(''));

    const { GithubActionsTestLayer, infoMock } = makeGithubActionsTestLayer({
      getInput: getInputMock,
      warning: Effect.void,
      info: Effect.void,
    });

    const program = pipe(
      mainTask(),
      Effect.provide(
        Layer.mergeAll(GithubActionsTestLayer, NodeFileSystem.layer),
      ),
    );

    await runPromise(program);

    expect(infoMock).toHaveBeenCalledTimes(3);
    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      `ℹ️ Current branch is ${branchName}`,
    );
    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      'ℹ️ No branches specified, defaulting to master and main',
    );
    expect(infoMock).toHaveBeenNthCalledWith(
      3,
      '🛑 Current branch does not belong to the branches allowed for badges generation, task dropped.',
    );
  });

  it('should fail if branch is not allowed', async () => {
    const branchName = 'yolo';
    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    const getInputMock = mockFn();
    getInputMock.calledWith('no-commit').mockReturnValueOnce('');
    getInputMock
      .calledWith('branches')
      .mockReturnValue(Effect.succeed('bro,awoowoo'));

    const { GithubActionsTestLayer, infoMock } = makeGithubActionsTestLayer({
      getInput: getInputMock,
      warning: Effect.void,
      info: Effect.void,
    });

    const program = pipe(
      mainTask(),
      Effect.provide(
        Layer.mergeAll(GithubActionsTestLayer, NodeFileSystem.layer),
      ),
    );

    await runPromise(program);

    expect(infoMock).toHaveBeenCalledTimes(2);
    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      `ℹ️ Current branch is ${branchName}`,
    );
    expect(infoMock).toHaveBeenNthCalledWith(
      2,
      '🛑 Current branch does not belong to the branches allowed for badges generation, task dropped.',
    );
  });

  it('should fail if there is no coverage report (single file)', async () => {
    const branchName = 'main';
    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    const getInputMock = mockFn();
    getInputMock.calledWith('no-commit').mockReturnValueOnce('');
    getInputMock
      .calledWith('branches')
      .mockReturnValue(Effect.succeed('main,master'));

    const { GithubActionsTestLayer } = makeGithubActionsTestLayer({
      getInput: getInputMock,
      getMultilineInput: mockFn()
        .calledWith('coverage-summary-path')
        .mockReturnValueOnce(
          Effect.succeed(['./coverage/coverage-summary.json']),
        ),
      warning: Effect.void,
      info: Effect.void,
    });

    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(false),
    });

    vi.mocked(globEffect).mockReturnValueOnce(
      Effect.succeed(['./coverage/coverage-summary.json']),
    );

    const program = pipe(
      mainTask(),
      Effect.provide(Layer.mergeAll(GithubActionsTestLayer, FsTestLayer)),
    );

    await expect(program).toFailWithTag({
      _tag: 'no-json-summaries-provided',
      message:
        '❌ No valid coverage reports provided. Perhaps you forgot to run tests or to add `json-summary` to coverageReporters in your test runner config?',
    });
  });

  it('should generate badges but not commit them', async () => {
    const reportPath = './coverage/coverage-summary.json';

    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    const getInputMock = mockFn();
    getInputMock
      .calledWith('badges-icon')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('badges-labels-prefix')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('no-commit')
      .mockReturnValueOnce(Effect.succeed('true'));
    getInputMock
      .calledWith('branches')
      .mockReturnValueOnce(Effect.succeed('main,master'));
    getInputMock
      .calledWith('commit-user-email')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('commit-user')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('target-branch')
      .mockReturnValueOnce(Effect.succeed(targetBranch));
    getInputMock
      .calledWith('output-folder')
      .mockReturnValueOnce(Effect.succeed(outputPath));
    getInputMock
      .calledWith('commit-message')
      .mockReturnValueOnce(Effect.succeed(commitMessage));

    const { GithubActionsTestLayer, infoMock, execMock } =
      makeGithubActionsTestLayer({
        info: Effect.void,
        getInput: getInputMock,
        getMultilineInput: mockFn()
          .calledWith('coverage-summary-path')
          .mockReturnValueOnce(Effect.succeed([reportPath])),
        exec: mockFn()
          .calledWith('git diff', arrayIncludes(`${outputPath}/*`), anyObject())
          .mockReturnValueOnce(Effect.succeed(1)),
      });

    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: Effect.succeed(
        summaryFileMockData({
          branches: 10,
          functions: 20,
          lines: 30,
          statements: 40,
        }),
      ),
    });

    vi.mocked(globEffect).mockReturnValueOnce(Effect.succeed([reportPath]));
    vi.mocked(generateBadgesEffect).mockImplementation(() =>
      Effect.succeed({
        total: {
          branches: {
            pct: 10,
          },
          functions: {
            pct: 20,
          },
          lines: {
            pct: 30,
          },
          statements: {
            pct: 40,
          },
        },
      }),
    );

    const program = pipe(
      mainTask(),
      Effect.provide(Layer.mergeAll(GithubActionsTestLayer, FsTestLayer)),
    );

    await runPromise(program, { stripCwd: true, hideStackTrace: true });

    expect(infoMock).toHaveBeenCalledTimes(3);
    expect(infoMock).toHaveBeenNthCalledWith(1, 'ℹ️ Current branch is main');
    expect(infoMock).toHaveBeenNthCalledWith(2, '🚀 Generating badges ...');
    expect(infoMock).toHaveBeenNthCalledWith(
      3,
      "ℹ️ `no-commit` set to true: badges won't be committed",
    );

    expect(generateBadgesEffect).toHaveBeenCalledTimes(1);
    expect(generateBadgesEffect).toHaveBeenNthCalledWith(
      1,
      './coverage/coverage-summary.json',
      './badges',
      undefined,
      undefined,
      true,
    );

    expect(execMock).toHaveBeenCalledTimes(0);
  });

  it('should not push badges if coverage has not evolved', async () => {
    const reportPath = './coverage/coverage-summary.json';

    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    const getInputMock = mockFn();
    getInputMock
      .calledWith('badges-icon')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('badges-labels-prefix')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('no-commit')
      .mockReturnValueOnce(Effect.succeed('false'));
    getInputMock
      .calledWith('branches')
      .mockReturnValueOnce(Effect.succeed('main,master'));
    getInputMock
      .calledWith('commit-user-email')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('commit-user')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('target-branch')
      .mockReturnValueOnce(Effect.succeed(targetBranch));
    getInputMock
      .calledWith('output-folder')
      .mockReturnValueOnce(Effect.succeed(outputPath));
    getInputMock
      .calledWith('commit-message')
      .mockReturnValueOnce(Effect.succeed(commitMessage));

    const { GithubActionsTestLayer, infoMock, execMock } =
      makeGithubActionsTestLayer({
        info: Effect.void,
        getInput: getInputMock,
        getMultilineInput: mockFn()
          .calledWith('coverage-summary-path')
          .mockReturnValueOnce(Effect.succeed([reportPath])),
        exec: mockFn()
          .calledWith('git diff', arrayIncludes(`${outputPath}/*`), anyObject())
          .mockReturnValueOnce(Effect.succeed(0)),
      });

    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: Effect.succeed(
        summaryFileMockData({
          branches: 10,
          functions: 20,
          lines: 30,
          statements: 40,
        }),
      ),
    });

    vi.mocked(globEffect).mockReturnValueOnce(Effect.succeed([reportPath]));
    vi.mocked(generateBadgesEffect).mockImplementation(() =>
      Effect.succeed({
        total: {
          branches: {
            pct: 10,
          },
          functions: {
            pct: 20,
          },
          lines: {
            pct: 30,
          },
          statements: {
            pct: 40,
          },
        },
      }),
    );

    const program = pipe(
      mainTask(),
      Effect.provide(Layer.mergeAll(GithubActionsTestLayer, FsTestLayer)),
    );

    await runPromise(program, { stripCwd: true, hideStackTrace: true });

    expect(infoMock).toHaveBeenCalledTimes(3);
    expect(infoMock).toHaveBeenNthCalledWith(1, 'ℹ️ Current branch is main');
    expect(infoMock).toHaveBeenNthCalledWith(2, '🚀 Generating badges ...');
    expect(infoMock).toHaveBeenNthCalledWith(
      3,
      '✅ Coverage has not evolved, no action required.',
    );

    expect(generateBadgesEffect).toHaveBeenCalledTimes(1);
    expect(generateBadgesEffect).toHaveBeenNthCalledWith(
      1,
      './coverage/coverage-summary.json',
      './badges',
      undefined,
      undefined,
      true,
    );

    expect(execMock).toHaveBeenCalledTimes(1);
    expect(execMock).toHaveBeenNthCalledWith(
      1,
      'git diff',
      ['--quiet', `${outputPath}/*`],
      { ignoreReturnCode: true },
    );
  });

  it('should generate badges from a single report', async () => {
    const reportPath = './coverage/coverage-summary.json';

    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    const getInputMock = mockFn();
    getInputMock
      .calledWith('badges-icon')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('badges-labels-prefix')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('no-commit')
      .mockReturnValueOnce(Effect.succeed('false'));
    getInputMock
      .calledWith('branches')
      .mockReturnValueOnce(Effect.succeed('main,master'));
    getInputMock
      .calledWith('commit-user-email')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('commit-user')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('target-branch')
      .mockReturnValueOnce(Effect.succeed(targetBranch));
    getInputMock
      .calledWith('output-folder')
      .mockReturnValueOnce(Effect.succeed(outputPath));
    getInputMock
      .calledWith('commit-message')
      .mockReturnValueOnce(Effect.succeed(commitMessage));

    const { GithubActionsTestLayer, infoMock, execMock } =
      makeGithubActionsTestLayer({
        info: Effect.void,
        getInput: getInputMock,
        getMultilineInput: mockFn()
          .calledWith('coverage-summary-path')
          .mockReturnValueOnce(Effect.succeed([reportPath])),
        exec: mockFn()
          .calledWith('git diff', arrayIncludes(`${outputPath}/*`), anyObject())
          .mockReturnValue(Effect.succeed(1)),
        getActor: Effect.succeed(actor),
      });

    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: Effect.succeed(
        summaryFileMockData({
          branches: 10,
          functions: 20,
          lines: 30,
          statements: 40,
        }),
      ),
    });

    vi.mocked(globEffect).mockReturnValueOnce(Effect.succeed([reportPath]));
    vi.mocked(generateBadgesEffect).mockImplementation(() =>
      Effect.succeed({
        total: {
          branches: {
            pct: 10,
          },
          functions: {
            pct: 20,
          },
          lines: {
            pct: 30,
          },
          statements: {
            pct: 40,
          },
        },
      }),
    );

    const program = pipe(
      mainTask(),
      Effect.provide(Layer.mergeAll(GithubActionsTestLayer, FsTestLayer)),
    );

    await runPromise(program, { stripCwd: true, hideStackTrace: true });

    expect(infoMock).toHaveBeenCalledTimes(3);
    expect(infoMock).toHaveBeenNthCalledWith(1, 'ℹ️ Current branch is main');
    expect(infoMock).toHaveBeenNthCalledWith(2, '🚀 Generating badges ...');
    expect(infoMock).toHaveBeenNthCalledWith(
      3,
      '🚀 Pushing badges to the repo',
    );

    expect(generateBadgesEffect).toHaveBeenCalledTimes(1);
    expect(generateBadgesEffect).toHaveBeenNthCalledWith(
      1,
      './coverage/coverage-summary.json',
      './badges',
      undefined,
      undefined,
      true,
    );

    expect(execMock).toHaveBeenCalledTimes(8);
    expect(execMock).toHaveBeenNthCalledWith(
      1,
      'git diff',
      ['--quiet', `${outputPath}/*`],
      { ignoreReturnCode: true },
    );
    expect(execMock).toHaveBeenNthCalledWith(2, 'git config', [
      '--global',
      'user.name',
      actor,
    ]);
    expect(execMock).toHaveBeenNthCalledWith(3, 'git config', [
      '--global',
      'user.email',
      `${actor}@users.noreply.github.com`,
    ]);
    expect(execMock).toHaveBeenNthCalledWith(4, 'git checkout', [targetBranch]);
    expect(execMock).toHaveBeenNthCalledWith(5, 'git status');
    expect(execMock).toHaveBeenNthCalledWith(6, 'git add', [outputPath]);
    expect(execMock).toHaveBeenNthCalledWith(7, 'git commit', [
      '-m',
      commitMessage,
    ]);
    expect(execMock).toHaveBeenNthCalledWith(8, 'git push origin targetBranch');
  });

  it('should generate badges from several wildcard paths', async () => {
    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    const getInputMock = mockFn();
    getInputMock
      .calledWith('badges-icon')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('badges-labels-prefix')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('no-commit')
      .mockReturnValueOnce(Effect.succeed('false'));
    getInputMock
      .calledWith('branches')
      .mockReturnValueOnce(Effect.succeed('main,master'));
    getInputMock
      .calledWith('commit-user-email')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('commit-user')
      .mockReturnValueOnce(Effect.succeed(''));
    getInputMock
      .calledWith('target-branch')
      .mockReturnValueOnce(Effect.succeed(targetBranch));
    getInputMock
      .calledWith('output-folder')
      .mockReturnValueOnce(Effect.succeed(outputPath));
    getInputMock
      .calledWith('commit-message')
      .mockReturnValueOnce(Effect.succeed(commitMessage));

    const { GithubActionsTestLayer, infoMock, execMock } =
      makeGithubActionsTestLayer({
        info: Effect.void,
        getInput: getInputMock,
        getMultilineInput: mockFn()
          .calledWith('coverage-summary-path')
          .mockReturnValueOnce(
            Effect.succeed(['./apps/**/coverage/coverage-summary.json']),
          ),
        exec: mockFn()
          .calledWith('git diff', arrayIncludes(`${outputPath}/*`), anyObject())
          .mockReturnValue(Effect.succeed(1)),
        getActor: Effect.succeed(actor),
      });

    const { FsTestLayer } = makeFsTestLayer({
      exists: Effect.succeed(true),
      readFileString: vi
        .fn()
        .mockReturnValueOnce(
          Effect.succeed(
            summaryFileMockData({
              branches: 10,
              functions: 20,
              lines: 30,
              statements: 40,
            }),
          ),
        )
        .mockReturnValueOnce(
          Effect.succeed(
            summaryFileMockData({
              branches: 50,
              functions: 60,
              lines: 70,
              statements: 80,
            }),
          ),
        )
        .mockReturnValueOnce(
          Effect.succeed(
            summaryFileMockData({
              branches: 10,
              functions: 20,
              lines: 30,
              statements: 40,
            }),
          ),
        )
        .mockReturnValueOnce(
          Effect.succeed(
            summaryFileMockData({
              branches: 50,
              functions: 60,
              lines: 70,
              statements: 80,
            }),
          ),
        ),
    });

    vi.mocked(globEffect).mockReturnValueOnce(
      Effect.succeed([
        'apps/one/coverage/coverage-summary.json',
        'apps/two/coverage/coverage-summary.json',
      ]),
    );
    vi.mocked(generateBadgesEffect).mockImplementation(() =>
      Effect.succeed({
        total: {
          branches: {
            pct: 50,
          },
          functions: {
            pct: 60,
          },
          lines: {
            pct: 70,
          },
          statements: {
            pct: 80,
          },
        },
      }),
    );
    vi.mocked(generateBadgesFromValuesEffect).mockImplementation(() =>
      Effect.succeed(true),
    );

    const program = pipe(
      mainTask(),
      Effect.provide(Layer.mergeAll(GithubActionsTestLayer, FsTestLayer)),
    );
    await runPromise(program, { stripCwd: true, hideStackTrace: true });

    expect(infoMock).toHaveBeenCalledTimes(6);
    expect(infoMock).toHaveBeenNthCalledWith(1, 'ℹ️ Current branch is main');
    expect(infoMock).toHaveBeenNthCalledWith(2, '✅ Found 2 summary files');
    expect(infoMock).toHaveBeenNthCalledWith(
      3,
      '📁 apps/one/coverage/coverage-summary.json (subPath = one)',
    );
    expect(infoMock).toHaveBeenNthCalledWith(
      4,
      '📁 apps/two/coverage/coverage-summary.json (subPath = two)',
    );
    expect(infoMock).toHaveBeenNthCalledWith(5, '🚀 Generating badges ...');
    expect(infoMock).toHaveBeenNthCalledWith(
      6,
      '🚀 Pushing badges to the repo',
    );

    expect(generateBadgesEffect).toHaveBeenCalledTimes(2);
    expect(generateBadgesEffect).toHaveBeenNthCalledWith(
      1,
      'apps/one/coverage/coverage-summary.json',
      './badges/one',
      undefined,
      undefined,
      true,
    );
    expect(generateBadgesEffect).toHaveBeenNthCalledWith(
      2,
      'apps/two/coverage/coverage-summary.json',
      './badges/two',
      undefined,
      undefined,
      true,
    );

    expect(generateBadgesFromValuesEffect).toHaveBeenCalledTimes(1);
    expect(generateBadgesFromValuesEffect).toHaveBeenCalledWith(
      {
        total: {
          branches: {
            pct: 30,
          },
          functions: {
            pct: 40,
          },
          lines: {
            pct: 50,
          },
          statements: {
            pct: 60,
          },
        },
      },
      './badges/coverage-average',
      undefined,
    );

    expect(execMock).toHaveBeenCalledTimes(8);
    expect(execMock).toHaveBeenNthCalledWith(
      1,
      'git diff',
      ['--quiet', `${outputPath}/*`],
      { ignoreReturnCode: true },
    );
    expect(execMock).toHaveBeenNthCalledWith(2, 'git config', [
      '--global',
      'user.name',
      actor,
    ]);
    expect(execMock).toHaveBeenNthCalledWith(3, 'git config', [
      '--global',
      'user.email',
      `${actor}@users.noreply.github.com`,
    ]);
    expect(execMock).toHaveBeenNthCalledWith(4, 'git checkout', [targetBranch]);
    expect(execMock).toHaveBeenNthCalledWith(5, 'git status');
    expect(execMock).toHaveBeenNthCalledWith(6, 'git add', [outputPath]);
    expect(execMock).toHaveBeenNthCalledWith(7, 'git commit', [
      '-m',
      commitMessage,
    ]);
    expect(execMock).toHaveBeenNthCalledWith(8, 'git push origin targetBranch');
  });
});
