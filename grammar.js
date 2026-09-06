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
    source_file: ($) => repeat($._statement),

    _statement: ($) =>
      choice(
        $._statement_path,
        $.statement_label,
        $.statement_print,
        $.statement_return,
      ),

    _statement_path: ($) => choice($.identifier),

    statement_label: ($) => seq("label", $.identifier),

    statement_print: ($) => seq("print", $.expression),

    statement_return: ($) =>
      prec.left(2, seq("return", optional($.expression))),

    expression: ($) => choice($.number, $.identifier),

    keyword: ($) =>
      prec(
        100,
        choice(
          "await",
          "call",
          "elif",
          "else",
          "exit",
          "if",
          "init",
          "jump",
          "label",
          "let",
          "match",
          "menu",
          "new",
          "object",
          "pass",
          "print",
          "return",
          "suspend",
          "var",
        ),
      ),

    identifier: ($) => /[a-z_][a-z_0-9]*/i,

    number: ($) => choice(/\d+/, /\d+\.\d+/, /\.\d+/),

    comment: ($) => seq("#", /.*/),
  },
});
