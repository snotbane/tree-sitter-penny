/**
 * @file Penny grammar for tree-sitter
 * @author Sebastian Weaver <snotbane@pm.me>
 * @license Unlicense
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
	name: "penny",

	externals: ($) => [$._string_rich_implicit, $._whitespace, $._new_line],

	extras: ($) => [$._whitespace, $._new_line, $.comment],

	// word: ($) => $.identifier,

	rules: {
		source_file: ($) =>
			repeat(
				seq(
					choice($._stmt, $.expression),
					choice($._new_line, ";", eof()),
				),
			),

		_value: ($) =>
			choice(
				prec(10, $.function_call),
				prec(10, $.array),
				prec(2, alias("object", $.keyword)),
				prec(2, $.string_rich),
				prec(
					-10,
					choice(
						$.null,
						$.boolean,
						$.number,
						$.string_raw,
						$.filter,
						$.path,
					),
				),
			),

		_limited_value: ($) =>
			choice(
				prec(10, $.function_call),
				prec(10, $.array),
				prec(2, alias("object", $.keyword)),
				// prec(2, $.string_rich),
				prec(
					-10,
					choice(
						$.null,
						$.boolean,
						$.number,
						$.string_raw,
						$.filter,
						$.path,
					),
				),
			),

		comment: ($) => seq("#", /.*/),

		null: ($) => /[Nn]ull|NULL/,

		default: ($) => "_",

		boolean: ($) => choice(/[Tt]rue|TRUE/, /[Ff]alse|FALSE/),

		number: ($) => choice(/\d+/, /\d+\.\d+/, /\.\d+/),

		escape_sequence: ($) => prec(10, /\\./),

		string_raw: ($) =>
			choice(
				seq("'", repeat(choice($.escape_sequence, /[^']/)), "'"),
				seq('"', repeat(choice($.escape_sequence, /[^"]/)), '"'),
			),

		string_rich: ($) =>
			choice(
				seq(">", $._string_rich_implicit),
				seq("`", repeat(choice($.escape_sequence, /[^`]/)), "`"),
			),

		filter: ($) => seq($.string_raw, "->", $.string_raw),

		path: ($) => $._path_component,

		_path_component: ($) =>
			choice(
				seq(optional("."), $.identifier),
				prec(2, seq($._path_component, ".", $.identifier)),
			),

		identifier: ($) => /[a-z_][a-z_0-9]*/i,

		array: ($) =>
			seq(
				"[",
				optional(
					seq(
						$.expression,
						repeat(seq(",", $.expression)),
						optional(","),
					),
				),
				"]",
			),

		function_call: ($) =>
			seq(
				prec(2, optional("await")),
				$.path,
				"(",
				optional(seq($.expression, repeat(seq(",", $.expression)))),
				")",
			),

		expression: ($) => prec.right(2, repeat1(choice($._value, $.op))),

		_limited_expression: ($) =>
			alias(
				prec.right(2, repeat1(choice($._limited_value, $.op))),
				$.expression,
			),

		op: ($) => choice("and", "or", "new", "is", /[\+\-\*\/\|&<>]/),

		assignment: ($) => /[\+\-\*\/%?]?=/,

		_stmt: ($) =>
			choice(
				$.option,
				seq(
					choice(
						$.stmt_ask,
						$.stmt_elif,
						$.stmt_else,
						$.stmt_if,
						$.stmt_match,
					),
					":",
				),
				$.stmt_assign,
				$.stmt_await,
				$.stmt_call,
				$.stmt_exit,
				$.stmt_jump,
				$.stmt_label,
				$.stmt_pass,
				$.stmt_print,
				$.stmt_return,
				$.stmt_say,
				$.stmt_shut,
				$.stmt_suspend,
			),

		// Using an optional here is not good, but necessary when creating ask statements with rich dialogs. Those tests are no good either. MASSIVE bandage.
		option: ($) => seq(optional(choice($.expression, $.default)), ":"),

		stmt_ask: ($) => seq(optional($.path), "ask"),

		stmt_assign: ($) =>
			seq(
				optional(choice("def", "let", "var")),
				$.path,
				$.assignment,
				$.expression,
			),

		stmt_await: ($) => seq("await", choice($.number, $.path)),

		stmt_call: ($) => seq("call", $.expression),

		stmt_delay: ($) => seq("delay", $.expression),

		stmt_elif: ($) => seq("elif", $._limited_expression),

		stmt_else: ($) => "else",

		stmt_exit: ($) => seq("exit", optional($.expression)),

		stmt_if: ($) => seq("if", $._limited_expression),

		stmt_jump: ($) => seq("jump", $.expression),

		stmt_label: ($) => seq("label", $.identifier),

		stmt_option: ($) => seq("opt", optional($.expression)),

		stmt_match: ($) => seq("match", $.expression),

		stmt_pass: ($) => "pass",

		stmt_print: ($) => seq("print", optional($.expression)),

		stmt_return: ($) => seq("return", optional($.expression)),

		stmt_say: ($) => prec(20, seq(optional($.path), $.string_rich)),

		stmt_shut: ($) => seq(optional($.path), /-+/),

		stmt_suspend: ($) => seq("suspend", optional($.expression)),
	},
});
