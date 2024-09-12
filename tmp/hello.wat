(module
  (import "wasi_snapshot_preview1" "fd_write" (func $fd_write (param i32 i32 i32 i32) (result i32)))

  ;; Define a memory with 1 page (64KiB)
  (memory 1)
  (export "memory" (memory 0))

  ;; 9 is the offset to write to
  (data (i32.const 9) "Hello, World!\n")

  (func $main
    i32.const 0  ;; offset
    i32.const 9  ;; value start of the string
    i32.store    ;;

    i32.const 4                  ;; offset
    i32.const 23                 ;; value, the length of the string
    i32.store offset=0 align=2   ;; size_buf_len

    i32.const 1     ;; File descriptor 1 (stdout)
    i32.const 0     ;; Pointer to actual file descriptor
    i32.const 1     ;; Store pointer to message
    i32.const 14    ;; Store length of message
    
    call $fd_write  ;; Call fd_write function

    drop ;; Drop the result of fd_write (not used)
    return
  )

  (export "_start" (func $main))
)