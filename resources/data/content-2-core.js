/* Modules 8–13 : Core Go */
window.CURRICULUM_PARTS = window.CURRICULUM_PARTS || [];
window.CURRICULUM_PARTS.push([

/* ───────────────────────────── 8 ───────────────────────────── */
{
  id: "functions",
  level: "Beginner",
  icon: "🧩",
  title: "Functions, Multiple Returns & Closures",
  minutes: 20,
  blurb: "What a function is, how it can return a number and an error, and how a function can be stored in a variable.",
  blocks: [
    { t: "h", text: "What a function is" },
    { t: "p", html: "A function is a named piece of code you can run again. You give it inputs. It can give a value back." },
    { t: "list", items: [
      "<code>func</code> starts the definition.",
      "<code>add</code> is the name you call.",
      "<code>a</code> and <code>b</code> are the inputs, both of type <code>int</code>.",
      "The <code>int</code> after the parentheses is the type of the value it gives back.",
      "<code>return a + b</code> is that value.",
      "<code>add(2, 3)</code> runs the function with those two inputs and prints <code>5</code>."
    ]},
    { t: "diagram", id: "func-parts" },
    { t: "code", title: "The smallest function", code:
`func add(a int, b int) int {
    return a + b
}

fmt.Println(add(2, 3))`,
      out: `5`
    },
    { t: "p", html: "When two inputs share a type, you can write the type once." },
    { t: "list", items: [
      "<code>func add(a, b int)</code> means the same as <code>func add(a int, b int)</code>."
    ]},

    { t: "h", text: "Multiple results" },
    { t: "p", html: "A function can give more than one value back. The parentheses after the name list them. <code>(float64, error)</code> means two values: the answer, then an error." },
    { t: "list", items: [
      "<code>nil</code> for the error means it worked. Use the number.",
      "If <code>b</code> is 0, there is no answer. The function returns <code>0</code> and an error. Look at the error before using the number."
    ]},
    { t: "diagram", id: "func-returns" },
    { t: "code", title: "Result first, error last", code:
`func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}`
    },
    { t: "p", html: "The caller looks at <code>err</code> first. <code>divide(10, 2)</code> prints <code>5</code>. <code>divide(10, 0)</code> prints the error text. The <code>0</code> that came back is unused." },
    { t: "code", title: "Check the error, then print", code:
`n, err := divide(10, 2)
if err != nil {
    fmt.Println(err)
} else {
    fmt.Println(n)
}

n, err = divide(10, 0)
if err != nil {
    fmt.Println(err)
} else {
    fmt.Println(n)
}`,
      out: `5
division by zero`
    },
    { t: "p", html: "<code>_</code> is a throwaway name. Write it when a value is there and you are not using it." },
    { t: "list", items: [
      "<code>divide</code> gives two results: the number, then the error.",
      "<code>_</code> takes the number and throws it away.",
      "<code>err</code> is the error, which we print."
    ]},
    { t: "code", title: "Skip a result with _", code:
`_, err := divide(10, 0)
fmt.Println(err)`,
      out: `division by zero`
    },
    { t: "note", kind: "tip", title: "Error goes last, and you check it", html: "Write <code>(result, error)</code>, with <code>error</code> as the final value. If <code>err != nil</code>, treat every other return as unusable." },
    { t: "p", html: "You can name those results. <code>(x, y int)</code> declares <code>x</code> and <code>y</code> for you, both starting at 0. A bare <code>return</code> then sends whatever is in them." },
    { t: "code", title: "Named results, and a bare return", code:
`func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return
}

fmt.Println(split(9))`,
      out: `4 5`
    },
    { t: "p", html: "The last input can be written <code>...int</code>. The three dots mean the caller may pass any number of ints, including none." },
    { t: "list", items: [
      "<code>...</code> means any number of them.",
      "<code>int</code> means each one is a whole number.",
      "Inside the function they arrive as one list named <code>nums</code>.",
      "<code>sum()</code> passes none, so the list is empty and the total is <code>0</code>.",
      "<code>sum(1, 2, 3)</code> passes three numbers. Inside, <code>nums</code> is <code>[1 2 3]</code>. The total is <code>6</code>."
    ]},
    { t: "p", html: "<code>range nums</code> gives two things each time: the place, then the number. This loop only needs the number." },
    { t: "list", items: [
      "<code>_</code> throws away the place.",
      "<code>n</code> is the number, which we add to <code>total</code>."
    ]},
    { t: "p", html: "If you already have a list, <code>nums...</code> takes it apart so each item is its own argument. <code>sum(nums...)</code> is the same call as <code>sum(1, 2, 3)</code>, so it also prints <code>6</code>." },
    { t: "diagram", id: "func-dots" },
    { t: "code", title: "Zero or more arguments", code:
`func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

fmt.Println(sum())
fmt.Println(sum(1, 2, 3))
nums := []int{1, 2, 3}
fmt.Println(sum(nums...))`,
      out: `0
6
6`
    },
    { t: "note", kind: "tip", title: "There are no default arguments", html: "You cannot write <code>func f(port int = 8080)</code>, and you cannot have two functions with the same name. If some arguments are optional, pass a struct of settings, or use the options pattern at the end of this lesson." },

    { t: "h", text: "Function values" },
    { t: "p", html: "A function is a value. You can store it in a variable, pass it into another function, and return it. The type of that value is the shape of the function." },
    { t: "list", items: [
      "<code>func(int, int) int</code> means a function that takes two ints and returns an int.",
      "<code>add</code> has that shape, so it can be stored in <code>op</code>.",
      "Calling <code>op(2, 3)</code> calls <code>add</code> and prints <code>5</code>."
    ]},
    { t: "code", title: "Store a function in a variable", code:
`func add(a, b int) int { return a + b }

var op func(int, int) int = add
fmt.Println(op(2, 3))`,
      out: `5`
    },
    { t: "p", html: "If that shape gets long, give it a name with <code>type</code>. <code>type Op func(int, int) int</code> is a name for the same shape. Store <code>add</code> in a variable of type <code>Op</code>, then call it." },
    { t: "diagram", id: "func-op" },
    { t: "code", title: "A name for the shape", code:
`type Op func(int, int) int

func add(a, b int) int { return a + b }

var op Op = add
fmt.Println(op(2, 3))`,
      out: `5`
    },
    { t: "p", html: "A function can also be an argument. <code>apply</code> takes a list and a function <code>f</code>. It calls <code>f</code> on each number. The function passed here has no name: <code>func(n int) int { return n * 2 }</code>. It exists only for this call. <code>for _, n := range nums</code> uses <code>_</code> the same way as in <code>sum</code>: throw away the place, keep the number." },
    { t: "code", title: "Pass a function in", code:
`func apply(nums []int, f func(int) int) []int {
    out := make([]int, 0, len(nums))
    for _, n := range nums {
        out = append(out, f(n))
    }
    return out
}

doubled := apply([]int{1, 2, 3}, func(n int) int { return n * 2 })
fmt.Println(doubled)`,
      out: `[2 4 6]`
    },

    { t: "h", text: "Closures" },
    { t: "p", html: "A <strong>closure</strong> is a function written inside another function, which uses one of the outer function's variables. \"Captures by reference\" means it keeps that variable itself. It does not copy the number that was in the variable at the moment the inner function was created." },
    { t: "p", html: "<code>counter</code> makes <code>count</code>, starting at 0, and returns an inner function. That inner function is what you call later. Each call does <code>count++</code> on the <strong>same</strong> <code>count</code> and returns it. If the closure had copied the value, every call would see 0, add 1, and return 1. It does not. The 1 is still there for the next call, then 2, then 3." },
    { t: "p", html: "<code>counter()</code> has already returned by the time you call <code>c()</code>. A local variable would normally disappear with that return. This one cannot, because the inner function still uses it, so Go keeps <code>count</code> on the heap for as long as <code>c</code> exists. Call <code>counter()</code> again and you get a new function with a new <code>count</code>. The two counters do not share." },
    { t: "diagram", id: "closure" },
    { t: "code", title: "Same function, two separate counters", code:
`func counter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

c := counter()
fmt.Println(c())
fmt.Println(c())
fmt.Println(c())

c2 := counter()
fmt.Println(c2())`,
      out: `1
2
3
1`
    },
    { t: "note", kind: "tip", title: "Loop variables", html: "Before Go 1.22, a <code>for</code> loop had one <code>i</code> reused every pass. A function created inside the loop saw whatever <code>i</code> held at the end, usually the last value. From Go 1.22 each pass has its own <code>i</code>, so the function sees the value from that pass." },

    { t: "h", text: "Optional settings" },
    { t: "p", html: "The simple way to set a port is a struct literal. You write the fields you care about, then print them." },
    { t: "diagram", id: "func-option" },
    { t: "code", title: "Set the port on the struct", code:
`type Server struct {
    Host string
    Port int
}

s := Server{Host: "localhost", Port: 9000}
fmt.Println(s.Port)`,
      out: `9000`
    },
    { t: "p", html: "Libraries that need optional settings often take extra functions. <code>WithPort(9000)</code> returns a function. <code>NewServer</code> calls each of those functions on the server it is building, and anything you did not pass keeps the default. The extra functions exist so a call that already compiled still compiles when a new setting is added." },
    { t: "code", title: "Pass only the settings you want to change", code:
`type Server struct {
    host    string
    port    int
    timeout time.Duration
}

type Option func(*Server)

func WithPort(p int) Option            { return func(s *Server) { s.port = p } }
func WithTimeout(d time.Duration) Option { return func(s *Server) { s.timeout = d } }

func NewServer(host string, opts ...Option) *Server {
    s := &Server{host: host, port: 8080, timeout: 30 * time.Second}
    for _, opt := range opts { opt(s) }
    return s
}

srv := NewServer("localhost", WithPort(9000), WithTimeout(time.Minute))
fmt.Println(srv.host, srv.port, srv.timeout)`,
      out: `localhost 9000 1m0s`
    },
    { t: "note", kind: "tip", title: "One name, one function", html: "A package cannot have two functions named <code>Print</code>. <code>Print</code>, <code>Printf</code>, and <code>Println</code> are three different names. That is how Go avoids guessing which version you meant." },

    { t: "h", text: "Write these five programs" },
    { t: "p", html: "These use the beginner lessons: variables, types, strings, printing, <code>if</code>, <code>for</code>, <code>switch</code>, <code>defer</code>, and functions. Two of them are small number problems you can solve with a loop and a function. Each one is a small <code>package main</code>. You are done when the program prints what the description says." },
    { t: "list", ordered: true, items: [
      "<strong>Fibonacci.</strong> <code>fib(n int) int</code> uses a loop. <code>fib(1)</code> and <code>fib(2)</code> are <code>1</code>. Each later number is the sum of the two before it. Print <code>n</code> and <code>fib(n)</code> for <code>n</code> from <code>1</code> to <code>10</code>. The last line is <code>10 55</code>.",
      "<strong>Reverse the digits.</strong> <code>reverse(n int) int</code> turns <code>1234</code> into <code>4321</code>. <code>palindrome(n int) bool</code> is true when <code>n</code> equals <code>reverse(n)</code>. Print <code>reverse(1234)</code>, then whether <code>121</code> and <code>123</code> are palindromes. The prints are <code>4321</code>, <code>true</code>, <code>false</code>.",
      "<strong>Grade.</strong> <code>grade(score int) (string, bool)</code> uses a <code>switch</code> with no value after it. <code>90</code> and above is <code>A</code>, <code>80</code> is <code>B</code>, <code>70</code> is <code>C</code>, and anything else is <code>F</code>. The bool is true when the letter is not <code>F</code>. Print the result for <code>95</code>, <code>80</code>, and <code>50</code>.",
      "<strong>Safe divide.</strong> <code>divide(a, b int) (int, error)</code>. When <code>b</code> is <code>0</code>, return <code>0</code> and an error. Print <code>10/2</code> and <code>10/0</code>, including the error text.",
      "<strong>Two counters.</strong> <code>counter()</code> returns a function. That function adds <code>1</code> to its own count and returns the new count. Create two counters. Call the first three times and the second once. The prints are <code>1</code>, <code>2</code>, <code>3</code>, then <code>1</code>."
    ]}
  ],
  summary: [
    "A function has a name, inputs, and a value it can give back. `add(2, 3)` prints `5`.",
    "Two results are written `(value, error)`, with the error last. Check `err` before using the number.",
    "`_` is a throwaway name for a value you are not using. After `divide`, it throws away the number. In `for _, n := range nums`, it throws away the place.",
    "`...int` collects every number into a list named `nums`. `nums...` takes that list apart so each number is its own argument.",
    "A function is a value. You can store it, pass it, and return it. `type Op` is a name for that shape.",
    "A closure keeps the outer variable itself. `c()` three times prints 1, then 2, then 3. A second `counter()` has its own count.",
    "Set optional fields with a struct literal. Extra functions let a call that already compiled still compile when a new setting is added."
  ],
  quiz: [
    { q: "Idiomatic signature for a function that can fail?",
      options: ["`func f() (error, int)`", "`func f() (int, error)`", "`func f() int` that panics", "`func f(out *int) bool`"],
      answer: 1,
      explain: "Result first, error last. Panicking is reserved for programmer bugs." },
    { q: "Inside `func sum(nums ...int)`, what is `nums`?",
      options: ["An array", "A `[]int` slice", "A pointer to int", "An interface"],
      answer: 1,
      explain: "Variadic parameters are received as a slice, possibly nil when called with no args." },
    { q: "`c := counter()` returning a closure over `count := 0`. Calling c() three times yields?",
      options: ["1, 1, 1", "1, 2, 3", "0, 1, 2", "Undefined"],
      answer: 1,
      explain: "Each call to c() adds 1 to the same count and returns it, so three calls give 1, then 2, then 3. The inner function kept the variable. It did not copy 0." },
    { q: "Go's way to express optional parameters?",
      options: ["Default parameter values", "Function overloading", "Functional options or a config struct", "Passing nil for unused args"],
      answer: 2,
      explain: "Neither defaults nor overloading exist. `...Option` closures are the common library pattern." },
    { q: "`sum(nums...)` where `nums` is a `[]int` does what?",
      options: ["Passes the slice as a single argument", "Spreads the elements as individual arguments", "Compile error", "Copies into an array"],
      answer: 1,
      explain: "The `...` suffix at a call site spreads a slice into a variadic parameter." }
  ]
},

/* ───────────────────────────── 9 ───────────────────────────── */
{
  id: "packages-init-docs",
  level: "Intermediate",
  icon: "📚",
  title: "Packages, Imports, init() & Documentation",
  minutes: 18,
  blurb: "Import forms, initialisation order, what init() is really for, doc comments that render, and runnable examples.",
  blocks: [
    { t: "p", html: "A package is Go's unit of compilation, visibility and documentation. This module covers the mechanics most people pick up by accident, the import forms, <em>when</em> your package-level code actually runs, and how to write comments that become real documentation." },

    { t: "h", text: "Imports" },
    { t: "p", html: "A normal import uses the last part of the path as the name: <code>net/http</code> is called <code>http</code>. An alias renames it when two packages would otherwise share a name. A blank import, <code>_</code>, runs the package only for its startup side effect, such as registering a database driver. A dot import dumps the names into your file; avoid it." },
    { t: "code", title: "Only one of them is unusual", code:
`import (
    "fmt"                                  // standard: refer to it as fmt.X
    "net/http"                             // the NAME is the last element: http

    "github.com/google/uuid"               // third-party, same rule: uuid.New()

    mrand "math/rand/v2"                   // ALIAS: resolve a name clash, or
    crand "crypto/rand"                    //   make the distinction explicit

    _ "github.com/lib/pq"                  // BLANK: import for SIDE EFFECTS only.
                                           // You never reference it; you want its
                                           // init() to register the SQL driver.
    . "math"                               // DOT: dumps names into your scope.
)                                          // Almost never do this, it destroys
                                           // readability. Tests only, rarely.

// gofmt groups stdlib first, then everything else, separated by a blank line;
// goimports and gofumpt maintain that grouping for you.
//
// Import CYCLES are a compile error, Go has no forward declarations. If A and
// B need each other, extract the shared types into a third package, or move an
// interface to the consumer side (which is the usual right answer).`
    },

    { t: "h", text: "Initialisation order" },
    { t: "p", html: "Package-level variables are set before <code>main</code> runs, and a variable is set after the ones it depends on. <code>init</code> functions run after that, once per file, and you cannot call them yourself. Put fallible startup in <code>main</code>, not in <code>init</code>, because <code>init</code> can only panic." },
    { t: "code", title: "Dependency order, not declaration order", code:
`var a = b + 1    // 3   <- initialised SECOND, because it depends on b
var b = f()      // 2   <- initialised FIRST
func f() int { return 2 }

// The rules, in order:
//  1. Every IMPORTED package is fully initialised before yours starts
//     (each package exactly once, however many times it is imported).
//  2. Package-level variables are initialised in DEPENDENCY order, the
//     compiler sorts them. Declaration order only breaks ties.
//  3. Then every init() in the package runs.
//  4. Finally, for package main: func main().

func init() { /* no arguments, no results, and you cannot call it yourself */ }
func init() { /* several per file and per package are allowed */ }

// init() functions run in the order they appear within a file; the order of
// FILES is the order the toolchain presents them (in practice, alphabetical).
// Never depend on cross-file ordering, if order matters, use a single init()
// or an exported Setup() that the caller invokes explicitly.`
    },
    { t: "code", title: "What init() is legitimately for", code:
`// 1. REGISTRATION, the pattern behind every blank import
func init() { sql.Register("postgres", &Driver{}) }
func init() { gob.Register(MyType{}) }
func init() { prometheus.MustRegister(requestsTotal) }

// 2. Computing a table once, or anything a var initialiser cannot express
var emailRe = regexp.MustCompile("^[^@]+@[^@]+$")      // a var is enough here
var crcTable [256]uint32
func init() { for i := range crcTable { crcTable[i] = compute(i) } }

// 3. Validating an invariant so a bug cannot reach production
func init() {
    if len(opcodeNames) != numOpcodes {
        panic("opcodeNames is out of sync with the opcode list")
    }
}

// WHEN NOT TO USE IT
//  - reading config, opening a database, dialling a service: these fail, and
//    init() has nowhere to return an error, only panic. Do them in run(),
//    where you can report the failure and test it.
//  - anything you may want to skip in tests: init() ALWAYS runs, including
//    under "go test", and you cannot stub it.
//  - heavy work: it is on the critical path of every binary that imports you.

GODEBUG=inittrace=1 ./app     # one line per package: time and bytes
# init internal/cpu @0.004 ms, 0.006 ms clock, 0 bytes, 0 allocs`
    },
    { t: "note", kind: "warn", title: "init() is action at a distance", html: "A reader of <code>main.go</code> cannot see that importing a package mutated global state. That is precisely why the driver-registration pattern needs the loud <code>_ \"…/pq\"</code> blank import as a signal. Prefer explicit construction, <code>pq.New()</code>, or a <code>Register…()</code> call from <code>run()</code>, unless you are deliberately implementing a plugin-style registry." },

    { t: "h", text: "Doc comments" },
    { t: "p", html: "A comment immediately above a name, starting with that name, becomes its documentation. <code>go doc</code> and pkg.go.dev show it. An <code>Example</code> function in a test file is documentation that the test runner actually compiles and checks." },
    { t: "code", title: "The conventions, and the syntax gofmt understands", code:
`// Package user provides storage and validation for application accounts.
//
// It is safe for concurrent use. Every function that performs I/O takes a
// context.Context as its first argument.
package user          // <- PACKAGE doc: in ONE file only (or a doc.go).

// MaxNameLen is the longest permitted display name, in bytes.
const MaxNameLen = 64

// Store persists users. Implementations must be safe for concurrent use.
type Store interface { /* ... */ }

// Create validates u and writes it to the store. It returns [ErrTaken] if the
// email already exists.
//
// Create does not hash the password; call [HashPassword] first.
func (s *Service) Create(ctx context.Context, u *User) error { /* ... */ }

// Rules that matter:
//  - Start with the identifier's name: "Create validates…", not "This method…".
//    Doc tooling and revive's "exported" rule both expect it.
//  - Write complete sentences; the first is the summary shown in listings.
//  - Say what it DOES and what the caller must know, errors returned, whether
//    it blocks, concurrency safety, who owns the arguments, not how it works.
//  - Unexported identifiers deserve comments too; they just are not published.

// gofmt (1.19+) understands structure inside doc comments:
//
//   # A heading
//
//   Indent by one tab for a code block:
//
//       out, err := user.Create(ctx, u)
//
//   Lists start with a dash or a number:
//     - first
//     - second
//
//   Link to symbols in brackets: [Service.Create], [net/http.Handler].
//   Define a URL once and reference it: see the [spec] for details.
//
//   [spec]: https://go.dev/ref/spec

// Deprecated: Use [NewService] instead. This will be removed in v3.
func New() *Service { /* ... */ }    // <- editors grey out the call site`
    },
    { t: "code", title: "Runnable examples, documentation that cannot rot", code:
`// In user_test.go, declared as "package user_test" so it reads like a caller:

func ExampleService_Create() {
    svc := user.NewService(user.NewMemStore())
    if err := svc.Create(context.Background(), &user.User{Name: "Ada"}); err != nil {
        log.Fatal(err)
    }
    fmt.Println("created")
    // Output: created          <- go test RUNS this and compares stdout
}

// The NAME decides where it appears in the rendered docs:
//   Example()                       package-level example
//   ExampleNewService()             for the NewService function
//   ExampleService_Create()         for the Create method on Service
//   ExampleService_Create_withTag() a second, labelled variant
//
// Omit the "// Output:" comment and it is compiled but not run, useful when
// output is nondeterministic. "// Unordered output:" allows any line order.
// These are the best docs you can write: compiled and asserted by CI.

go doc ./user                    # your own package docs, in the terminal
go doc -all ./user               # every exported symbol
go doc net/http.Handler          # anything in the module graph or stdlib
go doc -src sync.Once            # straight to the source
# Published modules are rendered automatically at pkg.go.dev.`
    },
    { t: "note", kind: "tip", title: "A package's name is part of its API", html: "Short, lowercase, singular, no underscores: <code>user</code>, <code>store</code>, <code>http</code>. The name is a prefix at every call site, so avoid stutter (<code>user.New()</code>, not <code>user.NewUser()</code>) and avoid non-names like <code>utils</code>, <code>helpers</code>, <code>common</code>, <code>base</code> or <code>misc</code>, a package you cannot name precisely is usually a missing abstraction. Put anything you don't want outsiders importing under <code>internal/</code>." },

    { t: "h", text: "Semicolons" },
    { t: "p", html: "You rarely type a semicolon. Go inserts one at the end of a line when the line looks finished. That is why the <code>{</code> must stay on the same line as <code>if</code> or <code>func</code>: a newline before the brace inserts a semicolon and the program does not compile." },
    { t: "code", title: "The scanner inserts semicolons for you", code:
`// Go's grammar wants semicolons; the scanner inserts one at the end of any line
// whose final token could end a statement, an identifier, a literal,
// break/continue/fallthrough/return, ++ or --, or one of ) ] }.
//
// So this:
if x > 0
{                 // a semicolon landed after "0", giving "if x > 0;"
}                 // syntax error: unexpected newline, expecting { after if

// and this:
}
else { }          // semicolon after "}" gives "} ; else" -> syntax error

// are both broken. Exactly one layout is legal:
if x > 0 {
} else {
}

// You never type a semicolon in Go, except to separate clauses on one line:
for i := 0; i < n; i++ { }
if v, err := f(); err == nil { }`
    },
    { t: "note", kind: "deep", title: "This is why gofmt could win", html: "Because the grammar permits only one brace style, the biggest formatting argument in C-family languages was settled by the <em>language</em> rather than by a style guide. <code>gofmt</code> then removed everything that was left. It is a small design decision with an outsized effect on what Go code review feels like." }
  ],
  summary: [
    "Import forms: plain, aliased, blank (`_` for init side effects, the SQL-driver pattern) and dot (avoid). Import cycles are a compile error; break them with a third package or a consumer-side interface.",
    "Initialisation order is guaranteed: imported packages first, then package-level vars in **dependency** order, then every `init()`, then `main()`.",
    "`init()` takes no arguments and returns nothing; several are allowed. Never depend on cross-file ordering.",
    "Use `init()` for registration, precomputed tables and invariant checks, not for config or I/O, which must return errors and stay testable.",
    "`GODEBUG=inittrace=1` shows what each package's initialisation costs at startup.",
    "Doc comments begin with the identifier's name, are complete sentences, and support headings, lists, indented code and `[Symbol]` links; `Deprecated:` is a recognised marker.",
    "`ExampleXxx` functions with an `// Output:` comment are documentation that `go test` verifies.",
    "Package names are short, lowercase and singular with no stutter; `utils`/`helpers`/`common` signal a missing abstraction.",
    "Automatic semicolon insertion is why `{` stays on the same line and `} else {` must be one line, the language settled brace placement, not a style guide."
  ],
  quiz: [
    { q: "`var a = b + 1` is declared above `var b = f()` where f returns 2. What is `a`?",
      options: ["1, b is still zero", "A compile error: use before declaration", "3, package vars initialise in dependency order", "Undefined"],
      answer: 2,
      explain: "The compiler sorts package-level initialisation by dependency, so `b` is set first; declaration order only breaks ties." },
    { q: "What does `import _ \"github.com/lib/pq\"` achieve?",
      options: ["Imports it without compiling it", "Runs the package's init() for its side effects, registering the SQL driver, without referencing any identifier", "Marks the import optional", "Silences the unused-import error for a dependency you do use"],
      answer: 1,
      explain: "The blank name suppresses the unused-import error while still linking the package and running its init()." },
    { q: "Which job does NOT belong in `init()`?",
      options: ["Registering a driver or a metric", "Precomputing a lookup table", "Checking a compile-time invariant", "Loading configuration and connecting to the database"],
      answer: 3,
      explain: "init() can only panic, always runs, including under `go test`, and cannot be stubbed. Fallible startup work belongs in a `run() error`." },
    { q: "How does Go make sure a documented example still works?",
      options: ["It doesn't, comments aren't checked", "`ExampleXxx` functions with an `// Output:` comment are executed by `go test` and their stdout compared", "`go doc` runs code blocks", "A linter diffs comments against code"],
      answer: 1,
      explain: "That is what makes examples the most reliable documentation in Go: CI compiles and asserts them." },
    { q: "Why does putting `else` on its own line fail to compile?",
      options: ["gofmt forbids it", "The scanner inserts a semicolon after the preceding `}`, producing `} ; else`", "`else` must be indented to match `if`", "It compiles; only vet complains"],
      answer: 1,
      explain: "Automatic semicolon insertion turns one-true-brace style into a grammar rule rather than a preference." }
  ]
},

/* ───────────────────────────── 10 ───────────────────────────── */
{
  id: "collections",
  level: "Intermediate",
  icon: "🗂️",
  title: "Arrays, Slices, Maps & Structs, With Internals",
  minutes: 22,
  blurb: "The slice header, capacity growth, the aliasing bug everyone hits, and map internals.",
  blocks: [
    { t: "h", text: "Arrays" },
    { t: "p", html: "An array's length is part of its type, so <code>[3]int</code> and <code>[4]int</code> are different types. Assigning an array copies every element. Almost all Go code uses a slice instead, which is a view onto an array and can grow." },
    { t: "code", title: "You'll rarely use these directly", code:
`var a [5]int                  // [0 0 0 0 0], length is part of the type
b := [3]string{"x","y","z"}
c := [...]int{1, 2, 3}        // compiler counts: [3]int

// [3]int and [5]int are DIFFERENT, incompatible types.
// Arrays are VALUES: assigning or passing copies every element.
d := b
d[0] = "changed"
fmt.Println(b[0])             // "x", b is untouched`,
      out: `x`
    },

    { t: "h", text: "Slices" },
    { t: "p", html: "A slice is <strong>not</strong> a container. It is a small struct, a <em>view</em>, that points at a backing array:" },
    { t: "code", title: "runtime.slice", code:
`type slice struct {
    array unsafe.Pointer  // start of the backing array
    len   int             // elements currently visible
    cap   int             // elements available before a reallocation is needed
}`
    },
    { t: "diagram", id: "slice-header" },
    { t: "code", title: "Creating and growing", code:
`var s []int                   // nil: len 0, cap 0, no backing array
s = []int{1, 2, 3}            // literal
s = make([]int, 5)            // len 5, cap 5, zeroed
s = make([]int, 0, 100)       // len 0, cap 100, PREALLOCATE when you know the size

s = append(s, 4)              // may reallocate; ALWAYS reassign the result
s = append(s, 5, 6)
s = append(s, other...)       // concatenate

// Slicing: s[low:high], low included, high excluded, shares memory
t := s[1:3]
u := s[:2]
v := s[2:]
w := s[1:3:4]                 // three-index: low:high:max, caps the new slice

// Copy, which does not alias
dst := make([]int, len(src))
n := copy(dst, src)           // copies min(len(dst), len(src))

// Delete index i (order not preserved, cheap)
s[i] = s[len(s)-1]
s = s[:len(s)-1]

// Delete index i (order preserved)
s = append(s[:i], s[i+1:]...)
// or, Go 1.21+:  s = slices.Delete(s, i, i+1)`
    },
    { t: "note", kind: "deep", title: "How append grows capacity", html: "If <code>len &lt; cap</code>, <code>append</code> writes in place and returns a slice sharing the same array. If <code>len == cap</code>, it allocates a <strong>new, bigger</strong> array, copies everything, and returns a slice pointing at the new one, so the old slice no longer sees your change. Growth doubles while the slice is under <strong>256</strong> elements, then tapers geometrically toward ~1.25× (and the result is rounded up to a size class, so <code>cap</code> is often slightly larger than the arithmetic suggests). This amortises to O(1) per append but means <strong>you must use the return value</strong>, and that reallocation is why aliasing bugs are intermittent." },
    { t: "code", title: "The aliasing bug, demonstrated", code:
`a := []int{1, 2, 3, 4, 5}
b := a[1:3]                   // len 2, cap 4, SHARES a's array
b[0] = 99
fmt.Println(a)                // [1 99 3 4 5]  <- a changed!

b = append(b, 100)            // cap allows it: writes into a[3]
fmt.Println(a)                // [1 99 3 100 5] <- a changed again!

// Safe: force a copy
b = append([]int(nil), a[1:3]...)   // or slices.Clone(a[1:3])`,
      out: `[1 99 3 4 5]
[1 99 3 100 5]`
    },
    { t: "note", kind: "warn", title: "The slice memory leak", html: "<code>small := huge[:10]</code> keeps the <strong>entire</strong> backing array alive, the GC can't free a 1 GB array because one 10-element view points into it. If you're holding a small piece of something big for a long time, copy it: <code>small := slices.Clone(huge[:10])</code>." },

    { t: "h", text: "new and make" },
    { t: "p", html: "<code>new(T)</code> allocates a <code>T</code> and returns a pointer to its zero value. It does not say whether that memory is on the stack or the heap. <code>make</code> is only for slices, maps, and channels, because those need extra setup beyond zeros. <code>T{...}</code> builds a value and fills the fields you name." },
    { t: "code", title: "Three ways to get memory, and they are not interchangeable", code:
`// new(T), allocates ZEROED storage for a T and returns a *T.
//           It never initialises anything beyond zeroing.
p := new(int)              // *int, *p == 0
u := new(User)             // *User, every field zeroed  (same as &User{})
s := new([]int)            // *[]int pointing at a NIL slice, rarely useful

// make(T, …), ONLY for slices, maps and channels. It builds the internal
//              data structure (backing array / hash table / ring buffer) and
//              returns a T, not a pointer.
s2 := make([]int, 0, 100)  // len 0, cap 100
m  := make(map[string]int, 64)
ch := make(chan int, 10)
// make([]int, 5) is NOT the same as new([]int): the first is a usable
// five-element slice, the second is a pointer to an unusable nil slice.

// COMPOSITE LITERAL, allocate and initialise in one expression.
u2 := User{Name: "Ada", Age: 30}     // a value
u3 := &User{Name: "Ada"}             // a pointer; the idiomatic constructor body
m2 := map[string]int{"a": 1}
s3 := []int{1, 2, 3}
a3 := [...]string{"x", "y"}

// Returning a pointer to a local is FINE, escape analysis moves it to the heap.
func NewUser(name string) *User {
    return &User{Name: name, Created: time.Now()}   // no "new", no ceremony
}

// Field names in struct literals are optional but ALWAYS use them: a positional
// literal breaks silently when someone reorders or inserts a field.`
    },
    { t: "note", kind: "tip", title: "Which one do I reach for?", html: "Slice, map or channel → <strong><code>make</code></strong>. Anything with values to set → <strong>composite literal</strong> (<code>&amp;T{…}</code>). <code>new</code> is genuinely rare in idiomatic Go, mostly <code>new(bytes.Buffer)</code> inside a <code>sync.Pool</code>, or when you need a <code>*int</code>/<code>*bool</code> to represent \"set\" in a JSON payload." },

    { t: "h", text: "Nested slices" },
    { t: "p", html: "A slice of slices is not one rectangle. Each inner slice has its own length and its own backing array. If you want a grid that shares one block of memory, use one slice and compute the index yourself." },
    { t: "code", title: "Rows are independent, unless you make them share", code:
`// Go has no built-in 2-D slice: you build a slice of slices. Each row is a
// separate allocation, so rows may have different lengths (a jagged array).
grid := make([][]int, rows)
for i := range grid {
    grid[i] = make([]int, cols)        // rows allocations + 1
}

// For a fixed rectangle, ONE allocation is faster and far kinder to the GC and
// to cache locality, a single backing array sliced into rows:
flat := make([]int, rows*cols)
grid2 := make([][]int, rows)
for i := range grid2 {
    grid2[i], flat = flat[:cols:cols], flat[cols:]   // carve a row, advance
}
// grid2[r][c] now lives at flat[r*cols+c]: contiguous memory, 2 allocations.

// Or skip the row headers entirely and index arithmetic yourself, the fastest
// option, and what you want for images, matrices and game boards:
at := func(r, c int) int { return flat[r*cols+c] }`
    },

    { t: "h", text: "Maps" },
    { t: "p", html: "A map looks up a value by a key. Reading a missing key returns the zero value, so use <code>v, ok := m[k]</code> when zero could be a real stored value. A nil map can be read and panics if you write to it. Ranging a map visits keys in a random order." },
    { t: "code", title: "Everything you need", code:
`m := make(map[string]int)
m2 := map[string]int{"a": 1, "b": 2}
var m3 map[string]int         // nil, reads OK, writes PANIC

m["key"] = 42
v := m["missing"]            // 0, no error, no panic

// The comma-ok idiom: distinguishes "zero value" from "absent"
v, ok := m["key"]
if !ok { /* genuinely not present */ }

delete(m, "key")             // no-op if absent
fmt.Println(len(m))

// Deterministic iteration requires sorting the keys
keys := make([]string, 0, len(m))
for k := range m { keys = append(keys, k) }
sort.Strings(keys)
for _, k := range keys { fmt.Println(k, m[k]) }

// A set: map to an empty struct, which occupies ZERO bytes
seen := map[string]struct{}{}
seen["a"] = struct{}{}
if _, ok := seen["a"]; ok { }

// Preallocate when you know the rough size
counts := make(map[string]int, 1000)`
    },
    { t: "note", kind: "deep", title: "Map internals (and two hard rules)", html: "Classically (Go ≤1.23) a map was an array of <em>buckets</em> holding 8 key/value pairs each, plus the top 8 bits of every key's hash for fast rejection, with overflow buckets chaining on collision and an incremental rehash once the load factor passed ~6.5 per bucket. <strong>Go 1.24 replaced that with <em>Swiss tables</em></strong>, flat groups of 8 slots with an SIMD-friendly control word, which made lookups and deletes measurably faster and shrank small maps. The implementation changes; the <em>contract</em> never does: <strong>(1)</strong> <code>&amp;m[k]</code> is illegal because growth relocates entries, store pointers as values if you need in-place mutation; <strong>(2)</strong> maps are <strong>not</strong> safe for concurrent use, and a concurrent read+write triggers a deliberate runtime throw (\"concurrent map writes\") rather than silent corruption. Use a <code>sync.RWMutex</code> or <code>sync.Map</code>." },

    { t: "h", text: "Structs" },
    { t: "p", html: "A struct is one value made of named fields. You read a field with a dot. A struct literal can name the fields, which still compiles if you later add a field, or it can list values in order, which breaks when the order changes. Tags such as <code>json:\"name\"</code> are text the encoding packages read." },
    { t: "code", title: "Declaring, embedding, tagging, comparing", code:
`type User struct {
    ID        int
    Name      string
    Email     string
    CreatedAt time.Time
}

u1 := User{ID: 1, Name: "Ada"}          // field names: always do this
u2 := &User{ID: 2}                      // pointer to a new struct
var u3 User                             // all fields zeroed

// Nested and embedded
type Address struct { City, Country string }

type Customer struct {
    User                                // EMBEDDED (anonymous), promotes fields
    Address Address                     // named field
    Tags    []string
}
c := Customer{User: User{Name: "Bob"}}
fmt.Println(c.Name)                     // promoted from the embedded User
fmt.Println(c.User.Name)                // the explicit path

// Structs are comparable with == if ALL their fields are comparable.
// Slices, maps and functions are not comparable, so a struct containing
// one of them cannot use == (use reflect.DeepEqual, or Go 1.21+ generics).

// An empty struct carries no data and costs 0 bytes
type Signal struct{}
done := make(chan struct{})             // the idiomatic "notify only" channel`
    },
    { t: "code", title: "Struct tags: metadata read by reflection", code:
`type Product struct {
    ID    int     ` + "`json:\"id\" db:\"product_id\"`" + `
    Name  string  ` + "`json:\"name\" validate:\"required\"`" + `
    Price float64 ` + "`json:\"price,omitempty\"`" + `
    temp  string  // unexported: invisible to encoding/json
}
// Tags are just strings. encoding/json, sql drivers and validators read them
// at runtime via reflection, the compiler does not check them, so typos are
// silent bugs. Keep them simple and test your marshalling.`
    },
    { t: "note", kind: "tip", title: "Field order affects struct size", html: "Fields are aligned, so <code>struct{a bool; b int64; c bool}</code> occupies 24 bytes while <code>struct{b int64; a, c bool}</code> occupies 16. Group same-sized fields together, largest first, when you have millions of instances." }
  ],
  summary: [
    "Arrays are fixed-size values; their length is part of the type and assignment copies.",
    "A slice is a 3-word header (pointer, len, cap) viewing a backing array, always `s = append(s, …)`.",
    "append writes in place while len < cap and reallocates (≈2× then ≈1.25×) when full; that's the source of aliasing bugs.",
    "Sub-slices share memory, clone to isolate, and clone small views of huge arrays to avoid leaks.",
    "Maps: `v, ok := m[k]` distinguishes absent from zero; iteration order is random; `&m[k]` is illegal; not concurrency-safe.",
    "`make` builds slices/maps/channels; `new(T)` returns a zeroed `*T`; a composite literal (`&T{…}`) allocates *and* initialises, and is what idiomatic constructors return.",
    "Always name fields in struct literals; positional literals break silently when fields are reordered.",
    "2-D data is a slice of slices; for a fixed rectangle, carve rows out of one flat backing array for contiguity and fewer allocations.",
    "Structs compare with == only if all fields are comparable; embedding promotes fields; `struct{}` costs zero bytes."
  ],
  quiz: [
    { q: "What are the three words in a slice header?",
      options: ["start, end, type", "pointer, len, cap", "data, hash, size", "array, index, stride"],
      answer: 1,
      explain: "Pointer to the backing array, current length, and capacity before reallocation." },
    { q: "`a := []int{1,2,3,4,5}; b := a[1:3]; b[0] = 99`. What is `a`?",
      options: ["[1 2 3 4 5]", "[1 99 3 4 5]", "[99 2 3 4 5]", "panic"],
      answer: 1,
      explain: "b shares a's backing array, so writing b[0] writes a[1]." },
    { q: "Why must you write `s = append(s, x)` rather than just `append(s, x)`?",
      options: ["Style", "append may allocate a new array and return a different header", "append returns an error", "It wouldn't compile otherwise"],
      answer: 1,
      explain: "When len == cap, append reallocates; the original header still points at the old array." },
    { q: "`m[\"k\"]` returns 0. How do you know whether the key exists?",
      options: ["Check for nil", "`v, ok := m[\"k\"]`", "`m.Has(\"k\")`", "Compare against the zero value"],
      answer: 1,
      explain: "The comma-ok form is the only reliable way; 0 could be a real stored value." },
    { q: "Two goroutines write to the same map with no synchronisation. What happens?",
      options: ["Last write wins", "It's safe, maps are internally locked", "The runtime detects it and throws 'concurrent map writes'", "Silent corruption only"],
      answer: 2,
      explain: "The runtime has a cheap check that crashes the program on purpose. Use a mutex or sync.Map." }
  ]
},

/* ───────────────────────────── 11 ───────────────────────────── */
{
  id: "pointers-memory",
  level: "Intermediate",
  icon: "🧠",
  title: "Pointers, Stack vs Heap & Escape Analysis",
  minutes: 18,
  blurb: "Where your data actually lives, why Go has no pointer arithmetic, and value vs pointer semantics.",
  blocks: [
    { t: "h", text: "Pointers" },
    { t: "p", html: "A pointer holds the address of a value. <code>&amp;x</code> takes the address. <code>*p</code> reads or writes the value at that address. Go has no pointer arithmetic, so you cannot walk off an array by adding to a pointer. A nil pointer panics if you dereference it." },
    { t: "code", title: "& takes an address, * dereferences", code:
`x := 42
p := &x              // p is *int, a pointer to x
fmt.Println(*p)      // 42, dereference to read
*p = 100             // write through the pointer
fmt.Println(x)       // 100

var np *int          // nil pointer
// fmt.Println(*np)  // PANIC: invalid memory address or nil pointer dereference
if np != nil { }     // always guard pointers that may be nil

// new(T) allocates a zeroed T and returns *T
q := new(int)        // *q == 0
*q = 7

// NO POINTER ARITHMETIC. p++ and p+1 do not compile.
// That single omission removes buffer overruns from the language.`,
      out: `42
100`
    },
    { t: "note", kind: "tip", title: "Go is pass-by-value, always", html: "Every argument is copied. Passing a pointer copies the <em>pointer</em> (8 bytes), which is how the callee mutates the caller's data. Slices, maps and channels <em>feel</em> like references because their copied headers point at the same underlying data, but the header itself is still a copy, which is exactly why <code>append</code> inside a function can't change the caller's length." },
    { t: "code", title: "Value vs pointer receivers and parameters", code:
`type Counter struct{ n int }

func (c Counter) IncVal()  { c.n++ }   // operates on a COPY: no visible effect
func (c *Counter) IncPtr() { c.n++ }   // mutates the original

c := Counter{}
c.IncVal(); fmt.Println(c.n)   // 0
c.IncPtr(); fmt.Println(c.n)   // 1  (Go auto-takes &c for you)

// The slice-length surprise
func addItem(s []int)   { s = append(s, 1) }   // caller sees nothing
func addItem2(s *[]int) { *s = append(*s, 1) } // caller sees the new element
func addItem3(s []int) []int { return append(s, 1) }  // idiomatic: return it`,
      out: `0
1`
    },
    { t: "list", items: [
      "<strong>When to use a pointer receiver:</strong> the method mutates the receiver; the struct is large (copying costs more than 8 bytes of indirection); or the type contains a <code>sync.Mutex</code> (copying a mutex is a bug).",
      "<strong>Be consistent</strong>, if any method on a type needs a pointer receiver, give them all pointer receivers.",
    ]},

    { t: "h", text: "Stack and heap" },
    { t: "p", html: "A value lives in one of two places." },
    { t: "list", items: [
      "The <strong>stack</strong> belongs to one goroutine. It holds the function that is running, and it disappears when that function returns.",
      "The <strong>heap</strong> is shared. A value there can outlive the function.",
      "Only the heap is freed by the garbage collector, the search from lesson 1.",
      "Reassigning an <code>int</code> overwrites one stack slot. Reassigning a <code>string</code> points the slot at new heap bytes, and the old bytes can be collected."
    ]},
    { t: "table", head: ["", "Stack", "Heap"],
      rows: [
        ["Allocation cost", "~free (bump a pointer)", "allocator work + GC bookkeeping"],
        ["Reclaimed", "instantly on return", "by the garbage collector, later"],
        ["Scope", "one goroutine, one frame", "shared, outlives the frame"],
        ["Size", "starts at 2 KB, grows by copying", "limited by RAM"],
        ["Chosen by", "the compiler", "the compiler"]
      ]
    },
    { t: "h", text: "Stack frames" },
    { t: "p", html: "<code>main</code> calls <code>score</code>. Go pushes a frame for <code>score</code> on top of <code>main</code>. The locals of <code>score</code> are slots in that frame. <code>n = 10</code> writes into the slot <code>n</code> already has. It does not ask for new memory. When <code>score</code> returns, the frame is popped. The next call reuses those bytes. That is why a stack allocation is almost free: it moves a pointer. The collector is not involved." },
    { t: "diagram", id: "call-stack" },
    { t: "h", text: "Escape analysis" },
    { t: "p", html: "Returning the number copies it. The frame can die. Returning <code>&amp;n</code> hands out the address of <code>n</code>. The frame must not reuse those bytes. The compiler sees that and puts <code>n</code> on the heap. That decision is escape analysis. You do not write it. <code>new(int)</code> and <code>&amp;n</code> mean \"I need a pointer\". They do not mean \"put this on the heap\"." },
    { t: "diagram", id: "stack-heap" },
    { t: "p", html: "In C, <code>malloc</code> means heap and a local means stack. In Go the compiler places each value wherever is safe and cheap." },
    { t: "code", title: "Ask the compiler what it decided", code:
`$ go build -gcflags="-m" main.go
./main.go:8:6:  can inline makeLocal
./main.go:13:10: &User{...} escapes to heap
./main.go:9:2:  moved to heap: u

# Value escapes when the compiler can't prove it dies with the frame:
func stays() int   { x := 42; return x }        // stack, copied out
func escapes() *int { x := 42; return &x }      // heap, pointer outlives frame

# Common escape triggers:
#  • returning a pointer to a local
#  • storing a pointer in a struct/slice/map that escapes
#  • passing to an interface{}/any parameter (fmt.Println does this!)
#  • capturing a variable in a closure that outlives the call
#  • a size the compiler can't determine at compile time (make([]int, n))`
    },
    { t: "note", kind: "deep", title: "Goroutine stacks grow", html: "A goroutine starts with a tiny <strong>2 KB</strong> stack, which is why a million of them is feasible. When a function needs more room, the runtime allocates a larger stack, <em>copies the frames across</em>, and rewrites the pointers into it. That copying is only possible because Go has no pointer arithmetic and the GC knows precisely where every pointer lives." },

    { t: "h", text: "Allocations" },
    { t: "p", html: "A value that does not outlive the function can stay on the stack, which is cheap. If you return a pointer to it, or store it somewhere that lives longer, it moves to the heap and the garbage collector has to free it later. <code>go build -gcflags=\"-m\"</code> prints which choice the compiler made." },
    { t: "code", title: "Measure first, then fix", code:
`// Benchmark with allocation counts
// go test -bench=. -benchmem
// BenchmarkNaive-8   500000   2400 ns/op   1808 B/op   11 allocs/op

// 1. Preallocate with a known capacity, turns ~log2(n) growths into one alloc
out := make([]string, 0, len(in))

// 2. Reuse buffers instead of allocating per call
var pool = sync.Pool{New: func() any { return new(bytes.Buffer) }}
buf := pool.Get().(*bytes.Buffer)
buf.Reset()
defer pool.Put(buf)

// 3. Pass small structs by value; they stay on the stack
// 4. Avoid any/interface{} on hot paths, boxing forces an escape
// 5. strings.Builder over += ; strconv over fmt.Sprintf for single values`
    },
    { t: "note", kind: "warn", title: "Don't guess", html: "Escape analysis and inlining are smarter than intuition. Prove a problem with <code>-benchmem</code> and <code>pprof</code> before contorting readable code." }
  ],
  summary: [
    "`&` takes an address, `*` dereferences; there is no pointer arithmetic, which eliminates a whole class of memory bugs.",
    "Go is always pass-by-value, passing a pointer copies the pointer, which is how callees mutate caller state.",
    "Pointer receivers for mutation, large structs, or types containing a mutex; keep receivers consistent per type.",
    "Appending inside a function can't change the caller's slice length, return the slice instead.",
    "The compiler, not you, picks stack or heap via escape analysis; inspect it with `go build -gcflags=\"-m\"`.",
    "Goroutine stacks start at 2 KB and grow by copying, cheap concurrency depends on it."
  ],
  quiz: [
    { q: "What does `x++` do if `x` is a `*int`?",
      options: ["Advances the pointer one int", "Increments the pointed-to value", "Compile error, no pointer arithmetic", "Undefined behaviour"],
      answer: 2,
      explain: "Go has no pointer arithmetic at all. To increment the value: `*x++`." },
    { q: "Who decides whether a value goes on the stack or the heap?",
      options: ["You, via new() vs literal", "The compiler, via escape analysis", "The garbage collector at runtime", "The OS"],
      answer: 1,
      explain: "`new()` says nothing about location. Inspect decisions with `-gcflags=\"-m\"`." },
    { q: "`func f(s []int) { s = append(s, 1) }`, the caller's slice afterwards?",
      options: ["Has the new element", "Is unchanged in length", "Panics", "Depends on capacity"],
      answer: 1,
      explain: "The header is a copy, so the caller's len never changes. Return the slice or pass `*[]int`." },
    { q: "Which does NOT typically cause a value to escape to the heap?",
      options: ["Returning a pointer to a local", "Passing it to `fmt.Println`", "Capturing it in a long-lived closure", "Reading it into a local int and returning the int"],
      answer: 3,
      explain: "Returning a copied value keeps it on the stack. `fmt.Println` takes `...any`, which boxes and escapes." },
    { q: "Initial goroutine stack size?",
      options: ["2 KB, grown by copying", "1 MB, fixed", "8 MB like an OS thread", "Allocated on the heap from the start"],
      answer: 0,
      explain: "Small start plus copy-on-grow is what makes hundreds of thousands of goroutines practical." }
  ]
},

/* ───────────────────────────── 12 ───────────────────────────── */
{
  id: "methods-interfaces",
  level: "Intermediate",
  icon: "🔌",
  title: "Methods, Interfaces & Composition",
  minutes: 20,
  blurb: "Implicit satisfaction, small interfaces, embedding instead of inheritance, and the nil-interface trap.",
  blocks: [
    { t: "h", text: "Methods" },
    { t: "p", html: "A method is a function with the receiver named before the function name: <code>func (p Point) Abs() float64</code>. A value receiver gets a copy. A pointer receiver can change the original. You can declare methods on any named type in your package, not only structs." },
    { t: "code", title: "You can define methods on any type you own", code:
`type Rect struct{ W, H float64 }

func (r Rect) Area() float64      { return r.W * r.H }       // value receiver
func (r Rect) Perimeter() float64 { return 2 * (r.W + r.H) }
func (r *Rect) Scale(f float64)   { r.W *= f; r.H *= f }     // pointer receiver

// Not just structs, any named type you declare
type Celsius float64
func (c Celsius) Fahrenheit() float64 { return float64(c)*9/5 + 32 }

type IntSlice []int
func (s IntSlice) Sum() int { t := 0; for _, v := range s { t += v }; return t }

// You cannot add methods to types from other packages.
// Define your own type that wraps or embeds theirs instead.`
    },

    { t: "h", text: "Method sets" },
    { t: "p", html: "The method set is the list of methods a type has for the purpose of satisfying an interface. A pointer type has both value and pointer methods. A plain value has only the value methods. That is why a value sometimes does not satisfy an interface that its pointer does." },
    { t: "code", title: "T and *T do not have the same method set", code:
`type Counter struct{ n int }
func (c Counter) Value() int { return c.n }   // VALUE receiver
func (c *Counter) Inc()      { c.n++ }        // POINTER receiver

// Method set of  Counter : Value
// Method set of *Counter : Value AND Inc
//
// So a POINTER satisfies any interface a value does, but not the reverse:
type Incrementer interface{ Inc() }

var _ Incrementer = &Counter{}    // OK
// var _ Incrementer = Counter{}  // COMPILE ERROR: Inc has a pointer receiver
//                                // "method Inc has pointer receiver"

// Calling it directly looks like it works, because Go inserts &c for you, 
// but ONLY when the value is ADDRESSABLE:
c := Counter{}
c.Inc()                       // fine: shorthand for (&c).Inc()

m := map[string]Counter{"a": {}}
// m["a"].Inc()               // ERROR: map elements are NOT addressable
// Fix: use map[string]*Counter, or read-modify-write the whole value.

var items []Counter
items[0].Inc()                // fine: slice elements ARE addressable

// Same trap in a range loop, v is a copy, so mutation is lost:
for _, v := range items { v.Inc() }        // no effect on items
for i := range items     { items[i].Inc() } // correct`
    },
    { t: "note", kind: "tip", title: "The practical rule", html: "Pick <strong>one</strong> receiver kind per type and stick to it; if any method needs a pointer, make them all pointers. Then store and pass <code>*T</code> everywhere, and the whole class of \"method has pointer receiver\" and \"not addressable\" errors disappears." },

    { t: "h", text: "Interfaces" },
    { t: "p", html: "An interface is a list of methods. Any type that has those methods satisfies the interface. There is no <code>implements</code> keyword. An interface value is nil only when it holds neither a type nor a value. A nil pointer stored in an interface is not a nil interface." },
    { t: "code", title: "No `implements` keyword, there is nothing to declare", code:
`type Shape interface {
    Area() float64
    Perimeter() float64
}

// Rect satisfies Shape simply by having both methods. No registration,
// no base class, and Rect need not know Shape exists.
func describe(s Shape) {
    fmt.Printf("area=%.2f perimeter=%.2f\\n", s.Area(), s.Perimeter())
}

// A compile-time assertion that a type satisfies an interface,
// costing zero bytes. Put it near your type when the link matters.
var _ Shape = (*Rect)(nil)`
    },
    { t: "note", kind: "tip", title: "\"Accept interfaces, return structs\"", html: "Take the smallest interface you need as a parameter, callers can pass anything, including a fake in tests. Return concrete types so callers keep full access and you don't have to guess what they'll want." },

    { t: "h", text: "Small interfaces" },
    { t: "p", html: "An interface with one method, such as <code>io.Reader</code>, is easy to implement and easy to fake in a test. Declare the interface in the package that uses it, not in the package that provides the concrete type." },
    { t: "code", title: "The single-method interfaces that hold the stdlib together", code:
`type Reader interface { Read(p []byte) (n int, err error) }
type Writer interface { Write(p []byte) (n int, err error) }
type Stringer interface { String() string }
type error interface { Error() string }

// Because they're tiny, everything composes:
io.Copy(dst, src)                 // any Writer <- any Reader
json.NewDecoder(resp.Body)        // HTTP body is a Reader
json.NewEncoder(w)                // HTTP response is a Writer
io.Copy(os.Stdout, strings.NewReader("hi"))

// Implement Stringer and fmt uses it everywhere, automatically
type Point struct{ X, Y int }
func (p Point) String() string { return fmt.Sprintf("(%d,%d)", p.X, p.Y) }
fmt.Println(Point{1,2})           // (1,2)

// Interfaces compose by embedding
type ReadWriter interface { Reader; Writer }`
    },

    { t: "h", text: "Type assertions" },
    { t: "p", html: "<code>v, ok := i.(string)</code> asks whether the interface <code>i</code> holds a string. If it does not, <code>ok</code> is false and the program does not panic. <code>switch v := i.(type)</code> does the same for several types, and <code>v</code> has the matched type inside each case." },
    { t: "code", title: "Getting the concrete value back out", code:
`var i any = "hello"

s := i.(string)          // panics if i isn't a string
s, ok := i.(string)      // comma-ok: never panics; ok is false on mismatch
if !ok { /* not a string */ }

switch v := i.(type) {
case string: fmt.Println("string of length", len(v))
case int:    fmt.Println("int", v)
case Shape:  fmt.Println("area", v.Area())   // interfaces work as cases too
default:     fmt.Printf("unhandled %T\\n", v)
}

// Probing for an optional capability, a very common stdlib move
if f, ok := w.(io.Closer); ok { f.Close() }`
    },

    { t: "h", text: "Embedding" },
    { t: "p", html: "Writing a type inside a struct with no field name promotes its fields and methods, so you can call them on the outer value. That looks like inheritance. It is not: the outer type does not become the inner type, and there is no automatic call back to the outer type." },
    { t: "code", title: "Composition with method promotion", code:
`type Animal struct{ Name string }
func (a Animal) Speak() string { return a.Name + " makes a sound" }

type Dog struct {
    Animal              // embedded: Dog gets Name and Speak()
    Breed string
}

d := Dog{Animal{"Rex"}, "Lab"}
fmt.Println(d.Name, d.Speak())      // Rex, "Rex makes a sound"

// "Override" by defining the same method on the outer type
func (d Dog) Speak() string { return d.Name + " barks" }
fmt.Println(d.Speak())              // "Rex barks"
fmt.Println(d.Animal.Speak())       // the embedded one is still reachable

// This is NOT inheritance: there is no virtual dispatch through Animal.
// If a function takes an Animal, it gets a copy with Animal's Speak().
// Embedding an INTERFACE is great for decorating behaviour:
type LoggingStore struct {
    Store                // interface: forwards every method you don't override
}
func (l LoggingStore) Get(k string) (string, error) {
    log.Println("get", k)
    return l.Store.Get(k)
}`
    },
    { t: "note", kind: "deep", title: "What an interface value actually is" },
    { t: "p", html: "Two words: a pointer to <strong>type information</strong> (the <em>itab</em>, holding the dynamic type plus a method dispatch table) and a pointer to the <strong>data</strong>. An interface is nil only when <em>both</em> words are nil. That detail causes Go's most infamous bug:" },
    { t: "diagram", id: "iface-value" },
    { t: "code", title: "The nil-interface trap, read this twice", code:
`type MyErr struct{}
func (e *MyErr) Error() string { return "boom" }

func bad() error {
    var p *MyErr = nil      // a nil POINTER
    return p                // boxed into an error interface: type=*MyErr, data=nil
}

if err := bad(); err != nil {
    // THIS RUNS. err is non-nil because its type word is set.
    fmt.Println("surprise:", err)
}

// Fix: return a literal nil for the error type.
func good() error {
    if somethingWrong() { return &MyErr{} }
    return nil              // both words nil -> truly nil
}

// Same rule: never declare a function's return type as a concrete
// error pointer (*MyErr), return the error interface.`
    }
  ],
  summary: [
    "Methods attach to any type you define, with value or pointer receivers.",
    "`*T`'s method set includes value *and* pointer methods; `T`'s has only value methods, so a `T` value may fail to satisfy an interface its pointer satisfies.",
    "Go auto-takes the address for `c.Inc()` only when the value is addressable, map elements and range copies are not.",
    "Interfaces are satisfied implicitly, no `implements`, no registration, no coupling to the interface.",
    "Keep interfaces small (often one method); that's why `io.Reader`/`io.Writer` compose with everything.",
    "Accept interfaces, return concrete types. `var _ I = (*T)(nil)` asserts conformance at compile time.",
    "`v, ok := x.(T)` is the safe assertion; type switches handle many cases including other interfaces.",
    "Embedding promotes methods but is composition, not inheritance, there's no virtual dispatch to the outer type.",
    "An interface holding a nil pointer is **not** nil: return literal `nil`, never a typed nil pointer."
  ],
  quiz: [
    { q: "How does a type declare that it implements an interface?",
      options: ["`implements Shape`", "Embed the interface", "It doesn't, having the methods is enough", "Register it with the runtime"],
      answer: 2,
      explain: "Satisfaction is structural and implicit, checked at compile time wherever the value is used as the interface." },
    { q: "`func f() error { var p *MyErr; return p }`. Is `f() != nil`?",
      options: ["False, p is nil", "True, the interface carries the *MyErr type word", "Compile error", "Panics"],
      answer: 1,
      explain: "An interface is nil only when both its type and data words are nil. Return literal nil instead." },
    { q: "Best practice for function signatures?",
      options: ["Accept concrete, return interfaces", "Accept interfaces, return concrete types", "Interfaces everywhere", "Concrete everywhere"],
      answer: 1,
      explain: "Flexible input, maximally useful output, and it keeps tests easy to fake." },
    { q: "`Dog` embeds `Animal` and defines its own `Speak()`. A function taking an `Animal` value and calling `Speak()` gets?",
      options: ["Dog's Speak, virtual dispatch", "Animal's Speak, there is no inheritance", "Compile error", "Whichever was defined last"],
      answer: 1,
      explain: "Embedding is composition. Passing a Dog as an Animal copies the embedded struct; Animal knows nothing about Dog." },
    { q: "`Inc()` has a pointer receiver on `Counter`. Which line fails to compile?",
      options: ["`var i Incrementer = &Counter{}`", "`var i Incrementer = Counter{}`", "`c := Counter{}; c.Inc()`", "`items[0].Inc()` on a `[]Counter`"],
      answer: 1,
      explain: "`Counter`'s method set excludes pointer-receiver methods, so the value doesn't satisfy the interface. The direct calls work because `c` and `items[0]` are addressable, so Go inserts `&`." }
  ]
},

/* ───────────────────────────── 13 ───────────────────────────── */
{
  id: "errors",
  level: "Intermediate",
  icon: "⚠️",
  title: "Errors, Wrapping, Panic & Recover",
  minutes: 18,
  blurb: "Errors are values. Wrap for context, inspect with errors.Is/As, and panic only for bugs.",
  blocks: [
    { t: "h", text: "Errors" },
    { t: "p", html: "An error is any type with an <code>Error() string</code> method. Returning <code>nil</code> means success. The usual signature is <code>(result, error)</code>, with the error last. Check the error before you use the result." },
    { t: "code", title: "One method, enormous consequences", code:
`type error interface {
    Error() string
}

// Creating errors
err := errors.New("something failed")
err = fmt.Errorf("user %d not found", id)

// Sentinel errors: exported package-level values callers can compare against
var ErrNotFound = errors.New("not found")

func Find(id int) (*User, error) {
    if id <= 0 {
        return nil, ErrNotFound
    }
    return &User{ID: id}, nil
}

// Check immediately, every time, at the call site
u, err := Find(1)
if err != nil {
    return fmt.Errorf("loading dashboard: %w", err)   // add context, keep the cause
}
use(u)`
    },
    { t: "note", kind: "tip", title: "Why no exceptions?", html: "Exceptions make failure <em>invisible</em> at the call site, any line might throw, and control flow jumps somewhere you can't see. Go makes failure part of the signature. It's wordier; it's also why Go code tends to handle its errors." },

    { t: "h", text: "Wrapping errors" },
    { t: "p", html: "<code>fmt.Errorf(\"reading %s: %w\", path, err)</code> adds context and keeps the original error. <code>%w</code> is what lets <code>errors.Is</code> and <code>errors.As</code> walk the chain. <code>%v</code> makes a new error and throws the chain away." },
    { t: "code", title: "%w wraps; errors.Is and errors.As unwrap", code:
`// %w embeds the original error so it stays inspectable.
// %v would only copy its text and destroy the chain.
if err != nil {
    return fmt.Errorf("fetching config %q: %w", path, err)
}
// Message reads top-down:
// "starting server: fetching config \\"app.yaml\\": open app.yaml: no such file"

// errors.Is, compare against a sentinel ANYWHERE in the chain
if errors.Is(err, os.ErrNotExist)  { /* file missing */ }
if errors.Is(err, ErrNotFound)     { return http.StatusNotFound }
if errors.Is(err, context.DeadlineExceeded) { /* timed out */ }

// errors.As, extract a concrete error type from the chain
var pathErr *os.PathError
if errors.As(err, &pathErr) {
    fmt.Println("failed on path:", pathErr.Path)
}

// Wrap several at once (Go 1.20+)
err = errors.Join(err1, err2)

// Never compare with == across a wrap: err == ErrNotFound is false
// once it's been wrapped. Always use errors.Is.`
    },

    { t: "h", text: "Custom errors" },
    { t: "p", html: "A struct with an <code>Error() string</code> method is an error that can carry fields, such as a status code. Callers who need those fields use <code>errors.As</code> to pull the struct back out of the chain." },
    { t: "code", title: "When callers need structured detail", code:
`type ValidationError struct {
    Field string
    Value any
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("invalid value %v for field %s", e.Value, e.Field)
}

// Implement Unwrap() to participate in the chain
type QueryError struct {
    Query string
    Err   error
}
func (e *QueryError) Error() string { return e.Query + ": " + e.Err.Error() }
func (e *QueryError) Unwrap() error { return e.Err }

// Usage
var ve *ValidationError
if errors.As(err, &ve) {
    return badRequest(ve.Field)
}`
    },

    { t: "h", text: "Panic and recover" },
    { t: "p", html: "<code>panic</code> stops the normal flow for a bug you did not expect, such as a nil that must not be nil. <code>recover</code> only works inside a deferred function in the same goroutine. Do not use panic for a bad user request. Return an error." },
    { t: "code", title: "Panic is for \"this program has a bug\"", code:
`// Panic unwinds the stack, running deferred functions as it goes,
// then crashes the process with a stack trace.
panic("unreachable state")

// Things that panic on their own:
//   nil pointer dereference      slice index out of range
//   writing to a nil map         closing a closed channel
//   integer divide by zero       failed single-value type assertion

// recover() stops a panic, but ONLY inside a deferred function
func safeDo() (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered from panic: %v", r)
        }
    }()
    riskyThirdPartyCall()
    return nil
}

// Legitimate uses of recover:
//  • at a server's request boundary, so one bad request doesn't kill the process
//  • at a library's public edge, converting an internal panic into an error
func middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                log.Printf("panic: %v\\n%s", rec, debug.Stack())
                http.Error(w, "internal error", 500)
            }
        }()
        next.ServeHTTP(w, r)
    })
}`
    },
    { t: "note", kind: "warn", title: "recover() does not cross goroutines", html: "A panic in a goroutine can only be recovered by a deferred function <strong>in that same goroutine</strong>. An unrecovered panic anywhere kills the whole process. Every goroutine that runs untrusted or complex work needs its own recover." },
    { t: "p", html: "<code>log.Fatal</code> (prints then <code>os.Exit(1)</code>) is appropriate in <code>main</code> for unrecoverable startup failures, but note it skips deferred functions. Never call it from a library." },

    { t: "h", text: "Error handling patterns" },
    { t: "p", html: "These are the shapes you will see in the standard library: wrap errors with context, check them at the boundary, and keep interfaces small. Copy the shape, not a framework." },
    { t: "code", title: "Three habits", code:
`// 1. Handle once. Either wrap-and-return OR log, doing both duplicates noise.
if err != nil { return fmt.Errorf("saving user: %w", err) }

// 2. Add context the caller can't infer: what you were doing, which input.
//    "open app.yaml: permission denied" beats "permission denied".

// 3. Use errors.Is/As at the boundary where you can actually decide.
switch {
case errors.Is(err, ErrNotFound):   w.WriteHeader(404)
case errors.As(err, &ve):           w.WriteHeader(400)
default:                            w.WriteHeader(500)
}`
    },

    { t: "h", text: "Write these five programs" },
    { t: "p", html: "These use the intermediate lessons: slices, maps, structs, pointers, methods, interfaces, and errors. Two of them are small algorithm problems. Each one is a small <code>package main</code>. You are done when the behaviour below holds." },
    { t: "list", ordered: true, items: [
      "<strong>Two sum.</strong> <code>twoSum(nums []int, target int) (int, int, error)</code>. Find two different indexes whose values add up to <code>target</code>, using a <code>map</code> so you walk the slice once. For <code>[]int{2, 7, 11, 15}</code> and target <code>9</code>, print <code>0</code> and <code>1</code>. When no pair exists, return an error and print that error.",
      "<strong>Balanced brackets.</strong> <code>balanced(s string) bool</code>. Walk the string once. A slice is your stack: append an opening bracket, and take it off the end when the matching closer arrives. <code>()[]{}</code> prints <code>true</code>. <code>(]</code> prints <code>false</code>. An empty string prints <code>true</code>.",
      "<strong>Shopping basket.</strong> A struct <code>Item</code> with <code>Name string</code> and <code>Price int</code>, the price in cents. Start with a slice of three items. <code>total(items []Item) int</code> adds the prices. Append a fourth item and print the new total.",
      "<strong>Point.</strong> A struct <code>Point</code> with <code>X</code> and <code>Y</code> as <code>float64</code>. <code>Move</code> has a pointer receiver and changes the point. <code>Distance</code> has a value receiver and returns the distance from the origin. Print the point before <code>Move</code>, after <code>Move</code>, and the distance.",
      "<strong>Lookup error.</strong> <code>var ErrNotFound = errors.New(\"not found\")</code>. <code>find(name string) (string, error)</code> looks in a map. On a miss it returns <code>fmt.Errorf(\"find %s: %w\", name, ErrNotFound)</code>. The caller prints the error and uses <code>errors.Is</code> so only that sentinel prints <code>missing</code>."
    ]}
  ],
  summary: [
    "`error` is a one-method interface; failures are ordinary values returned last and checked immediately.",
    "Wrap with `%w` to add context while preserving the cause; `%v` flattens and loses the chain.",
    "`errors.Is` compares against sentinels through the chain; `errors.As` extracts a concrete type. Never `==` across a wrap.",
    "Custom error types carry structured data; implement `Unwrap()` to stay in the chain.",
    "Panic means programmer bug, nil deref, index out of range, write to nil map, not an expected failure.",
    "`recover()` only works in a deferred function in the *same* goroutine; use it at server/library boundaries.",
    "Handle an error once: wrap and return, or log, not both."
  ],
  quiz: [
    { q: "Difference between `%w` and `%v` in `fmt.Errorf`?",
      options: ["None", "`%w` wraps so errors.Is/As can still find the cause; `%v` only copies the text", "`%w` is for warnings", "`%v` wraps, `%w` formats"],
      answer: 1,
      explain: "`%w` records the cause in the chain. `%v` produces an opaque new error." },
    { q: "`err` wraps `ErrNotFound`. Which test succeeds?",
      options: ["`err == ErrNotFound`", "`errors.Is(err, ErrNotFound)`", "`err.(ErrNotFound)`", "`reflect.DeepEqual(err, ErrNotFound)`"],
      answer: 1,
      explain: "`errors.Is` walks the Unwrap chain; `==` only matches an unwrapped sentinel." },
    { q: "Where must `recover()` be called to stop a panic?",
      options: ["Anywhere in the function", "Inside a deferred function in the same goroutine", "In main()", "In any goroutine"],
      answer: 1,
      explain: "Outside a defer it returns nil, and it cannot cross goroutine boundaries." },
    { q: "Which of these panics at runtime?",
      options: ["Reading a missing map key", "Appending to a nil slice", "Writing to a nil map", "Ranging over a nil slice"],
      answer: 2,
      explain: "Nil-map writes panic. The other three are all well-defined and safe." },
    { q: "When should a library panic?",
      options: ["On any invalid input", "On network failure", "Essentially never, return an error; panic signals a programmer bug", "Instead of returning errors, for speed"],
      answer: 2,
      explain: "Panics escape the caller's control flow. Reserve them for impossible states, and recover at your public boundary if internals panic." }
  ]
}

]);
