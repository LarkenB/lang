import { Expr, FuncDecl, Program, Stmt, Type } from "./ast";
import { encodeString, signedLEB128, unsignedLEB128 } from "./encoding";

// TODO: make this a little easier to work with
type SymbolTable = {
  [funcName: string]: {
    [paramName: string]: number;
  };
};

export class Emitter {
  private _functionNames: string[] = [];
  private _symbolTable: SymbolTable = {};
  private _currentFunction: string | null = null;

  emitProgram(program: Program): Uint8Array {
    this._functionNames = program.funcDecls.map((func) => func.name.lexeme);
    this._buildSymbolTable(program.funcDecls);

    const typeSection = this._emitTypeSection(program.funcDecls);
    const functionSection = this._emitFunctionSection(program.funcDecls);
    const exportSection = this._emitExportSection(program.funcDecls);
    const codeSection = this._emitCodeSection(program.funcDecls);

    const binary = [
      ...magicModuleHeader,
      ...moduleVersion,
      ...typeSection,
      ...functionSection,
      ...exportSection,
      ...codeSection,
    ];

    return new Uint8Array(binary);
  }

  private _buildSymbolTable(funcDecls: FuncDecl[]) {
    for (const func of funcDecls) {
      this._symbolTable[func.name.lexeme] = {};
      func.params.forEach((param, index) => {
        this._symbolTable[func.name.lexeme][param.name.lexeme] = index;
      });
    }
  }

  private _emitFuncDecl(funcDecl: FuncDecl): number[] {
    this._currentFunction = funcDecl.name.lexeme;
    const localCount = Object.values(
      this._symbolTable[this._currentFunction]
    ).length;
    const locals = localCount > 0 ? [encodeLocal(localCount, Valtype.i32)] : [];
    const code = this._emitFuncBody(funcDecl.body);
    this._currentFunction = null;

    return encodeVector([...encodeVector(locals), ...code]);
  }

  private _emitTypeSection(funcDecls: FuncDecl[]): number[] {
    const types = funcDecls.map((func) => this._getFunctionType(func));
    return createSection(Section.type, encodeVector(types));
  }

  private _getFunctionType(func: FuncDecl): number[] {
    const paramTypes = func.params.map((param) =>
      this._getValueType(param.paramType)
    );
    const returnTypes =
      func.retType.name.lexeme === "void"
        ? []
        : [this._getValueType(func.retType)];
    return [
      functionType,
      ...encodeVector(paramTypes),
      ...encodeVector(returnTypes),
    ];
  }

  private _getValueType(type: Type): number {
    switch (type.name.lexeme) {
      case "i32":
        return Valtype.i32;
      case "f32":
        return Valtype.f32;
      default:
        throw new Error(`Unsupported type: ${type.name.lexeme}`);
    }
  }

  private _emitFunctionSection(funcDecls: FuncDecl[]): number[] {
    const functionIndices = funcDecls.map((_, index) => index);
    return createSection(Section.func, encodeVector(functionIndices));
  }

  private _emitExportSection(funcDecls: FuncDecl[]): number[] {
    const exports = funcDecls.map((func, index) => [
      ...encodeString(func.name.lexeme),
      ExportType.func,
      ...unsignedLEB128(index),
    ]);
    return createSection(Section.export, encodeVector(exports));
  }

  private _emitCodeSection(funcDecls: FuncDecl[]): number[] {
    const functionBodies = funcDecls.map((func) => this._emitFuncDecl(func));
    return createSection(Section.code, encodeVector(functionBodies));
  }

  private _emitFuncBody(body: Stmt[]): number[] {
    return flatten(body.map((stmt) => this._emitStmt(stmt)));
  }

  private _emitStmt(stmt: Stmt): number[] {
    switch (stmt.type) {
      case "retStmt":
        return stmt.expr ? [...this._emitExpr(stmt.expr), Opcodes.end] : [Opcodes.end];
      case "exprStmt":
        return this._emitExpr(stmt.expr);
      default:
        throw new Error(`Unknown statement type: ${(stmt as any).type}`);
    }
  }

