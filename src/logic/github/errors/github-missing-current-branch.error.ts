import { TaggedError } from 'effect/Data';

export class GithubMissingCurrentBranchError extends TaggedError(
  'github-missing-current-branch',
)<{
  cause?: unknown;
  message?: string;
}> {}
