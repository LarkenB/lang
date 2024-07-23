import { readFileSync } from "fs";
import { Lexer } from "./lexer";
import { Reader } from "./reader";

const main = () => {
    const content = readFileSync("./examples/simple.lang", {encoding: 'utf-8'});
    console.log(content);
    const reader = new Reader(content);
    const lexer = new Lexer(reader);
    
    let token = lexer.next();
    while (token.type !== 'eof') {
        console.log(token);
        token = lexer.next();
    }


    return 0;
}

main();