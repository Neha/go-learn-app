/* Web app and API build guides, appended to the project list */
window.PROJECTS = (window.PROJECTS || []).concat([

/* ══════════════════════════ WEB APPS ══════════════════════════ */

{
  id: "inkwell",
  category: "Web Apps",
  icon: "✍️",
  name: "inkwell, a server-rendered blog & CMS",
  tagline: "A complete web application with no JavaScript framework: sessions, CSRF, bcrypt auth, image uploads, markdown, an admin area and HTMX for interactivity.",
  level: "Intermediate",
  time: "14–22 hours",
  stack: ["html/template", "embed", "sessions + cookies", "bcrypt", "SQLite or Postgres", "HTMX", "httptest"],
  covers: ["stdlib-service", "errors", "methods-interfaces", "testing", "security"],
  blocks: [
    { t: "p", html: "Go is excellent at the thing the industry forgot how to do: render HTML on the server, fast, from one binary. This project is a real multi-user web app, public blog, login, draft/publish workflow, image uploads, comments with moderation, and the entire frontend is <code>html/template</code> plus about 30 lines of HTMX. No npm, no build step, no hydration." },
    { t: "h", text: "Pages and routes" },
    { t: "p", html: "These are the pages and the form posts. Public routes need no login. The rest should refuse a request that has no session." },
    { t: "code", title: "The surface", code:
`PUBLIC
  GET  /                      paginated post list
  GET  /posts/{slug}          a post, rendered markdown, comments
  POST /posts/{slug}/comments create a comment (CSRF + honeypot + rate limit)
  GET  /tags/{tag}            filtered list
  GET  /feed.xml              RSS
  GET  /static/*              embedded CSS/JS/images

AUTH
  GET/POST /login             session cookie on success
  POST     /logout
  GET/POST /register          (or seeded admin only, your call)

ADMIN  (requires a session + the author/admin role)
  GET      /admin             dashboard: counts, recent comments
  GET/POST /admin/posts/new
  GET/POST /admin/posts/{id}/edit     autosave draft via HTMX
  POST     /admin/posts/{id}/publish
  POST     /admin/media               image upload -> resized + stored
  POST     /admin/comments/{id}/approve | /delete`
    },
    { t: "h", text: "Templates: layout + partials, parsed once" },
    { t: "p", html: "Parse the templates once when the program starts, and embed them in the binary. A request only fills in the data." },
    { t: "code", title: "html/template done properly", code:
`//go:embed templates/* static/*
var assets embed.FS

// Parse ONCE at startup, not per request. A template set per page, each
// composed from the base layout plus shared partials.
func parseTemplates() (map[string]*template.Template, error) {
    funcs := template.FuncMap{
        "fmtDate":  func(t time.Time) string { return t.Format("2 Jan 2006") },
        "markdown": renderMarkdown,          // returns template.HTML, SANITISE IT
        "csrf":     func(tok string) template.HTML {
            return template.HTML(fmt.Sprintf(
                ` + "`" + `<input type="hidden" name="csrf_token" value="%s">` + "`" + `,
                template.HTMLEscapeString(tok)))
        },
    }
    pages, _ := fs.Glob(assets, "templates/pages/*.html")
    out := map[string]*template.Template{}
    for _, p := range pages {
        name := filepath.Base(p)
        t, err := template.New(name).Funcs(funcs).ParseFS(assets,
            "templates/layout.html", "templates/partials/*.html", p)
        if err != nil { return nil, fmt.Errorf("parse %s: %w", name, err) }
        out[name] = t
    }
    return out, nil
}

// Render into a BUFFER first: if execution fails halfway you have already
// written a 200 and half a page. Buffer, then copy.
func (s *Server) render(w http.ResponseWriter, status int, page string, data any) {
    t, ok := s.tmpl[page]
    if !ok { s.serverError(w, fmt.Errorf("no template %q", page)); return }
    var buf bytes.Buffer
    if err := t.ExecuteTemplate(&buf, "layout", data); err != nil {
        s.serverError(w, err); return
    }
    w.Header().Set("Content-Type", "text/html; charset=utf-8")
    w.WriteHeader(status)
    buf.WriteTo(w)
}`
    },
    { t: "note", kind: "warn", title: "html/template escapes, until you hand it HTML", html: "<code>html/template</code> is <em>contextually</em> auto-escaping: it knows the difference between an attribute, a URL, a JS literal and body text, which kills most XSS for free. The moment you return <code>template.HTML</code> from a markdown renderer, you have opted out, so sanitise the rendered output with <code>bluemonday.UGCPolicy()</code> before marking it safe. Never use <code>text/template</code> for HTML." },

    { t: "h", text: "Sessions, cookies and CSRF" },
    { t: "p", html: "The session cookie must be HttpOnly so a script cannot read it, Secure so it is only sent over HTTPS, and SameSite so another site cannot send it. A CSRF token is a second check on every form post." },
    { t: "code", title: "The security basics that are non-negotiable", code:
`// Cookie flags: get these wrong and everything else is theatre.
http.SetCookie(w, &http.Cookie{
    Name:     "session",
    Value:    token,                        // 32 random bytes from crypto/rand
    Path:     "/",
    MaxAge:   int(7 * 24 * time.Hour / time.Second),
    HttpOnly: true,                         // JS cannot read it -> XSS can't steal it
    Secure:   true,                         // HTTPS only
    SameSite: http.SameSiteLaxMode,         // blocks most CSRF by itself
})

// Store sessions SERVER-SIDE (table or Redis) keyed by that random token, so
// logout and "sign out everywhere" actually work. Rotate the session ID on
// login to prevent session fixation.

// Passwords: bcrypt (or argon2id). Never SHA-256, never unsalted, never
// a comparison with ==.
hash, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
err = bcrypt.CompareHashAndPassword(hash, []byte(attempt))   // constant time

// Login hardening: identical error text and similar timing for "no such user"
// and "wrong password", per-IP and per-account rate limits, and a lockout or
// exponential delay after repeated failures.

// CSRF: a per-session token in a hidden field, compared with
// subtle.ConstantTimeCompare on every non-GET request. Middleware, not
// per-handler, one forgotten handler is the hole.`
    },
    { t: "code", title: "File uploads without becoming a malware host", code:
`func (s *Server) upload(w http.ResponseWriter, r *http.Request) {
    r.Body = http.MaxBytesReader(w, r.Body, 10<<20)          // 10 MB hard cap
    if err := r.ParseMultipartForm(8 << 20); err != nil {    // 8 MB in memory
        s.clientError(w, http.StatusRequestEntityTooLarge); return
    }
    file, hdr, err := r.FormFile("image")
    if err != nil { s.clientError(w, 400); return }
    defer file.Close()

    // Sniff the REAL type from the bytes. Never trust the filename or the
    // client-supplied Content-Type.
    head := make([]byte, 512)
    n, _ := io.ReadFull(file, head)
    ct := http.DetectContentType(head[:n])
    if ct != "image/jpeg" && ct != "image/png" && ct != "image/webp" {
        s.clientError(w, http.StatusUnsupportedMediaType); return
    }
    file.Seek(0, io.SeekStart)

    // Generate your OWN filename, never use hdr.Filename in a path
    // ("../../etc/passwd" is a real submission).
    name := uuid.NewString() + extFor(ct)
    _ = hdr
    // Then: decode + resize with image/jpeg + x/image/draw, write to disk or
    // object storage, store the metadata row, and serve uploads from a path
    // with Content-Disposition and a restrictive Content-Security-Policy.
}`
    },
    { t: "note", kind: "tip", title: "HTMX is the shortcut Go deserves", html: "Add <code>hx-post</code>/<code>hx-get</code>/<code>hx-target</code> attributes to your HTML and the server returns an HTML <em>fragment</em> instead of JSON. Live comment posting, autosave, inline edit, infinite scroll and optimistic deletes all become small handlers that render one partial. You keep server-side rendering, you keep one language, and the page still works with JavaScript disabled if you render the full page on a non-HTMX request (check the <code>HX-Request</code> header)." }
  ],
  milestones: [
    { title: "Static pages from embedded templates", detail: "Layout + partials parsed once at startup, buffered rendering, `go:embed` for templates and CSS, a 404 and a 500 page. Tests asserting status + a substring via `httptest`." },
    { title: "Posts from a database", detail: "Migrations, a `post` domain package, slugs, a list page with keyset pagination, and a single-post page. Markdown rendered and **sanitised**." },
    { title: "Auth and sessions", detail: "bcrypt users, server-side sessions, secure cookie flags, login/logout, session rotation, `requireUser` middleware, redirect-after-login." },
    { title: "CSRF + form handling", detail: "CSRF middleware on every non-GET route, a reusable form-decode-and-validate helper, field-level errors re-rendered with the user's input preserved, and flash messages via the session." },
    { title: "Admin area", detail: "Create/edit/publish with draft state, role check, soft delete, and an audit trail of who changed what." },
    { title: "Uploads and media", detail: "Size cap, content sniffing, server-generated filenames, resize to a thumbnail, metadata rows, and a media picker in the editor." },
    { title: "HTMX interactivity", detail: "Comment posting, autosave drafts, inline approve/delete returning fragments. Each handler serves both a full page and a fragment depending on `HX-Request`." },
    { title: "Harden and ship", detail: "Security headers + CSP, per-IP rate limits on login and comments, request logging with request IDs, graceful shutdown, distroless container, and an end-to-end test that registers → logs in → publishes → comments." }
  ],
  done: [
    "Every form is CSRF-protected and rejects a request with a missing or stale token",
    "A post body containing `<script>alert(1)</script>` renders as text, never as script, asserted by a test",
    "Uploading a .php file renamed to .jpg is rejected by content sniffing",
    "Login failures are indistinguishable between unknown user and wrong password, and are rate limited",
    "Templates are parsed once at startup; a template error returns a clean 500 rather than a half-written page",
    "The whole app is one binary plus a database, `./inkwell` serves the site with no asset pipeline"
  ],
  stretch: [
    "Full-text search with Postgres tsvector or SQLite FTS5",
    "Scheduled publishing driven by jobq (project 5)",
    "Image variants generated asynchronously, with a blur-up placeholder",
    "Email: password reset and comment notifications with signed, expiring tokens",
    "Multi-author with per-post permissions and an editorial review state machine",
    "Swap HTMX for Templ or a-h/templ typed templates and compare the developer experience"
  ]
},

{
  id: "chatter",
  category: "Web Apps",
  icon: "💬",
  name: "chatter, real-time chat with WebSockets",
  tagline: "Multi-room chat with presence, typing indicators, history, reconnect and horizontal scaling through Redis pub/sub. The project that teaches long-lived connections.",
  level: "Advanced",
  time: "14–20 hours",
  stack: ["coder/websocket", "html/template", "sync", "Redis pub/sub", "Postgres", "context"],
  covers: ["concurrency", "stdlib-service", "pointers-memory", "reliability-observability", "testing"],
  blocks: [
    { t: "p", html: "An HTTP request lives for milliseconds; a WebSocket lives for hours. That single difference breaks every habit you built from request/response work: now you own goroutine lifetimes, backpressure for slow consumers, heartbeats, reconnection, and state that must survive a deploy. It is the best possible exercise for Go's concurrency primitives." },
    { t: "h", text: "Architecture" },
    { t: "p", html: "Each browser connection is one client. One goroutine reads from that connection and one writes to it, so a slow browser cannot block the others." },
    { t: "code", title: "One hub, two goroutines per client", code:
`  browser ──WS──┐
  browser ──WS──┤──▶ Client{ conn, send chan []byte, rooms map[string]bool }
  browser ──WS──┘         │                 │
                     readPump          writePump      <- exactly TWO goroutines
                     (conn -> hub)     (send -> conn)     per connection
                          │                 ▲
                          ▼                 │
                    ┌──── Hub ──────────────┘
                    │  register / unregister / broadcast  (ONE goroutine,
                    │  owns all state -> no mutex needed at all)
                    │  rooms map[string]map[*Client]struct{}
                    └──── persist to Postgres, publish to Redis

 Multi-instance: each instance SUBSCRIBES to a Redis channel per room and
 PUBLISHES every message it receives. A client connected to instance A sees
 messages from instance B. Presence lives in a Redis set with a TTL.

 Why a single hub goroutine: all mutation funnels through one channel, so the
 shared maps are owned by exactly one goroutine. That is the Go way, and it
 is dramatically easier to reason about than locking three maps.`
    },
    { t: "code", title: "The two pumps, and the slow-client rule", code:
`func (c *Client) readPump(ctx context.Context) {
    defer c.hub.unregister(c)                      // ALWAYS clean up
    c.conn.SetReadLimit(4 << 10)                   // cap message size
    for {
        ctx, cancel := context.WithTimeout(ctx, 60*time.Second)  // read deadline
        typ, data, err := c.conn.Read(ctx)
        cancel()
        if err != nil { return }                   // closed, timed out, or broken
        if typ != websocket.MessageText { continue }

        var in Incoming
        if err := json.Unmarshal(data, &in); err != nil { continue }
        if !c.limiter.Allow() { c.sendErr("slow down"); continue }   // per-client rate limit
        c.hub.inbound <- Envelope{Client: c, Msg: in}
    }
}

func (c *Client) writePump(ctx context.Context) {
    ping := time.NewTicker(30 * time.Second)
    defer ping.Stop()
    for {
        select {
        case msg, ok := <-c.send:
            if !ok { c.conn.Close(websocket.StatusNormalClosure, ""); return }
            wctx, cancel := context.WithTimeout(ctx, 10*time.Second)
            err := c.conn.Write(wctx, websocket.MessageText, msg)
            cancel()
            if err != nil { return }
        case <-ping.C:
            if err := c.conn.Ping(ctx); err != nil { return }   // detect dead peers
        case <-ctx.Done():
            return
        }
    }
}

// THE rule: the hub must NEVER block on a slow client.
func (h *Hub) send(c *Client, msg []byte) {
    select {
    case c.send <- msg:                 // buffered channel, e.g. cap 64
    default:
        close(c.send)                   // drop the client instead of stalling
        h.unregister(c)                 // everyone else keeps receiving
    }
}`
    },
    { t: "note", kind: "warn", title: "Where the leaks hide", html: "One forgotten <code>unregister</code> and the hub keeps a pointer to a dead client forever, with its 64-message buffer. Watch <code>runtime.NumGoroutine()</code> and your client count as a metric; after a load test they must both return to baseline. The other classic: a <code>WriteTimeout</code> on the <code>http.Server</code> silently kills every long-lived connection, so set deadlines per write with <code>http.NewResponseController</code> instead of globally." },
    { t: "note", kind: "tip", title: "WebSocket or SSE?", html: "If the server only ever <em>pushes</em>, dashboards, notifications, progress, Server-Sent Events is plain HTTP, reconnects automatically, needs no special proxy config, and is half the code (see project <em>pulse</em>). Choose WebSockets when you genuinely need low-latency client→server messages, which chat does. Knowing when <em>not</em> to use them is part of the lesson." }
  ],
  milestones: [
    { title: "Echo server", detail: "Upgrade a connection, read a message, write it back. A static page with ~30 lines of JS. Prove the handshake and the lifecycle before adding any state." },
    { title: "Hub with rooms", detail: "Single hub goroutine owning `rooms map[string]map[*Client]struct{}`, register/unregister/broadcast over channels, join/leave messages. No mutexes anywhere." },
    { title: "Robustness", detail: "Read limits, read/write deadlines, ping/pong heartbeats, buffered per-client send channel with drop-on-full, per-client rate limiting, graceful close codes." },
    { title: "Identity and history", detail: "Session auth reused from the web app, persisted messages in Postgres, last-50 backfill on join, keyset pagination for scrollback." },
    { title: "Presence and typing", detail: "Presence set with a TTL heartbeat, member list broadcasts, debounced typing indicators, last-seen timestamps." },
    { title: "Client resilience", detail: "Exponential-backoff reconnect in the browser, message IDs with client-side dedupe, an outbox so a message typed while offline sends on reconnect." },
    { title: "Scale horizontally", detail: "Redis pub/sub per room so two instances share traffic. Run two processes behind one proxy and verify cross-instance delivery." },
    { title: "Load test and observe", detail: "Script 1,000 concurrent clients; graph goroutines, memory, dropped clients, broadcast latency. Then make shutdown clean: close every connection with a status code and drain." }
  ],
  done: [
    "1,000 concurrent clients run with flat memory, and goroutine count returns to baseline after they disconnect",
    "A deliberately stalled client is dropped without delaying any other client's messages",
    "`go test -race` passes with a test that connects 50 clients to a `httptest` server and asserts fan-out",
    "Killing the network mid-session reconnects and replays missed messages without duplicates",
    "Two instances behind a proxy deliver each other's messages via Redis",
    "SIGTERM closes every socket with a normal closure code; no client sees a reset"
  ],
  stretch: [
    "Direct messages and private rooms with per-room authorisation",
    "File/image sharing reusing dropbin's upload path",
    "Message editing/deletion with a tombstone and ordering guarantees",
    "End-to-end encryption between clients, with the server as a blind relay",
    "A terminal client using the same protocol (Bubble Tea), proof the protocol is real",
    "Swap Redis for NATS and compare operational complexity and latency"
  ]
},

{
  id: "tilled",
  category: "Web Apps",
  icon: "🛒",
  name: "tilled, a storefront with real checkout",
  tagline: "Catalog, cart, Stripe test-mode payments, signed webhooks, an order state machine and idempotency. Money makes correctness non-negotiable.",
  level: "Advanced",
  time: "16–24 hours",
  stack: ["net/http", "html/template", "Postgres (tx)", "Stripe API", "webhooks + HMAC", "jobq"],
  covers: ["errors", "stdlib-service", "production-readiness", "reliability-observability", "security"],
  blocks: [
    { t: "p", html: "Everything you have built so far forgives a retry or a lost update. Payments do not. This project teaches the patterns that exist specifically because money is involved: integer currency, idempotency keys, webhook signature verification, exactly-once effects from at-least-once delivery, and state machines that cannot go backwards." },
    { t: "h", text: "The flow" },
    { t: "p", html: "The browser talks only to your server. Your server talks to the payment provider. The provider is the source of truth for whether money moved." },
    { t: "code", title: "Who is the source of truth?", code:
` browser                your server                    payment provider
   │  GET /products          │                                 │
   │  POST /cart/items       │  cart in session or a row        │
   │  POST /checkout         │─ create order (status=pending) ─▶│ create session
   │◀── redirect ────────────│◀──── checkout URL ──────────────│
   │──── pays on provider's hosted page ─────────────────────▶ │
   │◀── redirect /orders/{id}/thanks (NOT proof of payment!) ── │
   │                         │◀═══ WEBHOOK payment_intent.succeeded (signed)
   │                         │  verify sig -> mark paid -> enqueue fulfilment
   │                         │  (idempotent: the same event may arrive twice)

 RULE: the browser redirect is a UX hint, never the trigger for fulfilment.
 The user can close the tab; the webhook is the authoritative event. Design
 the whole system so the redirect landing page just READS the order state, 
 and shows "processing" if the webhook hasn't arrived yet.`
    },
    { t: "code", title: "Money, and the state machine", code:
`// NEVER use float64 for currency. Integer minor units, always.
type Money struct {
    Cents    int64
    Currency string      // ISO 4217
}
func (m Money) String() string { return fmt.Sprintf("%s%d.%02d",
    symbol(m.Currency), m.Cents/100, m.Cents%100) }
// 0.1 + 0.2 != 0.3 is funny in a tutorial and a lawsuit in a ledger.

type Status string
const (
    Pending   Status = "pending"
    Paid      Status = "paid"
    Fulfilled Status = "fulfilled"
    Refunded  Status = "refunded"
    Cancelled Status = "cancelled"
)

// Legal transitions, enforced in ONE place and asserted in the database
// (a CHECK constraint or a trigger), not scattered across handlers.
var allowed = map[Status][]Status{
    Pending: {Paid, Cancelled},
    Paid:    {Fulfilled, Refunded},
    Fulfilled: {Refunded},
}

func (o *Order) To(next Status) error {
    for _, s := range allowed[o.Status] {
        if s == next { o.Status = next; return nil }
    }
    return fmt.Errorf("illegal transition %s -> %s: %w", o.Status, next, ErrConflict)
}
// Also: recalculate the total SERVER-SIDE from current prices at checkout.
// Never trust a price, quantity or total that came from the browser.`
    },
    { t: "code", title: "Webhooks: verify, then be idempotent", code:
`func (s *Server) webhook(w http.ResponseWriter, r *http.Request) {
    body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
    if err != nil { w.WriteHeader(400); return }

    // 1. VERIFY THE SIGNATURE over the RAW body, with a constant-time compare,
    //    and reject stale timestamps (replay protection). An unverified
    //    webhook endpoint is an unauthenticated "mark my order paid" API.
    if err := verifySignature(r.Header.Get("Stripe-Signature"), body, s.secret); err != nil {
        slog.Warn("bad webhook signature", "err", err)
        w.WriteHeader(http.StatusBadRequest); return
    }

    var ev Event
    if err := json.Unmarshal(body, &ev); err != nil { w.WriteHeader(400); return }

    // 2. DEDUPE: providers retry, and will happily deliver the same event twice.
    //    A unique constraint on the event ID makes replay a no-op.
    if err := s.store.RecordEvent(r.Context(), ev.ID); err != nil {
        if errors.Is(err, ErrDuplicate) { w.WriteHeader(200); return }  // already handled
        w.WriteHeader(500); return
    }

    // 3. Do the minimum synchronously, inside ONE transaction, then return 200
    //    FAST. Slow handlers get retried and duplicated. Email, invoicing and
    //    shipping go to the job queue.
    if err := s.handleEvent(r.Context(), ev); err != nil {
        slog.Error("webhook handling", "event", ev.ID, "err", err)
        w.WriteHeader(500); return      // a 5xx asks the provider to retry
    }
    w.WriteHeader(200)
}`
    },
    { t: "note", kind: "warn", title: "Four bugs that cost real money", html: "<strong>(1)</strong> Trusting the success redirect instead of the webhook, the user closes the tab and you never ship. <strong>(2)</strong> No idempotency on checkout creation, a double-click charges twice; pass an idempotency key. <strong>(3)</strong> Recomputing nothing server-side, a tampered form buys a laptop for $1. <strong>(4)</strong> Stock decremented outside the payment transaction, oversell. Put the stock decrement and the status change in the same transaction, with a row-level lock or a conditional <code>UPDATE … WHERE stock &gt;= qty</code>." },
    { t: "note", kind: "tip", title: "You never need a real card", html: "Stripe (and every competitor) has a test mode with documented test cards, plus a CLI that replays real webhook payloads at <code>localhost</code>. For tests, run against a fake: a local <code>httptest</code> server that implements the three endpoints you use, so your whole suite is offline and deterministic. Never let CI call a payment provider." }
  ],
  milestones: [
    { title: "Catalog and cart", detail: "Products from the database, templates, a cart in the session, server-side price lookup. Tests for totals, including tax and multi-currency rounding." },
    { title: "Orders as a state machine", detail: "Order + line-item tables capturing the price *at purchase time*, transitions in one place, a database constraint that rejects illegal states." },
    { title: "Checkout with a fake provider", detail: "A `PaymentProvider` interface; implement it against a local `httptest` fake first. Idempotency key on creation; double-submit creates one order." },
    { title: "Webhooks", detail: "HMAC verification over the raw body with constant-time compare, timestamp replay window, event-ID dedupe table, transactional status change. Test the replay case explicitly." },
    { title: "Stock and concurrency", detail: "Conditional decrement inside the payment transaction. A test that runs 50 concurrent purchases of the last 10 items and asserts exactly 10 succeed." },
    { title: "Fulfilment asynchronously", detail: "Enqueue receipt email, invoice PDF and shipping notification via jobq. Webhook handler returns 200 in milliseconds." },
    { title: "Refunds and admin", detail: "Partial and full refunds through the provider plus the matching state transition, an order timeline view, and an immutable audit log of every money event." },
    { title: "Go live safely", detail: "Real provider in test mode end to end, secrets from a secret store, PII minimised (never store card data), structured logs with order IDs, alerts on failed webhooks and stuck pending orders." }
  ],
  done: [
    "Delivering the same webhook event three times produces exactly one paid order and one email",
    "A checkout double-click creates one order and one payment intent",
    "A tampered quantity or price in the form cannot change what is charged",
    "50 concurrent purchases of the last 10 units sell exactly 10, asserted by a `-race` test",
    "Closing the browser immediately after paying still results in a fulfilled order",
    "No card data touches your database, and no secret appears in a log line",
    "The full test suite runs offline against a fake provider"
  ],
  stretch: [
    "Discount codes and gift cards with their own redemption-once guarantees",
    "A double-entry ledger table so every cent is traceable, and reconcile it against provider payouts nightly",
    "Subscriptions: recurring billing, dunning on failed payment, proration",
    "Multi-vendor marketplace with split payouts",
    "Inventory reservation with a timeout so abandoned carts release stock",
    "Export an order CSV and generate invoice PDFs server-side"
  ]
},

/* ══════════════════════ APIs & SERVICES ══════════════════════ */

{
  id: "shelf",
  category: "APIs & Services",
  icon: "📚",
  name: "shelf, a production-grade REST API",
  tagline: "The complete API: JWT with refresh rotation, RBAC, pagination, filtering, validation, idempotency, ETags, OpenAPI, versioning and a documented error contract.",
  level: "Intermediate",
  time: "18–26 hours",
  stack: ["net/http", "JWT", "Postgres", "OpenAPI 3", "prometheus", "testcontainers"],
  covers: ["errors", "methods-interfaces", "stdlib-service", "testing", "security", "reliability-observability"],
  blocks: [
    { t: "p", html: "<em>snip</em> taught you a working API. This one teaches the hundred decisions that separate a working API from one other teams can build on: how errors are shaped, how clients page through a million rows without timing out, how a token is revoked, how you add a field without breaking anyone, and how all of that is documented and tested." },
    { t: "h", text: "The surface" },
    { t: "p", html: "This is the HTTP API. The auth routes hand out a short-lived token. Every other route requires that token." },
    { t: "code", title: "A bookshelf API, boring domain, interesting engineering", code:
`AUTH
  POST   /v1/auth/register
  POST   /v1/auth/login            -> access (15 min JWT) + refresh (30 d, rotating)
  POST   /v1/auth/refresh          -> new pair; REUSE of an old refresh = revoke all
  POST   /v1/auth/logout
  GET    /v1/me

BOOKS
  GET    /v1/books?q=&author=&year_gte=&sort=-published_at&limit=50&cursor=…
  POST   /v1/books                 (Idempotency-Key supported)
  GET    /v1/books/{id}            ETag + Cache-Control
  PATCH  /v1/books/{id}            If-Match required -> 412 on a stale write
  DELETE /v1/books/{id}            admin role only
  POST   /v1/books/{id}/cover      multipart upload
  GET    /v1/books/export          streaming CSV of a large result set

META
  GET    /v1/openapi.json          the spec, served from the binary
  GET    /docs                     rendered reference (embedded)
  GET    /healthz /readyz /version`
    },
    { t: "h", text: "One error contract, documented and tested" },
    { t: "p", html: "Every error response has the same JSON shape. A client checks a code, not the wording of a sentence." },
    { t: "code", title: "Clients should never have to parse prose", code:
`// Every non-2xx response has exactly this shape. Pick it once; never deviate.
type APIError struct {
    Error struct {
        Code      string            ` + "`json:\"code\"`" + `       // "validation_failed"
        Message   string            ` + "`json:\"message\"`" + `    // human, safe to show
        Fields    map[string]string ` + "`json:\"fields,omitempty\"`" + `
        RequestID string            ` + "`json:\"request_id\"`" + `
        DocsURL   string            ` + "`json:\"docs_url,omitempty\"`" + `
    } ` + "`json:\"error\"`" + `
}

// 400 invalid_request      malformed body/params
// 401 unauthenticated      missing/expired token      (WWW-Authenticate header)
// 403 forbidden            authenticated, not allowed
// 404 not_found, also use for "exists but you can't see it"
// 409 conflict             duplicate, or an illegal state transition
// 412 precondition_failed  If-Match didn't hold
// 422 validation_failed    well-formed but semantically invalid, + fields{}
// 429 rate_limited         + Retry-After
// 500 internal             NO detail, just the request ID; log the rest

// Map domain errors to this in ONE place at the transport boundary, handlers
// return errors, middleware renders them. Then write a test per status code.`
    },
    { t: "code", title: "Pagination that still works at ten million rows", code:
`// OFFSET pagination gets quadratically slower and skips/duplicates rows when
// data changes under the client. Use KEYSET (cursor) pagination:
//   SELECT ... WHERE (published_at, id) < ($cursorTime, $cursorID)
//   ORDER BY published_at DESC, id DESC LIMIT $limit + 1
// The cursor is an opaque base64 of the last row's sort key, opaque so you
// can change the implementation without breaking clients.

type Page[T any] struct {
    Data       []T    ` + "`json:\"data\"`" + `
    NextCursor string ` + "`json:\"next_cursor,omitempty\"`" + `   // absent = last page
    Limit      int    ` + "`json:\"limit\"`" + `
}

// Always: a DEFAULT limit (25) and a MAX limit (100). An unbounded limit is a
// denial-of-service endpoint you wrote yourself.
// Filtering: an allowlist of fields and operators parsed into parameterised
// SQL. Never interpolate a user-supplied sort column, that is SQL injection
// with extra steps.
var sortable = map[string]string{"published_at": "published_at", "title": "title"}`
    },
    { t: "code", title: "Auth: short access tokens, rotating refresh tokens", code:
`// Access token: a JWT, 15 minutes, signed (HS256 with a strong secret, or
// RS256/EdDSA if other services verify it). Claims: sub, exp, iat, jti, roles.
// Keep it small, and NEVER put anything secret in it, a JWT is signed, not
// encrypted, and anyone can read the payload.

// Refresh token: 32 random bytes, HASHED in the database (treat it like a
// password), long-lived, single use. On refresh: verify, mark used, issue a
// new pair in one transaction.
//
// REUSE DETECTION: if a refresh token that was already used comes back, the
// token was stolen -> revoke the whole family and force a re-login. This is
// the detail most tutorials skip and every real system needs.

func (s *Server) requireAuth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        tok, ok := bearer(r)
        if !ok { s.unauthorized(w, "missing bearer token"); return }
        claims, err := s.jwt.Verify(tok)          // signature + exp + iss + aud
        if err != nil { s.unauthorized(w, "invalid token"); return }
        ctx := auth.With(r.Context(), claims)     // typed context key
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// AUTHORISATION is per-RESOURCE, not just per-route: "can this user edit THIS
// book?" A role check in middleware plus an ownership check in the service.
// The classic breach (IDOR) is a valid token fetching someone else's /books/42.`
    },
    { t: "note", kind: "tip", title: "Spec-first pays for itself", html: "Write the OpenAPI document before the handlers, generate your request/response types or your client from it (<code>oapi-codegen</code>), serve the spec from the binary with <code>go:embed</code>, and add a CI check that the implementation still matches. You get real documentation, typed clients in any language, and a contract test for free. The alternative, handwritten docs, is wrong within a week." }
  ],
  milestones: [
    { title: "Spec first", detail: "Write `openapi.yaml` for the whole surface. Generate types/stubs, embed the spec, serve rendered docs at `/docs`. Review it before writing a handler." },
    { title: "CRUD + the error contract", detail: "Handlers return errors; one middleware renders `APIError` with a request ID. A test asserting the exact body for 400/404/409/422/500." },
    { title: "Validation layer", detail: "Decode with `DisallowUnknownFields` and a size cap, validate into field-level errors, 422 with a `fields` map. Fuzz the decoder so garbage never panics." },
    { title: "Auth", detail: "Register/login, 15-minute JWTs, hashed rotating refresh tokens with reuse detection, logout, `requireAuth` middleware, per-resource ownership checks. Tests for expired, tampered and replayed tokens." },
    { title: "Listing done right", detail: "Keyset pagination with opaque cursors, allowlisted filters and sorts, default and max limits. Benchmark page 1 vs page 10,000 and show the flat latency." },
    { title: "HTTP semantics", detail: "ETag + `If-None-Match` (304), `If-Match` on PATCH (412 on conflict), `Idempotency-Key` on POST, `Retry-After` on 429, correct `Cache-Control` and `Location` headers." },
    { title: "Streaming and uploads", detail: "`/export` streams CSV with a flush per N rows and no full result set in memory; cover upload with sniffing and size limits." },
    { title: "Operate it", detail: "Per-key rate limits, RED metrics by route pattern, OTel tracing, `/healthz` + `/readyz`, graceful shutdown, Docker + CI with integration tests against real Postgres." }
  ],
  done: [
    "Every documented status code has a test asserting the exact response body shape",
    "A valid token for user A cannot read, modify or delete user B's resources (IDOR test exists)",
    "A reused refresh token revokes the whole family and forces re-login",
    "Page 10,000 responds as fast as page 1, measured, not assumed",
    "Repeating a POST with the same `Idempotency-Key` returns the original result and creates nothing new",
    "A stale `If-Match` returns 412 instead of silently overwriting",
    "`/export` streams a million rows with flat memory",
    "The served OpenAPI spec matches the implementation, enforced in CI"
  ],
  stretch: [
    "A generated Go client package published as its own module, used by your own integration tests",
    "GraphQL on the same domain layer with gqlgen, DataLoader for the N+1 problem, and an honest comparison",
    "Field selection (`?fields=`) and sparse responses",
    "Webhooks *out*: let customers subscribe, with signing, retries and a dead-letter queue",
    "Multi-tenancy with row-level security and per-tenant rate limits",
    "API versioning in anger: ship /v2 with a breaking change while /v1 keeps working"
  ]
},

{
  id: "ledger-grpc",
  category: "APIs & Services",
  icon: "🔀",
  name: "ledger, gRPC services that talk to each other",
  tagline: "Protobuf contracts, codegen, streaming, interceptors, deadline propagation, mTLS and REST transcoding, the internal-API half of Go's ecosystem.",
  level: "Advanced",
  time: "16–24 hours",
  stack: ["protobuf", "grpc-go", "buf", "grpc-gateway", "OpenTelemetry", "mTLS"],
  covers: ["methods-interfaces", "concurrency", "errors", "reliability-observability", "production-readiness"],
  blocks: [
    { t: "p", html: "REST is how services talk to browsers; gRPC is how they talk to each other. You get a typed contract both sides compile against, HTTP/2 multiplexing, real streaming, generated clients, and deadlines that propagate automatically. Build two services, an <code>accounts</code> service and a <code>ledger</code> service, and make them call each other properly." },
    { t: "h", text: "The contract comes first" },
    { t: "p", html: "The <code>.proto</code> file is the API. Generate the Go types from it, and do not hand-write a second copy." },
    { t: "code", title: "proto/ledger/v1/ledger.proto", code:
`syntax = "proto3";
package ledger.v1;
option go_package = "github.com/you/ledger/gen/ledger/v1;ledgerv1";

import "google/protobuf/timestamp.proto";

service LedgerService {
  rpc CreateEntry(CreateEntryRequest) returns (Entry);                // unary
  rpc GetBalance(GetBalanceRequest)   returns (Balance);
  rpc ListEntries(ListEntriesRequest) returns (stream Entry);         // server stream
  rpc ImportEntries(stream Entry)     returns (ImportSummary);        // client stream
  rpc Watch(WatchRequest) returns (stream Event);                     // bidi-ish
}

message Entry {
  string id = 1;
  string account_id = 2;
  int64  amount_minor = 3;             // integers for money, always
  string currency = 4;
  google.protobuf.Timestamp created_at = 5;
  reserved 6;                          // a field you removed, NEVER reuse the number
}

// Compatibility rules that keep rolling deploys safe:
//   • field NUMBERS are the wire format, never change or reuse one
//   • adding an optional field is safe in both directions
//   • removing a field: reserve its number and name
//   • renaming a field is safe on the wire, breaking in JSON/code, treat as breaking
//   • "buf breaking --against .git#branch=main" enforces all of this IN CI`
    },
    { t: "code", title: "Codegen and the server", code:
`# buf.gen.yaml + one command, no hand-written client code, ever
buf lint && buf breaking --against '.git#branch=main' && buf generate

// The generated interface is the contract. Embed Unimplemented* so adding an
// RPC to the proto doesn't break compilation of every server.
type server struct {
    ledgerv1.UnimplementedLedgerServiceServer
    store Store
}

func (s *server) CreateEntry(ctx context.Context, req *ledgerv1.CreateEntryRequest) (*ledgerv1.Entry, error) {
    if req.GetAmountMinor() == 0 {
        // gRPC status codes, not strings, clients switch on these
        return nil, status.Error(codes.InvalidArgument, "amount_minor must be non-zero")
    }
    e, err := s.store.Create(ctx, toDomain(req))
    switch {
    case errors.Is(err, ErrDuplicate): return nil, status.Error(codes.AlreadyExists, "duplicate")
    case errors.Is(err, ErrNoAccount): return nil, status.Error(codes.NotFound, "account not found")
    case err != nil:                   return nil, status.Error(codes.Internal, "internal")
    }
    return toProto(e), nil
}

// Server streaming: push rows as you read them, constant memory for any size
func (s *server) ListEntries(req *ledgerv1.ListEntriesRequest,
    stream ledgerv1.LedgerService_ListEntriesServer) error {
    return s.store.Each(stream.Context(), req.GetAccountId(), func(e Entry) error {
        return stream.Send(toProto(e))      // honours the client's deadline
    })
}`
    },
    { t: "code", title: "Interceptors: middleware for gRPC", code:
`srv := grpc.NewServer(
    grpc.ChainUnaryInterceptor(
        // (current otelgrpc prefers a stats handler:
        //  grpc.StatsHandler(otelgrpc.NewServerHandler()), the interceptor
        //  form is deprecated. Check the version you pull in.)
        otelgrpc.UnaryServerInterceptor(),        // tracing, context propagated
        loggingInterceptor(logger),               // request_id, method, duration, code
        recoveryInterceptor(),                    // a panic must not kill the process
        authInterceptor(verifier),                // metadata-based token check
        validateInterceptor(),                    // protovalidate rules from the proto
        rateLimitInterceptor(limiter),
    ),
    grpc.KeepaliveParams(keepalive.ServerParameters{Time: 30 * time.Second}),
    grpc.MaxRecvMsgSize(4<<20),
    grpc.Creds(credentials.NewTLS(mtlsConfig)),   // mTLS: both sides authenticate
)
healthpb.RegisterHealthServer(srv, health.NewServer())   // for your orchestrator
reflection.Register(srv)                                 // lets grpcurl explore it

// CLIENT side: deadlines propagate automatically across the whole call tree,
// which is the single best reason to use gRPC internally.
ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
defer cancel()
conn, _ := grpc.NewClient(target,
    grpc.WithTransportCredentials(creds),
    grpc.WithDefaultServiceConfig(retryPolicy),    // declarative retries + backoff
    grpc.WithChainUnaryInterceptor(otelgrpc.UnaryClientInterceptor()),
)
// retryPolicy JSON: maxAttempts, initialBackoff, retryableStatusCodes
// ["UNAVAILABLE","RESOURCE_EXHAUSTED"], and NEVER a non-idempotent method.`
    },
    { t: "note", kind: "tip", title: "You still get REST and JSON", html: "<code>grpc-gateway</code> generates a reverse proxy from <code>google.api.http</code> annotations in your proto, so one service definition serves gRPC to internal callers <em>and</em> JSON/REST (plus a generated OpenAPI spec) to browsers and curl. <a href=\"https://connectrpc.com/\" target=\"_blank\" rel=\"noopener\">ConnectRPC</a> is the modern alternative: one server that speaks gRPC, gRPC-Web and plain HTTP/JSON with no proxy at all, worth evaluating as a stretch goal." },
    { t: "note", kind: "warn", title: "The gRPC footguns", html: "Reuse <strong>one</strong> <code>ClientConn</code> for the process, it pools and multiplexes; creating one per call is catastrophic. Always set a deadline; a gRPC call without one blocks forever. Streams leak if you don't drain or cancel them. Load balancing needs care: HTTP/2 holds a long-lived connection, so a plain L4 balancer pins you to one backend, use client-side round-robin with DNS resolution, a service mesh, or an L7 proxy." }
  ],
  milestones: [
    { title: "Proto + codegen pipeline", detail: "`buf` with lint and breaking-change checks, generated Go into `gen/`, a Makefile target, and CI running `buf lint` + `buf breaking`." },
    { title: "Unary service", detail: "Implement CreateEntry/GetBalance over Postgres, map domain errors to gRPC status codes, and test with `grpc.NewServer` on a bufconn listener, no real ports, fast tests." },
    { title: "Streaming", detail: "Server-stream ListEntries with constant memory, client-stream ImportEntries with batched commits, and a Watch stream fed by a channel. Test cancellation mid-stream." },
    { title: "Interceptors", detail: "Logging with request IDs, panic recovery, auth from metadata, validation, rate limiting. Unit-test each interceptor independently." },
    { title: "Service-to-service", detail: "A second `accounts` service; ledger calls it with a propagated deadline and a shared trace. Show a single trace spanning both services." },
    { title: "Resilience", detail: "Declarative retry policy, keepalives, client-side round-robin, a circuit breaker interceptor, and a test that kills one backend mid-load with zero client errors." },
    { title: "Security", detail: "mTLS with a local CA, per-method authorisation from token claims, message size limits. Verify an unauthenticated client gets UNAUTHENTICATED and a wrong-cert client is refused." },
    { title: "REST + ship", detail: "grpc-gateway for JSON, generated OpenAPI, health + reflection, containerise both services, compose them, and load-test gRPC vs the JSON gateway to see the real difference." }
  ],
  done: [
    "`buf breaking` in CI rejects a change that would break an existing client",
    "A client deadline of 100 ms aborts work inside the *downstream* service, proven by a log or span",
    "Streaming a million entries keeps memory flat on both sides and cancels cleanly",
    "Tests run over bufconn with no network and no fixed ports",
    "One trace shows ledger → accounts → database with accurate timings",
    "An unauthenticated or wrong-certificate client is rejected with the correct status code",
    "The same service is reachable by `grpcurl` and by `curl` through the gateway"
  ],
  stretch: [
    "Migrate to ConnectRPC and drop the gateway entirely",
    "Server-side field-mask support for partial updates",
    "Protobuf schema registry + consumer-driven contract tests",
    "gRPC-Web with a tiny TypeScript client",
    "Outbox pattern: publish domain events to Kafka/NATS in the same transaction as the write",
    "Benchmark protobuf vs JSON payload size and serialisation cost, and write up the numbers"
  ]
},

{
  id: "dropbin",
  category: "APIs & Services",
  icon: "📦",
  name: "dropbin, a file upload & sharing API",
  tagline: "Streaming multipart uploads, S3 presigned URLs, checksums, resumable transfers, range requests, quotas and signed expiring links. All about io.Reader.",
  level: "Advanced",
  time: "14–20 hours",
  stack: ["net/http", "io", "crypto/sha256", "S3 / MinIO", "Postgres", "jobq"],
  covers: ["data-types", "pointers-memory", "stdlib-service", "iterators", "security"],
  blocks: [
    { t: "p", html: "File handling is where <code>io.Reader</code> and <code>io.Writer</code> stop being abstractions you read about and start being the reason your service survives a 4 GB upload on a 512 MB container. Nothing here may ever call <code>io.ReadAll</code> on user data." },
    { t: "h", text: "The API" },
    { t: "p", html: "Small files are uploaded in the request body. Large files get a short-lived address to upload to directly, so the request does not hold the whole file in memory." },
    { t: "code", title: "Three upload paths, because size matters", code:
`POST   /v1/files                      small files: streaming multipart (<= 32 MB)
POST   /v1/files/presign              large files: client uploads DIRECTLY to S3
POST   /v1/files/{id}/complete        confirm a presigned upload, verify checksum
POST   /v1/uploads                    resumable: create a session
PATCH  /v1/uploads/{id}               append a chunk at an offset (tus-style)

GET    /v1/files/{id}                 metadata
GET    /v1/files/{id}/content         download: supports Range, ETag, If-None-Match
POST   /v1/files/{id}/share           -> signed, expiring, optionally one-time URL
GET    /s/{token}                     public download via a signed link
DELETE /v1/files/{id}                 soft delete, async purge
GET    /v1/usage                      quota: bytes used / allowed`
    },
    { t: "code", title: "Streaming upload: never buffer the whole body", code:
`func (s *Server) upload(w http.ResponseWriter, r *http.Request) {
    r.Body = http.MaxBytesReader(w, r.Body, s.maxUpload)

    // MultipartReader streams part by part. ParseMultipartForm would buffer
    // the whole thing in memory and spill to temp files, fine for a 2 MB
    // avatar, fatal for a 4 GB video.
    mr, err := r.MultipartReader()
    if err != nil { s.bad(w, "expected multipart/form-data"); return }

    for {
        part, err := mr.NextPart()
        if errors.Is(err, io.EOF) { break }
        if err != nil { s.bad(w, "malformed multipart"); return }
        if part.FormName() != "file" { part.Close(); continue }

        // Compute the hash WHILE streaming to storage, one pass, no temp file.
        h := sha256.New()
        counter := &countingWriter{}
        tee := io.TeeReader(part, io.MultiWriter(h, counter))

        key := s.keyFor(userID)
        if err := s.store.Put(r.Context(), key, tee); err != nil {   // S3 streams it
            s.serverError(w, err); return
        }
        sum := hex.EncodeToString(h.Sum(nil))

        // Quota is enforced AFTER the fact here, so also check the declared
        // Content-Length up front and reject early with 413.
        if err := s.db.RecordFile(r.Context(), userID, key, counter.n, sum); err != nil {
            _ = s.store.Delete(r.Context(), key)     // compensate: no orphans
            s.serverError(w, err); return
        }
        part.Close()
        s.json(w, 201, fileResponse{Size: counter.n, SHA256: sum})
        return
    }
    s.bad(w, "no file part")
}
// Memory used: one 32 KB copy buffer, regardless of file size.`
    },
    { t: "code", title: "Presigned URLs and range downloads", code:
`// For large files, do NOT proxy the bytes through your service, it burns
// your bandwidth, your memory and your request timeout. Hand the client a
// short-lived presigned PUT URL and let it talk to S3 directly.
url, err := presigner.PutObject(ctx, &s3.PutObjectInput{
    Bucket: aws.String(bucket), Key: aws.String(key),
    ContentLength: aws.Int64(declaredSize),
}, s3.WithPresignExpires(15*time.Minute))
// Then /complete verifies the object exists, its size and its checksum before
// marking the row usable. Until then the file row is "pending", and a
// scheduled job purges pending rows older than an hour.

// Downloads: http.ServeContent gives you Range requests, If-Modified-Since,
// If-None-Match and correct 206/304 responses for free.
func (s *Server) download(w http.ResponseWriter, r *http.Request) {
    f, meta, err := s.open(r.Context(), id)      // io.ReadSeeker
    if err != nil { s.notFound(w); return }
    defer f.Close()
    w.Header().Set("ETag", strconv.Quote(meta.SHA256))
    w.Header().Set("Content-Type", meta.ContentType)
    // Force a download rather than inline rendering: an uploaded .html served
    // inline from your domain is stored XSS.
    w.Header().Set("Content-Disposition",
        "attachment; filename*=UTF-8''"+url.PathEscape(meta.Name))
    w.Header().Set("X-Content-Type-Options", "nosniff")
    http.ServeContent(w, r, meta.Name, meta.ModTime, f)   // handles Range + 304
}

// Share links: HMAC over (fileID, expiry, oneTime) with a server secret.
// Verify with constant-time compare. No database lookup needed to reject a
// forged or expired link.`
    },
    { t: "note", kind: "warn", title: "Uploads are the most attacked endpoint you own", html: "Checklist: cap size (<code>MaxBytesReader</code> <em>and</em> a declared-length check), sniff the real content type from the bytes, <strong>generate your own filename</strong> (<code>hdr.Filename</code> may be <code>../../../etc/passwd</code> or a 4 KB Unicode payload), store outside the web root or in object storage, serve with <code>Content-Disposition: attachment</code> and <code>nosniff</code>, never execute or template an uploaded file, enforce per-user quotas and per-IP rate limits, and strip EXIF from images (it contains GPS). Then add a malware-scanning hook as an async job." },
    { t: "note", kind: "deep", title: "Why TeeReader is the hero of this project", html: "<code>io.TeeReader(src, w)</code> returns a reader that writes everything it reads into <code>w</code>. Combined with <code>io.MultiWriter</code>, one pass over the upload simultaneously streams to storage, computes SHA-256, counts bytes and could feed a virus scanner, with a single fixed-size buffer and no temp file. That composability is the whole argument for small interfaces (Module 9)." }
  ],
  milestones: [
    { title: "Streaming multipart upload", detail: "`MultipartReader`, size cap, local disk storage behind a `Blobstore` interface, SHA-256 computed inline with TeeReader. Test with a 100 MB generated file and assert flat memory." },
    { title: "Metadata and downloads", detail: "Postgres rows, `http.ServeContent` for Range/ETag/304, Content-Disposition and nosniff, soft delete. Test a partial Range request returns 206 with the right bytes." },
    { title: "Security hardening", detail: "Content sniffing with an allowlist, server-generated keys, path-traversal tests, EXIF stripping, per-user quota enforcement, per-IP rate limits." },
    { title: "Object storage", detail: "Implement the `Blobstore` interface against S3/MinIO; run MinIO in Docker for tests. Same test suite passes for disk and S3, proof the interface is right." },
    { title: "Presigned direct uploads", detail: "`/presign` + `/complete` with pending rows, checksum verification, and a scheduled purge of abandoned uploads." },
    { title: "Resumable uploads", detail: "Chunked PATCH with offsets, state in the database, resume after a killed client, and a concurrency guard so two writers can't interleave chunks." },
    { title: "Signed share links", detail: "HMAC tokens with expiry and optional one-time use, constant-time verification, a public download route with no auth, and revocation." },
    { title: "Async processing", detail: "Enqueue thumbnail generation, checksum re-verification and a virus-scan hook via jobq. Metrics for upload throughput, failures and storage used; then containerise and load-test." }
  ],
  done: [
    "Uploading a 1 GB file keeps process memory flat (verified with a heap profile)",
    "A filename of `../../etc/passwd` cannot escape the storage prefix, test exists",
    "An uploaded `.html` file downloads as an attachment and never renders inline",
    "Range requests return 206 with correct byte offsets; `If-None-Match` returns 304",
    "A forged or expired share token is rejected without a database query",
    "Abandoned presigned uploads are purged and never leave orphaned objects or rows",
    "The same test suite passes against local disk and against MinIO"
  ],
  stretch: [
    "Client-side chunked parallel upload with per-chunk checksums and server reassembly",
    "Content-addressed storage: dedupe identical files by hash and reference-count them",
    "On-the-fly image transforms (`?w=400&fmt=webp`) with a cache",
    "Server-side encryption with per-file keys, and key rotation",
    "Zip-on-the-fly: stream a multi-file archive without buffering it",
    "Virus scanning via ClamAV in a sidecar, quarantining on detection"
  ]
},

{
  id: "gateway",
  category: "APIs & Services",
  icon: "🚪",
  name: "gateway, an API gateway & BFF",
  tagline: "A reverse proxy you wrote: routing, auth termination, rate limits, circuit breaking, response caching, request aggregation and canary traffic splitting.",
  level: "Advanced",
  time: "12–18 hours",
  stack: ["httputil.ReverseProxy", "sync", "golang.org/x/time/rate", "gobreaker", "OpenTelemetry"],
  covers: ["concurrency", "methods-interfaces", "reliability-observability", "runtime-internals", "production-readiness"],
  blocks: [
    { t: "p", html: "Every platform grows one of these. Building it yourself, on top of <code>httputil.ReverseProxy</code>, which is about 400 lines of standard library, demystifies Nginx, Envoy and Kong, and forces you to understand HTTP hop-by-hop semantics, streaming bodies, connection pooling and cross-cutting resilience in one place." },
    { t: "h", text: "What it does" },
    { t: "p", html: "A YAML file lists each path and the servers behind it. The gateway reads that file and forwards the request." },
    { t: "code", title: "Config-driven routing", code:
`# gateway.yaml
listen: ":8080"
routes:
  - path: /api/users/
    upstreams: ["http://users-1:8081", "http://users-2:8081"]
    strip_prefix: /api
    auth: required                  # validate the JWT HERE, pass identity down
    timeout: 2s
    retries: 2                      # idempotent methods only
    rate_limit: { rps: 100, burst: 200, key: api_key }
    cache: { ttl: 30s, methods: [GET] }
    breaker: { failure_ratio: 0.5, min_requests: 20, cooldown: 30s }

  - path: /api/search/
    upstreams: ["http://search:8082"]
    canary: { upstream: "http://search-v2:8082", weight: 5 }   # 5% of traffic

  - path: /bff/dashboard           # AGGREGATION: fan out, merge, one response
    aggregate:
      - { name: user,  url: "http://users:8081/v1/me" }
      - { name: stats, url: "http://stats:8083/v1/summary" }
      - { name: feed,  url: "http://feed:8084/v1/recent", optional: true }`
    },
    { t: "code", title: "The proxy core", code:
`func newProxy(route Route, picker Picker) http.Handler {
    proxy := &httputil.ReverseProxy{
        Rewrite: func(pr *httputil.ProxyRequest) {       // Go 1.20+ API
            target := picker.Next()                       // load balancing
            pr.SetURL(target)
            pr.Out.Host = target.Host
            pr.SetXForwarded()                            // X-Forwarded-For/Proto/Host
            pr.Out.Header.Set("X-Request-Id", requestID(pr.In.Context()))
            if claims, ok := auth.From(pr.In.Context()); ok {
                pr.Out.Header.Set("X-User-Id", claims.Subject)   // identity downstream
                pr.Out.Header.Del("Authorization")               // terminate the token
            }
        },
        Transport: &http.Transport{
            MaxIdleConnsPerHost:   64,        // default 2, the #1 proxy bottleneck
            IdleConnTimeout:       90 * time.Second,
            ResponseHeaderTimeout: route.Timeout,
            ForceAttemptHTTP2:     true,
        },
        ModifyResponse: func(resp *http.Response) error {
            resp.Header.Set("X-Served-By", "gateway")
            return nil                        // also: record metrics, cache a copy
        },
        ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
            if errors.Is(err, context.DeadlineExceeded) {
                http.Error(w, "upstream timeout", http.StatusGatewayTimeout); return
            }
            http.Error(w, "bad gateway", http.StatusBadGateway)
        },
        FlushInterval: -1,      // flush immediately: required for SSE/streaming
    }
    return proxy
}

// Middleware order matters and is worth arguing about:
//   requestID -> recover -> metrics/tracing -> rate limit -> auth
//   -> cache lookup -> breaker -> retry -> proxy`
    },
    { t: "code", title: "Aggregation: the BFF half", code:
`// One browser request, N upstream calls, concurrently, with partial failure
// tolerated so a dead optional service degrades one widget instead of the page.
func (g *Gateway) aggregate(w http.ResponseWriter, r *http.Request, specs []Spec) {
    ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
    defer cancel()

    type res struct{ name string; body json.RawMessage; err error }
    out := make(chan res, len(specs))

    for _, sp := range specs {
        sp := sp
        go func() {
            b, err := g.fetchJSON(ctx, sp, r)       // breaker + timeout inside
            out <- res{sp.Name, b, err}
        }()
    }

    merged := map[string]json.RawMessage{}
    var partial []string
    for range specs {
        v := <-out
        if v.err != nil {
            if !specOf(specs, v.name).Optional {
                g.fail(w, http.StatusBadGateway, v.err); return
            }
            partial = append(partial, v.name)        // degrade, don't fail
            continue
        }
        merged[v.name] = v.body
    }
    if len(partial) > 0 { w.Header().Set("X-Partial", strings.Join(partial, ",")) }
    writeJSON(w, 200, merged)
}
// Total latency = the slowest upstream, not the sum. Prove it with a test
// using three httptest servers with different artificial delays.`
    },
    { t: "note", kind: "warn", title: "HTTP details a proxy must get right", html: "Strip <strong>hop-by-hop</strong> headers (<code>Connection</code>, <code>Keep-Alive</code>, <code>Transfer-Encoding</code>, <code>Upgrade</code>, <code>TE</code>, <code>Trailer</code>, <code>Proxy-*</code>), <code>ReverseProxy</code> does this for you, which is a good reason not to hand-roll one. Never trust an inbound <code>X-Forwarded-For</code> from the internet; append, don't replace, and only trust it from known proxies. Set <code>FlushInterval: -1</code> or you will buffer SSE and streaming responses into uselessness. And retrying a request whose body you already streamed requires buffering it first, which is why retries must be size-capped." },
    { t: "note", kind: "tip", title: "This is also the best possible pprof exercise", html: "A gateway is pure I/O multiplexing, so it exposes everything Module 12 taught: goroutines per connection, connection-pool reuse, allocation per request, GC pressure from header maps. Run a load test, capture CPU and heap profiles, and tune <code>MaxIdleConnsPerHost</code>, buffer reuse and <code>GOGC</code>. You can usually find a 2–5× improvement in your own first version." }
  ],
  milestones: [
    { title: "Minimal reverse proxy", detail: "One route, `httputil.ReverseProxy`, prefix stripping, X-Forwarded headers, an error handler mapping upstream failures to 502/504. Test against an `httptest` upstream." },
    { title: "Config and routing", detail: "YAML config, longest-prefix matching, per-route timeouts and transports, hot reload on SIGHUP (and prove in-flight requests aren't dropped)." },
    { title: "Load balancing + health", detail: "Round-robin and least-connections pickers, active health checks that eject and re-admit upstreams, a test killing one backend mid-load with zero client errors." },
    { title: "Cross-cutting middleware", detail: "Request IDs, panic recovery, structured access logs, RED metrics per route and upstream, OTel spans propagated downstream." },
    { title: "Protection", detail: "Token-bucket rate limits keyed by API key or IP with 429 + Retry-After, JWT auth termination injecting identity headers, body size caps, per-upstream concurrency bulkheads." },
    { title: "Resilience", detail: "Circuit breaker per upstream, capped retries on idempotent methods with jittered backoff and a buffered body, and load shedding when the queue is saturated." },
    { title: "Caching and canary", detail: "In-memory response cache honouring Cache-Control/ETag with singleflight to collapse stampedes; weighted canary splitting with sticky sessions by header." },
    { title: "Aggregation + profile", detail: "The `/bff` endpoint fanning out concurrently with partial-failure degradation. Then load-test, profile, tune, and record the before/after numbers." }
  ],
  done: [
    "Killing one upstream mid-load causes no client-visible errors (health checks + breaker + retry proven)",
    "Streaming and SSE responses pass through without buffering",
    "A rate-limited client gets 429 with Retry-After; limits are per key, not global",
    "The aggregate endpoint's latency equals the slowest upstream, not the sum, asserted in a test",
    "100 concurrent requests for the same cold cache key produce exactly ONE upstream call (singleflight)",
    "Hot config reload changes routing without dropping in-flight requests",
    "A load test plus a before/after profile showing a measured throughput improvement you can explain"
  ],
  stretch: [
    "WebSocket and gRPC proxying (including h2c upstreams)",
    "Request/response transformation: header rewrites, JSON field filtering, body size shaping",
    "mTLS to upstreams and JWKS-based JWT verification with key rotation",
    "Admin API + live dashboard showing per-route traffic, breaker state and cache hit ratio",
    "Shadow traffic: mirror a percentage of production requests to a new version and diff the responses",
    "Benchmark your gateway against Nginx and Envoy on the same workload, and write up honestly where you lose"
  ]
}

]);
