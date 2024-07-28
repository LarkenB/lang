export type EOFToken = {
  type: "eof";
  lexeme: "";
};

export type FuncToken = {
  type: "func";
  lexeme: "func";
};

export type RetToken = {
  type: "ret";
  lexeme: "ret";
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

export type OpToken = {
  lexeme: "+" | "-" | "*" | "/" | "%";
  type: "op";
};

export type ArrowToken = {
  lexeme: "->";
  type: "arrow";
};

export type CommaToken = {
  lexeme: ",";
  type: "comma";
};

export type ColonToken = {
  lexeme: ":";
  type: "colon";
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
  | IntLitToken
  | OpToken
  | ArrowToken
  | CommaToken
  | ColonToken;

export type TokenType = ExtractTypes<Token>;

type ExtractTypes<T> = T extends { type: infer U } ? U : never;
