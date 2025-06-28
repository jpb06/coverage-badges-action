import type { InputOptions } from '@actions/core';
import type { ExecOptions } from '@actions/exec';
import { Context, type Effect } from 'effect';

import type { GithubActionsLayerError } from './errors/github-actions-layer.error.js';

export interface GithubActionsOps {
  readonly exec: (
    commandLine: string,
    args?: string[],
    options?: ExecOptions,
  ) => Effect.Effect<number, GithubActionsLayerError, never>;
  readonly getActor: () => Effect.Effect<string, GithubActionsLayerError>;
  readonly getInput: (
    name: string,
    options?: InputOptions,
  ) => Effect.Effect<string, GithubActionsLayerError>;
  readonly getMultilineInput: (
    name: string,
    options?: InputOptions,
  ) => Effect.Effect<string[], GithubActionsLayerError>;
  readonly info: (
    message: string,
  ) => Effect.Effect<void, GithubActionsLayerError>;
  readonly warning: (
    message: string,
  ) => Effect.Effect<void, GithubActionsLayerError>;
  readonly setFailed: (
    message: string,
  ) => Effect.Effect<void, GithubActionsLayerError>;
}

export class GithubActions extends Context.Tag('GithubActions')<
  GithubActions,
  GithubActionsOps
>() {}
export type GithubActionsLayer = (typeof GithubActions)['Service'];
