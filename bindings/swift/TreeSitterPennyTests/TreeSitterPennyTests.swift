import XCTest
import SwiftTreeSitter
import TreeSitterPenny

final class TreeSitterPennyTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_penny())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Penny grammar")
    }
}
