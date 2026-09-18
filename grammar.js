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
		// source_file: ($) => repeat(choice($.expression, $._stmt)),
		source_file: ($) =>
			repeat(seq(choice($.expression), choice($._new_line, ";", eof()))),

		// _stmt: ($) => seq(choice(), choice($._new_line, eof(), ";")),

		// source_file: ($) => repeat(choice($._standalone_value, $._stmt)),

		_standalone_value: ($) =>
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

		comment: ($) => seq("#", /.*/),

		null: ($) => /[Nn]ull|NULL/,

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
				seq(/>\s*/, optional($._string_rich_implicit)),
				seq("`", repeat(choice($.escape_sequence, /[^`]/)), "`"),
			),

		filter: ($) => seq($.string_raw, "->", $.string_raw),

		path: ($) =>
			prec.right(
				2,
				seq(
					optional("."),
					$.identifier,
					repeat(seq(".", $.identifier)),
				),
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
				/\s*\]/,
			),

		function_call: ($) =>
			seq(
				prec(2, optional("await")),
				$.path,
				"(",
				optional(seq($.expression, repeat(seq(",", $.expression)))),
				")",
			),

		expression: ($) =>
			prec.right(2, repeat1(choice($._standalone_value, $.op))),
		// prec.right(
		// 	2,
		// 	seq(
		// 		repeat($.op),
		// 		$._standalone_value,
		// 		repeat(seq(repeat1($.op), $._standalone_value)),
		// 	),
		// ),

		// _expression_or_string_rich: ($) =>
		// 	choice($.expression, $.string_rich, alias("_", $.default)),

		op: ($) => choice("and", "or", "new", "is", /[\+\-\*\/\|&<>]+/),

		assignment: ($) => /[\+\-\*\/%?]?=/,

		// _stmt: ($) =>
		// 	choice(
		// 		$.stmt_say,
		// 		seq(
		// 			choice(
		// 				$.stmt_ask,
		// 				$.stmt_elif,
		// 				$.stmt_else,
		// 				$.stmt_if,
		// 				$.stmt_match,
		// 				$.stmt_option,
		// 			),
		// 			":",
		// 		),

		// 		seq(
		// 			choice(
		// 				$._stmt_path,
		// 				$.stmt_assign,
		// 				$.stmt_await,
		// 				$.stmt_call,
		// 				$.stmt_exit,
		// 				$.stmt_jump,
		// 				$.stmt_label,
		// 				$.stmt_pass,
		// 				$.stmt_print,
		// 				$.stmt_return,
		// 				$.stmt_shut,
		// 				$.stmt_suspend,
		// 			),
		// 			prec(
		// 				5,
		// 				choice(";", repeat1(choice("\n", $._newline)), eof()),
		// 			),
		// 		),
		// 	),

		// _stmt_path: ($) => $.path,

		// // _stmt_branch: ($) => seq($._expression_or_string_rich, ":"),

		// stmt_ask: ($) => seq(optional($.path), "ask"),

		// stmt_assign: ($) =>
		// 	seq(
		// 		optional(choice("def", "let", "var")),
		// 		$.path,
		// 		$.assignment,
		// 		$._expression_or_string_rich,
		// 	),

		// stmt_await: ($) => seq("await", choice($.number, $.path)),

		// stmt_call: ($) => seq("call", $.expression),

		// stmt_delay: ($) => seq("delay", $.expression),

		// stmt_elif: ($) => seq("elif", $.expression),

		// stmt_else: ($) => "else",

		// stmt_exit: ($) => seq("exit", optional($.expression)),

		// stmt_if: ($) => seq("if", $.expression),

		// stmt_jump: ($) => seq("jump", $.expression),

		// stmt_label: ($) => seq("label", $.identifier),

		// stmt_option: ($) => seq("opt", optional($._expression_or_string_rich)),

		// stmt_match: ($) => seq("match", $.expression),

		// stmt_pass: ($) => "pass",

		// stmt_print: ($) => seq("print", optional($._expression_or_string_rich)),

		// stmt_return: ($) => seq("return", optional($.expression)),

		// stmt_say: ($) =>
		// 	seq(optional($.path), optional(seq("say", ":")), $.string_rich),

		// stmt_shut: ($) => seq(optional($.path), /-+/),

		// stmt_suspend: ($) => seq("suspend", optional($.expression)),
	},
});
