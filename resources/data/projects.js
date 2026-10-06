/* End-to-end build guides. Rendered by app.js at #/p/<id> */
window.PROJECTS = [

/* ───────────────────────────── 1 ───────────────────────────── */
{
  id: "gostat",
  category: "CLI & Tools",
  icon: "📊",
  name: "gostat, a concurrent file-stats CLI",
  tagline: "Walk a directory tree in parallel and report line/word/size statistics. Your first complete, shippable Go program.",
  level: "Starter",
  time: "4–7 hours",
  stack: ["flag", "os", "io/fs", "bufio", "sync", "encoding/json", "testing"],
  covers: ["functions", "collections", "errors", "concurrency", "testing", "modules-toolchain"],
  blocks: [
    { t: "p", html: "A single static binary that takes a path and prints a table: files scanned, total bytes, lines, words, the largest files, and a breakdown by extension. It sounds trivial, and then you hit symlinks, permission errors, files bigger than memory, Unicode, and the fact that walking 200,000 files serially is slow. That is exactly the point." },
    { t: "h", text: "Target behaviour" },
    { t: "p", html: "This is what the finished command should print. Build until your program matches it." },
    { t: "code", title: "The CLI you're building", code:
`$ gostat ./myproject
PATH  ./myproject          FILES 1,284     SIZE 42.1 MB     TIME 310ms

BY EXTENSION              FILES      LINES       BYTES
  .go                       842    118,402    3.9 MB
  .json                      61      9,882    1.2 MB
  .md                        18      2,104    212 KB

LARGEST
  1.  12.1 MB  ./testdata/dump.json
  2.   3.4 MB  ./internal/gen/schema.go

$ gostat --json --top 5 --ext .go --workers 8 ./myproject | jq .
$ gostat --exclude 'vendor,node_modules,.git' .
$ gostat --version`
    },
    { t: "h", text: "Architecture" },
    { t: "p", html: "This is how the pieces connect. Read it before you create the packages." },
    { t: "code", title: "A three-stage pipeline", code:
`  main.go              flags -> Config, then calls run(cfg, os.Stdout)
     |
  walk (producer)      filepath.WalkDir -> paths chan string   [1 goroutine]
     |
  workers (fan-out)    N goroutines: read + count -> results chan FileStat
     |
  collector (fan-in)   aggregate into a Report                 [1 goroutine]
     |
  render               text table OR JSON, written to an io.Writer

 Why an io.Writer and not fmt.Println: the whole renderer becomes testable
 with a bytes.Buffer, and --json is a one-line switch.`
    },
    { t: "code", title: "The core of it", code:
`type FileStat struct {
    Path  string
    Ext   string
    Bytes int64
    Lines int
    Words int
}

func countFile(path string) (FileStat, error) {
    f, err := os.Open(path)
    if err != nil { return FileStat{}, fmt.Errorf("open %s: %w", path, err) }
    defer f.Close()

    st := FileStat{Path: path, Ext: strings.ToLower(filepath.Ext(path))}
    sc := bufio.NewScanner(f)
    sc.Buffer(make([]byte, 0, 64*1024), 4*1024*1024)   // tolerate long lines
    for sc.Scan() {
        line := sc.Bytes()
        st.Lines++
        st.Words += len(bytes.Fields(line))
        st.Bytes += int64(len(line)) + 1
    }
    return st, sc.Err()          // streaming: memory stays flat on huge files
}`
    },
    { t: "note", kind: "warn", title: "The three bugs you will hit", html: "<strong>(1)</strong> One unreadable file must not abort the walk, collect errors and report a count at the end. <strong>(2)</strong> <code>bufio.Scanner</code> fails on lines over 64 KB until you call <code>Buffer</code>. <strong>(3)</strong> Unbounded goroutines on a large tree exhaust file descriptors, the worker pool is not optional, and more workers than ~2× cores makes it <em>slower</em> on a disk-bound load." }
  ],
  milestones: [
    { title: "Walk and count, serially", detail: "`filepath.WalkDir`, skip directories, print a total. No concurrency yet, get it correct first." },
    { title: "Extract a testable core", detail: "`run(cfg Config, out io.Writer) error`; `main` only parses flags and calls it. Write the first table-driven test against a `testdata/` fixture tree." },
    { title: "Add flags", detail: "`--json --top N --ext .go --exclude a,b --workers N --version`. Validate them and print usage on bad input." },
    { title: "Make it concurrent", detail: "Producer → worker pool → collector over channels. Benchmark before and after on a big tree; prove the speedup." },
    { title: "Handle failure properly", detail: "Per-file errors wrapped with the path, aggregated with `errors.Join`, a non-zero exit code when anything failed, and `context` cancellation on Ctrl-C." },
    { title: "Test it hard", detail: "Table-driven tests for counting, a golden file for the rendered table, `go test -race`, and a benchmark for `countFile`." },
    { title: "Ship a release", detail: "Makefile that cross-compiles darwin/linux/windows with `-trimpath -ldflags \"-s -w -X main.version=…\"`, plus a README with real example output." }
  ],
  done: [
    "`go test -race -cover ./...` passes with meaningful coverage of the counting and rendering logic",
    "Running it on a 100k-file tree finishes without leaking file descriptors or exceeding flat memory",
    "An unreadable file produces a warning and a non-zero exit, never a panic or a silent miss",
    "`--json` output parses with `jq` and contains the same numbers as the table",
    "A single static binary runs on a machine with no Go toolchain installed"
  ],
  stretch: [
    "`--git` mode that ignores anything in `.gitignore`",
    "Detect and skip binary files by sniffing for NUL bytes in the first 512 bytes",
    "A `--watch` mode using fsnotify that re-renders on change",
    "Progress output with a carriage-return spinner, but only when stdout is a TTY",
    "Compare two directories and print a diff of the stats"
  ]
},

/* ───────────────────────────── 2 ───────────────────────────── */
{
  id: "snip",
  category: "APIs & Services",
  icon: "🔗",
  name: "snip, a URL shortener REST API",
  tagline: "The complete production service: Postgres, migrations, middleware, rate limiting, Docker, integration tests, metrics, graceful shutdown.",
  level: "Intermediate",
  time: "12–20 hours",
  stack: ["net/http", "database/sql + pgx", "golang-migrate", "slog", "prometheus", "Docker Compose", "httptest"],
  covers: ["errors", "methods-interfaces", "stdlib-service", "testing", "production-readiness", "reliability-observability", "security"],
  blocks: [
    { t: "p", html: "This is the project to build if you only build one. It is small enough to finish and complete enough to be genuinely production-shaped: a real datastore, real migrations, real middleware, real tests, a real container, and real operational endpoints." },
    { t: "h", text: "The API" },
    { t: "p", html: "These are the requests the program must accept, and what it sends back." },
    { t: "code", title: "Endpoints", code:
`POST   /api/links            {"url":"https://go.dev","custom":"godev","ttl":"720h"}
       -> 201 {"code":"godev","short":"http://localhost:8080/godev","expires_at":"..."}
GET    /{code}               -> 301 redirect, increments a hit counter
GET    /api/links/{code}     -> 200 metadata + hit count
DELETE /api/links/{code}     -> 204 (requires the owner's API key)
GET    /api/links?limit=50&cursor=…  -> 200 paginated list

GET    /healthz /readyz /version        (public, cheap)
GET    /metrics  /debug/pprof/*         (INTERNAL admin port 9090 only)`
    },
    { t: "h", text: "Layout: dependencies point inward" },
    { t: "p", html: "Each folder is one package. A package may import only what this layout allows, and <code>internal</code> keeps the rest of the module from reaching in." },
    { t: "code", title: "Package structure", code:
`cmd/server/main.go            load config -> run() -> wire -> serve
cmd/migrate/main.go
internal/link/                DOMAIN: Link type, code generation, validation,
                              Service with the business rules. Imports no SQL,
                              no HTTP. Store is an INTERFACE declared here.
internal/postgres/            implements link.Store
internal/httpx/               handlers, middleware, routing, JSON helpers
internal/config/
migrations/0001_links.up.sql
deploy/Dockerfile  compose.yaml

  type Store interface {                  // declared in internal/link
      Create(ctx context.Context, l *Link) error
      ByCode(ctx context.Context, code string) (*Link, error)
      IncrementHits(ctx context.Context, code string) error
      Delete(ctx context.Context, code, owner string) error
  }
  // -> the service is unit-testable with a 30-line fake; postgres is swappable.`
    },
    { t: "code", title: "Error mapping at the transport boundary", code:
`// Domain errors, declared once in internal/link:
var (
    ErrNotFound  = errors.New("link not found")
    ErrExpired   = errors.New("link expired")
    ErrTaken     = errors.New("code already taken")
    ErrInvalidURL = errors.New("invalid url")
)

// The HTTP layer, and ONLY the HTTP layer, knows about status codes:
func status(err error) int {
    switch {
    case errors.Is(err, link.ErrNotFound):   return http.StatusNotFound
    case errors.Is(err, link.ErrExpired):    return http.StatusGone
    case errors.Is(err, link.ErrTaken):      return http.StatusConflict
    case errors.Is(err, link.ErrInvalidURL): return http.StatusBadRequest
    default:                                 return http.StatusInternalServerError
    }
}
// 5xx responses log the full error and return only a request ID to the client, 
// never leak internal messages. 4xx responses explain what to fix.`
    },
    { t: "code", title: "Validate ruthlessly, a shortener is an open redirect machine", code:
`func validateTarget(raw string) (string, error) {
    u, err := url.Parse(raw)
    if err != nil { return "", ErrInvalidURL }
    if u.Scheme != "http" && u.Scheme != "https" { return "", ErrInvalidURL }
    if u.Host == "" { return "", ErrInvalidURL }
    // SSRF defence: refuse loopback, link-local and private ranges, and your
    // own host, or your shortener becomes a proxy into your private network.
    if isPrivateHost(u.Hostname()) { return "", ErrInvalidURL }
    return u.String(), nil
}
// Also: cap the body with http.MaxBytesReader, DisallowUnknownFields on the
// decoder, rate-limit creation per API key, and treat codes as opaque (generate
// with crypto/rand base62, not an incrementing ID you can enumerate).`
    },
    { t: "note", kind: "tip", title: "Integration tests that are worth the setup", html: "Spin a real Postgres for tests, Docker Compose in CI, or <a href=\"https://golang.testcontainers.org/\" target=\"_blank\" rel=\"noopener\">testcontainers-go</a> from <code>TestMain</code>. Run migrations, then exercise handlers through <code>httptest.NewServer</code> so you cover routing, middleware, encoding and SQL in one pass. Guard them with <code>testing.Short()</code> so <code>go test -short</code> stays fast for the inner loop." }
  ],
  milestones: [
    { title: "In-memory version first", detail: "Handlers + a `map[string]*Link` behind the Store interface. POST and redirect working end to end, with tests. No database yet." },
    { title: "Postgres + migrations", detail: "`docker compose up postgres`, golang-migrate, implement the Store, tune the pool (`SetMaxOpenConns`, `SetConnMaxLifetime`). Keep the in-memory store, it stays useful for unit tests." },
    { title: "Middleware stack", detail: "requestID → logging (slog, JSON) → metrics → recoverer → rate limit → auth for write routes. Compose by nesting; test each one in isolation." },
    { title: "Harden the input", detail: "URL validation + SSRF denylist, body size cap, `DisallowUnknownFields`, crypto/rand codes, custom-code collision handling, TTL/expiry." },
    { title: "Integration tests", detail: "Real Postgres via testcontainers, `httptest.NewServer`, table-driven cases for every endpoint including 404/409/410/429 paths." },
    { title: "Operational surface", detail: "/healthz (cheap) and /readyz (pings the DB) on the main port; /metrics and pprof on a separate internal mux. RED metrics labelled by route pattern." },
    { title: "Graceful shutdown", detail: "`signal.NotifyContext` → fail readiness → sleep for LB deregistration → `srv.Shutdown` → close the pool. Verify with a load generator running during a restart: zero dropped requests." },
    { title: "Containerise and run it", detail: "Multi-stage Dockerfile onto distroless as nonroot, compose with Postgres + the migration job, `GOMEMLIMIT` set. Then hit it with `hey -z 30s` and read your own dashboard." }
  ],
  done: [
    "`docker compose up` from a clean clone gives a working API, no manual setup steps",
    "`go test -race ./...` passes, including integration tests against real Postgres in CI",
    "A restart under sustained load drops zero requests (graceful shutdown verified, not assumed)",
    "Every 4xx is explained to the client; every 5xx is logged with a request ID and leaks nothing",
    "Creating a link to `http://localhost` or `http://169.254.169.254` is rejected",
    "/metrics shows request rate, error rate and latency histograms per route; p99 is visible"
  ],
  stretch: [
    "Per-API-key quotas with a token bucket in Redis, so limits survive a restart and span replicas",
    "A Redis read-through cache in front of the redirect path, with metrics proving the hit ratio",
    "QR code generation for a short link",
    "OpenAPI spec + generated client, and a `snip` CLI that uses it",
    "Click analytics: async event writes to a separate table, aggregated hourly",
    "Swap the transport for gRPC while keeping the exact same domain package, proof the layering works"
  ]
},

/* ───────────────────────────── 3 ───────────────────────────── */
{
  id: "crawlr",
  category: "CLI & Tools",
  icon: "🕷️",
  name: "crawlr, a concurrent web crawler",
  tagline: "The definitive concurrency project: worker pools, context cancellation, politeness, dedupe, backpressure, and a race-free shared visited set.",
  level: "Intermediate",
  time: "10–16 hours",
  stack: ["net/http", "golang.org/x/net/html", "sync", "context", "errgroup", "pprof"],
  covers: ["concurrency", "runtime-internals", "pointers-memory", "testing", "reliability-observability"],
  blocks: [
    { t: "p", html: "Crawling one page is twenty lines. Crawling ten thousand pages politely, in parallel, without duplicating work, without leaking goroutines, without melting the target server, and stopping cleanly on Ctrl-C is a genuine engineering exercise, and it will teach you more about Go's concurrency model than any tutorial." },
    { t: "h", text: "Target behaviour" },
    { t: "p", html: "This is what the finished command should print. Build until your program matches it." },
    { t: "code", title: "The CLI", code:
`$ crawlr --depth 3 --workers 20 --rps 5 --timeout 10s \\
         --same-host --out sitemap.json https://example.com

crawling https://example.com  depth=3 workers=20 rps=5
  200  /                      14 links    82ms
  200  /docs                  31 links   120ms
  404  /old-page               0 links    41ms
...
done  pages=842 ok=820 errors=22 unique_urls=1,204 elapsed=48s
wrote sitemap.json (842 pages, 3,118 edges)

^C  -> cancelling: draining 20 workers... flushed partial results to sitemap.json`
    },
    { t: "h", text: "Architecture" },
    { t: "p", html: "This is how the pieces connect. Read it before you create the packages." },
    { t: "code", title: "Bounded everything", code:
`                       ┌──────── frontier (buffered chan Task) ────────┐
                       │  Task{URL string; Depth int}                   │
   seed ──────────────▶│  BUFFERED: backpressure instead of unbounded   │
                       └───┬───────────┬───────────┬───────────────────┘
                           ▼           ▼           ▼
                       worker 1    worker 2 ...  worker N     (errgroup, SetLimit)
                        fetch (rate-limited, timeout, ctx)
                        parse links (x/net/html tokenizer)
                        normalise + filter + dedupe
                           │           │           │
                           └───────────┴───────────┴──▶ results chan PageResult
                                                              │
                                                        collector: builds the
                                                        graph, writes JSON

 Shared state: visited map[string]struct{} behind a sync.Mutex (or sync.Map).
 Termination: a sync.WaitGroup counting OUTSTANDING TASKS, not workers, 
 the crawl is done when the in-flight count hits zero, which is the single
 hardest bug in this project.`
    },
    { t: "code", title: "The pieces that matter", code:
`// 1. Politeness: one global token bucket, plus a per-host limiter
limiter := rate.NewLimiter(rate.Limit(cfg.RPS), cfg.Burst)
if err := limiter.Wait(ctx); err != nil { return err }   // respects cancellation

// 2. Normalise BEFORE dedupe, or you will crawl the same page five times
func normalise(u *url.URL) string {
    u.Fragment = ""                        // #section is the same page
    u.Host = strings.ToLower(u.Host)
    if u.Path == "" { u.Path = "/" }
    u.RawQuery = sortedQuery(u.RawQuery)   // ?b=2&a=1 == ?a=1&b=2
    return u.String()
}

// 3. Claim a URL exactly once, atomically
func (c *Crawler) claim(key string) bool {
    c.mu.Lock(); defer c.mu.Unlock()
    if _, seen := c.visited[key]; seen { return false }
    c.visited[key] = struct{}{}
    return true
}

// 4. Never trust a remote body: cap it, and check the content type
resp, err := c.client.Do(req)
if err != nil { return err }
defer resp.Body.Close()                    // ALWAYS, or you leak connections
if !strings.HasPrefix(resp.Header.Get("Content-Type"), "text/html") { return nil }
body := io.LimitReader(resp.Body, 5<<20)   // 5 MB ceiling`
    },
    { t: "note", kind: "warn", title: "Crawl responsibly", html: "Point this at your own site, a staging environment, or sites that explicitly allow it (<code>https://books.toscrape.com</code>, <code>https://quotes.toscrape.com</code> exist for practice). Read and honour <code>robots.txt</code>, <code>github.com/temoto/robotstxt</code> is twenty lines of integration. Set a real <code>User-Agent</code> with contact information, keep the default rate low, and back off on 429 and 503. An aggressive crawler is indistinguishable from an attack." }
  ],
  milestones: [
    { title: "Fetch and parse one page", detail: "An `http.Client` with a timeout, `x/net/html` tokenizer, extract and resolve every `<a href>` against the base URL. Table-driven tests over HTML fixture strings." },
    { title: "Serial BFS with a depth limit", detail: "A queue, a visited set, a `--same-host` filter, URL normalisation. Correct before concurrent, and now you have a baseline to benchmark." },
    { title: "Add the worker pool", detail: "Buffered frontier channel + errgroup with `SetLimit(workers)`. Get termination right: a WaitGroup over outstanding tasks, closing the frontier exactly once." },
    { title: "Prove it's race-free", detail: "`go test -race` with a test that crawls a local `httptest` server of 100 interlinked pages from 20 workers, asserting each page is fetched exactly once." },
    { title: "Politeness and resilience", detail: "Global + per-host rate limits, retries with jittered backoff on 429/5xx/timeouts, robots.txt, redirect limits, body size caps." },
    { title: "Cancellation that works", detail: "`signal.NotifyContext`; Ctrl-C drains workers, flushes partial results and exits non-zero. Verify `runtime.NumGoroutine()` returns to baseline, no leaks." },
    { title: "Output and reporting", detail: "JSON sitemap with the link graph, a summary table, broken-link report grouped by referrer, optional DOT output for Graphviz." },
    { title: "Profile it", detail: "`--pprof` flag exposing pprof on localhost. Crawl 5,000 pages, capture CPU and heap profiles, find the top allocation site, and fix it. Record the before/after numbers in the README." }
  ],
  done: [
    "`go test -race ./...` is clean, including a 20-worker concurrent crawl of a local test server",
    "Each unique URL is fetched exactly once, asserted by a test, not by inspection",
    "Ctrl-C exits within a second with partial results written and zero leaked goroutines",
    "Measured throughput scales with `--workers` up to the rate limit, then flattens (and you can explain why)",
    "robots.txt is honoured and the default rate limit is conservative",
    "A heap profile shows flat memory across a 10,000-page crawl"
  ],
  stretch: [
    "Resumable crawls: persist the frontier and visited set to BoltDB/SQLite",
    "A tiny full-text index over the fetched pages, with a search endpoint",
    "Detect redirect loops and canonical-tag duplicates",
    "`--screenshot` mode via chromedp for JS-rendered pages",
    "Distribute the frontier across processes through Redis, and compare throughput",
    "Expose live Prometheus metrics (pages/sec, queue depth, error rate by host) during the crawl"
  ]
},

/* ───────────────────────────── 4 ───────────────────────────── */
{
  id: "tinykv",
  category: "Systems & Data",
  icon: "🗄️",
  name: "tinykv, a persistent key-value store",
  tagline: "Write a storage engine: append-only log, in-memory index, crash recovery, compaction, and benchmarks that prove it.",
  level: "Advanced",
  time: "16–25 hours",
  stack: ["os", "encoding/binary", "hash/crc32", "sync", "net/http", "testing (fuzz + bench)"],
  covers: ["collections", "pointers-memory", "runtime-internals", "concurrency", "iterators", "testing"],
  blocks: [
    { t: "p", html: "A Bitcask-style engine: every write appends to a log file, an in-memory hash index maps each key to a file offset, and reads are one seek. It is the design behind Riak and the ancestor of a dozen embedded stores, simple enough to build in a weekend, deep enough to teach you durability, file formats, crash recovery and what <code>fsync</code> actually costs." },
    { t: "h", text: "The record format" },
    { t: "p", html: "This is one record on disk, byte by byte. Design it before you write Put and Get, because every later feature has to read this layout." },
    { t: "code", title: "On-disk layout, design this first, on paper", code:
` ┌────────┬───────────┬──────────┬────────────┬─────────┬───────────┐
 │ CRC32  │ Timestamp │ KeyLen   │ ValueLen   │   Key   │   Value   │
 │ 4 B    │ 8 B       │ 4 B      │ 4 B        │ var     │ var       │
 └────────┴───────────┴──────────┴────────────┴─────────┴───────────┘
   little-endian, fixed 20-byte header, then the payload.
   A delete is a TOMBSTONE: a normal record with ValueLen = 0xFFFFFFFF.
   The CRC covers everything after it, so a torn write (power loss mid-append)
   is DETECTABLE on recovery rather than silently returning garbage.

 In memory:
   index map[string]entry{ fileID uint32; offset int64; size uint32; ts int64 }
   -> a GET is: index lookup (O(1)) + one ReadAt. Values never sit in the heap,
      so you can serve a dataset far larger than RAM.`
    },
    { t: "code", title: "Put, Get, and the durability decision", code:
`func (db *DB) Put(key string, val []byte) error {
    db.mu.Lock(); defer db.mu.Unlock()

    rec := encode(key, val, time.Now().UnixNano())
    off := db.activeOffset
    if _, err := db.active.Write(rec); err != nil { return err }   // append-only
    db.activeOffset += int64(len(rec))

    if db.syncOnPut {
        if err := db.active.Sync(); err != nil { return err }      // fsync: ~1ms
    }
    db.index[key] = entry{fileID: db.activeID, offset: off, size: uint32(len(rec))}
    if db.activeOffset > db.maxFileSize { return db.rotate() }
    return nil
}

func (db *DB) Get(key string) ([]byte, error) {
    db.mu.RLock(); e, ok := db.index[key]; db.mu.RUnlock()
    if !ok { return nil, ErrKeyNotFound }
    buf := make([]byte, e.size)
    if _, err := db.file(e.fileID).ReadAt(buf, e.offset); err != nil { return nil, err }
    return decodeValue(buf)       // verify the CRC here; corruption must error
}

// THE tradeoff to measure and document:
//   syncOnPut = true   -> durable on power loss, ~1,000 writes/sec
//   syncOnPut = false  -> OS page cache only, ~500,000 writes/sec, loses the
//                         last few ms on a hard crash (process crash is fine)
// Expose it as an option. Benchmark both. That table is the project.`
    },
    { t: "note", kind: "deep", title: "Compaction is where it gets interesting", html: "Updates and deletes never remove anything, so the log grows forever. Compaction walks the live index, copies only current records into a fresh file, atomically swaps it in (<code>os.Rename</code> is atomic on the same filesystem), and deletes the old segments. It must run <strong>without blocking reads</strong>, and it must be crash-safe at every step, if you die mid-compaction, recovery has to produce a consistent store. Get this right and you have understood most of what an LSM tree does." }
  ],
  milestones: [
    { title: "Encode/decode a record", detail: "Fixed header with `encoding/binary`, CRC32 over the payload, round-trip tests, and a fuzz test (`go test -fuzz`) asserting decode never panics on arbitrary bytes." },
    { title: "In-memory store + interface", detail: "Define `Put/Get/Delete/Keys/Close`, implement it over a map, write the full test suite against the interface. Every later engine must pass the same tests." },
    { title: "Append-only persistence", detail: "Single log file, index updated on write, `ReadAt` for reads. Reopen the file and rebuild the index on startup." },
    { title: "Crash recovery", detail: "Scan the log on open, stop cleanly at the first bad CRC or truncated record (a torn tail is expected, not fatal). Test it by truncating a file mid-record and reopening." },
    { title: "Segments and compaction", detail: "Rotate at a max file size, compact live records into a new segment, atomic rename, delete old files. Assert disk usage drops and all keys survive." },
    { title: "Concurrency", detail: "`sync.RWMutex` around the index, single-writer append. `go test -race` with 50 goroutines mixing reads, writes and deletes while a compaction runs." },
    { title: "HTTP + CLI front ends", detail: "`PUT/GET/DELETE /kv/{key}`, a `tinykv` REPL, and a `--sync` flag. Now it's a usable service, not a library demo." },
    { title: "Benchmark and profile", detail: "`-benchmem` for Put/Get at 10k/1M keys, sync vs async, before/after compaction. Then pprof the allocation hot path and cut `allocs/op`. Put the table in the README." }
  ],
  done: [
    "Kill -9 during a write-heavy load, reopen, and every acknowledged key is present and uncorrupted",
    "A truncated or bit-flipped record is detected by CRC and reported, never returned as data",
    "`go test -race` passes with concurrent readers, writers and a running compaction",
    "A fuzz target has run for 60s with no crashes",
    "Compaction reclaims space while reads continue to be served",
    "README contains measured throughput and latency numbers for sync and async modes"
  ],
  stretch: [
    "Hint files so startup doesn't re-scan every segment (index rebuild in O(keys), not O(bytes))",
    "Range scans via a sorted index (B-tree or skip list) instead of a hash map",
    "TTL expiry with a background sweeper",
    "A write-ahead batch API with atomic multi-key commits",
    "Snappy/zstd value compression, with a benchmark showing the CPU/space tradeoff",
    "Single-leader replication over TCP to a follower, then read-your-writes semantics"
  ]
},

/* ───────────────────────────── 5 ───────────────────────────── */
{
  id: "jobq",
  category: "Systems & Data",
  icon: "⚙️",
  name: "jobq, a background job queue & worker",
  tagline: "Every production pattern in one service: at-least-once delivery, retries with backoff, idempotency, dead-letter queue, scheduled jobs, graceful drain.",
  level: "Advanced",
  time: "14–22 hours",
  stack: ["Postgres (SKIP LOCKED)", "database/sql", "context", "sync", "prometheus", "testcontainers"],
  covers: ["errors", "concurrency", "stdlib-service", "production-readiness", "reliability-observability"],
  blocks: [
    { t: "p", html: "Almost every real backend needs one of these: send the email, generate the report, call the slow third-party API, later, reliably, without blocking the request. Building it yourself teaches the hard parts of distributed systems in a single process you can fully understand: exactly-once is impossible, at-least-once plus idempotency is the answer, and every failure mode has to be designed for." },
    { t: "h", text: "Why Postgres and not Redis" },
    { t: "p", html: "The useful part is one SQL statement. Several workers can each lock a different row, and a row that is already locked is skipped instead of blocking the others." },
    { t: "code", title: "FOR UPDATE SKIP LOCKED is the whole trick", code:
`-- Multiple workers can claim DIFFERENT rows concurrently with no contention
-- and no lost jobs: the row lock is the lease, inside a transaction.
WITH claimed AS (
    SELECT id FROM jobs
    WHERE status = 'pending' AND run_at <= now()
    ORDER BY priority DESC, run_at
    FOR UPDATE SKIP LOCKED          -- skip rows another worker already holds
    LIMIT $1
)
UPDATE jobs j SET status='running', attempts=attempts+1,
       claimed_at=now(), claimed_by=$2
FROM claimed c WHERE j.id = c.id
RETURNING j.id, j.kind, j.payload, j.attempts;

-- You get durability, transactional enqueue (enqueue a job in the SAME
-- transaction as the business write, no "committed but never queued" bug),
-- queryable state, and no extra infrastructure. Good to tens of thousands of
-- jobs/sec, which is more than most systems ever need.`
    },
    { t: "code", title: "Schema", code:
`CREATE TABLE jobs (
    id            bigserial PRIMARY KEY,
    kind          text        NOT NULL,          -- "email.welcome"
    payload       jsonb       NOT NULL,
    status        text        NOT NULL DEFAULT 'pending',  -- pending|running|done|failed|dead
    priority      int         NOT NULL DEFAULT 0,
    attempts      int         NOT NULL DEFAULT 0,
    max_attempts  int         NOT NULL DEFAULT 5,
    run_at        timestamptz NOT NULL DEFAULT now(),      -- delay / backoff
    claimed_at    timestamptz,
    claimed_by    text,
    last_error    text,
    idempotency_key text UNIQUE,                 -- dedupe at enqueue time
    created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON jobs (status, run_at) WHERE status = 'pending';`
    },
    { t: "code", title: "The worker loop", code:
`type Handler func(ctx context.Context, job Job) error

func (w *Worker) run(ctx context.Context) error {
    for {
        if ctx.Err() != nil { return nil }                  // drain on shutdown

        jobs, err := w.store.Claim(ctx, w.batch, w.id)
        if err != nil { w.log.Error("claim", "err", err); sleep(ctx, time.Second); continue }
        if len(jobs) == 0 { sleep(ctx, w.pollInterval); continue }   // or LISTEN/NOTIFY

        for _, j := range jobs {
            // Each job gets its OWN deadline, and its own panic boundary, 
            // one bad handler must not kill the worker.
            jobCtx, cancel := context.WithTimeout(ctx, w.jobTimeout)
            err := w.safeHandle(jobCtx, j)
            cancel()

            switch {
            case err == nil:
                w.store.Complete(ctx, j.ID)
            case j.Attempts >= j.MaxAttempts:
                w.store.Dead(ctx, j.ID, err)                // DEAD LETTER: stop,
                deadTotal.WithLabelValues(j.Kind).Inc()      // alert, inspect
            default:
                // exponential backoff with jitter, persisted as run_at
                d := time.Duration(rand.Int64N(int64(w.base) << j.Attempts)) // math/rand/v2
                w.store.Retry(ctx, j.ID, time.Now().Add(d), err)
            }
        }
    }
}

func (w *Worker) safeHandle(ctx context.Context, j Job) (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("panic in handler %s: %v", j.Kind, r)
            w.log.Error("handler panic", "kind", j.Kind, "stack", string(debug.Stack()))
        }
    }()
    h, ok := w.handlers[j.Kind]
    if !ok { return fmt.Errorf("no handler for kind %q", j.Kind) }
    return h(ctx, j)
}`
    },
    { t: "note", kind: "warn", title: "At-least-once means handlers MUST be idempotent", html: "A worker can die after doing the work but before marking the job complete, so the job runs again. There is no way around this; delivery is at-least-once. The fix lives in the handler: a unique constraint on the effect (<code>INSERT … ON CONFLICT DO NOTHING</code>), an idempotency key passed to the third-party API, or a check-then-act inside a transaction. Also design for the <strong>stuck job</strong>: a worker that is OOM-killed leaves a row in <code>running</code> forever, so you need a reaper that returns jobs claimed longer than the lease back to <code>pending</code>." }
  ],
  milestones: [
    { title: "In-memory queue + handler registry", detail: "`Enqueue(kind, payload)`, a `map[string]Handler`, a worker pool consuming a channel. Full test suite, no database, this is your reference implementation." },
    { title: "Postgres-backed store", detail: "Schema, migrations, `Claim` with FOR UPDATE SKIP LOCKED, Complete/Retry/Dead. Integration tests with testcontainers." },
    { title: "Retries and dead-letter", detail: "Persisted exponential backoff with jitter via `run_at`, `max_attempts`, a `dead` status, and `last_error` retained for debugging." },
    { title: "Idempotency and the reaper", detail: "Unique `idempotency_key` on enqueue; a background reaper that reclaims jobs whose lease expired. Test both by killing a worker mid-job." },
    { title: "Scheduling", detail: "Delayed jobs (`run_at` in the future) and recurring jobs from a cron spec, with a leader-election or advisory-lock guard so N replicas don't each fire the same cron." },
    { title: "Graceful drain", detail: "On SIGTERM: stop claiming, let in-flight jobs finish within the grace period, release anything unfinished back to `pending`, then exit. Verify zero lost or duplicated jobs under a kill loop." },
    { title: "Observability", detail: "Metrics for queue depth by status/kind, job duration histogram, retry and dead counters, worker utilisation. Plus `GET /admin/jobs` to list, inspect and requeue dead jobs." },
    { title: "Prove the guarantees", detail: "A chaos test: enqueue 10,000 jobs, run 5 workers, SIGKILL one every 2 seconds. Assert every job completes exactly once *in effect* (idempotency holds) and none is lost." }
  ],
  done: [
    "10,000 jobs with workers being killed randomly: nothing lost, every effect applied once",
    "`go test -race ./...` passes, including Postgres integration tests",
    "A handler that panics fails its job and leaves the worker running",
    "A job exceeding max_attempts lands in the dead-letter queue with its last error retained and a metric incremented",
    "SIGTERM drains in-flight work within the grace period and releases unfinished claims",
    "Queue depth, job latency and dead-job count are all visible as metrics"
  ],
  stretch: [
    "LISTEN/NOTIFY to replace polling, so latency drops from poll-interval to milliseconds",
    "Priority lanes and per-kind concurrency limits so one slow job type can't starve the rest",
    "Workflow support: job chains and fan-out/fan-in with dependencies",
    "A small HTML dashboard (html/template + embed) showing live queue state",
    "Swap the store for Redis streams behind the same interface, and benchmark both",
    "Rate-limit per external dependency so a third-party API's quota is respected across all workers"
  ]
},

/* ───────────────────────────── 6 ───────────────────────────── */
{
  id: "pulse",
  category: "Web Apps",
  icon: "📡",
  name: "pulse, a real-time metrics dashboard",
  tagline: "Full-stack Go: concurrent API fan-in, caching, circuit breaking, server-sent events, embedded templates, OpenTelemetry, one static binary.",
  level: "Advanced",
  time: "12–18 hours",
  stack: ["net/http", "html/template", "embed", "SSE", "errgroup", "gobreaker", "OpenTelemetry"],
  covers: ["concurrency", "methods-interfaces", "stdlib-service", "reliability-observability", "production-readiness"],
  blocks: [
    { t: "p", html: "A dashboard that aggregates several slow, unreliable upstream APIs, GitHub repo stats, a weather endpoint, your own services' <code>/metrics</code>, and streams live updates to a browser. One binary, no npm, no separate frontend: templates and assets are compiled in with <code>go:embed</code>. This is the project that shows Go doing a full product end to end." },
    { t: "h", text: "Architecture" },
    { t: "p", html: "This is how the pieces connect. Read it before you create the packages." },
    { t: "code", title: "Fan-in, cache, broadcast", code:
`  poller (background goroutine, ticker)
     │  errgroup: fetch every source CONCURRENTLY with a per-source
     │  timeout, circuit breaker and retry. One dead source degrades
     │  that one tile, it never takes the page down.
     ▼
  snapshot store  (atomic.Pointer[Snapshot], lock-free reads)
     │
     ├──▶ GET /            html/template server-render (works with JS off)
     ├──▶ GET /api/stats   JSON for programmatic use
     └──▶ GET /events      Server-Sent Events: push each new snapshot to
                            every connected browser

  hub: map[chan []byte]struct{} + mutex, or one channel per client with a
  non-blocking send so a slow browser is DROPPED, never allowed to block
  the broadcaster. This is the bug everyone writes first.`
    },
    { t: "code", title: "Concurrent fan-in that degrades gracefully", code:
`func (p *Poller) collect(ctx context.Context) Snapshot {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    var (
        mu   sync.Mutex
        snap = Snapshot{At: time.Now(), Tiles: map[string]Tile{}}
        g, gctx = errgroup.WithContext(ctx)
    )
    g.SetLimit(8)

    for _, src := range p.sources {
        src := src
        g.Go(func() error {
            t, err := src.Fetch(gctx)          // breaker + retry live inside
            mu.Lock(); defer mu.Unlock()
            if err != nil {
                // Degrade, don't fail: keep the last good value and mark it stale.
                prev := p.last().Tiles[src.Name()]
                prev.Stale, prev.Err = true, err.Error()
                snap.Tiles[src.Name()] = prev
                sourceErrors.WithLabelValues(src.Name()).Inc()
                return nil                      // NOT an error for the group
            }
            snap.Tiles[src.Name()] = t
            return nil
        })
    }
    _ = g.Wait()
    return snap
}

// Lock-free reads for every HTTP handler:
//   p.cur.Store(&snap)        // atomic.Pointer[Snapshot]
//   s := p.cur.Load()`
    },
    { t: "code", title: "Server-sent events, simpler than WebSockets, and enough", code:
`func (s *Server) events(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")

    ch := s.hub.subscribe()                 // buffered chan []byte
    defer s.hub.unsubscribe(ch)

    rc := http.NewResponseController(w)     // Go 1.20+: per-write deadlines
    ping := time.NewTicker(25 * time.Second)
    defer ping.Stop()

    for {
        select {
        case <-r.Context().Done():          // browser closed the tab
            return
        case msg := <-ch:
            fmt.Fprintf(w, "data: %s\\n\\n", msg)
            rc.Flush()
        case <-ping.C:
            fmt.Fprint(w, ": keepalive\\n\\n")   // keeps proxies from timing out
            rc.Flush()
        }
    }
}
// NOTE: this handler must be exempt from WriteTimeout, set it per-connection
// with rc.SetWriteDeadline, or long-lived streams get killed mid-flight.`
    },
    { t: "note", kind: "tip", title: "Why embed makes this feel like magic", html: "<code>//go:embed templates/* static/*</code> compiles your HTML, CSS and JS into the binary. Deployment becomes: copy one file, run it. No asset pipeline, no missing-template-in-production incident, no CDN to configure. Combined with <code>html/template</code>'s automatic contextual escaping, you get an XSS-resistant server-rendered UI with zero dependencies." }
  ],
  milestones: [
    { title: "One source, rendered", detail: "A `Source` interface (`Name() string; Fetch(ctx) (Tile, error)`), one real implementation, an `html/template` page, assets via `go:embed`. Test with `httptest` fakes for the upstream." },
    { title: "Concurrent fan-in", detail: "errgroup across sources with per-source timeouts, results into a Snapshot, `atomic.Pointer` for lock-free reads. Assert total latency ≈ the slowest source, not the sum." },
    { title: "Resilience per source", detail: "Retries with jitter, `gobreaker` circuit breaker, stale-value fallback so a dead upstream greys out one tile. Test with a fake that fails, hangs, and returns garbage." },
    { title: "Background poller", detail: "Ticker-driven refresh, started from `run()`, cancelled by context on shutdown. No request should ever wait on an upstream fetch." },
    { title: "Live updates via SSE", detail: "A hub with non-blocking sends and buffered per-client channels, keepalive pings, per-connection write deadlines. Test that a slow client is dropped without stalling the broadcaster." },
    { title: "The UI", detail: "Server-rendered tiles that work without JavaScript, then ~40 lines of `EventSource` JS to patch values live. Sparklines from inline SVG. Responsive and dark-mode by default." },
    { title: "Observability", detail: "OpenTelemetry traces across poller → sources → HTTP (otelhttp in and out), RED metrics, /healthz and /readyz, pprof and /metrics on an internal admin port." },
    { title: "Ship it", detail: "Distroless container, `GOMEMLIMIT`, config from env, graceful shutdown that closes every SSE connection cleanly. Deploy it somewhere real and watch your own traces." }
  ],
  done: [
    "Killing an upstream API greys out one tile and leaves the rest of the page live",
    "Total refresh latency is close to the slowest source, proving the fetches are concurrent",
    "Fifty concurrent SSE clients receive updates; a deliberately stalled client is dropped without affecting the others",
    "`go test -race ./...` passes with fake sources covering success, timeout, error and garbage responses",
    "`runtime.NumGoroutine()` returns to baseline after clients disconnect, no leaks",
    "The deployed artifact is one static binary (or ~20 MB image) with templates and assets embedded"
  ],
  stretch: [
    "Historical data in SQLite with time-range queries and real sparklines",
    "Alert rules with notifications to Slack or email, backed by jobq (project 5)",
    "WebSocket upgrade for bidirectional control, compared honestly against SSE",
    "Multi-tenant dashboards with per-user source configs and auth",
    "A `pulse watch` terminal UI over the same API using Bubble Tea",
    "Swap the poller for a pull-based Prometheus scrape and compare operational complexity"
  ]
}

];
