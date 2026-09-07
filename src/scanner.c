#include "tree_sitter/parser.h"

enum TokenType { DIALOG };

void *tree_sitter_penny_external_scanner_create() { return NULL; }
void tree_sitter_penny_external_scanner_destroy(void *p) {}
unsigned tree_sitter_penny_external_scanner_serialize(void *p, char *buffer) {
  return 0;
}
void tree_sitter_penny_external_scanner_deserialize(void *p, const char *b,
                                                    unsigned n) {}

bool tree_sitter_penny_external_scanner_scan(void *payload, TSLexer *lexer,
                                             const bool *valid_symbols) {
  if (!valid_symbols[DIALOG] || lexer->lookahead != '>')
    return false;

  uint32_t base_column = lexer->get_column(lexer);
  lexer->advance(lexer, false); // consume '>'

  for (;;) {
    while (!lexer->eof(lexer) && lexer->lookahead != '\n') {
      lexer->advance(lexer, false);
    }

    lexer->mark_end(lexer); // candidate end of token
    lexer->result_symbol = DIALOG;

    if (lexer->eof(lexer))
      return true;

    lexer->advance(lexer, false); // consume '\n'

    uint32_t indent = 0;
    while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
      lexer->advance(lexer, false);
      indent++;
    }

    if (lexer->lookahead == '\n' || lexer->eof(lexer))
      return true; // blank line ends it
    if (indent <= base_column)
      return true; // not deep enough, stop before this line

    // deep enough — loop back and consume this line as part of the string
  }
}
