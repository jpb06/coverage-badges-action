import type * as ActionsGithub from '@actions/github';
import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

export const mockActionsGithub = () => {
  const actionsGithubMock = mockDeep<typeof ActionsGithub>();
  vi.doMock('@actions/github', () => actionsGithubMock);

  return actionsGithubMock;
};
