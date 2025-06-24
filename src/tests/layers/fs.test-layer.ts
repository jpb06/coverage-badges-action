import { FileSystem } from '@effect/platform/FileSystem';
import { type Effect, Layer } from 'effect';
import type { Mock } from 'vitest';

import { initLayerFn, type TestLayerError } from './util/init-layer-fn.util.js';

type FsTestLayerInput = {
  exists?: Effect.Effect<boolean> | Effect.Effect<never, TestLayerError> | Mock;
  readDirectory?: Effect.Effect<string[]> | Mock;
  readFileString?: Effect.Effect<string> | Mock;
  remove?: Effect.Effect<void> | Mock;
  makeDirectory?: Effect.Effect<void> | Mock;
  writeFileString?: Effect.Effect<void> | Mock;
};

export const makeFsTestLayer = ({
  exists,
  makeDirectory,
  readDirectory,
  readFileString,
  remove,
  writeFileString,
}: FsTestLayerInput) => {
  const existsMock = initLayerFn({ exists });
  const readDirectoryMock = initLayerFn({ readDirectory });
  const readFileStringMock = initLayerFn({ readFileString });
  const removeMock = initLayerFn({ remove });
  const makeDirectoryMock = initLayerFn({ makeDirectory });
  const writeFileStringMock = initLayerFn({ writeFileString });

  const make: Partial<FileSystem> = {
    exists: existsMock,
    readDirectory: readDirectoryMock,
    readFileString: readFileStringMock,
    remove: removeMock,
    makeDirectory: makeDirectoryMock,
    writeFileString: writeFileStringMock,
  };

  return {
    FsTestLayer: Layer.succeed(FileSystem, FileSystem.of(make as never)),
    existsMock,
    readDirectoryMock,
    readFileStringMock,
    removeMock,
    makeDirectoryMock,
    writeFileStringMock,
  };
};
