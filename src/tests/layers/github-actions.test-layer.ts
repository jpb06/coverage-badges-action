import { type Effect, Layer } from 'effect';
import type { Mock } from 'vitest';

import {
  GithubActions,
  type GithubActionsLayer,
} from '@effects/deps/github-actions';

import { initLayerFn } from './util/init-layer-fn.util.js';

type GithubActionsTestLayerInput = {
  exec?: Effect.Effect<number> | Mock;
  getActor?: Effect.Effect<string> | Mock;
  getInput?: Effect.Effect<string> | Mock;
  getMultilineInput?: Effect.Effect<string[]> | Mock;
  info?: Effect.Effect<void> | Mock;
  warning?: Effect.Effect<void> | Mock;
};

export const makeGithubActionsTestLayer = ({
  exec,
  getActor,
  getInput,
  getMultilineInput,
  info,
  warning,
}: GithubActionsTestLayerInput) => {
  const execMock = initLayerFn({ exec });
  const getActorMock = initLayerFn({ getActor });
  const getInputMock = initLayerFn({ getInput });
  const getMultilineInputMock = initLayerFn({ getMultilineInput });
  const infoMock = initLayerFn({ info });
  const warningMock = initLayerFn({ warning });

  const make: Partial<GithubActionsLayer> = {
    exec: execMock,
    getActor: getActorMock,
    getInput: getInputMock,
    getMultilineInput: getMultilineInputMock,
    info: infoMock,
    warning: warningMock,
  };

  return {
    GithubActionsTestLayer: Layer.succeed(
      GithubActions,
      GithubActions.of(make as never),
    ),
    execMock,
    getActorMock,
    getInputMock,
    getMultilineInputMock,
    infoMock,
    warningMock,
  };
};
