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
    { t: "note", kind: "tip", title: "Latest stable release: Go 1.27.1", html: "The current stable release is <strong>Go 1.27.1</strong>, published on 28 August 2026 (language version 1.27, August 2026). Installers for every OS are on <a href=\"https://go.dev/dl/\" target=\"_blank\" rel=\"noopener\">go.dev/dl</a>. <code>go version</code> prints the release you actually have." },

    { t: "h", text: "Compilation" },
    { t: "p", html: "<strong>Compiled ahead of time, straight to machine code.</strong> There is no JVM, no bytecode interpreter, no JIT. <code>go build</code> produces a native executable for a specific OS and CPU architecture. You can copy that single file onto a matching machine and run it with nothing else installed." },
    { t: "note", kind: "warn", title: "But what about `go run`?", html: "<code>go run main.go</code> <em>looks</em> interpreted. It is not. Go compiles your program to a temporary binary, executes it, and deletes it. The feel is scripting; the mechanics are compilation." },

    { t: "diagram", id: "exec-models" },
    { t: "note", kind: "deep", title: "So where does the speed come from?", html: "A compiled language starts at full speed. There is no warm-up and no interpreter loop. A <em>JIT</em> language can eventually match or beat it on long-running hot loops, because it optimises using real run-time information, but it pays for that with startup latency and a heavy VM. Go takes a third route: compile everything up front, and optionally feed a <strong>production profile back into the compiler</strong> (PGO) to get some of the JIT's advantage without the JIT." },

    { t: "h", text: "Build pipeline" },
    { t: "p", html: "<code>go build</code> does not jump from <code>main.go</code> to a program in one step. It walks through five steps. The names show up in compiler output, so here is what each one actually does." },
    { t: "list", ordered: true, items: [
      "<strong>Scan and parse.</strong> The compiler reads your file as text and builds a tree: this node is a function, that node is a call, this one is <code>+</code>. That tree is the abstract syntax tree (AST). \"Abstract\" means the tree keeps the structure and throws away the spaces and comments.",
      "<strong>Type-check.</strong> Every value is given a type, such as <code>int</code> or <code>string</code>. Adding a string to an int stops the build here. Most mistakes you will make are caught at this step, before the program runs.",
      "<strong>SSA and optimise.</strong> SSA (Static Single Assignment) is a rewrite where each value is set once. That shape is easier to tidy. Tidying means three things: inline a tiny function by pasting it into its caller, delete code that can never run, and escape analysis, which decides whether a value can stay in the function's stack memory or must move to the heap because something still needs it after the function returns.",
      "<strong>Generate machine code.</strong> The tidied program becomes instructions for one kind of CPU. <code>amd64</code> is Intel and AMD. <code>arm64</code> is Apple Silicon and many servers.",
      "<strong>Link.</strong> Your instructions, the packages you imported, and the Go runtime are joined into one file. That file is the program. The runtime is the scheduler (which goroutine runs next), the garbage collector (frees memory nothing can reach), and the memory allocator (hands that memory out). They travel inside the file, so the other machine does not need Go installed."
    ]},
    { t: "diagram", id: "pipeline" },
    { t: "p", html: "<strong>Cross compiling</strong> means building the program for a different computer than the one you are typing on. <code>GOOS</code> is the operating system (<code>linux</code>, <code>darwin</code> for macOS, <code>windows</code>). <code>GOARCH</code> is the CPU (<code>amd64</code> or <code>arm64</code>). Set those two names and run <code>go build</code>. You do not install a second compiler." },
    { t: "code", title: "Build for this machine, or for another one", code:
`# Native build
go build -o app .

# A Linux ARM64 binary, built from a Mac, no Docker, no toolchain install
GOOS=linux GOARCH=arm64 go build -o app-linux-arm64 .

# Smaller binary: strip symbol table and DWARF debug info
go build -ldflags="-s -w" -o app .

# See what the compiler decided about memory
go build -gcflags="-m" .`
    },

    { t: "h", text: "Runtime" },
    { t: "p", html: "It has a runtime, it just <strong>ships inside your binary</strong> instead of being installed on the machine. The Go runtime is a few megabytes of Go and assembly that provides the things the language promises: the <strong>goroutine scheduler</strong>, the <strong>garbage collector</strong>, the <strong>memory allocator</strong>, channel and map implementations, panic/recover, and reflection metadata. That's why a trivial Go program is ~1.5–2 MB rather than 20 KB. You pay a fixed floor and get managed memory plus cheap concurrency." },

    { t: "h", text: "Garbage collection" },
    { t: "p", html: "Go throws away memory your program has stopped using. You never call <code>free</code>." },
    { t: "p", html: "A value stays while a name in your program still holds it. In the picture, <code>order</code> still holds dinner. When that name is given a new value, the old one (lunch) is left with no name. Go throws lunch away. That cleanup is garbage collection. Your program keeps running. The pause is usually under a millisecond." },
    { t: "p", html: "Stack and heap, the two places a value can sit, are explained in <a href=\"#/m/variables-constants\">Variables, Zero Values &amp; Constants</a>, under Assignment. The <a href=\"#/m/pointers-memory\">pointers lesson</a> goes further, under Stack and heap." },
    { t: "diagram", id: "gc-reach" },

    { t: "h", text: "Language features" },
    { t: "p", html: "Each row is one thing the language gives you, and what that means when you are writing a program." },
    { t: "table", head: ["Feature", "What it means in practice"],
      rows: [
        ["<strong>Compiles to one static binary</strong>", "<code>scp</code> the file and run it. No runtime to install, no virtualenv, no <code>node_modules</code>, no JVM version to match"],
        ["<strong>Builds in seconds</strong>", "Dependency analysis is designed for speed; a large service compiles faster than most test suites run"],
        ["<strong>Goroutines + channels</strong>", "Concurrency is a language feature, not a library. ~2 KB per goroutine means hundreds of thousands are routine"],
        ["<strong>Garbage collected</strong>", "No <code>malloc</code>/<code>free</code>, no ownership rules to learn, sub-millisecond pauses"],
        ["<strong>Static typing with inference</strong>", "Compile-time safety, but <code>x := 42</code> instead of ceremony"],
        ["<strong>Implicit interfaces</strong>", "Types satisfy an interface by having the methods, decoupling without dependency-injection frameworks"],
        ["<strong>One official formatter</strong>", "<code>gofmt</code> ends every style argument; every Go codebase looks the same"],
        ["<strong>Tooling in the box</strong>", "Test runner, benchmarks, fuzzer, race detector, profiler, coverage, doc generator, vulnerability scanner, all <code>go &lt;verb&gt;</code>"],
        ["<strong>Cross compilation built in</strong>", "<code>GOOS=linux GOARCH=arm64 go build</code>, from any machine, no extra toolchain"],
        ["<strong>A strong standard library</strong>", "Production HTTP server and client, TLS, JSON, SQL interface, templating, crypto, with no dependencies"],
        ["<strong>Explicit errors</strong>", "Failure is a value in the signature, not an invisible exception path"],
        ["<strong>A real compatibility promise</strong>", "Code written for Go 1.0 still compiles today. Upgrades are boring, which is a feature"],
        ["<strong>Generics</strong> (1.18+)", "Type-safe containers and algorithms without code generation or <code>any</code>"],
        ["<strong>A small language</strong>", "25 keywords. Most engineers are productive in a week and can read anyone's code"]
      ]
    },

    { t: "h", text: "Who uses Go" },
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
    { t: "note", kind: "tip", title: "The pattern in that list", html: "Go dominates <strong>network services, infrastructure and CLI tools</strong>, software that handles many concurrent connections, must deploy as a single artifact, and is maintained by rotating teams. That is not a coincidence; it is exactly what the language was designed for. It is <em>not</em> the leader in data science, machine learning, mobile apps or game engines, and pretending otherwise wastes your time." },

    { t: "h", text: "Trade-offs" },
    { t: "p", html: "Every advantage below has a cost in the next column. Read both before you pick Go for a job." },
    { t: "table", head: ["Advantage", "The cost that comes with it"],
      rows: [
        ["<strong>Deployment is trivial</strong>: one static binary, tiny containers, instant start (great for serverless and autoscaling)", "Binaries start at ~2 MB because the runtime ships inside; no shared-library savings"],
        ["<strong>Cheap concurrency</strong>: goroutines, channels, <code>select</code> and a work-stealing scheduler", "No compiler-enforced protection against data races, you need <code>-race</code> and discipline"],
        ["<strong>Fast builds</strong> keep the edit-test loop tight and CI cheap", "Enforced by strictness: unused imports and variables are hard errors"],
        ["<strong>Readable by design</strong>: a small language, one formatter, few clever constructs. New hires are productive in days", "Verbose. <code>if err != nil</code> appears a lot, and there is no <code>map</code>/<code>filter</code> sugar"],
        ["<strong>Memory-safe without a borrow checker</strong>, and far faster than interpreted languages", "GC pauses and GC CPU exist, unsuitable for hard real-time; Rust and C still win on raw control"],
        ["<strong>Excellent tooling and stdlib</strong>, so small dependency trees are normal", "Fewer batteries for niches: no mature ORM culture, limited GUI and ML ecosystems"],
        ["<strong>Stability</strong>: the Go 1 compatibility promise means upgrades rarely break you", "The language evolves slowly and deliberately, features you may want (sum types, better error ergonomics) take years or never arrive"],
        ["<strong>Great hiring/onboarding story</strong>: easy to read a codebase you did not write", "Idiomatic Go rejects abstraction you may be used to, no inheritance, no exceptions, no DI containers"]
      ]
    },
    { t: "note", kind: "warn", title: "When Go is the wrong choice", html: "Hard-real-time or microcontroller work (GC and runtime in the way), numeric/GPU computing and machine learning (Python's ecosystem is unmatched), rich native desktop or mobile UIs, and problems that genuinely want a strong type system with sum types and exhaustive matching (Rust, Kotlin, TypeScript, OCaml). Choosing the right tool is a senior skill; a language you like is not automatically the right answer." },

    { t: "h", text: "Other languages" },
    { t: "p", html: "The same kind of program looks different in each language. This table is the short version of those differences." },
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

    { t: "h", text: "Design" },
    { t: "p", html: "The choices that feel strict (no inheritance, unused imports are errors, errors are values) are there so a large program stays readable and builds quickly. Each line below is one of those choices." },
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
    "Go compiles ahead of time to native machine code, no VM, no interpreter, no JIT.",
    "`go run` still compiles; it just hides the temporary binary.",
    "The runtime (scheduler, GC, allocator) is linked into your binary, which is why it's statically self-contained and a couple of MB at minimum.",
    "Memory is managed by a concurrent, low-latency, non-generational mark-and-sweep GC.",
    "Cross compiling is `GOOS=… GOARCH=… go build`, no extra toolchain.",
    "Headline features: one static binary, second-long builds, goroutines, GC, implicit interfaces, gofmt, and a test/bench/fuzz/race/pprof toolchain in the box.",
    "Go runs the cloud: Docker, Kubernetes, Terraform, Prometheus, Grafana, etcd, Vault, CockroachDB, the GitHub CLI, plus Cloudflare, Uber, Monzo, Dropbox, Twitch.",
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
      options: ["Debug symbols, always included", "The source is embedded in the binary", "The Go runtime (scheduler, GC, allocator) is statically linked in", "It bundles the whole standard library"],
      answer: 2,
      explain: "Only reachable stdlib code is linked, but the runtime always comes along. `-ldflags=\"-s -w\"` trims symbols, not the runtime." },
    { q: "Which statement about Go's garbage collector is true?",
      options: ["It's generational and compacting", "It's concurrent mark-and-sweep, non-generational, tuned for short pauses", "It uses reference counting like CPython", "There is no GC; Go uses ownership rules"],
      answer: 1,
      explain: "The second statement is the true one. Go frees unused memory for you. While your program keeps running, the collector finds the objects you can still reach and throws the rest away. That is mark-and-sweep, and it is tuned so those pauses stay very short. It does not sort objects into young and old (so it is not generational) and it does not slide them together to close gaps (so it is not compacting). It also does not count references the way CPython does, and Go does have a collector: there are no ownership rules." },
    { q: "You're on macOS/arm64 and need a Linux/amd64 binary. Minimum effort?",
      options: ["Install a cross-compiler toolchain", "Build inside a Linux VM or container", "`GOOS=linux GOARCH=amd64 go build`", "Impossible without cgo"],
      answer: 2,
      explain: "Pure-Go cross compilation is built in. (Only cgo-dependent builds need a C cross-toolchain.)" },
    { q: "Which workload is Go the WEAKEST fit for?",
      options: ["A high-concurrency HTTP API", "A CLI tool shipped to many platforms", "Training a neural network", "A Kubernetes controller"],
      answer: 2,
      explain: "Numeric/ML work belongs to Python's ecosystem (and the GPU libraries beneath it). Go owns network services, infrastructure and CLIs, which is why Docker, Kubernetes, Terraform and Prometheus are all written in it." }
  ]
},

