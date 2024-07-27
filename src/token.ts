export type EOFToken = {
  type: "eof";
};

export type FuncToken = {
  type: "func";
};

export type RetToken = {
  type: "ret";
};

export type IdentToken = {
  lexeme: string;
  type: "ident";
};

export type LParenToken = {
  lexeme: "(";
  type: "lParen";
};

export type RParenToken = {
  lexeme: ")";
  type: "rParen";
};

export type LBraceToken = {
  lexeme: "{";
  type: "lBrace";
};

export type RBraceToken = {
  lexeme: "}";
  type: "rBrace";
};

export type SemiToken = {
  lexeme: ";";
  type: "semi";
};

export type IntLitToken = {
  lexeme: string;
  type: "intLit";
};

export type Token =
  | EOFToken
  | IdentToken
  | FuncToken
  | RetToken
  | LParenToken
  | RParenToken
  | RBraceToken
  | LBraceToken
  | SemiToken
  | IntLitToken;

export type TokenType = ExtractTypes<Token>;

type ExtractTypes<T> = T extends { type: infer U } ? U : never;
