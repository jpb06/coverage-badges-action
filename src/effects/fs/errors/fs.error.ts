import { TaggedError } from 'effect/Data';

export class FsError extends TaggedError('FsError')<{
  cause?: unknown;
  message?: string;
}> {}
