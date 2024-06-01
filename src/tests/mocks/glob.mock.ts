import { type glob } from 'glob';
import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

export const mockGlob = () => {
  const globMock = mockDeep<typeof glob>();
  vi.doMock('glob', () => globMock);

  return globMock;
};