/* ───────────────────────────── 2 ───────────────────────────── */
{
  id: "setup-first-program",
  level: "Beginner",
  icon: "🚀",
  title: "Setup, Modules & Your First Program",
  minutes: 18,
  blurb: "Install Go, start a module, and write your first program.",
  blocks: [
    { t: "h", text: "Install" },
    { t: "p", html: "Install the latest stable release, then run <code>go version</code>. That command prints the release you actually have." },
    { t: "note", kind: "tip", title: "Latest stable release: Go 1.27.1", html: "The current stable release is <strong>Go 1.27.1</strong>, published on 28 August 2026 (language version 1.27, August 2026). Installers for every OS are on <a href=\"https://go.dev/dl/\" target=\"_blank\" rel=\"noopener\">go.dev/dl</a>. <code>go version</code> prints the release you actually have." },
    { t: "code", title: "Install and verify", code:
`# macOS
brew install go

# Linux, official tarball for Go 1.27.1
curl -LO https://go.dev/dl/go1.27.1.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.27.1.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# Windows (PowerShell). Then close the terminal and open a new one.
winget install -e --id GoLang.Go
# If winget is not available, download the .msi from https://go.dev/dl and run it.

go version      # go version go1.27.1 windows/amd64
go env GOPATH   # where downloaded modules and installed tools live`
    },
    { t: "note", kind: "tip", title: "GOPATH is no longer your workspace", html: "Pre-2018 Go forced all code under <code>$GOPATH/src</code>. With <strong>modules</strong>, your project lives anywhere you like. <code>GOPATH</code> now only holds the module cache (<code>pkg/mod</code>) and binaries from <code>go install</code> (<code>bin</code>). Add <code>$(go env GOPATH)/bin</code> to your <code>PATH</code>." },

    { t: "h", text: "Modules" },
    { t: "p", html: "A single file that only uses the standard library can run with <code>go run scratch.go</code>. A project needs <code>go mod init</code>." },
    { t: "diagram", id: "module-or-file" },
    { t: "code", title: "The two modes, precisely", code:
`# No go.mod. Works only when you name a standard-library file.
mkdir /tmp/try && cd /tmp/try
cat > scratch.go <<'EOF'
package main
import "fmt"
func main() { fmt.Println("works with no module") }
EOF
go run scratch.go          # fine
go run .                   # fails: go.mod file not found
go test ./...              # fails: needs a module

# One init, and the project commands work.
go mod init example/hello-world
go run .
go build ./...
go test ./...`
    },
    { t: "note", kind: "tip", title: "Rule of thumb", html: "<strong>Throwaway snippet you'll delete in ten minutes → single file, <code>go run file.go</code></strong> (or <a href=\"https://go.dev/play/\" target=\"_blank\" rel=\"noopener\">the Playground</a>, which needs nothing installed at all). <strong>Everything else → <code>go mod init</code></strong>: the moment you want a dependency, a second package, a test, <code>./...</code> commands, or to commit the code, a module is required. It costs one command and two lines of file, so when you're unsure, make the module." },
    { t: "note", kind: "deep", title: "A different question: when to create a NEW module inside an existing project?", html: "Much rarer, and people over-do it. A new module means a <strong>separately versioned, separately released unit</strong>, so create one only when another repository must depend on part of your code at its own version, or when a sub-tree needs genuinely different dependencies. Everything else should be a <em>package</em> (just a new directory) inside the existing module: one <code>go.mod</code>, one version, atomic refactors across the whole tree. A dozen modules in one repo means a dozen dependency bumps every time you change a shared type." },

    { t: "h", text: "Create a module" },
    { t: "p", html: "A module is one project: the folder Go versions and downloads as a unit. <code>go mod init</code> writes <code>go.mod</code>. The word after it is the module path, the name other code uses if it imports you. For a program that only runs on your machine, that name can be anything. You do not need a GitHub account, and the folder does not have to live on GitHub." },
    { t: "code", title: "A new project", code:
`mkdir hello && cd hello
go mod init example/hello-world

# go.mod now reads:
#   module example/hello-world
#   go 1.27`
    },
    { t: "p", html: "<code>example/hello-world</code> is only a name. It does not download anything, and it does not need a GitHub account. A <strong>module</strong> is the versioned unit you publish. A <strong>package</strong> is one directory of <code>.go</code> files inside it. The module path is the prefix of every import from that module." },

    { t: "h", text: "Your first program" },
    { t: "list", ordered: true, items: [
      "In that same folder, write this file as <code>main.go</code>.",
      "Then run <code>go run .</code>.",
      "<code>package main</code> means this folder builds a program.",
      "<code>import \"fmt\"</code> brings in the printing package.",
      "<code>func main</code> is where the program starts, and <code>Println</code> writes the text plus a newline.",
    ]},
    { t: "code", title: "main.go", code:
`package main        // this package compiles to an executable, not a library

import "fmt"        // standard library: formatted I/O

func main() {       // the entry point of package main
    fmt.Println("Hello, Gopher!")
}`,
      out: `Hello, Gopher!`
    },
    { t: "list", items: [
      "<code>package main</code> is special: it tells the linker to build a program. Any other name builds a library.",
      "<code>func main()</code> takes no arguments and returns nothing. When it returns, the program exits, even if goroutines are still running.",
      "<code>Println</code> is capitalised, and that is <strong>the</strong> visibility rule in Go: an identifier exported from a package starts with an uppercase letter. Lowercase means package-private. There is no <code>public</code>/<code>private</code> keyword.",
      "The opening brace must be on the same line. <code>gofmt</code> enforces it; it is not a style debate."
    ]},

    { t: "h", text: "greet" },
    { t: "list", ordered: true, items: [
      "A module can hold more than <code>main</code>.",
      "Add a folder named <code>greet</code> and write this file in it.",
      "<code>package greet</code> names that package.",
      "<code>Hello</code> starts with a capital letter, so another package can call it.",
    ]},
    { t: "code", title: "greet/greet.go", code:
`package greet

func Hello(name string) string {
    return "Hello, " + name
}`
    },
    { t: "p", html: "In <code>main.go</code>, the import path is the module path plus the folder: <code>example/hello-world/greet</code>. Call it as <code>greet.Hello</code>. A function named <code>hello</code> does not compile here. A lowercase name stays inside <code>greet</code>." },
    { t: "code", title: "main.go imports your package", code:
`package main

import (
    "fmt"

    "example/hello-world/greet"
)

func main() {
    fmt.Println(greet.Hello("Gopher"))
}`,
      out: `Hello, Gopher!`
    },

    { t: "h", text: "Commands" },
    { t: "list", items: [
      "<code>go run</code> compiles and runs, then deletes the binary.",
      "<code>go build</code> leaves the binary in the folder.",
      "<code>go install</code> puts it on your PATH.",
      "The other commands format the code, warn about suspicious code, run tests, or show documentation without a browser.",
    ]},
    { t: "code", title: "The commands you'll use hourly", code:
`go run .            # compile + execute the package in this directory
go build -o hello . # produce the ./hello binary
go install .        # build and drop the binary in $GOPATH/bin
go fmt ./...        # canonically format everything
go vet ./...        # report suspicious constructs the compiler allows
go test ./...       # run every test in the module
go doc fmt.Println  # read docs offline`
    },

    { t: "h", text: "Dependencies" },
    { t: "list", items: [
      "<code>go get</code> downloads a package and writes its version into <code>go.mod</code>.",
      "<code>go mod tidy</code> adds what your code imports and removes what it does not.",
      "<code>go.sum</code> stores a hash of each download so a silently changed package fails the build.",
    ]},
    { t: "code", title: "Dependencies are code, not configuration", code:
`go get github.com/google/uuid        # adds a require line to go.mod, writes go.sum
go mod tidy                          # add what's missing, drop what's unused
go list -m all                       # the full dependency graph
go mod why github.com/google/uuid    # why is this here?`
    },
    { t: "p", html: "<code>go.sum</code> records a cryptographic hash of every module version you use. If an upstream author force-pushes a different tag, your build fails loudly instead of silently changing. Commit both <code>go.mod</code> and <code>go.sum</code>." },

    { t: "h", text: "Project layout" },
    { t: "list", items: [
      "<code>cmd</code> holds programs: each subfolder has its own <code>main</code>.",
      "<code>internal</code> is code only this module may import, and the compiler enforces that.",
      "<code>pkg</code> is optional code you expect other modules to import.",
    ]},
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
    { t: "note", kind: "deep", title: "`internal/` is a real compiler rule", html: "Any package under a directory named <code>internal</code> can only be imported by code rooted at <code>internal</code>'s parent. It's the one access-control mechanism Go gives you above the identifier level, use it to keep your public surface small." },
    { t: "note", kind: "tip", title: "Next: set up your editor properly", html: "You can write Go in anything, but twenty minutes of editor setup, format-on-save, <code>gopls</code> diagnostics, a linter and a working debugger, pays back immediately. That's the next module." }
  ],
  summary: [
    "A single stdlib-only file runs with `go run file.go` and no go.mod; anything more, a dependency, a second package, tests, `./...`, or git, needs `go mod init`.",
    "Inside a repo, prefer a new *package* (a directory) over a new *module*; a module is a separately versioned release unit.",
    "`go mod init <module-path>` starts a project; modules freed you from GOPATH.",
    "Module = versioned unit you publish; package = one directory of .go files.",
    "`package main` + `func main()` produces an executable; any other package name is a library.",
    "Import your own package with the module path plus the folder, such as `example/hello-world/greet`. Only an uppercase name is visible outside that package.",
    "Capitalisation *is* the visibility system: `Exported` vs `unexported`.",
    "Core loop: `go run .`, `go build`, `go test ./...`, `go fmt ./...`, `go vet ./...`, `go mod tidy`.",
    "`go.sum` pins dependency hashes, commit it. `internal/` is enforced by the compiler."
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
      explain: "The `internal` rule limits imports to code rooted at internal's parent directory, here, the whole module." },
    { q: "Why commit `go.sum`?",
      options: ["The build fails without it", "It lists dependency licences", "It pins content hashes so a changed upstream version breaks the build loudly", "It caches the modules themselves"],
      answer: 2,
      explain: "It's a checksum ledger, supply-chain integrity, not storage." },
    { q: "You want to try a 15-line stdlib-only snippet. Minimum setup?",
      options: ["go mod init, then go run .", "Save it as x.go and run `go run x.go`", "Create a GOPATH workspace", "You must always have a go.mod"],
      answer: 1,
      explain: "Naming the file explicitly works with no module. But `go run .`, `go test ./...` and any `go get` all require a go.mod, so for real work, initialise the module." }
  ]
},

