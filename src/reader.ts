import { EOF, IReader, eof } from "./interfaces";

export class Reader implements IReader {
  private readonly _content: string;
  private _cursor: number = 0;
  private _peeked: string | EOF | null = null;

  constructor(content: string) {
    this._content = content;
  }

  next(): string | EOF {
    if (this._peeked) {
      const result = this._peeked;
      this._peeked = null;
      return result;
    }

    return this._internalNext();
  }

  peek(): string | EOF {
    if (!this._peeked) {
      this._peeked = this._internalNext();
    }
    
    return this._peeked;
  }

  private _internalNext(): string | EOF {
    if (this._cursor >= this._content.length) return eof;

    return this._content[this._cursor++];
  }
}
