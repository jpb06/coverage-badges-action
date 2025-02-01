import 'vitest';

interface CustomMatchers<Return = unknown> {
  toFailWithTag: (input: { _tag: string; message?: string }) => Promise<Return>;
}

declare module 'vitest' {
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
