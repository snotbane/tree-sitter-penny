#include "tree_sitter/parser.h"
#include <stdlib.h>
#include <string.h>

enum TokenType {
  _STRING_RICH_IMPLICIT,
  _LINE_INDENT,
};

typedef struct {
  int32_t current_line_indent;
} Scanner;

void *tree_sitter_penny_external_scanner_create() {
  return calloc(1, sizeof(Scanner));
}

void tree_sitter_penny_external_scanner_destroy(void *payload) {
  free(payload);
}

unsigned tree_sitter_penny_external_scanner_serialize(void *payload,
                                                      char *buffer) {
  Scanner *s = (Scanner *)payload;
  memcpy(buffer, &s->current_line_indent, sizeof(int32_t));
  return sizeof(int32_t);
}

void tree_sitter_penny_external_scanner_deserialize(void *payload,
                                                    const char *buffer,
                                                    unsigned length) {
  Scanner *s = (Scanner *)payload;
  s->current_line_indent = 0;
  if (length >= sizeof(int32_t))
    memcpy(&s->current_line_indent, buffer, sizeof(int32_t));
}

// Fires at the start of every physical line. Records indent depth as a
// side effect; only emits a real (hidden) token if it actually consumed
// leading whitespace, since zero-width external tokens aren't allowed.
static bool scan_line_indent(Scanner *s, TSLexer *lexer) {
  if (lexer->get_column(lexer) != 0)
    return false;

  int32_t indent = 0;
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
    lexer->advance(lexer, false);
    indent++;
  }

  s->current_line_indent =
      indent; // side effect happens regardless of return value

  if (indent == 0)
    return false; // nothing to consume, but depth is now recorded

  lexer->mark_end(lexer);
  lexer->result_symbol = _LINE_INDENT;
  return true;
}

// Fires right after '>' is consumed by the grammar. Uses the indent
// depth recorded for THIS line (by scan_line_indent, earlier), not
// whatever column '>' itself happens to sit at.
static bool scan_multiline_string(Scanner *s, TSLexer *lexer) {
  int32_t base_indent = s->current_line_indent;
  bool consumed_any = false;

  for (;;) {
    while (!lexer->eof(lexer) && lexer->lookahead != '\n') {
      lexer->advance(lexer, false);
      consumed_any = true;
    }

    lexer->mark_end(lexer);
    lexer->result_symbol = _STRING_RICH_IMPLICIT;

    if (lexer->eof(lexer))
      return consumed_any;

    lexer->advance(lexer, false); // consume '\n'

    int32_t indent = 0;
    while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
      lexer->advance(lexer, false);
      indent++;
    }

    if (lexer->lookahead == '\n' || lexer->eof(lexer))
      return consumed_any;
    if (indent <= base_indent)
      return consumed_any;

    consumed_any = true;
  }
}

bool tree_sitter_penny_external_scanner_scan(void *payload, TSLexer *lexer,
                                             const bool *valid_symbols) {
  Scanner *s = (Scanner *)payload;

  if (valid_symbols[_LINE_INDENT] && scan_line_indent(s, lexer)) {
    return true;
  }

  if (valid_symbols[_STRING_RICH_IMPLICIT]) {
    return scan_multiline_string(s, lexer);
  }

  return false;
}
