/* Downloadable cheat sheets. Plain text / markdown-ish so they print and
   paste anywhere. No backticks used, to keep the source template-literal safe. */
window.SHEETS = [

{
  id: "cli",
  icon: "⌨️",
  name: "Go CLI & Toolchain",
  desc: "Every command you'll type, plus env vars, build flags and GODEBUG.",
  tags: ["go build", "go test", "GOOS", "GODEBUG"],
  body:
`GO CLI & TOOLCHAIN CHEAT SHEET
==============================

MODULES   (Minimal Version Selection: the MAX of the required MINIMUMS, never "latest")
  go mod init <module-path>     start a module (creates go.mod)
  go mod tidy                   add missing + remove unused deps
  go mod tidy -diff
  [ ] default.pgo committed next to main (PGO: 2-7% CPU, free)
  [ ] gosec ./... and govulncheck ./... green             fail if go.mod/go.sum are stale (CI, 1.22+)
  go mod download               pre-fetch deps into the module cache
  go mod vendor                 copy deps into ./vendor
  go mod why -m <mod>           explain why a dependency is present
  go get -u=patch ./...         patch-level upgrades only (the safer habit)
  go get toolchain@go1.24.0     upgrade the pinned toolchain
  go mod verify                 re-check the module cache against go.sum
  go mod graph                  print the module dependency graph
  go mod edit -replace a=b      swap a module (local dev)
  go get <pkg>@latest           add / upgrade a dependency
  go get <pkg>@v1.2.3           pin an exact version
  go get <pkg>@none             remove a dependency
  go list -m all                list all modules in the build
  go list -m -u all             show available upgrades
  go clean -modcache            nuke the module cache

BUILD & RUN
  go run .                      compile + run the current package
  # PGO: drop a production CPU profile at ./cmd/app/default.pgo and go build
  # picks it up automatically (1.21+). Typically 2-7% CPU for free.
  go build -pgo=auto ./...      (the default)   |   -pgo=off to disable
  go tool <name>                run a tool declared in go.mod (1.24+)
  go get -tool example.com/cmd/thing
  go run ./cmd/server           run a specific main package
  go build                      binary named after the directory
  go build -o bin/app ./cmd/app
  go build ./...                build everything (no output written)
  go install ./cmd/app          build into $GOPATH/bin
  go install pkg@latest         install a remote tool
  go generate ./...             run //go:generate directives

USEFUL BUILD FLAGS
  -o <file>                     output path
  -race                         enable the race detector
  -ldflags "-s -w"              strip symbols + DWARF (smaller binary)
  -ldflags "-X main.version=1.2.3"   inject a variable at link time
  -gcflags "-m"                 print inlining + escape analysis decisions
  -gcflags "-N -l"              disable optimisation + inlining (debugging)
  -tags prod,integration        enable build tags
  -trimpath                     remove local filesystem paths (reproducible)
  -v                            list packages as they compile
  -x                            print the underlying commands

CROSS COMPILATION
  GOOS=linux  GOARCH=amd64 go build
  GOOS=linux  GOARCH=arm64 go build
  GOOS=darwin GOARCH=arm64 go build
  GOOS=windows GOARCH=amd64 go build -o app.exe
  CGO_ENABLED=0 go build        fully static binary (no libc)
  go tool dist list             every supported GOOS/GOARCH pair

TEST
  go test ./...                 run all tests
  go test -v ./...              verbose
  go test -run 'TestFoo/case'   regex over test and subtest names
  go test -race ./...           race detector
  go test -count=1 ./...        bypass the test result cache
  go test -short ./...          your code honours testing.Short()
  go test -timeout 30s ./...
  go test -cover ./...
  go test -coverprofile=c.out ./... && go tool cover -html=c.out
  go test -bench=. -benchmem    benchmarks with allocation stats
  go test -bench=. -benchtime=3s -count=10
  go test -fuzz=FuzzX -fuzztime=60s
  go test -cpuprofile=cpu.out -memprofile=mem.out
  go test -trace=trace.out

QUALITY
  go fmt ./...                  canonical formatting
  gofmt -l -d .                 list + diff unformatted files
  go vet ./...                  suspicious constructs
  staticcheck ./...             (install separately) deep static analysis
  golangci-lint run             meta-linter
  govulncheck ./...             known CVEs in your dependencies
  go fix ./...                  rewrite deprecated API usage

DOCS & INSPECTION
  go doc fmt.Println            docs for one symbol
  go doc -all strings           every exported symbol in a package
  go doc -src sync.Once         show the source
  go env                        all toolchain settings
  go env GOPATH GOMODCACHE GOCACHE
  go env -w GOPRIVATE=github.com/mycorp/*
  go version -m ./app           module + build info embedded in a binary
  go tool nm ./app              symbol table
  go tool objdump -s main.main ./app
  go tool pprof -http=:8080 cpu.out
  go tool trace trace.out
  go work init ./a ./b          multi-module workspace (1.18+)

RUNTIME ENVIRONMENT VARIABLES
  GOMAXPROCS=4                  max goroutines executing Go code at once
  GOGC=100                      heap growth % before the next GC (off = never)
  GOMEMLIMIT=900MiB             soft memory ceiling (1.19+) — fixes container OOM
  GOTRACEBACK=all|system|crash  detail level in a panic traceback
  GORACE="halt_on_error=1"      race detector options

GODEBUG (diagnostics)
  GODEBUG=gctrace=1             one line per GC
  GODEBUG=schedtrace=1000       scheduler summary every 1000 ms
  GODEBUG=scheddetail=1,schedtrace=1000   per-P / per-M detail
  GODEBUG=inittrace=1           package init timing
  GODEBUG=allocfreetrace=1      every allocation (very loud)
  GODEBUG=http2debug=1          HTTP/2 framing
`
},

{
  id: "devenv",
  icon: "🛠️",
  name: "IDE, Linters & Dev Tooling",
  desc: "Editor setup, gopls config, .golangci.yml, launch.json, Makefile, pre-commit — copy-paste ready.",
  tags: ["VS Code", "gopls", "golangci-lint", "delve", "gofumpt"],
  body:
`IDE, LINTERS & DEV TOOLING CHEAT SHEET
=====================================

EDITOR CHOICE (all of them drive the same gopls)
  VS Code + "Go" extension (golang.go)   free, zero setup, the reference setup
  GoLand                                 paid; best refactoring + debugger + DB tools
  Neovim (nvim-lspconfig + nvim-dap)      fastest, scriptable, bring your own glue
  Zed / Helix / Emacs                     LSP works; less Go-specific wiring
  -> Start with VS Code. The editor is not where your productivity comes from.

ONE-TIME INSTALL
  go install golang.org/x/tools/gopls@latest          language server
  go install github.com/go-delve/delve/cmd/dlv@latest debugger
  go install honnef.co/go/tools/cmd/staticcheck@latest
  go install mvdan.cc/gofumpt@latest                  stricter gofmt
  go install github.com/cweill/gotests/gotests@latest table-test skeletons
  go install github.com/fatih/gomodifytags@latest     struct tag surgery
  go install golang.org/x/tools/cmd/stringer@latest
  go install golang.org/x/vuln/cmd/govulncheck@latest
  brew install golangci-lint graphviz                 (graphviz: pprof -http graphs)
  # In VS Code just run: "Go: Install/Update Tools" and tick everything.

VS CODE  .vscode/settings.json
  {
    "[go]": {
      "editor.defaultFormatter": "golang.go",
      "editor.formatOnSave": true,
      "editor.codeActionsOnSave": { "source.organizeImports": "explicit" },
      "editor.insertSpaces": false
    },
    "go.useLanguageServer": true,
    "go.lintTool": "golangci-lint",
    "go.lintOnSave": "package",
    "go.vetOnSave": "package",
    "go.testFlags": ["-race", "-count=1"],
    "go.coverOnSingleTest": true,
    "gopls": {
      "ui.diagnostic.staticcheck": true,
      "ui.diagnostic.analyses": { "unusedparam": true, "unusedwrite": true, "nilness": true },
      "ui.codelenses": { "test": true, "run_govulncheck": true, "gc_details": true },
      "ui.inlayhint.hints": {
        "assignVariableTypes": true, "compositeLiteralFields": true,
        "constantValues": true, "parameterNames": true, "rangeVariableTypes": true
      },
      "formatting.gofumpt": true,
      "build.buildFlags": ["-tags=integration"]
    }
  }

VS CODE  .vscode/launch.json
  { "version": "0.2.0", "configurations": [
    { "name": "Debug server", "type": "go", "request": "launch", "mode": "debug",
      "program": "\${workspaceFolder}/cmd/server", "args": ["--addr=:8080"],
      "env": { "APP_ENV": "dev" } },
    { "name": "Debug current test", "type": "go", "request": "launch", "mode": "test",
      "program": "\${fileDirname}", "args": ["-test.run", "\${selectedText}", "-test.v"] },
    { "name": "Debug with -race", "type": "go", "request": "launch", "mode": "debug",
      "program": "\${workspaceFolder}/cmd/server", "buildFlags": "-race" },
    { "name": "Attach to container", "type": "go", "request": "attach", "mode": "remote",
      "port": 2345, "host": "127.0.0.1",
      "substitutePath": [{ "from": "\${workspaceFolder}", "to": "/src" }] }
  ]}
  # in the container:  dlv exec --headless --listen=:2345 --api-version=2 /app

NEOVIM (lua sketch)
  require("lspconfig").gopls.setup{
    settings = { gopls = {
      staticcheck = true, gofumpt = true,
      analyses = { unusedparam = true, nilness = true },
      hints = { parameterNames = true, assignVariableTypes = true },
    }},
  }
  -- format + organise imports on save: conform.nvim or none-ls (goimports/gofumpt)
  -- debugging: nvim-dap + leoluz/nvim-dap-go      tests: vim-test / neotest-go

GOPLS TROUBLESHOOTING (in order)
  1. "Go: Restart Language Server"
  2. Is the editor root the directory containing go.mod?   <- #1 cause
  3. Multiple modules in one window -> go work init ./a ./b
  4. Files behind a build tag -> gopls build.buildFlags
  5. gopls version && go version        (mismatched toolchains)
  6. go clean -cache ; read the gopls output pane before guessing

FORMATTING
  gofmt       canonical, ships with Go                     (baseline)
  goimports   gofmt + manage/group imports                 (editor on save)
  gofumpt     stricter superset, still gofmt-compatible     (RECOMMENDED)
  golines     wraps long lines                              (optional)
  CI gate:  test -z "$(gofmt -l .)" || (gofmt -l . && exit 1)
  Go uses TABS for indentation. Do not fight it.

LINTING: THREE LAYERS
  go vet ./...        ships with Go. Low noise. TREAT FINDINGS AS BUGS.
                      printf args, lost cancel, copied locks, bad struct tags
  staticcheck ./...   ~150 deep checks, excellent signal. Install it regardless.
  golangci-lint run   aggregator (vet + staticcheck + ~100 more), cached, for CI

  golangci-lint run --fix
  golangci-lint run --new-from-rev=main     <- how to adopt it on legacy code
  golangci-lint run ./internal/...

.golangci.yml  (v2 reshuffled the schema — the SELECTION is what matters)
  linters:
    enable:
      - errcheck        unchecked errors (highest value of all)
      - govet
      - staticcheck
      - ineffassign     assignments never used
      - unused          dead code
      - errorlint       %v instead of %w, == instead of errors.Is
      - nilerr          "return nil" after err != nil
      - bodyclose       unclosed HTTP response bodies
      - rowserrcheck    missing rows.Err()
      - sqlclosecheck   unclosed Rows/Stmt
      - noctx           HTTP/SQL call with no context
      - contextcheck    non-inherited context
      - copyloopvar     redundant i := i (pre-1.22 habit)
      - gocritic
      - revive          naming + doc comments (golint's successor)
      - misspell
      - gosec           weak crypto, traversal, SQL building
  linters-settings:
    errcheck: { check-type-assertions: true }
    revive:   { rules: [{ name: exported }] }
    nolintlint: { require-explanation: true, require-specific: true }
  issues:
    exclude-rules:
      - { path: _test\\.go, linters: [errcheck, gosec, dupl] }

  DELIBERATELY OFF (these produce argument, not bugs):
    lll, funlen, gocyclo        arbitrary numeric limits
    gochecknoglobals            too blunt
    wsl, nlreturn               whitespace opinions beyond gofmt
    exhaustruct                 fights Go's useful zero values
  Strict on CORRECTNESS, lenient on STYLE.

  Suppress with a reason, never bare:
    //nolint:errcheck // best-effort cleanup; nothing to do on failure

DELVE (dlv)
  dlv debug ./cmd/server -- --config=dev.yaml
  dlv test ./internal/user
  dlv attach <pid>
  dlv core ./app /cores/core.1234
  dlv exec --headless --listen=:2345 --api-version=2 /app     (containers)

  break main.go:42 | b pkg.(*T).Method | condition 1 id == 7
  continue | next | step | stepout | restart
  print x | locals | args | set x = 10
  goroutines          <- every goroutine; the killer feature
  goroutine 18 bt     <- switch and inspect its stack
  stack | frame 2 | threads | regs
  go build -gcflags="all=-N -l"     when the debugger looks confused

CODE GENERATION
  gotests -all -w ./user.go           table-test skeletons
  gomodifytags -file user.go -struct User -add-tags json -transform snakecase
  stringer -type=Status               String() for enums
  impl 'r *Repo' io.ReadWriter        stub methods for an interface
  sqlc generate                       type-safe Go from SQL
  oapi-codegen -generate types,server api.yaml
  buf generate                        Go from .proto
  go generate ./...                   runs //go:generate; COMMIT the output
  1.24+: declare tools in go.mod -> go get -tool X ; go tool X

INNER LOOP
  air  |  wgo run ./cmd/server  |  entr -r go run ./...      live reload
  go test ./... -run TestX -v
  go test -race -count=1 ./...
  make check                          one word that mirrors CI

.editorconfig
  root = true
  [*]
  charset = utf-8
  insert_final_newline = true
  trim_trailing_whitespace = true
  [*.go]
  indent_style = tab
  [*.{yml,yaml,json,md}]
  indent_style = space
  indent_size = 2

Makefile
  .PHONY: fmt lint test run check
  fmt:   ; gofumpt -l -w . && go mod tidy
  lint:  ; go vet ./... && golangci-lint run && govulncheck ./...
  test:  ; go test -race -cover ./...
  run:   ; go run ./cmd/server
  check: fmt lint test

PRE-COMMIT (lefthook.yml)
  pre-commit:
    parallel: true
    commands:
      fmt:  { glob: "*.go", run: "gofumpt -l -w {staged_files}", stage_fixed: true }
      vet:  { run: "go vet ./..." }
      lint: { run: "golangci-lint run --fast" }
  pre-push:
    commands:
      test: { run: "go test -race ./..." }

AI ASSISTANTS IN THE EDITOR
  good at: table tests, struct conversions, boilerplate, explaining stdlib
  watch for: outdated idioms (i := i, interface{}, hand-rolled slices helpers,
             a router for plain method+path routing) and invented APIs
  ground truth is gopls, go build, go vet and a failing test — not confidence
`
},

{
  id: "syntax",
  icon: "📘",
  name: "Syntax Quick Reference",
  desc: "Declarations, types, control flow, functions, structs, interfaces — one page.",
  tags: ["var", "for", "switch", "struct", "interface"],
  body:
`GO SYNTAX QUICK REFERENCE
=========================

THE 25 KEYWORDS
  break    default      func    interface  select
  case     defer        go      map        struct
  chan     else         goto    package    switch
  const    fallthrough  if      range      type
  continue for          import  return     var

DECLARATIONS
  var x int                 zero value
  var x int = 5
  var x = 5                 inferred
  x := 5                    short form (inside functions only)
  var a, b = 1, "two"
  const Pi = 3.14159        untyped constant
  type Celsius float64      named type
  type Handler func(int) error

ZERO VALUES
  numeric            0
  bool               false
  string             ""      (empty, never nil)
  pointer/func/chan  nil
  interface          nil
  slice              nil     (len/cap/range/append all work)
  map                nil     (reads work, WRITES PANIC)
  struct             all fields at their own zero

BASIC TYPES
  bool
  string
  int int8 int16 int32 int64            int is 64-bit on modern platforms
  uint uint8 uint16 uint32 uint64 uintptr
  byte = uint8        rune = int32
  float32 float64     complex64 complex128

CONVERSION (always explicit)
  float64(i)   int(f)   []byte(s)   string(b)   []rune(s)
  strconv.Atoi / Itoa / ParseFloat / ParseBool / FormatInt

IF
  if x > 0 { } else if x < 0 { } else { }
  if v, err := f(); err != nil { }        // v, err scoped to the if/else

FOR (the only loop keyword)
  for i := 0; i < n; i++ { }
  for cond { }                            // while
  for { }                                 // infinite
  for i, v := range slice { }
  for k, v := range m { }                 // ORDER IS RANDOM
  for i, r := range str { }               // i = byte offset, r = rune
  for v := range ch { }                   // until the channel is closed
  for i := range 10 { }                   // 1.22+
  break / continue / break label / continue label

SWITCH (no implicit fallthrough)
  switch x { case 1, 2: ... default: ... }
  switch { case a > b: ... }              // tagless = if/else chain
  switch v := i.(type) { case int: ... }  // type switch
  fallthrough                             // opt in explicitly

FUNCTIONS
  func f(a, b int) int { }
  func f() (int, error) { }
  func f() (n int, err error) { return }  // named results + naked return
  func f(nums ...int) { }                 // variadic -> []int
  f(slice...)                             // spread
  func (r Rect) Area() float64 { }        // value receiver
  func (r *Rect) Scale(f float64) { }     // pointer receiver
  defer f.Close()                         // LIFO, args evaluated now

POINTERS
  p := &x       *p = 5       p := new(int)
  no pointer arithmetic

COMPOSITE TYPES
  [5]int                      array (fixed, value semantics)
  []int                       slice (pointer + len + cap)
  map[string]int
  chan int / chan<- int / <-chan int
  struct{ A int; B string }
  interface{ Method() }
  any = interface{}

STRUCTS
  type T struct { A int; B string }
  t := T{A: 1}          p := &T{A: 1}
  type U struct { T; C int }          // embedded: promotes T's fields+methods
  tag: json:"name,omitempty"  db:"col"  validate:"required"

PACKAGES, IMPORTS & init
  import ( "fmt"  alias "math/rand/v2"  _ "github.com/lib/pq"  . "math" )
    plain | alias (clash) | blank (init side effects only) | dot (avoid)
  import cycles are a COMPILE ERROR -> extract a third package, or move the
  interface to the consumer
  init order: imported packages -> package vars in DEPENDENCY order
              -> every init() -> main()
  func init() {}   no args, no results, several allowed, you cannot call it
  use for: registration, precomputed tables, invariant checks
  NOT for: config, I/O, anything fallible (no way to return an error) or that
           tests may want to skip (init always runs)
  GODEBUG=inittrace=1 ./app      measure startup cost per package

DOC COMMENTS
  // Package user provides …          (ONE file, or doc.go)
  // Create validates u and …          start with the IDENTIFIER's name
  structure gofmt understands (1.19+):
    # Heading      - list item      <tab>indented code block
    [Symbol] links, [net/http.Handler], and  [name]: https://url
  // Deprecated: Use [NewService] instead.
  func ExampleService_Create() { … // Output: created }   <- run by go test
  go doc ./pkg | go doc -all ./pkg | go doc net/http.Handler | go doc -src X

SEMICOLONS
  the scanner inserts one at end of line after an identifier, literal, return,
  break/continue/fallthrough, ++/--, or ) ] }
  -> "{" MUST be on the same line, and "} else {" must be one line
  you only type semicolons to separate clauses: for i := 0; i < n; i++ { }

ALLOCATION: new vs make vs literal
  new(T)            zeroed storage, returns *T. Rare in idiomatic Go.
  make(T, len, cap) slices, maps, channels ONLY — builds the internals
  &T{Field: v}      allocate + initialise; what constructors return
  returning &localVar is fine — escape analysis handles it
  always name fields in struct literals

GENERICS (1.18+)
  func F[T any](v T) T { }
  func F[K comparable, V any](m map[K]V) []K { }
  func Max[T cmp.Ordered](a, b T) T { }
  type Stack[T any] struct { items []T }
  type Num interface { ~int | ~float64 }
  var zero T                          // zero value of a type parameter

fmt — THE FOUR FAMILIES
  Print / Printf / Println          -> stdout
  Sprint / Sprintf / Sprintln       -> string
  Fprint / Fprintf / Fprintln(w,…)  -> any io.Writer  (TESTABLE: pass a Buffer)
  Errorf("ctx: %w", err)            -> error, wrapping the cause
  Appendf(b, …)                     -> append into a []byte (1.19+), no string
  SPACING: Println always inserts spaces + newline. Print/Sprint insert a space
           only between two operands when NEITHER is a string.

FORMATTING VERBS
  %v   default                      %+v  struct WITH field names  (debug default)
  %#v  Go syntax                    %T   the type
  %d   base 10      %b binary       %o octal     %x %X hex    %#x 0xff
  %f   float        %.2f precision  %e scientific            %g compact
  %s   string / Stringer / error    %q  quoted + escaped     %c rune  %U U+0041
  %t   bool         %p pointer      %%  literal percent
  %w   wrap an error (fmt.Errorf only)
  width/flags: %6d  %-6s  %06d  %+d  %8.3f  %-12s  %*d(width from an arg)
  bytes: %s "hi" | %x 6869 | "% x" 68 69
  map printing SORTS keys (1.12+) -> deterministic, golden-test safe
  nil: %v on a nil error/pointer prints <nil>

  FORMAT ERRORS are in-band, not returned:
    %!d(string=hello)   wrong verb      %!d(MISSING)   too few args
    %!(EXTRA int=2)     too many        %!z(int=1)     unknown verb
    -> go vet catches all of these, including in your own ...f wrappers

MAKE YOUR TYPES PRINT
  type Stringer interface { String() string }     // %v and %s route through it
  type error    interface { Error() string }      // wins over String()
  fmt.Formatter   full control    fmt.GoStringer   controls %#v
  //go:generate stringer -type=Status             // enums: prints "Active", not 1
  TRAP: using %v/%s on the receiver INSIDE String() recurses forever.
        Convert first: fmt.Sprintf("%s", string(m))
  fmt recovers panics in String()/Error() -> %!v(PANIC=…)

  Hot paths: strconv.Itoa > fmt.Sprintf (reflection + boxing + heap escape).
  Services: use log/slog, not fmt. Secrets: give the type a redacting String().
`
},

{
  id: "collections",
  icon: "🗂️",
  name: "Slices, Maps & Strings",
  desc: "Every operation plus the internals and aliasing traps.",
  tags: ["append", "copy", "Builder", "comma-ok"],
  body:
`SLICES, MAPS & STRINGS CHEAT SHEET
==================================

SLICE INTERNALS
  struct { array *T; len int; cap int }     3 words, a VIEW over an array
  append: writes in place while len < cap; otherwise allocates a bigger
  array (~2x small, ~1.25x large) and copies. ALWAYS use the return value.

SLICE OPERATIONS
  var s []int                       nil: len 0, cap 0
  s := []int{1,2,3}
  s := make([]int, 5)               len 5, cap 5, zeroed
  s := make([]int, 0, 100)          PREALLOCATE when the size is known
  len(s)  cap(s)
  s = append(s, v)
  s = append(s, v1, v2)
  s = append(s, other...)
  n := copy(dst, src)               copies min(len(dst), len(src))
  s[low:high]                       low included, high excluded, SHARES memory
  s[low:high:max]                   three-index: also caps the result
  s[:]  s[:n]  s[n:]

  delete i, order not preserved:    s[i] = s[len(s)-1]; s = s[:len(s)-1]
  delete i, order preserved:        s = append(s[:i], s[i+1:]...)
  insert v at i:                    s = append(s[:i], append([]int{v}, s[i:]...)...)
  clear:                            s = s[:0]          (keeps capacity)
  independent copy:                 slices.Clone(s)    (or append([]T(nil), s...))

  TRAPS
   - sub-slices alias the parent: writing through one changes the other
   - huge[:10] keeps the WHOLE backing array alive -> clone small views
   - a slice of structs copies on range: use the index to mutate in place

slices PACKAGE (1.21+)
  Contains, Index, IndexFunc, ContainsFunc
  Sort, SortFunc, SortStableFunc, IsSorted
  Reverse, Max, Min, MaxFunc, MinFunc
  Clone, Equal, EqualFunc, Compare
  BinarySearch, BinarySearchFunc
  Insert, Delete, Replace, Compact, CompactFunc, Grow, Clip

MAPS
  m := make(map[string]int)
  m := make(map[string]int, 1000)   preallocate
  m := map[string]int{"a": 1}
  var m map[string]int              nil: reads OK, WRITES PANIC
  m[k] = v
  v := m[k]                         zero value if absent, no error
  v, ok := m[k]                     COMMA-OK: the only presence check
  delete(m, k)                      no-op if absent
  len(m)
  clear(m)                          1.21+
  for k, v := range m { }           ORDER IS RANDOMISED

  set:                              map[string]struct{}  (values cost 0 bytes)
  deterministic iteration:          collect keys -> sort.Strings -> loop
  nested:                           map[string]map[string]int (init inner maps!)

  RULES
   - &m[k] is ILLEGAL (growth moves entries). Store pointers as values instead.
   - maps are NOT concurrency-safe: use sync.RWMutex or sync.Map
   - key types must be comparable (no slices, maps or funcs as keys)

maps PACKAGE (1.21+)
  Keys, Values (ITERATORS since 1.23), All, Collect, Insert, Clone, Equal, DeleteFunc

ITERATORS (1.23+)  -- see also the Version Timeline sheet
  type Seq[V any]     func(yield func(V) bool)
  type Seq2[K,V any]  func(yield func(K,V) bool)
  write one:   return func(yield func(V) bool) {
                   for _, v := range src { if !yield(v) { return } }   // MUST check
               }
  slices.All(s) Values(s) Backward(s) Chunk(s,n) Collect(seq) Sorted(seq) AppendSeq
  maps.Keys(m) Values(m) All(m) Collect(seq2) Insert(m,seq2)
  strings.Lines(t) SplitSeq(t,sep) FieldsSeq(t)          (1.24+, no []string alloc)
  deterministic map order:  for _, k := range slices.Sorted(maps.Keys(m))
  pull mode:  next, stop := iter.Pull(seq); defer stop()
  prefer []T for small in-memory data; a Seq is single-use and not indexable

STRINGS
  immutable, UTF-8 bytes; the header is pointer + len
  len(s)                            BYTES, not characters
  utf8.RuneCountInString(s)         characters
  s[i]                              one BYTE
  for i, r := range s               i = byte offset, r = rune
  []rune(s)                         character-indexable (allocates)
  []byte(s) / string(b)             each conversion COPIES
  string(65) == "A"                 NOT "65" — use strconv.Itoa

  strings.Builder                   the ONLY way to concatenate in a loop
    var sb strings.Builder; sb.Grow(n); sb.WriteString("x"); sb.String()

strings PACKAGE
  Contains, ContainsAny, ContainsRune, HasPrefix, HasSuffix
  Index, LastIndex, IndexByte, Count
  Split, SplitN, Fields, Join
  Replace, ReplaceAll
  ToUpper, ToLower, ToTitle, EqualFold
  Trim, TrimSpace, TrimLeft, TrimRight, TrimPrefix, TrimSuffix
  Repeat, Map, Title(deprecated -> x/text/cases)
  NewReader, NewReplacer, Cut, CutPrefix, CutSuffix

  bytes has the same API for []byte — prefer it to avoid conversions.
`
},

{
  id: "concurrency",
  icon: "⚡",
  name: "Concurrency Patterns",
  desc: "Channel semantics table, select, sync primitives, context, and ready-made patterns.",
  tags: ["goroutine", "channel", "select", "context", "errgroup"],
  body:
`CONCURRENCY CHEAT SHEET
=======================

GOROUTINES
  go f()                      go func(x int){ }(x)
  ~2 KB initial stack, grown by copying; multiplexed onto OS threads
  runtime.NumGoroutine()  runtime.NumCPU()  runtime.GOMAXPROCS(0)
  main returning KILLS every goroutine
  a goroutine blocked forever is a LEAK — always know how each one ends

CHANNELS
  ch := make(chan T)          unbuffered: send blocks until a receiver is ready
  ch := make(chan T, n)       buffered: send blocks only when full
  ch <- v                     send
  v := <-ch                   receive
  v, ok := <-ch               ok == false when closed AND drained
  close(ch)                   sender closes, once
  for v := range ch { }       receive until closed
  chan<- T / <-chan T         send-only / receive-only (document intent)
  make(chan struct{})         signal-only channel, 0 bytes per value

                 nil channel    open            closed
  send           block forever  proceed/block   PANIC
  receive        block forever  proceed/block   zero value, ok=false
  close          PANIC          ok              PANIC
  len/cap        0              queued/capacity queued/capacity

SELECT
  select {
  case v := <-ch1:            ...
  case ch2 <- v:              ...
  case <-time.After(d):       timeout
  case <-ctx.Done():          cancellation -> return ctx.Err()
  default:                    makes select NON-BLOCKING
  }
  ties are resolved at RANDOM
  set a channel var to nil to DISABLE its case

SYNC
  var wg sync.WaitGroup
    wg.Add(1) before starting; defer wg.Done() inside; wg.Wait()
    1.25+: wg.Go(func(){ ... }) does the Add/Done for you
  var mu sync.Mutex            mu.Lock() / defer mu.Unlock()
  var mu sync.RWMutex          mu.RLock() / mu.RUnlock() (read-heavy only)
  var once sync.Once           once.Do(func(){ })
  sync.OnceValue/OnceValues/OnceFunc (1.21+)  lazy singleton, one line
  sync.Map                     only for high-contention disjoint-key workloads
  sync.Pool                    reuse allocations: Get() / Put()
  sync.Cond                    wait for a condition (rare)

ATOMICS (1.19+ typed API)
  var n atomic.Int64;  n.Add(1); n.Load(); n.Store(5)
  n.CompareAndSwap(old, new); n.Swap(v)
  atomic.Bool, Int32, Uint64, Pointer[T], Value

CONTEXT
  ctx := context.Background()                 root (main)
  ctx := context.TODO()                       placeholder while plumbing
  ctx, cancel := context.WithCancel(parent)
  ctx, cancel := context.WithTimeout(parent, 5*time.Second)
  ctx, cancel := context.WithDeadline(parent, t)
  defer cancel()                              ALWAYS
  <-ctx.Done()        ctx.Err()               Canceled | DeadlineExceeded
  context.WithValue(ctx, key, v)              request-scoped metadata only
  RULES: first parameter, named ctx; never store in a struct; never pass nil

PATTERNS
  Wait for N
    for _, x := range xs { wg.Add(1); go func(){ defer wg.Done(); f(x) }() }
    wg.Wait()

  Worker pool
    for i := 0; i < n; i++ { go func(){ for j := range jobs { out <- f(j) } }() }

  Bounded concurrency (semaphore)
    sem := make(chan struct{}, 10)
    sem <- struct{}{} ; go func(){ defer func(){ <-sem }(); work() }()

  Fan-out with error + cancellation (golang.org/x/sync/errgroup)
    g, ctx := errgroup.WithContext(ctx); g.SetLimit(10)
    g.Go(func() error { return f(ctx) })
    err := g.Wait()

  Timeout one operation
    select { case r := <-done: use(r); case <-time.After(d): return ErrTimeout }

  Pipeline
    gen -> stage1 -> stage2 ; each stage ranges its input and closes its output

  Non-blocking send (load shedding)
    select { case q <- job: default: return ErrQueueFull }

  Rate limit
    lim := time.NewTicker(100*time.Millisecond); defer lim.Stop()
    for range lim.C { go work() }
    (or golang.org/x/time/rate for token buckets)

  Graceful shutdown
    ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
    <-ctx.Done(); srv.Shutdown(timeoutCtx)

DEBUGGING
  go test -race ./...      go run -race .
  curl 'localhost:6060/debug/pprof/goroutine?debug=2'    all stacks
  go tool trace trace.out                                 timelines
  GODEBUG=schedtrace=1000

MEMORY MODEL
  A channel send happens-before the corresponding receive completes.
  A mutex Unlock happens-before a subsequent Lock.
  Without such a synchronisation point there is NO visibility guarantee.
  "Don't communicate by sharing memory; share memory by communicating."
`
},

{
  id: "runtime",
  icon: "🔬",
  name: "Runtime, GC & Memory",
  desc: "GMP scheduler, GC phases, allocator tiers, tuning knobs and diagnostics.",
  tags: ["GOGC", "GOMEMLIMIT", "pprof", "escape analysis"],
  body:
`RUNTIME, GC & MEMORY CHEAT SHEET
================================

SCHEDULER (M:N, work-stealing)
  G  goroutine   task: stack + PC + status, ~2 KB         thousands..millions
  M  machine     OS thread; only an M runs code           on demand (cap 10000)
  P  processor   run queue + context; a token to run Go   GOMAXPROCS (=NumCPU)

  each P: lock-free 256-slot local queue + 1-slot runnext fast path
  empty queue -> global queue -> netpoll -> STEAL half of a random P's queue
  channel/mutex/sleep block: the goroutine PARKS, the M keeps its P
  syscall block: after ~20us the P is HANDED OFF to another M
  preemption: asynchronous, signal-based since 1.14, ~10 ms slices

  GODEBUG=schedtrace=1000  /  scheddetail=1

GARBAGE COLLECTOR
  concurrent, tri-colour, mark-and-sweep, write barrier
  NON-generational, NON-compacting (objects never move)

  WHITE = unproven    GREY = reachable, unscanned    BLACK = scanned
  1. STW #1 (~10-100us): enable write barrier, scan stacks + globals -> GREY
  2. MARK concurrent (~25% of CPU): grey -> black, greying children
     write barrier greys any white object stored into a black one
  3. STW #2 (~10-100us): mark termination
  4. SWEEP concurrent + lazy: reclaim white spans as allocation demands

  Pause time is sub-millisecond and INDEPENDENT of heap size.
  GC cost scales with the number of live POINTER-BEARING objects, not bytes.

TUNING
  GOGC=100            default: collect when heap = 2x live data
  GOGC=200            half as many GCs, ~2x memory
  GOGC=off            never collect (benchmarks / short batch jobs)
  GOMEMLIMIT=900MiB   soft ceiling (1.19+) — the fix for container OOM kills
  common production:  GOGC=off + GOMEMLIMIT=<~80% of the container limit

  debug.SetGCPercent(200)
  debug.SetMemoryLimit(900 << 20)
  runtime.GC()                   force a blocking collection (tests only)
  debug.FreeOSMemory()           return free pages to the OS now

  GODEBUG=gctrace=1
   gc 7 @0.251s 3%: 0.012+1.8+0.009 ms clock, ..., 12->13->6 MB, 13 MB goal, 8 P
                     ^STW  ^mark ^STW            ^before->peak->live  ^next target

ALLOCATOR (TCMalloc-style, three tiers)
  mcache    per-P, LOCK-FREE  -> the fast path, a few nanoseconds
  mcentral  per size class, shared, locked -> refills mcaches with spans
  mheap     global; takes 64 MB arenas from the OS

  ~68 size classes (8,16,24,32,48,64,...); requests round up; <=12% waste
  spans are 8 KB pages dedicated to one size class
  TINY  <16 B pointer-free: combined into one 16 B block
  SMALL <=32 KB: from the per-P mcache
  LARGE >32 KB: dedicated spans straight from mheap
  pointer-free spans are NEVER SCANNED by the GC
  -> []byte is vastly cheaper to collect than []*T of the same size

STACK vs HEAP
  the COMPILER decides, via ESCAPE ANALYSIS. new() does not mean heap.
  go build -gcflags="-m" .            (-m -m for more detail)

  escapes when:
    returning a pointer to a local
    stored into an escaping struct/slice/map
    passed to any/interface{} (fmt.Println does this)
    captured by a closure that outlives the call
    a size not known at compile time

  goroutine stack: 2 KB, grows by allocating + copying + rewriting pointers
  max 1 GB on 64-bit -> infinite recursion gives "stack overflow", not a segfault

REDUCING ALLOCATIONS
  1. measure:  go test -bench=. -benchmem   (B/op, allocs/op)
  2. preallocate: make([]T, 0, n), make(map[K]V, n), sb.Grow(n)
  3. reuse buffers: sync.Pool, bytes.Buffer + Reset
  4. avoid any/interface{} on hot paths (boxing forces an escape)
  5. strings.Builder over +=; strconv over fmt.Sprintf
  6. pass small structs by value; pointers only for large ones
  7. fewer pointers per object = cheaper marking
  8. field order affects struct size (alignment): group by size, largest first

INSPECTION
  var ms runtime.MemStats; runtime.ReadMemStats(&ms)
    ms.HeapAlloc  HeapObjects  NumGC  PauseTotalNs  StackInuse  Sys
  import _ "net/http/pprof"   then (bind to localhost ONLY):
    go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30   CPU
    go tool pprof http://localhost:6060/debug/pprof/heap                 live heap
    go tool pprof http://localhost:6060/debug/pprof/allocs               all allocs
    curl 'localhost:6060/debug/pprof/goroutine?debug=2'                  all stacks
    go tool pprof .../mutex   .../block
  go tool trace trace.out      scheduler latency, GC, syscalls, per-goroutine
`
},

{
  id: "stdlib",
  icon: "📚",
  name: "Standard Library Essentials",
  desc: "net/http, json, sql, slog, time, io, os, testing — the calls you actually make.",
  tags: ["net/http", "json", "sql", "slog"],
  body:
`STANDARD LIBRARY ESSENTIALS
===========================

ERRORS
  errors.New("msg")                        fmt.Errorf("ctx: %w", err)
  errors.Is(err, ErrSentinel)              compare through the wrap chain
  errors.As(err, &target)                  extract a concrete type
  errors.Unwrap(err)                       errors.Join(e1, e2)
  implement Error() string, and Unwrap() error to stay in the chain
  NEVER == across a wrap; NEVER return a typed nil pointer as error

net/http SERVER (1.22+ routing)
  mux := http.NewServeMux()
  mux.HandleFunc("GET /users/{id}", h)     r.PathValue("id")
  mux.HandleFunc("POST /users", h)
  mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServer(dir)))
  srv := &http.Server{
      Addr: ":8080", Handler: mux,
      ReadHeaderTimeout: 5*time.Second,    // ALWAYS set timeouts
      ReadTimeout: 15*time.Second, WriteTimeout: 15*time.Second,
      IdleTimeout: 60*time.Second,
  }
  srv.ListenAndServe()  /  srv.Shutdown(ctx)
  middleware: func(next http.Handler) http.Handler { ... }

  request:  r.Method r.URL.Path r.URL.Query().Get("q") r.Header.Get("X")
            r.Context()  r.Body (always close/limit)  r.FormValue
            http.MaxBytesReader(w, r.Body, 1<<20)
  response: w.Header().Set(...) THEN w.WriteHeader(code) THEN write body
            http.Error(w, msg, code)   http.Redirect(w, r, url, code)

net/http CLIENT
  client := &http.Client{Timeout: 10 * time.Second}   // never the zero Client
  req, _ := http.NewRequestWithContext(ctx, "GET", url, body)
  resp, err := client.Do(req)
  defer resp.Body.Close()                              // ALWAYS, or you leak conns
  io.ReadAll(resp.Body)  /  json.NewDecoder(resp.Body).Decode(&v)
  resp.StatusCode                                      // non-2xx is NOT an error

encoding/json
  json.Marshal(v) / MarshalIndent(v, "", "  ") / Unmarshal(b, &v)
  json.NewEncoder(w).Encode(v)   json.NewDecoder(r).Decode(&v)
  dec.DisallowUnknownFields()    dec.UseNumber()
  tags: json:"name"  json:"name,omitempty"  json:"-"  json:"name,omitzero"
    omitempty: omits "", 0, false, nil, empty map/slice -- but NOT time.Time{}
    omitzero (1.24+): omits anything equal to the type's zero value. Usually right.
    pointer field: the only way to distinguish "absent" from "present but zero"
  unknown shapes -> map[string]any (numbers become float64!)
  custom: implement MarshalJSON / UnmarshalJSON

log/slog (1.21+)
  slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
  slog.Info("msg", "key", val, "n", 1)   slog.Error("msg", "err", err)
  log := slog.With("request_id", id)     slog.Debug / Warn
  levels: slog.LevelDebug/Info/Warn/Error via &slog.HandlerOptions{Level: ...}

database/sql
  db, _ := sql.Open("postgres", dsn)     // LAZY — PingContext to verify
  db.SetMaxOpenConns(25) SetMaxIdleConns(25) SetConnMaxLifetime(5*time.Minute)
  db.QueryRowContext(ctx, q, args...).Scan(&a, &b)
  errors.Is(err, sql.ErrNoRows)
  rows, _ := db.QueryContext(...); defer rows.Close()
  for rows.Next() { rows.Scan(...) }; if err := rows.Err(); err != nil { }
  db.ExecContext(ctx, q, args...)  -> res.RowsAffected() / LastInsertId()
  tx, _ := db.BeginTx(ctx, nil); defer tx.Rollback(); tx.Commit()
  placeholders only ($1 / ?) — never fmt.Sprintf a query

time
  time.Now()  time.Since(start)  time.Until(deadline)
  time.Second time.Millisecond   5*time.Minute
  t.Add(d) t.Sub(t2) t.Before/After/Equal  t.Unix() t.UTC()
  t.Format("2006-01-02 15:04:05")          // the reference layout, not %Y
  time.Parse(layout, s)  time.ParseDuration("1h30m")
  time.Sleep(d)  time.After(d)  time.Tick(d)
  tk := time.NewTicker(d); defer tk.Stop()
  tm := time.NewTimer(d);  tm.Stop() / tm.Reset(d)

os / io / bufio
  os.ReadFile(path) / os.WriteFile(path, b, 0644)
  f, _ := os.Open(p) / os.Create(p) / os.OpenFile(p, flags, perm); defer f.Close()
  os.Getenv / LookupEnv / Setenv   os.Args   os.Exit(1)
  os.MkdirAll  os.Remove  os.RemoveAll  os.Rename  os.Stat
  root, _ := os.OpenRoot(dir); root.Open(userName)   // 1.24+: traversal-proof
  io.Copy(dst, src)  io.ReadAll(r)  io.WriteString(w, s)
  io.LimitReader  io.MultiWriter  io.TeeReader  io.Discard
  sc := bufio.NewScanner(f); for sc.Scan() { sc.Text() }; sc.Err()
    (sc.Buffer(buf, max) for lines over 64 KB)
  w := bufio.NewWriter(f); defer w.Flush()

CLI
  flag.String/Int/Bool/Duration("name", def, "usage"); flag.Parse(); flag.Args()
  embed:  //go:embed templates/*  +  var assets embed.FS

OTHER WORTH KNOWING
  sort.Slice / SearchInts            (slices.Sort is usually better now)
  regexp.MustCompile  re.FindStringSubmatch  re.ReplaceAllString
  text/template  html/template (auto-escaping — use this for HTML)
  crypto/rand (secrets) vs math/rand/v2 (simulation)
  crypto/sha256  crypto/hmac  golang.org/x/crypto/bcrypt (passwords)
  net/url  net  encoding/csv  encoding/base64  compress/gzip
  net/http/httptest  reflect  unicode/utf8  math  math/big
`
},

{
  id: "testing",
  icon: "🧪",
  name: "Testing & Debugging",
  desc: "Unit, table-driven, integration, fuzz and benchmark recipes, plus pprof and delve commands.",
  tags: ["go test", "httptest", "fuzz", "pprof", "delve"],
  body:
`TESTING & DEBUGGING CHEAT SHEET
==============================

THE TEST PYRAMID IN GO
  unit          pure functions, domain logic. No I/O. Milliseconds. MOST of these.
  component     one package + fakes (httptest, in-memory store). Fast.
  integration   real Postgres/Redis via Docker or testcontainers. Guard with -short.
  end-to-end    the built binary or container, driven over HTTP. A FEW, for the
                critical paths only. Slow and the first to go flaky.
  contract      golden files / OpenAPI / protobuf compatibility checks.

FILE & NAME RULES
  foo_test.go              compiled only by go test
  package foo              internal test: can touch unexported identifiers
  package foo_test         external test: only the public API (better default)
  func TestXxx(t *testing.T)
  func BenchmarkXxx(b *testing.B)
  func FuzzXxx(f *testing.F)
  func Example()           compiled, and run if it has an "// Output:" comment
  func TestMain(m *testing.M)   package-level setup/teardown
  testdata/                ignored by the go tool — fixtures and golden files live here

TABLE-DRIVEN TEST (the default shape)
  tests := []struct{ name string; in, want string; wantErr bool }{
      {"empty", "", "", true},
      {"simple", "a", "A", false},
  }
  for _, tt := range tests {
      t.Run(tt.name, func(t *testing.T) {
          got, err := F(tt.in)
          if (err != nil) != tt.wantErr { t.Fatalf("err = %v, wantErr %v", err, tt.wantErr) }
          if got != tt.want { t.Errorf("got %q, want %q", got, tt.want) }
      })
  }

testing API
  t.Errorf(...)      fail, keep going
  t.Fatalf(...)      fail, stop this test now
  t.Helper()         report failures at the CALLER's line
  t.Cleanup(fn)      teardown, LIFO, runs even on failure
  t.TempDir()        auto-removed directory
  t.Setenv(k, v)     restored afterwards (incompatible with t.Parallel)
  t.Parallel()       run concurrently with other parallel tests
  t.Skip / t.Skipf   skip; pair with testing.Short()
  t.Log / t.Logf     shown with -v or on failure
  t.Context()        1.24+: a context cancelled at test end

FAKES — no mocking library needed
  // declare the interface in the CONSUMER, with only the methods you call
  type Store interface { Get(context.Context, int) (*User, error) }
  type fakeStore struct{ getFn func(context.Context, int) (*User, error) }
  func (f fakeStore) Get(c context.Context, i int) (*User, error) { return f.getFn(c, i) }

HTTP TESTING
  rec := httptest.NewRecorder()
  req := httptest.NewRequest("GET", "/users/1", nil)
  mux.ServeHTTP(rec, req)
  rec.Code; rec.Body.String(); rec.Header()

  srv := httptest.NewServer(handler)       // real network, real client path
  defer srv.Close()
  resp, _ := http.Get(srv.URL + "/health")

  srv := httptest.NewTLSServer(h); client := srv.Client()
  // fake an UPSTREAM dependency the same way, then inject srv.URL as its base URL

CONCURRENCY TESTS WITHOUT SLEEPS  (testing/synctest: 1.24 experiment, 1.25 stable)
  synctest.Test(t, func(t *testing.T) {
      go worker()                  // runs in an isolated "bubble"
      synctest.Wait()              // block until every bubble goroutine is blocked
      // the clock JUMPS when all goroutines are blocked: a 30s timeout is instant
  })
  rules: no real I/O in the bubble, no channels shared with the outside
  no synctest? inject a Clock interface. Never time.Sleep to "let it finish".

GOLDEN FILES
  var update = flag.Bool("update", false, "update golden files")
  if *update { os.WriteFile("testdata/x.golden", got, 0644) }
  want, _ := os.ReadFile("testdata/x.golden")
  // run: go test ./... -update   then review the diff in git

INTEGRATION (testcontainers-go)
  func TestMain(m *testing.M) {
      if testing.Short() { os.Exit(m.Run()) }
      ctr, _ := postgres.Run(ctx, "postgres:16", postgres.WithDatabase("test"))
      dsn, _ := ctr.ConnectionString(ctx)
      migrateUp(dsn); testDSN = dsn
      code := m.Run(); ctr.Terminate(ctx); os.Exit(code)
  }
  // every test gets its own transaction or its own schema -> safe to parallelise

FUZZING
  func FuzzParse(f *testing.F) {
      f.Add("seed")                       // seed corpus
      f.Fuzz(func(t *testing.T, s string) {
          out, err := Parse(s); if err != nil { return }
          if Format(out) != s { t.Errorf("round trip %q", s) }   // an INVARIANT
      })
  }
  go test -fuzz=FuzzParse -fuzztime=60s
  // crashers are saved to testdata/fuzz/ and become permanent regression tests

BENCHMARKS
  // MODERN (1.24+): setup stays untimed, and the compiler won't delete the work
  func BenchmarkX(b *testing.B) {
      data := setup()
      for b.Loop() { F(data) }
  }
  // CLASSIC (still everywhere)
  func BenchmarkOld(b *testing.B) {
      data := setup(); b.ResetTimer()
      for i := 0; i < b.N; i++ { sink = F(data) }   // assign, or DCE deletes it
  }
  b.ReportAllocs(); b.SetBytes(n); b.RunParallel(...); b.StopTimer()/StartTimer()

  go test -bench=. -benchmem -benchtime=3s -count=10 > new.txt
  benchstat old.txt new.txt        # statistically meaningful deltas

COMMANDS
  go test ./...                      go test -v -run 'TestX/sub' ./pkg
  go test -race ./...                go test -count=1 ./...     (defeat the cache)
  go test -short ./...               go test -timeout 30s ./...
  go test -cover ./... ; go test -coverprofile=c.out ./... && go tool cover -html=c.out
  go test -coverpkg=./... ./...      cross-package coverage
  go test -failfast -shuffle=on ./...
  go test -json ./... | tparse       nicer output in CI
  go vet ./... ; staticcheck ./... ; golangci-lint run

PROFILING
  go test -bench=. -cpuprofile=cpu.out -memprofile=mem.out -blockprofile=b.out
  go tool pprof -http=:8080 cpu.out            # flame graph
  (pprof) top20 | list Func | web | peek Func
  import _ "net/http/pprof"                    # bind to localhost ONLY
    /debug/pprof/profile?seconds=30   CPU
    /debug/pprof/heap                 live heap     ?gc=1 to force a GC first
    /debug/pprof/allocs               all allocations
    /debug/pprof/goroutine?debug=2    EVERY stack — fastest leak hunt
    /debug/pprof/mutex  /block        contention
  go test -trace=t.out && go tool trace t.out   # scheduler + latency timelines

DEBUGGING
  dlv debug ./cmd/server -- --flag       dlv test ./pkg      dlv attach <pid>
    break main.go:42 / b pkg.Func    continue / next / step / stepout
    print x / locals / args / goroutines / goroutine N bt / stack
  GOTRACEBACK=all                        full stacks on panic
  kill -QUIT <pid>                       dump all goroutine stacks and exit
  GODEBUG=gctrace=1,schedtrace=1000      runtime behaviour
  go build -gcflags="-N -l"              disable optimisation+inlining for dlv
  go build -gcflags="-m"                 escape analysis decisions

WHAT TO TEST
  behaviour at boundaries, not implementation details
  error paths (they're where the bugs live), not just the happy path
  concurrency with -race and >1 goroutine in the test itself
  every bug you fix gets a test FIRST — that's the regression suite
  skip: trivial getters, generated code, and chasing a coverage number
`
},

{
  id: "production",
  icon: "🚢",
  name: "Production Readiness Checklist",
  desc: "Pre-launch checklist plus Dockerfile, CI, timeouts, metrics and shutdown recipes.",
  tags: ["docker", "CI", "timeouts", "SLO", "shutdown"],
  body:
`GO PRODUCTION READINESS CHECKLIST
=================================

CONFIG & SECRETS
  [ ] all config from env vars (or flags); ONE artifact for every environment
  [ ] validated at STARTUP — a missing value refuses to boot, not a 3am 500
  [ ] no global config var; passed down explicitly from main
  [ ] secrets from a secret store, never in source, images, or logs
  [ ] secret fields wrapped in a type whose String() returns "[REDACTED]"
  [ ] no "if env == prod" branches in business logic

BUILD
  [ ] CGO_ENABLED=0 -trimpath -ldflags "-s -w"
  [ ] version/commit/date injected with -X and exposed at /version
  [ ] multi-stage Dockerfile; go.mod+go.sum copied before the source (layer cache)
  [ ] final image: distroless or scratch, USER nonroot, read-only root fs
  [ ] image scanned; deployed BY DIGEST, never :latest
  [ ] cross-compile smoke test in CI

RUNTIME LIMITS
  [ ] GOMEMLIMIT set to ~80% of the container memory limit
  [ ] GOMAXPROCS cgroup-aware (Go 1.25+, or go.uber.org/automaxprocs)
  [ ] memory and CPU requests/limits actually set in the orchestrator
  [ ] goroutine count bounded everywhere (worker pools, semaphores, SetLimit)

TIMEOUTS  (the highest-value section on this page)
  [ ] http.Server: ReadHeaderTimeout, ReadTimeout, WriteTimeout, IdleTimeout
  [ ] http.Client: Timeout + Transport (MaxIdleConnsPerHost > default 2)
  [ ] every outbound call takes a ctx with a deadline
  [ ] db.SetMaxOpenConns / SetMaxIdleConns / SetConnMaxLifetime
  [ ] downstream budgets SMALLER than your inbound budget
  [ ] SSE/websocket handlers exempted via per-connection write deadlines

RESILIENCE
  [ ] retries ONLY on idempotent ops + transient errors (429/502/503/504/timeout)
  [ ] exponential backoff WITH FULL JITTER, bounded attempts, at ONE layer
  [ ] circuit breaker per external dependency
  [ ] bulkheads: per-dependency concurrency caps
  [ ] rate limiting (x/time/rate) and 429 responses
  [ ] bounded queues that shed load with 503 instead of growing
  [ ] panic-recovery middleware at the request boundary
  [ ] every goroutine has a defined exit path; recover inside long-lived ones

DATA
  [ ] migrations versioned, run as a SEPARATE deploy step, not at server start
  [ ] every migration backward compatible with the currently running version
  [ ] column drops/renames split across two releases
  [ ] large backfills batched outside the migration
  [ ] parameterised queries only; no fmt.Sprintf into SQL
  [ ] rows.Err() checked after every iteration loop
  [ ] backups exist AND a restore has actually been tested

OBSERVABILITY
  [ ] structured JSON logs to stdout, level-filtered, one event per line
  [ ] request/correlation ID on every log line and returned in a header
  [ ] no PII, passwords or tokens in logs; errors logged ONCE
  [ ] RED metrics: rate, errors, duration histogram, labelled by ROUTE PATTERN
  [ ] low-cardinality labels only (never user ID, raw URL, or error text)
  [ ] runtime metrics: goroutines, heap, GC pause, DB pool waits, queue depth
  [ ] tracing at the edges: otelhttp in + out, DB instrumented, sampled
  [ ] /metrics and /debug/pprof on an INTERNAL admin port only
  [ ] dashboards + alerts on SLO burn rate, not on CPU

HEALTH & LIFECYCLE
  [ ] /healthz: cheap, dependency-FREE (failing it restarts the process)
  [ ] /readyz: checks dependencies with a short timeout
  [ ] graceful shutdown order:
        SIGTERM -> fail readiness -> sleep ~3s for LB deregistration
        -> srv.Shutdown(ctx) -> drain workers -> close pools -> flush telemetry
  [ ] total shutdown under the platform grace period (K8s default 30s)
  [ ] verified: a rolling restart under load drops ZERO requests
  [ ] stateless process: safe to kill at any moment, horizontally scalable

SECURITY
  [ ] TLS terminated (and HSTS); no plaintext internal hops you can avoid
  [ ] all input validated; request bodies capped (http.MaxBytesReader)
  [ ] authn + authz on every mutating route; authz checked per RESOURCE
  [ ] html/template (auto-escaping) for HTML; never text/template
  [ ] passwords: bcrypt/argon2. Tokens/IDs: crypto/rand, never math/rand
  [ ] SSRF defence on any user-supplied URL (block private/link-local ranges)
  [ ] govulncheck in CI; dependencies updated on a schedule
  [ ] 5xx responses leak nothing — return a request ID, log the detail
  [ ] security headers; CORS explicitly configured, not wildcarded

CI GATES
  [ ] gofmt -l . is empty
  [ ] go vet ./...
  [ ] go test -race ./... (incl. integration tests against real dependencies)
  [ ] golangci-lint / staticcheck
  [ ] govulncheck ./...
  [ ] go mod tidy -diff
  [ ] container build + vulnerability scan on release

OPERATIONAL READINESS
  [ ] runbook: what each alert means and the first three things to check
  [ ] rollback procedure tested (and it's a digest change, not a rebuild)
  [ ] feature flags / kill switch for anything risky; stale flags deleted
  [ ] load test done: you know your throughput ceiling and what breaks first
  [ ] failure drill done: kill the DB, kill a pod, slow a dependency — watch it
  [ ] dashboards a tired on-call engineer can read in 30 seconds
`
},

{
  id: "webapi",
  icon: "🌐",
  name: "Web & API Patterns",
  desc: "REST conventions, status codes, auth, cookies/CSRF, CORS, pagination, caching, uploads, SSE vs WebSocket, gRPC.",
  tags: ["REST", "JWT", "CSRF", "CORS", "ETag", "websocket"],
  body:
`WEB & API PATTERNS CHEAT SHEET
=============================

ROUTING (net/http, Go 1.22+)
  mux.HandleFunc("GET /v1/books/{id}", h)      r.PathValue("id")
  mux.HandleFunc("POST /v1/books", h)
  mux.HandleFunc("GET /files/{path...}", h)    trailing wildcard
  mux.Handle("/api/", http.StripPrefix("/api", apiMux))
  precedence: the MOST SPECIFIC pattern wins (not source order)

REST CONVENTIONS
  GET    /v1/books          list        200
  POST   /v1/books          create      201 + Location header
  GET    /v1/books/{id}     read        200 / 404
  PUT    /v1/books/{id}     replace     200 / 204      (idempotent)
  PATCH  /v1/books/{id}     partial     200 / 409 / 412
  DELETE /v1/books/{id}     delete      204            (idempotent)
  nest only one level: /v1/books/{id}/reviews
  plural nouns, no verbs in paths; actions as sub-resources: POST .../publish
  version in the path (/v1) — simplest thing that works

STATUS CODES THAT MATTER
  200 OK          201 Created (+Location)   202 Accepted (async)
  204 No Content  206 Partial Content (Range)
  301/308 moved   302/307 temporary         304 Not Modified
  400 malformed             401 unauthenticated (+WWW-Authenticate)
  403 forbidden             404 not found (also "exists but hidden")
  405 method not allowed    409 conflict / illegal state
  412 precondition failed   413 payload too large   415 unsupported media
  422 validation failed     429 rate limited (+Retry-After)
  500 internal   502 bad gateway   503 unavailable (+Retry-After)   504 timeout

ERROR ENVELOPE (pick one shape, document it, never deviate)
  {"error":{"code":"validation_failed","message":"...",
            "fields":{"title":"required"},"request_id":"abc123"}}
  map domain errors -> status in ONE place at the transport boundary
  5xx: log the detail, return only the request ID. Leak nothing.

AUTH — SESSIONS (browsers)
  token = 32 bytes from crypto/rand; store the session SERVER-SIDE
  cookie: HttpOnly, Secure, SameSite=Lax (or Strict), Path=/, MaxAge
  rotate the session ID on login (session fixation); delete server-side on logout
  passwords: bcrypt or argon2id; CompareHashAndPassword (constant time)
  identical error + similar timing for unknown-user vs wrong-password
  rate limit + lockout/backoff on repeated failures

AUTH — TOKENS (APIs, mobile, service-to-service)
  access token:  JWT, 5-15 min, claims sub/exp/iat/jti/aud/iss, HS256 or EdDSA
                 SIGNED, NOT ENCRYPTED — anyone can read the payload
  refresh token: 32 random bytes, HASHED at rest, long-lived, SINGLE USE
                 reuse of a used refresh token -> revoke the whole family
  verify: signature, exp, nbf, iss, aud — every time, no exceptions
  authorisation is PER-RESOURCE ("can this user edit THIS row?"), not per-route
  Authorization: Bearer <token>

CSRF
  needed whenever the browser attaches credentials automatically (cookies)
  SameSite=Lax blocks most of it; still add a token for state-changing requests
  per-session token in a hidden field or header; subtle.ConstantTimeCompare
  apply as MIDDLEWARE to every non-GET/HEAD/OPTIONS route
  pure Bearer-token APIs don't need CSRF (no ambient credentials)

CORS
  only needed for cross-ORIGIN browser requests
  Access-Control-Allow-Origin: echo a SPECIFIC allowlisted origin, never *
    when credentials are involved (* + credentials is rejected by browsers)
  Allow-Methods / Allow-Headers / Max-Age; handle the OPTIONS preflight
  Vary: Origin — or your cache will serve one origin's headers to another

PAGINATION
  KEYSET (cursor) — the right default:
    WHERE (created_at, id) < ($t, $id) ORDER BY created_at DESC, id DESC LIMIT n+1
    opaque base64 cursor; flat latency at any depth; stable under inserts
  OFFSET — only for small, static datasets: slow and skips rows as data shifts
  ALWAYS a default limit (25) and a max limit (100)
  allowlist sortable/filterable fields — never interpolate a sort column

CACHING & CONDITIONAL REQUESTS
  ETag: "<hash>"            + If-None-Match      -> 304
  Last-Modified             + If-Modified-Since  -> 304
  If-Match on PATCH/PUT     -> 412 on a stale write (optimistic locking)
  Cache-Control: public, max-age=300, stale-while-revalidate=60
  Cache-Control: no-store   for anything user-specific or secret
  singleflight to collapse a cache stampede into one upstream call

IDEMPOTENCY
  GET/PUT/DELETE are idempotent by definition; POST is not
  Idempotency-Key header -> store (key, response) and replay the first result
  dedupe webhooks on the provider's event ID with a UNIQUE constraint
  webhooks: verify the HMAC over the RAW body, constant-time, reject stale
  timestamps, return 200 FAST and do slow work in a queue

UPLOADS
  http.MaxBytesReader(w, r.Body, N) + check declared Content-Length
  r.MultipartReader() to STREAM; ParseMultipartForm buffers (small files only)
  sniff the type with http.DetectContentType(first 512 bytes) + allowlist
  GENERATE your own filename — hdr.Filename may be "../../etc/passwd"
  serve with Content-Disposition: attachment and X-Content-Type-Options: nosniff
  io.TeeReader + io.MultiWriter: hash, count and store in ONE pass
  large files: presigned PUT straight to object storage, then verify

DOWNLOADS
  http.ServeContent(w, r, name, modTime, readSeeker)
    -> Range (206), If-Modified-Since/If-None-Match (304), Content-Type for free
  http.ServeFileFS / http.FileServerFS for embedded assets

STREAMING: SSE vs WEBSOCKET
  SSE          server -> client only; plain HTTP; auto-reconnect; trivial
               Content-Type: text/event-stream; "data: ...\\n\\n"; flush each write
               http.NewResponseController(w).Flush() / SetWriteDeadline
  WebSocket    bidirectional, low latency; needs a library (coder/websocket)
               two goroutines per conn (read pump + write pump)
               read limits, read/write deadlines, ping/pong heartbeats
               buffered per-client send chan + DROP on full (never block the hub)
  rule: if the server only pushes, use SSE
  EITHER WAY: exempt the handler from the server's global WriteTimeout

TEMPLATES (server-rendered HTML)
  html/template ONLY (contextual auto-escaping); never text/template for HTML
  parse ONCE at startup; render into a bytes.Buffer, then copy to the response
  //go:embed templates/* static/*  -> one self-contained binary
  template.HTML opts OUT of escaping — sanitise (bluemonday) before using it
  HTMX: return HTML FRAGMENTS; branch on the HX-Request header for full pages

SECURITY HEADERS
  Content-Security-Policy: default-src 'self'
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY  (or CSP frame-ancestors)
  Permissions-Policy: geolocation=(), camera=()

SERVER / CLIENT HYGIENE
  server: ReadHeaderTimeout, ReadTimeout, WriteTimeout, IdleTimeout — always
  client: &http.Client{Timeout: …} + Transport{MaxIdleConnsPerHost: >2}
  defer resp.Body.Close() on EVERY response; non-2xx is not a Go error
  reverse proxy: httputil.ReverseProxy + Rewrite + SetXForwarded,
    FlushInterval: -1 for streaming, ErrorHandler -> 502/504

gRPC (service-to-service)
  proto -> buf lint / buf breaking / buf generate
  field NUMBERS are the wire contract: never change or reuse; "reserved" removals
  status codes: InvalidArgument, NotFound, AlreadyExists, PermissionDenied,
    Unauthenticated, DeadlineExceeded, ResourceExhausted, Unavailable, Internal
  ONE ClientConn per process (it pools + multiplexes)
  always set a deadline — it propagates to the server automatically
  interceptors = middleware; health + reflection servers; mTLS via creds
  grpc-gateway or ConnectRPC when you also need JSON/REST
`
},

{
  id: "versions",
  icon: "🗓️",
  name: "Version Timeline & Modern Idioms",
  desc: "What changed in every Go release since 1.18, and the old pattern each new feature replaces.",
  tags: ["1.18", "1.21", "1.22", "1.23", "1.25"],
  body:
`GO VERSION TIMELINE & MODERN IDIOMS
==================================

Why this matters: the "go" line in go.mod selects LANGUAGE semantics per module.
Reading old Go is easy; writing old Go by habit is the thing to avoid.

1.18  (Mar 2022)  GENERICS
    type parameters, constraints, type sets with ~ and |
    fuzzing in the standard toolchain: go test -fuzz
    workspaces: go work init / use
    net/netip (compact, comparable IP addresses)

1.19  (Aug 2022)
    GOMEMLIMIT          <- the fix for container OOM kills
    atomic.Int64/Bool/Pointer[T]   (typed atomics; stop using atomic.AddInt64)
    doc comment links and lists

1.20  (Feb 2023)
    errors.Join + multiple %w in one fmt.Errorf
    errors.Is/As across joined errors
    unsafe.String / unsafe.Slice (zero-copy views, used carefully)
    PGO preview; coverage for integration tests

1.21  (Aug 2023)
    PGO GENERALLY AVAILABLE: drop default.pgo next to main -> 2-7% free CPU
    log/slog            <- structured logging; stop using log.Printf in services
    slices, maps, cmp   <- delete your utils package
    min / max builtins; clear() builtin
    sync.OnceFunc / OnceValue / OnceValues
    context.WithoutCancel / AfterFunc / WithDeadlineCause
    toolchain directive in go.mod (auto-download the right compiler)

1.22  (Feb 2024)
    PER-ITERATION LOOP VARIABLES   <- the goroutine-capture bug is GONE
    for i := range 10              <- range over an int
    net/http ServeMux: "GET /users/{id}" + r.PathValue("id")
                                   <- most projects no longer need a router
    math/rand/v2: Int64N, auto-seeded, no rand.Seed
    go mod tidy -diff (CI gate)

1.23  (Aug 2024)
    RANGE OVER FUNCTION: iter.Seq / iter.Seq2
    slices.All/Values/Backward/Collect/Sorted/Chunk, maps.Keys/Values/All
    timer/ticker overhaul: unreferenced timers are collectable; no more
      time.After leak in a hot select loop
    unique.Make (interning); structs.HostLayout
    Request.Pattern (the matched route — use it as a metric label)

1.24  (Feb 2025)
    SWISS-TABLE MAPS           (faster lookups/deletes, smaller small maps)
    for b.Loop() { }           <- the new benchmark idiom; no DCE games
    testing/synctest (experiment): fake clock in a bubble for concurrency tests
    os.Root / os.OpenRoot      <- traversal-proof file access
    json omitzero              <- what you always wanted omitempty to be
    generic type aliases
    runtime.AddCleanup (replaces SetFinalizer), weak pointers
    tool directives in go.mod: go get -tool, go tool <name>  (bye tools.go)
    crypto/rand.Read never fails; crypto/rand.Text()

1.25  (Aug 2025)
    sync.WaitGroup.Go(func)    <- no more Add(1)/defer Done() bookkeeping
    testing/synctest stable (synctest.Test / synctest.Wait)
    container-aware GOMAXPROCS (reads the cgroup CPU limit)
    GOEXPERIMENT=greenteagc    (new mark algorithm, opt-in)
    DWARF5, trace flight recorder

OLD PATTERN -> MODERN PATTERN
  i := i inside a loop                 -> nothing needed (1.22+)
  gorilla/mux or chi for simple routing -> net/http ServeMux patterns (1.22+)
  log.Printf("user=%s ...")             -> slog.Info("...", "user", u)
  interface{}                           -> any
  sort.Slice(s, func(i,j int) bool)     -> slices.SortFunc(s, cmp)
  for k := range m { keys = append }    -> slices.Sorted(maps.Keys(m))
  hand-written Contains/Index/Reverse   -> slices.*
  return []T from a big query           -> iter.Seq[T] (1.23+)
  for i := 0; i < b.N; i++              -> for b.Loop() (1.24+)
  rand.Seed(time.Now().UnixNano())      -> math/rand/v2 (auto-seeded)
  atomic.AddInt64(&n, 1)                -> var n atomic.Int64; n.Add(1)
  tools.go with blank imports           -> tool directives (1.24+)
  SetFinalizer                          -> runtime.AddCleanup (1.24+)
  time.Sleep in a concurrency test      -> testing/synctest, or inject a Clock
  manual filepath.Clean traversal guard -> os.Root (1.24+)
  errors.New + custom wrapper types     -> fmt.Errorf("%w") + errors.Is/As
  GOPATH workspace layout               -> modules, anywhere on disk

STILL IDIOMATIC, DO NOT "MODERNISE"
  if err != nil { return ... }     explicit error handling is the point
  table-driven tests               no assertion library needed
  small interfaces, declared by the consumer
  channels for ownership transfer; mutexes for shared state
  struct + functional options      instead of default/named arguments
  the standard library first        before any framework
`
},

{
  id: "gotchas",
  icon: "🪤",
  name: "Gotchas & Review Checklist",
  desc: "Print this and read it before you open a pull request.",
  tags: ["bugs", "review", "idioms"],
  body:
`GO GOTCHAS & CODE REVIEW CHECKLIST
==================================

COMPILE-TIME SURPRISES
  int(3.99) / uint8(300)              ERROR on CONSTANTS (exactly checked);
                                      the same conversion on a VARIABLE silently
                                      truncates or wraps
  var i Incrementer = Counter{}       ERROR if the method has a POINTER receiver
                                      (T's method set excludes pointer methods)
  m["k"].Inc()                        ERROR: map elements are not addressable
  unused local variable / import      ERROR, not a warning
  string(65) == "A"                   compiles, means a code point (vet warns)

MEMORISE THESE PANICS
  write to a nil map                  m := make(...) first
  iterator kept yielding after a break ("range function continued iteration")
  index out of range                  check len() first
  nil pointer dereference             guard pointers that can be nil
  send on a closed channel            only the sender closes, once
  close of a closed/nil channel       close exactly once, never a nil channel
  failed single-value type assertion  use v, ok := x.(T)
  integer divide by zero
  negative or over-capacity slice bounds
  concurrent map writes (a deliberate runtime throw, not a race report)

SLICES
  [ ] every append reassigns:  s = append(s, v)
  [ ] sub-slices alias the parent — clone when you need isolation
  [ ] no small long-lived slice of a huge array (it pins the whole array)
  [ ] capacity preallocated where the size is known
  [ ] ranging a []struct copies each element — index to mutate in place

MAPS
  [ ] v, ok := m[k] used wherever absence differs from the zero value
  [ ] no reliance on iteration order (sort keys if order matters)
  [ ] nil map never written to
  [ ] concurrent access is protected (mutex or sync.Map)
  [ ] no &m[k] (illegal); store pointers as values if you must mutate

STRINGS
  [ ] len(s) is bytes — use utf8.RuneCountInString for characters
  [ ] no += in a loop — strings.Builder or strings.Join
  [ ] string(intVar) is a code point, not a number — strconv.Itoa
  [ ] []byte(s) and string(b) copy; avoid them on hot paths (use bytes.*)

ERRORS
  [ ] every error checked, not discarded with _
  [ ] wrapped with %w and real context ("opening %s: %w")
  [ ] errors.Is / errors.As instead of == or type assertions
  [ ] no typed nil pointer returned as an error
  [ ] handled ONCE: wrap and return, or log — not both
  [ ] panic reserved for programmer bugs; recover only at a boundary

CONCURRENCY
  [ ] every goroutine has a defined exit path (ctx.Done, closed channel, range end)
  [ ] wg.Add before the goroutine starts; wg.Done always deferred
  [ ] defer cancel() after every WithCancel/WithTimeout/WithDeadline
  [ ] concurrency is bounded (worker pool, semaphore, g.SetLimit)
  [ ] no time.Sleep used as synchronisation
  [ ] mutex-bearing types use POINTER receivers (copying a mutex is a bug)
  [ ] Unlock deferred immediately after Lock
  [ ] ctx is the first parameter and is propagated to every blocking call
  [ ] go test -race passes

DEFER
  [ ] not inside a loop body (it runs at FUNCTION return)
  [ ] arguments are evaluated at the defer statement — wrap in a closure if you
      need the later value
  [ ] Close() errors on writers are checked (data loss hides there)
  [ ] remember log.Fatal / os.Exit SKIP deferred functions

HTTP
  [ ] server timeouts set (ReadHeaderTimeout at minimum)
  [ ] client has a Timeout (the zero http.Client waits forever)
  [ ] every resp.Body closed, even on non-2xx
  [ ] non-2xx status codes checked — they are not Go errors
  [ ] request bodies size-limited (http.MaxBytesReader)
  [ ] WriteHeader called after setting headers, before writing the body
  [ ] r.Context() honoured for long work
  [ ] html/template (not text/template) for HTML
  [ ] pprof NOT exposed publicly

MODERN-GO SLIPS
  [ ] i := i copies in loops (unnecessary since 1.22)
  [ ] sort.Slice where slices.SortFunc reads better
  [ ] log.Printf in a service instead of slog
  [ ] omitempty on a time.Time field (never omitted) -> use omitzero (1.24+)
  [ ] for i := 0; i < b.N; i++ instead of for b.Loop() (1.24+)
  [ ] rand.Seed / math/rand for anything secret -> crypto/rand
  [ ] manual filepath traversal guards instead of os.Root (1.24+)
  [ ] a third-party router for plain method+path routing (1.22+ ServeMux does it)
  [ ] InsecureSkipVerify: true anywhere outside a throwaway script

API DESIGN
  [ ] interfaces small and declared where consumed
  [ ] accept interfaces, return concrete types
  [ ] the zero value is useful
  [ ] no stutter (user.New, not user.NewUser)
  [ ] no package named utils / helpers / common
  [ ] exported identifiers documented, starting with the identifier's name
  [ ] receiver types consistent across a type (all value or all pointer)
  [ ] ctx first, error last

BEFORE YOU PUSH
  gofmt -l .
  go vet ./...
  go test -race -cover ./...
  staticcheck ./...   (or golangci-lint run)
  govulncheck ./...
  go mod tidy -diff
`
}

];
