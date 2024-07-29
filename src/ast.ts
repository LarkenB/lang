import { IdentToken, IntLitToken, OpToken } from "./token";

export type Program = {
  type: "program";
  funcDecls: FuncDecl[];
};

export type FuncDecl = {
  type: "funcDecl";
  name: IdentToken;
  params: Param[];
  retType: Type;
  body: Stmt[];
};

export type Param = {
  type: "param";
  name: IdentToken;
  paramType: Type;
};

export type Type = {
  type: "type";
  name: IdentToken;
};

export type Stmt = RetStmt | ExprStmt;

export type RetStmt = {
  type: "retStmt";
  expr: Expr;
};

export type ExprStmt = {
  type: "exprStmt";
  expr: Expr;
};

export type Expr = CallExpr | VarExpr | BinaryExpr | IntExpr;

export type CallExpr = {
  type: "callExpr";
  name: IdentToken;
  args: Expr[];
};

export type VarExpr = {
  type: "varExpr";
  name: IdentToken;
};

export type BinaryExpr = {
  type: "binaryExpr";
  lhs: Expr;
  op: OpToken;
  rhs: Expr;
};

export type IntExpr = {
  type: "intExpr";
  value: IntLitToken;
};
