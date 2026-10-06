/* Modules 14–17 : Concurrency, Runtime, Generics, Iterators */
window.CURRICULUM_PARTS = window.CURRICULUM_PARTS || [];
window.CURRICULUM_PARTS.push([

/* ───────────────────────────── 14 ───────────────────────────── */
{
  id: "concurrency",
  level: "Advanced",
  icon: "⚡",
  title: "Concurrency: Goroutines, Channels & Context",
  minutes: 28,
  blurb: "Go's headline feature. Goroutines, channel semantics, select, sync primitives, and cancellation.",
  blocks: [
    { t: "p", html: "<strong>Concurrency is not parallelism.</strong> Concurrency is <em>structuring</em> a program as independently progressing tasks; parallelism is <em>executing</em> things at the same instant on multiple cores. Go gives you concurrency as a language feature, and the runtime turns it into parallelism when cores are available." },

    { t: "h", text: "Goroutines" },
    { t: "p", html: "Putting <code>go</code> in front of a call runs that function at the same time as the caller, and the caller does not wait. A goroutine is not an operating-system thread. It starts with a small stack, about 2 KB, and the runtime parks it when it blocks. When <code>main</code> returns, every goroutine is killed." },
    { t: "code", title: "A function call with `go` in front of it", code:
`go doWork()                       // runs concurrently; the caller does not wait
go func(id int) {                 // pass data in as arguments, don't capture loosely
    fmt.Println("worker", id)
}(1)

// Goroutines are NOT OS threads. They cost ~2 KB of stack and are multiplexed
// onto a small pool of threads by the Go runtime. A million is realistic;
// a million OS threads would need ~8 GB of stack and would thrash the kernel.

fmt.Println(runtime.NumGoroutine())  // how many are alive
fmt.Println(runtime.NumCPU())        // cores available
// GOMAXPROCS = how many goroutines may run Go code simultaneously.
// Defaults to NumCPU (and is container-CPU-limit aware from Go 1.25).`
    },
    { t: "note", kind: "warn", title: "Two rules you learn the hard way", html: "<strong>(1)</strong> When <code>main</code> returns the process exits, killing every goroutine mid-flight. <strong>(2)</strong> A goroutine that blocks forever is a <em>goroutine leak</em>, memory the GC can never reclaim. Always know how each goroutine terminates <em>before</em> you start it." },

    { t: "h", text: "Channels" },
    { t: "p", html: "A channel passes a value from one goroutine to another. An unbuffered send waits until someone receives. A buffered send waits only when the buffer is full. Closing a channel tells receivers there will be no more values. Only the sender should close it." },
    { t: "code", title: "Unbuffered vs buffered", code:
`ch := make(chan int)        // UNBUFFERED: send blocks until a receiver is ready
                            //, a synchronisation point, a rendezvous
buf := make(chan int, 10)   // BUFFERED: send blocks only when the buffer is full

ch <- 42                    // send
v := <-ch                   // receive
v, ok := <-ch               // ok is false when the channel is closed AND drained

close(ch)                   // only the SENDER closes, and only once
for v := range ch { }       // receive until closed, the cleanest consumer loop

// Direction in a signature documents and enforces intent
func produce(out chan<- int)  { out <- 1; close(out) }  // send-only
func consume(in <-chan int)   { for v := range in { _ = v } }  // receive-only`
    },
    { t: "diagram", id: "channel" },
    { t: "table", head: ["Operation", "nil channel", "open channel", "closed channel"],
      rows: [
        ["Send", "blocks forever", "proceeds / blocks", "<strong>panics</strong>"],
        ["Receive", "blocks forever", "proceeds / blocks", "returns zero value immediately, ok=false"],
        ["Close", "<strong>panics</strong>", "succeeds", "<strong>panics</strong>"],
        ["len / cap", "0", "queued / capacity", "queued / capacity"]
      ]
    },
    { t: "note", kind: "tip", title: "Memorise this table", html: "Most channel bugs, <em>send on closed channel</em>, <em>all goroutines are asleep: deadlock</em>, <em>close of closed channel</em>, are just a cell from this table. A <code>nil</code> channel blocking forever is also a <em>feature</em>: set a channel variable to nil to disable its case inside a <code>select</code>." },

    { t: "h", text: "select" },
    { t: "p", html: "<code>select</code> waits on several channel operations and runs the one that is ready. If several are ready, it picks one at random, so you cannot rely on case order. A <code>default</code> case makes it return immediately instead of waiting." },
    { t: "diagram", id: "select" },
    { t: "code", title: "The concurrency switch statement", code:
`select {
case v := <-ch1:
    fmt.Println("from ch1:", v)
case ch2 <- 42:
    fmt.Println("sent to ch2")
case <-time.After(time.Second):
    fmt.Println("timeout")             // the standard timeout idiom
case <-ctx.Done():
    return ctx.Err()                   // the standard cancellation idiom
default:
    fmt.Println("nothing ready")       // makes select NON-BLOCKING
}
// If several cases are ready, one is chosen at RANDOM, no starvation,
// and no accidental priority ordering.

// Non-blocking send with a bounded queue
select {
case jobs <- job:
default:
    return errors.New("queue full")    // shed load instead of blocking
}`
    },

    { t: "h", text: "Concurrency patterns" },
    { t: "p", html: "Most concurrent Go is one of a few shapes: a worker pool, a pipeline of channels, or <code>errgroup</code> to run functions and collect the first error. Start the goroutine with a way for it to stop, usually a <code>context</code> or a closed channel." },
    { t: "code", title: "WaitGroup: wait for N goroutines", code:
`var wg sync.WaitGroup
for _, url := range urls {
    wg.Add(1)                           // BEFORE starting the goroutine
    go func(u string) {
        defer wg.Done()                 // ALWAYS deferred
        fetch(u)
    }(url)
}
wg.Wait()

// Go 1.22+ loop semantics make this safe too (url is per-iteration now):
for _, url := range urls {
    wg.Add(1)
    go func() { defer wg.Done(); fetch(url) }()
}
wg.Wait()

// Go 1.25+: WaitGroup.Go does the Add/Done bookkeeping for you, the
// Add-in-the-wrong-place and forgotten-Done bugs disappear.
var wg2 sync.WaitGroup
for _, url := range urls {
    wg2.Go(func() { fetch(url) })
}
wg2.Wait()`
    },
    { t: "diagram", id: "worker-pool" },
    { t: "code", title: "Worker pool: bounded concurrency", code:
`func pool(jobs <-chan Job, results chan<- Result, workers int) {
    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for j := range jobs {       // each worker pulls until jobs closes
                results <- process(j)
            }
        }()
    }
    wg.Wait()
    close(results)                      // safe: all senders are done
}

// Or cap concurrency with a semaphore channel
sem := make(chan struct{}, 10)
for _, item := range items {
    sem <- struct{}{}                   // acquire (blocks at 10 in flight)
    go func(it Item) {
        defer func() { <-sem }()        // release
        handle(it)
    }(item)
}`
    },
    { t: "code", title: "errgroup: the modern fan-out (golang.org/x/sync)", code:
`g, ctx := errgroup.WithContext(ctx)
g.SetLimit(10)                          // bounded concurrency, built in
results := make([]Result, len(urls))

for i, url := range urls {
    i, url := i, url
    g.Go(func() error {
        r, err := fetch(ctx, url)       // ctx is cancelled as soon as any task fails
        if err != nil { return err }
        results[i] = r                  // distinct index per goroutine: no lock needed
        return nil
    })
}
if err := g.Wait(); err != nil {        // first non-nil error
    return err
}`
    },

    { t: "h", text: "Mutexes" },
    { t: "p", html: "A mutex lets one goroutine at a time touch a piece of shared data. Use a channel to hand data off. Use a mutex to guard data many goroutines read and write. <code>go test -race</code> reports unsynchronised accesses. Never copy a mutex." },
    { t: "code", title: "When shared state is genuinely simpler than a channel", code:
`type SafeCounter struct {
    mu sync.Mutex                       // guards counts; zero value is ready
    counts map[string]int
}

func (c *SafeCounter) Inc(k string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.counts[k]++
}

// RWMutex: many concurrent readers, one exclusive writer.
// Worth it only for read-heavy workloads, RLock has real overhead.
var mu sync.RWMutex
mu.RLock();  _ = cache[k];  mu.RUnlock()

// sync.Once: exactly-once initialisation, safe from any goroutine
var once sync.Once
once.Do(func() { conn = connect() })

// Go 1.21+ sugar for the two shapes you actually write:
var initConn = sync.OnceValue(func() *DB { return connect() })      // lazy singleton
var loadCfg  = sync.OnceValues(func() (*Config, error) { return parse() })
db := initConn()        // connects on first call only; safe from any goroutine
// sync.OnceFunc(f) for the no-result case.

// Atomics for simple counters (Go 1.19+ typed API)
var hits atomic.Int64
hits.Add(1)
fmt.Println(hits.Load())`
    },
    { t: "note", kind: "warn", title: "Run the race detector", html: "<code>go test -race ./...</code> and <code>go run -race .</code> instrument every memory access and report unsynchronised concurrent access with both stack traces. It's ~10× slower and finds only races that actually occur during the run, so use it in CI and under load tests. A data race in Go is <strong>undefined behaviour</strong>, not just a stale read." },

    { t: "h", text: "context" },
    { t: "p", html: "<code>context.Context</code> carries a cancel signal and a deadline down a call chain. Pass it as the first argument. Always call the cancel function, usually with <code>defer</code>, or the timer and the child context leak. A function that blocks should stop when <code>ctx.Done()</code> fires." },
    { t: "code", title: "The first parameter of every blocking function you write", code:
`// Creating contexts
ctx := context.Background()                              // root, in main
ctx, cancel := context.WithCancel(parent)
ctx, cancel = context.WithTimeout(parent, 5*time.Second)
ctx, cancel = context.WithDeadline(parent, someTime)
defer cancel()                        // ALWAYS defer cancel, it frees the timer

// Honouring a context in your own loop
func work(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()           // context.Canceled or DeadlineExceeded
        case job := <-jobs:
            if err := handle(ctx, job); err != nil { return err }
        }
    }
}

// Propagating it: cancellation flows down the whole call tree automatically
req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
rows, err := db.QueryContext(ctx, "SELECT ...")

// Request-scoped values, use sparingly, with an unexported key type
type ctxKey struct{}
ctx = context.WithValue(ctx, ctxKey{}, requestID)
id, _ := ctx.Value(ctxKey{}).(string)`
    },
    { t: "note", kind: "tip", title: "Context rules", html: "Pass it as the <strong>first</strong> parameter named <code>ctx</code>. Never store one in a struct field. Never pass <code>nil</code>, use <code>context.TODO()</code> while plumbing. Don't smuggle optional arguments through <code>WithValue</code>; it's for request-scoped metadata like trace IDs and auth subjects." },

    { t: "h", text: "Memory model" },
    { t: "p", html: "\"<strong>Don't communicate by sharing memory; share memory by communicating.</strong>\" Channels transfer both data and <em>happens-before</em> ordering: a send happens before the corresponding receive completes, so whatever you wrote before the send is visible after the receive. Mutex unlock happens before a later lock. Without one of these synchronisation points, there is <strong>no</strong> guarantee another goroutine ever sees your write." },
    { t: "p", html: "Rule of thumb: use <strong>channels</strong> to pass ownership of data and to orchestrate pipelines; use a <strong>mutex</strong> to protect a single piece of state that many goroutines touch. Reaching for a channel where a mutex would do is a common over-correction." }
  ],
  summary: [
    "Goroutines are runtime-scheduled, ~2 KB to start, and multiplexed onto threads, hundreds of thousands are fine.",
    "Unbuffered channels synchronise (rendezvous); buffered ones decouple until full.",
    "Memorise the nil/open/closed table: send-on-closed panics, receive-on-closed returns zero + ok=false, nil blocks forever.",
    "`select` takes whichever case is ready (random among ties); `default` makes it non-blocking; `time.After` and `ctx.Done()` are the standard cases.",
    "WaitGroup to wait, worker pools or a semaphore channel to bound concurrency, errgroup for fan-out with cancellation.",
    "Mutex/atomics for shared state; always validate with `go test -race`.",
    "Context carries cancellation and deadlines down the call tree, first parameter, always `defer cancel()`.",
    "Channels and mutexes are also the memory model: without them, cross-goroutine visibility is undefined."
  ],
  quiz: [
    { q: "Sending on a closed channel does what?",
      options: ["Returns an error", "Blocks forever", "Panics", "Is silently dropped"],
      answer: 2,
      explain: "It panics. Only the sender should close, which is how you avoid the situation." },
    { q: "`ch := make(chan int)` then `ch <- 1` in the same goroutine, with no receiver?",
      options: ["Works, buffered by default", "Deadlock: 'all goroutines are asleep'", "Returns immediately", "Panics on close"],
      answer: 1,
      explain: "An unbuffered send blocks until a receiver is ready; with no other goroutine, the runtime detects the deadlock and crashes." },
    { q: "Two `select` cases are ready simultaneously. Which runs?",
      options: ["The first in source order", "The last", "One chosen uniformly at random", "Both"],
      answer: 2,
      explain: "Randomised selection prevents starvation and stops code depending on case order." },
    { q: "Why `defer cancel()` after `context.WithTimeout`?",
      options: ["To cancel the operation", "To release the timer and associated resources even on the success path", "It's optional style", "To propagate to the parent"],
      answer: 1,
      explain: "Not calling cancel leaks the timer and the child context until the deadline fires. `go vet` flags the omission." },
    { q: "Receiving from a `nil` channel inside a select?",
      options: ["Panics", "Returns the zero value", "Blocks forever, so that case is effectively disabled", "Compile error"],
      answer: 2,
      explain: "A useful idiom: nil out a channel variable to switch its select case off." }
  ]
},

/* ───────────────────────────── 15 ───────────────────────────── */
{
  id: "runtime-internals",
  level: "Advanced",
  icon: "🔬",
  title: "Runtime Internals: Scheduler, GC & Allocator",
  minutes: 26,
  blurb: "The GMP model, tri-colour concurrent GC, the size-class allocator, and the knobs that matter.",
  blocks: [
    { t: "h", text: "Scheduler" },
    { t: "p", html: "Go's scheduler is an <strong>M:N</strong> design. Many goroutines run on a few OS threads. Three entities make that work:" },
    { t: "table", head: ["", "What it is", "How many"],
      rows: [
        ["<strong>G</strong>, goroutine", "A task: stack, program counter, status. Cheap, ~2 KB", "Thousands to millions"],
        ["<strong>M</strong>, machine", "An actual OS thread. Only an M executes code", "Grows on demand (default cap 10,000)"],
        ["<strong>P</strong>, processor", "A scheduling context plus a local run queue. <em>A token permitting Go code to run</em>", "<code>GOMAXPROCS</code>, default = NumCPU"]
      ]
    },
    { t: "diagram", id: "gmp" },
    { t: "code", title: "How work flows", code:
`             ┌──── global run queue (overflow + stolen work) ────┐
             │                                                    │
   ┌─────────▼──────────┐   ┌────────────────────┐   ┌───────────▼────────┐
   │  P0  localq[256]   │   │  P1  localq[256]   │   │  P2  localq[256]   │
   │  runnext: G        │   │  runnext: G        │   │  runnext: G        │
   └─────────┬──────────┘   └─────────┬──────────┘   └─────────┬──────────┘
          M0 (thread)             M1 (thread)             M2 (thread)
             │                        │                        │
       running G                running G               idle -> STEALS
                                                        half of P0's queue

 Rules the runtime follows:
  • Each P has a lock-free 256-slot local queue plus a 1-slot "runnext" fast path
  • Empty local queue -> check global queue -> poll the network -> WORK STEALING:
    take half of a random other P's queue
  • A goroutine blocking on a channel/mutex/sleep parks: the M keeps its P and
    picks up the next G. Nothing kernel-level blocks. This is the whole trick.
  • A goroutine blocking in a SYSCALL: after ~20 us the P is HANDED OFF to
    another M so the remaining goroutines keep running
  • PREEMPTION: since Go 1.14 it is asynchronous and signal-based, a goroutine
    in a tight loop with no function calls is still preempted after ~10 ms`
    },
    { t: "note", kind: "deep", title: "Why goroutines look free", html: "Creating a goroutine is a <em>user-space</em> allocation (~2 KB stack + a small struct) and a queue push: tens of nanoseconds. A context switch between goroutines is also user space, save a few registers, swap stacks, roughly <strong>100× cheaper</strong> than an OS thread switch, which requires a kernel trap, scheduler work, and TLB pressure. And blocking on a channel never blocks a thread." },
    { t: "code", title: "Watch the scheduler live", code:
`GODEBUG=schedtrace=1000 ./app        # scheduler state every 1000 ms
GODEBUG=scheddetail=1,schedtrace=1000 ./app   # per-P, per-M breakdown
# Output: gomaxprocs=8 idleprocs=5 threads=11 spinningthreads=1 runqueue=0 [0 1 0 ...]`
    },

    { t: "h", text: "Garbage collector" },
    { t: "p", html: "Go's GC is a <strong>concurrent, tri-colour, mark-and-sweep</strong> collector with a <em>write barrier</em>. It is <strong>non-generational</strong> and <strong>non-compacting</strong>: objects never move, which keeps interior pointers valid and the design simple, at the cost of some fragmentation." },
    { t: "diagram", id: "gc" },
    { t: "code", title: "Tri-colour marking", code:
` WHITE  = not yet proven reachable (candidate for collection)
 GREY   = reachable, but its children haven't been scanned yet
 BLACK  = reachable, and fully scanned

 1. STW #1 (~10-100 us): enable the write barrier, scan goroutine stacks
    and globals; everything found becomes GREY. All else is WHITE.
 2. MARK (concurrent, alongside your code): dedicated mark workers take
    ~25% of CPU. Pop a GREY object, blacken it, grey its white children.
    Repeat until no GREY objects remain.
       The WRITE BARRIER is the correctness glue: if your program stores a
       pointer to a WHITE object into a BLACK one while marking is running,
       the barrier greys it. Without this, live data would be freed.
 3. STW #2 (~10-100 us): mark termination.
 4. SWEEP (concurrent, lazy): WHITE objects are unreachable; their spans are
    reclaimed incrementally as allocation demands memory. No pause.

 Total stop-the-world time: well under a millisecond, and crucially it is
 INDEPENDENT of heap size, a 100 GB heap pauses about as briefly as a 100 MB
 one. GC *throughput* cost scales with the number of live POINTERS, not bytes.`
    },
    { t: "h", text: "GC pacer" },
    { t: "p", html: "The garbage collector does not run on a timer. It starts when the heap has grown by a fraction of the live data. <code>GOGC=100</code> means \"collect after the heap has doubled\". <code>GOMEMLIMIT</code> gives it a memory budget so it collects harder instead of using more RAM than the container allows." },
    { t: "code", title: "GOGC and GOMEMLIMIT", code:
`# GOGC (default 100) = grow the heap by this % of live data before collecting.
# Live heap 100 MB, GOGC=100 -> next GC at ~200 MB.
GOGC=200 ./app     # collect half as often: less CPU, ~2x the memory
GOGC=50  ./app     # collect twice as often: more CPU, less memory
GOGC=off ./app     # never collect (benchmarks and short batch jobs only)

# GOMEMLIMIT (Go 1.19+) = a SOFT memory ceiling. The GC becomes more
# aggressive as you approach it. This is the fix for container OOM-kills:
GOMEMLIMIT=900MiB ./app     # in a 1 GiB container, leaving headroom
# Common production combo: GOGC=off + GOMEMLIMIT set, so the GC runs
# purely as a function of your memory budget.

# Observe
GODEBUG=gctrace=1 ./app
# gc 7 @0.251s 3%: 0.012+1.8+0.009 ms clock, 0.098+0.42/1.7/0+0.079 ms cpu,
#     12->13->6 MB, 13 MB goal, 8 P
#      ^STW ^conc mark ^STW       ^heap before->peak->live after`
    },
    { t: "code", title: "From inside the program", code:
`var ms runtime.MemStats
runtime.ReadMemStats(&ms)
fmt.Printf("live heap: %v MB, total GCs: %v, pause total: %v\\n",
    ms.HeapAlloc/1024/1024, ms.NumGC, time.Duration(ms.PauseTotalNs))

debug.SetGCPercent(200)             // GOGC at runtime
debug.SetMemoryLimit(900 << 20)     // GOMEMLIMIT at runtime
runtime.GC()                        // force a blocking collection (tests only)
debug.FreeOSMemory()                // return freed pages to the OS now`
    },

    { t: "h", text: "Allocator" },
    { t: "p", html: "The allocator hands out memory in fixed size classes so a small object does not search a general heap. Each processor has a private cache, so the common path takes no lock. You do not call <code>malloc</code>. Making a value that escapes the function is what asks the allocator for memory." },
    { t: "code", title: "Three tiers, no lock on the fast path", code:
`  mcache   per-P, LOCK-FREE. The fast path: nearly every small allocation
     │     is served here in a few nanoseconds, no atomics at all.
     ▼
  mcentral per SIZE CLASS, shared, lock-protected. Refills mcaches with spans.
     │
     ▼
  mheap    global. Owns all memory, requests more from the OS in 64 MB arenas.

 Allocations are bucketed into ~68 SIZE CLASSES (8, 16, 24, 32, 48, 64 ... bytes).
 A request rounds UP to its class, which bounds internal waste at ~12% and makes
 free lists trivial. Memory comes in 8 KB-page "spans", each dedicated to one class.

  • TINY (<16 B, pointer-free): several combined into one 16 B block
  • SMALL (<=32 KB): size class from the per-P mcache
  • LARGE (>32 KB): straight from mheap, dedicated spans

 Each span records whether its objects contain pointers. Pointer-free spans are
 never scanned by the GC, which is why []byte is dramatically cheaper for the
 collector than []*T of the same size.`
    },
    { t: "note", kind: "tip", title: "The practical takeaway", html: "GC cost tracks the number of <strong>live pointer-containing objects</strong>, not megabytes. A 1 GB <code>[]byte</code> is nearly free to collect; 10 million small structs full of pointers is expensive. Reduce <em>allocation count</em> and <em>pointer density</em>: prefer value slices over pointer slices, embed instead of pointing, preallocate, and reuse buffers with <code>sync.Pool</code>." },

    { t: "h", text: "GC assists" },
    { t: "p", html: "Mark workers get ~25% of <code>GOMAXPROCS</code>. If your program allocates faster than they can mark, the pacer makes the <em>allocating goroutine itself</em> do mark work before its allocation is granted, a <strong>mutator assist</strong>. That is the mechanism behind the most common Go latency mystery: CPU looks fine, no stop-the-world pause is long, yet p99 latency doubles under load. The fix is almost never a GC knob; it's allocating less on the hot path." },
    { t: "code", title: "Spotting assist pressure", code:
`GODEBUG=gctrace=1 ./app
# gc 42 @18.3s 9%: 0.08+412+0.11 ms clock, 0.6+180/823/0+0.9 ms cpu, ...
#                 ^^^           ^^^^^^^^^^
#      long concurrent mark phase, and the three CPU numbers after the "+"
#      are assist / background / idle mark time. A large FIRST number means
#      your own goroutines are paying for the collection.
#      The "9%" is cumulative GC CPU since start, over ~10-15% is a smell.

# Confirm from a profile: runtime.gcAssistAlloc and runtime.gcDrain high in
# a CPU profile = assist pressure.
go tool pprof -http=:8080 http://host:6060/debug/pprof/profile?seconds=30

# Safety valve: the GC will not exceed ~50% of CPU, even when it cannot keep
# up with GOMEMLIMIT. That prevents a "death spiral" where collecting starves
# the program, but it means an impossible memory limit shows up as a service
# that is merely very slow, and then OOMs anyway. GOMEMLIMIT is a SOFT limit.

# The real fixes, in order: allocate less (preallocate, reuse, fewer pointers),
# then raise GOGC if you have memory headroom, then add cores.`
    },

    { t: "h", text: "Goroutine stacks" },
    { t: "p", html: "Each goroutine starts with a 2 KB <em>contiguous</em> stack. Every function prologue checks the stack bound; on overflow the runtime allocates a stack twice the size, copies the frames, and <strong>rewrites every pointer that referenced the old stack</strong>. That is only possible because the compiler emits precise pointer maps and Go forbids pointer arithmetic. Default maximum: 1 GB on 64-bit, infinite recursion produces \"stack overflow\", not a segfault." }
  ],
  summary: [
    "The scheduler is M:N over G (goroutine), M (OS thread), P (run-queue context, count = GOMAXPROCS).",
    "Each P has a lock-free local queue; idle Ps steal half of another's work; syscalls hand off the P so other goroutines keep running.",
    "Goroutine creation and switching happen in user space, roughly 100× cheaper than OS threads.",
    "Since 1.14 preemption is asynchronous and signal-based, so tight loops can't monopolise a P.",
    "GC is concurrent tri-colour mark-and-sweep with a write barrier; non-generational, non-compacting.",
    "Stop-the-world pauses are sub-millisecond and independent of heap size; cost scales with live pointers.",
    "GOGC sets the heap growth target (default 100%); GOMEMLIMIT (1.19+) sets a soft ceiling and prevents container OOM kills.",
    "The allocator is three-tier (mcache → mcentral → mheap) with ~68 size classes; the per-P fast path is lock-free.",
    "When allocation outruns the mark workers, your own goroutines are drafted into *mutator assists*, the usual cause of p99 latency rising with no visible pause.",
    "Observe with `GODEBUG=gctrace=1` and `GODEBUG=schedtrace=1000`.",
    "The runtime keeps moving: Swiss-table maps (1.24), cgroup-aware GOMAXPROCS (1.25), and a new mark algorithm behind `GOEXPERIMENT=greenteagc`, the *contract* (concurrent, non-moving, sub-ms pauses) is what you should design against, not the implementation."
  ],
  quiz: [
    { q: "In the GMP model, what does P represent?",
      options: ["A physical CPU core", "A scheduling context with a local run queue, a token to run Go code, count = GOMAXPROCS", "A process", "A pointer to a goroutine"],
      answer: 1,
      explain: "Ps decouple goroutines from threads. An M must hold a P to execute Go code." },
    { q: "Go's GC is best described as:",
      options: ["Generational copying", "Concurrent tri-colour mark-and-sweep, non-moving", "Reference counting", "Stop-the-world mark-compact"],
      answer: 1,
      explain: "Objects never move, there are no generations, and marking runs concurrently with your program." },
    { q: "What is the write barrier for?",
      options: ["Preventing data races in user code", "Flushing CPU caches", "Catching pointers stored into already-scanned (black) objects during concurrent marking", "Limiting allocation rate"],
      answer: 2,
      explain: "Without it, a pointer moved into a black object could leave a live white object unmarked and freed." },
    { q: "Live heap is 200 MB and GOGC=100. Roughly when does the next GC start?",
      options: ["~250 MB", "~400 MB", "~200 MB", "After a fixed 2 minutes"],
      answer: 1,
      explain: "GOGC=100 means collect when the heap has grown 100% over live data, about 400 MB." },
    { q: "Your Go service keeps getting OOM-killed in a 1 GiB container. Best first move?",
      options: ["GOGC=off", "Set GOMEMLIMIT just under the container limit", "Call runtime.GC() in a loop", "Raise GOMAXPROCS"],
      answer: 1,
      explain: "GOMEMLIMIT gives the pacer a memory budget to respect, so it collects harder instead of overshooting." }
  ]
},

/* ───────────────────────────── 16 ───────────────────────────── */
{
  id: "generics",
  level: "Advanced",
  icon: "🧬",
  title: "Generics & Type Parameters",
  minutes: 16,
  blurb: "Type parameters, constraints, inference, and the honest answer on when not to use them.",
  blocks: [
    { t: "p", html: "Generics arrived in <strong>Go 1.18</strong> (2022) after a decade of debate. They let you write one implementation that works across types <em>without</em> losing type safety or paying for runtime boxing." },

    { t: "h", text: "Type parameters" },
    { t: "p", html: "A type parameter lets one function work for many types without giving up the compiler's checks. <code>func Min[T cmp.Ordered](a, b T) T</code> means <code>T</code> can be any type that can be ordered, and both arguments must be that same type. The compiler fills in <code>T</code> from the call." },
    { t: "code", title: "Square brackets before the arguments", code:
`// T is a type parameter constrained by "any"
func Map[T, U any](in []T, f func(T) U) []U {
    out := make([]U, 0, len(in))
    for _, v := range in { out = append(out, f(v)) }
    return out
}

lengths := Map([]string{"a", "bb"}, func(s string) int { return len(s) })
// T and U are INFERRED from the arguments, no explicit instantiation needed.
nums := Map[string, int]([]string{"a"}, func(s string) int { return len(s) }) // explicit

// Generic types
type Stack[T any] struct{ items []T }

func (s *Stack[T]) Push(v T) { s.items = append(s.items, v) }
func (s *Stack[T]) Pop() (T, bool) {
    var zero T                          // how you produce a zero value of T
    if len(s.items) == 0 { return zero, false }
    v := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return v, true
}
s := &Stack[int]{}                      // instantiate with a concrete type`
    },

    { t: "h", text: "Constraints" },
    { t: "p", html: "A constraint is the interface that says which types are allowed. <code>~int</code> also allows a named type whose underlying type is <code>int</code>, such as <code>type Celsius int</code>. Without the <code>~</code>, only plain <code>int</code> matches." },
    { t: "code", title: "Type sets, not just method sets", code:
`// A constraint may list TYPES (a "type set"), using | for union and ~ for
// "any type whose underlying type is this"
type Number interface {
    ~int | ~int64 | ~float32 | ~float64
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums { total += n }   // + is allowed: every type in the set supports it
    return total
}

type Celsius float64        // underlying type float64
Sum([]Celsius{1, 2})        // works thanks to the ~ prefix

// Built-in and x/exp constraints
// any, no restriction
// comparable, supports == and != (so it can be a map key)
// cmp.Ordered, supports < <= > >= (Go 1.21 stdlib: package cmp)

func Max[T cmp.Ordered](a, b T) T { if a > b { return a }; return b }

func Keys[K comparable, V any](m map[K]V) []K {
    out := make([]K, 0, len(m))
    for k := range m { out = append(out, k) }
    return out
}

// Methods are still allowed in constraints, and can be mixed with type sets
type Stringish interface { ~string; String() string }`
    },

    { t: "h", text: "Generic standard library" },
    { t: "p", html: "<code>slices</code> and <code>maps</code> are generic functions for the operations people used to copy by hand: sort, contains, clone, delete. Prefer them over a one-off loop when they say what you mean." },
    { t: "code", title: "slices, maps, cmp, delete your utility package", code:
`import ("slices"; "maps"; "cmp")

slices.Contains(s, v)
slices.Index(s, v)                       // -1 if absent
slices.Sort(s)                            // for cmp.Ordered element types
slices.SortFunc(people, func(a, b Person) int { return cmp.Compare(a.Age, b.Age) })
slices.Reverse(s)
slices.Max(s); slices.Min(s)
slices.Clone(s)                           // the safe copy you keep writing by hand
slices.Equal(a, b)
slices.BinarySearch(sortedS, v)
slices.Insert(s, i, vals...); slices.Delete(s, i, j)
slices.Compact(s)                         // dedupe adjacent equal elements

maps.Keys(m); maps.Values(m)              // iterators in 1.23+
maps.Clone(m); maps.Equal(a, b)

cmp.Compare(a, b)                         // -1, 0, +1
cmp.Or(userVal, envVal, "default")        // first non-zero value`
    },

    { t: "h", text: "Limits" },
    { t: "p", html: "A method cannot introduce its own type parameters. If you need that, write a function that takes the value as an argument. Generics are for one algorithm over many types. Interfaces are for many types with different behaviour." },
    { t: "code", title: "What you cannot do", code:
`// 1. NO generic methods. Type parameters belong to the type or the function,
//    so you cannot add a new one on a method:
// func (s *Stack[T]) MapTo[U any](f func(T) U) []U  // ILLEGAL
//    Workaround: a package-level generic function taking the receiver.

// 2. No specialisation, you can't write a different body for one T.

// 3. No structural constraints: you cannot say "any struct with a Name field".
//    Require a getter method instead.

// 4. Type switching on T itself is not allowed; switch on a value: any.

// 5. Instantiation is NOT free at build time: the compiler GC-shapes
//    implementations (one per pointer-shape / underlying layout), so heavy
//    generic code grows binaries and build times.`
    },
    { t: "note", kind: "warn", title: "When NOT to use generics", html: "<strong>Do not</strong> reach for a type parameter when an <code>interface</code> with a method already expresses the idea, <code>io.Writer</code> needs no generics. Don't genericise a function that only ever has one instantiation. The official guidance is: write the concrete version first, and introduce type parameters only when you're genuinely duplicating a body for several types. Generics are for <em>container types and algorithms over them</em>, not for abstraction in general." },
    { t: "p", html: "<strong>Interface vs type parameter, decided:</strong> if you need to call <em>behaviour</em> that each type implements differently → interface. If you need to work with <em>values of a type you don't care about</em> while keeping the exact type (containers, sort, min/max, map/filter) → type parameter." }
  ],
  summary: [
    "Generics landed in Go 1.18: `func F[T any](...)` and `type S[T any] struct{...}`.",
    "Constraints are interfaces that may list a *type set*: `~int | ~float64`; `~` means \"underlying type\".",
    "Built-ins: `any`, `comparable`; plus `cmp.Ordered` from the standard library.",
    "`var zero T` is how you produce T's zero value inside generic code.",
    "Type arguments are usually inferred from the call, explicit instantiation is rarely needed.",
    "`slices`, `maps` and `cmp` (1.21+) replace most hand-written utility helpers.",
    "No generic methods, no specialisation, no structural constraints.",
    "Prefer an interface when you need differing behaviour; use type parameters for containers and algorithms."
  ],
  quiz: [
    { q: "Which Go version introduced generics?",
      options: ["1.11", "1.16", "1.18", "1.21"],
      answer: 2,
      explain: "Go 1.18, March 2022. `slices`/`maps`/`cmp` followed in 1.21." },
    { q: "In `~int | ~string`, what does `~` mean?",
      options: ["Approximately", "Pointer to", "Any type whose underlying type is int or string (so named types qualify)", "Negation"],
      answer: 2,
      explain: "Without `~`, `type Celsius float64` would not satisfy a `float64` constraint." },
    { q: "Which constraint allows `<` and `>`?",
      options: ["`any`", "`comparable`", "`cmp.Ordered`", "`sort.Interface`"],
      answer: 2,
      explain: "`comparable` only covers == and != (map-key capable). Ordering needs `cmp.Ordered`." },
    { q: "How do you get the zero value of a type parameter T?",
      options: ["`nil`", "`T{}`", "`var zero T`", "`new(T)`"],
      answer: 2,
      explain: "`var zero T` works for every T. `T{}` only compiles for composite types; `new(T)` gives a *T." },
    { q: "Which is NOT possible with Go generics?",
      options: ["A generic struct type", "A method with its own new type parameter", "A constraint combining a type set and a method", "Inferring type arguments from the call"],
      answer: 1,
      explain: "Methods cannot introduce type parameters. Use a package-level generic function that takes the receiver." }
  ]
},

/* ───────────────────────────── 17 ───────────────────────────── */
{
  id: "iterators",
  level: "Advanced",
  icon: "🔁",
  title: "Iterators & range-over-func",
  minutes: 16,
  blurb: "Go 1.23's range-over-function: iter.Seq, push vs pull, and the modern iterator-shaped stdlib.",
  blocks: [
    { t: "p", html: "Before Go 1.23 there was no standard way to iterate over something you wrote. Everyone invented their own: return a slice (allocates everything), expose a <code>Next()/Scan()</code> cursor (stateful and easy to misuse), or take a callback (can't <code>break</code>). <strong>Go 1.23 made functions rangeable</strong>, so a custom collection iterates with the same <code>for … range</code> you already use, lazily, with working <code>break</code>, <code>continue</code> and <code>return</code>." },

    { t: "h", text: "range" },
    { t: "p", html: "Since Go 1.23, <code>range</code> can loop over a function, not only a slice or a map. The function is called with a <code>yield</code> callback. Returning false from <code>yield</code> means the caller stopped, so the iterator should return." },
    { t: "code", title: "That's the whole language change", code:
`// Package iter just names these shapes; they are ordinary function types.
type Seq[V any]     func(yield func(V) bool)
type Seq2[K, V any] func(yield func(K, V) bool)

// A function with either shape can be ranged over:
func Count(n int) iter.Seq[int] {
    return func(yield func(int) bool) {
        for i := range n {
            if !yield(i) {      // yield returns FALSE when the loop stopped
                return          // ...and you MUST return immediately
            }
        }
    }
}

for v := range Count(5) { fmt.Print(v) }      // 01234
for v := range Count(5) {
    if v == 2 { break }                        // break works: yield returns false
    fmt.Print(v)                               // 01
}

// Seq2 gives you two values, like a map or a slice does:
func Enumerate[V any](s []V) iter.Seq2[int, V] {
    return func(yield func(int, V) bool) {
        for i, v := range s { if !yield(i, v) { return } }
    }
}
for i, v := range Enumerate(names) { fmt.Println(i, v) }

// A third form exists for a loop with no values: func(yield func() bool).`
    },
    { t: "note", kind: "warn", title: "The one rule that matters", html: "<strong>Always check <code>yield</code>'s return value and stop when it's false.</strong> It returns false when the consumer did <code>break</code>, <code>return</code>, <code>goto</code>, or panicked. Ignoring it and calling <code>yield</code> again panics with \"range function continued iteration after loop body returned false\", the runtime protects the consumer from your bug, but only after the fact. Also never call <code>yield</code> concurrently from multiple goroutines." },

    { t: "h", text: "Iterators" },
    { t: "p", html: "An iterator produces one value at a time, so a caller can stop early and you do not build a whole slice first. This table compares that with the older ways of walking a collection." },
    { t: "table", head: ["Approach", "Lazy?", "`break` works?", "Allocates", "Composable"],
      rows: [
        ["Return <code>[]T</code>", "no, builds everything", "n/a", "the whole slice", "no"],
        ["<code>Next()</code>/<code>Err()</code> cursor", "yes", "yes", "little", "awkward"],
        ["Callback <code>ForEach(f)</code>", "yes", "<strong>no</strong>", "little", "no"],
        ["<code>iter.Seq</code> (range-over-func)", "yes", "<strong>yes</strong>", "little", "<strong>yes</strong>"]
      ]
    },
    { t: "code", title: "Streaming a database query without a slice", code:
`// Lazily yields rows; the caller can stop early and nothing is buffered.
// Note the error problem: a Seq has no place to report failure, so capture
// it and expose it afterwards (or use Seq2[T, error]).
func (s *Store) Users(ctx context.Context) (iter.Seq[User], func() error) {
    var err error
    seq := func(yield func(User) bool) {
        rows, qerr := s.db.QueryContext(ctx, "SELECT id, name FROM users")
        if qerr != nil { err = qerr; return }
        defer rows.Close()                 // runs even if the caller breaks
        for rows.Next() {
            var u User
            if serr := rows.Scan(&u.ID, &u.Name); serr != nil { err = serr; return }
            if !yield(u) { return }        // early exit: deferred Close still fires
        }
        err = rows.Err()
    }
    return seq, func() error { return err }
}

users, errFn := store.Users(ctx)
for u := range users {
    if u.Name == "" { break }
    fmt.Println(u.ID)
}
if err := errFn(); err != nil { return err }

// The common alternative, and arguably clearer: iter.Seq2[User, error]
//   for u, err := range store.Users(ctx) { if err != nil { return err }; … }`
    },

    { t: "h", text: "Iterator standard library" },
    { t: "p", html: "<code>slices.Values</code>, <code>maps.Keys</code>, and similar functions return an iterator instead of a new slice. You range over them. <code>slices.Collect</code> pulls an iterator back into a slice when you need one." },
    { t: "code", title: "slices, maps, strings, sql, all of it", code:
`import ("iter"; "slices"; "maps"; "strings")

// slices: slice -> iterator, and iterator -> slice
for i, v := range slices.All(s)   { }       // Seq2[int, V]
for v := range slices.Values(s)   { }       // Seq[V]
for v := range slices.Backward(s) { }       // reverse, with indexes
s2 := slices.Collect(seq)                   // Seq -> []V
s3 := slices.Sorted(maps.Keys(m))           // THE idiom for ordered map iteration
s4 := slices.SortedFunc(seq, cmp)
s5 := slices.AppendSeq(dst, seq)
chunks := slices.Chunk(s, 100)              // Seq[[]V], batching, 1.23+

// maps: now return iterators, not slices
for k := range maps.Keys(m)     { }
for v := range maps.Values(m)   { }
for k, v := range maps.All(m)   { }
m2 := maps.Collect(seq2)
maps.Insert(m, seq2)

// strings (1.24): split without allocating a []string
for line := range strings.Lines(text)        { }
for f := range strings.FieldsSeq(text)       { }
for part := range strings.SplitSeq(csv, ",") { }

// Also: bufio.Scanner-free line reading, sql.Rows, regexp and go/ast
// gained Seq-returning helpers. Prefer them on hot paths, they skip the
// intermediate slice entirely.`
    },
    { t: "code", title: "Composing your own pipeline, generics plus iterators", code:
`func Filter[V any](seq iter.Seq[V], keep func(V) bool) iter.Seq[V] {
    return func(yield func(V) bool) {
        for v := range seq {
            if keep(v) && !yield(v) { return }
        }
    }
}

func Map[A, B any](seq iter.Seq[A], f func(A) B) iter.Seq[B] {
    return func(yield func(B) bool) {
        for a := range seq { if !yield(f(a)) { return } }
    }
}

func Take[V any](seq iter.Seq[V], n int) iter.Seq[V] {
    return func(yield func(V) bool) {
        i := 0
        for v := range seq {
            if i >= n { return }
            if !yield(v) { return }
            i++
        }
    }
}

// Lazy, allocation-free, short-circuiting, nothing downstream is computed
// for records the pipeline never reaches.
names := slices.Collect(Take(Map(Filter(users, isActive), User.DisplayName), 10))`
    },

    { t: "h", text: "Push and pull" },
    { t: "p", html: "A push iterator calls you for each value. <code>iter.Pull</code> turns that around so you call <code>next</code> when you want the next value. Always <code>defer stop()</code> on a pull iterator, or the goroutine behind it stays alive." },
    { t: "code", title: "iter.Pull when you need to drive the iteration yourself", code:
`// A Seq is a PUSH iterator: it calls you. Some algorithms need to PULL, 
// merging two sorted streams, or peeking one element ahead.
next, stop := iter.Pull(seq)
defer stop()                          // ALWAYS: it releases the coroutine
for {
    v, ok := next()
    if !ok { break }
    use(v)
}

// Merge two sorted sequences, impossible with push iterators alone:
func Merge(a, b iter.Seq[int]) iter.Seq[int] {
    return func(yield func(int) bool) {
        na, stopA := iter.Pull(a); defer stopA()
        nb, stopB := iter.Pull(b); defer stopB()
        va, oka := na()
        vb, okb := nb()
        for oka && okb {
            if va <= vb { if !yield(va) { return }; va, oka = na() } else
                         { if !yield(vb) { return }; vb, okb = nb() }
        }
        for oka { if !yield(va) { return }; va, oka = na() }
        for okb { if !yield(vb) { return }; vb, okb = nb() }
    }
}
// iter.Pull is implemented with the runtime's coroutine support, so it is
// cheap, but NOT free. Prefer plain range when push is enough.`
    },
    { t: "note", kind: "tip", title: "When to write an iterator, and when not to", html: "<strong>Do</strong> return an <code>iter.Seq</code> when the sequence is large, lazy, expensive to materialise, or infinite; when the caller will often stop early; or when you're writing reusable combinators. <strong>Don't</strong> bother when the data is a small slice you already have in memory, <code>[]T</code> is simpler, indexable, re-iterable and sortable. An iterator is single-use and opaque. And remember your minimum Go version: <code>range</code> over a function needs <code>go 1.23</code> in <code>go.mod</code>." }
  ],
  summary: [
    "Go 1.23 lets `for … range` consume a function: `func(yield func(V) bool)` (`iter.Seq`) or the two-value `iter.Seq2`.",
    "`yield` returns false when the consumer breaks/returns, check it and return immediately, or the runtime panics.",
    "Iterators are lazy, allocation-light, short-circuitable and composable, unlike returning a slice or taking a callback.",
    "A `Seq` has nowhere to put an error: expose a trailing `func() error`, or use `Seq2[T, error]`.",
    "`slices.All/Values/Backward/Collect/Sorted/Chunk`, `maps.Keys/Values/All/Collect` and (1.24) `strings.Lines/SplitSeq/FieldsSeq` are the new vocabulary.",
    "`slices.Sorted(maps.Keys(m))` is now the one-liner for deterministic map iteration.",
    "Generics + iterators give you lazy Filter/Map/Take pipelines in a few lines each.",
    "`iter.Pull` converts a push iterator into `next()`/`stop()` for merge-style algorithms, always `defer stop()`.",
    "Prefer a plain `[]T` for small in-memory data; an iterator is single-use and not indexable."
  ],
  quiz: [
    { q: "What is the signature `range` accepts for a single-value iterator?",
      options: ["`func() (V, bool)`", "`func(yield func(V) bool)`", "`func(chan V)`", "`func() []V`"],
      answer: 1,
      explain: "That's `iter.Seq[V]`. The two-value form is `func(yield func(K, V) bool)`, `iter.Seq2`." },
    { q: "Your iterator ignores `yield`'s return value and keeps going after the caller `break`s. What happens?",
      options: ["Nothing, the extra values are discarded", "A runtime panic: range function continued iteration after the loop body returned false", "A compile error", "The loop silently restarts"],
      answer: 1,
      explain: "A false return means stop. The runtime panics on the next yield to surface the bug rather than corrupting the consumer's control flow." },
    { q: "Deterministic iteration over a map's keys, in modern Go?",
      options: ["`for k := range m`, order is stable now", "`slices.Sorted(maps.Keys(m))`", "`maps.Keys(m)` alone is sorted", "`sort.Map(m)`"],
      answer: 1,
      explain: "Map order is still randomised. `maps.Keys` returns an iterator; `slices.Sorted` collects and sorts it in one call." },
    { q: "Why does `iter.Pull` exist when `range` already works?",
      options: ["It's faster", "Some algorithms must drive iteration themselves, merging two sorted sequences or peeking ahead, which a push iterator can't express", "It's the only way to handle errors", "For backwards compatibility with Go 1.21"],
      answer: 1,
      explain: "`iter.Pull` turns a push `Seq` into `next()`/`stop()`. Always `defer stop()` to release the underlying coroutine." },
    { q: "When is returning `[]T` still the better API?",
      options: ["Never, iterators are always better", "When the data is small and already in memory, and callers want indexing, re-iteration or sorting", "When the sequence is infinite", "When the caller usually stops early"],
      answer: 1,
      explain: "An iterator is single-use, opaque and not indexable. Laziness pays off for large, expensive or infinite sequences, not for a 10-element slice." }
  ]
}

]);