/* ───────────────────────────── 3 ───────────────────────────── */
{
  id: "dev-environment",
  level: "Beginner",
  icon: "🛠️",
  title: "Your Dev Environment: IDE, gopls, Linters & Debugger",
  minutes: 16,
  blurb: "The editor, gopls, formatting, and the debugger. What to set up now, and what to leave until you need it.",
  blocks: [
    { t: "p", html: "You need three things to write Go: an editor, <code>gofmt</code> (the formatter), and <code>gopls</code> (the program that powers completion and jump-to-definition). A debugger is useful once the program is doing something you cannot see from a print statement. You do not need a long list of plugins to start." },

    { t: "h", text: "Editors" },
    { t: "p", html: "Use <strong>VS Code and the official Go extension</strong> unless you already have an editor you like. GoLand is JetBrains' paid Go IDE. Neovim, Zed, Helix, and Emacs also work. They all talk to the same <code>gopls</code>, so switching editors later does not mean relearning Go." },
    { t: "table", head: ["Editor", "Choose it when"],
      rows: [
        ["<strong>VS Code</strong> + the Go extension", "You want the usual setup. Free, and the Go team maintains the extension."],
        ["<strong>GoLand</strong>", "You already live in JetBrains, or you rename and move code all day. Paid; free for students."],
        ["<strong>Neovim, Zed, Helix, Emacs</strong>", "You already use that editor. Do not learn a new editor and Go in the same week."]
      ]
    },

    { t: "h", text: "gopls" },
    { t: "p", html: "<code>gopls</code> (say \"go please\") is a program that runs beside the editor. When you ask to complete a name, jump to a function, rename a variable, or see an error, the editor asks gopls and draws the answer. You almost never type <code>gopls</code> yourself. The Go extension installs it." },
    { t: "p", html: "If completion or jump-to-definition stops working, check these in order. The first two fix it almost every time." },
    { t: "list", ordered: true, items: [
      "Restart it: in VS Code, Command Palette → <strong>Go: Restart Language Server</strong>.",
      "Open the folder that contains <code>go.mod</code>. Opening a subfolder is the usual reason for \"no packages found\".",
      "A repo with several modules needs a <code>go.work</code> file. That comes up in the modules lesson.",
      "Read the <strong>Go</strong> log in VS Code's Output panel before changing settings."
    ]},
    { t: "code", title: "You only install gopls by hand if the editor did not", code:
`go install golang.org/x/tools/gopls@latest
gopls version`
    },

    { t: "h", text: "Editor settings" },
    { t: "p", html: "Put this in VS Code settings. It does three jobs: format the file when you save, fix the import lines when you save, and use tabs, which is what Go's formatter expects." },
    { t: "code", title: "settings.json, enough to start", code:
`{
  "[go]": {
    "editor.defaultFormatter": "golang.go",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": { "source.organizeImports": "explicit" },
    "editor.insertSpaces": false
  },
  "go.useLanguageServer": true,
  "go.lintOnSave": "package",
  "go.vetOnSave": "package"
}`
    },
    { t: "note", kind: "warn", title: "Go indents with tabs", html: "<code>gofmt</code> rewrites indentation to tabs. If the editor inserts spaces, every save turns into a noisy diff. You can still <em>display</em> a tab as 4 spaces. That only changes how wide it looks, not the file." },
    { t: "p", html: "Leave the rest of the gopls settings alone until something annoys you. Two that are worth knowing later: inlay hints (the editor prints the type next to a variable, which helps while you are learning) and <code>go.testFlags</code> set to <code>[\"-race\"]</code> (the race detector, covered with concurrency)." },

    { t: "h", text: "Go extension" },
    { t: "list", ordered: true, items: [
      "Install the <strong>Go</strong> extension (<code>golang.go</code>).",
      "Then run <strong>Go: Install/Update Tools</strong> once and accept the defaults.",
      "That installs <code>gopls</code> and the debugger.",
    ]},
    { t: "p", html: "Other extensions (Error Lens, GitLens, YAML, Docker) are convenient. None of them teach you Go." },

    { t: "h", text: "gofmt" },
    { t: "p", html: "<code>gofmt</code> rewrites a Go file into the one official layout. It ships with Go. Turn it on at save, and code review stops being about braces and indentation." },
    { t: "p", html: "<code>goimports</code> is gofmt plus import cleanup: it adds the imports you used and deletes the ones you did not. \"Organise imports on save\" in the settings above is goimports. <code>gofumpt</code> is a stricter goimports some teams adopt later. You do not need it to start." },

    { t: "h", text: "Linters" },
    { t: "p", html: "A linter reads the code and points at things that are probably wrong, without running the program. Start with the one that is already installed." },
    { t: "table", head: ["Tool", "What it is", "When to use it"],
      rows: [
        ["<code>go vet</code>", "Comes with Go. Catches real bugs: a <code>Printf</code> with the wrong arguments, a cancelled function you dropped, a lock that was copied.", "Always. If vet complains, fix it."],
        ["<code>staticcheck</code>", "A separate install. Deeper checks, still quiet. Dead code, impossible conditions, misused standard library.", "When <code>go vet</code> feels too quiet."],
        ["<code>golangci-lint</code>", "One program that runs vet, staticcheck, and others together. This is what CI usually calls.", "When the team wants a single lint command."]
      ]
    },
    { t: "code", title: "The commands", code:
`go vet ./...
staticcheck ./...          # go install honnef.co/go/tools/cmd/staticcheck@latest
golangci-lint run

# On an old repo that already has thousands of findings, fail only on new ones:
golangci-lint run --new-from-rev=main`
    },
    { t: "p", html: "If you add a config, enable checks that catch bugs: ignored errors (<code>errcheck</code>), a wrong error comparison (<code>errorlint</code>), an HTTP body you never closed (<code>bodyclose</code>). Leave off the ones that only count lines or ban a coding style. Those start arguments, not bug fixes." },
    { t: "p", html: "To silence one finding, name the check and say why. A bare <code>//nolint</code> hides the next real bug too." },
    { t: "code", title: "Silence one line, with a reason", code:
`//nolint:errcheck // closing a file on the way out; nothing useful to do with the error
defer f.Close()`
    },

    { t: "h", text: "Debugger" },
    { t: "list", ordered: true, items: [
      "<strong>Delve</strong> (<code>dlv</code>) stops the program on a line so you can look at variables.",
      "In VS Code, click the gutter next to a line number, then press F5.",
      "That is the whole everyday workflow.",
      "The editor writes a debug config the first time you do it.",
    ]},
    { t: "table", head: ["Action", "What it does"],
      rows: [
        ["Continue", "Run until the next breakpoint"],
        ["Step over", "Run this line, and do not go inside the function it calls"],
        ["Step into", "Go inside that function"],
        ["<code>goroutines</code>", "List every running goroutine. Use this when the bug is \"something else is stuck\""]
      ]
    },
    { t: "p", html: "The terminal is the same tool, for when you are not in the editor. <code>goroutine 18 bt</code> means \"show me the stack of goroutine 18\"." },
    { t: "code", title: "dlv, when you are not in the editor", code:
`dlv debug .                 # build this package and stop at the start
dlv test .                   # same, but for the tests

(dlv) break main.go:42
(dlv) continue
(dlv) print user
(dlv) goroutines
(dlv) goroutine 18 bt`
    },
    { t: "note", kind: "tip", title: "If the debugger skips lines", html: "The compiler inlines small functions and reorders code, so the highlighted line can look wrong. Rebuild with <code>go build -gcflags=\"all=-N -l\"</code> to turn that off while you are debugging. Do not ship that build." },

    { t: "h", text: "A small setup" },
    { t: "p", html: "A <code>.editorconfig</code> tells every editor on the team to use tabs for Go. A <code>Makefile</code> gives the project one command that matches what CI runs. You will meet generators, live reload, and load-test tools when a later lesson needs them. Installing them now does not help." },
    { t: "code", title: ".editorconfig and a short Makefile", code:
`# .editorconfig
root = true
[*.go]
indent_style = tab

# Makefile
.PHONY: test vet
test:
	go test ./...
vet:
	go vet ./...`
    },
    { t: "note", kind: "tip", title: "Editor AI is a suggestion, not a compiler", html: "An assistant is useful for a test table or a boring conversion. It also invents functions that do not exist, and it still writes old Go (<code>interface{}</code> instead of <code>any</code>, a router you do not need). If <code>gopls</code> draws a red underline, or <code>go test</code> fails, the assistant is wrong." }
  ],
  summary: [
    "Install VS Code and the official Go extension, unless you already have an editor. Every editor uses the same `gopls`.",
    "gopls answers completion, jump-to-definition, and rename. If it breaks, restart it, and open the folder that contains `go.mod`.",
    "Turn on format-on-save and organise-imports. Go files use tabs. `gofmt` rewrites anything else.",
    "`go vet ./...` is the linter to run first. Treat its findings as bugs. Add staticcheck, then golangci-lint, when you want more.",
    "On an old codebase, `golangci-lint run --new-from-rev=main` fails only on new findings. A `//nolint` needs a reason.",
    "Debug by clicking the gutter and pressing F5. `goroutines`, then `goroutine N bt`, shows why a concurrent program is stuck.",
    "An editor assistant does not replace `gopls`, `go build`, or a failing test."
  ],
  quiz: [
    { q: "What is `gopls`?",
      options: ["A linter", "Go's official language server, completion, go-to-definition, rename, diagnostics", "The Go package manager", "A formatter"],
      answer: 1,
      explain: "The editor is the window. gopls is the program that answers completion, jump-to-definition, rename, and errors. VS Code, Neovim, Zed, Helix, and Emacs all ask the same gopls." },
    { q: "Go files should be indented with…?",
      options: ["4 spaces", "2 spaces", "Tabs, gofmt will rewrite anything else", "Whatever the team prefers"],
      answer: 2,
      explain: "gofmt rewrites indentation to tabs. You can display a tab as 4 spaces. That changes the look, not the file." },
    { q: "Which linter finding should you treat as a probable bug rather than a style opinion?",
      options: ["`lll`, line too long", "`funlen`, function too long", "`go vet` reporting a lost context.CancelFunc", "`wsl`, whitespace placement"],
      answer: 2,
      explain: "go vet reports real bugs. A lost CancelFunc leaks work that should have been cancelled. Line length and whitespace are style." },
    { q: "You're adding golangci-lint to a 200k-line legacy codebase and it reports 4,000 issues. Best first move?",
      options: ["Fix all 4,000 before merging", "Disable every failing linter", "`--new-from-rev=main`, so only newly introduced issues fail", "Add `//nolint` at the top of each file"],
      answer: 2,
      explain: "`--new-from-rev=main` makes CI fail on new findings only. Fix the old 4,000 later, one package at a time. A file-wide nolint hides new bugs." },
    { q: "In Delve, which command is the most useful for diagnosing a concurrency bug?",
      options: ["`print x`", "`next`", "`goroutines`, then `goroutine N bt`", "`restart`"],
      answer: 2,
      explain: "`goroutines` lists every goroutine. `goroutine 18 bt` shows the stack of number 18, which is how you see who is stuck and where." }
  ]
},

