(module
  (type (;0;) (func (param i32 i32 i32 i32) (result i32)))
  (type (;1;) (func (param i32) (result i32)))
  (type (;2;) (func (result i32)))
  (import "wasi_snapshot_preview1" "fd_write" (func (;0;) (type 0)))
  (import "wasi_snapshot_preview1" "fd_close" (func (;1;) (type 1)))
  (func (;2;) (type 2) (result i32)
    i32.const 0
    return)
  (memory (;0;) 1)
  (export "memory" (memory 0))
  (export "_start" (func 2)))
