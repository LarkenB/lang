import { FuncDecl, Param, Program, Stmt, Type } from "./ast";
import { ILexer } from "./interfaces";
import { Token, TokenType } from "./token";

export class Parser {
  private readonly _lexer: ILexer;

  constructor(lexer: ILexer) {
    this._lexer = lexer;
  }

  parseProgram(): Program {
    const funcDecls: FuncDecl[] = [];
    while (this._lexer.peek().type !== "eof") {
      const funcDecl = this._parseFuncDecl();
      funcDecls.push(funcDecl);
      console.log(funcDecl);
    }

    return {
      funcDecls,
    };
  }

  private _parseFuncDecl(): FuncDecl {
    this._expect("func");
    const name = this._expect("ident");
    const params = this._parseParams();
    let retType: Type = { type: "ident", lexeme: "void" };
    if (this._lexer.peek().type === "arrow") {
      this._lexer.next(); // Eat '->'
      retType = this._parseType();
    }
    const body = this._parseStmtBlock();

    return {
      name,
      params,
      retType,
      body,
    };
  }

  private _parseParams(): Param[] {
    this._expect("lParen");
    const params: Param[] = [];
    if (this._lexer.peek().type === "rParen") {
      this._lexer.next(); // Eat ')'
      return params;
    }

    const name = this._expect("ident");
    this._expect("colon");
    const type = this._parseType();
    params.push({ name, type });

    while (this._lexer.peek().type === "comma") {
      this._lexer.next(); // Eat ','
      const name = this._expect("ident");
      this._expect("colon");
      const type = this._parseType();
      params.push({ name, type });
    }

    this._expect("rParen");
    return params;
  }

  private _parseType(): Type {
    return this._expect("ident");
  }

  private _parseStmtBlock(): Stmt[] {
    this._expect("lBrace");
    const stmts: Stmt[] = [];
    this._expect("rBrace");
    return stmts;
  }

  /* private _parseExpr(): Expr {

  } */

  private _expect<T extends TokenType>(
    expectedType: T
  ): Extract<Token, { type: T }> {
    const token = this._lexer.next();
    if (token.type === expectedType) {
      return token as Extract<Token, { type: T }>;
    }

    throw new Error(
      `Unexpected token: expected ${expectedType}, but got ${token.type}`
    );
  }
}
