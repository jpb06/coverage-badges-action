import { Effect } from 'effect';
import { TaggedError } from 'effect/Data';
import { type Mock, vi } from 'vitest';

export class TestLayerError extends TaggedError('test-layer-error')<{
  cause?: unknown;
  message?: string;
}> {}

export const initLayerFn = <TSuccess, TError>(
  input: Record<
    string,
    Effect.Effect<TSuccess> | Effect.Effect<never, TError> | Mock | undefined
  >,
) => {
  const entries = Object.entries(input);
  if (entries.length !== 1) {
    throw new TestLayerError({
      message: `initLayerFn: expecting one entry as input, got ${entries.length} instead`,
    });
  }

  const [name, value] = entries[0];
  if (value === undefined) {
    return vi.fn().mockReturnValue(
      Effect.fail(
        new TestLayerError({
          message: `No implementation provided for ${name}`,
        }),
      ),
    );
  }

  if (Effect.isEffect(value)) {
    return vi.fn().mockReturnValue(value);
  }

  return value;
};
