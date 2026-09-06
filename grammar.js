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
		source_file: ($) => repeat(choice($._statement)),

		_statement: ($) =>
			choice(
				$._statement_path,
				$.statement_label,
				$.statement_print,
				$.statement_return,
			),

		_statement_path: ($) => choice($.identifier),

		statement_label: ($) => seq($._keyword_label, $.identifier),

		statement_print: ($) => seq($._keyword_print, $.expression),

		statement_return: ($) =>
			prec.left(2, seq($._keyword_return, optional($.expression))),

		expression: ($) => choice($.number, $.identifier),

		_keyword: ($) =>
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
					$._keyword_label,
					"let",
					"match",
					"menu",
					"new",
					"object",
					"pass",
					$._keyword_print,
					$._keyword_return,
					"suspend",
					"var",
				),
			),

		_keyword_label: ($) => alias("label", $.keyword),
		_keyword_print: ($) => alias("print", $.keyword),
		_keyword_return: ($) => alias("return", $.keyword),

		identifier: ($) => /[a-z_][a-z_0-9]*/i,

		number: ($) => choice(/\d+/, /\d+\.\d+/, /\.\d+/),

		comment: ($) => seq("#", /.*/),
	},
});
