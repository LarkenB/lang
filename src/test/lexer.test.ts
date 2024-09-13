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

test("lexer simple main function example", () => {
  const source = `
    extern "wasi_snapshot_preview1" {
      func fd_write(fd: i32, iovec: i32, len: i32, written: i32) -> i32;
    }

    extern "wasi_snapshot_preview1" {
      func fd_close(fd: i32) -> i32;
    }

    func _start() -> i32 {
      a := add(35, 34);
      b := sub(40, 20);
      c := 10;
      ret square(100) + a + b + c - 99;
    }

    func add(a: i32, b: i32) -> i32 {
      ret a + b;
    }

    func sub(a: i32, b: i32) -> i32 {
      c := b;
      ret a - c;
    }

    func square(a: i32) -> i32 {
      ret a * a;
    }
    `;

  const reader = new Reader(source);
  const lexer = new Lexer(reader);

  const result: TokenType[] = [];
  while (lexer.peek().type !== "eof") {
    result.push(lexer.next().type);
  }

  const expected: TokenType[] = [
    "extern",
    "stringLiteral",
    "lBrace",
    "func",
    "ident",
    "lParen",
    "ident",
    "colon",
    "ident",
    "comma",
    "ident",
    "colon",
    "ident",
    "comma",
    "ident",
    "colon",
    "ident",
    "comma",
    "ident",
    "colon",
    "ident",
    "rParen",
    "arrow",
    "ident",
    "semi",
    "rBrace",
    "extern",
    "stringLiteral",
    "lBrace",
    "func",
    "ident",
    "lParen",
    "ident",
    "colon",
    "ident",
    "rParen",
    "arrow",
    "ident",
    "semi",
    "rBrace",
    "func",
    "ident",
    "lParen",
    "rParen",
    "arrow",
    "ident",
    "lBrace",
    "ident",
    "colEq",
    "ident",
    "lParen",
    "intLit",
    "comma",
    "intLit",
    "rParen",
    "semi",
    "ident",
    "colEq",
    "ident",
    "lParen",
    "intLit",
    "comma",
    "intLit",
    "rParen",
    "semi",
    "ident",
    "colEq",
    "intLit",
    "semi",
    "ret",
    "ident",
    "lParen",
    "intLit",
    "rParen",
    "op",
    "ident",
    "op",
    "ident",
    "op",
    "ident",
    "op",
    "intLit",
    "semi",
    "rBrace",
    "func",
    "ident",
    "lParen",
    "ident",
    "colon",
    "ident",
    "comma",
    "ident",
    "colon",
    "ident",
    "rParen",
    "arrow",
    "ident",
    "lBrace",
    "ret",
    "ident",
    "op",
    "ident",
    "semi",
    "rBrace",
    "func",
    "ident",
    "lParen",
    "ident",
    "colon",
    "ident",
    "comma",
    "ident",
    "colon",
    "ident",
    "rParen",
    "arrow",
    "ident",
    "lBrace",
    "ident",
    "colEq",
    "ident",
    "semi",
    "ret",
    "ident",
    "op",
    "ident",
    "semi",
    "rBrace",
    "func",
    "ident",
    "lParen",
    "ident",
    "colon",
    "ident",
    "rParen",
    "arrow",
    "ident",
    "lBrace",
    "ret",
    "ident",
    "op",
    "ident",
    "semi",
    "rBrace",
  ];

  expect(result).toEqual(expected);
});

test("lexer should return eof for empty source file", () => {
  const source = ``;

  const reader = new Reader(source);
  const lexer = new Lexer(reader);

  expect(lexer.next().type).toEqual("eof");
});

test("lexer simple string literal example", () => {
  const source = `"jdajdajdalkdlkawlkjdlkwkajkwajkldlkalkjwakdjj2oijoij3oir1h1 3hr9u bkjbfakjbfaknkwajb"`;

  const reader = new Reader(source);
  const lexer = new Lexer(reader);

  const result: TokenType[] = [];
  while (lexer.peek().type !== "eof") {
    result.push(lexer.next().type);
  }

  const expected: TokenType[] = ["stringLiteral"];

  expect(result).toEqual(expected);
});

test("lexer should fail for string literal with no closing quote", () => {
  const source = `"jdajdajdalkdlkawlkjdlkwkajkwajkldlkalkjwakdjj2oijoij3oir1h1 3hr9u bkjbfakjbfaknkwajb`;

  const reader = new Reader(source);
  const lexer = new Lexer(reader);

  expect(lexer.next).toThrow();
});
