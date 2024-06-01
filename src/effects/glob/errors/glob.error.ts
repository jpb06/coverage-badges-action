import { TaggedError } from 'effect/Data';

export class GlobError extends TaggedError('glob-error')<{
  cause?: unknown;
  message?: string;
}> {}
