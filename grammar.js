/**
 * @file Penny grammar for tree-sitter
 * @author Sebastian Weaver <snotbane@pm.me>
 * @license Unlicense
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "penny",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  rules: {
    keyword: ($) => choice("await", "pass", "return"),

    identifier: ($) => /[a-z_][a-z_0-9]*/i,

    number: ($) => token(choice(/\d+/, /\d+\.\d+/, /\.\d+/)),

    comment: ($) => token(seq("#", /.*/)),
  },
});
