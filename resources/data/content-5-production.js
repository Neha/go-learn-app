/* Modules 21–24 : Production */
window.CURRICULUM_PARTS = window.CURRICULUM_PARTS || [];
window.CURRICULUM_PARTS.push([

/* ───────────────────────────── 21 ───────────────────────────── */
{
  id: "production-readiness",
  level: "Production",
  icon: "🚢",
  title: "Production Readiness: Config, Builds & Deployment",
  minutes: 24,
  blurb: "Config and secrets, 12-factor layout, reproducible builds, 15 MB containers, CI gates, migrations.",
  blocks: [
    { t: "p", html: "A Go binary that runs on your laptop is maybe 60% of the work. This module is the other 40%: how the program is <em>configured</em>, <em>built</em>, <em>shipped</em> and <em>upgraded</em> without waking anyone up." },

    { t: "h", text: "Configuration" },
    { t: "p", html: "Read configuration from the environment at startup, check it, and then do not change it. A missing required value should stop the process before it serves traffic. Do not scatter <code>os.Getenv</code> through the program." },
    { t: "code", title: "config/config.go, load, validate, fail fast", code:
`type Config struct {
    Env         string        // dev | staging | prod
    Addr        string
    DatabaseURL string
    LogLevel    slog.Level
    Timeout     time.Duration
    MaxConns    int
}

func Load() (*Config, error) {
    c := &Config{
        Env:         env("APP_ENV", "dev"),
        Addr:        env("ADDR", ":8080"),
        DatabaseURL: env("DATABASE_URL", ""),
        Timeout:     envDur("HTTP_TIMEOUT", 15*time.Second),
        MaxConns:    envInt("DB_MAX_CONNS", 25),
    }
    // VALIDATE AT STARTUP. A missing variable must crash the process now,
    // not produce a 500 at 3am on the one code path that reads it.
    var errs []error
    if c.DatabaseURL == "" { errs = append(errs, errors.New("DATABASE_URL is required")) }
    if c.MaxConns < 1     { errs = append(errs, errors.New("DB_MAX_CONNS must be >= 1")) }
    if c.Env == "prod" && c.LogLevel == slog.LevelDebug {
        errs = append(errs, errors.New("debug logging is not allowed in prod"))
    }
    return c, errors.Join(errs...)
}

func env(k, def string) string { if v, ok := os.LookupEnv(k); ok { return v }; return def }

// In main: load, then pass the config DOWN explicitly. No global config var,
// no os.Getenv scattered through business logic, that is untestable.
func main() {
    cfg, err := config.Load()
    if err != nil { log.Fatalf("config: %v", err) }
    if err := run(context.Background(), cfg); err != nil { log.Fatal(err) }
}`
    },
    { t: "note", kind: "tip", title: "The twelve-factor rules that genuinely matter for Go", html: "<strong>Config in the environment</strong> (one build artifact for every environment, never <code>if env == \"prod\"</code> branches in business logic). <strong>Logs to stdout</strong> as a stream, never write log files or rotate them yourself; the platform does that. <strong>Stateless processes</strong> so you can scale horizontally and be killed at any moment. <strong>Dev/prod parity</strong>: the same container image you tested is the one you deploy." },
    { t: "note", kind: "warn", title: "Secrets", html: "Environment variables are fine for <em>config</em>, acceptable for secrets, and <strong>never</strong> fine in source, in a committed <code>.env</code>, in a container image layer, or in your logs. Pull them from your platform's secret store (AWS Secrets Manager, Vault, Kubernetes Secrets mounted as files) at startup. Never log a whole config struct, give secret fields a <code>String()</code> method that returns <code>\"[REDACTED]\"</code>, or use a <code>type Secret string</code> wrapper so a stray <code>%v</code> can't leak it." },

    { t: "h", text: "Project layout" },
    { t: "p", html: "<code>cmd</code> is the programs. <code>internal</code> is the rest, and other modules cannot import it. Keep <code>main</code> thin: parse flags, build the dependencies, and call <code>Run</code>." },
    { t: "code", title: "A pragmatic structure", code:
`myservice/
├── cmd/
│   ├── server/main.go        # thin: load config, wire deps, call run()
│   └── migrate/main.go       # separate binaries for separate jobs
├── internal/                 # compiler-enforced private
│   ├── config/
│   ├── http/                 # transport: handlers, middleware, routing
│   │   ├── handler_user.go
│   │   └── handler_user_test.go
│   ├── user/                 # DOMAIN: types + business rules, no SQL, no HTTP
│   ├── postgres/             # one adapter per external dependency
│   └── observability/
├── migrations/
│   ├── 0001_users.up.sql
│   └── 0001_users.down.sql
├── deploy/  Dockerfile  compose.yaml  k8s/
├── .github/workflows/ci.yaml
├── Makefile
└── go.mod

Dependencies point INWARD: http -> user <- postgres. The domain package imports
neither of them, which is what makes it testable without a database.`
    },
    { t: "code", title: "main.go: a run() function is worth the five extra lines", code:
`func main() {
    if err := run(); err != nil {
        slog.Error("fatal", "err", err)
        os.Exit(1)
    }
}

func run() error {
    cfg, err := config.Load()
    if err != nil { return err }

    ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
    defer stop()

    db, err := postgres.Open(ctx, cfg.DatabaseURL, cfg.MaxConns)
    if err != nil { return fmt.Errorf("db: %w", err) }
    defer db.Close()

    svc := user.NewService(postgres.NewUserStore(db))
    srv := httpx.NewServer(cfg, svc)

    return srv.Run(ctx)   // blocks until ctx is cancelled, then drains
}
// Why: main() can't be tested or deferred from (os.Exit skips defers).
// run() returning an error makes the whole startup path testable.`
    },

    { t: "h", text: "Builds" },
    { t: "p", html: "<code>-trimpath</code> removes your machine's paths from the binary. <code>-ldflags=\"-s -w\"</code> drops debug symbols and makes the file smaller. <code>CGO_ENABLED=0</code> keeps the binary from depending on a C library on the target machine." },
    { t: "code", title: "The release build", code:
`VERSION := $(shell git describe --tags --always --dirty)
COMMIT  := $(shell git rev-parse --short HEAD)
DATE    := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)

build:
	CGO_ENABLED=0 go build \\
	  -trimpath \\                                 # drop local filesystem paths
	  -ldflags "-s -w \\                            # strip symbols + DWARF
	    -X main.version=$(VERSION) \\
	    -X main.commit=$(COMMIT) \\
	    -X main.buildDate=$(DATE)" \\
	  -o bin/server ./cmd/server

# In the program, declare the targets as vars and expose them:
#   var version, commit, buildDate = "dev", "none", "unknown"
#   mux.HandleFunc("GET /version", ...)   // priceless during an incident
# Or read what the toolchain already embedded:
#   info, _ := debug.ReadBuildInfo()      // module versions + VCS data
#   go version -m ./bin/server            // from outside the process`
    },
    { t: "note", kind: "deep", title: "Why CGO_ENABLED=0 matters", html: "With cgo enabled, your binary dynamically links the host's libc and resolves DNS through it, so it may not run on a different distro, and it won't run in a <code>scratch</code> container at all. <code>CGO_ENABLED=0</code> gives a fully static binary using Go's own DNS resolver. The cost: no <code>sqlite3</code> C driver (use <code>modernc.org/sqlite</code>), and <code>os/user</code> lookups are limited." },

    { t: "h", text: "Containers" },
    { t: "p", html: "Build in one image that has the Go toolchain, and copy only the binary into a small final image. Run as a user who is not root. The container then has nothing to attack except your program." },
    { t: "code", title: "Dockerfile, a ~15 MB image", code:
`# ---- build stage ----
FROM golang:1.23-alpine AS build
WORKDIR /src
# Copy manifests first so the dependency layer caches independently of your code
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o /out/server ./cmd/server

# ---- run stage ----
FROM gcr.io/distroless/static-debian12:nonroot
# alternatives: scratch (smallest, no CA certs/tzdata) or alpine (has a shell)
COPY --from=build /out/server /server
COPY --from=build /src/migrations /migrations
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]

# Rules worth following:
#  • multi-stage: the toolchain (~800 MB) never ships
#  • distroless/scratch: no shell, no package manager -> a tiny attack surface
#  • run as non-root; add a read-only root filesystem in your orchestrator
#  • COPY go.mod/go.sum before the source, or every edit re-downloads deps
#  • scratch needs ca-certificates and tzdata copied in explicitly
#  • never bake secrets into a layer, layers are forever`
    },
    { t: "note", kind: "warn", title: "GOMAXPROCS and GOMEMLIMIT in containers", html: "A container with a 1-CPU quota still reports the host's core count to older Go versions, so <code>GOMAXPROCS</code> could be 64 on a 1-CPU limit, causing heavy scheduler churn and CPU throttling. Go 1.25 made the runtime cgroup-aware; before that, use <code>go.uber.org/automaxprocs</code> (a single blank import). Independently, always set <strong><code>GOMEMLIMIT</code> to ~80% of the memory limit</strong>, the GC does not know about cgroup limits and will happily grow into an OOM kill." },

    { t: "h", text: "Database migrations" },
    { t: "list", items: [
      "A migration is a SQL change with a version, applied in order, and recorded so it is not applied twice.",
      "Commit the SQL next to the code.",
      "Do not edit a migration that has already run in production.",
      "Add a new one.",
    ]},
    { t: "code", title: "Versioned, forward-only in practice, never ad-hoc", code:
`# golang-migrate, goose and atlas are the common choices
migrate create -ext sql -dir migrations -seq add_users_table
migrate -database "$DATABASE_URL" -path migrations up
migrate -database "$DATABASE_URL" -path migrations down 1

# Embed them so the binary is self-contained:
#   //go:embed migrations/*.sql
#   var migrationsFS embed.FS

# Rules learned the hard way:
#  • run migrations as a SEPARATE step (init container / deploy job), not in
#    your server's startup path, N replicas starting at once will race
#  • every migration must be BACKWARD COMPATIBLE with the running code, because
#    during a rolling deploy both versions serve traffic simultaneously
#  • dropping a column is TWO releases: (1) stop reading it, deploy,
#    (2) drop it. Renaming is add + backfill + switch + drop.
#  • large backfills go in batches, outside the migration`
    },

    { t: "h", text: "CI" },
    { t: "p", html: "Run tests, <code>go vet</code>, and the race detector on every pull request. A green build should mean the program compiles, the tests pass, and the obvious mistakes are gone. Formatting and vulnerability checks belong in that same job." },
    { t: "code", title: ".github/workflows/ci.yaml", code:
`name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test }
        options: >-
          --health-cmd pg_isready --health-interval 5s --health-retries 10
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: "1.23", cache: true }

      - run: go mod download
      - run: test -z "$(gofmt -l .)" || (gofmt -l . && exit 1)
      - run: go vet ./...
      - run: go build ./...
      - run: go test -race -coverprofile=cover.out ./...
      - run: go mod tidy -diff           # fails if go.mod/go.sum are stale
      - uses: golangci/golangci-lint-action@v6
      - run: go run golang.org/x/vuln/cmd/govulncheck@latest ./...
      - run: |
          GOOS=linux GOARCH=amd64 go build ./...   # cross-compile smoke test
          GOOS=darwin GOARCH=arm64 go build ./...`
    },
    { t: "table", head: ["Gate", "Catches", "Blocking?"],
      rows: [
        ["<code>gofmt -l</code>", "Formatting drift and merge noise", "yes"],
        ["<code>go vet</code>", "Printf mismatches, lost cancel, bad struct tags, copied locks", "yes"],
        ["<code>go test -race</code>", "Data races, the bugs you can't reproduce later", "yes"],
        ["<code>golangci-lint</code>", "Unchecked errors, dead code, shadowing, nilness", "yes"],
        ["<code>govulncheck</code>", "CVEs reachable from <em>your</em> call graph", "yes"],
        ["<code>go mod tidy -diff</code>", "Stale go.mod/go.sum in a PR", "yes"],
        ["Coverage threshold", "Untested new code", "warn, a number is not a goal"],
        ["Container build + scan", "Base-image CVEs, bloated images", "yes on release"]
      ]
    },

    { t: "h", text: "Versioning and releases" },
    { t: "list", items: [
      "Tag a release with a version such as <code>v1.4.0</code>.",
      "The module path and the tag must agree.",
      "A changelog says what changed for the people who depend on you.",
      "<code>goreleaser</code> can build the binaries for each OS from that tag.",
    ]},
    { t: "code", title: "Semver, and the module major-version rule", code:
`git tag v1.4.0 && git push origin v1.4.0     # that is a Go "release"

# Breaking change? Go requires the major version IN THE MODULE PATH from v2 on:
#   module github.com/you/lib/v2
# so v1 and v2 can coexist in one build. This is the whole reason Go libraries
# are so reluctant to break APIs, do the work to stay compatible.

# For applications: build once per tag, publish the image by DIGEST, and deploy
# that digest. Never deploy :latest, you cannot roll back to a moving tag.`
    },
    { t: "note", kind: "tip", title: "Feature flags over long-lived branches", html: "Ship dark, enable per-tenant or per-percentage, and keep the kill switch for the first week. A flag you can flip in seconds beats a rollback that takes ten minutes, and it decouples \"deployed\" from \"released\", which is what lets you deploy twenty times a day safely. Delete the flag once the feature is permanent; stale flags become untested code paths." }
  ],
  summary: [
    "Configure from the environment, validate it all at startup, then pass config down explicitly, no globals, no `os.Getenv` in business logic.",
    "Secrets come from a secret store, never from source or image layers; redact them in logging via a wrapper type.",
    "`cmd/` thin, `internal/` private, domain packages free of SQL and HTTP; dependencies point inward.",
    "Give main a `run() error` so startup is testable and defers actually run.",
    "Release builds: `CGO_ENABLED=0 -trimpath -ldflags \"-s -w -X main.version=…\"`, static and reproducible.",
    "Multi-stage Dockerfile onto distroless/scratch as non-root → ~15 MB image with almost no attack surface.",
    "Set `GOMEMLIMIT` to ~80% of the container memory limit, and make GOMAXPROCS cgroup-aware (automaxprocs before Go 1.25).",
    "Migrations are versioned, run as a separate deploy step, and must be backward compatible with the currently running code.",
    "CI gates: gofmt, vet, `-race`, golangci-lint, govulncheck, `go mod tidy -diff`, cross-compile.",
    "Tag semver; from v2 the major version lives in the module path. Deploy image digests, never `:latest`."
  ],
  quiz: [
    { q: "Why validate the entire configuration at startup instead of when each value is first read?",
      options: ["It's faster", "A missing or invalid value crashes immediately and visibly, instead of causing a 500 on one rare code path later", "The compiler requires it", "To avoid using environment variables"],
      answer: 1,
      explain: "Fail fast. A bad deploy should never start serving; it should refuse to boot so your orchestrator halts the rollout." },
    { q: "What does `CGO_ENABLED=0` give you for container deployments?",
      options: ["A smaller GC", "A fully static binary with no libc dependency, so it runs in scratch/distroless", "Faster compilation only", "Automatic TLS"],
      answer: 1,
      explain: "With cgo on, the binary dynamically links the host libc and resolves DNS through it, it may not even start in a minimal image." },
    { q: "Your Go service is OOM-killed in a 1 GiB container even though the heap looks fine. First fix?",
      options: ["Raise GOMAXPROCS", "Set `GOMEMLIMIT` to roughly 80% of the container limit", "Call runtime.GC() periodically", "Switch to a larger base image"],
      answer: 1,
      explain: "The GC has no knowledge of cgroup limits; GOMEMLIMIT gives the pacer a budget to respect so it collects harder instead of overshooting." },
    { q: "Why must a migration be backward compatible with the currently running code?",
      options: ["Databases require it", "During a rolling deploy, old and new versions serve traffic at the same time against the same schema", "To allow `migrate down`", "It isn't, just take downtime"],
      answer: 1,
      explain: "That's why dropping a column takes two releases: stop reading it, deploy, then drop it." },
    { q: "Which is the weakest CI gate of these four?",
      options: ["`go test -race`", "`govulncheck`", "A coverage percentage threshold", "`go vet`"],
      answer: 2,
      explain: "Coverage measures execution, not assertions, it's easy to game and says nothing about whether behaviour is checked. Useful as a signal, poor as a gate." }
  ]
},

/* ───────────────────────────── 22 ───────────────────────────── */
{
  id: "reliability-observability",
  level: "Production",
  icon: "📡",
  title: "Reliability & Observability",
  minutes: 26,
  blurb: "Timeouts, retries with jitter, circuit breakers, load shedding, logs/metrics/traces, health checks.",
  blocks: [
    { t: "p", html: "Two questions decide whether a Go service is production-grade: <strong>what happens when a dependency is slow or down?</strong> and <strong>when it breaks at 3am, can you tell why in under five minutes?</strong>" },

    { t: "h", text: "Timeouts" },
    { t: "p", html: "Every network call needs a deadline. Without one, a stuck peer holds a goroutine and a connection forever. Set the timeout on the HTTP client and on the server, and pass a <code>context</code> that cancels." },
    { t: "code", title: "Every boundary gets a deadline", code:
`// 1. SERVER, the zero-value http.Server has NO timeouts
srv := &http.Server{
    Addr:              cfg.Addr,
    Handler:           handler,
    ReadHeaderTimeout: 5 * time.Second,     // stops Slowloris
    ReadTimeout:       15 * time.Second,
    WriteTimeout:      15 * time.Second,
    IdleTimeout:       60 * time.Second,
}

// 2. CLIENT, the zero-value http.Client waits FOREVER
client := &http.Client{
    Timeout: 10 * time.Second,              // total: dial + TLS + body read
    Transport: &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 10,            // default is 2, a real bottleneck
        IdleConnTimeout:     90 * time.Second,
        TLSHandshakeTimeout: 5 * time.Second,
    },
}

// 3. PER-REQUEST BUDGET, propagated down the whole call tree
ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
defer cancel()
rows, err := db.QueryContext(ctx, q)        // the DB call inherits the deadline

// 4. DOWNSTREAM BUDGETS MUST BE SMALLER than your own, or you return 504 after
//    the client already gave up. Spend the budget: 3s inbound -> 1s per
//    dependency, leaving room for retries and your own work.`
    },
    { t: "note", kind: "warn", title: "A missing timeout is a latent outage", html: "Without one, a slow dependency converts into unbounded goroutines, unbounded memory, and an exhausted connection pool, your service dies of something that never actually failed. Timeouts turn an availability problem into a <em>fast, visible</em> error you can handle." },

    { t: "h", text: "Retries" },
    { t: "p", html: "Retry a read that failed because of a network blip. Do not blindly retry a payment. Wait longer after each failure, and add a random jitter so every client does not retry at the same instant." },
    { t: "code", title: "Exponential backoff with full jitter", code:
`func retry(ctx context.Context, attempts int, base time.Duration, f func() error) error {
    var err error
    for i := 0; i < attempts; i++ {
        if err = f(); err == nil { return nil }
        if !retryable(err) { return err }               // 400s: never retry
        if i == attempts-1 { break }

        // FULL JITTER: random in [0, base*2^i). Plain exponential backoff
        // re-synchronises every client into a thundering herd.
        // math/rand/v2: Int64N, auto-seeded, no rand.Seed needed
        backoff := time.Duration(rand.Int64N(int64(base) << i))
        select {
        case <-time.After(backoff):
        case <-ctx.Done():
            return ctx.Err()                            // respect the deadline
        }
    }
    return fmt.Errorf("after %d attempts: %w", attempts, err)
}

// Retry ONLY:
//   • idempotent operations (GET, PUT, DELETE, and POST only with an
//     Idempotency-Key the server deduplicates on)
//   • transient failures: connection refused, 429, 502/503/504, timeouts
// NEVER retry: 400, 401, 403, 404, 409, 422, the answer will not change.
// And cap total attempts: 3 retries at every layer of a 4-layer stack is 256
// requests from one user action. Retry at ONE layer, closest to the dependency.`
    },

    { t: "h", text: "Load shedding" },
    { t: "p", html: "When the process is out of capacity, refuse new work with a clear error instead of accepting it and missing every deadline. A limit on in-flight requests is the usual switch." },
    { t: "code", title: "Circuit breaker, bulkhead, rate limit", code:
`// CIRCUIT BREAKER, stop hammering a dependency that is clearly down.
// CLOSED (normal) -> too many failures -> OPEN (fail instantly, no call)
// -> after a cooldown -> HALF-OPEN (let one probe through) -> CLOSED or OPEN.
// Use sony/gobreaker rather than writing your own.
cb := gobreaker.NewCircuitBreaker(gobreaker.Settings{
    Name:        "payments",
    MaxRequests: 1,
    Timeout:     30 * time.Second,
    ReadyToTrip: func(c gobreaker.Counts) bool {
        return c.Requests >= 20 && float64(c.TotalFailures)/float64(c.Requests) > 0.5
    },
})
res, err := cb.Execute(func() (any, error) { return client.Charge(ctx, req) })

// BULKHEAD, cap concurrency per dependency so one slow backend cannot
// consume every worker in the process.
sem := make(chan struct{}, 20)

// RATE LIMIT, token bucket (golang.org/x/time/rate)
lim := rate.NewLimiter(rate.Limit(100), 200)        // 100 rps, burst 200
if !lim.Allow() { http.Error(w, "slow down", http.StatusTooManyRequests); return }
if err := lim.Wait(ctx); err != nil { return err }   // or block within the deadline

// LOAD SHEDDING, a bounded queue plus a non-blocking send beats an unbounded
// queue that turns into an OOM and a latency cliff.
select {
case work <- job:
default:
    sheddedTotal.Inc()
    http.Error(w, "overloaded", http.StatusServiceUnavailable)
}`
    },

    { t: "h", text: "Observability" },
    { t: "p", html: "Logs, metrics, and traces answer different questions. A log is one event. A metric is a number you can graph. A trace is the path of one request across services. You want all three, and they are not substitutes for each other." },
    { t: "table", head: ["", "Answers", "Cardinality", "Cost"],
      rows: [
        ["<strong>Logs</strong>", "What exactly happened in <em>this</em> request?", "Unbounded", "High per event"],
        ["<strong>Metrics</strong>", "Is the system healthy, and how is it trending?", "Must stay low", "Very cheap, aggregated"],
        ["<strong>Traces</strong>", "Where did the latency go across services?", "Sampled", "Medium"]
      ]
    },
    { t: "code", title: "Structured logs with a correlation ID", code:
`// Put a request ID in the context in middleware, log it on every line, and
// return it in a response header so a user's screenshot is a searchable key.
func requestID(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        id := r.Header.Get("X-Request-Id")
        if id == "" { id = uuid.NewString() }
        w.Header().Set("X-Request-Id", id)
        log := slog.With("request_id", id, "method", r.Method, "path", r.URL.Path)
        next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), logKey{}, log)))
    })
}

func L(ctx context.Context) *slog.Logger {
    if l, ok := ctx.Value(logKey{}).(*slog.Logger); ok { return l }
    return slog.Default()
}
L(ctx).Error("charge failed", "err", err, "amount_cents", 1299)

// Rules: JSON to stdout, one event per line, level-filtered, NEVER log
// passwords/tokens/PII, and log an error ONCE at the place you handle it.`
    },
    { t: "code", title: "Metrics with Prometheus, the RED pattern", code:
`var (
    reqs = promauto.NewCounterVec(prometheus.CounterOpts{
        Name: "http_requests_total",
    }, []string{"method", "route", "status"})       // LOW cardinality labels only

    dur = promauto.NewHistogramVec(prometheus.HistogramOpts{
        Name:    "http_request_duration_seconds",
        Buckets: prometheus.DefBuckets,              // histogram -> real p95/p99
    }, []string{"route"})

    inflight = promauto.NewGauge(prometheus.GaugeOpts{Name: "http_inflight"})
)

func metrics(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        inflight.Inc(); defer inflight.Dec()
        start := time.Now()
        rec := &statusRecorder{ResponseWriter: w, code: 200}
        next.ServeHTTP(rec, r)
        route := r.Pattern                           // the ROUTE, never the raw URL
        reqs.WithLabelValues(r.Method, route, strconv.Itoa(rec.code)).Inc()
        dur.WithLabelValues(route).Observe(time.Since(start).Seconds())
    })
}
// Expose on an INTERNAL port, next to pprof, never publicly:
admin := http.NewServeMux()
admin.Handle("GET /metrics", promhttp.Handler())
go http.ListenAndServe("127.0.0.1:9090", admin)

// RED for request-driven services: Rate, Errors, Duration.
// USE for resources: Utilisation, Saturation, Errors.
// Also instrument: goroutine count, GC pause, DB pool in-use/waits,
// queue depth, cache hit ratio, shed requests.`
    },
    { t: "note", kind: "warn", title: "Cardinality is how you kill your metrics backend", html: "<strong>Never</strong> put a user ID, request ID, raw URL path, email or error message in a metric label, each distinct value creates a new time series. Use the route pattern (<code>/users/{id}</code>), a bounded status class, and a short error <em>category</em>. High-cardinality detail belongs in logs and traces." },
    { t: "code", title: "Tracing with OpenTelemetry", code:
`tp := sdktrace.NewTracerProvider(
    sdktrace.WithBatcher(exporter),
    sdktrace.WithSampler(sdktrace.ParentBased(sdktrace.TraceIDRatioBased(0.05))),
)
otel.SetTracerProvider(tp)
defer tp.Shutdown(context.Background())

// Instrument the edges once and most of the value appears:
handler = otelhttp.NewHandler(mux, "server")                    // inbound
client  := http.Client{Transport: otelhttp.NewTransport(nil)}   // outbound
// otelsql / pgx tracing for the database

// Then add spans where your own work happens:
ctx, span := otel.Tracer("user").Start(ctx, "user.Create")
defer span.End()
span.SetAttributes(attribute.Int("user.id", id))
if err != nil { span.RecordError(err); span.SetStatus(codes.Error, "create failed") }
// Context propagation is why ctx must be threaded everywhere, the trace ID
// travels in it, and across services in W3C traceparent headers.`
    },

    { t: "h", text: "Health checks" },
    { t: "p", html: "Liveness means \"the process should be restarted\". Readiness means \"it can take traffic right now\". A database that is down should fail readiness, not liveness, or the orchestrator will restart a process that is fine." },
    { t: "code", title: "Two endpoints, two very different meanings", code:
`// LIVENESS, "is this process wedged?" Must be CHEAP and DEPENDENCY-FREE.
// Failing it RESTARTS the pod. If you check the database here, one database
// blip restarts your entire fleet and turns a degradation into an outage.
mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(200); io.WriteString(w, "ok")
})

// READINESS, "should I receive traffic right now?" Checks dependencies.
// Failing it removes you from the load balancer; the process keeps running.
mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
    defer cancel()
    if err := db.PingContext(ctx); err != nil {
        http.Error(w, "db unavailable", http.StatusServiceUnavailable); return
    }
    if !migrationsApplied() { http.Error(w, "migrating", 503); return }
    w.WriteHeader(200)
})

// STARTUP: during a rolling deploy, fail readiness BEFORE you stop accepting
// connections, wait a few seconds for the load balancer to notice, THEN call
// srv.Shutdown(ctx). Otherwise in-flight routing still sends you requests.`
    },
    { t: "code", title: "Full graceful shutdown ordering", code:
`<-ctx.Done()                                 // SIGTERM arrived
slog.Info("shutdown: draining")
ready.Store(false)                           // 1. fail readiness
time.Sleep(3 * time.Second)                  // 2. let the LB deregister you

shutCtx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
defer cancel()
if err := srv.Shutdown(shutCtx); err != nil { // 3. finish in-flight requests
    slog.Error("forced shutdown", "err", err)
}
workers.Wait()                               // 4. drain background workers
db.Close()                                   // 5. close pools
tp.Shutdown(context.Background())            // 6. flush traces/metrics
// Keep the total under your platform's grace period (K8s default: 30s).`
    },
    { t: "note", kind: "tip", title: "SLOs beat dashboards", html: "Pick one or two user-facing indicators per service, e.g. \"99.9% of <code>POST /orders</code> succeed\" and \"p99 &lt; 400 ms\", and alert on <em>burn rate</em> against that budget, not on CPU graphs. Page a human only for things a human must fix now; everything else is a ticket. Alerting on symptoms (error rate, latency) rather than causes (CPU, memory) is what keeps the pager quiet and honest." },
    { t: "note", kind: "deep", title: "Profiling in production is normal in Go", html: "pprof's sampling overhead is a few percent, so you can expose <code>net/http/pprof</code> on an internal admin port permanently and grab a 30-second CPU or heap profile from a live, misbehaving instance. <code>?debug=2</code> on the goroutine endpoint is the single fastest way to identify a leak, thousands of goroutines parked on the same line names the bug instantly. Continuous profiling (Pyroscope, Cloud Profiler) makes this historical." }
  ],
  summary: [
    "Set timeouts at every boundary: server (Read/Write/Idle/ReadHeader), client (`Timeout` + Transport), per-request context deadline, and give downstreams a *smaller* budget than your own.",
    "Retry only idempotent operations on transient failures, with exponential backoff **plus full jitter**, bounded attempts, at one layer only.",
    "Protect dependencies with a circuit breaker, bulkhead concurrency caps, token-bucket rate limits, and bounded queues that shed load with 503.",
    "Logs answer \"what happened in this request\" (JSON, stdout, correlation ID, no PII); metrics answer \"is the system healthy\" (low cardinality); traces answer \"where did the latency go\".",
    "Instrument RED, Rate, Errors, Duration, with a histogram so p95/p99 are real, labelled by route pattern, never by user or raw URL.",
    "OpenTelemetry at the edges (otelhttp in and out, DB instrumentation) gets most of the value; context propagation carries the trace.",
    "Liveness must be cheap and dependency-free (it restarts you); readiness checks dependencies (it only removes you from the load balancer).",
    "Shut down in order: fail readiness → pause for LB deregistration → `srv.Shutdown` → drain workers → close pools → flush telemetry.",
    "Expose /metrics and pprof on an internal admin port only; profiling live Go processes is cheap and expected.",
    "Alert on user-facing SLO burn rate, not on CPU graphs."
  ],
  quiz: [
    { q: "Why add jitter to exponential backoff?",
      options: ["It's faster", "Without it, failed clients retry in lockstep and create a thundering herd that re-breaks the recovering dependency", "It avoids the GC", "Required by HTTP"],
      answer: 1,
      explain: "Full jitter, a random wait in [0, base·2^i), spreads the retries out so the dependency can actually recover." },
    { q: "Which operation is safe to retry automatically?",
      options: ["A POST that creates an order, with no idempotency key", "A GET that timed out", "A request that returned 400", "A request that returned 403"],
      answer: 1,
      explain: "GETs are idempotent and a timeout is transient. 4xx responses won't change, and a non-idempotent POST can double-charge." },
    { q: "Why should a liveness probe NOT check the database?",
      options: ["It's too slow", "Failing liveness restarts the process, so a database blip would restart your whole fleet and amplify a degradation into an outage", "Probes can't open sockets", "It would leak connections"],
      answer: 1,
      explain: "Database health belongs in readiness, which only pulls you out of the load balancer." },
    { q: "Which makes a terrible Prometheus metric label?",
      options: ["HTTP method", "The route pattern `/users/{id}`", "The user ID", "The status code"],
      answer: 2,
      explain: "Every distinct label value is a new time series, unbounded cardinality will take down your metrics backend. Per-user detail belongs in logs/traces." },
    { q: "Correct first step of a graceful shutdown on SIGTERM?",
      options: ["Close the database pool", "Call os.Exit(0)", "Start failing the readiness probe and wait for the load balancer to deregister you", "Immediately call srv.Shutdown"],
      answer: 2,
      explain: "If you shut down before the LB stops routing to you, in-flight traffic hits a closing listener. Fail readiness, pause, then Shutdown." }
  ]
},

/* ───────────────────────────── 23 ───────────────────────────── */
{
  id: "modules-toolchain",
  level: "Production",
  icon: "📦",
  title: "Modules, Versioning & the Toolchain",
  minutes: 20,
  blurb: "Minimal version selection, every go.mod directive, /v2, workspaces, proxies, private modules and supply-chain hygiene.",
  blocks: [
    { t: "p", html: "Dependency management is where Go made its most unusual design choice, and misunderstanding it costs teams days. Go does <strong>not</strong> resolve \"the latest version that satisfies a range\". It uses <strong>Minimal Version Selection</strong>, and once that clicks, <code>go.mod</code> stops being mysterious." },

    { t: "h", text: "Minimal version selection" },
    { t: "p", html: "Go picks the oldest version of a dependency that satisfies every requirement, not the newest. If A needs <code>v1.2.0</code> and B needs <code>v1.3.0</code>, the build uses <code>v1.3.0</code>. It does not float forward when <code>v1.4.0</code> is published." },
    { t: "code", title: "Go picks the OLDEST version that satisfies everyone", code:
`your module requires:  A v1.2.0    and    B v1.0.0
             A v1.2.0 requires:  C v1.5.0
             B v1.0.0 requires:  C v1.8.0

  -> the build uses C v1.8.0   (the MAXIMUM of the MINIMUMS)

Not "latest C", v1.9.3 may exist and will NOT be used. Nothing upgrades
unless you ask. Consequences that matter:

  • Builds are reproducible by default, with no lock file. go.mod IS the lock.
  • Adding a dependency cannot silently bump an unrelated one.
  • A dependency's own requirements are FLOOR constraints, never ceilings.
  • go.sum is a checksum ledger, not a resolver input.
  • Upgrades are an explicit, reviewable commit, which is the point.`
    },

    { t: "h", text: "go.mod" },
    { t: "list", items: [
      "<code>module</code> is the path.",
      "<code>go</code> is the language version.",
      "<code>require</code> lists dependencies.",
      "<code>exclude</code> and <code>replace</code> override a version, usually for a local checkout or a broken release.",
      "<code>retract</code> tells other people not to use a version you already published.",
    ]},
    { t: "code", title: "go.mod, annotated", code:
`module github.com/you/app          // import prefix AND repo location

go 1.23                            // LANGUAGE VERSION: enables/forbids features
                                   // (loop semantics, range-over-func...) and
                                   // sets the minimum toolchain that may build it

toolchain go1.23.4                 // the toolchain to USE; go will download it
                                   // automatically if yours is older (1.21+)

require (
    github.com/google/uuid v1.6.0
    golang.org/x/sync v0.8.0
)

require (                          // a second block: INDIRECT dependencies
    github.com/x/y v1.1.0 // indirect
)

// Local development across two repos, or a fork while a PR is open.
// NOT honoured by anyone who depends on you, it is build-local only.
replace github.com/them/lib => ../lib
replace github.com/them/lib => github.com/you/lib v1.2.1-fork

exclude github.com/bad/pkg v1.4.0  // never select this exact version (rare)

retract (                          // YOU publish this, to disown your own tags
    v1.3.0                         // "this release was broken"
    [v1.0.0, v1.0.5]
)

tool golang.org/x/tools/cmd/stringer   // Go 1.24+: replaces the tools.go hack
                                        // run with: go tool stringer`
    },
    { t: "note", kind: "deep", title: "The `go` line is a feature switch, not documentation", html: "<code>go 1.22</code> in <code>go.mod</code> is what gives that module per-iteration loop variables; <code>go 1.23</code> is what makes <code>range</code>-over-function compile. Each module in a build gets its own language version, so an old dependency keeps old semantics while your code gets new ones. Bumping that line is a real, behaviour-changing edit, do it deliberately, and re-run the tests." },

    { t: "h", text: "Module versions" },
    { t: "p", html: "Starting at <code>v2</code>, the major version is part of the import path: <code>github.com/you/mod/v2</code>. <code>v0</code> and <code>v1</code> omit it. A breaking change needs a new major version. It is not a silent edit of <code>v1</code>." },
    { t: "code", title: "Semver, /v2, and pseudo-versions", code:
`git tag v1.4.2 && git push origin v1.4.2    # publishing IS tagging

# v0.x.y   anything may break; the ecosystem tolerates it
# v1.x.y   breaking changes are now forbidden
# v2+      the major version MUST appear in the module path:
#            module github.com/you/lib/v2
#          and in every import: "github.com/you/lib/v2/sub"
#          so v1 and v2 can coexist in ONE build. This is the import
#          compatibility rule, and it is why Go libraries work so hard to
#          stay backward compatible.

# Untagged commits get a PSEUDO-VERSION, which is still deterministic:
#   v0.0.0-20240115093215-4a2b3c4d5e6f
#   v1.2.3-0.20240115093215-4a2b3c4d5e6f   (after v1.2.2, before v1.2.3)

# Monorepo: a subdirectory with its own go.mod is its own module, tagged
#   sub/dir/v1.2.0
# Deprecating a module: a "// Deprecated:" comment above the module line.`
    },

    { t: "h", text: "Module commands" },
    { t: "list", items: [
      "<code>go get</code> changes a dependency.",
      "<code>go mod tidy</code> makes <code>go.mod</code> match the imports.",
      "<code>go list -m</code> shows versions.",
      "<code>go mod why</code> says why a module is in the build.",
      "You do not edit version numbers by hand unless you mean to.",
    ]},
    { t: "code", title: "Day-to-day and when things go wrong", code:
`go get example.com/pkg@latest     # add or upgrade one dependency
go get example.com/pkg@v1.4.2     # pin exactly
go get example.com/pkg@none       # remove it
go get -u ./...                   # upgrade ALL direct+indirect minor/patch
go get -u=patch ./...             # patch releases only, the safer habit
go get toolchain@go1.23.4         # upgrade the toolchain itself
go mod tidy                       # sync go.mod/go.sum with real imports
go mod tidy -diff                 # CI: fail if they're stale (1.22+)
go mod why -m example.com/pkg     # WHY is this in my build?
go mod graph | grep pkg           # who requires what
go list -m all                    # final selected version of everything
go list -m -u all                 # ...and what upgrades exist
go list -m -versions example.com/pkg
go mod download                   # warm the cache (CI, Docker layer)
go mod verify                     # re-check the cache against go.sum
go clean -modcache                # the nuclear option for a corrupt cache

# "missing go.sum entry" -> go mod tidy  (or go mod download <mod>)
# "ambiguous import" -> two modules provide the same path; drop one
# "module declares its path as X but was required as Y" -> the module renamed,
#   or you forgot the /v2 suffix`
    },

    { t: "h", text: "Workspaces" },
    { t: "p", html: "A <code>go.work</code> file lets one checkout use several local modules instead of the versions published online. It is for development. Do not commit it as the way your users build." },
    { t: "code", title: "go.work replaces a pile of replace directives", code:
`go work init ./api ./worker ./shared
go work use ./newservice          # add another
go work sync                      # push the workspace's choices into go.mod files

# go.work:
#   go 1.23
#   use (./api
#        ./worker
#        ./shared)
#
# Inside the workspace, ./api resolves ./shared to your LOCAL copy, edit both
# repos in one branch with no replace churn. go.work is a developer-local file:
# add it to .gitignore unless the whole team shares the same layout, and never
# rely on it in CI (build each module on its own there).
GOWORK=off go build ./...          # temporarily ignore the workspace`
    },

    { t: "h", text: "Module proxy" },
    { t: "p", html: "By default <code>go get</code> downloads through a public proxy and checks the hash in the checksum database. A private module must be listed in <code>GOPRIVATE</code> so Go fetches it directly and does not send its path to the public servers." },
    { t: "code", title: "What happens when you `go get`", code:
`# By default the toolchain fetches through a CDN and verifies against a
# transparency log, not straight from GitHub:
GOPROXY=https://proxy.golang.org,direct     # try the proxy, then the origin
GOSUMDB=sum.golang.org                      # Merkle-tree checksum database

# Private code must bypass both, or the proxy will leak your module paths
# and the sumdb lookup will fail:
GOPRIVATE=github.com/mycorp/*                # sets GONOPROXY + GONOSUMDB
GOFLAGS=-mod=readonly                        # fail instead of editing go.mod
GONOSUMCHECK                                 # (legacy; prefer GOPRIVATE)

go env -w GOPRIVATE=github.com/mycorp/*      # persist it
git config --global url."git@github.com:".insteadOf "https://github.com/"
# ...so the fetch uses your SSH key. For CI, a token in .netrc or a
# GOPROXY pointing at Artifactory/Athens is the usual answer.

# Vendoring: commit everything into ./vendor
go mod vendor && go build ./...   # -mod=vendor becomes automatic when vendor/ exists
# Worth it for air-gapped builds and hard supply-chain control; the cost is a
# large diff on every upgrade.`
    },

    { t: "h", text: "Supply chain" },
    { t: "list", items: [
      "Commit <code>go.sum</code>.",
      "Run <code>govulncheck</code> so you hear about vulnerabilities your code can reach.",
      "Prefer a module you can read over one that appeared last week.",
      "A <code>replace</code> that points at a random fork should not land on <code>main</code>.",
    ]},
    { t: "list", items: [
      "<strong>Prefer the standard library.</strong> \"A little copying is better than a little dependency\" is cheaper than it sounds, <code>net/http</code> plus 40 lines of middleware beats a framework you'll fight in two years.",
      "<strong>Audit before adding:</strong> maintenance activity, release cadence, its <em>own</em> dependency count, and whether it pulls in cgo.",
      "<strong><code>govulncheck ./...</code> in CI.</strong> It walks your actual call graph, so it reports CVEs that are genuinely <em>reachable</em>, far less noise than a manifest scanner.",
      "<strong>Upgrade on a schedule</strong> (Renovate/Dependabot, <code>-u=patch</code> weekly), not in a panic during an incident.",
      "<strong>Pin the toolchain</strong> with the <code>toolchain</code> directive so every developer and CI runner compiles with the same compiler.",
      "<strong>Reproducible builds:</strong> <code>-trimpath</code>, committed <code>go.sum</code>, and <code>go version -m ./binary</code> to prove later what went into a release."
    ]}
  ],
  summary: [
    "Go uses Minimal Version Selection: the build takes the **maximum of the minimums**, never \"latest\", so builds are reproducible and go.mod is the lock file.",
    "The `go` line is a per-module language-feature switch; `toolchain` pins which compiler builds it.",
    "`replace` is build-local and ignored by your consumers; `retract` is how you disown your own bad release.",
    "From v2 on, the major version lives in the module path and every import, that's the import compatibility rule.",
    "Untagged commits resolve to deterministic pseudo-versions; a subdirectory with its own go.mod is its own module.",
    "`go mod why`, `go mod graph`, `go list -m -u all` and `go mod tidy -diff` are the diagnostic set worth memorising.",
    "`go.work` replaces replace-directive churn for local multi-module work, keep it out of CI.",
    "Fetches go through proxy.golang.org and are verified against sum.golang.org; `GOPRIVATE` is mandatory for private modules.",
    "`govulncheck` reports reachable CVEs from your call graph; upgrade with `-u=patch` on a schedule, not during an outage."
  ],
  quiz: [
    { q: "A requires C v1.5.0, B requires C v1.8.0, and C v1.9.3 exists. Which C does your build use?",
      options: ["v1.9.3, latest wins", "v1.5.0, lowest wins", "v1.8.0, the maximum of the required minimums", "It fails with a conflict"],
      answer: 2,
      explain: "Minimal Version Selection takes the highest *required* version and nothing newer. Upgrades are always explicit." },
    { q: "What does the `go 1.22` line in go.mod actually do?",
      options: ["Documents the author's Go version", "Selects language semantics and features for that module (e.g. per-iteration loop variables) and sets the minimum toolchain", "Forces everyone to install Go 1.22 exactly", "Nothing, it's advisory"],
      answer: 1,
      explain: "It's a real feature switch, applied per module, which is how old dependencies keep old semantics in a new build." },
    { q: "You're releasing a breaking change to `github.com/you/lib` v1. What must change?",
      options: ["Nothing, just tag v2.0.0", "The module path becomes `github.com/you/lib/v2`, and imports must use it", "You must create a new repository", "Add an `exclude` for v1"],
      answer: 1,
      explain: "The import compatibility rule: a new major version is a new import path, so v1 and v2 can coexist in one build." },
    { q: "Your `replace` directive points a dependency at a local fork. What do your *consumers* get?",
      options: ["The fork, replace propagates", "The original module; replace only applies to the main module's own builds", "A build error", "A warning and the fork"],
      answer: 1,
      explain: "`replace` is build-local. To ship a fork you must publish it and require it directly." },
    { q: "Why is `govulncheck` less noisy than a typical dependency scanner?",
      options: ["It only checks direct dependencies", "It analyses your call graph and reports only vulnerabilities your code can actually reach", "It only reports critical severities", "It ignores indirect modules"],
      answer: 1,
      explain: "Reachability analysis filters out CVEs in code paths you never call, which makes the remaining findings worth acting on." }
  ]
},

/* ───────────────────────────── 24 ───────────────────────────── */
{
  id: "security",
  level: "Production",
  icon: "🔐",
  title: "Security Essentials for Go Services",
  minutes: 24,
  blurb: "Randomness, password hashing, constant-time comparison, TLS, injection, traversal, SSRF, XSS, JWT pitfalls and DoS limits.",
  blocks: [
    { t: "p", html: "Go gives you strong crypto and a safe memory model for free, which means almost every real vulnerability in a Go service comes from the <em>application</em> layer: trusting input, comparing secrets carelessly, or forgetting a limit. This module is the list, with the Go-specific detail each one needs." },

    { t: "h", text: "Randomness" },
    { t: "p", html: "Tokens, passwords, and keys come from <code>crypto/rand</code>. <code>math/rand</code> is a predictable sequence, fine for a game and useless for security. <code>math/rand/v2</code> is still not cryptographic." },
    { t: "code", title: "crypto/rand for anything a user must not guess", code:
`// WRONG for secrets, math/rand is a deterministic PRNG.
// (math/rand/v2 at least auto-seeds, which hid this bug for a while.)
token := fmt.Sprint(rand.Int64())            // GUESSABLE

// RIGHT: crypto/rand reads from the OS CSPRNG
func newToken() string {
    b := make([]byte, 32)
    if _, err := crypto_rand.Read(b); err != nil {
        panic(err)        // a failing CSPRNG is unrecoverable; do NOT continue
    }
    return base64.RawURLEncoding.EncodeToString(b)   // URL-safe, no padding
}
// Go 1.24+: crypto/rand.Read never fails (it panics internally), and
// crypto/rand.Text() gives you a ready-made random string.

// Use crypto/rand for: session IDs, password-reset and share tokens, API keys,
// CSRF tokens, nonces, salts, short URL codes, anything used for authorisation.
// math/rand/v2 is fine for: simulations, jitter, shuffling test data, sampling.`
    },
    { t: "code", title: "Passwords and secret comparison", code:
`// Passwords: a SLOW, salted hash. Never SHA-256 (it's fast, which is the bug).
// bcrypt.DefaultCost is 10; 12+ is the common modern floor. Benchmark it:
// aim for ~100-250ms per hash on your hardware, and revisit yearly.
hash, err := bcrypt.GenerateFromPassword([]byte(pw), 12)
err = bcrypt.CompareHashAndPassword(hash, []byte(attempt))               // constant time
// argon2id (golang.org/x/crypto/argon2) is the modern alternative; both are fine.
// Cap the input length, bcrypt silently truncates at 72 bytes.

// API keys / tokens you store: hash them too (SHA-256 is fine here, because
// the input is already high-entropy), so a database leak isn't a key leak.

// NEVER compare secrets with ==. String comparison short-circuits on the first
// differing byte, which leaks the prefix length through timing.
if subtle.ConstantTimeCompare([]byte(got), []byte(want)) == 1 { /* match */ }
// Same for HMAC verification:
mac := hmac.New(sha256.New, secret); mac.Write(body)
if !hmac.Equal(mac.Sum(nil), provided) { return ErrBadSignature }  // constant time`
    },

    { t: "h", text: "Injection" },
    { t: "list", items: [
      "SQL injection is user text pasted into a query.",
      "Use placeholders.",
      "Command injection is user text pasted into a shell.",
      "Do not use a shell.",
      "Path traversal is a <code>..</code> in a filename.",
      "Clean the path and check it stays inside the directory you intended.",
    ]},
    { t: "code", title: "SQL, shell, and path", code:
`// 1. SQL, placeholders, always. The driver sends values out of band.
db.QueryContext(ctx, "SELECT * FROM users WHERE email = $1", email)   // SAFE
// fmt.Sprintf("... WHERE email = '%s'", email)                        // INJECTION
// Identifiers (table/column/sort) CANNOT be parameterised -> use an ALLOWLIST:
col, ok := sortable[userInput]; if !ok { return ErrBadSort }

// 2. COMMANDS, exec.Command takes a program and ARGUMENTS; there is no shell,
// so argument values are not re-parsed. That's safe:
exec.CommandContext(ctx, "convert", "-resize", "100x100", inPath, outPath)
// This is NOT safe, you asked for a shell, so ; && $() all work again:
// exec.Command("sh", "-c", "convert "+userInput)
// Also validate anything that could look like a FLAG ("--output=/etc/x"):
if strings.HasPrefix(arg, "-") { return ErrBadArg }

// 3. PATHS, never join user input into a path and hope.
// filepath.Clean alone is not enough on its own (absolute paths, symlinks).
name := filepath.Base(userInput)                      // strip any directory part
full := filepath.Join(baseDir, name)
if !strings.HasPrefix(full, filepath.Clean(baseDir)+string(os.PathSeparator)) {
    return ErrTraversal
}
// Go 1.24+ does this properly, including symlink escapes and TOCTOU races:
root, err := os.OpenRoot(baseDir)        // *os.Root
defer root.Close()
f, err := root.Open(userInput)           // CANNOT escape baseDir, ever`
    },
    { t: "note", kind: "warn", title: "Zip slip and decompression bombs", html: "Extracting an archive is path traversal with extra steps: an entry named <code>../../etc/cron.d/x</code> will happily escape unless you validate every name (use <code>os.Root</code>). And always bound the <em>output</em>: a 1 MB zip can expand to 100 GB. Wrap each entry reader in <code>io.LimitReader</code>, cap the entry count, and reject absolute paths, <code>..</code> segments and symlink entries." },

    { t: "h", text: "XSS" },
    { t: "p", html: "<code>html/template</code> escapes data you insert, so a name cannot become a script. <code>text/template</code> does not. Do not mark a string as trusted HTML unless you built it yourself." },
    { t: "code", title: "html/template is contextual, use it, and don't opt out", code:
`// html/template knows WHERE a value lands and escapes accordingly: body text,
// an attribute, a URL, a JS string, CSS. text/template does none of this.
// Rendering user content with text/template into HTML is a guaranteed XSS.

tmpl.Execute(w, data)                 // {{.Name}} is escaped for its context

// These types mean "I promise this is safe" and DISABLE escaping:
//   template.HTML  template.JS  template.URL  template.CSS  template.HTMLAttr
// Only ever produce them from a SANITISER, never from user input:
safe := template.HTML(bluemonday.UGCPolicy().Sanitize(renderedMarkdown))

// Embedding data for JavaScript: let the template do it, in a <script> context,
// or send JSON and read it from a data attribute. Never string-concatenate
// into a <script> block.

// Defence in depth, set these even when your escaping is correct:
w.Header().Set("Content-Security-Policy", "default-src 'self'; object-src 'none'")
w.Header().Set("X-Content-Type-Options", "nosniff")
w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
// Serving user uploads: Content-Disposition: attachment, and ideally a
// separate origin so an uploaded HTML file can't touch your cookies.`
    },

    { t: "h", text: "TLS and transport" },
    { t: "p", html: "Serve HTTPS with a real certificate, and turn off old protocol versions. Inside a cluster, still authenticate the other service. A private network is not the same as an authenticated caller." },
    { t: "code", title: "Sane defaults, and the flag never to set", code:
`// Go's defaults are already good: TLS 1.3 preferred, modern cipher suites,
// certificate verification ON. Mostly you just set a floor:
cfg := &tls.Config{ MinVersion: tls.VersionTLS12 }

srv := &http.Server{Addr: ":443", TLSConfig: cfg, Handler: h}
srv.ListenAndServeTLS("cert.pem", "key.pem")
// HSTS once you are HTTPS-only:
w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains")

// InsecureSkipVerify: true  <- NEVER in production. It disables ALL certificate
// verification, which turns TLS into expensive plaintext. If you need to trust
// an internal CA, add it to a RootCAs pool instead:
pool := x509.NewCertPool()
pool.AppendCertsFromPEM(caPEM)
client := &http.Client{Transport: &http.Transport{
    TLSClientConfig: &tls.Config{RootCAs: pool, MinVersion: tls.VersionTLS12},
}}

// mTLS (service-to-service): the server also verifies the client's cert
srvCfg := &tls.Config{
    ClientCAs:  pool,
    ClientAuth: tls.RequireAndVerifyClientCert,
    MinVersion: tls.VersionTLS12,
}

// Don't invent crypto. Use crypto/aes + cipher.NewGCM (and never reuse a
// nonce with the same key), or golang.org/x/crypto/nacl/secretbox, or
// crypto/ecdh. "Encrypt with AES-ECB" and "sign with MD5" are the classics.`
    },

    { t: "h", text: "SSRF" },
    { t: "p", html: "If your server fetches a URL the user supplied, the user can point it at your internal network. Allow only the hosts you expect, and refuse link-local and metadata addresses." },
    { t: "code", title: "Any user-supplied URL you fetch is an attack surface", code:
`// Webhooks, link previews, avatar-by-URL, PDF renderers, URL shorteners, 
// if your server fetches a URL the user chose, it can be pointed at your
// private network or at a cloud metadata endpoint.
var blocked = []string{
    "127.0.0.0/8", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16",
    "169.254.0.0/16",   // link-local: AWS/GCP metadata lives at 169.254.169.254
    "::1/128", "fc00::/7", "fe80::/10",
}

func safeClient() *http.Client {
    d := &net.Dialer{Timeout: 5 * time.Second}
    return &http.Client{
        Timeout: 10 * time.Second,
        // Check the IP at DIAL time, AFTER DNS resolution, validating the
        // hostname only is defeated by DNS rebinding and by a name that
        // simply resolves to 127.0.0.1.
        Transport: &http.Transport{
            DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
                host, _, _ := net.SplitHostPort(addr)
                if isBlockedIP(net.ParseIP(host)) { return nil, ErrBlockedTarget }
                return d.DialContext(ctx, network, addr)
            },
        },
        // And do not follow redirects blindly, each hop needs the same check.
        CheckRedirect: func(r *http.Request, via []*http.Request) error {
            if len(via) >= 3 { return errors.New("too many redirects") }
            return nil
        },
    }
}
// Also: allowlist schemes (http/https only, no file://, gopher://), cap the
// response body with io.LimitReader, and set a short timeout.`
    },

    { t: "h", text: "Authentication" },
    { t: "list", items: [
      "Authentication is who the caller is.",
      "Authorisation is what they may do.",
      "A valid token is not permission to read every record.",
      "Compare secrets with <code>subtle.ConstantTimeCompare</code> so the time taken does not leak the answer.",
      "Store passwords with a slow hash, not SHA-256 alone.",
    ]},
    { t: "list", items: [
      "<strong>IDOR is the most common real breach.</strong> A valid token is not permission for a specific row: every handler must check <em>this</em> user may touch <em>this</em> resource. Make it a query predicate (<code>WHERE id = $1 AND owner_id = $2</code>) so it cannot be forgotten.",
      "<strong>Verify JWTs properly:</strong> pin the expected algorithm (reject <code>alg: none</code> and the HS/RS confusion attack by never letting the token choose the key type), and check <code>exp</code>, <code>nbf</code>, <code>iss</code> and <code>aud</code>. Many CVEs are libraries that skipped one of these.",
      "<strong>A JWT is signed, not encrypted.</strong> Anyone can base64-decode the claims, never put anything confidential in them.",
      "<strong>You cannot revoke a stateless JWT.</strong> Keep access tokens short (5–15 min) and hold revocation in the refresh-token table, or accept that a stolen token is valid until it expires.",
      "<strong>Session cookies:</strong> <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite=Lax</code> or <code>Strict</code>, rotate the ID on login, and invalidate server-side on logout.",
      "<strong>Rate limit and lock out</strong> login, password reset, token refresh and signup. Return identical errors and similar timing for unknown-user vs wrong-password.",
      "<strong>Password reset tokens</strong> are single-use, short-lived, random from <code>crypto/rand</code>, stored hashed, and invalidated on use or password change."
    ]},

    { t: "h", text: "Denial of service" },
    { t: "p", html: "Put a limit on body size, header time, and how many requests run at once. An unlimited queue will run you out of memory. Go's regular expressions do not suffer the classic catastrophic-backtracking attack, but a huge body still will." },
    { t: "code", title: "Every unbounded thing is a vulnerability", code:
`r.Body = http.MaxBytesReader(w, r.Body, 1<<20)   // request bodies
dec := json.NewDecoder(r.Body); dec.DisallowUnknownFields()
// JSON depth/size: a deeply nested array can still blow the stack, 
// cap the body size, which caps the damage.

srv := &http.Server{ReadHeaderTimeout: 5 * time.Second, /* ... */}  // Slowloris
io.LimitReader(resp.Body, maxBytes)              // responses you fetch
sem := make(chan struct{}, 64)                   // concurrency per dependency
lim := rate.NewLimiter(100, 200)                 // requests per key
jobs := make(chan Job, 1000)                     // bounded queue + shed on full
db.SetMaxOpenConns(25)                           // connection exhaustion
f.Seek / io.CopyN                                 // bounded file work

// Good news, for once: Go's regexp uses RE2, which runs in LINEAR time with no
// backtracking, so the catastrophic-backtracking ReDoS that plagues
// JavaScript and Java simply does not apply here. (You can still write a
// pattern that is slow on a huge input; cap the input length.)`
    },
    { t: "note", kind: "tip", title: "A security checklist for every pull request", html: "Is every new input validated and size-capped? Is every query parameterised? Is any secret compared with <code>==</code>? Does the new handler check ownership, not just authentication? Does anything new get logged that shouldn't be? Did a dependency get added, and does <code>govulncheck</code> still pass? Does an error message leak internals to the client? Run <code>gosec ./...</code> and <code>govulncheck ./...</code> in CI alongside the tests, and remember that Go's memory safety already removed the entire class of buffer overflows and use-after-free for you." }
  ],
  summary: [
    "`crypto/rand` for anything unguessable (tokens, keys, nonces, salts); `math/rand/v2` only for jitter and simulation.",
    "Hash passwords with bcrypt (cost ≥12) or argon2id; hash stored API keys; cap input length for bcrypt's 72-byte truncation.",
    "Never compare secrets with `==`, use `subtle.ConstantTimeCompare` or `hmac.Equal` to avoid timing leaks.",
    "SQL: placeholders always, allowlists for identifiers. Commands: `exec.Command` with real arguments and no `sh -c`. Paths: `os.Root` (1.24+) or strict base-prefix checks.",
    "`html/template` escapes contextually; `template.HTML` opts out, so only ever produce it from a sanitiser. Add CSP and nosniff anyway.",
    "Go's TLS defaults are good, set `MinVersion` and never `InsecureSkipVerify`; add an internal CA to `RootCAs` instead.",
    "Any user-supplied URL you fetch needs SSRF defence at *dial* time (post-DNS), scheme allowlisting, redirect limits and body caps.",
    "IDOR is the common breach: authorise per resource, ideally as a query predicate. Verify JWT alg/exp/iss/aud, keep access tokens short, and remember they're readable by anyone.",
    "DoS is unbounded anything: body size, header timeout, response size, concurrency, queue depth, connection pool. Go's RE2 regexp means ReDoS isn't a Go problem.",
    "Run `govulncheck` and `gosec` in CI; memory safety already eliminated overflows and use-after-free for you."
  ],
  quiz: [
    { q: "Which package generates a session token?",
      options: ["`math/rand`", "`math/rand/v2`", "`crypto/rand`", "`hash/fnv`"],
      answer: 2,
      explain: "Only crypto/rand is a CSPRNG. math/rand/v2 auto-seeds but is still predictable from observed output." },
    { q: "Why is `token == expected` a vulnerability?",
      options: ["It doesn't compile for byte slices", "String comparison returns early on the first differing byte, leaking how much of the secret you guessed through timing", "It's case-sensitive", "It allocates"],
      answer: 1,
      explain: "Use `subtle.ConstantTimeCompare` / `hmac.Equal`, which always examine every byte." },
    { q: "Safest way to serve a user-named file from `./uploads`?",
      options: ["`filepath.Join(\"uploads\", name)`", "`filepath.Clean(name)` then Join", "`os.OpenRoot(\"uploads\")` then `root.Open(name)` (Go 1.24+)", "Reject names containing `..`"],
      answer: 2,
      explain: "`os.Root` enforces containment including symlink escapes and TOCTOU races. The manual checks are easy to get subtly wrong." },
    { q: "Your service fetches a URL the user supplies. Where must the SSRF check happen?",
      options: ["On the hostname string before the request", "At dial time, on the resolved IP, and again on every redirect", "In the response handler", "Nowhere if you use HTTPS"],
      answer: 1,
      explain: "Hostname checks are defeated by a name that resolves to 127.0.0.1 or by DNS rebinding. Validate the IP in `DialContext`." },
    { q: "Which classic vulnerability class does Go's `regexp` package make a non-issue?",
      options: ["SQL injection", "ReDoS / catastrophic backtracking", "XSS", "SSRF"],
      answer: 1,
      explain: "RE2 matches in linear time with no backtracking, so the exponential blowup seen in PCRE-style engines can't happen." }
  ]
}

]);
