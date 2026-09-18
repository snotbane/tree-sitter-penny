#include "tree_sitter/parser.h"
#include <assert.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

enum TokenType {
  _STRING_RICH_IMPLICIT,
  _WHITESPACE,
  _NEW_LINE,
};

typedef struct {
  int32_t current_line_indent;
} Scanner;

static bool lookahead_is_whitespace(TSLexer *lexer) {
  return (lexer->lookahead == ' ' || lexer->lookahead == '\t' ||
          lexer->lookahead == '\r' || lexer->lookahead == '\n');
}

static bool lookahead_is_indent(TSLexer *lexer) {
  return (lexer->lookahead == ' ' || lexer->lookahead == '\t');
}

static bool lookahead_is_newline(TSLexer *lexer) {
  return (lexer->lookahead == '\n');
}

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
static bool scan_whitespace(Scanner *s, TSLexer *lexer) {
  bool found_whitespace = false;
  bool found_newline = false;

  while (true) {
    if (lexer->eof(lexer)) {
      break;
    }

    if (lexer->get_column(lexer) == 0) {
      int32_t indent = 0;
      while (lookahead_is_indent(lexer)) {
        found_whitespace = true;
        lexer->advance(lexer, false);
        indent++;
      }
      s->current_line_indent = indent;
    }

    if (!lookahead_is_whitespace(lexer)) {
      break;
    }

    found_whitespace = true;

    if (lexer->lookahead == '\n') {
      found_newline = true;
    }

    lexer->advance(lexer, false);
  }

  if (found_whitespace) {
    lexer->mark_end(lexer);
    if (found_newline) {
      lexer->result_symbol = _NEW_LINE;
    } else {
      lexer->result_symbol = _WHITESPACE;
    }
  }

  return found_whitespace;
}

// Fires right after '>' is consumed by the grammar. Uses the indent
// depth recorded for THIS line (by scan_line_indent, earlier), not
// whatever column '>' itself happens to sit at.
static bool scan_multiline_string(Scanner *s, TSLexer *lexer) {
  int32_t base_indent = s->current_line_indent;
  bool consumed_any = true;

  while (true) {
    while (!lexer->eof(lexer) && !lookahead_is_newline(lexer)) {
      lexer->advance(lexer, false);
      consumed_any = true;
    }

    lexer->mark_end(lexer);
    lexer->result_symbol = _STRING_RICH_IMPLICIT;

    if (lexer->eof(lexer)) {
      break;
    }

    while (lookahead_is_newline(lexer)) {
      lexer->advance(lexer, false);
      consumed_any = true;
    }

    int32_t indent = 0;
    while (lookahead_is_indent(lexer)) {
      lexer->advance(lexer, false);
      indent++;
    }

    if (lookahead_is_whitespace(lexer)) {
      continue;
    }

    if (lexer->eof(lexer))
      break;
    if (indent <= base_indent)
      break;

    consumed_any = true;
  }

  return consumed_any;
}

bool tree_sitter_penny_external_scanner_scan(void *payload, TSLexer *lexer,
                                             const bool *valid_symbols) {
  Scanner *s = (Scanner *)payload;

  if (lexer->get_column(lexer) == 0) {
    s->current_line_indent = 0;
  }

  if (valid_symbols[_STRING_RICH_IMPLICIT]) {
    return scan_multiline_string(s, lexer);
  }

  if (valid_symbols[_WHITESPACE] && scan_whitespace(s, lexer)) {
    return true;
  }

  return false;
}
