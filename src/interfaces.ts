import { Token } from "./token";

export interface IStream<T> {
  next(): T;
  peek(): T;
}

export interface ILexer extends IStream<Token> {}

export type EOF = "eof" & { _eofBrand: never };
export const eof = "eof" as EOF;

export interface IReader extends IStream<string | EOF> {}
