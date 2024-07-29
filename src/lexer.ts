import assert from "assert";
import { ILexer, IReader, eof } from "./interfaces";
import { Token } from "./token";

export class Lexer implements ILexer {
  private readonly _reader: IReader;
  private _peeked: Token | null = null;

  constructor(reader: IReader) {
    this._reader = reader;
  }

  next(): Token {
    if (this._peeked) {
      const result = this._peeked;
      this._peeked = null;
      return result;
    }

    return this._internalNext();
  }

  peek(): Token {
    if (!this._peeked) {
      this._peeked = this._internalNext();
    }

    return this._peeked;
  }

  _internalNext(): Token {
    let c = this._reader.next();

    // Whitespace
    while (c !== eof && isWhitespace(c)) {
      c = this._reader.next();
    }

    // EOF
    if (c === eof) return { type: "eof", lexeme: "" };

    // Special Chars
    switch (c) {
      case "(":
        return { type: "lParen", lexeme: c };
      case ")":
        return { type: "rParen", lexeme: c };
      case "{":
        return { type: "lBrace", lexeme: c };
      case "}":
        return { type: "rBrace", lexeme: c };
      case ";":
        return { type: "semi", lexeme: c };
      case ",":
        return { type: "comma", lexeme: c };
      case ":":
        return { type: "colon", lexeme: c };
    }

    // Operators
    if (isOperator(c)) {
      let lexeme = c;
      c = this._reader.peek();
      while (c !== eof && isOperator(c)) {
        lexeme += this._reader.next();
        c = this._reader.peek();
      }

      switch (lexeme) {
        case "+":
          return { type: "op", lexeme };
        case "-":
          return { type: "op", lexeme };
        case "*":
          return { type: "op", lexeme };
        case "/":
          return { type: "op", lexeme };
        case "->":
          return { type: "arrow", lexeme };
        default:
          throw new Error(`Unknown operator ${lexeme}`);
      }
    }

    // Keywords and Identifiers
    if (startsIdent(c)) {
      let lexeme = c;
      c = this._reader.peek();
      while (c !== eof && isIdent(c)) {
        lexeme += this._reader.next();
        c = this._reader.peek();
      }

      // TODO: reduce verbosity needed for adding keywords;
      switch (lexeme) {
        case "func":
          return { type: "func", lexeme };
        case "ret":
          return { type: "ret", lexeme };
        default:
          return { type: "ident", lexeme };
      }
    }

    // Int Literals
    if (isDigit(c)) {
      let lexeme = c;
      c = this._reader.peek();
      while (c !== eof && isDigit(c)) {
        lexeme += this._reader.next();
        c = this._reader.peek();
      }

      return { type: "intLit", lexeme };
    }

    throw new Error(`Error: unknown char: '${c}'`);
  }
}

function startsIdent(c: string) {
  assert(c.length === 1);
  return /([A-Z]|_)/i.test(c);
}

function isIdent(c: string) {
  assert(c.length === 1);
  return /([A-Z]|[0-9]|_)/i.test(c);
}

function isDigit(c: string) {
  assert(c.length === 1);
  return /([0-9])/i.test(c);
}

function isOperator(c: string) {
  assert(c.length === 1);
  const operatorChars = ["+", "-", "*", "/", ">"];
  return operatorChars.includes(c);
}

function isWhitespace(c: string) {
  assert(c.length === 1);
  return /\s/.test(c);
}
