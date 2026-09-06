/**
 * @file Penny grammar for tree-sitter
 * @author Sebastian Weaver <snotbane@pm.me>
 * @license Unlicense
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "penny",

  // word: ($) => $.identifier,

  rules: {
    // identifier: ($) => /[a-z_][a-z_0-9]*/i,

    number: ($) => /\d+/,
  },
});
