import { readFileSync, writeFileSync } from "fs";
import { Lexer } from "./lexer";
import { Reader } from "./reader";
import { Parser } from "./parser";
import { Emitter } from "./emitter";
import { TypeChecker } from "./checker";

const main = async () => {
  try {
    const content = readFileSync("./examples/checker.lang", {
      encoding: "utf-8",
    });
    // console.log(content);
    const reader = new Reader(content);
    const lexer = new Lexer(reader);
    const parser = new Parser(lexer);
    const ast = parser.parseProgram();
    const checker = new TypeChecker();
    checker.checkProgram(ast);
    const emitter = new Emitter();
    const binary = emitter.emitProgram(ast);

    // console.log(JSON.stringify(ast, null, 2));

    writeFileSync("./out.wasm", binary, { encoding: "utf-8" });

    const { instance } = await WebAssembly.instantiate(binary);
    console.log((instance.exports as any).main());

    /* let token = lexer.next();
  while (token.type !== 'eof') {
      console.log(token);
      token = lexer.next();
  } */
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
  }
};

main();
