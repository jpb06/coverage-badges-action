import { TaggedError } from 'effect/Data';

export class NoJsonSummariesProvidedError extends TaggedError(
  'no-json-summaries-provided',
)<{
  cause?: unknown;
  message?: string;
}> {}