/* ───────────────────────────── 4 ───────────────────────────── */
{
  id: "variables-constants",
  level: "Beginner",
  icon: "📦",
  title: "Variables, Zero Values & Constants",
  minutes: 22,
  blurb: "How to name a value, where that name lives in memory, what you get if you do not set it, and what iota is counting.",
  blocks: [
    { t: "h", text: "Variables" },
    { t: "p", html: "A variable is a name for a slot. The slot has a type, and it holds one value of that type. <code>age</code> is the name. <code>int</code> is the type. Go will not let you store a string in it. <code>30</code> is the value in the slot." },
    { t: "p", html: "There are four spellings. The first three can sit at the top of a file. <code>:=</code> only works inside a function." },
    { t: "list", items: [
      "<code>var age int = 30</code> writes the name, the type, and the value.",
      "<code>var age2 = 30</code> works the type out from 30. It is an <code>int</code>.",
      "<code>var age3 int</code> sets no value, so Go writes <code>0</code>.",
      "<code>age4 := 30</code> is the short form, inside a function only."
    ]},
    { t: "code", title: "Four spellings, inside main", code:
`package main

import "fmt"

func main() {
    var age int = 30 // name, type, and value
    var age2 = 30    // type worked out from 30: int
    var age3 int     // no value given: 0
    age4 := 30       // short form, inside a function only

    fmt.Println(age, age2, age3, age4)
}`,
      out: `30 30 0 30`
    },
    { t: "p", html: "The next program swaps two numbers, with no third variable. <code>a, b := 1, 2</code> creates both names. The next line uses <code>=</code>, because those names already exist. Go reads the whole right side first (<code>b</code> is 2 and <code>a</code> is 1), then writes. <code>a</code> becomes 2 and <code>b</code> becomes 1." },
    { t: "code", title: "Swap two variables", code:
`package main

import "fmt"

func main() {
    a, b := 1, 2
    a, b = b, a
    fmt.Println(a, b)
}`,
      out: `2 1`
    },
    { t: "note", kind: "warn", title: "Two rules for :=", html: "It is illegal outside a function. At the top of a file, write <code>var</code>. Inside a function, <code>:=</code> is allowed only when <strong>at least one name on the left is new</strong>. So <code>x, err := f()</code> followed by <code>y, err := g()</code> is fine: <code>y</code> is new, and <code>err</code> is just given a new value." },

    { t: "diagram", id: "variable" },

    { t: "h", text: "Assignment" },
    { t: "p", html: "The <code>age</code> slot in the picture above is on the <strong>stack</strong>. The stack is scratch memory for the function that is running right now. On a 64-bit machine that <code>int</code> is 8 bytes." },
    { t: "p", html: "<code>age := 30</code> writes 30 into the <code>age</code> slot. <code>age = 40</code> writes 40 into that <strong>same</strong> slot. 30 is overwritten. It is not kept somewhere else. Nothing new is allocated, so the garbage collector has nothing to free. When the function returns, the slot is reused by the next call. That reuse is not garbage collection." },
    { t: "code", title: "Reassigning overwrites the same slot", code:
`age := 30
fmt.Println(age)
age = 40
fmt.Println(age)`,
      out: `30
40`
    },
    { t: "diagram", id: "assign-stack" },
    { t: "p", html: "The <strong>heap</strong> is the other place a value can live. The compiler puts a value there when it has to outlive the function. You do not call <code>malloc</code>." },
    { t: "p", html: "<code>name</code> is a small slot on the stack. It records where the letters are, and how many there are. The letters themselves sit on the heap. <code>name = \"Grace\"</code> points that same slot at Grace. Ada is still in memory until nothing points at it. The collector frees it later, while the program keeps running. You never call <code>free</code>." },
    { t: "code", title: "The name stays; the old text can be collected", code:
`name := "Ada"
fmt.Println(name)
name = "Grace"
fmt.Println(name)`,
      out: `Ada
Grace`
    },
    { t: "diagram", id: "assign-heap" },

    { t: "h", text: "Zero values" },
    { t: "p", html: "Every type has a starting value, called the zero value. There is no \"undefined\", and a number is never null. You can read the variable on the next line." },
    { t: "table", head: ["Type", "Zero value", "Usable as-is?"],
      rows: [
        ["<code>int</code>, <code>float64</code>, all numerics", "<code>0</code>", "yes"],
        ["<code>bool</code>", "<code>false</code>", "yes"],
        ["<code>string</code>", "<code>\"\"</code> (empty, not nil)", "yes"],
        ["<code>pointer</code>, <code>func</code>, <code>interface</code>, <code>chan</code>", "<code>nil</code>", "no, dereferencing/calling panics"],
        ["<code>slice</code>", "<code>nil</code>", "<strong>partly</strong>: len/cap/range/append all work"],
        ["<code>map</code>", "<code>nil</code>", "<strong>reads work, writes panic</strong>"],
        ["<code>struct</code>", "each field at its own zero value", "yes, explained next"]
      ]
    },
    { t: "h", text: "Nil map" },
    { t: "p", html: "This is the row people miss. A nil map is not an empty map you can write into." },
    { t: "list", items: [
      "<code>var m map[string]int</code> does not call <code>make</code>. The map is nil.",
      "Reading <code>m[\"a\"]</code> gives <code>0</code>. That read does not panic.",
      "Writing <code>m[\"a\"] = 1</code> panics: assignment to entry in nil map.",
      "<code>m = make(map[string]int)</code> before the write, and the write works.",
      "A nil slice is different. <code>len</code>, <code>range</code>, and <code>append</code> all accept it."
    ]},
    { t: "code", title: "Read a nil map, then write to it", code:
`var m map[string]int
fmt.Println(m["a"])
m["a"] = 1`,
      out: `0
panic: assignment to entry in nil map`
    },

    { t: "h", text: "Structs" },
    { t: "p", html: "A struct is one value made of named fields. It is Go's version of a record. There is no class. You read a field with a dot: <code>p.X</code>." },
    { t: "code", title: "A struct you did not fill in", code:
`type Point struct {
    X int
    Y int
}

var p Point            // no constructor; X and Y are already 0
fmt.Println(p.X, p.Y)`,
      out: `0 0`
    },
    { t: "p", html: "Structs are covered properly later, with methods and embedding. You need this much here: the zero value of a struct is the zero value of each field. Some library types are designed so that zero value is already usable. <code>sync.Mutex</code> starts unlocked. <code>bytes.Buffer</code> starts empty and ready to write. You do not call a constructor." },
    { t: "code", title: "A usable zero value, and the nil map trap", code:
`type Counter struct {
    mu    sync.Mutex   // zero value: unlocked, ready to Lock
    count int          // zero value: 0
}

var c Counter
c.mu.Lock()
c.count++
c.mu.Unlock()
fmt.Println(c.count)

var buf bytes.Buffer
buf.WriteString("hi")
fmt.Println(buf.String())

var s []int
s = append(s, 1)          // a nil slice is fine for append
fmt.Println(s)

var m map[string]int
fmt.Println(m["k"])       // reading a missing key gives 0
m = make(map[string]int)  // required before any write
m["k"] = 1
fmt.Println(m["k"])`,
      out: `1
hi
[1]
0
1`
    },
    { t: "note", kind: "tip", title: "Make the zero value useful", html: "If <code>var c Counter</code> already works, callers do not have to remember a constructor. Writing <code>m[\"k\"] = 1</code> on the nil map above panics with \"assignment to entry in nil map\"." },

    { t: "h", text: "Constants" },
    { t: "p", html: "A constant is fixed when the program is compiled." },
    { t: "list", items: [
      "It has to be a boolean, a string, or a number. You cannot make a constant slice, map, or struct.",
      "<code>Pi</code> and <code>MaxUsers</code> start with a capital letter, so another package can use them.",
      "A lowercase constant stays inside this package. Same rule as <code>Println</code>. There is no <code>public</code> keyword.",
      "Leave the type off and <code>Pi</code> can be a <code>float32</code> or a <code>float64</code>.",
      "Write the type and it is locked. <code>MaxUsers</code> is an <code>int</code>, so it does not fit in an <code>int64</code> without a conversion."
    ]},
    { t: "code", title: "Flexible number, locked number", code:
`const Pi = 3.14159         // no type written
const MaxUsers int = 1000  // locked to int

var f float32 = Pi
var i int = MaxUsers
fmt.Println(f, i)
// var j int64 = MaxUsers  // does not compile: MaxUsers is an int`,
      out: `3.14159 1000`
    },

    { t: "h", text: "iota" },
    { t: "p", html: "<code>iota</code> is not a function. It counts lines inside one <code>const</code> block." },
    { t: "p", html: "The first line is 0. Each next line is 1 higher. The next <code>const</code> block starts again at 0. A line with no formula copies the formula from the line above, with the new <code>iota</code>. <code>Sunday</code> is line 0, so 0. <code>Monday</code> copies that formula and is 1. <code>Tuesday</code> is 2." },
    { t: "code", title: "iota as 0, 1, 2", code:
`type Weekday int
const (
    Sunday Weekday = iota  // iota is 0
    Monday                 // iota is 1; same formula
    Tuesday                // iota is 2; same formula
)

fmt.Println(int(Sunday), int(Monday), int(Tuesday))`,
      out: `0 1 2`
    },

    { t: "h", text: "Powers of two" },
    { t: "p", html: "Read it one line at a time. <code>1 &lt;&lt; n</code> means \"shift the bit 1 left by n places\", which is 2 to the power n. <code>_</code> means \"compute this and throw it away\"." },
    { t: "list", ordered: true, items: [
      "Line 0: <code>_ = iota</code>. <code>iota</code> is 0. The value is discarded. If this line were <code>KB</code>, the formula would be <code>1 &lt;&lt; 0</code>, which is 1, not a kilobyte.",
      "Line 1: <code>KB = 1 &lt;&lt; (10 * iota)</code>. <code>iota</code> is 1. <code>10 * 1</code> is 10. <code>1 &lt;&lt; 10</code> is 1024.",
      "Line 2: <code>MB</code> has no formula of its own. Go repeats <code>1 &lt;&lt; (10 * iota)</code>, and <code>iota</code> is now 2. <code>1 &lt;&lt; 20</code> is 1048576.",
      "Line 3: <code>GB</code> repeats it again. <code>iota</code> is 3. <code>1 &lt;&lt; 30</code> is 1073741824.",
    ]},
    { t: "code", title: "The same block, with the values it produces", code:
`const (
    _  = iota
    KB = 1 << (10 * iota)  // iota 1 → 1 << 10
    MB                     // iota 2 → 1 << 20
    GB                     // iota 3 → 1 << 30
)

fmt.Println(KB)
fmt.Println(MB)
fmt.Println(GB)`,
      out: `1024
1048576
1073741824`
    },

    { t: "h", text: "Shadowing" },
    { t: "p", html: "<code>x := 20</code> inside the <code>if</code> creates a <strong>new</strong> <code>x</code>. The outer <code>x</code> is still 10. This is called shadowing. It compiles, and it is a common way to update the wrong variable." },
    { t: "code", title: "Inside the if, x is a different variable", code:
`x := 10
if true {
    x := 20
    fmt.Println("inside", x)
}
fmt.Println("outside", x)`,
      out: `inside 20
outside 10`
    },
    { t: "p", html: "A local variable you never read is a compile error, not a warning. <code>_</code> is the name you use when you mean to ignore a value, such as an error you have decided not to handle, or the index from <code>range</code>." },
    { t: "code", title: "An unused local name does not compile", code:
`func f() {
    count := 5
}`,
      out: `count declared and not used`
    },
    { t: "code", title: "_ means you are ignoring that value on purpose", code:
`n, err := strconv.Atoi("nope")
_ = n
fmt.Println(err)`,
      out: `strconv.Atoi: parsing "nope": invalid syntax`
    },

    { t: "h", text: "On your machine" },
    { t: "p", html: "Go and try this on your machine. Save it as <code>main.go</code>, then run <code>go run .</code>" },
    { t: "code", title: "The programs from this lesson", code:
`package main

import "fmt"

func main() {
    var age int = 30
    var age2 = 30
    var age3 int
    age4 := 30
    fmt.Println(age, age2, age3, age4)

    a, b := 1, 2
    a, b = b, a
    fmt.Println(a, b)

    age = 40
    fmt.Println(age)

    name := "Ada"
    name = "Grace"
    fmt.Println(name)

    var m map[string]int
    fmt.Println(m["a"])
    m = make(map[string]int)
    m["a"] = 1
    fmt.Println(m["a"])
}`,
      out: `30 30 0 30
2 1
40
Grace
0
1`
    },
    { t: "p", html: "To see the panic from the nil map section, write <code>m[\"a\"] = 1</code> before <code>make</code>." }
  ],
  summary: [
    "`var` works anywhere. `:=` only works inside a function, and at least one name on the left must be new.",
    "A local number lives on the stack. Reassigning it overwrites the same bytes. The stack slot disappears when the function returns.",
    "The garbage collector frees a heap value only when nothing can still reach it, for example the previous contents of a string or slice you replaced.",
    "Every type has a zero value. A struct's zero value is each field at its own zero value. A nil map can be read; writing to it panics until you `make` it.",
    "A constant with no type can be used as several numeric types. A constant with a type cannot.",
    "`iota` is 0 on the first line of a const block and increases by 1 each line. A line with no formula repeats the previous formula. `_ = iota` throws away 0 so `KB` lands on `1 << 10`.",
    "An inner `:=` can hide an outer variable. An unused local variable does not compile. `_` means you are ignoring that value on purpose."
  ],
  quiz: [
    { q: "`var m map[string]int` then `m[\"a\"] = 1`. Result?",
      options: ["Works, m becomes length 1", "Panics: assignment to entry in nil map", "Compile error", "Silently ignored"],
      answer: 1,
      explain: "Reading m[\"a\"] would give 0. Writing needs a real map first: m = make(map[string]int)." },
    { q: "What is the zero value of a `string`?",
      options: ["nil", "`\"\"`", "`\"0\"`", "undefined"],
      answer: 1,
      explain: "The empty string. A Go string is never nil." },
    { q: "Why does `y, err := g()` compile right after `x, err := f()`?",
      options: ["err is special-cased", "`:=` only needs one new variable on the left; err is reassigned", "It doesn't compile", "err is shadowed in a new scope"],
      answer: 1,
      explain: "y is new, so := is allowed. err already exists in this function, so it is given a new value. It is not a second err." },
    { q: "In `const ( _ = iota; KB = 1 << (10*iota); MB )`, what is MB?",
      options: ["2048", "1048576", "1024", "20"],
      answer: 1,
      explain: "Line 0 throws iota 0 away. KB is line 1: iota is 1, so 1 << 10 = 1024. MB has no formula, so Go repeats 1 << (10 * iota) with iota equal to 2. 1 << 20 = 1048576." },
    { q: "A function declares `n := 5` and never uses it. What happens?",
      options: ["Nothing", "A vet warning", "A compile error", "n is optimised away silently"],
      answer: 2,
      explain: "The file does not compile. An unused local variable is an error. Use _ only when you mean to ignore a value." }
  ]
},

