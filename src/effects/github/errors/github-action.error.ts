import { TaggedError } from 'effect/Data';

export class GithubActionError extends TaggedError('github-action-error')<{
  cause?: unknown;
  message?: string;
}> {}
