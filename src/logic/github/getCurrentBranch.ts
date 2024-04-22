import { info } from '@actions/core';

export const getCurrentBranch = (): string => {
  let currentBranch = process.env.GITHUB_HEAD_REF;

  if (currentBranch === undefined || currentBranch === 'undefined') {
    currentBranch = process.env.GITHUB_REF_NAME;
  }

  if (currentBranch === undefined || currentBranch === 'undefined') {
    throw new Error('Unable to get current branch from github event.');
  }

  info(`ℹ️ Current branch is ${currentBranch}`);
  return currentBranch;
};