  private _emitExpr(expr: Expr): number[] {
    switch (expr.type) {
      case "intExpr":
        return [
          Opcodes.i32_const,
          ...signedLEB128(parseInt(expr.value.lexeme)),
        ];
      case "varExpr":
        const paramIndex = this._getParamIndex(expr.name.lexeme);
        return [Opcodes.get_local, ...unsignedLEB128(paramIndex)];
      case "callExpr":
        const args = flatten(expr.args.map((arg) => this._emitExpr(arg)));
        return [
          ...args,
          Opcodes.call,
          ...unsignedLEB128(this._getFunctionIndex(expr.name.lexeme)),
        ];
      case "binaryExpr":
        return [
          ...this._emitExpr(expr.lhs),
          ...this._emitExpr(expr.rhs),
          binaryOpcode[expr.op.lexeme],
        ];
      default:
        throw new Error(`Unknown expression type: ${(expr as any).type}`);
    }
  }

  private _getParamIndex(paramName: string): number {
    if (!this._currentFunction) {
      throw new Error("Not currently in a function context");
    }
    const paramIndex = this._symbolTable[this._currentFunction][paramName];
    if (paramIndex === undefined) {
      throw new Error(
        `Unknown parameter: ${paramName} in function ${this._currentFunction}`
      );
    }
    return paramIndex;
  }

  private _getFunctionIndex(funcName: string): number {
    const index = this._functionNames.indexOf(funcName);
    if (index === -1) {
      throw new Error(`Unknown function: ${funcName}`);
    }
    return index;
  }
}

const flatten = (arr: any[]) => [].concat.apply([], arr);

enum Section {
  custom = 0,
  type = 1,
  import = 2,
  func = 3,
  table = 4,
  memory = 5,
  global = 6,
  export = 7,
  start = 8,
  element = 9,
  code = 10,
  data = 11,
}

// https://webassembly.github.io/spec/core/binary/types.html
enum Valtype {
  i32 = 0x7f,
  f32 = 0x7d,
}

// https://webassembly.github.io/spec/core/binary/types.html#binary-blocktype
enum Blocktype {
  void = 0x40,
}

// https://webassembly.github.io/spec/core/binary/instructions.html
enum Opcodes {
  block = 0x02,
  loop = 0x03,
  br = 0x0c,
  br_if = 0x0d,
  end = 0x0b,
  call = 0x10,
  get_local = 0x20,
  set_local = 0x21,
  i32_store_8 = 0x3a,
  i32_const = 0x41,
  f32_const = 0x43,
  i32_eqz = 0x45,
  i32_eq = 0x46,
  i32_add = 0x6a,
  i32_sub = 0x6b,
  i32_mul = 0x6c,
  i32_div_s = 0x6d,
  i32_div_u = 0x6e,
  i32_rem_s = 0x6f,
  i32_rem_u = 0x70,
  f32_eq = 0x5b,
  f32_lt = 0x5d,
  f32_gt = 0x5e,
  i32_and = 0x71,
  f32_add = 0x92,
  f32_sub = 0x93,
  f32_mul = 0x94,
  f32_div = 0x95,
  i32_trunc_f32_s = 0xa8,
}

const binaryOpcode = {
  "+": Opcodes.i32_add,
  "-": Opcodes.i32_sub,
  "*": Opcodes.i32_mul,
  "/": Opcodes.i32_div_s,
  "==": Opcodes.f32_eq,
  ">": Opcodes.f32_gt,
  "<": Opcodes.f32_lt,
  "&&": Opcodes.i32_and,
};

// http://webassembly.github.io/spec/core/binary/modules.html#export-section
enum ExportType {
  func = 0x00,
  table = 0x01,
  mem = 0x02,
  global = 0x03,
}

// http://webassembly.github.io/spec/core/binary/types.html#function-types
const functionType = 0x60;

const emptyArray = 0x0;

// https://webassembly.github.io/spec/core/binary/modules.html#binary-module
const magicModuleHeader = [0x00, 0x61, 0x73, 0x6d];
const moduleVersion = [0x01, 0x00, 0x00, 0x00];

// https://webassembly.github.io/spec/core/binary/conventions.html#binary-vec
// Vectors are encoded with their length followed by their element sequence
const encodeVector = (data: any[]) => [
  ...unsignedLEB128(data.length),
  ...flatten(data),
];

// https://webassembly.github.io/spec/core/binary/modules.html#code-section
const encodeLocal = (count: number, type: Valtype) => [
  ...unsignedLEB128(count),
  type,
];

// https://webassembly.github.io/spec/core/binary/modules.html#sections
// sections are encoded by their type followed by their vector contents
const createSection = (sectionType: Section, data: any[]) => [
  sectionType,
  ...encodeVector(data),
];
