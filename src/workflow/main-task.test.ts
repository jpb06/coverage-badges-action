import { Effect } from 'effect';
import { runPromise } from 'effect-errors';
import {
  generateBadgesEffect,
  generateBadgesFromValuesEffect,
} from 'node-coverage-badges';
import { describe, expect, vi, it, afterEach, beforeAll } from 'vitest';
import { anyObject, arrayIncludes } from 'vitest-mock-extended';

import { summaryFileMockData } from '../tests/mock-data/summary-file.mock';
import {
  mockActionsCore,
  mockGlob,
  mockFsExtra,
  mockActionsExec,
  mockActionsGithub,
} from '../tests/mocks';

vi.mock('node-coverage-badges');

describe('actionWorkflow effect function', () => {
  const { info, warning, getInput, getMultilineInput } = mockActionsCore();
  const { exec } = mockActionsExec();
  const { glob } = mockGlob();
  const { context } = mockActionsGithub();
  const { pathExists, readJson } = mockFsExtra();

  const branchName = 'main';
  const targetBranch = 'targetBranch';
  const outputPath = './badges';
  const commitMessage = 'chore: badges';

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    process.env.GITHUB_HEAD_REF = undefined;
    process.env.GITHUB_REF_NAME = undefined;

    context.actor = 'actor';
  });

  it('should fail if current branch could not be computed', async () => {
    process.env.GITHUB_HEAD_REF = undefined;
    process.env.GITHUB_REF_NAME = undefined;

    const { mainTask } = await import('./main-task');

    await expect(mainTask()).toFailWithTag({
      _tag: 'github-missing-current-branch',
      message: '🚨 Unable to get current branch from github event.',
    });

    expect(warning).toHaveBeenCalledTimes(2);
  });

  it('should fail if branch is not allowed, from allowed branches default value', async () => {
    const branchName = 'cool';
    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    getInput.calledWith('branches').mockReturnValueOnce('');

    const { mainTask } = await import('./main-task');

    await expect(mainTask()).toFailWithTag({
      _tag: 'branch-not-allowed-for-generation',
      message:
        '🛑 Current branch does not belong to the branches allowed for badges generation, task dropped.',
    });

    expect(info).toHaveBeenCalledTimes(2);
    expect(info).toHaveBeenNthCalledWith(
      1,
      `ℹ️ Current branch is ${branchName}`,
    );
    expect(info).toHaveBeenNthCalledWith(
      2,
      `ℹ️ No branches specified, defaulting to master and main`,
    );
  });

  it('should fail if branch is not allowed', async () => {
    const branchName = 'yolo';
    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    getInput.calledWith('branches').mockReturnValueOnce('bro,awoowoo');

    const { mainTask } = await import('./main-task');

    await expect(mainTask()).toFailWithTag({
      _tag: 'branch-not-allowed-for-generation',
      message:
        '🛑 Current branch does not belong to the branches allowed for badges generation, task dropped.',
    });

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(`ℹ️ Current branch is ${branchName}`);
  });

  it('should fail if there is no coverage report (single file)', async () => {
    const branchName = 'main';
    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    getInput.calledWith('branches').mockReturnValueOnce('main,master');
    getMultilineInput
      .calledWith('coverage-summary-path')
      .mockReturnValueOnce(['./coverage/coverage-summary.json']);
    glob.mockReturnValueOnce(
      Promise.resolve(['./coverage/coverage-summary.json']),
    );
    pathExists.mockResolvedValue(false as never);

    const { mainTask } = await import('./main-task');

    await expect(mainTask()).toFailWithTag({
      _tag: 'no-json-summaries-provided',
      message:
        '❌ No valid coverage reports provided. Perhaps you forgot to run tests or to add `json-summary` to coverageReporters in your test runner config?',
    });
  });

  it('should generate badges but not commit them', async () => {
    const reportPath = './coverage/coverage-summary.json';

    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    getInput.calledWith('no-commit').mockReturnValueOnce('true');
    getInput.calledWith('branches').mockReturnValueOnce('main,master');
    getInput.calledWith('commit-user-email').mockReturnValueOnce('');
    getInput.calledWith('commit-user').mockReturnValueOnce('');
    getInput.calledWith('target-branch').mockReturnValueOnce(targetBranch);
    getInput.calledWith('output-folder').mockReturnValueOnce(outputPath);
    getInput.calledWith('commit-message').mockReturnValueOnce(commitMessage);
    getMultilineInput
      .calledWith('coverage-summary-path')
      .mockReturnValueOnce([reportPath]);

    glob.mockResolvedValueOnce([reportPath]);
    pathExists.mockResolvedValue(true as never);
    readJson.mockResolvedValue(summaryFileMockData(10, 20, 30, 40));
    exec
      .calledWith(
        'git diff',
        arrayIncludes(`${outputPath}/*`) as never,
        anyObject() as never,
      )
      .mockResolvedValue(1 as never);

    vi.mocked(generateBadgesEffect).mockImplementation(() =>
      Effect.succeed(true),
    );

    const { mainTask } = await import('./main-task');

    await Effect.runPromise(mainTask());

    expect(info).toHaveBeenCalledTimes(3);
    expect(info).toHaveBeenNthCalledWith(1, 'ℹ️ Current branch is main');
    expect(info).toHaveBeenNthCalledWith(2, '🚀 Generating badges ...');
    expect(info).toHaveBeenNthCalledWith(
      3,
      "ℹ️ `no-commit` set to true: badges won't be committed",
    );

    expect(generateBadgesEffect).toHaveBeenCalledTimes(1);
    expect(generateBadgesEffect).toHaveBeenNthCalledWith(
      1,
      './coverage/coverage-summary.json',
      './badges',
      undefined,
    );

    expect(exec).toHaveBeenCalledTimes(0);
  });

  it('should not push badges if coverage has not evolved', async () => {
    const reportPath = './coverage/coverage-summary.json';

    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    getInput.calledWith('branches').mockReturnValueOnce('main,master');
    getInput.calledWith('commit-user-email').mockReturnValueOnce('');
    getInput.calledWith('commit-user').mockReturnValueOnce('');
    getInput.calledWith('target-branch').mockReturnValueOnce(targetBranch);
    getInput.calledWith('output-folder').mockReturnValueOnce(outputPath);
    getInput.calledWith('commit-message').mockReturnValueOnce(commitMessage);
    getMultilineInput
      .calledWith('coverage-summary-path')
      .mockReturnValueOnce([reportPath]);

    glob.mockResolvedValueOnce([reportPath]);
    pathExists.mockResolvedValue(true as never);
    readJson.mockResolvedValue(summaryFileMockData(10, 20, 30, 40));
    exec
      .calledWith(
        'git diff',
        arrayIncludes(`${outputPath}/*`) as never,
        anyObject() as never,
      )
      .mockResolvedValue(0 as never);

    vi.mocked(generateBadgesEffect).mockImplementation(() =>
      Effect.succeed(true),
    );

    const { mainTask } = await import('./main-task');

    await Effect.runPromise(mainTask());

    expect(info).toHaveBeenCalledTimes(3);
    expect(info).toHaveBeenNthCalledWith(1, 'ℹ️ Current branch is main');
    expect(info).toHaveBeenNthCalledWith(2, '🚀 Generating badges ...');
    expect(info).toHaveBeenNthCalledWith(
      3,
      '✅ Coverage has not evolved, no action required.',
    );

    expect(generateBadgesEffect).toHaveBeenCalledTimes(1);
    expect(generateBadgesEffect).toHaveBeenNthCalledWith(
      1,
      './coverage/coverage-summary.json',
      './badges',
      undefined,
    );

    expect(exec).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenNthCalledWith(
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

    getInput.calledWith('branches').mockReturnValueOnce('main,master');
    getInput.calledWith('commit-user-email').mockReturnValueOnce('');
    getInput.calledWith('commit-user').mockReturnValueOnce('');
    getInput.calledWith('target-branch').mockReturnValueOnce(targetBranch);
    getInput.calledWith('output-folder').mockReturnValueOnce(outputPath);
    getInput.calledWith('commit-message').mockReturnValueOnce(commitMessage);
    getMultilineInput
      .calledWith('coverage-summary-path')
      .mockReturnValueOnce([reportPath]);

    glob.mockResolvedValueOnce([reportPath]);
    pathExists.mockResolvedValue(true as never);
    readJson.mockResolvedValue(summaryFileMockData(10, 20, 30, 40));
    exec
      .calledWith(
        'git diff',
        arrayIncludes(`${outputPath}/*`) as never,
        anyObject() as never,
      )
      .mockResolvedValue(1 as never);

    vi.mocked(generateBadgesEffect).mockImplementation(() =>
      Effect.succeed(true),
    );

    const { mainTask } = await import('./main-task');

    await Effect.runPromise(mainTask());

    expect(info).toHaveBeenCalledTimes(3);
    expect(info).toHaveBeenNthCalledWith(1, 'ℹ️ Current branch is main');
    expect(info).toHaveBeenNthCalledWith(2, '🚀 Generating badges ...');
    expect(info).toHaveBeenNthCalledWith(3, '🚀 Pushing badges to the repo');

    expect(generateBadgesEffect).toHaveBeenCalledTimes(1);
    expect(generateBadgesEffect).toHaveBeenNthCalledWith(
      1,
      './coverage/coverage-summary.json',
      './badges',
      undefined,
    );

    expect(exec).toHaveBeenCalledTimes(8);
    expect(exec).toHaveBeenNthCalledWith(
      1,
      'git diff',
      ['--quiet', `${outputPath}/*`],
      { ignoreReturnCode: true },
    );
    expect(exec).toHaveBeenNthCalledWith(
      2,
      'git config',
      ['--global', 'user.name', context.actor],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(
      3,
      'git config',
      ['--global', 'user.email', `${context.actor}@users.noreply.github.com`],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(
      4,
      'git checkout',
      [targetBranch],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(5, 'git status', undefined, undefined);
    expect(exec).toHaveBeenNthCalledWith(6, 'git add', [outputPath], undefined);
    expect(exec).toHaveBeenNthCalledWith(
      7,
      'git commit',
      ['-m', commitMessage],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(
      8,
      'git push origin targetBranch',
      undefined,
      undefined,
    );
  });

  it('should generate badges from several wildcard paths', async () => {
    process.env.GITHUB_HEAD_REF = branchName;
    process.env.GITHUB_REF_NAME = undefined;

    getInput.calledWith('branches').mockReturnValueOnce('main,master');
    getInput.calledWith('commit-user-email').mockReturnValueOnce('');
    getInput.calledWith('commit-user').mockReturnValueOnce('');
    getInput.calledWith('target-branch').mockReturnValueOnce(targetBranch);
    getInput.calledWith('output-folder').mockReturnValueOnce(outputPath);
    getInput.calledWith('commit-message').mockReturnValueOnce(commitMessage);
    getMultilineInput
      .calledWith('coverage-summary-path')
      .mockReturnValueOnce(['./apps/**/coverage/coverage-summary.json']);

    glob.mockResolvedValueOnce([
      'apps/one/coverage/coverage-summary.json',
      'apps/two/coverage/coverage-summary.json',
    ]);
    pathExists.mockResolvedValue(true as never);
    readJson
      .mockResolvedValueOnce(summaryFileMockData(10, 20, 30, 40))
      .mockResolvedValueOnce(summaryFileMockData(50, 60, 70, 80))
      .mockResolvedValueOnce(summaryFileMockData(10, 20, 30, 40))
      .mockResolvedValueOnce(summaryFileMockData(50, 60, 70, 80));

    exec
      .calledWith(
        'git diff',
        arrayIncludes(`${outputPath}/*`) as never,
        anyObject() as never,
      )
      .mockResolvedValue(1 as never);

    vi.mocked(generateBadgesEffect).mockImplementation(() =>
      Effect.succeed(true),
    );
    vi.mocked(generateBadgesFromValuesEffect).mockImplementation(() =>
      Effect.succeed(true),
    );

    const { mainTask } = await import('./main-task');

    await runPromise(mainTask());

    expect(info).toHaveBeenCalledTimes(6);
    expect(info).toHaveBeenNthCalledWith(1, 'ℹ️ Current branch is main');
    expect(info).toHaveBeenNthCalledWith(2, `✅ Found 2 summary files`);
    expect(info).toHaveBeenNthCalledWith(
      3,
      '📁 apps/one/coverage/coverage-summary.json (subPath = one)',
    );
    expect(info).toHaveBeenNthCalledWith(
      4,
      '📁 apps/two/coverage/coverage-summary.json (subPath = two)',
    );
    expect(info).toHaveBeenNthCalledWith(5, '🚀 Generating badges ...');
    expect(info).toHaveBeenNthCalledWith(6, '🚀 Pushing badges to the repo');

    expect(generateBadgesEffect).toHaveBeenCalledTimes(2);
    expect(generateBadgesEffect).toHaveBeenNthCalledWith(
      1,
      'apps/one/coverage/coverage-summary.json',
      './badges/one',
      undefined,
    );
    expect(generateBadgesEffect).toHaveBeenNthCalledWith(
      2,
      'apps/two/coverage/coverage-summary.json',
      './badges/two',
      undefined,
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

    expect(exec).toHaveBeenCalledTimes(8);
    expect(exec).toHaveBeenNthCalledWith(
      1,
      'git diff',
      ['--quiet', `${outputPath}/*`],
      { ignoreReturnCode: true },
    );
    expect(exec).toHaveBeenNthCalledWith(
      2,
      'git config',
      ['--global', 'user.name', context.actor],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(
      3,
      'git config',
      ['--global', 'user.email', `${context.actor}@users.noreply.github.com`],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(
      4,
      'git checkout',
      [targetBranch],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(5, 'git status', undefined, undefined);
    expect(exec).toHaveBeenNthCalledWith(6, 'git add', [outputPath], undefined);
    expect(exec).toHaveBeenNthCalledWith(
      7,
      'git commit',
      ['-m', commitMessage],
      undefined,
    );
    expect(exec).toHaveBeenNthCalledWith(
      8,
      'git push origin targetBranch',
      undefined,
      undefined,
    );
  });
});
