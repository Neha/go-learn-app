/* Complete, compiling programs for the "▶ Run" button.
   Keyed by "<moduleId>|<code block title>". Each one is self-contained, vet-clean
   (the Playground runs go vet), and deterministic where practical. */
window.RUNNABLE = {

"variables-constants|The zero value as a design tool":
`package main

import (
	"fmt"
	"sync"
)

type Counter struct {
	mu    sync.Mutex // zero value is a ready-to-use unlocked mutex
	count int
}

func main() {
	var c Counter // no constructor needed
	c.mu.Lock()
	c.count++
	c.mu.Unlock()
	fmt.Println("count:", c.count)

	var s []int // nil slice
	fmt.Println("nil slice:", s == nil, "len", len(s), "cap", cap(s))
	s = append(s, 1, 2) // append works on a nil slice
	fmt.Println("after append:", s)

	var m map[string]int // nil map
	fmt.Println("read from a nil map:", m["missing"])
	// m["k"] = 1 // uncomment: panic: assignment to entry in nil map
	m = make(map[string]int)
	m["k"] = 1
	fmt.Println("after make:", m)

	var (
		i   int
		f   float64
		b   bool
		str string
		p   *int
	)
	fmt.Printf("zero values: %d %.1f %t %q %v", i, f, b, str, p)
	fmt.Println()
}
`,

"data-types|Bytes vs runes — the thing everyone gets wrong once":
`package main

import (
	"fmt"
	"strings"
	"unicode/utf8"
)

func main() {
	s := "Héllo, 世界"

	fmt.Println("len(s) in BYTES:        ", len(s))
	fmt.Println("RuneCountInString:      ", utf8.RuneCountInString(s))
	fmt.Println("s[1] is one byte:       ", s[1])

	for i, r := range s { // range decodes UTF-8
		fmt.Printf("%d:%c  ", i, r)
	}
	fmt.Println()

	r := []rune(s) // now indexable by character
	fmt.Println("r[7]:", string(r[7]), " total runes:", len(r))

	b := []byte(s) // strings are immutable; rebuild instead
	b[0] = 'h'
	fmt.Println("rebuilt:", string(b))

	var sb strings.Builder // the only sane way to concatenate in a loop
	for i := 0; i < 5; i++ {
		sb.WriteString("x")
	}
	fmt.Println("builder:", sb.String())
}
`,

"printing-fmt|Width, precision, flags — and the quick mental model":
`package main

import "fmt"

type User struct {
	Name string
	Age  int
}

type Temp float64

// Convert to the underlying type — formatting the receiver itself would recurse.
func (t Temp) String() string { return fmt.Sprintf("%.1f°C", float64(t)) }

func main() {
	u := User{"Ada", 36}
	fmt.Printf("%%v   %v\\n", u)
	fmt.Printf("%%+v  %+v\\n", u)
	fmt.Printf("%%#v  %#v\\n", u)
	fmt.Printf("%%T   %T\\n", u)

	fmt.Printf("|%6d|%-6d|%06d|%+d|\\n", 42, 42, 42, 42)
	fmt.Printf("|%8.3f|%e|%g|\\n", 3.14159, 3.14159, 3.14159)
	fmt.Printf("%q  %c  %U\\n", "hi", 'A', 'A')
	fmt.Printf("%x %X %#x  |% x|\\n", 255, 255, 255, []byte("hi"))
	fmt.Printf("%v  %v\\n", map[string]int{"b": 2, "a": 1}, []int{1, 2})

	fmt.Println(Temp(21.5)) // Stringer is used automatically

	// Print vs Println spacing
	fmt.Print("a", "b", 1, 2, "\\n")
	fmt.Println("a", "b", 1, 2)
}
`,

"control-flow|Runs when the function returns, whatever happens":
`package main

import "fmt"

func lifo() {
	defer fmt.Println("1 — pushed first, runs LAST")
	defer fmt.Println("2")
	defer fmt.Println("3 — pushed last, runs FIRST")
	fmt.Println("function body")
}

func arguments() {
	i := 0
	defer fmt.Println("evaluated at the defer statement:", i)
	defer func() { fmt.Println("read later, inside a closure:", i) }()
	i++
}

func namedResult() (msg string) {
	defer func() { msg = "overwritten by the deferred func" }()
	return "returned value"
}

func main() {
	lifo()
	fmt.Println("---")
	arguments()
	fmt.Println("---")
	fmt.Println(namedResult())
}
`,

"functions|The captured variable lives on":
`package main

import "fmt"

func counter() func() int {
	count := 0 // escapes to the heap: it outlives this call
	return func() int {
		count++
		return count
	}
}

func main() {
	c := counter()
	c2 := counter()

	fmt.Println(c(), c(), c()) // 1 2 3 — same variable
	fmt.Println(c2())          // 1     — independent state

	// Go 1.22+: every iteration gets a FRESH loop variable
	funcs := make([]func() int, 0, 3)
	for i := range 3 {
		funcs = append(funcs, func() int { return i })
	}
	for _, f := range funcs {
		fmt.Print(f(), " ")
	}
	fmt.Println("  <- before Go 1.22 this printed 3 3 3")
}
`,

"collections|The aliasing bug, demonstrated":
`package main

import (
	"fmt"
	"slices"
)

func main() {
	a := []int{1, 2, 3, 4, 5}
	b := a[1:3] // shares a's backing array
	fmt.Println("a:", a, " b:", b, " len", len(b), "cap", cap(b))

	b[0] = 99
	fmt.Println("b[0] = 99        -> a:", a)

	b = append(b, 100) // len 3, cap 4: writes into a[3]
	b = append(b, 200) // len 4, cap 4: writes into a[4]
	fmt.Println("two appends fit  -> a:", a, " b:", b)

	b = append(b, 300) // len 5 > cap 4: NEW array, copy, a is detached
	b[0] = -1
	fmt.Println("growth detached  -> a:", a, " b:", b)

	safe := slices.Clone(a[1:3]) // the fix when you need isolation
	safe[0] = 0
	fmt.Println("clone is its own -> a:", a, " safe:", safe)
}
`,

"pointers-memory|Value vs pointer receivers and parameters":
`package main

import "fmt"

type Counter struct{ n int }

func (c Counter) IncVal()  { c.n++ } // operates on a COPY
func (c *Counter) IncPtr() { c.n++ } // mutates the original

func addItem(s []int)         { s = append(s, 99) }     // caller sees nothing
func addItemPtr(s *[]int)     { *s = append(*s, 99) }   // caller sees it
func addItemRet(s []int) []int { return append(s, 99) } // idiomatic

func main() {
	c := Counter{}
	c.IncVal()
	fmt.Println("after IncVal (copy):   ", c.n)
	c.IncPtr() // Go takes &c for you
	fmt.Println("after IncPtr (pointer):", c.n)

	s := []int{1, 2, 3}
	addItem(s)
	fmt.Println("after addItem:    ", s)
	addItemPtr(&s)
	fmt.Println("after addItemPtr: ", s)
	s = addItemRet(s)
	fmt.Println("after addItemRet: ", s)
}
`,

"methods-interfaces|The nil-interface trap — read this twice":
`package main

import "fmt"

type MyErr struct{}

func (e *MyErr) Error() string { return "boom" }

func bad() error {
	var p *MyErr // a nil POINTER
	return p     // boxed: type word = *MyErr, data word = nil
}

func good() error {
	return nil // both words nil
}

func main() {
	if err := bad(); err != nil {
		fmt.Printf("bad():  err != nil is TRUE  (type=%T, value=%v)\\n", err, err)
	}
	if err := good(); err == nil {
		fmt.Println("good(): err == nil, as expected")
	}

	// An interface is nil only when BOTH words are nil.
	var iface error
	fmt.Println("declared but unassigned:", iface == nil)
}
`,

"errors|%w wraps; errors.Is and errors.As unwrap":
`package main

import (
	"errors"
	"fmt"
	"os"
)

var ErrNotFound = errors.New("not found")

type ValidationError struct{ Field string }

func (e *ValidationError) Error() string { return "invalid field " + e.Field }

func find(id int) error {
	if id <= 0 {
		return fmt.Errorf("finding user %d: %w", id, ErrNotFound)
	}
	return nil
}

func validate() error {
	return fmt.Errorf("validating request: %w", &ValidationError{Field: "email"})
}

func main() {
	err := find(0)
	fmt.Println("message:                ", err)
	fmt.Println("errors.Is(ErrNotFound): ", errors.Is(err, ErrNotFound))
	fmt.Println("== across the wrap:     ", err == ErrNotFound, "<- why you need errors.Is")

	var ve *ValidationError
	if err := validate(); errors.As(err, &ve) {
		fmt.Println("errors.As extracted:    ", ve.Field)
	}

	joined := errors.Join(ErrNotFound, os.ErrPermission)
	fmt.Println("joined matches both:    ",
		errors.Is(joined, ErrNotFound), errors.Is(joined, os.ErrPermission))
}
`,

"concurrency|WaitGroup: wait for N goroutines":
`package main

import (
	"fmt"
	"sort"
	"sync"
)

func main() {
	urls := []string{"alpha", "beta", "gamma", "delta"}
	results := make([]string, len(urls))

	var wg sync.WaitGroup
	for i, u := range urls {
		wg.Add(1) // BEFORE starting the goroutine
		go func() {
			defer wg.Done()
			// each goroutine writes its own index: no lock needed
			results[i] = "fetched " + u
		}()
	}
	wg.Wait()

	sort.Strings(results) // goroutines finish in any order
	for _, r := range results {
		fmt.Println(r)
	}

	// Go 1.25+ removes the Add/Done bookkeeping entirely:
	//   var wg sync.WaitGroup
	//   wg.Go(func() { fetch(u) })
	//   wg.Wait()
	fmt.Println("all done")
}
`,

"concurrency|The concurrency switch statement":
`package main

import (
	"context"
	"fmt"
	"time"
)

func main() {
	// 1. a timeout that fires
	slow := make(chan string)
	select {
	case v := <-slow:
		fmt.Println("got", v)
	case <-time.After(50 * time.Millisecond):
		fmt.Println("timed out, as expected")
	}

	// 2. data that wins the race
	fast := make(chan string, 1)
	fast <- "ready"
	select {
	case v := <-fast:
		fmt.Println("received:", v)
	case <-time.After(time.Second):
		fmt.Println("not reached")
	}

	// 3. cancellation
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	select {
	case <-ctx.Done():
		fmt.Println("cancelled:", ctx.Err())
	default:
		fmt.Println("not reached")
	}

	// 4. default makes select non-blocking (load shedding)
	queue := make(chan int, 1)
	queue <- 1
	select {
	case queue <- 2:
		fmt.Println("enqueued")
	default:
		fmt.Println("queue full — shed the request instead of blocking")
	}

	// 5. a closed channel is always ready
	done := make(chan struct{})
	close(done)
	_, ok := <-done
	fmt.Println("receive from a closed channel, ok =", ok)
}
`,

"concurrency|Worker pool: bounded concurrency":
`package main

import (
	"fmt"
	"sort"
	"sync"
)

func main() {
	const workers = 3
	jobs := make(chan int, 10)
	results := make(chan string, 10)

	var wg sync.WaitGroup
	for w := 1; w <= workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := range jobs { // drains until jobs is closed
				results <- fmt.Sprintf("job %d squared = %d", j, j*j)
			}
		}()
	}

	for j := 1; j <= 6; j++ {
		jobs <- j
	}
	close(jobs)   // tells every worker's range loop to end
	wg.Wait()     // all workers finished…
	close(results) // …so closing results is safe

	var out []string
	for r := range results {
		out = append(out, r)
	}
	sort.Strings(out)
	for _, r := range out {
		fmt.Println(r)
	}
}
`,

"generics|Square brackets before the arguments":
`package main

import (
	"cmp"
	"fmt"
	"slices"
)

type Number interface{ ~int | ~int64 | ~float64 }

func Sum[T Number](xs []T) T {
	var total T // the zero value of a type parameter
	for _, x := range xs {
		total += x
	}
	return total
}

func Map[T, U any](in []T, f func(T) U) []U {
	out := make([]U, 0, len(in))
	for _, v := range in {
		out = append(out, f(v))
	}
	return out
}

func SortedKeys[K cmp.Ordered, V any](m map[K]V) []K {
	ks := make([]K, 0, len(m))
	for k := range m {
		ks = append(ks, k)
	}
	slices.Sort(ks)
	return ks
}

type Stack[T any] struct{ items []T }

func (s *Stack[T]) Push(v T) { s.items = append(s.items, v) }
func (s *Stack[T]) Pop() (T, bool) {
	var zero T
	if len(s.items) == 0 {
		return zero, false
	}
	v := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return v, true
}

type Celsius float64 // ~float64 in the constraint lets this work

func main() {
	fmt.Println("Sum ints:    ", Sum([]int{1, 2, 3}))
	fmt.Println("Sum Celsius: ", Sum([]Celsius{1.5, 2.5}))
	fmt.Println("Map lengths: ", Map([]string{"a", "bb", "ccc"}, func(s string) int { return len(s) }))
	fmt.Println("SortedKeys:  ", SortedKeys(map[string]int{"b": 2, "a": 1, "c": 3}))

	s := &Stack[string]{}
	s.Push("x")
	s.Push("y")
	v, ok := s.Pop()
	fmt.Println("Stack pop:   ", v, ok)
	fmt.Println("builtins:    ", max(3, 7), min(3, 7))
}
`,

"iterators|That's the whole language change":
`package main

import (
	"fmt"
	"iter"
	"maps"
	"slices"
)

func Count(n int) iter.Seq[int] {
	return func(yield func(int) bool) {
		for i := range n {
			if !yield(i) { // the consumer stopped — you MUST return
				return
			}
		}
	}
}

func Filter[V any](seq iter.Seq[V], keep func(V) bool) iter.Seq[V] {
	return func(yield func(V) bool) {
		for v := range seq {
			if keep(v) && !yield(v) {
				return
			}
		}
	}
}

func main() {
	for v := range Count(5) {
		fmt.Print(v, " ")
	}
	fmt.Println()

	for v := range Count(1000) { // lazy: nothing beyond 3 is ever computed
		if v == 3 {
			break
		}
		fmt.Print(v, " ")
	}
	fmt.Println()

	evens := slices.Collect(Filter(Count(10), func(v int) bool { return v%2 == 0 }))
	fmt.Println("evens:", evens)

	m := map[string]int{"b": 2, "a": 1, "c": 3}
	fmt.Println("deterministic keys:", slices.Sorted(maps.Keys(m)))

	// pull mode, for merge-style algorithms
	next, stop := iter.Pull(Count(3))
	defer stop()
	for {
		v, ok := next()
		if !ok {
			break
		}
		fmt.Print("pulled ", v, "  ")
	}
	fmt.Println()
}
`,

"what-is-go|Build once, ship anywhere (cross compilation is a single env var)":
`package main

import (
	"fmt"
	"runtime"
)

// The same source, compiled ahead of time for whatever target you name.
// The Playground reports linux/amd64 (or js/wasm) — on your machine it will
// print your own OS and architecture.
func main() {
	fmt.Println("Go version:  ", runtime.Version())
	fmt.Println("GOOS:        ", runtime.GOOS)
	fmt.Println("GOARCH:      ", runtime.GOARCH)
	fmt.Println("NumCPU:      ", runtime.NumCPU())
	fmt.Println("GOMAXPROCS:  ", runtime.GOMAXPROCS(0))
	fmt.Println("goroutines:  ", runtime.NumGoroutine())
}
`,

"setup-first-program|main.go":
`package main // this package builds an executable, not a library

import "fmt" // standard library: formatted I/O

func main() { // the entry point
	fmt.Println("Hello, Gopher!")
}
`

};
