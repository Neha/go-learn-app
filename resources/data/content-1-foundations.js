/* Modules 1–7 : Foundations */
window.CURRICULUM_PARTS = window.CURRICULUM_PARTS || [];
window.CURRICULUM_PARTS.push([

/* ───────────────────────────── 1 ───────────────────────────── */
{
  id: "what-is-go",
  level: "Beginner",
  icon: "🐹",
  title: "What Is Go, Really?",
  minutes: 20,
  blurb: "Compiled or interpreted? Where does the runtime fit? Why Go feels fast.",
  blocks: [
    { t: "p", html: "Go (often <em>Golang</em>, because <code>golang.org</code> was the old domain) is a statically typed, <strong>compiled</strong> language created at Google in 2007 by Robert Griesemer, Rob Pike and Ken Thompson. It was designed to solve a very human problem: large codebases that take too long to build and too long to understand." },

    { t: "h", text: "Is Go compiled or interpreted?" },
    { t: "p", html: "<strong>Compiled — ahead of time, straight to machine code.</strong> There is no JVM, no bytecode interpreter, no JIT. <code>go build</code> produces a native executable for a specific OS and CPU architecture. You can copy that single file onto a matching machine and run it with nothing else installed." },
    { t: "note", kind: "warn", title: "But what about `go run`?", html: "<code>go run main.go</code> <em>looks</em> interpreted. It is not. Go compiles your program to a temporary binary, executes it, and deletes it. The feel is scripting; the mechanics are compilation." },

    { t: "diagram", id: "exec-models" },
    { t: "note", kind: "deep", title: "So where does the speed come from?", html: "A compiled language starts at full speed — there is no warm-up and no interpreter loop. A <em>JIT</em> language can eventually match or beat it on long-running hot loops, because it optimises using real run-time information, but it pays for that with startup latency and a heavy VM. Go takes a third route: compile everything up front, and optionally feed a <strong>production profile back into the compiler</strong> (PGO) to get some of the JIT's advantage without the JIT." },

    { t: "h", text: "The pipeline, end to end" },
    { t: "list", ordered: true, items: [
      "<strong>Scan &amp; parse</strong> — source text becomes an abstract syntax tree (AST).",
      "<strong>Type-check</strong> — every expression gets a type; most bugs die here.",
      "<strong>SSA &amp; optimise</strong> — the compiler lowers to Static Single Assignment form, inlines small functions, eliminates dead code, and runs <em>escape analysis</em> to decide stack vs heap.",
      "<strong>Generate machine code</strong> — real instructions for amd64, arm64, etc.",
      "<strong>Link</strong> — your code plus every dependency plus the Go <em>runtime</em> are linked into one binary."
    ]},
    { t: "diagram", id: "pipeline" },
    { t: "code", title: "Build once, ship anywhere (cross compilation is a single env var)", code:
`# Native build
go build -o app .

# A Linux ARM64 binary, built from a Mac, no Docker, no toolchain install
GOOS=linux GOARCH=arm64 go build -o app-linux-arm64 .

# Smaller binary: strip symbol table and DWARF debug info
go build -ldflags="-s -w" -o app .

# See what the compiler decided about memory
go build -gcflags="-m" .`
    },

    { t: "h", text: "So Go has no runtime?" },
    { t: "p", html: "It has a runtime — it just <strong>ships inside your binary</strong> instead of being installed on the machine. The Go runtime is a few megabytes of Go and assembly that provides the things the language promises: the <strong>goroutine scheduler</strong>, the <strong>garbage collector</strong>, the <strong>memory allocator</strong>, channel and map implementations, panic/recover, and reflection metadata. That's why a trivial Go program is ~1.5–2 MB rather than 20 KB. You pay a fixed floor and get managed memory plus cheap concurrency." },

    { t: "h", text: "Garbage collected — and what that costs" },
    { t: "p", html: "Go is <strong>garbage collected</strong>: you never call <code>free</code>. The collector is a <em>concurrent, tri-colour, mark-and-sweep</em> design that runs <em>alongside</em> your program and is tuned for low latency — sub-millisecond stop-the-world pauses are typical, even with multi-gigabyte heaps. It is deliberately <strong>not</strong> a compacting or generational collector, which keeps it simple and predictable. Module 12 opens the hood." },

    { t: "h", text: "The feature list — what you actually get" },
    { t: "table", head: ["Feature", "What it means in practice"],
      rows: [
        ["<strong>Compiles to one static binary</strong>", "<code>scp</code> the file and run it. No runtime to install, no virtualenv, no <code>node_modules</code>, no JVM version to match"],
        ["<strong>Builds in seconds</strong>", "Dependency analysis is designed for speed; a large service compiles faster than most test suites run"],
        ["<strong>Goroutines + channels</strong>", "Concurrency is a language feature, not a library. ~2 KB per goroutine means hundreds of thousands are routine"],
        ["<strong>Garbage collected</strong>", "No <code>malloc</code>/<code>free</code>, no ownership rules to learn, sub-millisecond pauses"],
        ["<strong>Static typing with inference</strong>", "Compile-time safety, but <code>x := 42</code> instead of ceremony"],
        ["<strong>Implicit interfaces</strong>", "Types satisfy an interface by having the methods — decoupling without dependency-injection frameworks"],
        ["<strong>One official formatter</strong>", "<code>gofmt</code> ends every style argument; every Go codebase looks the same"],
        ["<strong>Tooling in the box</strong>", "Test runner, benchmarks, fuzzer, race detector, profiler, coverage, doc generator, vulnerability scanner — all <code>go &lt;verb&gt;</code>"],
        ["<strong>Cross compilation built in</strong>", "<code>GOOS=linux GOARCH=arm64 go build</code>, from any machine, no extra toolchain"],
        ["<strong>A strong standard library</strong>", "Production HTTP server and client, TLS, JSON, SQL interface, templating, crypto — with no dependencies"],
        ["<strong>Explicit errors</strong>", "Failure is a value in the signature, not an invisible exception path"],
        ["<strong>A real compatibility promise</strong>", "Code written for Go 1.0 still compiles today. Upgrades are boring, which is a feature"],
        ["<strong>Generics</strong> (1.18+)", "Type-safe containers and algorithms without code generation or <code>any</code>"],
        ["<strong>A small language</strong>", "25 keywords. Most engineers are productive in a week and can read anyone's code"]
      ]
    },

    { t: "h", text: "Who actually uses Go?" },
    { t: "p", html: "The strongest argument is what's written in it. If you have deployed anything to a cloud in the last decade, you have used Go infrastructure." },
    { t: "table", head: ["", "Examples"],
      rows: [
        ["<strong>Infrastructure you already run</strong>", "<strong>Docker</strong>, <strong>Kubernetes</strong>, <strong>Terraform</strong>, <strong>Prometheus</strong>, <strong>Grafana</strong>, etcd, Consul, Vault, Traefik, Caddy, containerd, Helm, Istio, CockroachDB, InfluxDB, TiDB, NATS, MinIO, Loki, Jaeger, Argo CD, Tailscale"],
        ["<strong>Developer tools</strong>", "The GitHub CLI, Hugo, Esbuild's runner, golangci-lint, Delve, act, k6, Vegeta, mkcert, ngrok"],
        ["<strong>Google</strong>", "Where Go was created: dl.google.com, parts of Search infrastructure, Cloud control planes, Chrome's build and release tooling"],
        ["<strong>Cloudflare</strong>", "Large parts of the edge: DNS, logging pipelines, RRDNS, and much of the control plane"],
        ["<strong>Uber</strong>", "Thousands of microservices; the geofence service rewrite is a well-documented latency win"],
        ["<strong>Netflix, Dropbox, Twitch, SoundCloud</strong>", "Netflix's Rend cache proxy; Dropbox migrated performance-critical Python services; Twitch's chat and video systems; SoundCloud's build and deploy tooling"],
        ["<strong>Fintech &amp; payments</strong>", "Monzo (hundreds of Go microservices), American Express payment routing, PayPal, Capital One"],
        ["<strong>Everything else</strong>", "Shopify, Salesforce, Target, Mercado Libre, Alibaba, Tencent, ByteDance, Riot Games, The New York Times, BBC, Twilio, Segment"]
      ]
    },
    { t: "note", kind: "tip", title: "The pattern in that list", html: "Go dominates <strong>network services, infrastructure and CLI tools</strong> — software that handles many concurrent connections, must deploy as a single artifact, and is maintained by rotating teams. That is not a coincidence; it is exactly what the language was designed for. It is <em>not</em> the leader in data science, machine learning, mobile apps or game engines, and pretending otherwise wastes your time." },

    { t: "h", text: "Advantages — and the honest trade-offs" },
    { t: "table", head: ["Advantage", "The cost that comes with it"],
      rows: [
        ["<strong>Deployment is trivial</strong>: one static binary, tiny containers, instant start (great for serverless and autoscaling)", "Binaries start at ~2 MB because the runtime ships inside; no shared-library savings"],
        ["<strong>Cheap concurrency</strong>: goroutines, channels, <code>select</code> and a work-stealing scheduler", "No compiler-enforced protection against data races — you need <code>-race</code> and discipline"],
        ["<strong>Fast builds</strong> keep the edit-test loop tight and CI cheap", "Enforced by strictness: unused imports and variables are hard errors"],
        ["<strong>Readable by design</strong>: a small language, one formatter, few clever constructs. New hires are productive in days", "Verbose. <code>if err != nil</code> appears a lot, and there is no <code>map</code>/<code>filter</code> sugar"],
        ["<strong>Memory-safe without a borrow checker</strong>, and far faster than interpreted languages", "GC pauses and GC CPU exist — unsuitable for hard real-time; Rust and C still win on raw control"],
        ["<strong>Excellent tooling and stdlib</strong>, so small dependency trees are normal", "Fewer batteries for niches: no mature ORM culture, limited GUI and ML ecosystems"],
        ["<strong>Stability</strong>: the Go 1 compatibility promise means upgrades rarely break you", "The language evolves slowly and deliberately — features you may want (sum types, better error ergonomics) take years or never arrive"],
        ["<strong>Great hiring/onboarding story</strong>: easy to read a codebase you did not write", "Idiomatic Go rejects abstraction you may be used to — no inheritance, no exceptions, no DI containers"]
      ]
    },
    { t: "note", kind: "warn", title: "When Go is the wrong choice", html: "Hard-real-time or microcontroller work (GC and runtime in the way), numeric/GPU computing and machine learning (Python's ecosystem is unmatched), rich native desktop or mobile UIs, and problems that genuinely want a strong type system with sum types and exhaustive matching (Rust, Kotlin, TypeScript, OCaml). Choosing the right tool is a senior skill; a language you like is not automatically the right answer." },

    { t: "h", text: "Go vs. the neighbours" },
    { t: "table", head: ["", "Go", "Python", "Java", "Rust", "C"],
      rows: [
        ["Execution", "AOT compiled", "Interpreted", "Bytecode + JIT", "AOT compiled", "AOT compiled"],
        ["Memory", "GC", "GC (refcount)", "GC", "Ownership, no GC", "Manual"],
        ["Deploy unit", "1 static binary", "Interpreter + deps", "JAR + JVM", "1 static binary", "1 binary + libc"],
        ["Concurrency", "Goroutines + channels", "GIL / asyncio", "Threads, virtual threads", "async + threads", "pthreads"],
        ["Build speed", "Seconds", "n/a", "Slow-ish", "Slow", "Fast"],
        ["Learning curve", "Days", "Days", "Weeks", "Months", "Weeks"]
      ]
    },

    { t: "h", text: "The design philosophy (it explains the odd bits)" },
    { t: "list", items: [
      "<strong>Readability over expressiveness.</strong> One obvious way to do things. No inheritance, no operator overloading, no exceptions.",
      "<strong>Fast builds are a feature.</strong> Unused imports are a compile error partly to keep the dependency graph honest and the build fast.",
      "<strong>Composition, not hierarchy.</strong> Small interfaces, satisfied implicitly, embedded where convenient.",
      "<strong>Explicit errors.</strong> Failure is a value you must look at, not a control-flow surprise.",
      "<strong>A strong standard library</strong> and a formatter (<code>gofmt</code>) nobody argues with."
    ]},
    { t: "note", kind: "tip", title: "Where Go shines", html: "Network services and APIs, CLI tools, infrastructure (Docker, Kubernetes, Terraform, Prometheus are all Go), data pipelines, anything that needs high concurrency with modest memory. Less of a fit: hard-real-time systems, GPU/numeric kernels, and rich native GUIs." }
  ],
  summary: [
    "Go compiles ahead of time to native machine code — no VM, no interpreter, no JIT.",
    "`go run` still compiles; it just hides the temporary binary.",
    "The runtime (scheduler, GC, allocator) is linked into your binary, which is why it's statically self-contained and a couple of MB at minimum.",
    "Memory is managed by a concurrent, low-latency, non-generational mark-and-sweep GC.",
    "Cross compiling is `GOOS=… GOARCH=… go build` — no extra toolchain.",
    "Headline features: one static binary, second-long builds, goroutines, GC, implicit interfaces, gofmt, and a test/bench/fuzz/race/pprof toolchain in the box.",
    "Go runs the cloud: Docker, Kubernetes, Terraform, Prometheus, Grafana, etcd, Vault, CockroachDB, the GitHub CLI — plus Cloudflare, Uber, Monzo, Dropbox, Twitch.",
    "Strengths: network services, infrastructure, CLIs. Weak fits: hard real-time, ML/numeric work, rich GUIs, sum-type-heavy domains.",
    "Every advantage has a cost: tiny deploys but a 2 MB floor; cheap concurrency but no compile-time race protection; readability but verbosity.",
    "The language is small on purpose: readability, fast builds, composition, explicit errors."
  ],
  quiz: [
    { q: "What does `go run main.go` actually do?",
      options: ["Interprets the file line by line", "Compiles to a temporary binary, runs it, discards it", "Starts a Go VM that loads bytecode", "Transpiles to C, then invokes cc"],
      answer: 1,
      explain: "It's a convenience wrapper around compile-and-execute. The compilation is real; only the artifact is temporary." },
    { q: "Why is a hello-world Go binary ~2 MB instead of ~20 KB?",
      options: ["Debug symbols, always included", "The source is embedded in the binary", "The Go runtime — scheduler, GC, allocator — is statically linked in", "It bundles the whole standard library"],
      answer: 2,
      explain: "Only reachable stdlib code is linked, but the runtime always comes along. `-ldflags=\"-s -w\"` trims symbols, not the runtime." },
    { q: "Which statement about Go's garbage collector is true?",
      options: ["It's generational and compacting", "It's concurrent mark-and-sweep, non-generational, tuned for short pauses", "It uses reference counting like CPython", "There is no GC; Go uses ownership rules"],
      answer: 1,
      explain: "The second statement is the true one. Go frees unused memory for you. While your program keeps running, the collector finds the objects you can still reach and throws the rest away — that is mark-and-sweep — and it is tuned so those pauses stay very short. It does not sort objects into young and old (so it is not generational) and it does not slide them together to close gaps (so it is not compacting). It also does not count references the way CPython does, and Go does have a collector: there are no ownership rules." },
    { q: "You're on macOS/arm64 and need a Linux/amd64 binary. Minimum effort?",
      options: ["Install a cross-compiler toolchain", "Build inside a Linux VM or container", "`GOOS=linux GOARCH=amd64 go build`", "Impossible without cgo"],
      answer: 2,
      explain: "Pure-Go cross compilation is built in. (Only cgo-dependent builds need a C cross-toolchain.)" },
    { q: "Which workload is Go the WEAKEST fit for?",
      options: ["A high-concurrency HTTP API", "A CLI tool shipped to many platforms", "Training a neural network", "A Kubernetes controller"],
      answer: 2,
      explain: "Numeric/ML work belongs to Python's ecosystem (and the GPU libraries beneath it). Go owns network services, infrastructure and CLIs — which is why Docker, Kubernetes, Terraform and Prometheus are all written in it." }
  ]
},

/* ───────────────────────────── 2 ───────────────────────────── */
{
  id: "setup-first-program",
  level: "Beginner",
  icon: "🚀",
  title: "Setup, Modules & Your First Program",
  minutes: 18,
  blurb: "Install Go, understand packages and modules, and read hello-world line by line.",
  blocks: [
    { t: "h", text: "Install" },
    { t: "note", kind: "tip", title: "Latest stable release: Go 1.27.1", html: "The current stable release is <strong>Go 1.27.1</strong>, published on 28 August 2026 (language version 1.27, August 2026). Installers for every OS are on <a href=\"https://go.dev/dl/\" target=\"_blank\" rel=\"noopener\">go.dev/dl</a>. <code>go version</code> prints the release you actually have." },
    { t: "code", title: "Install and verify", code:
`# macOS
brew install go
# Linux (official tarball) — Go 1.27.1, the latest stable release
curl -LO https://go.dev/dl/go1.27.1.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.27.1.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
# Windows: download the .msi from https://go.dev/dl

go version      # go version go1.27.1 darwin/arm64
go env GOPATH   # where downloaded modules and installed tools live`
    },
    { t: "note", kind: "tip", title: "GOPATH is no longer your workspace", html: "Pre-2018 Go forced all code under <code>$GOPATH/src</code>. With <strong>modules</strong>, your project lives anywhere you like. <code>GOPATH</code> now only holds the module cache (<code>pkg/mod</code>) and binaries from <code>go install</code> (<code>bin</code>). Add <code>$(go env GOPATH)/bin</code> to your <code>PATH</code>." },

    { t: "h", text: "Do you even need a module?" },
    { t: "p", html: "Beginners hit this on day one: tutorials say <code>go mod init</code>, but a single file also just runs. Both are correct — for different situations." },
    { t: "diagram", id: "module-or-file" },
    { t: "code", title: "The two modes, precisely", code:
`# SCRATCH MODE — no go.mod. Works only for stdlib-only files you name explicitly.
mkdir /tmp/try && cd /tmp/try
cat > scratch.go <<'EOF'
package main
import "fmt"
func main() { fmt.Println("works with no module") }
EOF
go run scratch.go          # fine
go run .                   # FAILS: "go.mod file not found in current directory"
go get github.com/...      # FAILS: needs a module
go test ./...              # FAILS: needs a module

# PROJECT MODE — one command, and everything works.
go mod init example.com/try
go run .                   # fine
go build ./...  go test ./...  go vet ./...   # all fine
go get github.com/google/uuid                # now allowed`
    },
    { t: "note", kind: "tip", title: "Rule of thumb", html: "<strong>Throwaway snippet you'll delete in ten minutes → single file, <code>go run file.go</code></strong> (or <a href=\"https://go.dev/play/\" target=\"_blank\" rel=\"noopener\">the Playground</a>, which needs nothing installed at all). <strong>Everything else → <code>go mod init</code></strong>: the moment you want a dependency, a second package, a test, <code>./...</code> commands, or to commit the code, a module is required. It costs one command and two lines of file, so when you're unsure, make the module." },
    { t: "note", kind: "deep", title: "A different question: when to create a NEW module inside an existing project?", html: "Much rarer, and people over-do it. A new module means a <strong>separately versioned, separately released unit</strong> — so create one only when another repository must depend on part of your code at its own version, or when a sub-tree needs genuinely different dependencies. Everything else should be a <em>package</em> (just a new directory) inside the existing module: one <code>go.mod</code>, one version, atomic refactors across the whole tree. A dozen modules in one repo means a dozen dependency bumps every time you change a shared type." },

    { t: "h", text: "Create a module" },
    { t: "code", title: "A new project", code:
`mkdir hello && cd hello
go mod init github.com/you/hello   # creates go.mod

# go.mod now reads:
#   module github.com/you/hello
#   go 1.23`
    },
    { t: "p", html: "A <strong>module</strong> is a versioned collection of packages — the unit you publish and depend on. A <strong>package</strong> is a directory of <code>.go</code> files sharing a namespace. The module path doubles as the import prefix, which is why it looks like a URL: it's how <code>go get</code> finds your code." },

    { t: "h", text: "Hello, line by line" },
    { t: "code", title: "main.go", code:
`package main        // this package compiles to an executable, not a library

import "fmt"        // standard library: formatted I/O

func main() {       // the entry point of package main
    fmt.Println("Hello, Gopher!")
}`
    },
    { t: "list", items: [
      "<code>package main</code> is special: it tells the linker to build a program. Any other name builds a library.",
      "<code>func main()</code> takes no arguments and returns nothing. When it returns, the program exits — even if goroutines are still running.",
      "<code>Println</code> is capitalised, and that is <strong>the</strong> visibility rule in Go: an identifier exported from a package starts with an uppercase letter. Lowercase means package-private. There is no <code>public</code>/<code>private</code> keyword.",
      "The opening brace must be on the same line. <code>gofmt</code> enforces it; it is not a style debate."
    ]},

    { t: "h", text: "Run, build, install" },
    { t: "code", title: "The commands you'll use hourly", code:
`go run .            # compile + execute the package in this directory
go build -o hello . # produce the ./hello binary
go install .        # build and drop the binary in $GOPATH/bin
go fmt ./...        # canonically format everything
go vet ./...        # report suspicious constructs the compiler allows
go test ./...       # run every test in the module
go doc fmt.Println  # read docs offline`
    },

    { t: "h", text: "Adding a dependency" },
    { t: "code", title: "Dependencies are code, not configuration", code:
`go get github.com/google/uuid        # adds a require line to go.mod, writes go.sum
go mod tidy                          # add what's missing, drop what's unused
go list -m all                       # the full dependency graph
go mod why github.com/google/uuid    # why is this here?`
    },
    { t: "p", html: "<code>go.sum</code> records a cryptographic hash of every module version you use. If an upstream author force-pushes a different tag, your build fails loudly instead of silently changing. Commit both <code>go.mod</code> and <code>go.sum</code>." },

    { t: "h", text: "A layout that scales" },
    { t: "code", title: "Conventional project structure", code:
`myapp/
├── go.mod
├── go.sum
├── cmd/
│   └── server/
│       └── main.go      # thin: parse flags, wire things, call Run()
├── internal/            # importable ONLY inside this module (compiler-enforced)
│   ├── store/
│   └── http/
├── pkg/                 # optional: code you intend others to import
└── README.md`
    },
    { t: "note", kind: "deep", title: "`internal/` is a real compiler rule", html: "Any package under a directory named <code>internal</code> can only be imported by code rooted at <code>internal</code>'s parent. It's the one access-control mechanism Go gives you above the identifier level — use it to keep your public surface small." },
    { t: "note", kind: "tip", title: "Next: set up your editor properly", html: "You can write Go in anything, but twenty minutes of editor setup — format-on-save, <code>gopls</code> diagnostics, a linter and a working debugger — pays back immediately. That's the next module." }
  ],
  summary: [
    "A single stdlib-only file runs with `go run file.go` and no go.mod; anything more — a dependency, a second package, tests, `./...`, or git — needs `go mod init`.",
    "Inside a repo, prefer a new *package* (a directory) over a new *module*; a module is a separately versioned release unit.",
    "`go mod init <module-path>` starts a project; modules freed you from GOPATH.",
    "Module = versioned unit you publish; package = one directory of .go files.",
    "`package main` + `func main()` produces an executable; any other package name is a library.",
    "Capitalisation *is* the visibility system: `Exported` vs `unexported`.",
    "Core loop: `go run .`, `go build`, `go test ./...`, `go fmt ./...`, `go vet ./...`, `go mod tidy`.",
    "`go.sum` pins dependency hashes — commit it. `internal/` is enforced by the compiler."
  ],
  quiz: [
    { q: "Which identifier is visible to other packages?",
      options: ["`parseConfig`", "`ParseConfig`", "`_ParseConfig`", "`public parseConfig`"],
      answer: 1,
      explain: "An initial uppercase letter exports the identifier. Go has no visibility keywords." },
    { q: "What does `go mod tidy` do?",
      options: ["Formats go.mod", "Upgrades every dependency to latest", "Adds missing requirements and removes unused ones", "Deletes the module cache"],
      answer: 2,
      explain: "It syncs go.mod/go.sum with what your code actually imports. It does not bulk-upgrade." },
    { q: "Package `internal/store` lives in module `github.com/me/app`. Who can import it?",
      options: ["Anyone", "Only packages inside github.com/me/app", "Only its own directory", "Only main packages"],
      answer: 1,
      explain: "The `internal` rule limits imports to code rooted at internal's parent directory — here, the whole module." },
    { q: "Why commit `go.sum`?",
      options: ["The build fails without it", "It lists dependency licences", "It pins content hashes so a changed upstream version breaks the build loudly", "It caches the modules themselves"],
      answer: 2,
      explain: "It's a checksum ledger — supply-chain integrity, not storage." },
    { q: "You want to try a 15-line stdlib-only snippet. Minimum setup?",
      options: ["go mod init, then go run .", "Save it as x.go and run `go run x.go`", "Create a GOPATH workspace", "You must always have a go.mod"],
      answer: 1,
      explain: "Naming the file explicitly works with no module. But `go run .`, `go test ./...` and any `go get` all require a go.mod — so for real work, initialise the module." }
  ]
},

/* ───────────────────────────── 3 ───────────────────────────── */
{
  id: "dev-environment",
  level: "Beginner",
  icon: "🛠️",
  title: "Your Dev Environment: IDE, gopls, Linters & Debugger",
  minutes: 20,
  blurb: "Which editor, which extensions, how to configure gopls, which linters to actually enable, and debugging with Delve.",
  blocks: [
    { t: "p", html: "Go's tooling story is unusually good: one official formatter nobody argues about, one official language server, one debugger, and a vet tool in the compiler toolchain. Spend thirty minutes here and the rest of the course — and your job — gets measurably easier." },

    { t: "h", text: "Which editor?" },
    { t: "table", head: ["Editor", "Cost", "Strengths", "Pick it if…"],
      rows: [
        ["<strong>VS Code</strong> + the official Go extension", "free", "The reference experience. gopls, test gutters, debugging, coverage, profiling, refactors — all wired up by one extension maintained by the Go team", "<strong>You're starting out, or you want zero setup friction</strong>"],
        ["<strong>GoLand</strong> (JetBrains)", "paid (free for students/OSS)", "The best refactoring and debugger in the business, plus integrated database tools, HTTP client, profiler UI and coverage", "You do heavy refactoring, or you already live in JetBrains tools"],
        ["<strong>Neovim / Vim</strong>", "free", "Fastest, fully scriptable; gopls via <code>nvim-lspconfig</code>, debugging via <code>nvim-dap</code>", "You already use it — don't learn Vim <em>and</em> Go at once"],
        ["<strong>Zed / Helix / Emacs</strong>", "free", "All speak LSP, so gopls works; less Go-specific glue out of the box", "You have a strong existing preference"]
      ]
    },
    { t: "note", kind: "tip", title: "The honest recommendation", html: "Start with <strong>VS Code + the Go extension</strong>. Everything in this course works there with no configuration beyond one settings block. If you later find yourself doing large-scale renames and interface extractions daily, GoLand earns its licence. Every option above uses the same <code>gopls</code> under the hood, so you are never locked in — and the editor is <em>not</em> where your productivity comes from." },

    { t: "h", text: "gopls — the engine behind all of them" },
    { t: "p", html: "<code>gopls</code> (\"go please\") is the official language server. It provides completion, go-to-definition, find-references, rename, inline diagnostics, quick fixes, signature help, inlay hints, and automatic import management. Your editor is mostly a front end for it." },
    { t: "code", title: "Managing gopls directly", code:
`go install golang.org/x/tools/gopls@latest   # editors usually offer to do this
gopls version
gopls check ./main.go                        # diagnostics from the command line

# When completion or go-to-definition goes stale:
#  1. Reload/restart the language server ("Go: Restart Language Server")
#  2. Make sure the editor's workspace root is the directory with go.mod
#     — opening a subdirectory is the #1 cause of "no packages found"
#  3. Multiple modules in one window? Create a go.work (see the modules module)
#  4. go clean -cache if the build cache itself is suspect
#  5. Check the gopls log/output pane before guessing`
    },
    { t: "code", title: "VS Code settings.json — a sane baseline", code:
`{
  // Format and fix imports on every save. Non-negotiable.
  "[go]": {
    "editor.defaultFormatter": "golang.go",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": { "source.organizeImports": "explicit" },
    "editor.insertSpaces": false,        // Go uses TABS; gofmt will fight you
    "editor.suggest.snippetsPreventQuickSuggestions": false
  },

  "go.useLanguageServer": true,
  "go.formatTool": "custom",
  "go.alternateTools": { "customFormatter": "gofumpt" },  // stricter gofmt
  "go.lintTool": "golangci-lint",
  "go.lintOnSave": "package",
  "go.vetOnSave": "package",
  "go.testFlags": ["-race", "-count=1"],   // catch races + skip the test cache
  "go.testTimeout": "60s",
  "go.coverOnSingleTest": true,            // inline coverage highlighting
  "go.toolsManagement.autoUpdate": true,

  "gopls": {
    "ui.semanticTokens": true,
    "ui.diagnostic.staticcheck": true,     // staticcheck findings inline
    "ui.diagnostic.analyses": {
      "unusedparam": true, "unusedwrite": true,
      "nilness": true, "shadow": false     // shadow is noisy; judge for yourself
    },
    "ui.codelenses": { "gc_details": true, "test": true, "run_govulncheck": true },
    "ui.inlayhint.hints": {                // excellent while LEARNING Go
      "assignVariableTypes": true, "compositeLiteralFields": true,
      "constantValues": true, "functionTypeParameters": true,
      "parameterNames": true, "rangeVariableTypes": true
    },
    "formatting.gofumpt": true,
    "build.buildFlags": ["-tags=integration"]   // so tagged files aren't "unused"
  }
}`
    },
    { t: "note", kind: "warn", title: "Tabs, not spaces — and don't fight it", html: "<code>gofmt</code> indents with tabs and aligns with spaces, and that is the end of the discussion. If your editor is set to insert spaces in Go files, every save will produce a confusing diff. Set the tab width to whatever you like to <em>look</em> at (4 is common) — it only affects display." },

    { t: "h", text: "Extensions worth installing (VS Code)" },
    { t: "list", items: [
      "<strong>Go</strong> (<code>golang.go</code>) — the only mandatory one. Run <em>Go: Install/Update Tools</em> once and tick everything.",
      "<strong>Error Lens</strong> — puts diagnostics inline at the end of the line; catches typos before you save.",
      "<strong>GitLens</strong> — blame and history inline, which matters more than it sounds when learning an unfamiliar codebase.",
      "<strong>Test Explorer / the built-in Testing panel</strong> — run and debug individual table-test subtests from the gutter.",
      "<strong>Even Better TOML</strong> + <strong>YAML</strong> + <strong>Docker</strong> — for the config files around every real Go service.",
      "<strong>REST Client</strong> or <strong>Bruno</strong> — hit your own API from a <code>.http</code> file you commit next to the code.",
      "<strong>Code Spell Checker</strong> — exported identifiers and doc comments are public API; typos in them are forever."
    ]},
    { t: "code", title: "What `Go: Install/Update Tools` actually installs", code:
`gopls           language server: completion, refactors, diagnostics
dlv             Delve, the debugger
staticcheck     the best single linter for Go
gotests         generate table-driven test skeletons from a function
gomodifytags    add/remove struct tags (json, db, validate) across a struct
impl            generate stub methods to satisfy an interface
goplay          send a snippet to the Go Playground
go-outline      document symbols

# All of them are just Go programs; you can install any of them yourself:
go install honnef.co/go/tools/cmd/staticcheck@latest
go install github.com/go-delve/delve/cmd/dlv@latest
go install mvdan.cc/gofumpt@latest`
    },

    { t: "h", text: "Formatters: gofmt, goimports, gofumpt" },
    { t: "table", head: ["Tool", "What it does", "Use it?"],
      rows: [
        ["<code>gofmt</code>", "The canonical formatter. Ships with Go", "Baseline — always on"],
        ["<code>goimports</code>", "gofmt + adds/removes/groups imports automatically", "Yes — this is what your editor should run on save"],
        ["<code>gofumpt</code>", "goimports + a stricter superset (tightens blank lines, simplifies some forms). Still gofmt-compatible", "<strong>Recommended</strong> — one less thing to review"],
        ["<code>golines</code>", "Wraps long lines, which gofmt deliberately won't", "Optional; some teams like it"]
      ]
    },
    { t: "note", kind: "tip", title: "Why this is settled", html: "Every Go codebase on earth is formatted the same way, so diffs contain changes rather than style, and code review never discusses braces. Add <code>test -z \"$(gofmt -l .)\"</code> to CI and the subject never comes up again." },

    { t: "h", text: "Linters: what to run, and what to ignore" },
    { t: "code", title: "Three layers", code:
`go vet ./...            # ships with Go. Low noise, high value. Catches
                        # Printf arg mismatches, lost context.CancelFunc,
                        # copied locks, bad struct tags, unreachable code.
                        # Treat any vet finding as a bug.

staticcheck ./...       # ~150 deep checks: dead code, impossible conditions,
                        # misused stdlib, expensive conversions, bad
                        # concurrency. Excellent signal-to-noise. Install it
                        # even if you install nothing else.

golangci-lint run       # an AGGREGATOR that runs vet, staticcheck and ~100
                        # more in parallel with caching. One config, one
                        # command, one CI step.`
    },
    { t: "code", title: ".golangci.yml — a starting point you can defend", code:
`# NOTE: golangci-lint v2 (2025) reorganised this file's schema. Check
# "golangci-lint --version" and its migration guide; the SELECTION below is
# the part that matters and is unchanged in substance.
linters:
  enable:
    - errcheck        # unchecked errors — the single most valuable check
    - govet
    - staticcheck
    - ineffassign     # assignments that are never used
    - unused          # dead code
    - errorlint       # %v where %w belongs, == where errors.Is belongs
    - nilerr          # "return nil" after checking err != nil
    - bodyclose       # unclosed HTTP response bodies (a real leak)
    - rowserrcheck    # missing rows.Err() after a sql iteration
    - sqlclosecheck   # unclosed sql.Rows / Stmt
    - noctx           # HTTP/SQL calls without a context
    - contextcheck    # a non-inherited context passed down
    - copyloopvar     # the pre-1.22 "i := i" copies, now redundant
    - gocritic        # a broad, generally sensible grab-bag
    - revive          # golint's successor: naming and doc-comment style
    - misspell
    - gosec           # security: weak crypto, path traversal, SQL building

linters-settings:
  errcheck:
    check-type-assertions: true
  revive:
    rules:
      - name: exported          # exported identifiers need doc comments
  gocritic:
    enabled-tags: [diagnostic, performance, style]

issues:
  exclude-rules:
    - path: _test\\.go           # tests may be noisier than production code
      linters: [errcheck, gosec, dupl]

# DELIBERATELY NOT ENABLED — these generate argument, not bugs:
#   lll / funlen / gocyclo    arbitrary numeric limits; use review instead
#   gochecknoglobals          too blunt; package-level vars are often correct
#   wsl / nlreturn            whitespace opinions beyond gofmt
#   exhaustruct               fights Go's useful zero values
# Start strict on CORRECTNESS linters, lenient on STYLE linters.`
    },
    { t: "code", title: "Running and suppressing", code:
`golangci-lint run                     # changed packages, cached
golangci-lint run ./internal/...
golangci-lint run --fix               # auto-fix what can be auto-fixed
golangci-lint run --new-from-rev=main # only NEW issues — the way to adopt a
                                      # linter in an existing codebase

// Suppression requires a reason. A bare nolint is a code smell:
//nolint:errcheck // best-effort cleanup; failure here cannot be handled
defer f.Close()

// And set this so a blanket //nolint can never hide something new:
// linters-settings: nolintlint: { require-explanation: true, require-specific: true }`
    },

    { t: "h", text: "Debugging with Delve" },
    { t: "p", html: "You can get a long way with <code>fmt.Println</code> and tests — most Go engineers do — but a debugger pays for itself on unfamiliar code and on concurrency bugs." },
    { t: "code", title: "dlv from the terminal", code:
`dlv debug ./cmd/server -- --config=dev.yaml   # build with debug info and run
dlv test ./internal/user                      # debug a package's tests
dlv attach 12345                              # attach to a running process
dlv core ./app /cores/core.1234               # post-mortem from a core dump

# Inside the REPL:
(dlv) break main.go:42          (dlv) b internal/user.(*Service).Create
(dlv) condition 1 id == 7       # conditional breakpoint
(dlv) continue / next / step / stepout
(dlv) print user                (dlv) locals / args
(dlv) goroutines                # EVERY goroutine — the killer feature
(dlv) goroutine 18 bt           # switch to one and see its stack
(dlv) stack / frame 2
(dlv) set x = 10                # change a value and keep going

# Optimisation and inlining can confuse a debugger; turn them off:
go build -gcflags="all=-N -l" -o app ./cmd/server`
    },
    { t: "code", title: "VS Code launch.json — the four configurations you need", code:
`{
  "version": "0.2.0",
  "configurations": [
    { "name": "Debug server", "type": "go", "request": "launch",
      "mode": "debug", "program": "\${workspaceFolder}/cmd/server",
      "args": ["--addr=:8080"],
      "env": { "APP_ENV": "dev", "DATABASE_URL": "postgres://localhost/dev" } },

    { "name": "Debug current test", "type": "go", "request": "launch",
      "mode": "test", "program": "\${fileDirname}",
      "args": ["-test.run", "\${selectedText}", "-test.v"] },

    { "name": "Debug with race detector", "type": "go", "request": "launch",
      "mode": "debug", "program": "\${workspaceFolder}/cmd/server",
      "buildFlags": "-race" },

    { "name": "Attach to container", "type": "go", "request": "attach",
      "mode": "remote", "port": 2345, "host": "127.0.0.1",
      "substitutePath": [{ "from": "\${workspaceFolder}", "to": "/src" }] }
  ]
}

# For that last one, run this INSIDE the container (never in production):
#   dlv exec --headless --listen=:2345 --api-version=2 --accept-multiclient /app`
    },

    { t: "h", text: "The rest of the toolbox" },
    { t: "code", title: "Install these when you need them, not before", code:
`# Generation
gotests -all -w ./user.go                    # table-test skeletons
mockery / moq / gomock                       # interface fakes (often unnecessary
                                             #  in Go — a 20-line struct works)
stringer -type=Status                        # String() for enums
sqlc generate                                # type-safe Go from SQL queries
oapi-codegen -generate types,server api.yaml # Go from an OpenAPI spec
protoc / buf generate                        # Go from .proto

# Inner loop
air  /  wgo run ./cmd/server                 # live reload on file change
task  /  make                                # task runner; a Makefile is fine
entr -r go run ./...                         # the unix-y alternative

# Quality & security
govulncheck ./...                            # reachable CVEs
gosec ./...                                  # security linter
benchstat old.txt new.txt                    # statistically sound benchmarks
graphviz                                     # required by pprof's -http graphs

# Release & ops
goreleaser release --clean                   # cross-compiled, signed releases
lefthook / pre-commit                        # run fmt+vet+test before a commit
grpcurl / hey / vegeta / k6                  # poke and load-test your service`
    },
    { t: "code", title: "Two files every repo should have", code:
`# .editorconfig — so the whole team's editor agrees
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

# Makefile — the project's real interface
.PHONY: fmt lint test run
fmt:   ; gofumpt -l -w . && go mod tidy
lint:  ; go vet ./... && golangci-lint run && govulncheck ./...
test:  ; go test -race -cover ./...
run:   ; go run ./cmd/server
check: fmt lint test          # what CI runs, runnable locally in one word`
    },
    { t: "note", kind: "deep", title: "On AI assistants in your editor", html: "Copilot, Claude and friends are genuinely useful in Go — the language is regular, the stdlib is well documented, and boilerplate like table tests and struct conversions is exactly what they're good at. Two cautions worth internalising: they <em>confidently produce outdated idioms</em> (pre-1.22 <code>i := i</code>, <code>interface{}</code>, hand-rolled <code>Contains</code>, <code>gorilla/mux</code> for trivial routing), and they will invent plausible APIs that don't exist. Your ground truth is <code>gopls</code> red squiggles, <code>go build</code>, <code>go vet</code> and a failing test — not the suggestion's confidence." }
  ],
  summary: [
    "VS Code + the official Go extension is the default recommendation; GoLand for heavy refactoring; Neovim if you already use it. All of them run the same `gopls`.",
    "Configure once: format on save, organise imports on save, tabs not spaces, `-race` in test flags, staticcheck diagnostics and inlay hints in gopls.",
    "Open the editor at the directory containing `go.mod` — most \"gopls isn't working\" reports are a wrong workspace root.",
    "Formatting is settled: gofmt → goimports → **gofumpt**. Enforce with `gofmt -l` in CI and never discuss it again.",
    "Three linter layers: `go vet` (treat findings as bugs), `staticcheck` (best single tool), `golangci-lint` (aggregator for CI).",
    "Enable correctness linters (errcheck, errorlint, nilerr, bodyclose, rowserrcheck, noctx, gosec); skip arbitrary-limit style linters that only generate argument.",
    "Adopt linting on a legacy codebase with `--new-from-rev=main`, and require a reason on every `//nolint`.",
    "Delve: `dlv debug`, `dlv test`, `dlv attach`, and `goroutines` / `goroutine N bt` for concurrency bugs; build with `-gcflags=\"all=-N -l\"` when the debugger gets confused.",
    "A committed `.editorconfig` and a `make check` that mirrors CI save more time than any plugin.",
    "AI assistants are useful but suggest outdated idioms and invented APIs — gopls, the compiler and tests are the ground truth."
  ],
  quiz: [
    { q: "What is `gopls`?",
      options: ["A linter", "Go's official language server — completion, go-to-definition, rename, diagnostics", "The Go package manager", "A formatter"],
      answer: 1,
      explain: "VS Code, Neovim, Zed, Helix and Emacs all front-end the same gopls, which is why the core experience is consistent across editors." },
    { q: "Go files should be indented with…?",
      options: ["4 spaces", "2 spaces", "Tabs — gofmt will rewrite anything else", "Whatever the team prefers"],
      answer: 2,
      explain: "gofmt indents with tabs and aligns with spaces. Set your displayed tab width to taste; it doesn't change the bytes." },
    { q: "Which linter finding should you treat as a probable bug rather than a style opinion?",
      options: ["`lll` — line too long", "`funlen` — function too long", "`go vet` reporting a lost context.CancelFunc", "`wsl` — whitespace placement"],
      answer: 2,
      explain: "vet is deliberately low-noise and high-signal. A leaked cancel func is a real resource leak; line length is taste." },
    { q: "You're adding golangci-lint to a 200k-line legacy codebase and it reports 4,000 issues. Best first move?",
      options: ["Fix all 4,000 before merging", "Disable every failing linter", "`--new-from-rev=main`, so only newly introduced issues fail", "Add `//nolint` at the top of each file"],
      answer: 2,
      explain: "It ratchets quality on new code without a 4,000-issue megadiff. Burn down the backlog package by package afterwards." },
    { q: "In Delve, which command is the most useful for diagnosing a concurrency bug?",
      options: ["`print x`", "`next`", "`goroutines`, then `goroutine N bt`", "`restart`"],
      answer: 2,
      explain: "It lists every goroutine and lets you inspect any stack — the same insight as the pprof goroutine dump, but interactive." }
  ]
},

/* ───────────────────────────── 4 ───────────────────────────── */
{
  id: "variables-constants",
  level: "Beginner",
  icon: "📦",
  title: "Variables, Zero Values & Constants",
  minutes: 15,
  blurb: "Declaration forms, the := shorthand, why Go has no `null` for numbers, iota.",
  blocks: [
    { t: "h", text: "Four ways to declare" },
    { t: "code", title: "Pick the shortest one that's clear", code:
`var age int = 30      // explicit type and value
var age2 = 30         // type inferred -> int
var age3 int          // no value -> ZERO VALUE, which is 0
age4 := 30            // short form: declare + infer + assign (functions only)

// Grouped, which gofmt will align for you
var (
    name    string = "Ada"
    retries int    = 3
    debug   bool   // false
)

// Multiple assignment, and the idiomatic swap
a, b := 1, 2
a, b = b, a`
    },
    { t: "note", kind: "warn", title: "`:=` has two rules people trip on", html: "It only works <strong>inside a function</strong> (package-level declarations need <code>var</code>), and <strong>at least one variable on the left must be new</strong>. <code>x, err := f()</code> followed by <code>y, err := g()</code> is legal because <code>y</code> is new — <code>err</code> is simply reassigned." },

    { t: "diagram", id: "variable" },

    { t: "h", text: "Zero values: Go has no uninitialised memory" },
    { t: "p", html: "Every declared variable is usable immediately. There is no \"undefined\", and numbers are never <code>null</code>." },
    { t: "table", head: ["Type", "Zero value", "Usable as-is?"],
      rows: [
        ["<code>int</code>, <code>float64</code>, all numerics", "<code>0</code>", "yes"],
        ["<code>bool</code>", "<code>false</code>", "yes"],
        ["<code>string</code>", "<code>\"\"</code> (empty, not nil)", "yes"],
        ["<code>pointer</code>, <code>func</code>, <code>interface</code>, <code>chan</code>", "<code>nil</code>", "no — dereferencing/calling panics"],
        ["<code>slice</code>", "<code>nil</code>", "<strong>partly</strong>: len/cap/range/append all work"],
        ["<code>map</code>", "<code>nil</code>", "<strong>reads work, writes panic</strong>"],
        ["<code>struct</code>", "every field at its own zero", "yes"]
      ]
    },
    { t: "code", title: "The zero value as a design tool", code:
`type Counter struct {
    mu    sync.Mutex   // zero value is a ready-to-use unlocked mutex
    count int
}
var c Counter          // no constructor needed; this already works
c.mu.Lock()
c.count++
c.mu.Unlock()

var buf bytes.Buffer   // likewise: ready to write to
buf.WriteString("hi")

// The two nil traps
var s []int
s = append(s, 1)       // fine — append handles nil slices

var m map[string]int
fmt.Println(m["k"])    // 0 — reading a nil map is fine
// m["k"] = 1          // PANIC: assignment to entry in nil map
m = make(map[string]int) // maps must be made before writing`
    },
    { t: "note", kind: "tip", title: "Design rule", html: "\"Make the zero value useful.\" If your struct works correctly with no constructor call, your API got simpler for everyone." },

    { t: "h", text: "Constants" },
    { t: "p", html: "Constants are fixed at compile time and must be a boolean, string, or number. No slices, maps, structs, or function results." },
    { t: "code", title: "Typed, untyped, and iota", code:
`const Pi = 3.14159              // UNTYPED: adapts to context
const MaxUsers int = 1000       // typed: strictly an int

var f float32 = Pi              // works — untyped constant converts
var i int = MaxUsers            // works
// var j int64 = MaxUsers       // compile error: cannot use int as int64

// iota: an auto-incrementing counter, reset to 0 in each const block
type Weekday int
const (
    Sunday Weekday = iota   // 0
    Monday                  // 1
    Tuesday                 // 2
)

// Skip with _, and compute: 1 << (10*n) gives binary byte sizes
const (
    _  = iota
    KB = 1 << (10 * iota)   // 1024
    MB                      // 1048576
    GB                      // 1073741824
)

// Give your enum a String() method and it prints nicely everywhere
func (d Weekday) String() string {
    return [...]string{"Sunday", "Monday", "Tuesday"}[d]
}`
    },

    { t: "h", text: "Scope, shadowing, and the unused-variable rule" },
    { t: "code", title: "Two things the compiler is strict about", code:
`x := 10
if true {
    x := 20          // NEW x, shadows the outer one — vet -shadow catches this
    fmt.Println(x)   // 20
}
fmt.Println(x)       // 10

func f() {
    count := 5       // compile error: declared and not used
}

// _ is the blank identifier: "I know, and I don't want it"
_, err := doWork()
for _, v := range items { use(v) }`
    },
    { t: "note", kind: "warn", title: "Unused *imports* and unused *local variables* are errors, not warnings", html: "Unused package-level variables are allowed. The strictness is deliberate: dead code never accumulates. Use <code>_</code> when you genuinely need to discard something." }
  ],
  summary: [
    "`var` works anywhere; `:=` only inside functions and needs at least one new variable on the left.",
    "Nothing is uninitialised — every type has a zero value, and good APIs make it useful.",
    "nil slice: append/len/range all fine. nil map: reads fine, **writes panic** — `make` it first.",
    "Untyped constants adapt to context; typed constants do not.",
    "`iota` auto-increments within a const block; pair enums with a `String()` method.",
    "Unused imports and unused local variables fail the build; `_` discards deliberately."
  ],
  quiz: [
    { q: "`var m map[string]int` then `m[\"a\"] = 1`. Result?",
      options: ["Works, m becomes length 1", "Panics: assignment to entry in nil map", "Compile error", "Silently ignored"],
      answer: 1,
      explain: "A nil map is read-only. `m = make(map[string]int)` (or a literal) before writing." },
    { q: "What is the zero value of a `string`?",
      options: ["nil", "`\"\"`", "`\"0\"`", "undefined"],
      answer: 1,
      explain: "The empty string. Go strings are never nil." },
    { q: "Why does `y, err := g()` compile right after `x, err := f()`?",
      options: ["err is special-cased", "`:=` only needs one new variable on the left; err is reassigned", "It doesn't compile", "err is shadowed in a new scope"],
      answer: 1,
      explain: "At least one new name is enough. Same scope, so err is assigned, not redeclared." },
    { q: "In `const ( _ = iota; KB = 1 << (10*iota); MB )` — what is MB?",
      options: ["2048", "1048576", "1024", "20"],
      answer: 1,
      explain: "iota is 2 on the MB line, so 1 << 20 = 1048576. The expression repeats implicitly." },
    { q: "A function declares `n := 5` and never uses it. What happens?",
      options: ["Nothing", "A vet warning", "A compile error", "n is optimised away silently"],
      answer: 2,
      explain: "Unused local variables are a hard compile error in Go." }
  ]
},

/* ───────────────────────────── 5 ───────────────────────────── */
{
  id: "data-types",
  level: "Beginner",
  icon: "🔢",
  title: "Data Types, Strings, Runes & Conversion",
  minutes: 16,
  blurb: "Sized integers, float gotchas, and why strings are bytes but range gives you runes.",
  blocks: [
    { t: "h", text: "The basic types" },
    { t: "table", head: ["Group", "Types", "Notes"],
      rows: [
        ["Signed int", "int8 int16 int32 int64 <strong>int</strong>", "<code>int</code> is 64-bit on modern platforms. <strong>Default choice.</strong>"],
        ["Unsigned int", "uint8 uint16 uint32 uint64 uint uintptr", "Careful: <code>uint(0)-1</code> wraps to a huge number"],
        ["Float", "float32 <strong>float64</strong>", "<code>float64</code> is the default and what you should use"],
        ["Complex", "complex64 complex128", "Real, built in, rarely needed"],
        ["Text", "string, <strong>byte</strong> (=uint8), <strong>rune</strong> (=int32)", "byte = raw octet; rune = one Unicode code point"],
        ["Bool", "bool", "Only <code>true</code>/<code>false</code>. <strong>No</strong> truthiness — <code>if 1 {}</code> won't compile"]
      ]
    },
    { t: "note", kind: "tip", title: "Default picks", html: "Use <code>int</code> for counts and indexes, <code>float64</code> for real numbers, <code>string</code> for text, <code>byte</code> for binary data. Reach for sized types only for wire formats, bit manipulation, or measured memory pressure." },

    { t: "h", text: "No implicit conversion. Ever." },
    { t: "code", title: "Explicit conversion is mandatory", code:
`var i int = 42
var f float64 = float64(i)   // required; "var f float64 = i" is a compile error
var u uint8 = uint8(i)

// Converting a VARIABLE truncates or wraps silently — you asked for it
f := 3.99
fmt.Println(int(f))          // 3    (truncates toward zero, never rounds)
n := 300
fmt.Println(uint8(n))        // 44   (300 mod 256, silent wraparound)

// Converting a CONSTANT is checked exactly, and the compiler REFUSES:
//   int(3.99)    -> error: constant 3.99 truncated to integer
//   uint8(300)   -> error: constant 300 overflows uint8
// Constants are arbitrary-precision and verified at compile time; variables
// are not. That asymmetry catches everyone once.

// Integer division truncates
fmt.Println(7 / 2)           // 3
fmt.Println(7.0 / 2.0)       // 3.5
fmt.Println(float64(7) / 2)  // 3.5

// Strings <-> numbers live in strconv, NOT in conversion syntax
n, err := strconv.Atoi("42")             // string -> int
s := strconv.Itoa(42)                    // int -> string
x, err := strconv.ParseFloat("3.14", 64)
b, err := strconv.ParseBool("true")
s2 := strconv.FormatInt(255, 16)         // "ff"

// string(65) is "A", not "65" — a classic bug. go vet flags it.`
    },
    { t: "note", kind: "warn", title: "Floats are not decimals", html: "<code>0.1 + 0.2 == 0.3</code> is <code>false</code> — IEEE-754 binary floats can't represent those exactly. Compare with a tolerance (<code>math.Abs(a-b) &lt; 1e-9</code>), and for <strong>money, use integer cents</strong> or a decimal library. Never store currency in a float." },

    { t: "h", text: "Strings are immutable byte slices" },
    { t: "p", html: "A Go string is a read-only sequence of bytes, conventionally UTF-8. Under the hood it's a two-word header: a pointer to the bytes and a length. Indexing gives you a <strong>byte</strong>; ranging gives you <strong>runes</strong>." },
    { t: "diagram", id: "string-runes" },
    { t: "code", title: "Bytes vs runes — the thing everyone gets wrong once", code:
`s := "Héllo, 世界"

fmt.Println(len(s))                    // 14  <- BYTES, not characters
fmt.Println(utf8.RuneCountInString(s)) // 9   <- actual characters
fmt.Println(s[1])                      // 195 <- one byte of the 2-byte 'é'

// range decodes UTF-8 for you: i is the BYTE offset, r is a rune
for i, r := range s {
    fmt.Printf("%d:%c ", i, r)         // 0:H 1:é 3:l 4:l 5:o ... (offsets jump)
}

// Need character-indexed access? Convert to []rune first.
r := []rune(s)
fmt.Println(string(r[7]))              // 世
fmt.Println(len(r))                    // 9

// Immutable: s[0] = 'h' does not compile. Rebuild instead.
b := []byte(s); b[0] = 'h'; s = string(b)   // each conversion COPIES

// Efficient concatenation in a loop: never use += on strings
var sb strings.Builder
for i := 0; i < 1000; i++ {
    sb.WriteString("x")                // O(n) total, one growing buffer
}
out := sb.String()`
    },
    { t: "note", kind: "deep", title: "Why `+=` in a loop is quadratic", html: "Strings are immutable, so <code>s += \"x\"</code> allocates a brand-new string and copies everything each iteration — O(n²) and n allocations. <code>strings.Builder</code> amortises growth like <code>append</code> does. For joining a known list, <code>strings.Join</code> is both fastest and clearest." },

    { t: "h", text: "The string toolbox you'll actually use" },
    { t: "code", title: "strings and fmt", code:
`strings.Contains("seafood", "foo")      // true
strings.HasPrefix("golang", "go")       // true
strings.Split("a,b,c", ",")             // ["a" "b" "c"]
strings.Join([]string{"a","b"}, "-")    // "a-b"
strings.ToUpper("go")                   // "GO"
strings.TrimSpace("  hi \\n")            // "hi"
strings.ReplaceAll("aaa", "a", "b")     // "bbb"
strings.Fields(" a  b   c ")            // ["a" "b" "c"] — splits on any whitespace
strings.EqualFold("Go", "GO")           // true — case-insensitive compare

// Formatting verbs worth memorising
fmt.Printf("%v",  x)   // default representation
fmt.Printf("%+v", x)   // struct WITH field names
fmt.Printf("%#v", x)   // Go syntax representation
fmt.Printf("%T",  x)   // the type itself
fmt.Printf("%q",  s)   // double-quoted, escaped
fmt.Printf("%d %s %t %f %.2f %x", 1, "a", true, 1.5, 1.567, 255)
msg := fmt.Sprintf("user %s has %d items", name, n)   // build, don't print`
    }
  ],
  summary: [
    "Default to `int`, `float64`, `string`; sized types are for wire formats and bit work.",
    "No implicit numeric conversion — and explicit conversions truncate/overflow silently.",
    "`string(65)` is `\"A\"`; use `strconv` for real number↔string conversion.",
    "Floats are inexact: compare with a tolerance, and represent money as integers.",
    "`len(s)` counts bytes; `range s` yields runes with byte offsets; `[]rune(s)` for character indexing.",
    "Strings are immutable — use `strings.Builder` or `strings.Join` instead of `+=` in a loop."
  ],
  quiz: [
    { q: "`s := \"héllo\"` — what does `len(s)` return?",
      options: ["5", "6", "4", "Depends on locale"],
      answer: 1,
      explain: "`é` is two bytes in UTF-8, so 6 bytes total. `utf8.RuneCountInString` gives 5." },
    { q: "`var i int = 5` — which line compiles?",
      options: ["`var f float64 = i`", "`var f float64 = float64(i)`", "`var f float64 = (float64)i`", "`var f float64 = i.(float64)`"],
      answer: 1,
      explain: "Conversion is `T(v)`. Go never converts numeric types implicitly, and type assertions only apply to interfaces." },
    { q: "`fmt.Println(string(72))` prints what?",
      options: ["\"72\"", "\"H\"", "72", "compile error"],
      answer: 1,
      explain: "Converting an integer to string interprets it as a Unicode code point; 72 is 'H'. Use `strconv.Itoa` for \"72\" — `go vet` warns about this." },
    { q: "Fastest way to build a string from 10,000 pieces in a loop?",
      options: ["`s += piece`", "`strings.Builder` + WriteString", "`fmt.Sprintf` each time", "Append to a []string then index it"],
      answer: 1,
      explain: "`+=` is O(n²) because strings are immutable. Builder grows one buffer amortised." },
    { q: "Why is `0.1 + 0.2 == 0.3` false?",
      options: ["A Go bug", "Precedence", "IEEE-754 binary floats can't represent these decimals exactly", "It's actually true"],
      answer: 2,
      explain: "True of every IEEE-754 language. Compare within epsilon; use integer cents for money." }
  ]
},

/* ───────────────────────────── 6 ───────────────────────────── */
{
  id: "printing-fmt",
  level: "Beginner",
  icon: "🖨️",
  title: "Printing & Formatting with fmt",
  minutes: 18,
  blurb: "Print vs Printf vs Println, every verb worth knowing, Stringer, and the recursion trap that hangs your program.",
  blocks: [
    { t: "p", html: "You will type <code>fmt</code> more than any other package. It is also where a surprising amount of Go's design shows up: interfaces (<code>Stringer</code>, <code>io.Writer</code>), reflection, and the fact that <code>go vet</code> understands format strings. Learn it properly once." },

    { t: "h", text: "The four families" },
    { t: "code", title: "Print / Printf / Println × nothing / S / F / Err", code:
`// 1. To STANDARD OUTPUT
fmt.Print("a", "b", 1, 2)       // ab1 2   ← see the spacing rule below
fmt.Println("a", "b", 1, 2)     // a b 1 2\\n
fmt.Printf("%s has %d\\n", s, n) // you control everything

// 2. To a STRING (the "S" family) — build, don't print
msg := fmt.Sprintf("user %s has %d items", name, n)
s2  := fmt.Sprint("a", "b")      // "ab"
s3  := fmt.Sprintln("a", "b")    // "a b\\n"

// 3. To ANY io.Writer (the "F" family) — the most useful one
fmt.Fprintf(w, "status: %d\\n", code)   // http.ResponseWriter, os.Stderr, a file,
fmt.Fprintln(os.Stderr, "warning")     // a bytes.Buffer, a gzip stream, a socket…
fmt.Fprint(&buf, "x")
// This is why your functions should take an io.Writer instead of calling
// Println directly: it makes output testable with a bytes.Buffer.

// 4. To an ERROR
err := fmt.Errorf("loading %s: %w", path, cause)   // %w keeps the cause

// 5. Append into a []byte without allocating a string (Go 1.19+)
b = fmt.Appendf(b, "%d,", n)`
    },
    { t: "note", kind: "warn", title: "The spacing rule people get wrong", html: "<code>Println</code> <strong>always</strong> puts a space between operands and adds a newline. <code>Print</code> and <code>Sprint</code> add a space <strong>only when neither neighbour is a string</strong> — which is why <code>fmt.Print(\"a\", \"b\", 1, 2)</code> gives <code>ab1 2</code>. If you care about the exact output, use <code>Printf</code>." },

    { t: "h", text: "The verbs" },
    { t: "table", head: ["Verb", "Meaning", "Example output"],
      rows: [
        ["<code>%v</code>", "Default format — works for every type", "<code>{Ada 30}</code>"],
        ["<code>%+v</code>", "Structs <strong>with field names</strong> — your debugging default", "<code>{Name:Ada Age:30}</code>"],
        ["<code>%#v</code>", "Go syntax: paste it back into code", "<code>main.User{Name:\"Ada\", Age:30}</code>"],
        ["<code>%T</code>", "The type itself", "<code>main.User</code>, <code>[]int</code>, <code>*os.File</code>"],
        ["<code>%d %b %o %x %X</code>", "Integer in base 10 / 2 / 8 / 16", "<code>255 11111111 377 ff FF</code>"],
        ["<code>%f %.2f %e %g</code>", "Float: full, 2 decimals, scientific, compact", "<code>3.141593 3.14 3.1416e+00 3.141593</code>"],
        ["<code>%s</code>", "String, or anything with <code>String()</code> / <code>Error()</code>", "<code>hello</code>"],
        ["<code>%q</code>", "Quoted and escaped (strings) or rune-quoted (ints)", "<code>\"hi\\n\"</code>, <code>'A'</code>"],
        ["<code>%c %U</code>", "The character for a code point / U+ notation", "<code>A</code>, <code>U+0041</code>"],
        ["<code>%t</code>", "Boolean", "<code>true</code>"],
        ["<code>%p</code>", "Pointer address — for identity checks, not for logs", "<code>0xc000012345</code>"],
        ["<code>%w</code>", "Wrap an error (<code>fmt.Errorf</code> only)", "chain preserved for <code>errors.Is</code>"],
        ["<code>%%</code>", "A literal percent sign", "<code>%</code>"]
      ]
    },
    { t: "code", title: "Width, precision, flags — and the quick mental model", code:
`fmt.Printf("|%6d|",   42)      // |    42|   width 6, right-aligned
fmt.Printf("|%-6d|",  42)      // |42    |   left-aligned
fmt.Printf("|%06d|",  42)      // |000042|   zero-padded
fmt.Printf("|%+d|",   42)      // |+42|     always show the sign
fmt.Printf("|%8.3f|", 3.14159) // |   3.142| width 8, 3 decimals
fmt.Printf("|%-12s|", "go")    // |go          | handy for aligned tables
fmt.Printf("|%*d|", 6, 42)     // |    42|   width taken from an argument
fmt.Printf("%#x %#o", 255, 8)  // 0xff 010   alternate form

// Byte slices and hashing
fmt.Printf("%s",   []byte("hi"))   // hi
fmt.Printf("%x",   []byte("hi"))   // 6869
fmt.Printf("% x",  []byte("hi"))   // 68 69   (space flag separates bytes)
fmt.Printf("%x",   sha[:])         // the usual way to show a digest

// Pointers to structs, slices, maps, nil
fmt.Printf("%v", &User{"Ada", 30}) // &{Ada 30}
fmt.Printf("%v", []int{1,2})       // [1 2]
fmt.Printf("%v", map[string]int{"b":2,"a":1})  // map[a:1 b:2]  ← KEYS ARE SORTED
fmt.Printf("%v", error(nil))       // <nil>`
    },
    { t: "note", kind: "tip", title: "Map printing is deterministic", html: "Since Go 1.12 <code>fmt</code> sorts map keys before printing, so <code>%v</code> on a map produces stable output you can safely use in golden-file tests. Iterating the map yourself is still randomised — only <em>printing</em> is sorted." },

    { t: "h", text: "Make your own types print well: Stringer" },
    { t: "code", title: "One method, and the whole ecosystem cooperates", code:
`type Temp float64

func (t Temp) String() string { return strconv.FormatFloat(float64(t), 'f', 1, 64) + "°C" }

fmt.Println(Temp(21.5))            // 21.5°C
fmt.Printf("%v %s", Temp(3), x)    // both route through String()
log.Printf("temp=%v", Temp(3))     // so does log, slog, and anything using fmt

// That interface is tiny and lives in fmt:
//   type Stringer interface { String() string }
// error is the same idea:  interface { Error() string }  — and Error() wins
// over String() when both exist.

// Enum + Stringer is THE idiom. Generate it instead of hand-writing:
//go:generate stringer -type=Status
type Status int
const (
    Pending Status = iota
    Active
    Closed
)
// stringer writes a String() method — now %v prints "Active", not "1".

// Full control over formatting (rare): implement fmt.Formatter.
// Control over %#v: implement fmt.GoStringer.`
    },
    { t: "note", kind: "warn", title: "The recursion trap — this one hangs your program", html: "Inside a <code>String()</code> method, printing the receiver with <code>%v</code> or <code>%s</code> calls <code>String()</code> again, forever, until the stack overflows." },
    { t: "code", title: "Why, and the two fixes", code:
`type MyString string

// BROKEN: infinite recursion. %s on m calls String() calls %s on m calls…
func (m MyString) String() string {
    return fmt.Sprintf("MyString=%s", m)
}

// FIX 1 — convert to the underlying type first, so fmt sees a plain string:
func (m MyString) String() string {
    return fmt.Sprintf("MyString=%s", string(m))
}

// FIX 2 — for structs, print the fields, never the whole receiver:
func (u User) String() string {
    return fmt.Sprintf("User(%s, %d)", u.Name, u.Age)   // not %v on u
}

// Related: fmt RECOVERS panics inside String()/Error() so one bad method can't
// crash your program. You get this instead, which is a strong hint to look at
// a nil pointer receiver:
//   %!v(PANIC=String method: runtime error: invalid memory address)`
    },

    { t: "h", text: "When the format string is wrong" },
    { t: "code", title: "fmt tells you in-band — and go vet catches it first", code:
`fmt.Printf("%d", "hello")    // %!d(string=hello)      wrong verb for the type
fmt.Printf("%d %d", 1)       // 1 %!d(MISSING)         too few arguments
fmt.Printf("%d", 1, 2)       // 1%!(EXTRA int=2)       too many
fmt.Printf("%z", 1)          // %!z(int=1)             no such verb

// Nothing panics and nothing returns an error — you get a marked-up string,
// which is easy to miss in a log file. So let the tooling find these:
go vet ./...        // reports every Printf-style mismatch in the package

// vet also checks YOUR wrappers, as long as you follow the naming convention
// (a function whose name ends in "f" and whose last args are format, ...any):
func (l *Logger) Debugf(format string, args ...any) {
    l.out(fmt.Sprintf(format, args...))
}
// Common bug vet catches: a format string with no arguments. Use Print, or
// escape the percent: fmt.Println("100% done") / fmt.Printf("100%% done\\n")`
    },

    { t: "h", text: "Reading input, briefly" },
    { t: "code", title: "Scan is fine for exercises; bufio for real input", code:
`var name string; var age int
fmt.Scan(&name, &age)                      // whitespace-separated from stdin
fmt.Scanln(&name)                           // stops at the newline
fmt.Sscanf("21-07", "%d-%d", &d, &m)        // parse from a string
fmt.Fscan(r, &x)                            // from any io.Reader

// For anything real — lines, large input, CSV, user prompts — use
// bufio.Scanner (and strconv to convert), which handles long lines and errors
// properly. fmt.Scan silently stops on the first thing it cannot parse.`
    },

    { t: "h", text: "Performance and production habits" },
    { t: "list", items: [
      "<strong><code>fmt</code> uses reflection</strong>, so it is far slower than direct conversion. On a hot path, <code>strconv.Itoa(n)</code> beats <code>fmt.Sprintf(\"%d\", n)</code> by roughly an order of magnitude, and <code>s1 + s2</code> beats <code>Sprintf(\"%s%s\", …)</code>.",
      "Passing values to <code>...any</code> <strong>boxes them, forcing a heap allocation</strong> — which is why <code>fmt.Println</code> shows up in escape-analysis output and in allocation profiles.",
      "<strong>Never log with <code>fmt.Println</code> in a service.</strong> Use <code>slog</code>: structured, levelled, JSON, and filterable. <code>fmt</code> is for CLI output, errors and debugging.",
      "<strong>Never put a secret or PII in a format string.</strong> Give sensitive types a <code>String()</code> that returns <code>\"[REDACTED]\"</code> and a stray <code>%v</code> can no longer leak it.",
      "Prefer <code>Fprintf(w, …)</code> with an injected <code>io.Writer</code> over writing to stdout directly — it makes the output unit-testable.",
      "For building strings in a loop, <code>strings.Builder</code>; for one value, <code>strconv</code>; for a message with several, <code>Sprintf</code> is perfectly idiomatic."
    ]}
  ],
  summary: [
    "Four families: `Print*` (stdout), `Sprint*` (string), `Fprint*` (any `io.Writer`), `Errorf` (error) — plus `Appendf` into a `[]byte`.",
    "`Println` always separates with spaces; `Print`/`Sprint` only do so between two non-strings.",
    "Learn `%v`, `%+v` (field names), `%#v` (Go syntax), `%T`, `%q`, `%d/%x`, `%.2f`, `%s`, `%t`, `%w` — and `%%` for a literal percent.",
    "Width/precision/flags: `%6d`, `%-6s`, `%06d`, `%+d`, `%8.3f`, `% x`, `%#x`, `%*d`.",
    "Maps print with **sorted keys** (1.12+), so `%v` output is stable in golden tests even though iteration isn't.",
    "Implement `String() string` (fmt.Stringer) and every fmt/log/slog call formats your type nicely; generate it for enums with `stringer`.",
    "Never format the receiver with `%v`/`%s` inside its own `String()` — that recurses forever. Convert to the underlying type or print fields.",
    "Bad format strings produce `%!d(string=…)` / `%!d(MISSING)` rather than an error — `go vet` is what actually catches them, including in your own `…f` wrappers.",
    "`fmt` uses reflection and boxes arguments: prefer `strconv` on hot paths, `slog` for service logs, and redact secrets via `String()`."
  ],
  quiz: [
    { q: "Which verb prints a struct **with its field names**?",
      options: ["`%v`", "`%+v`", "`%#v`", "`%s`"],
      answer: 1,
      explain: "`%v` gives `{Ada 30}`, `%+v` gives `{Name:Ada Age:30}`, and `%#v` gives full Go syntax. `%+v` is the debugging default." },
    { q: "`func (m MyString) String() string { return fmt.Sprintf(\"v=%s\", m) }` — what happens?",
      options: ["Prints `v=` plus the value", "Infinite recursion until the stack overflows", "A compile error", "fmt ignores String() for named string types"],
      answer: 1,
      explain: "`%s` on `m` calls `String()` again. Convert first: `fmt.Sprintf(\"v=%s\", string(m))`." },
    { q: "`fmt.Printf(\"%d\", \"hello\")` does what?",
      options: ["Panics", "Returns an error you must check", "Writes `%!d(string=hello)`", "Prints nothing"],
      answer: 2,
      explain: "fmt reports format problems in-band, which is easy to miss in logs — `go vet` catches them at build time instead." },
    { q: "You want a function's output to be unit-testable. Which signature?",
      options: ["`func report()` using fmt.Println", "`func report(w io.Writer)` using fmt.Fprintf", "`func report() string` only", "`func report(path string)` writing a file"],
      answer: 1,
      explain: "Taking an `io.Writer` lets tests pass a `bytes.Buffer` and assert on the bytes — the reason the `F` family exists." },
    { q: "Printing a `map[string]int` with `%v` gives which key order?",
      options: ["Randomised, like range", "Insertion order", "Sorted — fmt sorts map keys", "Undefined"],
      answer: 2,
      explain: "Since Go 1.12 fmt sorts keys, so printed output is deterministic. Ranging the map yourself is still randomised." }
  ]
},

/* ───────────────────────────── 7 ───────────────────────────── */
{
  id: "control-flow",
  level: "Beginner",
  icon: "🔀",
  title: "Control Flow: if, for, switch, defer",
  minutes: 14,
  blurb: "One loop keyword, a switch with superpowers, and `defer` for guaranteed cleanup.",
  blocks: [
    { t: "h", text: "if — with an initialiser" },
    { t: "code", title: "Scope errors to the branch that handles them", code:
`if x > 10 {
    // no parentheses around the condition; braces are mandatory
} else if x > 5 {
} else {
}

// The idiomatic form: declare and test in one statement.
// v and err exist ONLY inside the if/else.
if v, err := strconv.Atoi(input); err == nil {
    fmt.Println("parsed", v)
} else {
    fmt.Println("bad input:", err)
}

// Guard clauses keep the happy path at indent level 1
func process(data []byte) error {
    if len(data) == 0 {
        return errors.New("empty input")
    }
    if !valid(data) {
        return errors.New("invalid input")
    }
    return doWork(data)   // no nesting
}`
    },

    { t: "diagram", id: "control-flow" },
    { t: "h", text: "for — the only loop in the language" },
    { t: "code", title: "Five shapes, one keyword", code:
`for i := 0; i < 5; i++ { }            // classic three-clause

for n > 0 { n-- }                      // while

for { break }                          // infinite (for-ever)

for i, v := range slice { }            // index, value
for k, v := range myMap { }            // key, value — ORDER IS RANDOMISED
for i, r := range str { }              // byte index, rune
for v := range ch { }                  // receive until the channel closes
for i := range 10 { }                  // Go 1.22+: 0..9

// Labels, for when you need to escape more than one level
outer:
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        if j == 2 { continue outer }
        if i == 2 { break outer }
    }
}`
    },
    { t: "note", kind: "warn", title: "Map iteration order is intentionally random", html: "Go randomises it on every run so you can never accidentally depend on it. To iterate deterministically, collect the keys, <code>sort.Strings(keys)</code>, then loop over the sorted slice." },
    { t: "note", kind: "deep", title: "Go 1.22 fixed the loop-variable trap", html: "Before 1.22, <code>i</code> was <strong>one variable reused</strong> every iteration, so <code>go func(){ print(i) }()</code> inside a loop usually printed the final value. Since Go 1.22 (with <code>go 1.22+</code> in go.mod) each iteration gets a <strong>fresh</strong> variable, and the bug is gone. You'll still see the old workaround <code>i := i</code> in older code." },

    { t: "h", text: "switch — far more useful than C's" },
    { t: "code", title: "No fallthrough, no break, and conditions allowed", code:
`switch day {
case "Sat", "Sun":            // multiple values per case
    fmt.Println("weekend")
case "Mon":
    fmt.Println("ugh")
default:
    fmt.Println("weekday")
}
// Cases do NOT fall through. You never write "break".
// Opt in explicitly with the fallthrough keyword if you really want it.

// Tagless switch = a clean if/else-if chain
switch {
case score >= 90: grade = "A"
case score >= 80: grade = "B"
default:          grade = "F"
}

// With an initialiser
switch hour := time.Now().Hour(); {
case hour < 12: fmt.Println("morning")
default:        fmt.Println("later")
}

// Type switch — switch on the dynamic type inside an interface
func describe(i any) string {
    switch v := i.(type) {
    case nil:      return "nil"
    case int:      return fmt.Sprintf("int %d", v*2)     // v is an int here
    case string:   return "string of length " + strconv.Itoa(len(v))
    case []int:    return fmt.Sprintf("%d ints", len(v))
    case error:    return "error: " + v.Error()
    default:       return fmt.Sprintf("unknown %T", v)
    }
}`
    },

    { t: "h", text: "defer — cleanup you can't forget" },
    { t: "diagram", id: "defer-stack" },
    { t: "code", title: "Runs when the function returns, whatever happens", code:
`func readFile(path string) ([]byte, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    defer f.Close()        // guaranteed — on return AND on panic
    return io.ReadAll(f)
}

// LIFO: deferred calls run in reverse order
func order() {
    defer fmt.Println("1")
    defer fmt.Println("2")
    defer fmt.Println("3")
}  // prints 3, 2, 1

// Arguments are evaluated AT DEFER TIME, the body runs later
func trap() {
    i := 0
    defer fmt.Println("captured:", i)       // prints 0
    defer func() { fmt.Println("closure:", i) }()  // prints 1 — reads i later
    i++
}

// A deferred closure can modify named return values
func withTiming() (elapsed time.Duration) {
    start := time.Now()
    defer func() { elapsed = time.Since(start) }()
    heavyWork()
    return    // elapsed is set by the deferred func
}`
    },
    { t: "note", kind: "warn", title: "Never `defer` inside a loop body", html: "Deferred calls fire when the <strong>function</strong> returns, not at the end of each iteration — so looping over 10,000 files with <code>defer f.Close()</code> holds 10,000 handles open. Either close explicitly at the end of the iteration, or move the body into its own function (or a closure you call immediately)." }
  ],
  summary: [
    "`if` takes an initialiser: `if v, err := f(); err != nil` scopes both to the branch.",
    "Prefer guard clauses and early returns over nesting.",
    "`for` is the only loop keyword — it covers while, infinite, range, and `range N` (1.22+).",
    "Map iteration order is randomised by design; sort the keys for determinism.",
    "`switch` has no implicit fallthrough, allows multiple values and bare conditions, and `switch v := x.(type)` branches on dynamic type.",
    "`defer` is LIFO, evaluates arguments immediately, runs even on panic — and never belongs in a loop body."
  ],
  quiz: [
    { q: "How many loop keywords does Go have?",
      options: ["Three: for, while, do", "Two: for, while", "One: for", "Four, including foreach"],
      answer: 2,
      explain: "`for` alone covers every loop shape." },
    { q: "Ranging over the same map twice in one run gives keys in which order?",
      options: ["Insertion order", "Sorted order", "Randomised — deliberately", "Hash order, stable within a run"],
      answer: 2,
      explain: "The runtime randomises the start point per iteration so code can't depend on order." },
    { q: "`defer fmt.Println(i)` with i==0, then `i++`, then return. What prints?",
      options: ["1", "0", "Nothing", "Compile error"],
      answer: 1,
      explain: "Deferred arguments are evaluated at the defer statement. Wrap in a closure to read the later value." },
    { q: "Three defers in a row — what's the execution order?",
      options: ["First to last", "Last to first (LIFO)", "Unspecified", "Concurrent"],
      answer: 1,
      explain: "They're pushed on a stack and popped on return." },
    { q: "Why is `defer f.Close()` inside a 10,000-iteration loop a bug?",
      options: ["defer isn't allowed in loops", "All 10,000 closes run only when the function returns, exhausting file descriptors", "It closes the wrong file", "It's slower but correct"],
      answer: 1,
      explain: "defer is function-scoped, not block-scoped. Extract the body into a function or close explicitly." }
  ]
}

]);
