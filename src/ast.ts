import { IdentToken, IntLitToken, OpToken } from "./token";

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

export type Stmt = RetStmt | ExprStmt;

export type RetStmt = {
  expr: Expr;
};

export type ExprStmt = {
  expr: Expr;
};


export type Expr = CallExpr | VarExpr | BinaryExpr | IntExpr;

export type CallExpr = {
  name: IdentToken;
  args: Expr[];
}

export type VarExpr = {
  name: IdentToken;
}

export type BinaryExpr = {
  lhs: Expr;
  op: OpToken;
  rhs: Expr;
}

export type IntExpr = {
  value: IntLitToken;
}