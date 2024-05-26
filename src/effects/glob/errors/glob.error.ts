import { TaggedError } from 'effect/Data';

export class GlobError extends TaggedError('GlobError')<{
  cause?: unknown;
  message?: string;
}> {}
