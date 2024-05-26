import { TaggedError } from 'effect/Data';

export class GithubActionError extends TaggedError('GithubActionError')<{
  cause?: unknown;
  message?: string;
}> {}
