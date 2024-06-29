import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';

import { summaryFileMockData } from '../../../tests/mock-data/summary-file.mock';
import { mockFsExtra } from '../../../tests/mocks';

describe('validatePath effect', () => {
  const { pathExists, readJson } = mockFsExtra();

  it('should return undefined if report file does not exist', async () => {
    pathExists.mockReturnValueOnce(false as never);

    const { validatePath } = await import('./validate-path');

    const result = await Effect.runPromise(
      validatePath('./cool/story/bro/coverage/coverage-summary.json')(
        './cool/story/bro/coverage/coverage-summary.json',
      ),
    );

    expect(result).toBeUndefined();
  });

  it('should handle glob paths', async () => {
    const globPath = './apps/**/coverage/coverage-summary.json';
    const resolvedPath = 'apps/front/coverage/coverage-summary.json';

    pathExists.mockReturnValueOnce(true as never);
    readJson.mockResolvedValue(summaryFileMockData);

    const { validatePath } = await import('./validate-path');

    const result = await Effect.runPromise(
      validatePath(globPath)(resolvedPath),
    );

    expect(result).toStrictEqual({
      path: 'apps/front/coverage/coverage-summary.json',
      subPath: 'front',
    });
  });

  it.only('should handle glob paths not starting with ./', async () => {
    const globPath = 'apps/**/coverage/coverage-summary.json';
    const resolvedPath = 'apps/front/coverage/coverage-summary.json';

    pathExists.mockReturnValueOnce(true as never);
    readJson.mockResolvedValue(summaryFileMockData);

    const { validatePath } = await import('./validate-path');

    const result = await Effect.runPromise(
      validatePath(globPath)(resolvedPath),
    );

    expect(result).toStrictEqual({
      path: 'apps/front/coverage/coverage-summary.json',
      subPath: 'front',
    });
  });

  it('should handle basic subPaths paths', async () => {
    const globPath = './apps/front/coverage/coverage-summary.json';
    const resolvedPath = 'apps/front/coverage/coverage-summary.json';

    pathExists.mockReturnValueOnce(true as never);
    readJson.mockResolvedValue(summaryFileMockData);

    const { validatePath } = await import('./validate-path');

    const result = await Effect.runPromise(
      validatePath(globPath)(resolvedPath),
    );

    expect(result).toStrictEqual({
      path: 'apps/front/coverage/coverage-summary.json',
      subPath: 'apps/front',
    });
  });
});
