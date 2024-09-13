(module
  (type (;0;) (func (param i32 i32 i32 i32) (result i32)))
  (type (;1;) (func (param i32) (result i32)))
  (type (;2;) (func))
  (type (;3;) (func (result i32)))
  (type (;4;) (func (param i32 i32) (result i32)))
  (type (;5;) (func (param i32 i32) (result i32)))
  (type (;6;) (func (param i32) (result i32)))
  (import "wasi_snapshot_preview1" "fd_write" (func (;0;) (type 0)))
  (import "wasi_snapshot_preview1" "fd_close" (func (;1;) (type 1)))
  (func (;2;) (type 2))
  (func (;3;) (type 3) (result i32)
    (local i32 i32 i32)
    i32.const 35
    i32.const 34
    call 4
    local.set 0
    i32.const 40
    i32.const 20
    call 5
    local.set 1
    i32.const 10
    local.set 2
    i32.const 100
    call 6
    local.get 0
    i32.add
    local.get 1
    i32.add
    local.get 2
    i32.add
    i32.const 99
    i32.sub
    return)
  (func (;4;) (type 4) (param i32 i32) (result i32)
    (local i32 i32)
    local.get 0
    local.get 1
    i32.add
    return)
  (func (;5;) (type 5) (param i32 i32) (result i32)
    (local i32 i32 i32)
    local.get 1
    local.set 2
    local.get 0
    local.get 2
    i32.sub
    return)
  (func (;6;) (type 6) (param i32) (result i32)
    (local i32)
    local.get 0
    local.get 0
    i32.mul
    return)
  (memory (;0;) 1)
  (export "memory" (memory 0))
  (export "print" (func 2))
  (export "_start" (func 3))
  (export "add" (func 4))
  (export "sub" (func 5))
  (export "square" (func 6)))
