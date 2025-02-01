import { effectFailureTagMatcher } from './effect-to-fail-with-tag.js';

const matchers = () => {
  Promise.all([effectFailureTagMatcher()]);
};

(() => {
  matchers();
})();
