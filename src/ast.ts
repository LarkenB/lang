import { IdentToken, IntLitToken, OpToken, StringLitToken } from "./token";

export type Program = {
  type: "program";
  funcDecls: FuncDecl[];
  externDecls: ExternDecl[];
  typeDecls: TypeDecl[];
};

export type FuncDecl = {
  type: "funcDecl";
  name: IdentToken;
  params: Param[];
  retType: Type;
  body: Stmt[];
};

export type TypeDecl = {
  type: "typeDecl";
  name: IdentToken;
  properties: TypeProp[];
}

export type TypeProp = {
  type: "typeProperty";
  name: IdentToken;
  propType: Type;
}

export type ExternDecl = {
  type: "externDecl";
  moduleName: StringLitToken;
  funcs: ExternFunc[];
};

export type ExternFunc = {
  type: "externFunc";
  name: IdentToken;
  params: Param[];
  retType: Type;
};

export type Param = {
  type: "param";
  name: IdentToken;
  paramType: Type;
};

export type Type = PointerType | NamedType;

export type PointerType = {
  type: "pointer";
  to: Type;
}

export type NamedType = {
  type: "named";
  name: IdentToken;
};

export type Stmt = RetStmt | ExprStmt;

export type RetStmt = {
  type: "retStmt";
  expr: Expr | null;
};

export type ExprStmt = {
  type: "exprStmt";
  expr: Expr;
};

export type Expr = CallExpr | VarExpr | BinaryExpr | IntExpr | AssignExpr | StringExpr | TypeInitExpr;

export type CallExpr = {
  type: "callExpr";
  name: IdentToken;
  args: Expr[];
};

export type VarExpr = {
  type: "varExpr";
  name: IdentToken;
};

export type AssignExpr = {
  type: "assignExpr";
  name: IdentToken;
  expr: Expr;  
}

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

export type StringExpr = {
  type: "stringExpr";
  value: StringLitToken;
};


export type TypeInitExpr = {
  type: "typeInitExpr";
  properties: TypePropInit[];
}

export type TypePropInit = {
  type: "typePropInit";
  name: IdentToken;
  value: Expr;
}