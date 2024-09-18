import assert from "assert";
import * as Ast from "./ast";

class SymbolTableFrame {
  readonly parent: SymbolTableFrame | null;
  readonly name: string | null;

  private readonly _symbols = new Map<string, Type>();
  private readonly _functions = new Map<string, FuncType>();

  constructor(
    parent: SymbolTableFrame | null = null,
    name: string | null = null
  ) {
    this.parent = parent;
    this.name = name;
  }

  addFunction(name: string, type: FuncType) {
    assert(
      !this.parent?.getFunction(name) && !this._functions.has(name),
      `Error: duplicate function name: ${name}`
    );
    this._functions.set(name, type);
  }

  getFunction(name: string): FuncType | undefined {
    return this._functions.get(name) ?? this.parent?.getFunction(name);
  }

  addSymbol(name: string, type: Type) {
    assert(
      !this.parent?.getSymbol(name) && !this._symbols.has(name),
      `Error: duplicate variable name: ${name}`
    );
    this._symbols.set(name, type);
  }

  getSymbol(name: string): Type | undefined {
    return this._symbols.get(name) ?? this.parent?.getSymbol(name);
  }
}

class SymbolTable {
  private _frame = new SymbolTableFrame();
  private readonly _types = new Map<string, Type>();

  constructor() {
    this._types.set("i32", { type: "i32" });
    this._types.set("u8", { type: "u8" });
    this._types.set("u32", { type: "u32" });
    this._types.set("void", { type: "void" });
  }

  pushFrame(funcName: string) {
    this._frame = new SymbolTableFrame(this._frame, funcName);
  }

  popFrame() {
    assert(
      this._frame.parent,
      "Error: cannot pop top-level symbol table frame"
    );
    this._frame = this._frame.parent;
  }

  addSymbol(name: string, type: Type) {
    this._frame.addSymbol(name, type);
  }

  getSymbol(name: string): Type | undefined {
    return this._frame.getSymbol(name);
  }

  addFunction(name: string, type: FuncType) {
    this._frame.addFunction(name, type);
  }

  getFunction(name: string): FuncType | undefined {
    return this._frame.getFunction(name);
  }

  addType(name: string, type: Type) {
    assert(!this._types.has(name), `Error: duplicate function name: ${name}`);
    this._types.set(name, type);
  }

  getType(name: string): Type | undefined {
    return this._types.get(name);
  }

  getCurrentFrameName(): string {
    assert(
      this._frame.name !== null,
      "Internal error, getCurrentFrameName was called on the top-level symbol table frame"
    );
    return this._frame.name;
  }
}

type Type = Void | I32 | U8 | U32 | Pointer;

type I32 = { type: "i32" };
type U8 = { type: "u8" };
type U32 = { type: "u32" };
type Void = { type: "void" };

type Pointer = {
  to: Type;
  type: "pointer";
};

type FuncType = {
  retType: Type;
  params: Type[];
};

export class TypeChecker {
  private readonly _symbolTable: SymbolTable = new SymbolTable();

  checkProgram(program: Ast.Program) {
    program.funcDecls.forEach((funcDecl) =>
      this._symbolTable.addFunction(funcDecl.name.lexeme, {
        retType: this._checkType(funcDecl.retType),
        params: funcDecl.params.map((param) =>
          this._checkType(param.paramType)
        ),
      })
    );

    program.funcDecls.forEach((funcDecl) => this._checkFuncDecl(funcDecl));
  }

  private _checkFuncDecl(funcDecl: Ast.FuncDecl) {
    this._symbolTable.pushFrame(funcDecl.name.lexeme);
    // Add params to symbol table
    funcDecl.params.forEach((param) =>
      this._symbolTable.addSymbol(
        param.name.lexeme,
        this._checkType(param.paramType)
      )
    );

    // Check function body
    funcDecl.body.forEach((stmt) => this._checkStmt(stmt));
    this._symbolTable.popFrame();
  }

  private _checkStmt(stmt: Ast.Stmt) {
    switch (stmt.type) {
      case "retStmt": {
        const funcName = this._symbolTable.getCurrentFrameName();
        // It is fine to enforce this exists because you will never check a return statement outside a frame, the parser gurantees this
        const funcType = this._symbolTable.getFunction(funcName)!;

        // Check for void return type
        if (stmt.expr === null) {
          if (funcType.retType.type === "void") return { type: "void" };
          throw new Error(
            `No return value was provided for function: ${funcName} with return type: ${funcType.retType}`
          );
        }

        const exprType = this._checkExpr(stmt.expr);
        if (exprType !== funcType.retType) {
          throw new Error(
            `Return statement in function: ${funcName} has incorrect type, expected: ${funcType.retType}, got: ${exprType}`
          );
        }
        return exprType;
      }
      case "exprStmt": {
        return this._checkExpr(stmt.expr);
      }
    }
  }

  private _checkExpr(expr: Ast.Expr): Type {
    switch (expr.type) {
      case "intExpr": {
        return { type: "i32" };
      }
      case "stringExpr": {
        return { to: { type: "u8" }, type: "pointer" };
      }
      case "varExpr": {
        const varType = this._symbolTable.getSymbol(expr.name.lexeme);

        if (!varType) {
          throw new Error(`Unknown variable with name: ${expr.name.lexeme}`);
        }

        return varType;
      }
      case "callExpr": {
        const funcType = this._symbolTable.getFunction(expr.name.lexeme);
        if (!funcType) {
          throw new Error(
            `Unknown function call to function with name: ${expr.name.lexeme}`
          );
        }

        if (expr.args.length !== funcType.params.length) {
          throw new Error(
            `Function: ${expr.name.lexeme} was called with the wrong number of params, expected: ${funcType.params.length}, got: ${expr.args.length}`
          );
        }

        // Check all param types
        expr.args.forEach((arg, i) => {
          var argType = this._checkExpr(arg);
          if (argType !== funcType.params[i]) {
            throw new Error(
              `Parameter #${i} in function: ${expr.name.lexeme} has incorrect type, expected: ${funcType.params[i]}, got: ${argType}`
            );
          }
        });

        return funcType.retType;
      }
      case "binaryExpr": {
        const rhsType = this._checkExpr(expr.rhs);
        const lhsType = this._checkExpr(expr.lhs);

        if (rhsType !== lhsType) {
          throw new Error(
            `Right-hand side and Left-hand side of ${expr.op.lexeme} have mismatched type, rhs: ${rhsType}, lhs: ${lhsType}`
          );
        }

        return rhsType;
      }
      case "typeInitExpr": {
        throw new Error('TODO: implement typeInitExpr checking');
      }
      case "assignExpr": {
        const varType = this._checkExpr(expr.expr);
        this._symbolTable.addSymbol(expr.name.lexeme, varType);
        return varType;
      }
    }
  }

  private _checkType(typeAst: Ast.Type): Type {
    switch (typeAst.type) {
      case 'named': {
        const type = this._symbolTable.getType(typeAst.name.lexeme);
        assert(type, `Error: undefined type ${typeAst.name.lexeme}`);
        return type;
      }
      case 'pointer': {
        return {type: 'pointer', to: this._checkType(typeAst.to)}
      }
    }
    
  }
}
