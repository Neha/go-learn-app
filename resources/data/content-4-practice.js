/* Modules 18–20 : Testing, Real Services, Mastery */
window.CURRICULUM_PARTS = window.CURRICULUM_PARTS || [];
window.CURRICULUM_PARTS.push([

/* ───────────────────────────── 18 ───────────────────────────── */
{
  id: "testing",
  level: "Advanced",
  icon: "🧪",
  title: "Testing, Benchmarking & Profiling",
  minutes: 22,
  blurb: "Table-driven tests, fuzzing, benchmarks with -benchmem, and finding the real bottleneck with pprof.",
  blocks: [
    { t: "h", text: "Testing is built in — no framework required" },
    { t: "p", html: "A test is a function named <code>TestXxx</code> in a file ending in <code>_test.go</code>. Those files are not compiled into your program. <code>go test</code> runs them. A table of cases in one test is the usual shape: one row per input and expected output." },
    { t: "code", title: "math_test.go", code:
`package math

import "testing"

// Must be: Test<Name>(t *testing.T), in a _test.go file
func TestAdd(t *testing.T) {
    got := Add(2, 3)
    if got != 5 {
        t.Errorf("Add(2,3) = %d, want 5", got)   // report and continue
    }
    // t.Fatalf reports and stops this test immediately
}

// TABLE-DRIVEN: the dominant Go idiom. One struct slice, many cases.
func TestDivide(t *testing.T) {
    tests := []struct {
        name    string
        a, b    float64
        want    float64
        wantErr bool
    }{
        {"simple", 10, 2, 5, false},
        {"negative", -10, 2, -5, false},
        {"by zero", 1, 0, 0, true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {    // a named SUBTEST
            got, err := Divide(tt.a, tt.b)
            if (err != nil) != tt.wantErr {
                t.Fatalf("error = %v, wantErr %v", err, tt.wantErr)
            }
            if !tt.wantErr && got != tt.want {
                t.Errorf("got %v, want %v", got, tt.want)
            }
        })
    }
}`
    },
    { t: "code", title: "The test commands", code:
`go test ./...                       # everything
go test -v ./...                    # verbose: one line per test
go test -run 'TestDivide/by_zero'   # regex, including subtest paths
go test -race ./...                 # with the race detector
go test -cover ./...                # coverage percentage
go test -coverprofile=c.out ./... && go tool cover -html=c.out   # visual report
go test -count=1 ./...              # defeat the test result cache
go test -short ./...                # your code checks testing.Short() to skip slow tests
go test -timeout 30s ./...`
    },

    { t: "h", text: "Helpers, cleanup, and fixtures" },
    { t: "p", html: "<code>t.Helper()</code> makes a failure point at the caller, not at the helper. <code>t.Cleanup</code> runs after the test, even if it fails. <code>t.TempDir()</code> is a directory that is deleted afterwards. Prefer these over <code>TestMain</code> unless every test in the package shares one expensive setup." },
    { t: "code", title: "The testing API you'll actually use", code:
`func newTestDB(t *testing.T) *DB {
    t.Helper()                      // failures report the CALLER's line, not this one
    db, err := Open(":memory:")
    if err != nil { t.Fatal(err) }
    t.Cleanup(func() { db.Close() })  // runs at the end of this test, LIFO
    return db
}

func TestX(t *testing.T) {
    t.Parallel()                    // run alongside other parallel tests
    dir := t.TempDir()              // auto-removed afterwards
    t.Setenv("API_KEY", "test")     // restored afterwards (disables t.Parallel)
    t.Log("only printed with -v or on failure")
    t.Skip("needs network")
}

// TestMain for package-level setup/teardown
func TestMain(m *testing.M) {
    setup()
    code := m.Run()
    teardown()
    os.Exit(code)
}

// GOLDEN FILES for large expected outputs
var update = flag.Bool("update", false, "update golden files")
func TestRender(t *testing.T) {
    got := Render(input)
    golden := "testdata/render.golden"      // testdata/ is ignored by the go tool
    if *update { os.WriteFile(golden, got, 0644) }
    want, _ := os.ReadFile(golden)
    if !bytes.Equal(got, want) { t.Error("output differs; rerun with -update") }
}`
    },
    { t: "note", kind: "tip", title: "Faking dependencies needs no mock library", html: "Because interfaces are satisfied implicitly, a test double is just a small struct with the right methods — often with function fields so each test can set behaviour inline. Define the interface in the <em>consumer's</em> package, listing only the methods you call." },
    { t: "code", title: "A hand-rolled fake", code:
`// In the package that USES it, declare the minimum you need:
type UserStore interface { Get(ctx context.Context, id int) (*User, error) }

type fakeStore struct {
    getFn func(context.Context, int) (*User, error)
}
func (f fakeStore) Get(ctx context.Context, id int) (*User, error) {
    return f.getFn(ctx, id)
}

svc := NewService(fakeStore{getFn: func(_ context.Context, id int) (*User, error) {
    return nil, ErrNotFound
}})
// Also: httptest.NewServer / httptest.NewRecorder for HTTP, both in the stdlib.`
    },

    { t: "h", text: "The test pyramid, in Go terms" },
    { t: "p", html: "Most tests should be small and fast. A few should start the real program. This table is that split: what each level covers, what it is allowed to depend on, and how many of them you want." },
    { t: "table", head: ["Level", "Scope", "Dependencies", "Speed", "How many"],
      rows: [
        ["<strong>Unit</strong>", "One function or type", "None — pure logic", "µs–ms", "Most of them"],
        ["<strong>Component</strong>", "One package via its public API", "Fakes, <code>httptest</code>, in-memory store", "ms", "Many"],
        ["<strong>Integration</strong>", "Your code + a real dependency", "Postgres/Redis in Docker", "100 ms–s", "Per adapter"],
        ["<strong>End-to-end</strong>", "The built binary or container, over HTTP", "Everything", "seconds", "A handful, critical paths only"]
      ]
    },
    { t: "code", title: "Integration tests against a real database", code:
`// Guard the slow ones so the inner loop stays fast: go test -short
func TestMain(m *testing.M) {
    if testing.Short() { os.Exit(m.Run()) }

    ctx := context.Background()
    ctr, err := postgres.Run(ctx, "postgres:16",          // testcontainers-go
        postgres.WithDatabase("test"), postgres.WithPassword("test"))
    if err != nil { log.Fatal(err) }
    testDSN, _ = ctr.ConnectionString(ctx, "sslmode=disable")
    if err := migrateUp(testDSN); err != nil { log.Fatal(err) }

    code := m.Run()
    _ = ctr.Terminate(ctx)
    os.Exit(code)
}

// Each test gets a transaction that is always rolled back -> isolated, and
// safe to run with t.Parallel().
func withTx(t *testing.T) *sql.Tx {
    t.Helper()
    tx, err := testDB.BeginTx(context.Background(), nil)
    if err != nil { t.Fatal(err) }
    t.Cleanup(func() { tx.Rollback() })
    return tx
}

// CI alternative: a "services:" Postgres in your workflow file and a DSN from
// the environment. Same tests, no Docker-in-Docker.`
    },
    { t: "code", title: "End-to-end: drive the real server, and fake its upstreams", code:
`func TestCreateLink_EndToEnd(t *testing.T) {
    // 1. Fake the UPSTREAM dependency with a real HTTP server
    upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(200); io.WriteString(w, "{\\"ok\\":true}")
    }))
    defer upstream.Close()

    // 2. Build the whole app the way main() does, but pointed at test deps
    app := newTestApp(t, config.Config{DatabaseURL: testDSN, UpstreamURL: upstream.URL})
    srv := httptest.NewServer(app.Handler())
    defer srv.Close()

    // 3. Exercise it as a client would — routing, middleware, JSON, SQL, all of it
    body := strings.NewReader(` + "`" + `{"url":"https://go.dev"}` + "`" + `)
    resp, err := srv.Client().Post(srv.URL+"/api/links", "application/json", body)
    if err != nil { t.Fatal(err) }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusCreated {
        t.Fatalf("status = %d, want 201", resp.StatusCode)
    }
    var out struct{ Code string }
    if err := json.NewDecoder(resp.Body).Decode(&out); err != nil { t.Fatal(err) }
    if out.Code == "" { t.Error("expected a short code") }

    // 4. And assert the side effect actually happened
    redirect, _ := srv.Client().Get(srv.URL + "/" + out.Code)
    if redirect.Request.URL.String() != "https://go.dev" { t.Error("redirect wrong") }
}`
    },
    { t: "note", kind: "tip", title: "Flaky tests are worse than missing tests", html: "A test that fails 1% of the time trains your team to re-run CI instead of reading failures. The usual causes in Go: depending on map iteration order, <code>time.Sleep</code> instead of synchronisation, shared global state between <code>t.Parallel()</code> tests, real clocks (inject a <code>Clock</code> interface), real network calls, and fixed ports (always use <code>:0</code> or <code>httptest</code>). Fix or delete a flake the day you find it — and <code>go test -shuffle=on -count=5</code> will find most of them for you." },

    { t: "h", text: "Fuzzing: the compiler finds your edge cases" },
    { t: "p", html: "A fuzz test takes a <code>[]byte</code> or other inputs and tries random values, then remembers the ones that crash. <code>go test -fuzz</code> runs it. The goal is \"this function must not panic\", not \"this equals 4\"." },
    { t: "code", title: "Built in since Go 1.18", code:
`func FuzzParse(f *testing.F) {
    f.Add("valid input")              // seed corpus
    f.Add("")
    f.Fuzz(func(t *testing.T, s string) {
        out, err := Parse(s)
        if err != nil { return }      // rejecting bad input is fine
        // Assert an INVARIANT, e.g. round-tripping
        if got := Format(out); got != s {
            t.Errorf("round trip: %q -> %q", s, got)
        }
    })
}
// go test -fuzz=FuzzParse -fuzztime=60s
// Any crashing input is written to testdata/fuzz/ and becomes a permanent
// regression test on every normal 'go test' run afterwards.`
    },

    { t: "h", text: "Benchmarking" },
    { t: "p", html: "A benchmark function is <code>BenchmarkXxx</code> and loops <code>b.N</code> times. <code>go test -bench=. -benchmem</code> reports time and allocations. Compare two runs with <code>benchstat</code>, not by eye, because a single run is noisy." },
    { t: "code", title: "Measure, don't guess", code:
`// MODERN FORM (Go 1.24+): for b.Loop() { ... }
// It runs the body a framework-chosen number of times, keeps setup outside the
// timed region automatically, and — crucially — the compiler will NOT optimise
// away work whose result is unused inside a b.Loop body.
func BenchmarkConcat(b *testing.B) {
    for b.Loop() {
        _ = strings.Repeat("x", 100)
    }
}

// CLASSIC FORM (still everywhere, still fine):
func BenchmarkConcatOld(b *testing.B) {
    for i := 0; i < b.N; i++ {        // the framework tunes b.N for timing stability
        sink = strings.Repeat("x", 100)   // assign, or dead-code elimination hits
    }
}
var sink string

func BenchmarkWithSetup(b *testing.B) {
    data := makeBigInput()            // not timed if you reset after it
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        Process(data)
    }
}

func BenchmarkParallel(b *testing.B) {
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() { Handle(req) }
    })
}

// go test -bench=. -benchmem -benchtime=3s ./...
// BenchmarkConcat-8   3461208   345.2 ns/op   112 B/op   2 allocs/op
//                     ^runs     ^time         ^bytes     ^allocations
// B/op and allocs/op are usually the numbers worth optimising.

// Compare two revisions properly:
//   go test -bench=. -count=10 > old.txt   (then change code)
//   go test -bench=. -count=10 > new.txt
//   benchstat old.txt new.txt     # reports deltas with statistical significance`
    },
    { t: "note", kind: "warn", title: "The compiler can delete your benchmark", html: "If the result is unused, dead-code elimination may remove the work entirely and you'll \"optimise\" to 0.3 ns/op. Assign to a package-level <code>var sink</code>, or use the result. Also beware <code>b.N</code> loops that mutate shared state across iterations." },

    { t: "h", text: "Testing concurrent code without sleeps" },
    { t: "p", html: "A sleep in a test is a race against the machine. Wait on a channel, a <code>sync.WaitGroup</code>, or <code>synctest</code> (Go 1.24) so the test proceeds when the work is done. <code>go test -race</code> is how you find unsynchronised access." },
    { t: "code", title: "testing/synctest — a fake clock and a bubble (Go 1.24 experiment, 1.25 stable)", code:
`// The usual way to test "this retries after 30 seconds" is time.Sleep, which
// makes the suite slow AND flaky. synctest runs your goroutines in an isolated
// "bubble" with a FAKE clock that jumps forward the instant every goroutine in
// the bubble is blocked. Timeouts become instant and deterministic.
func TestRetryBackoff(t *testing.T) {
    synctest.Test(t, func(t *testing.T) {
        var attempts int
        start := time.Now()

        err := retry(context.Background(), 4, time.Second, func() error {
            attempts++
            return errors.New("boom")
        })

        synctest.Wait()                  // wait until all bubble goroutines block
        if attempts != 4 { t.Errorf("attempts = %d, want 4", attempts) }
        // Virtual time: this assertion is exact, and the test took microseconds.
        if elapsed := time.Since(start); elapsed < 7*time.Second {
            t.Errorf("backoff too short: %v", elapsed)
        }
        if err == nil { t.Error("expected failure") }
    })
}
// (In Go 1.24 this shipped as GOEXPERIMENT=synctest with synctest.Run.)
// Rules inside a bubble: no real I/O, no channels shared with the outside
// world, and time only advances when EVERY goroutine in the bubble is blocked.`
    },
    { t: "note", kind: "tip", title: "If you can't use synctest", html: "Inject a clock. Define <code>type Clock interface { Now() time.Time; After(time.Duration) &lt;-chan time.Time }</code>, pass the real one in production and a controllable fake in tests. Any test containing <code>time.Sleep</code> to \"let the goroutine finish\" is a future flake — synchronise on a channel or a <code>WaitGroup</code> instead." },

    { t: "h", text: "Profiling with pprof" },
    { t: "p", html: "<code>go test -cpuprofile</code> or an HTTP <code>/debug/pprof</code> endpoint records where time and memory go. <code>go tool pprof</code> shows the functions that dominate. Optimise the top of that list, not the function you guessed." },
    { t: "code", title: "From a benchmark", code:
`go test -bench=. -cpuprofile=cpu.out -memprofile=mem.out ./...
go tool pprof -http=:8080 cpu.out     # flame graph in your browser
# In the interactive REPL: top10, list FuncName, web, peek`
    },
    { t: "code", title: "From a live server — add one import", code:
`import _ "net/http/pprof"             // registers handlers on DefaultServeMux

func main() {
    go func() { log.Println(http.ListenAndServe("localhost:6060", nil)) }()
    // ... your real server ...
}

# Then, against the running process:
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30  # CPU
go tool pprof http://localhost:6060/debug/pprof/heap                # live heap
go tool pprof http://localhost:6060/debug/pprof/allocs              # all allocations
curl 'localhost:6060/debug/pprof/goroutine?debug=2'                 # ALL stacks —
                                                     # the fastest way to find a leak
go tool pprof http://localhost:6060/debug/pprof/mutex                # contention
go tool pprof http://localhost:6060/debug/pprof/block                # blocking`
    },
    { t: "note", kind: "warn", title: "Never expose pprof publicly", html: "The <code>net/http/pprof</code> handlers leak stack traces, source paths and heap contents, and <code>?seconds=30</code> is a ready-made CPU drain. Bind it to localhost or an internal-only admin port." },
    { t: "code", title: "Execution tracer: for concurrency problems specifically", code:
`go test -trace=trace.out ./...
go tool trace trace.out
# Shows per-goroutine timelines, scheduler latency, GC pauses, syscall blocking,
# and network wait. This is the tool for "why is my concurrency not speeding
# anything up?" — pprof shows where CPU goes, the tracer shows where TIME goes.`
    }
  ],
  summary: [
    "Tests are `TestXxx(t *testing.T)` in `_test.go` files — no framework, no assertions library needed.",
    "Table-driven tests with `t.Run` subtests are the standard idiom; `-run 'TestX/case'` targets one.",
    "`t.Helper()`, `t.Cleanup()`, `t.TempDir()`, `t.Setenv()`, `t.Parallel()` cover most fixture needs.",
    "Fakes are plain structs — implicit interfaces mean no mocking library; use `httptest` for HTTP.",
    "Pyramid: many unit/component tests, integration tests per adapter (real Postgres via testcontainers, guarded by `-short`), a handful of end-to-end tests through `httptest.NewServer`.",
    "Treat flakes as bugs: no sleeps, no shared global state across `t.Parallel()`, inject the clock, and run `-shuffle=on -count=5`.",
    "`go test -fuzz` generates inputs and saves crashers into testdata as permanent regression tests.",
    "Use `for b.Loop()` (1.24+) for benchmarks — setup stays untimed and the compiler won't delete the work.",
    "`testing/synctest` gives concurrency tests a fake clock in an isolated bubble, so timeout behaviour is instant and deterministic; otherwise inject a Clock interface.",
    "Benchmarks: `-benchmem` to see B/op and allocs/op; use `-count=10` + `benchstat` for real comparisons.",
    "Profile CPU/heap/goroutines/mutex with pprof; use `go tool trace` for concurrency and latency questions.",
    "Never expose `net/http/pprof` on a public port."
  ],
  quiz: [
    { q: "What makes a file a test file in Go?",
      options: ["A @Test annotation", "The name ends in `_test.go`", "Living in a tests/ directory", "Importing a test framework"],
      answer: 1,
      explain: "`_test.go` files are compiled only during `go test` and excluded from your binary." },
    { q: "Difference between `t.Errorf` and `t.Fatalf`?",
      options: ["None", "Errorf marks failure and continues; Fatalf marks failure and stops the test", "Fatalf panics the process", "Errorf only logs"],
      answer: 1,
      explain: "Fatalf calls runtime.Goexit, so remaining assertions in that test don't run." },
    { q: "Which flag reveals allocations per operation in a benchmark?",
      options: ["`-v`", "`-benchmem`", "`-race`", "`-cover`"],
      answer: 1,
      explain: "It adds B/op and allocs/op — often the most actionable numbers you'll get." },
    { q: "Fastest way to diagnose a suspected goroutine leak in a live service?",
      options: ["`go test -race`", "`curl localhost:6060/debug/pprof/goroutine?debug=2`", "`GODEBUG=gctrace=1`", "Read the heap profile"],
      answer: 1,
      explain: "It dumps every goroutine's stack; thousands parked on the same line names the leak immediately." },
    { q: "`go test` returns cached results and you want a genuine re-run. Which flag?",
      options: ["`-count=1`", "`-force`", "`-nocache`", "`-fresh`"],
      answer: 0,
      explain: "`-count=1` is the documented idiom for bypassing the test cache." }
  ]
},

/* ───────────────────────────── 19 ───────────────────────────── */
{
  id: "stdlib-service",
  level: "Advanced",
  icon: "🌐",
  title: "The Standard Library: Build a Real HTTP Service",
  minutes: 24,
  blurb: "net/http, encoding/json, database/sql, structured logging, graceful shutdown.",
  blocks: [
    { t: "p", html: "Go's standard library is production-grade. You can serve HTTP, speak JSON, talk to SQL, log structurally, and shut down cleanly with <strong>zero dependencies</strong>." },

    { t: "h", text: "HTTP server, with the 1.22+ router" },
    { t: "p", html: "The standard library router matches a method and a path, including <code>{id}</code> wildcards, and <code>r.PathValue</code> reads them. Build an <code>http.Server</code> and set timeouts. <code>http.ListenAndServe</code> with no timeouts will wait forever on a slow client." },
    { t: "code", title: "Method and wildcard patterns are now built in", code:
`func main() {
    mux := http.NewServeMux()

    // Go 1.22+: METHOD and {wildcard} patterns in the standard mux
    mux.HandleFunc("GET /users/{id}", getUser)
    mux.HandleFunc("POST /users", createUser)
    mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        io.WriteString(w, "ok")
    })
    mux.Handle("GET /static/", http.StripPrefix("/static/",
        http.FileServer(http.Dir("public"))))

    srv := &http.Server{
        Addr:              ":8080",
        Handler:           logging(recoverer(mux)),   // middleware wraps the mux
        ReadHeaderTimeout: 5 * time.Second,           // ALWAYS set timeouts
        ReadTimeout:       15 * time.Second,
        WriteTimeout:      15 * time.Second,
        IdleTimeout:       60 * time.Second,
    }
    log.Fatal(srv.ListenAndServe())
}

func getUser(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")                  // 1.22+ wildcard accessor
    q := r.URL.Query().Get("fields")         // query string
    ct := r.Header.Get("Content-Type")
    ctx := r.Context()                       // CANCELLED when the client disconnects
    _ = q; _ = ct
    writeJSON(w, 200, map[string]string{"id": id})
}`
    },
    { t: "note", kind: "warn", title: "Never use `http.ListenAndServe` with the default settings in production", html: "The zero-value <code>http.Server</code> has <strong>no timeouts</strong>. A single slow or malicious client can hold a connection — and its goroutine and memory — open indefinitely. Setting <code>ReadHeaderTimeout</code> alone prevents the classic Slowloris attack." },

    { t: "h", text: "Middleware is just a function that wraps a Handler" },
    { t: "p", html: "Middleware is a function that takes an <code>http.Handler</code> and returns another. The returned handler does something, then calls the one inside. Logging, authentication, and recovery from panic are all that shape. There is no framework required." },
    { t: "diagram", id: "middleware" },
    { t: "code", title: "No framework needed", code:
`func logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        slog.Info("request",
            "method", r.Method, "path", r.URL.Path, "dur", time.Since(start))
    })
}

func recoverer(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                slog.Error("panic", "err", rec, "stack", string(debug.Stack()))
                http.Error(w, "internal error", 500)
            }
        }()
        next.ServeHTTP(w, r)
    })
}
// Compose by nesting: logging(recoverer(auth(mux)))`
    },

    { t: "h", text: "JSON" },
    { t: "p", html: "<code>json.Marshal</code> turns a struct into bytes. <code>Unmarshal</code> fills a struct from bytes. A field is included only if its name is exported. The <code>json</code> tag renames it. <code>omitempty</code> drops the field when it is the zero value. <code>-</code> drops it always." },
    { t: "code", title: "encoding/json and struct tags", code:
`type User struct {
    ID      int       ` + "`json:\"id\"`" + `
    Name    string    ` + "`json:\"name\"`" + `
    Email   string    ` + "`json:\"email,omitempty\"`" + `   // omitted when empty
    Created time.Time ` + "`json:\"created\"`" + `
    Secret  string    ` + "`json:\"-\"`" + `                 // NEVER marshalled
    pwHash  string                                           // unexported: invisible
}

// omitempty vs omitzero (Go 1.24+) — a long-standing wart, finally fixed:
//   omitempty omits "", 0, false, nil, and EMPTY maps/slices
//             -> but NOT a zero time.Time or an empty struct, because those
//                are not "empty" by its definition. Famously surprising.
//   omitzero  omits a value equal to its type's ZERO VALUE, including
//             time.Time{} and comparable structs. Usually what you meant.
type Event struct {
    Name     string    ` + "`json:\"name\"`" + `
    StartsAt time.Time ` + "`json:\"starts_at,omitzero\"`" + `   // gone when unset
    Tags     []string  ` + "`json:\"tags,omitempty\"`" + `       // gone when empty
}
// Note: a POINTER field with omitempty is still the portable way to say
// "absent" vs "present but zero" — and the only way to tell them apart on
// decode, which matters for PATCH endpoints.

// Marshal / Unmarshal for byte slices
b, err := json.Marshal(u)
b, err = json.MarshalIndent(u, "", "  ")
err = json.Unmarshal(b, &u)                  // pointer required

// Encoder / Decoder for streams — use these for HTTP, they avoid buffering
func writeJSON(w http.ResponseWriter, status int, v any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)                     // AFTER headers, BEFORE the body
    if err := json.NewEncoder(w).Encode(v); err != nil {
        slog.Error("encode", "err", err)
    }
}

func readJSON(w http.ResponseWriter, r *http.Request, dst any) error {
    // Pass w so an over-size body also closes the connection cleanly.
    dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))    // cap at 1 MB
    dec.DisallowUnknownFields()               // reject typos in client payloads
    if err := dec.Decode(dst); err != nil { return err }
    // Reject trailing garbage / a second JSON document in one body:
    if dec.More() { return errors.New("body must contain a single JSON object") }
    return nil
}

// Unknown or dynamic shapes
var any1 map[string]any
json.Unmarshal(b, &any1)        // numbers arrive as float64!
// Use json.Number, or a struct, when precision matters.`
    },

    { t: "h", text: "Structured logging with slog (Go 1.21+)" },
    { t: "p", html: "<code>slog</code> logs key-value pairs instead of one string, so a log system can filter on <code>user_id</code> without parsing text. Set the level and the output once. Pass a <code>context</code> when you want the request id included." },
    { t: "code", title: "Stop using log.Printf in services", code:
`logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,
}))
slog.SetDefault(logger)

slog.Info("server started", "port", 8080, "env", "prod")
slog.Error("db query failed", "err", err, "query", q)

// Attach context once and reuse — every line carries these fields
reqLog := slog.With("request_id", id, "user", userID)
reqLog.Info("handling")
// {"time":"...","level":"INFO","msg":"handling","request_id":"abc","user":42}`
    },

    { t: "h", text: "database/sql" },
    { t: "p", html: "<code>sql.Open</code> does not connect. It prepares a pool, and the first query connects. Always pass a <code>context</code>. Close rows with <code>defer rows.Close()</code> and check <code>rows.Err()</code> after the loop. A query with <code>?</code> or <code>$1</code> placeholders is how you avoid building SQL from user text." },
    { t: "code", title: "A driver-agnostic interface with a built-in pool", code:
`import _ "github.com/lib/pq"          // driver registers itself via init()

db, err := sql.Open("postgres", dsn)  // LAZY: does not connect yet
if err != nil { return err }
defer db.Close()

if err := db.PingContext(ctx); err != nil { return err }   // verify now

db.SetMaxOpenConns(25)                // db is a POOL, safe for concurrent use;
db.SetMaxIdleConns(25)                // create ONE and share it
db.SetConnMaxLifetime(5 * time.Minute)

// Single row
var name string
err = db.QueryRowContext(ctx, "SELECT name FROM users WHERE id = $1", id).Scan(&name)
if errors.Is(err, sql.ErrNoRows) { return ErrNotFound }

// Many rows — the error check after the loop is NOT optional
rows, err := db.QueryContext(ctx, "SELECT id, name FROM users")
if err != nil { return err }
defer rows.Close()
for rows.Next() {
    var u User
    if err := rows.Scan(&u.ID, &u.Name); err != nil { return err }
    users = append(users, u)
}
if err := rows.Err(); err != nil { return err }   // catches mid-iteration failures

// Transactions
tx, err := db.BeginTx(ctx, nil)
if err != nil { return err }
defer tx.Rollback()                   // no-op after a successful Commit
if _, err := tx.ExecContext(ctx, "..."); err != nil { return err }
return tx.Commit()

// Placeholders are parameterised — NEVER fmt.Sprintf a query. SQL injection.`
    },

    { t: "note", kind: "tip", title: "database/sql, pgx, and the N+1 you will write", html: "<code>database/sql</code> is a driver-agnostic wrapper; for Postgres, <strong>pgx</strong> used natively (<code>pgxpool</code>) is faster and exposes real Postgres types, COPY, batching and <code>LISTEN/NOTIFY</code> — it also works as a <code>database/sql</code> driver if you want portability. Either way: the pool prepares and caches statements for you, so hand-rolled <code>Prepare</code> is rarely worth it; and watch for <strong>N+1</strong> — a loop that runs one query per row. Fix it with a join, or with <code>WHERE id = ANY($1)</code> and a single round trip. One query returning 500 rows beats 500 queries by two orders of magnitude, and the <code>-race</code>-clean goroutine pool will not save you from it." },
    { t: "note", kind: "deep", title: "Timers: the classic leak, and what Go 1.23 changed", html: "<code>time.After(d)</code> inside a <code>select</code> in a loop used to leak: the timer stayed alive for the full duration even after the select returned, so a hot loop with a 10-minute timeout accumulated timers. <strong>Go 1.23 made unreferenced timers eligible for collection immediately</strong> and stopped buffering their channel, which removes the leak and makes <code>Reset</code>/<code>Stop</code> behave intuitively. On any older version — or whenever the timeout is long and the loop is hot — use an explicit <code>timer := time.NewTimer(d)</code> with <code>defer timer.Stop()</code>. Always <code>defer ticker.Stop()</code> for a <code>time.Ticker</code> regardless of version." },

    { t: "h", text: "Graceful shutdown" },
    { t: "p", html: "On SIGTERM, stop accepting new requests and let the ones in flight finish, up to a deadline. <code>server.Shutdown(ctx)</code> does that. <code>Close</code> drops them. Pair it with <code>signal.NotifyContext</code>." },
    { t: "code", title: "Finish in-flight requests, then exit", code:
`func main() {
    srv := &http.Server{Addr: ":8080", Handler: mux}

    go func() {
        if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
            log.Fatal(err)
        }
    }()
    slog.Info("listening", "addr", srv.Addr)

    // Block until SIGINT/SIGTERM (Kubernetes sends SIGTERM before killing)
    ctx, stop := signal.NotifyContext(context.Background(),
        os.Interrupt, syscall.SIGTERM)
    defer stop()
    <-ctx.Done()

    slog.Info("shutting down")
    shutCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    if err := srv.Shutdown(shutCtx); err != nil {   // stop accepting, drain in-flight
        slog.Error("forced shutdown", "err", err)
    }
    // close the DB pool, flush traces, drain queues here
}`
    },
    { t: "note", kind: "tip", title: "Other stdlib packages worth knowing", html: "<code>os</code>/<code>io</code>/<code>bufio</code> (files and streams), <code>time</code> (durations, timers, <code>time.Time</code> is comparable), <code>flag</code> (CLI args), <code>text/template</code> and <code>html/template</code> (the latter auto-escapes), <code>regexp</code>, <code>sort</code>, <code>crypto/*</code>, <code>net/http/httptest</code>, <code>embed</code> (compile files into the binary), <code>sync</code>, <code>context</code>, <code>errors</code>." },
    { t: "code", title: "go:embed — ship assets inside the binary", code:
`import "embed"

//go:embed templates/*.html static/*
var assets embed.FS

tmpl := template.Must(template.ParseFS(assets, "templates/*.html"))
http.Handle("GET /static/", http.FileServerFS(assets))
// One binary, no missing-file-in-production incidents.`
    }
  ],
  summary: [
    "`net/http` since 1.22 routes on method and `{wildcards}`; read them with `r.PathValue`.",
    "Always set server timeouts — the zero-value http.Server has none, which is a DoS vector.",
    "Middleware is a `func(http.Handler) http.Handler`; compose by nesting. No framework required.",
    "JSON: struct tags control names, `omitempty` and `-`; use Encoder/Decoder for streams and cap request bodies with `http.MaxBytesReader`.",
    "`slog` (1.21+) gives structured JSON logging; `slog.With` attaches request-scoped fields.",
    "`sql.DB` is a connection *pool* — create one, share it, tune its limits, and use placeholders, never string formatting.",
    "After `rows.Next()` finishes, you must still check `rows.Err()`.",
    "Graceful shutdown: `signal.NotifyContext` + `srv.Shutdown(ctx)` so in-flight requests complete.",
    "`go:embed` compiles templates and static assets into the binary."
  ],
  quiz: [
    { q: "Go 1.22+: how do you read the `id` from the route `GET /users/{id}`?",
      options: ["`r.URL.Query().Get(\"id\")`", "`r.PathValue(\"id\")`", "`mux.Param(\"id\")`", "You need a third-party router"],
      answer: 1,
      explain: "The standard mux now supports method+wildcard patterns, with `r.PathValue` to read them." },
    { q: "Why is a bare `http.ListenAndServe(\":8080\", mux)` risky in production?",
      options: ["It's single-threaded", "No timeouts are set, so slow clients can tie up connections and goroutines indefinitely", "It doesn't support TLS", "It leaks memory"],
      answer: 1,
      explain: "Construct an `http.Server` and set Read/Write/Idle and especially ReadHeaderTimeout." },
    { q: "`sql.Open` returns successfully. Are you connected to the database?",
      options: ["Yes", "No — it's lazy; call PingContext to verify", "Only with a DSN that includes a timeout", "Only for Postgres"],
      answer: 1,
      explain: "`sql.Open` validates arguments and sets up a pool. Connections are made on demand." },
    { q: "Struct tag `json:\"-\"` means?",
      options: ["Rename the field to \"-\"", "Omit when empty", "Never marshal or unmarshal this field", "Required field"],
      answer: 2,
      explain: "`-` excludes it entirely; `,omitempty` is the one that drops empty values." },
    { q: "What does `srv.Shutdown(ctx)` do?",
      options: ["Kills connections immediately", "Stops accepting new connections and waits for in-flight requests until ctx expires", "Restarts the server", "Only closes listeners, leaving requests running forever"],
      answer: 1,
      explain: "That's graceful shutdown — paired with `signal.NotifyContext` it makes rolling deploys clean." }
  ]
},

/* ───────────────────────────── 20 ───────────────────────────── */
{
  id: "idiomatic-go",
  level: "Advanced",
  icon: "🏆",
  title: "Idiomatic Go, Performance & Where to Go Next",
  minutes: 18,
  blurb: "Naming, project layout, the common mistakes, a performance checklist, and a roadmap.",
  blocks: [
    { t: "h", text: "Naming" },
    { t: "p", html: "Packages are short, lower-case, and named for what they provide, not <code>util</code>. Exported names start with a capital letter. Do not stutter: <code>user.New</code>, not <code>user.NewUser</code>. Getters have no <code>Get</code> prefix." },
    { t: "code", title: "Short, lowercase, no stutter", code:
`// Packages: short, lowercase, singular, no underscores or camelCase
//   good: http, json, user, store
//   bad:  utils, helpers, common, myPackage, user_store
//   (a package named "utils" is a sign you haven't found the real boundary)

// NO STUTTER — the package name is part of the identifier at the call site
//   good: user.New(), http.Server, bytes.Buffer
//   bad:  user.NewUser(), http.HTTPServer, bytes.BytesBuffer

// Receivers and locals are short; the smaller the scope, the shorter the name
for i, v := range items { }
func (s *Server) Start() error
func (u User) Name() string

// Interfaces that hold one method are usually "-er"
Reader, Writer, Stringer, Closer, Handler

// Getters drop the Get prefix; setters keep Set
u.Name()        // not u.GetName()
u.SetName(n)

// Initialisms keep their case: URL, ID, HTTP, API
userID, serveHTTP, parseURL, APIKey`
    },

    { t: "h", text: "The mistakes nearly everyone makes once" },
    { t: "p", html: "Each row is a mistake the compiler will not catch, and the habit that replaces it." },
    { t: "table", head: ["Mistake", "Instead"],
      rows: [
        ["Ignoring errors with <code>_</code>", "Handle, wrap, or deliberately comment why it's safe"],
        ["<code>append</code> without reassigning", "<code>s = append(s, v)</code> — always"],
        ["Assuming map iteration order", "Collect keys and sort them"],
        ["<code>defer</code> inside a loop body", "Extract a function, or close explicitly per iteration"],
        ["Returning a typed nil pointer as <code>error</code>", "Return literal <code>nil</code>"],
        ["A goroutine with no exit path", "Give it a <code>ctx.Done()</code> case or a closed channel"],
        ["Forgetting <code>defer cancel()</code>", "Defer it immediately after creating the context"],
        ["<code>panic</code> for expected failures", "Return an <code>error</code>"],
        ["Big interfaces, declared next to the implementation", "Small interfaces, declared where they're consumed"],
        ["Keeping a tiny slice of a huge array", "<code>slices.Clone</code> the piece you need"],
        ["Mutex copied by value (value receiver)", "Pointer receivers on any type holding a mutex"],
        ["<code>time.Sleep</code> to coordinate goroutines", "Channels, WaitGroup, or <code>sync.Cond</code>"],
        ["Building SQL with <code>fmt.Sprintf</code>", "Placeholders (<code>$1</code>/<code>?</code>)"],
        ["A package named <code>utils</code>", "Name it after what it does"]
      ]
    },

    { t: "h", text: "Performance checklist — in priority order" },
    { t: "p", html: "Measure before you change anything. Then, in order: do less work, allocate less, and only then reach for tricks. A profile tells you which of those matters. A guess usually optimises the wrong function." },
    { t: "list", ordered: true, items: [
      "<strong>Measure.</strong> <code>-benchmem</code>, then pprof, then <code>go tool trace</code>. Optimising unmeasured code is how readable programs die.",
      "<strong>Fix the algorithm first.</strong> O(n²) → O(n log n) beats every micro-optimisation combined.",
      "<strong>Preallocate.</strong> <code>make([]T, 0, n)</code> and <code>make(map[K]V, n)</code> turn many growth reallocations into one.",
      "<strong>Reduce allocation count, not bytes.</strong> GC cost tracks live pointer-bearing objects. <code>strings.Builder</code>, <code>sync.Pool</code>, reused buffers.",
      "<strong>Avoid <code>any</code> on hot paths.</strong> Boxing forces a heap escape; <code>fmt.Sprintf</code> is far slower than <code>strconv</code>.",
      "<strong>Pass small structs by value</strong> (stack, no GC); use pointers for large ones.",
      "<strong>Bound your concurrency.</strong> Unbounded goroutines just move the bottleneck to memory and the scheduler.",
      "<strong>Tune the GC last:</strong> <code>GOGC</code> and <code>GOMEMLIMIT</code> trade memory for CPU without touching code."
    ]},

    { t: "h", text: "Profile-guided optimisation — the free 5%" },
    { t: "p", html: "PGO feeds a real CPU profile back into the compiler so it inlines the functions your program actually calls. Put the profile next to <code>main</code> as <code>default.pgo</code> and <code>go build</code> uses it. The gain is usually a few percent, not a rewrite." },
    { t: "code", title: "PGO: Go 1.21+, and almost nobody uses it", code:
`# 1. Collect a CPU profile from PRODUCTION (or a representative load test)
curl -o cpu.pprof 'http://prod-host:6060/debug/pprof/profile?seconds=60'

# 2. Commit it as default.pgo next to the main package
cp cpu.pprof ./cmd/server/default.pgo

# 3. That's it. go build picks it up automatically:
go build ./cmd/server          # "-pgo=auto" is the default since 1.21

# The compiler now knows which call sites are hot, so it inlines more
# aggressively there, devirtualises interface calls it can prove, and improves
# block layout. Typical gain: 2-7% CPU for zero code change — and it compounds
# with everything else you do. Refresh the profile every few releases.
go build -pgo=off ./...        # opt out
go build -pgo=./prod.pprof ./...`
    },

    { t: "h", text: "What the compiler does for you (and how to see it)" },
    { t: "p", html: "The compiler inlines small functions, removes dead code, and decides stack versus heap. <code>go build -gcflags=\"-m\"</code> prints those decisions. You do not annotate them yourself." },
    { t: "code", title: "Inlining, bounds-check elimination, devirtualisation", code:
`go build -gcflags="-m -m" ./...     # inlining + escape decisions, verbosely
go build -gcflags="-d=ssa/check_bce/debug=1" ./...   # bounds checks NOT eliminated

# Inlining budget: a function is inlinable if its "cost" is under ~80 nodes and
# it contains no defer-in-loop, recover, select, or (historically) closures.
# Small accessor methods are free. A 200-line function never inlines, which is
# one real reason to keep hot functions small.
//go:noinline          // force it off (benchmarks, debugging)

# Bounds-check elimination: the compiler removes s[i] checks it can prove safe.
# Help it by hoisting the length:
for i := 0; i < len(s); i++ { s[i]++ }          // BCE applies
_ = s[:n]                                       // a single early check can
for i := 0; i < n; i++ { s[i]++ }               // license the whole loop

# False sharing: two hot counters in the same 64-byte cache line will fight
# across cores. Pad them, or give each P its own counter and sum on read.
type counter struct { n atomic.Int64; _ [56]byte }`
    },

    { t: "h", text: "Build tags, generate, and cgo" },
    { t: "p", html: "A build tag such as <code>//go:build integration</code> includes a file only when you pass <code>-tags=integration</code>. <code>go generate</code> runs commands you listed, such as stringer. cgo calls C code. It works, and it makes cross compiling and the race detector harder, so prefer pure Go." },
    { t: "code", title: "Conditional compilation and code generation", code:
`//go:build linux && amd64 && !race
package main
// One build constraint line, directly above the package clause, blank line
// after it. Implicit constraints come from the FILENAME too:
//   store_linux.go  store_windows.go  store_amd64.go  store_test.go
// Custom tags: go build -tags "integration,enterprise"
// Guard slow tests:  //go:build integration

//go:generate stringer -type=Status
//go:generate mockgen -source=store.go -destination=mock_store.go
// Then: go generate ./...   — it is NOT run by go build. Commit the output.

// Go 1.24+: declare tool dependencies in go.mod instead of a tools.go hack
//   go get -tool golang.org/x/tools/cmd/stringer
//   go tool stringer -type=Status`
    },
    { t: "note", kind: "deep", title: "cgo: the costs, stated plainly", html: "<code>import \"C\"</code> lets you call C — and gives up a lot. Each call crosses from a goroutine stack to a system stack (tens to hundreds of nanoseconds, versus ~1 ns for a Go call), the goroutine occupies an OS thread for the duration (so a blocking C call can force the runtime to spawn threads), builds slow down and need a C toolchain, <strong>cross-compilation effectively breaks</strong>, the race detector and profilers go blind inside C, and Go's GC cannot see C memory (so you manage lifetimes by hand, with <code>runtime.Pinner</code> or explicit copies). Use it for a genuinely irreplaceable library (SQLite, libvips, a vendor SDK); reach for a pure-Go port (<code>modernc.org/sqlite</code>) first; and if you must, keep the boundary coarse — one call that does a lot, not a million tiny ones." },
    { t: "note", kind: "warn", title: "unsafe: the escape hatch, and its two legitimate uses", html: "<code>unsafe.Pointer</code> defeats the type system and the GC's assumptions; the rules in its documentation are the <em>only</em> valid patterns, and \"it works today\" is not one of them. The two uses worth knowing: <code>unsafe.String(ptr, len)</code> and <code>unsafe.Slice(ptr, len)</code> (Go 1.20+) for a zero-copy <code>[]byte</code>↔<code>string</code> view on a provably immutable buffer, and <code>unsafe.Sizeof/Offsetof/Alignof</code> for reasoning about layout. Everything else — pointer arithmetic, struct punning, reaching into another package's fields — will break on a compiler upgrade. Measure first: the allocation you're avoiding is usually not the bottleneck." },

    { t: "h", text: "The tooling you should wire into CI" },
    { t: "p", html: "A useful pipeline is <code>go test ./...</code>, <code>go vet</code>, and a linter, on every change. <code>govulncheck</code> reports vulnerabilities your code can actually reach. Formatting is <code>gofmt</code>, and CI should fail if it would change a file." },
    { t: "code", title: "A reasonable baseline", code:
`gofmt -l .                 # or gofumpt: stricter
go vet ./...               # ships with Go; catches real bugs
go test -race -cover ./...
golangci-lint run          # meta-linter: errcheck, staticcheck, ineffassign, revive...
staticcheck ./...          # excellent on its own
govulncheck ./...          # official: flags CVEs in your dependency graph
go mod tidy -diff          # fails if go.mod/go.sum are stale (1.22+)`
    },
    { t: "note", kind: "tip", title: "Read the canon", html: "<a href=\"https://go.dev/doc/effective_go\" target=\"_blank\" rel=\"noopener\">Effective Go</a>, the <a href=\"https://go.dev/wiki/CodeReviewComments\" target=\"_blank\" rel=\"noopener\">Code Review Comments</a> wiki, <a href=\"https://google.github.io/styleguide/go/\" target=\"_blank\" rel=\"noopener\">Google's Go Style Guide</a>, and <a href=\"https://go.dev/doc/faq\" target=\"_blank\" rel=\"noopener\">the FAQ</a> (which explains <em>why</em> the language is shaped this way). Then read standard library source — it's the best Go you'll find, and <code>go doc -src</code> is one command away." },

    { t: "h", text: "Proverbs that are actually useful" },
    { t: "p", html: "These are short rules from the Go community. Each one is a decision you can apply: return an error rather than panic, accept interfaces and return structs, and do not communicate by sharing memory." },
    { t: "list", items: [
      "<em>Clear is better than clever.</em>",
      "<em>Don't communicate by sharing memory; share memory by communicating.</em>",
      "<em>The bigger the interface, the weaker the abstraction.</em>",
      "<em>Make the zero value useful.</em>",
      "<em>A little copying is better than a little dependency.</em>",
      "<em>Errors are values.</em>",
      "<em>Don't just check errors, handle them gracefully.</em>",
      "<em>Design the architecture, name the components, document the details.</em>"
    ]},

    { t: "h", text: "What to build next" },
    { t: "p", html: "Pick a project in this course that matches what you want to ship: a CLI, an HTTP service, or something concurrent. The point of the project is to use the standard library, not to add a framework first." },
    { t: "list", ordered: true, items: [
      "<strong>A CLI tool</strong> — <code>flag</code> or <code>cobra</code>: a file renamer, a log parser, an HTTP load tester.",
      "<strong>A JSON REST API</strong> with Postgres, migrations, middleware, and real tests.",
      "<strong>A concurrent web crawler</strong> — bounded workers, context cancellation, dedupe, rate limiting. This exercises everything in Module 11.",
      "<strong>A tiny key-value store</strong> with a write-ahead log and an HTTP API — teaches file I/O, encoding, and locking.",
      "<strong>Something with gRPC</strong> (protobuf + <code>grpc-go</code>) once REST feels routine.",
      "<strong>Contribute</strong> to a Go project you already run: Kubernetes, Prometheus, Grafana, Traefik, Hugo all take first-timers."
    ]},
    { t: "p", html: "Interactive practice: <a href=\"https://go.dev/tour/\" target=\"_blank\" rel=\"noopener\">A Tour of Go</a> (official, in-browser), <a href=\"https://gobyexample.com\" target=\"_blank\" rel=\"noopener\">Go by Example</a>, <a href=\"https://exercism.org/tracks/go\" target=\"_blank\" rel=\"noopener\">Exercism's Go track</a> (human mentoring), <a href=\"https://quii.gitbook.io/learn-go-with-tests\" target=\"_blank\" rel=\"noopener\">Learn Go with Tests</a>, and the <a href=\"https://go.dev/play/\" target=\"_blank\" rel=\"noopener\">Playground</a> for anything you want to check in ten seconds." },

    { t: "h", text: "Write these five programs" },
    { t: "p", html: "These use the advanced lessons: goroutines, channels, <code>select</code>, <code>context</code>, generics, iterators or the standard library, HTTP, and tests. One of them searches a sorted slice. Each one should be small enough to finish in one sitting. You are done when <code>go test</code> or the running program matches the description." },
    { t: "list", ordered: true, items: [
      "<strong>Worker pool.</strong> Three goroutines read integers from a jobs channel, square them, and send the squares on a results channel. Close the jobs channel after the numbers are sent. <code>main</code> prints every square. The results channel is closed only after the workers finish, so <code>main</code> does not exit early.",
      "<strong>Cancel the work.</strong> <code>work(ctx context.Context) error</code> loops until <code>ctx</code> is done, then returns <code>ctx.Err()</code>. Call it with a context that times out after a short time, and print the error. The function stops because the context ended.",
      "<strong>Generic binary search.</strong> <code>func Search[T cmp.Ordered](a []T, target T) int</code> searches a sorted slice and returns the index, or <code>-1</code> when <code>target</code> is missing. On <code>[]int{1, 3, 5, 7, 9}</code>, searching for <code>7</code> prints <code>3</code> and searching for <code>4</code> prints <code>-1</code>. The same function works for a sorted slice of strings.",
      "<strong>Hello service.</strong> An <code>http.Server</code> with <code>ReadHeaderTimeout</code> set. <code>GET /hello</code> writes the <code>name</code> query, or <code>world</code> when the query is empty. Any other path returns <code>404</code>. Request both URLs and show the status and the body.",
      "<strong>A table test of Search.</strong> Put <code>Search</code> in a package. <code>Test</code> it with a slice of cases: the sorted input, the target, and the wanted index. Include a hit, a miss, and an empty slice. A wrong row fails with the case index. <code>go test</code> passes."
    ]}
  ],
  summary: [
    "Names: short lowercase packages, no stutter (`user.New`, not `user.NewUser`), `-er` interfaces, short receivers, initialisms keep their case.",
    "The recurring bugs: unreassigned append, defer in a loop, typed-nil errors, leaked goroutines, missing `defer cancel()`, copied mutexes.",
    "Declare interfaces where they're consumed, and keep them small.",
    "Performance order: measure → algorithm → preallocate → cut allocations → avoid `any` → bound concurrency → tune GC.",
    "Commit a production CPU profile as `default.pgo` next to main: PGO is automatic since 1.21 and typically buys 2–7% CPU for free.",
    "Keep hot functions small so they fit the inlining budget; check decisions with `-gcflags=\"-m -m\"`.",
    "Build tags (`//go:build`) and filename suffixes do conditional compilation; `go:generate` output is committed, and 1.24+ declares tools in go.mod.",
    "cgo costs cross-stack calls, a pinned thread, cross-compilation and tooling visibility — prefer a pure-Go library; `unsafe` is for zero-copy string/slice views and layout maths, nothing else.",
    "CI baseline: gofmt, go vet, `-race`, golangci-lint/staticcheck, govulncheck, `go mod tidy -diff`.",
    "\"Clear is better than clever.\" Then go build a crawler, an API, and a CLI."
  ],
  quiz: [
    { q: "Which constructor name is idiomatic in package `user`?",
      options: ["`user.NewUser()`", "`user.New()`", "`user.CreateUserObject()`", "`user.Make_User()`"],
      answer: 1,
      explain: "Avoid stutter — the call site already reads `user.New()`." },
    { q: "Where should an interface be declared?",
      options: ["Next to its implementation", "In an `interfaces` package", "In the package that consumes it, listing only the methods used", "In the main package"],
      answer: 2,
      explain: "Consumer-side interfaces stay small, avoid coupling, and make faking trivial." },
    { q: "First step when a service is too slow?",
      options: ["Add goroutines", "Tune GOGC", "Profile it to find the actual bottleneck", "Rewrite hot loops in assembly"],
      answer: 2,
      explain: "Measure first — intuition about Go performance is wrong surprisingly often." },
    { q: "Why is `utils` a poor package name?",
      options: ["It's reserved", "It's too long", "It describes nothing, so it accumulates unrelated code and creates import cycles", "gofmt rejects it"],
      answer: 2,
      explain: "Packages should be named for what they provide. A `utils` package is a missing abstraction." },
    { q: "\"The bigger the interface, the weaker the abstraction\" argues for:",
      options: ["Avoiding interfaces entirely", "Small, focused interfaces — often one method", "One large interface per package", "Interfaces only in tests"],
      answer: 1,
      explain: "Small interfaces are easy to satisfy and compose — exactly why `io.Reader` is everywhere." }
  ]
}

]);
