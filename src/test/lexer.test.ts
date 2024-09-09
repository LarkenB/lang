import { test, expect } from "@jest/globals";
import { Lexer } from "../lexer";
import { Reader } from "../reader";
import { TokenType } from "../token";

test("lexer simple main function example", () => {
  const source = `
    func main() -> i32 {
        ret 0;
    }
    `;

  const reader = new Reader(source);
  const lexer = new Lexer(reader);

  const result: TokenType[] = [];
  while (lexer.peek().type !== "eof") {
    result.push(lexer.next().type);
  }

  const expected: TokenType[] = [
    "func",
    "ident",
    "lParen",
    "rParen",
    "arrow",
    "ident",
    "lBrace",
    "ret",
    "intLit",
    "semi",
    "rBrace",
  ];

  expect(result).toEqual(expected);
});
