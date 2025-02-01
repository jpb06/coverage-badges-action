import { type Effect, Layer } from 'effect';

import { Logger, type LoggerLayer } from '@effects/deps/logger';

import type { Mock } from 'vitest';
import { initLayerFn } from './util/init-layer-fn.util.js';

type LoggerTestLayerInput = {
  info?: Effect.Effect<void> | Mock;
  error?: Effect.Effect<void> | Mock;
  warn?: Effect.Effect<void> | Mock;
};

export const makeLoggerTestLayer = ({
  error,
  info,
  warn,
}: LoggerTestLayerInput) => {
  const errorMock = initLayerFn({ error });
  const infoMock = initLayerFn({ info });
  const warnMock = initLayerFn({ warn });

  const make: Partial<LoggerLayer> = {
    error: errorMock,
    info: infoMock,
    warn: warnMock,
  };

  return {
    LoggerTestLayer: Layer.succeed(Logger, Logger.of(make as never)),
    errorMock,
    infoMock,
    warnMock,
  };
};
