import {
  Expr,
  ExprStmt,
  ExternDecl,
  ExternFunc,
  FuncDecl,
  IntExpr,
  NamedType,
  Param,
  PointerType,
  Program,
  RetStmt,
  Stmt,
  StringExpr,
  Type,
  TypeDecl,
  TypeInitExpr,
  TypeProp,
  TypePropInit,
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
  ]);

  constructor(lexer: ILexer) {
    this._lexer = lexer;
  }

  parseProgram(): Program {
    const funcDecls: FuncDecl[] = [];
    const externDecls: ExternDecl[] = [];
    const typeDecls: TypeDecl[] = [];


    while (this._lexer.peek().type !== "eof") {
      switch (this._lexer.peek().type) {
        case "extern": {
          const externDecl = this._parseExternDecl();
          externDecls.push(externDecl);
          break;
        }
        case "type": {
          const typeDecl = this._parseTypeDecl();
          typeDecls.push(typeDecl);
          break;
        }
        default: {
          const funcDecl = this._parseFuncDecl();
          funcDecls.push(funcDecl);
          break;
        }
      }
    }

    return {
      type: "program",
      funcDecls,
      externDecls,
      typeDecls
    };
  }

  private _parseTypeDecl(): TypeDecl {
    this._expect("type");
    const name = this._expect("ident");
    this._expect('lBrace');
    const properties = [];
    while (this._lexer.peek().type !== 'rBrace') {
      properties.push(this._parseProperty());
      this._expect('semi');
    }
    this._expect('rBrace');

    return {
      type: "typeDecl",
      name,
      properties
    }
  }

  private _parseProperty(): TypeProp {
    const name = this._expect('ident');
    this._expect('colon');
    const propType = this._parseType();

    return {
      type: "typeProperty",
      name,
      propType
    }
  }

  private _parseFuncDecl(): FuncDecl {
    this._expect("func");
    const name = this._expect("ident");
    const params = this._parseParams();
    let retType: Type = {
      type: "named",
      name: { type: "ident", lexeme: "void" },
    };
    if (this._lexer.peek().type === "arrow") {
      this._lexer.next(); // Eat '->'
      retType = this._parseType();
    }
    const body = this._parseStmtBlock();

    return {
      type: "funcDecl",
      name,
      params,
      retType,
      body,
    };
  }

  // TODO: create top level type and switch between extern decl and funcs instead of checking in parseProgram
  private _parseExternDecl(): ExternDecl {
    this._expect("extern");
    const moduleName = this._expect("stringLit");
    this._expect("lBrace");

    const funcs: ExternFunc[] = [];
    while (this._lexer.peek().type !== "rBrace") {
      funcs.push(this._parseExternFunc());
    }
    this._expect("rBrace");

    return {
      type: "externDecl",
      moduleName,
      funcs,
    };
  }

  private _parseExternFunc(): ExternFunc {
    this._expect("func");
    const name = this._expect("ident");
    const params = this._parseParams();
    let retType: Type = {
      type: "named",
      name: { type: "ident", lexeme: "void" },
    };
    if (this._lexer.peek().type === "arrow") {
      this._lexer.next(); // Eat '->'
      retType = this._parseType();
    }
    this._expect("semi");

    return {
      type: "externFunc",
      name,
      params,
      retType,
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
    const paramType = this._parseType();
    params.push({ type: "param", name, paramType });

    while (this._lexer.peek().type === "comma") {
      this._lexer.next(); // Eat ','
      const name = this._expect("ident");
      this._expect("colon");
      const type = this._parseType();
      params.push({ type: "param", name, paramType });
    }

    this._expect("rParen");
    return params;
  }

  private _parseType(): Type {
    const possibleStar = this._lexer.peek();
    if (possibleStar.type === "op" && possibleStar.lexeme === "*") {
      return this._parsePointerType();
    }

    return this._parseNamedType();
  }

  private _parseNamedType(): NamedType {
    return { type: "named", name: this._expect("ident") };
  }

  private _parsePointerType(): PointerType {
    if (this._expect("op").lexeme !== "*") {
      throw new Error("pointer type must be followed by a named type");
    }

    return { type: "pointer", to: this._parseType() };
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
    let expr = null;
    if (this._lexer.peek().type !== "semi") {
      expr = this._parseExpr();
    }
    this._expect("semi");
    return { type: "retStmt", expr };
  }

  private _parseExprStmt(): ExprStmt {
    const expr = this._parseExpr();
    this._expect("semi");
    return { type: "exprStmt", expr };
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
      case "stringLit":
        return this._parseStringLitExpr();
      case 'lBrace':
        return this._parseTypeInitExpr();
      default:
        throw new Error("TODO: " + this._lexer.peek().type);
    }
  }


  private _parseTypeInitExpr(): TypeInitExpr {
    this._expect("lBrace");
    const properties: TypePropInit[] = [];
    if (this._lexer.peek().type === "rBrace") {
      this._lexer.next(); // Eat '}'
      return {
        type: 'typeInitExpr',
        properties
      };
    }

    const name = this._expect("ident");
    this._expect("colon");
    const value = this._parseExpr();
    properties.push({ type: 'typePropInit', name, value });

    while (this._lexer.peek().type === "comma") {
      this._lexer.next(); // Eat ','
      const name = this._expect("ident");
      this._expect("colon");
      const value = this._parseExpr();
      properties.push({ type: 'typePropInit', name, value });
    }

    this._expect("rBrace");
    return {
      type: 'typeInitExpr',
      properties
    };
  }

  private _parseIdentExpr(): Expr {
    const name = this._expect("ident");
    switch (this._lexer.peek().type) {
      case "lParen": {
        this._lexer.next(); // Eat '('
        const args: Expr[] = [];
        if (this._lexer.peek().type === "rParen") {
          this._lexer.next(); // Eat ')'
          return { type: "callExpr", name, args };
        }

        args.push(this._parseExpr());

        while (this._lexer.peek().type === "comma") {
          this._lexer.next(); // Eat ','
          args.push(this._parseExpr());
        }

        this._expect("rParen");
        return { type: "callExpr", name, args };
      }
      case "colEq": {
        this._lexer.next(); // Eat ':='
        const expr = this._parseExpr();
        return { type: "assignExpr", name, expr };
      }
      default:
        return { type: "varExpr", name };
    }
  }

  private _parseIntLitExpr(): IntExpr {
    const value = this._expect("intLit");
    return { type: "intExpr", value };
  }

  private _parseStringLitExpr(): StringExpr {
    const value = this._expect("stringLit");
    return { type: "stringExpr", value };
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

      const nextPrecedence =
        this._precedences.get(this._lexer.peek().lexeme) ?? -1;
      if (precedence < nextPrecedence) {
        rhs = this._parseBinaryExpr({ expr: rhs, precedence: precedence + 1 });
      }

      lhs.expr = { type: "binaryExpr", lhs: lhs.expr, op, rhs };
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
