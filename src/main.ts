import { readFileSync, writeFileSync } from "fs";
import { Lexer } from "./lexer";
import { Reader } from "./reader";
import { Parser } from "./parser";
import { Emitter } from "./emitter";

const main = async () => {
  const content = readFileSync("./examples/simple.lang", { encoding: "utf-8" });
  // console.log(content);
  const reader = new Reader(content);
  const lexer = new Lexer(reader);
  const parser = new Parser(lexer);
  const ast = parser.parseProgram();
  const emitter = new Emitter();
  const binary = emitter.emitProgram(ast);

  // console.log(JSON.stringify(ast, null, 2));

  writeFileSync('./out.wasm', binary, {encoding: 'utf-8'});

  const { instance } = await WebAssembly.instantiate(binary);
  console.log((instance.exports as any).main());

  /* let token = lexer.next();
  while (token.type !== 'eof') {
      console.log(token);
      token = lexer.next();
  } */
};

main();
