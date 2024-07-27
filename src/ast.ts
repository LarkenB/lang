import { IdentToken } from "./token";

export type Program = {
  funcDecls: FuncDecl[];
};

export type FuncDecl = {
  name: IdentToken;
  params: Param[];
  retType: Type;
  body: Stmt[];
};

export type Param = {
  name: IdentToken;
  type: Type;
};

export type Type = IdentToken;

export type Stmt = RetStmt;

export type RetStmt = {
  expr: Expr;
};

export type Expr = {};
