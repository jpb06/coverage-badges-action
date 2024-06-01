import { vi } from 'vitest';

interface ProcessEnv extends Record<string, string | undefined> {
  TZ?: string;
}

interface ProcessMockingArgs {
  env?: ProcessEnv;
}

export const mockProcess = async (args: ProcessMockingArgs) => {
  global.process = {
    ...(await vi.importActual('node:process')),
    ...args,
  };
};
