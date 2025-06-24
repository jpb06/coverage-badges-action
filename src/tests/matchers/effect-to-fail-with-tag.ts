import { Cause, Chunk, Effect, pipe } from 'effect';
import { expect } from 'vitest';

type FailEffectDetails = {
  result: boolean;
  resultTag?: string;
  resultMessage?: string;
  message?: string;
};

export const effectFailureTagMatcher = () => {
  expect.extend({
    toFailWithTag: async (received, expected) => {
      if (!Effect.isEffect(received)) {
        return {
          pass: false,
          message: () => 'Expecting an effect as input',
        };
      }

      if (expected?._tag === undefined) {
        return {
          pass: false,
          message: () => `Expected should be an object with a '_tag' property`,
        };
      }

      const { result, resultTag, resultMessage, message } =
        await Effect.runPromise<FailEffectDetails, unknown>(
          pipe(
            // biome-ignore lint/suspicious/noExplicitAny: /
            received as Effect.Effect<any, any>,
            Effect.flatMap(() =>
              Effect.succeed({
                result: false,
                message: 'Expected effect to fail but it succeeded',
              }),
            ),
            Effect.catchAllCause((cause) => {
              const failures = Cause.failures(cause);
              if (Chunk.isNonEmpty(failures)) {
                const head = Chunk.headNonEmpty(failures);

                const tagMatches = head._tag === expected._tag;
                const messageMatches =
                  expected?.message === undefined
                    ? true
                    : head.message === expected.message;

                return Effect.succeed({
                  result: tagMatches && messageMatches,
                  resultTag: head._tag,
                  resultMessage: head.message,
                  message: head._tag ? undefined : head,
                });
              }

              return Effect.succeed({
                result: false,
              });
            }),
          ),
        );

      return {
        pass: result,
        message: () =>
          message ??
          `Expected effect to fail with the following data (expected -> received):
- tag: '${expected._tag}' -> '${resultTag}'
- message: '${expected.message}' -> '${resultMessage}'\n`,
      };
    },
  });
};
