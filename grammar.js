/**
 * @file Penny grammar for tree-sitter
 * @author Sebastian Weaver <snotbane@pm.me>
 * @license Unlicense
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
	name: "penny",

	externals: ($) => [$._string_rich_implicit, $._line_indent],

	extras: ($) => [/\s/, $._line_indent, $.comment],

	word: ($) => $.identifier,

	rules: {
		source_file: ($) => repeat($._statement),

		_statement: ($) =>
			choice(
				$.statement_assign,
				$._statement_path,
				$.statement_dialog,
				$.statement_dialog_close,
				$.statement_label,
				$.statement_print,
				$.statement_return,
			),

		statement_assign: ($) => seq($.path, $.assigner, $.expression),

		statement_dialog: ($) => $._string,

		statement_dialog_close: ($) => /-+/,

		statement_label: ($) => seq($._keyword_label, $.identifier),
		_statement_path: ($) => $.path,

		statement_print: ($) => seq($._keyword_print, $.expression),

		statement_return: ($) =>
			prec.left(2, seq($._keyword_return, optional($.expression))),

		expression: ($) => choice($.number, $.path),

		_keyword: ($) =>
			prec(
				100,
				choice(
					$._keyword_await,
					$._keyword_call,
					$._keyword_elif,
					$._keyword_else,
					$._keyword_exit,
					$._keyword_if,
					$._keyword_init,
					$._keyword_jump,
					$._keyword_label,
					$._keyword_let,
					$._keyword_match,
					$._keyword_menu,
					$._keyword_new,
					$._keyword_object,
					$._keyword_pass,
					$._keyword_print,
					$._keyword_return,
					$._keyword_suspend,
					$._keyword_var,
				),
			),
		_keyword_await: ($) => alias("await", $.keyword),
		_keyword_call: ($) => alias("call", $.keyword),
		_keyword_elif: ($) => alias("elif", $.keyword),
		_keyword_else: ($) => alias("else", $.keyword),
		_keyword_exit: ($) => alias("exit", $.keyword),
		_keyword_if: ($) => alias("if", $.keyword),
		_keyword_init: ($) => alias("init", $.keyword),
		_keyword_jump: ($) => alias("jump", $.keyword),
		_keyword_label: ($) => alias("label", $.keyword),
		_keyword_let: ($) => alias("let", $.keyword),
		_keyword_match: ($) => alias("match", $.keyword),
		_keyword_menu: ($) => alias("menu", $.keyword),
		_keyword_new: ($) => alias("new", $.keyword),
		_keyword_object: ($) => alias("object", $.keyword),
		_keyword_pass: ($) => alias("pass", $.keyword),
		_keyword_print: ($) => alias("print", $.keyword),
		_keyword_return: ($) => alias("return", $.keyword),
		_keyword_suspend: ($) => alias("suspend", $.keyword),
		_keyword_var: ($) => alias("var", $.keyword),

		path: ($) =>
			prec.right(
				2,
				seq(
					optional($._operator_dot),
					$.identifier,
					repeat(seq($._operator_dot, $.identifier)),
				),
			),

		identifier: ($) => /[a-z_][a-z_0-9]*/i,

		assigner: ($) => /[+\-\*\/?&]?=/,

		operator: ($) =>
			choice(
				$._operator_and,
				$._operator_angle_right,
				$._operator_dot,
				$._operator_or,
				$._operator_nand,
				$._operator_nor,
				/[=!<>]=|[+\-\*\/%&|<()]/,
			),

		_operator_and: ($) => choice("&&", "and"),
		_operator_angle_right: ($) => alias(">", $.operator),
		_operator_dot: ($) => alias(".", $.operator),
		_operator_or: ($) => choice("||", "or"),
		_operator_nand: ($) => "nand",
		_operator_nor: ($) => "nor",

		_string: ($) => choice($.string_rich, $.string_raw),
		string_rich: ($) =>
			choice(
				seq(/[>+]/, optional($._string_rich_implicit)),
				/[`]{3}.*?[`]{3}|[`].*?[`]/,
			),
		string_raw: ($) => /['"]{3}.*?['"]{3}|['"].*?['"]/,

		number: ($) => choice(/\d+/, /\d+\.\d+/, /\.\d+/),

		comment: ($) => seq("#", /.*/),
	},
});
