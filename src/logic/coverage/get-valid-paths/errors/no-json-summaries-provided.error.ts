import { TaggedError } from 'effect/Data';

export class NoJsonSummariesProvidedError extends TaggedError(
  'NoJsonSummariesProvided',
)<{
  cause?: unknown;
  message?: string;
}> {}