/* ───────────────────────────── 5 ───────────────────────────── */
{
  id: "data-types",
  level: "Beginner",
  icon: "🔢",
  title: "Data Types, Strings, Runes & Conversion",
  minutes: 18,
  blurb: "What an int, a float, a string, and a bool are, how to change a type, and why text counts bytes.",
  blocks: [
    { t: "h", text: "What a type is" },
    { t: "p", html: "A type is the kind of value a name holds. Go remembers that kind. If <code>age</code> is a whole number, Go will not let you store the text <code>\"Ada\"</code> in it." },

    { t: "h", text: "The types you will use" },
    { t: "p", html: "Six types cover almost every program. Learn these first." },
    { t: "list", items: [
      "<code>int</code> is a whole number, such as a count or an age. <code>30</code> is an int. It can be negative.",
      "<code>float64</code> is a number that can have a fraction, such as a price. <code>1.5</code> is a float64.",
      "<code>bool</code> is yes or no. The only two values are <code>true</code> and <code>false</code>.",
      "<code>string</code> is text. <code>\"Ada\"</code> is a string.",
      "<code>byte</code> is one small number, from 0 to 255. A file or a network message is a row of bytes.",
      "<code>rune</code> is one character, such as <code>A</code> or <code>é</code>. Go stores that character as a number."
    ]},
    { t: "p", html: "A byte and a rune print as numbers. <code>%c</code> prints the character those numbers stand for. A condition has to be a bool. The number <code>1</code> is not <code>true</code> or <code>false</code>, so <code>if 1 {}</code> does not compile." },
    { t: "code", title: "One value of each type", code:
`count := 30
price := 1.5
ok := true
name := "Ada"
raw := byte('A')
letter := 'é'

fmt.Println(count)
fmt.Println(price)
fmt.Println(ok)
fmt.Println(name)
fmt.Println(raw)
fmt.Printf("%c\\n", raw)
fmt.Printf("%c\\n", letter)`,
      out: `30
1.5
true
Ada
65
A
é`
    },
    { t: "code", title: "A condition must be true or false", code:
`if 1 {
}`,
      out: `non-boolean condition in if statement`
    },

    { t: "h", text: "Other number sizes" },
    { t: "p", html: "Go also has numbers of a fixed size. Leave them until a file format or a size limit asks for one. <code>int</code> and <code>float64</code> are the ones to reach for." },
    { t: "table", head: ["Kind", "Types", "What it is"],
      rows: [
        ["Whole number, can be negative", "int8, int16, int32, int64, <strong>int</strong>", "<code>int</code> is the everyday one"],
        ["Whole number, from 0 up", "uint8, uint16, uint32, uint64, uint, uintptr", "Stepping below 0 wraps to a huge number. <code>uintptr</code> holds an address"],
        ["Fraction", "float32, <strong>float64</strong>", "Use <code>float64</code>"],
        ["Real and imaginary", "complex64, complex128", "Rare in everyday programs"],
        ["Text", "string, <strong>byte</strong>, <strong>rune</strong>", "<code>byte</code> is a uint8. <code>rune</code> is an int32"]
      ]
    },
    { t: "p", html: "An unsigned number cannot be negative. <code>uint</code> starts at 0. Take one away from 0 and it wraps to the biggest value that type can hold. On a 64-bit computer that value is 18446744073709551615." },
    { t: "p", html: "<code>uint8</code> only holds 0 through 255. Put 300 in one and Go keeps what is left after filling 256, which is 44. It does not return an error. You asked for the conversion, so it does it." },
    { t: "code", title: "Below zero, and a number that does not fit", code:
`var u uint = 0
fmt.Println(u - 1)

n := 300
fmt.Println(uint8(n))`,
      out: `18446744073709551615
44`
    },

    { t: "h", text: "Changing a type" },
    { t: "p", html: "Some languages quietly turn an int into a float. Go does not. If <code>i</code> is an int, this line does not compile:" },
    { t: "code", title: "Go refuses to convert this for you", code:
`var i int = 42
var f float64 = i   // does not compile`,
      out: `cannot use i (variable of type int) as float64 value in variable declaration`
    },
    { t: "p", html: "You write the new type yourself. <code>float64(i)</code> means \"make a float64 from this int\". The spelling <code>(float64)i</code> is from C, and Go does not accept it. <code>i.(float64)</code> is a different question: it asks a stored value what it holds. An int is not that kind of value. The next section shows when to use it." },
    { t: "code", title: "You name the type you want", code:
`var i int = 42
var f float64 = float64(i)
fmt.Println(f)`,
      out: `42`
    },
    { t: "p", html: "A conversion does not check that the value fits, and it does not return an error. A fraction is cut toward zero. <code>int(3.99)</code> is <code>3</code>, not 4." },
    { t: "code", title: "The fraction is cut off", code:
`x := 3.99
fmt.Println(int(x))`,
      out: `3`
    },
    { t: "note", kind: "warn", title: "A number written in the source is checked", html: "<code>int(3.99)</code> does not compile: Go can see that 3.99 is not a whole number. <code>uint8(300)</code> does not compile: 300 does not fit. Put the number in a variable first, as the examples above do, and the same conversion compiles and cuts or wraps." },
    { t: "p", html: "Dividing two ints gives an int. The fraction is dropped, so <code>7 / 2</code> is <code>3</code>. Write <code>7.0 / 2.0</code> when you want <code>3.5</code>. If the divisor is an int variable, convert both sides: <code>float64(7) / float64(two)</code>." },
    { t: "code", title: "Integer division drops the fraction", code:
`fmt.Println(7 / 2)
fmt.Println(7.0 / 2.0)
two := 2
fmt.Println(float64(7) / float64(two))`,
      out: `3
3.5
3.5`
    },
    { t: "p", html: "<code>string(72)</code> means the character whose number is 72, which is <code>H</code>. It does not mean the digits 72. Use <code>strconv</code> to turn a number into decimal text, or text into a number." },
    { t: "code", title: "string(n) is a character; strconv is the decimal text", code:
`fmt.Println(string(72))
fmt.Println(strconv.Itoa(72))

n, err := strconv.Atoi("42")
fmt.Println(n, err)`,
      out: `H
72
42 <nil>`
    },
    { t: "h", text: "Floats" },
    { t: "p", html: "A float64 cannot store 0.1 exactly. Add 0.1 and 0.2 and the result is a tiny bit off 0.3, so a direct comparison is false. Compare the gap instead. For money, store a whole number of cents in an int." },
    { t: "code", title: "0.1 plus 0.2 is not exactly 0.3", code:
`a := 0.1
b := 0.2
c := 0.3
fmt.Println(a + b == c)
fmt.Println(math.Abs((a + b) - c) < 1e-9)`,
      out: `false
true`
    },

    { t: "h", text: "How to check a type" },
    { t: "p", html: "A name such as <code>var age int</code> already has a type. You do not look it up. You look a type up in two cases: you want to see the name while debugging, or the value was stored in an <code>any</code> slot." },
    { t: "p", html: "<code>any</code> can hold a string now and an int later. Go learns which one it is when the program runs." },
    { t: "p", html: "<code>fmt.Printf(\"%T\\n\", v)</code> prints the type's name. Each piece of that call does one job." },
    { t: "list", items: [
      "<code>Printf</code> is the call that writes text.",
      "<code>%T</code> means type. The <code>T</code> tells Printf to write the type's name.",
      "<code>\\n</code> means start a new line after that name.",
      "<code>v</code> is the value you pass in. When <code>v</code> is <code>30</code>, the name that prints is <code>int</code>."
    ]},
    { t: "diagram", id: "percent-t" },
    { t: "p", html: "<code>v, ok := x.(string)</code> asks one question and gives you two answers." },
    { t: "list", items: [
      "<code>x</code> is the slot. It can hold a string, an int, or something else.",
      "<code>(string)</code> is the question: does this slot hold a string?",
      "<code>v</code> is the value that comes back. It is that string when the answer is yes.",
      "<code>ok</code> is the yes or no. <code>true</code> means the type matched. <code>false</code> means it did not, and the program keeps running."
    ]},
    { t: "diagram", id: "comma-ok" },
    { t: "code", title: "Print the type, then ask an any value", code:
`age := 30
name := "Ada"
fmt.Printf("%T\\n", age)
fmt.Printf("%T\\n", name)

var x any = "Ada"
s, ok := x.(string)
fmt.Println(s, ok)

n, ok := x.(int)
fmt.Println(n, ok)`,
      out: `int
string
Ada true
0 false`
    },
    { t: "p", html: "Write <code>x.(string)</code> with the <code>ok</code> result, and check it. Without <code>ok</code>, the program stops when <code>x</code> holds a different type." },
    { t: "p", html: "When several types are possible, a type switch names each one. Inside the matching case, <code>v</code> has that type." },
    { t: "code", title: "A type switch names each type you accept", code:
`var x any = "Ada"
switch v := x.(type) {
case string:
    fmt.Println("text", v)
case int:
    fmt.Println("number", v)
default:
    fmt.Printf("other %T\\n", v)
}`,
      out: `text Ada`
    },
    { t: "p", html: "The same switch form appears in <a href=\"#/m/control-flow\">Control Flow: if, for, switch, defer</a>, under switch. <a href=\"#/m/methods-interfaces\">Methods, Interfaces &amp; Composition</a> explains both forms in full, under Type assertions. <code>%T</code> is also in the verb table in <a href=\"#/m/printing-fmt\">Printing &amp; Formatting with fmt</a>." },

    { t: "h", text: "Text" },
    { t: "p", html: "A string is text stored as bytes. <code>len</code> counts bytes, not characters. Most English letters are one byte. <code>é</code> is two bytes, so <code>Héllo</code> is 6 bytes and 5 characters. <code>héllo</code> is 6 bytes for the same reason." },
    { t: "list", items: [
      "<code>len(s)</code> counts bytes.",
      "<code>range</code> walks characters. The number it gives you is the byte position, so it can skip.",
      "<code>s[1]</code> is one byte, not the character <code>é</code>."
    ]},
    { t: "diagram", id: "string-runes" },
    { t: "p", html: "<code>[]rune(s)</code> turns the string into a list of characters, so you can pick one by its place." },
    { t: "list", items: [
      "<code>s</code> is the string, still stored as bytes.",
      "<code>[]rune</code> means a list of characters.",
      "<code>(s)</code> means convert this string into that list.",
      "<code>chars[1]</code> is the second character. The first is <code>[0]</code>, so <code>[1]</code> of <code>Héllo</code> is <code>é</code>."
    ]},
    { t: "diagram", id: "rune-list" },
    { t: "code", title: "Héllo is 6 bytes and 5 characters", code:
`s := "Héllo"
fmt.Println(len(s))
fmt.Println(utf8.RuneCountInString(s))
fmt.Println(s[1])
for i, r := range s {
    fmt.Printf("%d:%c ", i, r)
}
fmt.Println()
chars := []rune(s)
fmt.Println(string(chars[1]))
fmt.Println(len(chars))`,
      out: `6
5
195
0:H 1:é 3:l 4:l 5:o 
é
5`
    },
    { t: "p", html: "You cannot change one letter inside a string. <code>s[0] = 'h'</code> does not compile. Build a new string instead." },
    { t: "p", html: "<code>s += \"x\"</code> copies the whole string on every addition. In a long loop those copies add up. <code>strings.Builder</code> adds onto one buffer. When you already have the pieces in a list, <code>strings.Join</code> is the clearest call." },
    { t: "code", title: "Build a new string", code:
`var b strings.Builder
b.WriteString("go")
b.WriteString("lang")
fmt.Println(b.String())`,
      out: `golang`
    },

    { t: "h", text: "Searching text" },
    { t: "p", html: "The <code>strings</code> package looks through text and cuts it up. Each function below does one job." },
    { t: "list", items: [
      "<code>Contains</code> asks whether the text includes a piece.",
      "<code>HasPrefix</code> asks whether the text starts with a piece.",
      "<code>Split</code> cuts the text on a separator.",
      "<code>Join</code> sticks pieces together with a separator.",
      "<code>TrimSpace</code> removes spaces and newlines from both ends.",
      "<code>Fields</code> cuts on any stretch of whitespace.",
      "<code>EqualFold</code> compares letters and ignores case."
    ]},
    { t: "code", title: "Look through a string", code:
`fmt.Println(strings.Contains("seafood", "foo"))
fmt.Println(strings.HasPrefix("golang", "go"))
fmt.Println(strings.Split("a,b,c", ","))
fmt.Println(strings.Join([]string{"a", "b"}, "-"))
fmt.Println(strings.TrimSpace("  hi \\n"))
fmt.Println(strings.Fields(" a  b   c "))
fmt.Println(strings.EqualFold("Go", "GO"))`,
      out: `true
true
[a b c]
a-b
hi
[a b c]
true`
    }
  ],
  summary: [
    "`int` is a whole number, `float64` can have a fraction, `bool` is true or false, and `string` is text.",
    "`byte` is one value from 0 to 255. `rune` is one character.",
    "Go will not turn an int into a float64 for you. Write float64(i). A fraction is cut off, and a number that is too big wraps.",
    "`string(72)` is `H`. `strconv.Itoa(72)` is the text \"72\".",
    "0.1 + 0.2 is not exactly 0.3. For money, store cents as an int.",
    "Print a type with `%T`. `v, ok := x.(string)` asks whether an `any` value holds a string.",
    "`len` counts bytes. `range` walks characters. `[]rune(s)` lets you pick a character by its place.",
    "A string cannot be changed in place. Use `strings.Builder` or `strings.Join` to build text."
  ],
  quiz: [
    { q: "`s := \"héllo\"`, what does `len(s)` return?",
      options: ["5", "6", "4", "Depends on locale"],
      answer: 1,
      explain: "`é` is two bytes in UTF-8, so 6 bytes total. `utf8.RuneCountInString` gives 5." },
    { q: "`var i int = 5`, which line compiles?",
      options: ["`var f float64 = i`", "`var f float64 = float64(i)`", "`var f float64 = (float64)i`", "`var f float64 = i.(float64)`"],
      answer: 1,
      explain: "`float64(i)` is an explicit conversion: you wrote the type. `var f float64 = i` would be an implicit conversion, and Go refuses it. `(float64)i` is C syntax, not Go. `i.(float64)` asks an interface what it holds; an int is not an interface, so that does not compile either." },
    { q: "`fmt.Println(string(72))` prints what?",
      options: ["\"72\"", "\"H\"", "72", "compile error"],
      answer: 1,
      explain: "`string(72)` does not mean the digits 72. It means the character whose code is 72, which is H. `strconv.Itoa(72)` is the text \"72\"." },
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

    { t: "h", text: "fmt" },
    { t: "p", html: "The name tells you where the result goes. <code>Print</code> writes to the terminal. <code>Sprint</code> builds a string and does not print. <code>Fprint</code> writes to anything that accepts bytes: a file, a buffer, or an HTTP response. <code>Errorf</code> builds an error. <code>Appendf</code> adds onto a byte slice." },
    { t: "code", title: "Print / Printf / Println × nothing / S / F / Err", code:
`// 1. To STANDARD OUTPUT
fmt.Print("a", "b", 1, 2)       // ab1 2   ← see the spacing rule below
fmt.Println("a", "b", 1, 2)     // a b 1 2\\n
fmt.Printf("%s has %d\\n", s, n) // you control everything

// 2. To a STRING (the "S" family), build, don't print
msg := fmt.Sprintf("user %s has %d items", name, n)
s2  := fmt.Sprint("a", "b")      // "ab"
s3  := fmt.Sprintln("a", "b")    // "a b\\n"

// 3. To ANY io.Writer (the "F" family), the most useful one
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
    { t: "note", kind: "warn", title: "The spacing rule people get wrong", html: "<code>Println</code> <strong>always</strong> puts a space between operands and adds a newline. <code>Print</code> and <code>Sprint</code> add a space <strong>only when neither neighbour is a string</strong>, which is why <code>fmt.Print(\"a\", \"b\", 1, 2)</code> gives <code>ab1 2</code>. If you care about the exact output, use <code>Printf</code>." },

    { t: "h", text: "Format verbs" },
    { t: "p", html: "A verb is the code after <code>%</code> in a format string. It tells <code>fmt</code> how to turn a value into text. <code>%v</code> is the one to use when you are not sure. <code>%T</code> prints the type name. Asking an <code>any</code> value what it holds is in <a href=\"#/m/data-types\">Data Types, Strings, Runes &amp; Conversion</a>, under How to check a type." },
    { t: "table", head: ["Verb", "Meaning", "Example output"],
      rows: [
        ["<code>%v</code>", "Default format, works for every type", "<code>{Ada 30}</code>"],
        ["<code>%+v</code>", "Structs <strong>with field names</strong>, your debugging default", "<code>{Name:Ada Age:30}</code>"],
        ["<code>%#v</code>", "Go syntax: paste it back into code", "<code>main.User{Name:\"Ada\", Age:30}</code>"],
        ["<code>%T</code>", "The type itself", "<code>main.User</code>, <code>[]int</code>, <code>*os.File</code>"],
        ["<code>%d %b %o %x %X</code>", "Integer in base 10 / 2 / 8 / 16", "<code>255 11111111 377 ff FF</code>"],
        ["<code>%f %.2f %e %g</code>", "Float: full, 2 decimals, scientific, compact", "<code>3.141593 3.14 3.1416e+00 3.141593</code>"],
        ["<code>%s</code>", "String, or anything with <code>String()</code> / <code>Error()</code>", "<code>hello</code>"],
        ["<code>%q</code>", "Quoted and escaped (strings) or rune-quoted (ints)", "<code>\"hi\\n\"</code>, <code>'A'</code>"],
        ["<code>%c %U</code>", "The character for a code point / U+ notation", "<code>A</code>, <code>U+0041</code>"],
        ["<code>%t</code>", "Boolean", "<code>true</code>"],
        ["<code>%p</code>", "Pointer address, for identity checks, not for logs", "<code>0xc000012345</code>"],
        ["<code>%w</code>", "Wrap an error (<code>fmt.Errorf</code> only)", "chain preserved for <code>errors.Is</code>"],
        ["<code>%%</code>", "A literal percent sign", "<code>%</code>"]
      ]
    },
    { t: "code", title: "Width, precision, flags, and the quick mental model", code:
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
    { t: "note", kind: "tip", title: "Map printing is deterministic", html: "Since Go 1.12 <code>fmt</code> sorts map keys before printing, so <code>%v</code> on a map produces stable output you can safely use in golden-file tests. Iterating the map yourself is still randomised, only <em>printing</em> is sorted." },

    { t: "h", text: "Stringer" },
    { t: "p", html: "If your type has a method <code>String() string</code>, then <code>fmt</code>, <code>log</code>, and <code>slog</code> call it whenever they print a value of that type. That is how <code>Temp(21.5)</code> can print <code>21.5°C</code> instead of a bare number. A tool named <code>stringer</code> can write that method for a list of constants so they print as names, not numbers." },
    { t: "code", title: "One method, and the whole ecosystem cooperates", code:
`type Temp float64

func (t Temp) String() string { return strconv.FormatFloat(float64(t), 'f', 1, 64) + "°C" }

fmt.Println(Temp(21.5))            // 21.5°C
fmt.Printf("%v %s", Temp(3), x)    // both route through String()
log.Printf("temp=%v", Temp(3))     // so does log, slog, and anything using fmt

// That interface is tiny and lives in fmt:
//   type Stringer interface { String() string }
// error is the same idea:  interface { Error() string }, and Error() wins
// over String() when both exist.

// Enum + Stringer is THE idiom. Generate it instead of hand-writing:
//go:generate stringer -type=Status
type Status int
const (
    Pending Status = iota
    Active
    Closed
)
// stringer writes a String() method, now %v prints "Active", not "1".

// Full control over formatting (rare): implement fmt.Formatter.
// Control over %#v: implement fmt.GoStringer.`
    },
    { t: "note", kind: "warn", title: "The recursion trap, this one hangs your program", html: "Inside a <code>String()</code> method, printing the receiver with <code>%v</code> or <code>%s</code> calls <code>String()</code> again, forever, until the stack overflows." },
    { t: "code", title: "Why, and the two fixes", code:
`type MyString string

// BROKEN: infinite recursion. %s on m calls String() calls %s on m calls…
func (m MyString) String() string {
    return fmt.Sprintf("MyString=%s", m)
}

// FIX 1, convert to the underlying type first, so fmt sees a plain string:
func (m MyString) String() string {
    return fmt.Sprintf("MyString=%s", string(m))
}

// FIX 2, for structs, print the fields, never the whole receiver:
func (u User) String() string {
    return fmt.Sprintf("User(%s, %d)", u.Name, u.Age)   // not %v on u
}

// Related: fmt RECOVERS panics inside String()/Error() so one bad method can't
// crash your program. You get this instead, which is a strong hint to look at
// a nil pointer receiver:
//   %!v(PANIC=String method: runtime error: invalid memory address)`
    },

    { t: "h", text: "Bad formats" },
    { t: "p", html: "A bad verb does not crash. <code>fmt</code> inserts a marker such as <code>%!d(string=hello)</code> into the text, which is easy to miss in a log. <code>go vet</code> finds these mismatches, including in your own functions whose names end in <code>f</code>." },
    { t: "code", title: "fmt tells you in-band, and go vet catches it first", code:
`fmt.Printf("%d", "hello")    // %!d(string=hello)      wrong verb for the type
fmt.Printf("%d %d", 1)       // 1 %!d(MISSING)         too few arguments
fmt.Printf("%d", 1, 2)       // 1%!(EXTRA int=2)       too many
fmt.Printf("%z", 1)          // %!z(int=1)             no such verb

// Nothing panics and nothing returns an error, you get a marked-up string,
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

    { t: "h", text: "Input" },
    { t: "p", html: "<code>Scan</code> reads whitespace-separated values from the keyboard or a string. It is enough for an exercise. For real input, read a line with <code>bufio.Scanner</code> and convert it with <code>strconv</code>, because <code>Scan</code> stops at the first value it cannot parse." },
    { t: "code", title: "Scan is fine for exercises; bufio for real input", code:
`var name string; var age int
fmt.Scan(&name, &age)                      // whitespace-separated from stdin
fmt.Scanln(&name)                           // stops at the newline
fmt.Sscanf("21-07", "%d-%d", &d, &m)        // parse from a string
fmt.Fscan(r, &x)                            // from any io.Reader

// For anything real, lines, large input, CSV, user prompts, use
// bufio.Scanner (and strconv to convert), which handles long lines and errors
// properly. fmt.Scan silently stops on the first thing it cannot parse.`
    },

    { t: "h", text: "fmt performance" },
    { t: "p", html: "<code>fmt</code> is convenient and slow, because it inspects types while the program runs. On a hot path, <code>strconv</code> is faster. In a service, log with <code>slog</code> rather than <code>Println</code>, and do not put secrets into a format string." },
    { t: "list", items: [
      "<strong><code>fmt</code> uses reflection</strong>, so it is far slower than direct conversion. On a hot path, <code>strconv.Itoa(n)</code> beats <code>fmt.Sprintf(\"%d\", n)</code> by roughly an order of magnitude, and <code>s1 + s2</code> beats <code>Sprintf(\"%s%s\", …)</code>.",
      "Passing values to <code>...any</code> <strong>boxes them, forcing a heap allocation</strong>, which is why <code>fmt.Println</code> shows up in escape-analysis output and in allocation profiles.",
      "<strong>Never log with <code>fmt.Println</code> in a service.</strong> Use <code>slog</code>: structured, levelled, JSON, and filterable. <code>fmt</code> is for CLI output, errors and debugging.",
      "<strong>Never put a secret or PII in a format string.</strong> Give sensitive types a <code>String()</code> that returns <code>\"[REDACTED]\"</code> and a stray <code>%v</code> can no longer leak it.",
      "Prefer <code>Fprintf(w, …)</code> with an injected <code>io.Writer</code> over writing to stdout directly, it makes the output unit-testable.",
      "For building strings in a loop, <code>strings.Builder</code>; for one value, <code>strconv</code>; for a message with several, <code>Sprintf</code> is perfectly idiomatic."
    ]}
  ],
  summary: [
    "Four families: `Print*` (stdout), `Sprint*` (string), `Fprint*` (any `io.Writer`), `Errorf` (error), plus `Appendf` into a `[]byte`.",
    "`Println` always separates with spaces; `Print`/`Sprint` only do so between two non-strings.",
    "Learn `%v`, `%+v` (field names), `%#v` (Go syntax), `%T`, `%q`, `%d/%x`, `%.2f`, `%s`, `%t`, `%w`, and `%%` for a literal percent.",
    "Width/precision/flags: `%6d`, `%-6s`, `%06d`, `%+d`, `%8.3f`, `% x`, `%#x`, `%*d`.",
    "Maps print with **sorted keys** (1.12+), so `%v` output is stable in golden tests even though iteration isn't.",
    "Implement `String() string` (fmt.Stringer) and every fmt/log/slog call formats your type nicely; generate it for enums with `stringer`.",
    "Never format the receiver with `%v`/`%s` inside its own `String()`, that recurses forever. Convert to the underlying type or print fields.",
    "Bad format strings produce `%!d(string=…)` / `%!d(MISSING)` rather than an error, `go vet` is what actually catches them, including in your own `…f` wrappers.",
    "`fmt` uses reflection and boxes arguments: prefer `strconv` on hot paths, `slog` for service logs, and redact secrets via `String()`."
  ],
  quiz: [
    { q: "Which verb prints a struct **with its field names**?",
      options: ["`%v`", "`%+v`", "`%#v`", "`%s`"],
      answer: 1,
      explain: "`%v` gives `{Ada 30}`, `%+v` gives `{Name:Ada Age:30}`, and `%#v` gives full Go syntax. `%+v` is the debugging default." },
    { q: "`func (m MyString) String() string { return fmt.Sprintf(\"v=%s\", m) }`, what happens?",
      options: ["Prints `v=` plus the value", "Infinite recursion until the stack overflows", "A compile error", "fmt ignores String() for named string types"],
      answer: 1,
      explain: "`%s` on `m` calls `String()` again. Convert first: `fmt.Sprintf(\"v=%s\", string(m))`." },
    { q: "`fmt.Printf(\"%d\", \"hello\")` does what?",
      options: ["Panics", "Returns an error you must check", "Writes `%!d(string=hello)`", "Prints nothing"],
      answer: 2,
      explain: "fmt reports format problems in-band, which is easy to miss in logs, `go vet` catches them at build time instead." },
    { q: "You want a function's output to be unit-testable. Which signature?",
      options: ["`func report()` using fmt.Println", "`func report(w io.Writer)` using fmt.Fprintf", "`func report() string` only", "`func report(path string)` writing a file"],
      answer: 1,
      explain: "Taking an `io.Writer` lets tests pass a `bytes.Buffer` and assert on the bytes, the reason the `F` family exists." },
    { q: "Printing a `map[string]int` with `%v` gives which key order?",
      options: ["Randomised, like range", "Insertion order", "Sorted, fmt sorts map keys", "Undefined"],
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
    { t: "p", html: "Control flow decides what runs next. <code>if</code> picks one branch. <code>for</code> repeats. <code>switch</code> picks one case and stops. <code>defer</code> saves a call until the function returns." },
    { t: "h", text: "if" },
    { t: "p", html: "<code>if</code> tests a condition. When the test is true, that block runs. When it is false, <code>else</code> runs, if you wrote one. In the picture, <code>err == nil</code> means the call worked, so <code>use(v)</code> runs. Any other result takes <code>return err</code>." },
    { t: "diagram", id: "control-if" },
    { t: "p", html: "The condition does not use parentheses, and the braces are required. The useful form is <code>if v, err := f(); err != nil</code>: <code>v</code> and <code>err</code> exist only inside that <code>if</code> and its <code>else</code>. A guard clause returns early on the bad case so the rest of the function stays flat." },
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

    { t: "h", text: "for" },
    { t: "p", html: "<code>for</code> is the only loop. Go has no <code>while</code> and no <code>foreach</code>. The same keyword has four shapes: a counter, a condition, a loop that runs until <code>break</code>, and <code>range</code>. The boxes light up in that order." },
    { t: "diagram", id: "control-for" },
    { t: "p", html: "<code>range</code> walks a slice, a map, a string, a channel, or (since Go 1.22) the integers from 0 up to a number. Map keys come out in a random order on purpose." },
    { t: "code", title: "Five shapes, one keyword", code:
`for i := 0; i < 5; i++ { }            // classic three-clause

for n > 0 { n-- }                      // while

for { break }                          // infinite (for-ever)

for i, v := range slice { }            // index, value
for k, v := range myMap { }            // key, value, ORDER IS RANDOMISED
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

    { t: "h", text: "switch" },
    { t: "p", html: "<code>switch</code> takes one value and runs the case that matches. In the picture, <code>day</code> is <code>Mon</code>, so that case runs and the others are skipped. A case does not fall into the next one. You do not write <code>break</code>." },
    { t: "diagram", id: "control-switch" },
    { t: "p", html: "One case can list several values. A <code>switch</code> with no value after it is a chain of conditions. <code>switch v := i.(type)</code> asks an interface value what concrete type it holds, and <code>v</code> has that type inside the matching case." },
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

// Type switch, switch on the dynamic type inside an interface
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

    { t: "h", text: "defer" },
    { t: "p", html: "<code>defer</code> saves a call and runs it when the function returns, including when it panics. Write Close, then Unlock, then log, and the stack puts log on top. Return runs them last to first: log, then Unlock, then Close. Arguments are saved at the <code>defer</code> line, so <code>defer fmt.Println(i)</code> prints the value <code>i</code> had then. A deferred function with no arguments reads <code>i</code> later, when it actually runs." },
    { t: "diagram", id: "defer-stack" },
    { t: "code", title: "Runs when the function returns, whatever happens", code:
`func readFile(path string) ([]byte, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    defer f.Close()        // guaranteed, on return AND on panic
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
    defer func() { fmt.Println("closure:", i) }()  // prints 1, reads i later
    i++
}

// A deferred closure can modify named return values
func withTiming() (elapsed time.Duration) {
    start := time.Now()
    defer func() { elapsed = time.Since(start) }()
    heavyWork()
    return    // elapsed is set by the deferred func
}

order()
trap()`,
      out: `3
2
1
closure: 1
captured: 0`
    },
    { t: "note", kind: "warn", title: "Never `defer` inside a loop body", html: "Deferred calls fire when the <strong>function</strong> returns, not at the end of each iteration, so looping over 10,000 files with <code>defer f.Close()</code> holds 10,000 handles open. Either close explicitly at the end of the iteration, or move the body into its own function (or a closure you call immediately)." }
  ],
  summary: [
    "`if` takes an initialiser: `if v, err := f(); err != nil` scopes both to the branch.",
    "Prefer guard clauses and early returns over nesting.",
    "`for` is the only loop keyword, it covers while, infinite, range, and `range N` (1.22+).",
    "Map iteration order is randomised by design; sort the keys for determinism.",
    "`switch` has no implicit fallthrough, allows multiple values and bare conditions, and `switch v := x.(type)` branches on dynamic type.",
    "`defer` is LIFO, evaluates arguments immediately, runs even on panic, and never belongs in a loop body."
  ],
  quiz: [
    { q: "How many loop keywords does Go have?",
      options: ["Three: for, while, do", "Two: for, while", "One: for", "Four, including foreach"],
      answer: 2,
      explain: "`for` alone covers every loop shape." },
    { q: "Ranging over the same map twice in one run gives keys in which order?",
      options: ["Insertion order", "Sorted order", "Randomised, deliberately", "Hash order, stable within a run"],
      answer: 2,
      explain: "The runtime randomises the start point per iteration so code can't depend on order." },
    { q: "`defer fmt.Println(i)` with i==0, then `i++`, then return. What prints?",
      options: ["1", "0", "Nothing", "Compile error"],
      answer: 1,
      explain: "Deferred arguments are evaluated at the defer statement. Wrap in a closure to read the later value." },
    { q: "Three defers in a row, what's the execution order?",
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
