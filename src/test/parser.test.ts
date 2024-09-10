import { test, expect } from "@jest/globals";
import { Program } from "../ast";
import { Lexer } from "../lexer";
import { Reader } from "../reader";
import { Parser } from "../parser";

test("parser should return Program with empty funcDecls for an empty source file", () => {
  const source = ``;

  const reader = new Reader(source);
  const lexer = new Lexer(reader);
  const parser = new Parser(lexer);
  const result = parser.parseProgram();

  const expected: Program = {
    type: "program",
    funcDecls: [],
  };

  expect(result).toEqual(expected);
});
