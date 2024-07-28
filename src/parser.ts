import {
  Expr,
  ExprStmt,
  FuncDecl,
  IntExpr,
  Param,
  Program,
  RetStmt,
  Stmt,
  Type,
} from "./ast";
import { ILexer } from "./interfaces";
import { Token, TokenType } from "./token";

export class Parser {
  private readonly _lexer: ILexer;
  private readonly _precedences = new Map<string, number>([
    ["+", 20],
    ["-", 20],
    ["*", 40],
    ["/", 40],
    ["%", 40],
  ]);

  constructor(lexer: ILexer) {
    this._lexer = lexer;
  }

  parseProgram(): Program {
    const funcDecls: FuncDecl[] = [];
    while (this._lexer.peek().type !== "eof") {
      const funcDecl = this._parseFuncDecl();
      funcDecls.push(funcDecl);
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
    while (this._lexer.peek().type !== "rBrace") {
      stmts.push(this._parseStmt());
    }
    this._expect("rBrace");
    return stmts;
  }

  private _parseStmt(): Stmt {
    switch (this._lexer.peek().type) {
      case "ret":
        return this._parseRetStmt();
      default:
        return this._parseExprStmt();
    }
  }

  private _parseRetStmt(): RetStmt {
    this._expect("ret");
    const expr = this._parseExpr();
    this._expect("semi");
    return { expr };
  }

  private _parseExprStmt(): ExprStmt {
    const expr = this._parseExpr();
    this._expect("semi");
    return { expr };
  }

  private _parseExpr(): Expr {
    const expr = this._parsePrimaryExpr();
    return this._parseBinaryExpr({ expr, precedence: 0 });
  }

  private _parsePrimaryExpr(): Expr {
    switch (this._lexer.peek().type) {
      case "ident":
        return this._parseIdentExpr();
      case "intLit":
        return this._parseIntLitExpr();
      case "lParen":
        return this._parseParenExpr();
      default:
        throw new Error("TODO" + this._lexer.peek().type);
    }
  }

  private _parseIdentExpr(): Expr {
    const name = this._expect("ident");
    switch (this._lexer.peek().type) {
      case "lParen": {
        this._lexer.next(); // Eat '('
        const args: Expr[] = [];
        if (this._lexer.peek().type === "rParen") {
          this._lexer.next(); // Eat ')'
          return { name, args };
        }

        args.push(this._parseExpr());

        while (this._lexer.peek().type === "comma") {
          this._lexer.next(); // Eat ','
          args.push(this._parseExpr());
        }

        this._expect("rParen");
        return { name, args };
      }
      default:
        return { name };
    }
  }

  private _parseIntLitExpr(): IntExpr {
    const value = this._expect('intLit');
    return { value };
  }

  private _parseParenExpr(): Expr {
    this._expect("lParen");
    const expr = this._parseExpr();
    this._expect("rParen");
    return expr;
  }

  private _parseBinaryExpr(lhs: { expr: Expr; precedence: number }): Expr {
    while (true) {
      const precedence = this._precedences.get(this._lexer.peek().lexeme) ?? -1;
      if (precedence < lhs.precedence) { 
        return lhs.expr;
      }

      const op = this._expect("op");
      let rhs = this._parsePrimaryExpr();

      const nextPrecedence = this._precedences.get(this._lexer.peek().lexeme) ?? -1;
      if (precedence < nextPrecedence) {
        rhs = this._parseBinaryExpr({expr: rhs, precedence: precedence + 1});
      }

      lhs.expr = { lhs: lhs.expr, op, rhs };
    }
  }

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
