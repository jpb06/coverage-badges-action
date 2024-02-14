import { getInput, info, setFailed } from '@actions/core';
import { generateBadges } from 'node-coverage-badges';
import { describe, afterEach, expect, vi, it } from 'vitest';

import { doBadgesExist } from '../logic/coverage/doBadgesExist';
import { hasCoverageEvolved } from '../logic/coverage/hasCoverageEvolved';
import { isCoverageReportAvailable } from '../logic/coverage/isCoverageReportAvailable';
import { pushBadges } from '../logic/git/pushBadges';
import { setGitConfig } from '../logic/git/setGitConfig';
import { getCurrentBranch } from '../logic/github/getCurrentBranch';
import { isBranchValidForBadgesGeneration } from '../logic/inputs/isBranchValidForBadgesGeneration';

import { actionWorkflow } from './actionWorkflow';

vi.mock('@actions/core');
vi.mock('node-coverage-badges');
vi.mock('../logic/git/pushBadges');
vi.mock('../logic/git/setGitConfig');
vi.mock('../logic/coverage/isCoverageReportAvailable');
vi.mock('../logic/coverage/doBadgesExist');
vi.mock('../logic/coverage/hasCoverageEvolved');
vi.mock('../logic/inputs/isBranchValidForBadgesGeneration');
vi.mock('../logic/github/getCurrentBranch');

