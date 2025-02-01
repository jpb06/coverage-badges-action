import { TaggedError } from 'effect/Data';

export class GithubActionsLayerError extends TaggedError(
  'github-actions-layer-error',
)<{
  cause?: unknown;
  message?: string;
}> {}
