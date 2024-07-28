import { readFileSync } from "fs";
import { Lexer } from "./lexer";
import { Reader } from "./reader";
import { Parser } from "./parser";

const main = () => {
  const content = readFileSync("./examples/simple.lang", { encoding: "utf-8" });
  console.log(content);
  const reader = new Reader(content);
  const lexer = new Lexer(reader);
  const parser = new Parser(lexer);
  const ast = parser.parseProgram();
  
  console.log(JSON.stringify(ast, null, 2));

  /* let token = lexer.next();
  while (token.type !== 'eof') {
      console.log(token);
      token = lexer.next();
  } */
};

main();
