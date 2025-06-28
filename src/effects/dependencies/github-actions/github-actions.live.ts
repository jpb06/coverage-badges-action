import { Layer } from 'effect';

import { execEffect } from './implementation/exec.effect.js';
import { getActorEffect } from './implementation/get-actor.effect.js';
import { getInputEffect } from './implementation/get-input.exec.js';
import { getMultilineInputEffect } from './implementation/get-multiline-input.exec.js';
import { infoEffect } from './implementation/info.effect.js';
import { setFailedEffect } from './implementation/set-failed.js';
import { warningEffect } from './implementation/warning.effect.js';
import { GithubActions } from './index.js';

export const GithubActionsLayerLive = Layer.succeed(GithubActions, {
  exec: execEffect,
  getActor: getActorEffect,
  getInput: getInputEffect,
  getMultilineInput: getMultilineInputEffect,
  info: infoEffect,
  warning: warningEffect,
  setFailed: setFailedEffect,
});