describe('actionWorkflow function', () => {
  const performCommit = 'false';
  const summaryPath = './coverage/coverage-summary.json';
  const icon = 'vitest';
  const outputPath = './out-path';

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should end the task if branch is not allowed', async () => {
    vi.mocked(getCurrentBranch).mockReturnValueOnce('cool');
    vi.mocked(isBranchValidForBadgesGeneration).mockReturnValueOnce(false);
    vi.mocked(getInput).mockReturnValueOnce('false');

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(0);
    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(pushBadges).toHaveBeenCalledTimes(0);

    expect(setFailed).toHaveBeenCalledTimes(0);

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      '🛑 Current branch does not belong to the branches allowed for badges generation, task dropped.',
    );
  });

  it('should fail the task if there is no coverage report', async () => {
    vi.mocked(isBranchValidForBadgesGeneration).mockReturnValueOnce(true);
    vi.mocked(isCoverageReportAvailable).mockResolvedValueOnce(false);
    vi.mocked(getInput)
      .mockReturnValueOnce(performCommit)
      .mockReturnValueOnce(summaryPath)
      .mockReturnValueOnce(icon);

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(0);
    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(pushBadges).toHaveBeenCalledTimes(0);

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(
      '❌ Coverage report is missing. Did you forget to run tests or to add `json-summary` to coverageReporters in your test runner config?',
    );
  });

  it('should do nothing if coverage has not evolved', async () => {
    vi.mocked(isBranchValidForBadgesGeneration).mockReturnValueOnce(true);
    vi.mocked(isCoverageReportAvailable).mockResolvedValueOnce(true);
    vi.mocked(doBadgesExist).mockResolvedValueOnce(true);
    vi.mocked(hasCoverageEvolved).mockResolvedValueOnce(false);

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(1);
    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(pushBadges).toHaveBeenCalledTimes(0);

    expect(info).toHaveBeenCalledTimes(2);
    expect(setFailed).toHaveBeenCalledTimes(0);
  });

  it('should check if coverage has not evolved in a custom output folder', async () => {
    vi.mocked(isBranchValidForBadgesGeneration).mockReturnValueOnce(true);
    vi.mocked(isCoverageReportAvailable).mockResolvedValueOnce(true);
    vi.mocked(doBadgesExist).mockResolvedValueOnce(true);
    vi.mocked(hasCoverageEvolved).mockResolvedValueOnce(false);
    vi.mocked(getInput)
      .mockReturnValueOnce(performCommit)
      .mockReturnValueOnce(summaryPath)
      .mockReturnValueOnce(icon)
      .mockReturnValueOnce(outputPath);

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(1);
    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(pushBadges).toHaveBeenCalledTimes(0);

    expect(doBadgesExist).toHaveBeenCalledWith(outputPath);

    expect(info).toHaveBeenCalledTimes(2);
    expect(setFailed).toHaveBeenCalledTimes(0);
  });

  it('should generate badges and not push them if no-commit is set to true', async () => {
    vi.mocked(isCoverageReportAvailable).mockResolvedValueOnce(true);
    vi.mocked(doBadgesExist).mockResolvedValueOnce(true);
    vi.mocked(hasCoverageEvolved).mockResolvedValueOnce(true);
    vi.mocked(getInput)
      .mockReturnValueOnce('true')
      .mockReturnValueOnce(summaryPath)
      .mockReturnValueOnce(icon)
      .mockReturnValueOnce(outputPath);

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(1);
    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(pushBadges).toHaveBeenCalledTimes(0);

    expect(info).toHaveBeenCalledTimes(2);
    expect(setFailed).toHaveBeenCalledTimes(0);
  });

  it('should generate badges and push them', async () => {
    vi.mocked(isBranchValidForBadgesGeneration).mockReturnValueOnce(true);
    vi.mocked(isCoverageReportAvailable).mockResolvedValueOnce(true);
    vi.mocked(doBadgesExist).mockResolvedValueOnce(true);
    vi.mocked(hasCoverageEvolved).mockResolvedValueOnce(true);

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(1);
    expect(setGitConfig).toHaveBeenCalledTimes(1);
    expect(pushBadges).toHaveBeenCalledTimes(1);

    expect(info).toHaveBeenCalledTimes(2);
    expect(setFailed).toHaveBeenCalledTimes(0);
  });

  it('should generate badges from the default summary path', async () => {
    const outputPath = './badges';
    const icon = 'vitest';

    vi.mocked(isBranchValidForBadgesGeneration).mockReturnValueOnce(true);
    vi.mocked(isCoverageReportAvailable).mockResolvedValueOnce(true);
    vi.mocked(doBadgesExist).mockResolvedValueOnce(true);
    vi.mocked(hasCoverageEvolved).mockResolvedValueOnce(true);
    vi.mocked(getInput)
      .mockReturnValueOnce(performCommit)
      .mockReturnValueOnce(summaryPath)
      .mockReturnValueOnce(icon)
      .mockReturnValueOnce(outputPath);

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(1);
    expect(generateBadges).toHaveBeenCalledWith(summaryPath, outputPath, icon);
    expect(setGitConfig).toHaveBeenCalledTimes(1);
    expect(pushBadges).toHaveBeenCalledTimes(1);

    expect(info).toHaveBeenCalledTimes(2);
    expect(setFailed).toHaveBeenCalledTimes(0);
  });

  it('should generate badges from a custom summary path', async () => {
    vi.mocked(isBranchValidForBadgesGeneration).mockReturnValueOnce(true);
    vi.mocked(isCoverageReportAvailable).mockResolvedValueOnce(true);
    vi.mocked(doBadgesExist).mockResolvedValueOnce(true);
    vi.mocked(hasCoverageEvolved).mockResolvedValueOnce(true);
    vi.mocked(getInput)
      .mockReturnValueOnce(performCommit)
      .mockReturnValueOnce(summaryPath)
      .mockReturnValueOnce(icon)
      .mockReturnValueOnce(outputPath);

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(1);
    expect(generateBadges).toHaveBeenCalledWith(summaryPath, outputPath, icon);
    expect(setGitConfig).toHaveBeenCalledTimes(1);
    expect(pushBadges).toHaveBeenCalledTimes(1);

    expect(info).toHaveBeenCalledTimes(2);
    expect(setFailed).toHaveBeenCalledTimes(0);
  });

  it('should generate badges to a custom output folder', async () => {
    const branchName = 'master';

    vi.mocked(getCurrentBranch).mockReturnValueOnce(branchName);
    vi.mocked(isBranchValidForBadgesGeneration).mockReturnValueOnce(true);
    vi.mocked(isCoverageReportAvailable).mockResolvedValueOnce(true);
    vi.mocked(doBadgesExist).mockResolvedValueOnce(true);
    vi.mocked(hasCoverageEvolved).mockResolvedValueOnce(true);
    vi.mocked(getInput)
      .mockReturnValueOnce(performCommit)
      .mockReturnValueOnce(summaryPath)
      .mockReturnValueOnce(icon)
      .mockReturnValueOnce(outputPath)
      .mockReturnValueOnce(branchName);

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(1);
    expect(generateBadges).toHaveBeenCalledWith(summaryPath, outputPath, icon);
    expect(setGitConfig).toHaveBeenCalledTimes(1);
    expect(pushBadges).toHaveBeenCalledTimes(1);
    expect(pushBadges).toHaveBeenCalledWith(branchName, outputPath);

    expect(info).toHaveBeenCalledTimes(2);
    expect(setFailed).toHaveBeenCalledTimes(0);
  });

  it('should fail the task if there is errors', async () => {
    vi.mocked(isBranchValidForBadgesGeneration).mockReturnValueOnce(true);
    vi.mocked(isCoverageReportAvailable).mockRejectedValueOnce(
      new Error('Big bad error'),
    );

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(0);
    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(pushBadges).toHaveBeenCalledTimes(0);

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(
      '❌ Oh no! An error occured: Big bad error',
    );
  });

  it('should display a generic error when no message is available', async () => {
    vi.mocked(isBranchValidForBadgesGeneration).mockReturnValueOnce(true);
    vi.mocked(isCoverageReportAvailable).mockRejectedValueOnce('Big bad error');

    await actionWorkflow();

    expect(generateBadges).toHaveBeenCalledTimes(0);
    expect(setGitConfig).toHaveBeenCalledTimes(0);
    expect(pushBadges).toHaveBeenCalledTimes(0);

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(
      `❌ Oh no! An unknown error occured`,
    );
  });
});
