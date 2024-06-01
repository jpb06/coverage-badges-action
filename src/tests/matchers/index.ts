import { effectFailureTagMatcher } from './effect-to-fail-with-tag.js';

const matchers = () => {
  void Promise.all([effectFailureTagMatcher()]);
};

(() => {
  matchers();
})();
