import { info } from '@actions/core';

const isEmpty = (value: string | undefined) =>
  value === undefined || value === 'undefined' || value === '';

export const getCurrentBranch = (): string => {
  let currentBranch = process.env.GITHUB_HEAD_REF;

  if (isEmpty(currentBranch)) {
    currentBranch = process.env.GITHUB_REF_NAME;
  }

  if (isEmpty(currentBranch)) {
    console.warn('🗯️ GITHUB_HEAD_REF', process.env.GITHUB_HEAD_REF);
    console.warn('🗯️ GITHUB_REF_NAME', process.env.GITHUB_REF_NAME);

    throw new Error('🚨 Unable to get current branch from github event.');
  }

  info(`ℹ️ Current branch is ${currentBranch}`);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return currentBranch!;
};
