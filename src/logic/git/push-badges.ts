import { getInput } from '@actions/core';
import { Effect } from 'effect';

import { execEffect } from '../../effects/github';

export const pushBadges = (branchName: string, source = './badges') =>
  Effect.all([
    execEffect('git checkout', [branchName]),
    execEffect('git status'),
    execEffect('git add', [source]),
    execEffect('git commit', ['-m', getInput('commit-message')]),
    execEffect(`git push origin ${branchName}`),
  ]);
