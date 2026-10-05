/* ===========================================================
   Go From Zero — app logic (vanilla JS, no dependencies)
   =========================================================== */
(function () {
"use strict";

/* ---------- data ---------- */
const MODULES  = (window.CURRICULUM_PARTS || []).flat();
const SHEETS   = window.SHEETS || [];
const PROJECTS = window.PROJECTS || [];
const DIAGRAMS = window.DIAGRAMS || {};
const GLOSSARY = window.GLOSSARY || {};
const RUNNABLE = window.RUNNABLE || {};
const PAGES    = window.PAGES || {};

/* ---------- feature flags ---------- */
const FLAGS = Object.assign({}, window.FLAGS || {});
(function applyFlagOverrides() {
  const ff = new URLSearchParams(location.search).get("ff");
  if (!ff) return;
  ff.split(",").map(x => x.trim()).filter(Boolean).forEach(tok => {
    if (tok.startsWith("-")) FLAGS[tok.slice(1)] = false;
    else FLAGS[tok] = true;
  });
})();
const flagOn = name => !!FLAGS[name];

/* Content can gate a whole block with { flag: "name" }, or a single list item /
   table row by prefixing it with {{name}}. Markers are stripped when kept. */
const FLAG_RE = /^\s*\{\{([a-z0-9_-]+)\}\}\s*/i;
function keepFlagged(str) {
  const m = FLAG_RE.exec(String(str));
  if (!m) return String(str);
  return flagOn(m[1]) ? String(str).replace(FLAG_RE, "") : null;
}
const filterFlagged = arr => (arr || []).map(keepFlagged).filter(x => x !== null);
const AUTHOR   = { name: "Neha Sharma", x: "https://x.com/hellonehha", handle: "@hellonehha", github: "https://github.com/Neha/go-learn-app" };
let CUR_MOD = "";   /* set while rendering a module, so codeBlock can find programs */
const LEVELS   = ["Beginner", "Intermediate", "Advanced", "Production"];
const INDEX    = new Map(MODULES.map((m, i) => [m.id, i]));
const PINDEX   = new Map(PROJECTS.map((p, i) => [p.id, i]));
const CAT_ORDER = ["CLI & Tools", "Web Apps", "APIs & Services", "Systems & Data"];
const PCATS = (() => {
  const seen = [...new Set(PROJECTS.map(p => p.category || "Projects"))];
  return seen.sort((a, b) => {
    const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
})();
const inCat = c => PROJECTS.filter(p => (p.category || "Projects") === c);
/* presentation order: grouped by track, so prev/next follows the learning path */
const PORDER = PCATS.flatMap(inCat);
const PPOS = new Map(PORDER.map((p, i) => [p.id, i]));

/* ---------- persistence ---------- */
const KEY = "gofromzero.v1";
let state = load();
function load() {
  const base = { done: {}, scores: {}, theme: null, ms: {}, animPaused: false, collapsed: {} };
  try { return Object.assign(base, JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch { return base; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }

/* ---------- tiny helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/* inline markdown for quiz/summary text: `code` and **bold** */
const md = s => esc(s)
  .replace(/`([^`]+)`/g, (_, c) => "<code>" + c + "</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

function toast(msg) {
  let el = $(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1900);
}

/* ---------- Go syntax highlighting ---------- */
const KW = ["break","case","chan","const","continue","default","defer","else","fallthrough","for","func","go","goto","if","import","interface","map","package","range","return","select","struct","switch","type","var"];
const BI = ["append","cap","clear","close","complex","copy","delete","imag","len","make","max","min","new","panic","print","println","real","recover"];
const TY = ["bool","byte","comparable","complex64","complex128","error","float32","float64","int","int8","int16","int32","int64","rune","string","uint","uint8","uint16","uint32","uint64","uintptr","any","true","false","nil","iota"];

const HL = new RegExp(
  "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|(?<=^|\\s)#[^\\n]*)" +            // 1 comments (// /* */ and shell #)
  "|(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*')" +              // 2 strings
  "|\\b(0[xX][0-9a-fA-F]+|\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)\\b" +        // 3 numbers
  "|\\b(" + KW.join("|") + ")\\b" +                                        // 4 keywords
  "|\\b(" + BI.join("|") + ")\\b" +                                        // 5 builtins
  "|\\b(" + TY.join("|") + ")\\b" +                                        // 6 types/consts
  "|\\b([A-Za-z_]\\w*)(?=\\s*\\()",                                        // 7 call sites
  "gm"
);

function highlight(code) {
  let src;
  try {
    src = esc(code).replace(HL, (m, com, str, num, kw, bi, ty, fn) => {
      if (com) return '<span class="tok-com">' + com + "</span>";
      if (str) return '<span class="tok-str">' + str + "</span>";
      if (num) return '<span class="tok-num">' + num + "</span>";
      if (kw)  return '<span class="tok-kw">'  + kw  + "</span>";
      if (bi)  return '<span class="tok-bi">'  + bi  + "</span>";
      if (ty)  return '<span class="tok-type">'+ ty  + "</span>";
      if (fn)  return '<span class="tok-fn">'  + fn  + "</span>";
      return m;
    });
  } catch (e) { src = esc(code); }   /* lookbehind unsupported -> plain text */
  return src;
}

/* ---------- block renderers ---------- */
/* Shell/YAML/Dockerfile snippets are not runnable Go — don't offer Run on them. */
function looksLikeGo(code) {
  if (/^\s*(#|FROM |name:|version:|module |VERSION )/m.test(code) && !/\bfunc\b/.test(code)) return false;
  return /\b(func|package|type|var|const|import)\b/.test(code);
}
const isFullProgram = code => /\bpackage\s+main\b/.test(code) && /\bfunc\s+main\s*\(/.test(code);

/* Wrap a fragment into a compilable program so it can be pasted straight in. */
function toProgram(code) {
  if (isFullProgram(code)) return code;
  const needs = new Set();
  if (/\bfmt\./.test(code)) needs.add("fmt");
  ["strings", "strconv", "errors", "time", "sync", "os", "io", "sort", "math",
   "context", "slices", "maps", "bytes", "unicode/utf8", "encoding/json", "regexp"
  ].forEach(p => { if (new RegExp("\\b" + p.split("/").pop() + "\\.").test(code)) needs.add(p); });
  if (!needs.size) needs.add("fmt");

  const imports = needs.size === 1
    ? 'import "' + [...needs][0] + '"'
    : "import (\n" + [...needs].sort().map(p => '\t"' + p + '"').join("\n") + "\n)";

  /* top-level declarations stay outside main; statements go inside it */
  const lines = code.split("\n");
  const top = [], body = [];
  let depth = 0, inTop = false;
  for (const ln of lines) {
    const t = ln.trim();
    const starts = /^(func|type|var\s*\(|const\s*\(|import|package)\b/.test(t);
    if (depth === 0 && starts) inTop = true;
    (inTop ? top : body).push(ln);
    depth += (ln.match(/[{(]/g) || []).length - (ln.match(/[})]/g) || []).length;
    if (depth <= 0) { depth = 0; if (inTop && /^[})]/.test(t)) inTop = false; }
  }
  const indented = body.filter(l => l.trim()).map(l => "\t" + l).join("\n");
  return "package main\n\n" + imports + "\n\n" +
    top.filter(l => !/^package\b/.test(l.trim()) && !/^import\b/.test(l.trim())).join("\n") +
    "\n\nfunc main() {\n" + (indented || "\t// your code here") +
    "\n\t_ = fmt.Sprint // keep the import used\n}\n";
}

/* A snippet is offered "Run" only when we have a program we know compiles:
   either an explicit `play:` field, or the snippet is already a full program.
   Fragments (most of the course) just get Copy — pasting code that does not
   build is worse than not offering the button. */
function codeBlock(b) {
  const prog = flagOn("playground")
    ? (b.play || RUNNABLE[CUR_MOD + "|" + (b.title || "")] || (isFullProgram(b.code) ? b.code : null))
    : null;
  return '<div class="code"' + (prog ? ' data-prog="' + encodeURIComponent(prog) + '"' : "") + ">" +
    '<div class="code-head"><div class="dots"><i></i><i></i><i></i></div>' +
    '<span class="title">' + esc(b.title || "go") + "</span>" +
    (prog ? '<button class="copy run" type="button" data-play title="Copy this runnable program and open the Go Playground">▶ Run</button>' : "") +
    '<button class="copy" type="button" data-copy>Copy</button></div>' +
    "<pre><code>" + highlight(b.code) + "</code></pre></div>";
}

const PLAYGROUND = "https://go.dev/play/";
async function runInPlayground(btn, programOverride) {
  const host = btn.closest("[data-prog]");
  const program = programOverride ||
    (host ? decodeURIComponent(host.dataset.prog) : toProgram(btn.closest(".code").querySelector("pre").innerText));
  const ok = await copyText(program);
  window.open(PLAYGROUND, "_blank", "noopener");
  toast(ok ? "Copied — paste into the Playground (⌘/Ctrl-V) and press Run"
           : "Playground opened — copy the snippet manually");
}

/* every runnable program in the course, for the #/playground index */
function runnableExamples() {
  const out = [];
  MODULES.forEach(m => m.blocks.forEach(b => {
    if (b.t !== "code") return;
    const prog = b.play || RUNNABLE[m.id + "|" + (b.title || "")] ||
                 (isFullProgram(b.code) ? b.code : null);
    if (prog) out.push({ mod: m, title: b.title || "example", prog });
  }));
  return out;
}

function playgroundPage() {
  const ex = runnableExamples();
  return '<div class="wrap">' +
    '<section class="hero" style="padding:34px 30px">' +
      '<span class="eyebrow">▶ Run it</span><h1>Playground</h1>' +
      "<p>" + ex.length + " complete, compiling programs from across the course. " +
      "<strong>Run</strong> copies the program and opens the official " +
      '<a href="' + PLAYGROUND + '" target="_blank" rel="noopener">Go Playground</a> — ' +
      "paste and press Run there. Execution happens on Google's servers because compiling Go needs a " +
      "Go toolchain; this site is static files with no backend.</p>" +
      '<div class="hero-actions">' +
        '<a class="btn btn-primary" href="' + PLAYGROUND + '" target="_blank" rel="noopener">Open the Go Playground ↗</a>' +
        '<button class="btn btn-ghost" type="button" data-playtpl>▶ Start from a blank template</button>' +
      "</div>" +
    "</section>" +
    '<div class="grid">' + ex.map((e, i) =>
      '<div class="card" data-prog="' + encodeURIComponent(e.prog) + '" data-search="' +
        esc((e.title + " " + e.mod.title).toLowerCase()) + '">' +
      '<div class="row"><span class="ico">' + e.mod.icon + "</span><h3>" + esc(e.title) + "</h3></div>" +
      '<p><a href="#/m/' + e.mod.id + '">' + esc(e.mod.title) + "</a></p>" +
      '<div class="sheet-actions" style="margin-top:12px">' +
        '<button class="mini primary" type="button" data-play>▶ Run</button>' +
        '<button class="mini" type="button" data-copyprog>⧉ Copy</button>' +
      "</div></div>").join("") + "</div></div>";
}

const BLANK_TPL = ["package main", "", 'import "fmt"', "", "func main() {",
  '\tfmt.Println("hello, playground")', "}", ""].join("\n");

const NOTE_ICO = { tip: "💡", warn: "⚠️", deep: "🔬" };

/* ---------- animated diagrams ---------- */
function diagramBlock(b) {
  const d = DIAGRAMS[b.id];
  if (!d) return "";
  const paused = !!state.animPaused;
  return '<figure class="dg' + (paused ? " paused" : "") + '" data-dg="' + b.id + '">' +
    '<div class="dg-head"><span class="dg-ico">◆</span>' +
    "<b>" + esc(b.title || d.title) + "</b>" +
    '<button class="dg-replay" type="button" data-pause title="Pause or play the animation">' +
      (paused ? "▶ play" : "⏸ pause") + "</button>" +
    '<button class="dg-replay" type="button" data-replay title="Replay from the start">↻ replay</button></div>' +
    '<div class="dg-stage">' + d.svg + "</div>" +
    (d.caption || b.caption ? "<figcaption>" + (b.caption || d.caption) + "</figcaption>" : "") +
    "</figure>";
}

/* ---------- glossary: auto-link terms in prose ---------- */
const GLOSS_KEYS = Object.keys(GLOSSARY);
/* longest first so "machine code" wins over "code"-like prefixes */
const GLOSS_RE = GLOSS_KEYS.length
  ? new RegExp("\\b(" + GLOSS_KEYS
      .slice().sort((a, b) => b.length - a.length)
      .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[\s-]/g, "[\\s-]"))
      .join("|") + ")\\b", "i")
  : null;
const GLOSS_SKIP = new Set(["CODE", "PRE", "A", "BUTTON", "H1", "H2", "H3", "B", "STRONG", "KBD", "TEXT", "svg"]);

/* Wraps the FIRST occurrence of each term inside an element's prose. */
function linkifyGlossary(root, used) {
  if (!GLOSS_RE) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue || n.nodeValue.length < 3) return NodeFilter.FILTER_REJECT;
      for (let p = n.parentElement; p && p !== root; p = p.parentElement) {
        if (GLOSS_SKIP.has(p.tagName) || p.classList.contains("no-gloss") ||
            p.closest(".code, .quiz, svg")) return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const texts = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) texts.push(n);

  for (const node of texts) {
    let cur = node;
    for (let guard = 0; guard < 8 && cur; guard++) {
      const m = GLOSS_RE.exec(cur.nodeValue);
      if (!m) break;
      const key = GLOSS_KEYS.find(k => k.toLowerCase() === m[1].toLowerCase().replace(/\s+/g, " ")) ||
                  GLOSS_KEYS.find(k => k.replace(/[\s-]/g, "") === m[1].toLowerCase().replace(/[\s-]/g, ""));
      if (!key) break;
      if (used.has(key)) {                       /* already linked once on this page */
        cur = cur.splitText(m.index + m[1].length);
        continue;
      }
      used.add(key);
      const after = cur.splitText(m.index);
      const rest = after.splitText(m[1].length);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gloss";
      btn.dataset.g = key;
      btn.setAttribute("aria-label", m[1] + " — show definition");
      btn.textContent = m[1];
      after.parentNode.replaceChild(btn, after);
      cur = rest;
    }
  }
}

/* ---------- glossary popover / bottom sheet ---------- */
let glossOpen = null;
function closeGloss() {
  $$(".gloss-pop, .gloss-sheet, .gloss-scrim").forEach(n => n.remove());
  if (glossOpen) { glossOpen.classList.remove("active"); glossOpen = null; }
}
function openGloss(btn, keyOverride) {
  const key = keyOverride || btn.dataset.g, g = GLOSSARY[key];
  if (!g) return;
  if (glossOpen === btn && !keyOverride) { closeGloss(); return; }
  const wasOpen = glossOpen === btn;
  closeGloss();
  glossOpen = btn;
  btn.classList.add("active");
  void wasOpen;

  const related = (g.see || []).filter(k => GLOSSARY[k]).map(k =>
    '<button class="gloss-chip" type="button" data-g="' + k + '">' + esc(GLOSSARY[k].term) + "</button>").join("");
  const body =
    '<div class="gloss-term">' + esc(g.term) + "</div>" +
    '<div class="gloss-def">' + g.def + "</div>" +
    (related ? '<div class="gloss-see"><span>See also</span>' + related + "</div>" : "") +
    '<a class="gloss-all" href="#/glossary">Open the full glossary →</a>';

  const mobile = innerWidth <= 820;
  if (mobile) {
    const scrim = document.createElement("div");
    scrim.className = "gloss-scrim";
    const sheet = document.createElement("div");
    sheet.className = "gloss-sheet";
    sheet.innerHTML = '<div class="gloss-grip"></div>' + body +
      '<button class="gloss-close" type="button" data-gclose>Close</button>';
    document.body.append(scrim, sheet);
    requestAnimationFrame(() => { scrim.classList.add("in"); sheet.classList.add("in"); });
  } else {
    const pop = document.createElement("div");
    pop.className = "gloss-pop";
    pop.innerHTML = body;
    document.body.appendChild(pop);
    const r = btn.getBoundingClientRect();
    const w = Math.min(390, innerWidth - 24);
    pop.style.width = w + "px";
    let left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12);
    pop.style.left = left + "px";
    const below = r.bottom + 10;
    if (below + pop.offsetHeight > innerHeight - 10 && r.top > pop.offsetHeight + 20) {
      pop.style.top = (r.top - pop.offsetHeight - 10 + scrollY) + "px";
      pop.classList.add("above");
    } else {
      pop.style.top = (below + scrollY) + "px";
    }
    requestAnimationFrame(() => pop.classList.add("in"));
  }
}

function glossDomId(key) { return "gterm-" + encodeURIComponent(key); }

function glossaryPage() {
  const groups = {};
  Object.entries(GLOSSARY).forEach(([k, g]) => {
    const L = g.term[0].toUpperCase();
    (groups[L] = groups[L] || []).push([k, g]);
  });
  const letters = Object.keys(groups).sort();
  return '<div class="wrap">' +
    '<section class="hero" style="padding:34px 30px">' +
      '<span class="eyebrow">📖 Reference</span><h1>Glossary</h1>' +
      "<p>Every term the course assumes, defined in one place — " + GLOSS_KEYS.length + " of them, " +
      "from <em>compiled</em> and <em>JIT</em> to <em>write barrier</em> and <em>minimal version selection</em>. " +
      "Terms are also tappable wherever they appear in a module.</p>" +
      '<div class="gloss-index">' + letters.map(l =>
        '<button class="mini" type="button" data-jump="gl-' + l + '">' + l + "</button>").join("") + "</div>" +
    "</section>" +
    letters.map(l =>
      '<div class="section-head" id="gl-' + l + '"><h2>' + l + "</h2></div>" +
      '<div class="grid">' + groups[l].sort((a, b) => a[1].term.localeCompare(b[1].term)).map(([k, g]) =>
        '<div class="card gloss-card" id="' + glossDomId(k) + '" data-search="' + esc((g.term + " " + g.def).toLowerCase().replace(/<[^>]+>/g, "")) + '">' +
        '<h3 class="no-gloss">' + esc(g.term) + "</h3>" +
        '<p class="no-gloss">' + g.def + "</p>" +
        ((g.see || []).filter(x => GLOSSARY[x]).length ?
          '<div class="tags">' + g.see.filter(x => GLOSSARY[x]).map(x =>
            '<span class="tag">' + esc(GLOSSARY[x].term) + "</span>").join("") + "</div>" : "") +
        "</div>").join("") + "</div>"
    ).join("") + "</div>";
}

function renderBlock(b) {
  if (b.flag && !flagOn(b.flag)) return "";
  switch (b.t) {
    case "h":    return "<h2>" + esc(b.text) + "</h2>";
    case "p":    return "<p>" + b.html + "</p>";
    case "code": return codeBlock(b);
    case "diagram": return diagramBlock(b);
    case "list": {
      const tag = b.ordered ? "ol" : "ul";
      const items = filterFlagged(b.items);
      if (!items.length) return "";
      return "<" + tag + ">" + items.map(i => "<li>" + i + "</li>").join("") + "</" + tag + ">";
    }
    case "table": {
      const rows = (b.rows || []).filter(r => keepFlagged(r[0]) !== null)
        .map(r => [keepFlagged(r[0]), ...r.slice(1)]);
      if (!rows.length) return "";
      return '<div class="tbl-wrap"><table><thead><tr>' +
        b.head.map(h => "<th>" + h + "</th>").join("") +
        "</tr></thead><tbody>" +
        rows.map(r => "<tr>" + r.map(c => "<td>" + c + "</td>").join("") + "</tr>").join("") +
        "</tbody></table></div>";
    }
    case "note":
      return '<div class="note ' + (b.kind || "tip") + '">' +
        '<span class="n-ico">' + (NOTE_ICO[b.kind] || "💡") + "</span><div>" +
        (b.title ? "<b>" + b.title + "</b>" : "") +
        (b.html ? "<p>" + b.html + "</p>" : "") + "</div></div>";
    default: return "";
  }
}

/* ---------- progress ---------- */
function doneCount() { return MODULES.filter(m => state.done[m.id]).length; }
function pct() { return MODULES.length ? Math.round(doneCount() / MODULES.length * 100) : 0; }

function paintProgress() {
  const p = pct(), n = doneCount();
  const txt = $("#progressText"), ring = $("#ringFg"), chip = $("#progressChip");
  if (txt) txt.textContent = p + "%";
  if (ring) ring.style.strokeDashoffset = String(100 - p);
  if (chip) chip.title = n + " of " + MODULES.length + " modules completed";
  const bar = $("#sideProgBar"), stxt = $("#sideProgText"), spct = $("#sideProgPct");
  if (bar) bar.style.width = p + "%";
  if (spct) spct.textContent = p + "%";
  if (stxt) {
    const built = PROJECTS.filter(pr => msDone(pr) === pr.milestones.length).length;
    stxt.textContent = n + " of " + MODULES.length + " modules complete" +
      (built ? " · " + built + " of " + PROJECTS.length + " projects built" : "");
  }
  /* keep the per-level counts in the nav headers honest without a full re-render */
  LEVELS.forEach(level => {
    const items = MODULES.filter(m => m.level === level);
    if (!items.length) return;
    const el = $('.nav-group[data-grp="' + slugOf(level) + '"] .nav-count');
    if (el) el.textContent = items.filter(m => state.done[m.id]).length + "/" + items.length;
  });
}

/* localStorage is unavailable on some file:// origins and in locked-down private
   modes — progress silently vanishing is worse than saying so. */
function storageWorks() {
  try {
    const k = "__gfz_probe";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch { return false; }
}

function warnNoStorage() {
  if ($("#noStore")) return;
  const el = document.createElement("div");
  el.id = "noStore";
  el.className = "store-warn";
  el.innerHTML = "⚠️ <b>Progress can't be saved in this context.</b> Your browser is blocking " +
    "local storage — usually because the page was opened as a <code>file://</code> path. " +
    "Serve the folder instead: <code>python3 -m http.server</code> then open " +
    "<code>http://localhost:8000</code>. " +
    '<button type="button" data-dismisswarn aria-label="Dismiss">✕</button>';
  document.body.appendChild(el);
}

/* ---------- navigation ---------- */
function navItem(href, id, icon, label, hay, done) {
  return '<a class="nav-item' + (done ? " done" : "") + '" href="' + href + '" data-id="' + id +
    '" data-hay="' + esc(hay.toLowerCase()) + '">' +
    '<span class="ico">' + icon + "</span><span>" + esc(label) + "</span>" +
    '<span class="tick">✓</span></a>';
}

const slugOf = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* one collapsible group: a real <button> so it is keyboard- and screen-reader-friendly */
function navGroup(level, label, count, itemsHTML) {
  const key = slugOf(label);
  const closed = !!state.collapsed[key];
  return '<div class="nav-group' + (closed ? " closed" : "") + '" data-level="' + level +
    '" data-grp="' + key + '">' +
    '<button class="nav-label" type="button" data-grp-toggle="' + key +
      '" aria-expanded="' + (closed ? "false" : "true") + '">' +
      "<i></i><span>" + esc(label) + "</span>" +
      (count ? '<em class="nav-count">' + count + "</em>" : "") +
      '<svg class="chev" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
        '<path d="M5.5 8 L10 12.5 L14.5 8"/></svg></button>' +
    '<div class="nav-items">' + itemsHTML + "</div></div>";
}

function renderNav() {
  $("#nav").innerHTML = LEVELS.map(level => {
    const items = MODULES.filter(m => m.level === level);
    if (!items.length) return "";
    const done = items.filter(m => state.done[m.id]).length;
    return navGroup(level, level, done + "/" + items.length,
      items.map(m => navItem("#/m/" + m.id, m.id, m.icon, m.title,
        m.title + " " + m.blurb + " " + m.summary.join(" "), state.done[m.id])).join(""));
  }).join("") +
  (PROJECTS.length ?
    PCATS.map(c => {
      const ps = inCat(c);
      const built = ps.filter(p => msDone(p) === p.milestones.length).length;
      return navGroup("Projects", c, built + "/" + ps.length,
        ps.map(p => navItem("#/p/" + p.id, p.id, p.icon, p.name.split(" — ")[0],
          p.name + " " + p.tagline + " " + p.stack.join(" ") + " " + c,
          msDone(p) === p.milestones.length)).join(""));
    }).join("") : "") +
  navGroup("Resources", "Resources", "",
    navItem("#/projects", "__projects", "🛠", "All " + PROJECTS.length + " projects", "projects build portfolio", false) +
  navItem("#/sheets", "__sheets", "📄", "Cheat sheets", "cheat sheets download reference pdf", false) +
  navItem("#/glossary", "__glossary", "📖", "Glossary", "glossary terms definitions jargon jit compiled", false) +
  (flagOn("playground")
    ? navItem("#/playground", "__playground", "▶", "Playground", "playground run code online examples", false)
    : "") +
  navItem("#/how-to-use", "__how", "🧭", "How to use", "how to use guide path schedule shortcuts", false) +
  navItem("#/about", "__about", "🐹", "About", "about author neha sharma credits", false) +
  navItem("#/privacy", "__privacy", "🔒", "Privacy & copyright", "privacy policy copyright licence data", false));
  markActive();
}

function setGroup(key, closed) {
  if (closed) state.collapsed[key] = true; else delete state.collapsed[key];
  const g = $('.nav-group[data-grp="' + key + '"]');
  if (g) {
    g.classList.toggle("closed", closed);
    const btn = $(".nav-label", g);
    if (btn) btn.setAttribute("aria-expanded", closed ? "false" : "true");
  }
  save();
}
function setAllGroups(closed) {
  $$("#nav .nav-group").forEach(g => setGroup(g.dataset.grp, closed));
}

function markActive() {
  const h = location.hash || "#/";
  let id = "";
  if (h.startsWith("#/m/")) id = h.slice(4);
  else if (h.startsWith("#/p/")) id = h.slice(4);
  else if (h === "#/sheets" || h.startsWith("#/sheets/")) id = "__sheets";
  else if (h === "#/projects") id = "__projects";
  else if (h === "#/glossary" || h.startsWith("#/glossary/")) id = "__glossary";
  else if (h === "#/playground") id = "__playground";
  else if (h === "#/about") id = "__about";
  else if (h === "#/how-to-use") id = "__how";
  else if (h === "#/privacy") id = "__privacy";
  $$("#nav .nav-item").forEach(a => {
    const on = a.dataset.id === id;
    a.classList.toggle("active", on);
    if (on) {                                  /* never hide where you actually are */
      const g = a.closest(".nav-group");
      if (g && g.classList.contains("closed")) setGroup(g.dataset.grp, false);
    }
  });
}

/* ---------- pages ---------- */
function home() {
  const totalQ = MODULES.reduce((n, m) => n + m.quiz.length, 0);
  const mins   = MODULES.reduce((n, m) => n + (m.minutes || 0), 0);
  const doneN  = Object.keys(state.done).length;
  const next   = MODULES.find(m => !state.done[m.id]) || MODULES[0];

  const cards = level => MODULES.filter(m => m.level === level).map(card).join("");

  return '<div class="wrap">' +
    '<section class="hero">' +
      '<span class="eyebrow">🐹 Beginner → Internals</span>' +
      "<h1>Learn <em>Go</em> properly — from a variable to the garbage collector.</h1>" +
      "<p>" + MODULES.length + " modules that start with “is Go compiled?” and run through the scheduler, the GC and the " +
      "memory allocator to testing, deployment and on-call. Every module closes with a summary and five questions, " +
      "plus " + PROJECTS.length + " end-to-end projects and " + SHEETS.length + " printable cheat sheets.</p>" +
      '<div class="hero-actions">' +
        '<a class="btn btn-primary" href="#/m/' + next.id + '">' + (doneN ? "Continue → " + esc(next.title) : "Start module 1 →") + "</a>" +
        '<a class="btn btn-ghost" href="#/projects">🛠 Build projects</a>' +
        '<a class="btn btn-ghost" href="#/sheets">📄 Cheat sheets</a>' +
        '<a class="btn btn-ghost" href="#/glossary">📖 Glossary</a>' +
        (flagOn("playground") ? '<a class="btn btn-ghost" href="#/playground">▶ Playground</a>' : "") +
      "</div>" +
      '<div class="stats">' +
        '<div class="stat"><b>' + MODULES.length + "</b><span>Modules</span></div>" +
        '<div class="stat"><b>' + totalQ + "</b><span>Questions</span></div>" +
        '<div class="stat"><b>' + PROJECTS.length + "</b><span>Projects</span></div>" +
        '<div class="stat"><b>' + SHEETS.length + "</b><span>Cheat sheets</span></div>" +
        '<div class="stat"><b>~' + Math.round(mins / 60) + "h</b><span>Reading time</span></div>" +
        '<div class="stat"><b>' + pct() + "%</b><span>Complete</span></div>" +
      "</div>" +
    "</section>" +
    LEVELS.map(l =>
      '<div class="section-head" data-level-head="' + l + '"><h2>' + l + "</h2>" +
      "<span>" + MODULES.filter(m => m.level === l).length + " modules</span></div>" +
      '<div class="grid">' + cards(l) + "</div>"
    ).join("") +
    PCATS.map(c =>
      '<div class="section-head" data-level-head="' + esc(c) + '"><h2>🛠 ' + esc(c) + "</h2>" +
      "<span>" + inCat(c).length + ' projects · <a href="#/projects">all tracks</a></span></div>' +
      '<div class="grid">' + inCat(c).map(projectCard).join("") + "</div>"
    ).join("") +
  "</div>";
}

function card(m) {
  const i = INDEX.get(m.id) + 1;
  const sc = state.scores[m.id];
  return '<a class="card' + (state.done[m.id] ? " done" : "") + '" href="#/m/' + m.id + '" data-search="' +
    esc((m.title + " " + m.blurb + " " + m.summary.join(" ")).toLowerCase()) + '">' +
    '<div class="row"><span class="ico">' + m.icon + '</span><h3>' + esc(m.title) + "</h3></div>" +
    "<p>" + esc(m.blurb) + "</p>" +
    '<div class="meta"><span class="pill ' + m.level + '">' + m.level + "</span>" +
    "<span>#" + i + "</span><span>" + m.minutes + " min</span>" +
    (sc ? "<span>quiz " + sc.correct + "/" + sc.total + "</span>" : "") +
    "</div></a>";
}

/* ---------- projects ---------- */
function msDone(p) { const s = state.ms[p.id] || {}; return p.milestones.filter((_, i) => s[i]).length; }

function projectCard(p) {
  const d = msDone(p), n = p.milestones.length;
  return '<a class="card' + (d === n ? " done" : "") + '" href="#/p/' + p.id + '" data-search="' +
    esc((p.name + " " + p.tagline + " " + p.stack.join(" ")).toLowerCase()) + '">' +
    '<div class="row"><span class="ico">' + p.icon + "</span><h3>" + esc(p.name.split(" — ")[0]) + "</h3></div>" +
    "<p>" + esc(p.tagline) + "</p>" +
    '<div class="tags">' + p.stack.slice(0, 4).map(s => '<span class="tag">' + esc(s) + "</span>").join("") +
      (p.stack.length > 4 ? '<span class="tag">+' + (p.stack.length - 4) + "</span>" : "") + "</div>" +
    '<div class="bar" title="' + d + " of " + n + ' milestones"><i style="width:' + (d / n * 100) + '%"></i></div>' +
    '<div class="meta"><span class="pill ' + plevel(p.level) + '">' + p.level + "</span>" +
    "<span>" + esc(p.time) + "</span><span>" + d + "/" + n + " milestones</span></div></a>";
}
const plevel = l => ({ Starter: "Beginner", Intermediate: "Intermediate", Advanced: "Advanced" }[l] || "Advanced");
const slug = s => "cat-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function projectsPage() {
  return '<div class="wrap">' +
    '<section class="hero" style="padding:36px 30px">' +
      '<span class="eyebrow">🛠 End-to-end builds</span>' +
      "<h1>Build these " + PROJECTS.length + " projects.</h1>" +
      "<p>Reading about Go gets you to “I follow the syntax”. These get you to “I can ship a Go service”. " +
      "Each one is a complete build guide: target behaviour, architecture, the code that matters, a tickable " +
      "milestone plan, a definition of done you can honestly check, the bugs you <em>will</em> hit, and stretch goals. " +
      "Four tracks — command-line tools, web apps, APIs and services, and systems/data. " +
      "Within a track, work top to bottom; each reuses the last one's skills.</p>" +
      '<div class="hero-actions">' + PCATS.map(c =>
        '<button class="btn btn-ghost" type="button" data-jump="' + slug(c) + '">' +
        esc(c) + " (" + inCat(c).length + ")</button>").join("") +
      "</div>" +
      '<div class="stats">' + PCATS.map(c =>
        '<div class="stat"><b>' + inCat(c).reduce((n, p) => n + msDone(p), 0) + "/" +
        inCat(c).reduce((n, p) => n + p.milestones.length, 0) + "</b><span>" + esc(c) + "</span></div>").join("") +
      "</div>" +
    "</section>" +
    PCATS.map(c =>
      '<div class="section-head" id="' + slug(c) + '" data-level-head="' + esc(c) + '">' +
      "<h2>" + esc(c) + "</h2><span>" + inCat(c).length + " projects</span></div>" +
      '<div class="grid">' + inCat(c).map(projectCard).join("") + "</div>"
    ).join("") +
    '<div class="note tip" style="margin-top:22px"><span class="n-ico">💡</span><div>' +
    "<b>How to use these</b><p>Don't read the code blocks and move on — type them. Build the simplest correct version " +
    "first (milestone 1 is always “make it work without the hard part”), commit after every milestone, and write the " +
    "test before the fix when something breaks. If a project takes twice the estimate, that's normal and it's where " +
    "the learning is.</p></div></div></div>";
}

function projectPage(id) {
  const i = PINDEX.get(id);
  if (i === undefined) return notFound();
  const p = PROJECTS[i], pos = PPOS.get(p.id);
  const prev = PORDER[pos - 1], nxt = PORDER[pos + 1];
  const s = state.ms[p.id] || {}, d = msDone(p), n = p.milestones.length;

  const covers = (p.covers || []).filter(c => INDEX.has(c)).map(c => {
    const m = MODULES[INDEX.get(c)];
    return '<a class="tag" href="#/m/' + m.id + '">' + m.icon + " " + esc(m.title.split(":")[0]) + "</a>";
  }).join("");

  CUR_MOD = p.id;
  return '<div class="wrap"><article data-project="' + p.id + '">' +
    '<header class="mod-head">' +
      '<div class="crumbs"><a href="#/">Home</a> / <a href="#/projects">Projects</a> / ' +
        esc(p.category || "Projects") + " / " +
        (inCat(p.category || "Projects").findIndex(x => x.id === p.id) + 1) + " of " +
        inCat(p.category || "Projects").length + "</div>" +
      "<h1><span>" + p.icon + "</span>" + esc(p.name) + "</h1>" +
      '<p class="lead">' + esc(p.tagline) + "</p>" +
      '<div class="mod-meta"><span class="pill ' + plevel(p.level) + '">' + p.level + "</span>" +
      "<span>⏱ " + esc(p.time) + "</span><span>✅ " + n + " milestones</span>" +
      (d === n ? '<span style="color:var(--ok)">✓ built</span>' : "") + "</div>" +
      '<div class="tags" style="margin-top:14px">' + p.stack.map(t => '<span class="tag">' + esc(t) + "</span>").join("") + "</div>" +
      (covers ? '<div class="tags" style="margin-top:10px"><span class="tag" style="background:transparent;border:none;color:var(--fg-3)">Applies:</span>' + covers + "</div>" : "") +
    "</header>" +

    p.blocks.map(renderBlock).join("") +

    '<section class="milestones">' +
      '<div class="quiz-head"><h2>✅ Milestone plan</h2>' +
      '<span class="score" data-msscore>' + d + " / " + n + "</span></div>" +
      '<div class="bar big"><i data-msbar style="width:' + (d / n * 100) + '%"></i></div>' +
      '<p class="hint">Tick each one as you finish it — progress is saved in this browser. Commit at every tick.</p>' +
      p.milestones.map((m, mi) =>
        '<button class="ms' + (s[mi] ? " done" : "") + '" type="button" data-ms="' + mi + '">' +
        '<span class="box">' + (s[mi] ? "✓" : "") + "</span>" +
        "<span><b>" + (mi + 1) + ". " + md(m.title) + "</b><span class='d'>" + md(m.detail) + "</span></span></button>"
      ).join("") +
    "</section>" +

    '<section class="summary"><h2>🎯 Definition of done</h2><ul>' +
      p.done.map(x => "<li><span>" + md(x) + "</span></li>").join("") +
    "</ul></section>" +

    '<section class="summary" style="border-color:var(--line);background:var(--card)"><h2>🚀 Stretch goals</h2><ul>' +
      p.stretch.map(x => "<li><span>" + md(x) + "</span></li>").join("") +
    "</ul></section>" +

    '<nav class="pager">' +
      (prev ? '<a href="#/p/' + prev.id + '"><span>← Previous project</span><b>' + esc(prev.name.split(" — ")[0]) + "</b></a>"
            : '<a href="#/projects"><span>← Back</span><b>All projects</b></a>') +
      (nxt ? '<a class="next" href="#/p/' + nxt.id + '"><span>Next project →</span><b>' + esc(nxt.name.split(" — ")[0]) + "</b></a>"
           : '<a class="next" href="#/sheets"><span>Finished →</span><b>Cheat sheets</b></a>') +
    "</nav></article></div>";
}

function onMilestone(btn) {
  const art = btn.closest("[data-project]"), pid = art.dataset.project;
  const p = PROJECTS[PINDEX.get(pid)], mi = btn.dataset.ms;
  const s = state.ms[pid] || (state.ms[pid] = {});
  if (s[mi]) delete s[mi]; else s[mi] = true;
  save();

  btn.classList.toggle("done", !!s[mi]);
  $(".box", btn).textContent = s[mi] ? "✓" : "";
  const d = msDone(p), n = p.milestones.length;
  $("[data-msscore]", art).textContent = d + " / " + n;
  $("[data-msbar]", art).style.width = (d / n * 100) + "%";
  renderNav();
  if (d === n) toast("🎉 " + p.name.split(" — ")[0] + " complete — now write the README");
}

function modulePage(id) {
  const i = INDEX.get(id);
  if (i === undefined) return notFound();
  const m = MODULES[i], prev = MODULES[i - 1], nxt = MODULES[i + 1];

  CUR_MOD = m.id;
  return '<div class="wrap"><article data-module="' + m.id + '">' +
    '<header class="mod-head">' +
      '<div class="crumbs"><a href="#/">Home</a> / ' + m.level + " / module " + (i + 1) + " of " + MODULES.length + "</div>" +
      "<h1><span>" + m.icon + "</span>" + esc(m.title) + "</h1>" +
      '<p class="lead">' + esc(m.blurb) + "</p>" +
      '<div class="mod-meta"><span class="pill ' + m.level + '">' + m.level + "</span>" +
      "<span>⏱ " + m.minutes + " min</span><span>❓ " + m.quiz.length + " questions</span>" +
      (state.done[m.id] ? '<span class="done-chip" style="color:var(--ok)">✓ completed</span>' : "") + "</div>" +
    "</header>" +

    m.blocks.map(renderBlock).join("") +

    '<section class="summary"><h2>📌 Summary</h2><ul>' +
      m.summary.map(s => "<li><span>" + md(s) + "</span></li>").join("") +
    "</ul></section>" +

    quizHTML(m) +

    '<div class="mark-done' + (state.done[m.id] ? " on" : "") + '" data-markwrap="' + m.id + '">' +
      '<button class="btn ' + (state.done[m.id] ? "btn-ghost" : "btn-primary") + '" type="button" data-markdone="' + m.id + '">' +
        (state.done[m.id] ? "✓ Completed — mark as not done" : "✓ Mark this module complete") + "</button>" +
      '<span class="md-note">Answering every question correctly marks it automatically — ' +
      "or tick it here if you only came for the reading.</span></div>" +

    '<nav class="pager">' +
      (prev ? '<a href="#/m/' + prev.id + '"><span>← Previous</span><b>' + esc(prev.title) + "</b></a>" : "") +
      (nxt ? '<a class="next" href="#/m/' + nxt.id + '"><span>Next →</span><b>' + esc(nxt.title) + "</b></a>"
           : '<a class="next" href="#/sheets"><span>Finished →</span><b>Grab the cheat sheets</b></a>') +
    "</nav></article></div>";
}

/* answer order is randomised per render so option position carries no signal */
function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function quizHTML(m) {
  const sc = state.scores[m.id];
  const missed = new Set((sc && sc.missed) || []);
  const passed = !!(sc && sc.total && sc.correct === sc.total);
  const missedLabel = [...missed].sort((a, b) => a - b).map(i => "Q" + (i + 1)).join(", ");
  return '<section class="quiz" data-quiz="' + m.id + '">' +
    '<div class="quiz-head"><h2>🧠 Try these five</h2>' +
    '<span class="score" data-score>' + (sc ? sc.correct + " / " + sc.total : "0 / " + m.quiz.length) + "</span></div>" +
    '<p class="hint">Pick an answer to see whether it is right and why. ' +
    (passed ? "You answered every question correctly."
            : "Answer every question correctly to mark this module complete, or use the button below after reading.") +
    "</p>" +
    (missed.size && !passed
      ? '<p class="hint">Last attempt missed ' + esc(missedLabel) + ".</p>"
      : "") +
    m.quiz.map((q, qi) =>
      '<div class="q' + (missed.has(qi) ? " missed" : "") + '" data-q="' + qi + '" data-answer="' + q.answer + '">' +
        '<div class="q-text"><span class="num">Q' + (qi + 1) + ".</span><span>" + md(q.q) + "</span></div>" +
        '<div class="opts">' +
          shuffled(q.options.length).map((oi, pos) =>
            '<button class="opt" type="button" data-opt="' + oi + '">' +
            '<span class="key">' + "ABCDEF"[pos] + '</span><span class="txt">' + md(q.options[oi]) +
            '</span><span class="mark"></span></button>'
          ).join("") +
        "</div>" +
        '<div class="explain"><b>Why:</b> ' + md(q.explain) + "</div>" +
      "</div>"
    ).join("") +
    '<div class="quiz-done"></div></section>';
}

function sheetsPage() {
  return '<div class="wrap">' +
    '<section class="hero" style="padding:34px 30px">' +
      '<span class="eyebrow">📄 Downloads</span>' +
      "<h1>Cheat sheets</h1>" +
      "<p>Dense, printable references for commands, syntax, collections, concurrency, the runtime, the standard library, " +
      "web &amp; API patterns, testing, production readiness and the gotchas. " +
      "Each one downloads as a real PDF, plain text or markdown — the PDFs are generated in your browser, " +
      "A4, monospaced, with page numbers.</p>" +
      '<div class="hero-actions">' +
        '<button class="btn btn-primary" id="pdfAll">⬇ All ' + SHEETS.length + " sheets as one PDF</button>" +
        '<button class="btn btn-ghost" id="dlAll">⬇ All as .txt</button>' +
        '<button class="btn btn-ghost" id="printAll">🖨 Print sheets</button>' +
      "</div>" +
    "</section>" +
    '<div class="grid">' + SHEETS.map(s =>
      '<div class="card sheet-card" data-sheet="' + s.id + '" data-search="' +
        esc((s.name + " " + s.desc + " " + s.tags.join(" ")).toLowerCase()) + '">' +
        '<div class="row"><span class="ico">' + s.icon + '</span><h3>' + esc(s.name) + "</h3></div>" +
        "<p>" + esc(s.desc) + "</p>" +
        '<div class="tags">' + s.tags.map(t => '<span class="tag">' + esc(t) + "</span>").join("") + "</div>" +
        '<div class="sheet-actions">' +
          '<button class="mini primary" data-pdf="' + s.id + '">⬇ PDF</button>' +
          '<button class="mini" data-dl="' + s.id + '">⬇ .txt</button>' +
          '<button class="mini" data-md="' + s.id + '">⬇ .md</button>' +
          '<button class="mini" data-cp="' + s.id + '">⧉ Copy</button>' +
          '<button class="mini" data-pv="' + s.id + '">👁 Preview</button>' +
        "</div>" +
        '<div class="preview"><pre>' + esc(s.body) + "</pre></div>" +
      "</div>"
    ).join("") + "</div></div>";
}

function staticPage(id) {
  const p = PAGES[id];
  if (!p) return notFound();
  CUR_MOD = "page-" + id;
  return '<div class="wrap"><article class="page">' +
    '<header class="mod-head">' +
      '<div class="crumbs"><a href="#/">Home</a> / ' + esc(p.title) + "</div>" +
      "<h1><span>" + p.icon + "</span>" + esc(p.title) + "</h1>" +
      '<p class="lead">' + esc(p.blurb) + "</p>" +
    "</header>" +
    p.blocks.map(renderBlock).join("") +
    "</article></div>";
}

function siteFooter() {
  const year = new Date().getFullYear();
  return '<footer class="site-foot"><div class="wrap">' +
    '<div class="sf-row">' +
      '<div class="sf-brand"><span aria-hidden="true">🐹</span><b>Go<span>From</span>Zero</b>' +
        "<span class='sf-sub'>" + MODULES.length + " modules · " + PROJECTS.length +
        " projects · " + SHEETS.length + " cheat sheets</span></div>" +
      '<nav class="sf-links" aria-label="Site information">' +
        '<a href="#/about">About</a>' +
        '<a href="#/how-to-use">How to use</a>' +
        '<a href="#/glossary">Glossary</a>' +
        (flagOn("playground") ? '<a href="#/playground">Playground</a>' : "") +
        '<a href="#/privacy">Privacy &amp; copyright</a>' +
        '<a href="' + AUTHOR.github + '" target="_blank" rel="noopener">GitHub ↗</a>' +
        '<a href="' + AUTHOR.x + '" target="_blank" rel="noopener me">' + AUTHOR.handle + " ↗</a>" +
      "</nav>" +
    "</div>" +
    '<div class="sf-legal">' +
      "<span>© " + year + " <a href='" + AUTHOR.x + "' target='_blank' rel='noopener me'><strong>" +
      AUTHOR.name + "</strong></a> — course text, diagrams and quizzes all rights reserved; " +
      "<strong>the Go code samples are free to use</strong></span>" +
      '<span class="sf-note">No cookies · progress stays in this browser · the hosted site counts anonymous visits</span>' +
    "</div></div></footer>";
}

function notFound() {
  return '<div class="wrap"><div class="empty"><h1>404</h1><p>No such section. <a href="#/">Back to the start</a>.</p></div></div>';
}

/* ---------- router ---------- */
function route() {
  const h = location.hash || "#/";
  const main = $("#main");
  closeGloss();
  if (h.startsWith("#/m/"))      main.innerHTML = modulePage(h.slice(4));
  else if (h.startsWith("#/p/")) main.innerHTML = projectPage(h.slice(4));
  else if (h === "#/projects")   main.innerHTML = projectsPage();
  else if (h === "#/sheets" || h.startsWith("#/sheets/")) main.innerHTML = sheetsPage();
  else if (h === "#/glossary" || h.startsWith("#/glossary/")) main.innerHTML = glossaryPage();
  else if (h === "#/playground") main.innerHTML = flagOn("playground") ? playgroundPage() : notFound();
  else if (h === "#/about")      main.innerHTML = staticPage("about");
  else if (h === "#/how-to-use") main.innerHTML = staticPage("how-to-use");
  else if (h === "#/privacy")    main.innerHTML = staticPage("privacy");
  else if (h === "#/" || h === "#") main.innerHTML = home();
  else                           main.innerHTML = notFound();
  main.insertAdjacentHTML("beforeend", siteFooter());
  if (h.startsWith("#/m/") || h.startsWith("#/p/") || PAGES[h.slice(2)]) {
    const seen = new Set();   /* one tooltip per term per page */
    $$("article > p, article > ul, article > ol, .note, .summary li, .milestones .d, .tbl-wrap td", main)
      .forEach(el => linkifyGlossary(el, seen));
  }
  markActive();
  closeDrawer();
  window.scrollTo(0, 0);
  revealDeepLink(h);
  measurePageLength();
  updateReadingRail();
  applySearch($("#search").value);
  applyNavFilter($("#search").value);
  const t = PAGES[h.slice(2)] ? PAGES[h.slice(2)].title
          : h.startsWith("#/m/") && INDEX.has(h.slice(4)) ? MODULES[INDEX.get(h.slice(4))].title
          : h.startsWith("#/p/") && PINDEX.has(h.slice(4)) ? PROJECTS[PINDEX.get(h.slice(4))].name
          : null;
  document.title = t ? t + " — Go From Zero" : "Go From Zero — Learn Golang, Beginner to Internals";
}

/* #/sheets/<id> and #/glossary/<term> land on that card, not the top of the page. */
function revealDeepLink(h) {
  let el = null;
  if (h.startsWith("#/sheets/")) {
    const id = decodeURIComponent(h.slice("#/sheets/".length));
    el = document.querySelector('[data-sheet="' + CSS.escape(id) + '"]');
    if (el) {
      const box = $(".preview", el);
      const pv = $("[data-pv]", el);
      if (box) box.classList.add("show");
      if (pv) pv.textContent = "✕ Hide";
    }
  } else if (h.startsWith("#/glossary/")) {
    el = document.getElementById(glossDomId(decodeURIComponent(h.slice("#/glossary/".length))));
  }
  if (el) el.scrollIntoView({ block: "start" });
}

/* One page view per hash route. The insights script ignores hash changes on its own. */
function trackVisit() {
  if (typeof window.va !== "function") return;
  let path = (location.hash || "#/").replace(/^#/, "") || "/";
  if (path.charAt(0) !== "/") path = "/" + path;
  path = path.split("?")[0];
  window.va("pageview", { path: path, route: path });
}

/* Reading length of the page currently on screen. Modules use their stated
   minutes; everything else is estimated at about 200 words a minute. */
let pageLen = { label: "1 min", minutes: 1 };

function measurePageLength() {
  const h = location.hash || "#/";
  if (h.startsWith("#/m/") && INDEX.has(h.slice(4))) {
    const m = MODULES[INDEX.get(h.slice(4))];
    if (m && m.minutes) {
      pageLen = { label: m.minutes + " min", minutes: m.minutes };
      return;
    }
  }
  const text = ($("#main") && $("#main").innerText || "").trim();
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  pageLen = { label: "~" + minutes + " min", minutes };
}

function updateReadingRail() {
  const rail = $("#readRail");
  const top = $("#scrollProgress");
  if (!rail) return;
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const pct = scrollable > 0 ? Math.min(100, Math.max(0, scrollY / scrollable * 100)) : 0;
  const rounded = Math.round(pct);
  const left = Math.max(0, Math.ceil(pageLen.minutes * (1 - pct / 100)));
  $("#readRailLen").textContent = pageLen.label;
  $("#readRailFill").style.height = pct + "%";
  $("#readRailPct").textContent = rounded + "%";
  $("#readRailLeft").textContent = rounded >= 100 ? "done" : left + " min left";
  const bar = $("#readRailBar");
  bar.setAttribute("aria-valuenow", String(rounded));
  bar.setAttribute("aria-valuetext", rounded + "% of " + pageLen.label + (rounded >= 100 ? "" : ", " + left + " min left"));
  rail.hidden = scrollable <= 24;
  if (top) top.style.width = pct + "%";
}

/* ---------- quiz interaction ---------- */
function onQuizClick(btn) {
  const q = btn.closest(".q");
  if (q.dataset.answered) return;

  const quiz    = q.closest(".quiz");
  const modId   = quiz.dataset.quiz;
  const correct = Number(q.dataset.answer);
  const picked  = Number(btn.dataset.opt);
  const right   = picked === correct;

  q.dataset.answered = right ? "right" : "wrong";
  $$(".opt", q).forEach(o => {
    const i = Number(o.dataset.opt);
    o.disabled = true;
    if (i === correct) { o.classList.add("right"); $(".mark", o).textContent = "✓"; }
    else if (i === picked) { o.classList.add("wrong"); $(".mark", o).textContent = "✗"; }
    else o.classList.add("dim");
  });
  $(".explain", q).classList.add("show");

  const qs      = $$(".q", quiz);
  const done    = qs.filter(x => x.dataset.answered);
  const correctN = qs.filter(x => x.dataset.answered === "right").length;
  $("[data-score]", quiz).textContent = correctN + " / " + qs.length;

  if (done.length === qs.length) {
    const missed = qs.filter(x => x.dataset.answered !== "right").map(x => Number(x.dataset.q));
    const passed = correctN === qs.length;
    state.scores[modId] = { correct: correctN, total: qs.length, missed };
    if (passed) state.done[modId] = true;
    save();
    if (passed) {
      paintProgress();
      renderNav();
      applyNavFilter($("#search") ? $("#search").value : "");
      const head = $(".mod-meta");
      if (head && !head.querySelector(".done-chip")) {
        head.insertAdjacentHTML("beforeend", '<span class="done-chip" style="color:var(--ok)">✓ completed</span>');
      }
      const mdBtn = $("[data-markdone]");
      if (mdBtn) {
        mdBtn.closest("[data-markwrap]").classList.add("on");
        mdBtn.className = "btn btn-ghost";
        mdBtn.textContent = "✓ Completed — mark as not done";
      }
    }

    const box = $(".quiz-done", quiz);
    const missedLabel = missed.map(i => "Q" + (i + 1)).join(", ");
    const msg = passed ? "Perfect score. 🐹 Nothing left to review here."
              : "Missed " + missedLabel + ". This module stays incomplete until every answer is correct, or you mark it complete yourself.";
    box.innerHTML = "<b>" + correctN + " / " + qs.length + (passed ? " — module complete ✓" : " — not complete yet") + "</b><p>" + msg + "</p>" +
      (passed ? "" : '<button class="btn btn-primary" type="button" data-retry style="margin-top:12px">Try again</button>');
    box.classList.add("show");
  }
}

/* ---------- PDF writer -------------------------------------------------
   A minimal PDF 1.4 generator for monospaced text. No dependencies: the
   cheat sheets are fixed-width ASCII art, so Courier + line layout is all
   that is needed. Produces a real .pdf file, not a print dialog.          */

const FOLD = {
  "─": "-", "━": "-", "│": "|", "┃": "|", "┌": "+", "┐": "+", "└": "+", "┘": "+",
  "├": "+", "┤": "+", "┬": "+", "┴": "+", "┼": "+", "═": "=", "║": "|",
  "╔": "+", "╗": "+", "╚": "+", "╝": "+", "╠": "+", "╣": "+", "╦": "+", "╩": "+",
  "▼": "v", "▲": "^", "◀": "<", "▶": ">", "←": "<-", "→": "->", "↑": "^", "↓": "v",
  "▸": ">", "•": "*", "·": ".", "–": "-", "—": "--", "…": "...",
  "“": '"', "”": '"', "‘": "'", "’": "'", "≈": "~", "≤": "<=", "≥": ">=",
  "×": "x", "µ": "u", "✓": "[x]", "✗": "x", "⏱": "", "❓": "", "√": "v"
};
/* Courier has no glyphs for box drawing or emoji — fold to ASCII first. */
function toAscii(s) {
  let out = "";
  for (const ch of String(s).replace(/\t/g, "    ")) {
    const c = ch.codePointAt(0);
    if (c >= 32 && c <= 126) { out += ch; continue; }
    if (FOLD[ch] !== undefined) { out += FOLD[ch]; continue; }
    if (c > 126) continue;              // drop emoji / unsupported
    out += " ";
  }
  return out;
}
const pdfStr = s => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const PDF = { W: 595.28, H: 841.89, M: 36, FS: 8, LEAD: 10.2, FOOT: 22 };
const pdfCols  = Math.floor((PDF.W - PDF.M * 2) / (PDF.FS * 0.6));          // ~108
const pdfLines = Math.floor((PDF.H - PDF.M - PDF.FOOT - PDF.FS) / PDF.LEAD); // ~76

/* docs: [{title, body}] -> Blob */
function buildPDF(docs, docTitle) {
  /* 1. flow text into lines, honouring explicit page breaks */
  const flow = [];
  docs.forEach((d, di) => {
    if (di > 0) flow.push({ br: true });
    flow.push({ t: toAscii(d.title), b: true });
    flow.push({ t: "=".repeat(Math.min(pdfCols, toAscii(d.title).length)) });
    flow.push({ t: "" });
    /* the sheet bodies carry their own ALL-CAPS title + "====" rule; the PDF
       already prints a heading, so drop the duplicate */
    let src = String(d.body).split("\n");
    if (src.length > 2 && /^=+$/.test((src[1] || "").trim())) {
      src = src.slice(2);
      while (src.length && !src[0].trim()) src.shift();
    }
    for (const raw of src) {
      const line = toAscii(raw);
      if (line.length <= pdfCols) { flow.push({ t: line }); continue; }
      const indent = (line.match(/^\s*/) || [""])[0].slice(0, 20);
      let rest = line, first = true;
      while (rest.length) {
        const width = first ? pdfCols : pdfCols - indent.length;
        let cut = rest.length > width ? rest.lastIndexOf(" ", width) : rest.length;
        if (cut <= indent.length) cut = Math.min(width, rest.length);
        flow.push({ t: (first ? "" : indent) + rest.slice(0, cut).trimEnd() });
        rest = rest.slice(cut).replace(/^ +/, "");
        first = false;
      }
    }
  });

  /* 2. paginate */
  const pages = [[]];
  for (const item of flow) {
    if (item.br) { if (pages[pages.length - 1].length) pages.push([]); continue; }
    if (pages[pages.length - 1].length >= pdfLines) pages.push([]);
    pages[pages.length - 1].push(item);
  }
  if (!pages[pages.length - 1].length) pages.pop();

  /* 3. one content stream per page */
  const streams = pages.map((lines, i) => {
    let s = "BT /F1 " + PDF.FS + " Tf " + PDF.LEAD + " TL 1 0 0 1 " +
            PDF.M + " " + (PDF.H - PDF.M) + " Tm\n";
    let bold = false;
    for (const ln of lines) {
      if (!!ln.b !== bold) { bold = !!ln.b; s += "/" + (bold ? "F2" : "F1") + " " + PDF.FS + " Tf\n"; }
      s += "(" + pdfStr(ln.t) + ") Tj T*\n";
    }
    s += "ET\n";
    const foot = toAscii(docTitle) + "   |   page " + (i + 1) + " of " + pages.length +
                 "   |   Go From Zero";
    s += "BT /F1 6.5 Tf 1 0 0 1 " + PDF.M + " " + (PDF.M - 14) + " Tm (" + pdfStr(foot) + ") Tj ET\n";
    return s;
  });

  /* 4. assemble objects: 1 catalog, 2 pages, 3-4 fonts, then page+content pairs */
  const objs = [];
  const nPages = pages.length;
  const kids = [];
  for (let i = 0; i < nPages; i++) kids.push(5 + i * 2 + " 0 R");

  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objs[2] = "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + nPages + " >>";
  objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>";
  objs[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>";
  for (let i = 0; i < nPages; i++) {
    const pageNo = 5 + i * 2, contNo = pageNo + 1;
    objs[pageNo] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
      PDF.W.toFixed(2) + " " + PDF.H.toFixed(2) + "] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >>" +
      " /Contents " + contNo + " 0 R >>";
    objs[contNo] = { stream: streams[i] };
  }

  /* 5. serialise with a correct xref table */
  const enc = new TextEncoder();
  const parts = [];
  let len = 0;
  const push = str => { const b = enc.encode(str); parts.push(b); len += b.length; return b; };
  const offsets = [];

  push("%PDF-1.4\n");
  for (let i = 1; i < objs.length; i++) {
    offsets[i] = len;
    const o = objs[i];
    if (typeof o === "object" && o.stream !== undefined) {
      const body = o.stream;
      push(i + " 0 obj\n<< /Length " + enc.encode(body).length + " >>\nstream\n" + body + "endstream\nendobj\n");
    } else {
      push(i + " 0 obj\n" + o + "\nendobj\n");
    }
  }
  const xref = len;
  let x = "xref\n0 " + objs.length + "\n0000000000 65535 f \n";
  for (let i = 1; i < objs.length; i++) x += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  push(x);
  push("trailer\n<< /Size " + objs.length + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");

  return new Blob(parts, { type: "application/pdf" });
}

function downloadPDF(name, docs, title) {
  try {
    const blob = buildPDF(docs, title);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast("Downloaded " + name);
  } catch (err) {
    toast("PDF failed — falling back to text");
    download(name.replace(/\.pdf$/, ".txt"), docs.map(d => d.title + "\n\n" + d.body).join("\n\n"));
  }
}

/* A print window containing ONLY the sheets — never the whole app page. */
function printSheets(sheets, title) {
  const w = window.open("", "_blank");
  if (!w) { toast("Popup blocked — use the PDF button instead"); return; }
  w.document.write(
    "<!doctype html><html><head><meta charset='utf-8'><title>" + esc(title) + "</title>" +
    "<style>@page{size:A4;margin:14mm}body{font:9px/1.45 ui-monospace,Menlo,Consolas,monospace;color:#000;background:#fff;margin:0}" +
    "h1{font-size:13px;margin:0 0 8px;border-bottom:1px solid #000;padding-bottom:4px}" +
    "section{page-break-after:always}section:last-child{page-break-after:auto}" +
    "pre{white-space:pre-wrap;margin:0;font:inherit}</style></head><body>" +
    sheets.map(s => "<section><h1>" + esc(s.name) + "</h1><pre>" + esc(s.body) + "</pre></section>").join("") +
    "</body></html>"
  );
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 250);
}

/* ---------- downloads ---------- */
function download(name, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Downloaded " + name);
}
const sheetById = id => SHEETS.find(s => s.id === id);

function toMarkdown(s) {
  return "# " + s.name + "\n\n_" + s.desc + "_\n\n```text\n" + s.body + "\n```\n";
}
function bundleContents() {
  return "Generated " + new Date().toISOString().slice(0, 10) + "\n\nCONTENTS\n\n" +
    SHEETS.map((s, i) => "  " + String(i + 1).padStart(2) + ". " + s.name + "\n      " + s.desc).join("\n\n") +
    "\n\n\nEach sheet starts on a new page.";
}

function allSheetsText() {
  const bar = "=".repeat(74);
  return "GO FROM ZERO — COMPLETE CHEAT SHEET BUNDLE\n" + bar + "\n" +
    "Generated " + new Date().toISOString().slice(0, 10) + "\n\nCONTENTS\n" +
    SHEETS.map((s, i) => "  " + (i + 1) + ". " + s.name).join("\n") +
    "\n\n" + SHEETS.map(s => bar + "\n" + s.body).join("\n\n") + "\n";
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand && document.execCommand("copy");
    ta.remove();
    return !!ok;
  }
}

/* ---------- search ----------
   The old version only matched titles/blurbs, so "printf" or "how to install go"
   found nothing and the nav collapsed to empty. This indexes the full text of
   every module, project, sheet, glossary term and page, and renders real
   results. */

const stripTags = h => String(h).replace(/<[^>]*>/g, " ")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&amp;/g, "&").replace(/&#?\w+;/g, " ");

function blocksText(blocks) {
  return (blocks || []).map(b => {
    switch (b.t) {
      case "h":    return b.text;
      case "p":    return stripTags(b.html);
      case "code": return (b.title || "") + " " + b.code;
      case "list": return (b.items || []).map(stripTags).join(" ");
      case "table": return [...(b.head || []), ...(b.rows || []).flat()].map(stripTags).join(" ");
      case "note": return stripTags(b.title || "") + " " + stripTags(b.html || "");
      case "diagram": {
        const d = DIAGRAMS[b.id] || {};
        return (d.title || "") + " " + stripTags(d.caption || "");
      }
      default: return "";
    }
  }).join("\n");
}

let INDEX_DOCS = [];
function buildSearchIndex() {
  const docs = [];
  MODULES.forEach((m, i) => docs.push({
    kind: "Module", icon: m.icon, title: m.title, sub: m.level + " · module " + (i + 1),
    href: "#/m/" + m.id, navId: m.id,
    strong: m.title + " " + m.blurb + " " + m.summary.join(" "),
    text: [m.title, m.blurb, m.summary.join(" "), blocksText(m.blocks),
           m.quiz.map(q => q.q + " " + q.options.join(" ") + " " + q.explain).join(" ")].join("\n")
  }));
  PROJECTS.forEach(p => docs.push({
    kind: "Project", icon: p.icon, title: p.name.split(" — ")[0], sub: (p.category || "") + " · " + p.level,
    href: "#/p/" + p.id, navId: p.id,
    strong: p.name + " " + p.tagline + " " + p.stack.join(" "),
    text: [p.name, p.tagline, p.stack.join(" "), blocksText(p.blocks),
           p.milestones.map(x => x.title + " " + x.detail).join(" "),
           (p.done || []).join(" "), (p.stretch || []).join(" ")].join("\n")
  }));
  SHEETS.forEach(sh => docs.push({
    kind: "Cheat sheet", icon: sh.icon, title: sh.name, sub: "downloadable reference",
    href: "#/sheets/" + encodeURIComponent(sh.id), navId: "__sheets",
    strong: sh.name + " " + sh.desc + " " + sh.tags.join(" "),
    text: [sh.name, sh.desc, sh.tags.join(" "), sh.body].join("\n")
  }));
  Object.entries(GLOSSARY).forEach(([k, g]) => docs.push({
    kind: "Glossary", icon: "📖", title: g.term, sub: "definition",
    href: "#/glossary/" + encodeURIComponent(k), navId: "__glossary", gloss: k,
    strong: g.term + " " + k, text: g.term + " " + stripTags(g.def)
  }));
  Object.entries(PAGES).forEach(([k, p]) => docs.push({
    kind: "Page", icon: p.icon, title: p.title, sub: "site information",
    href: "#/" + k, navId: "__" + (k === "how-to-use" ? "how" : k),
    strong: p.title + " " + p.blurb, text: [p.title, p.blurb, blocksText(p.blocks)].join("\n")
  }));
  docs.forEach(d => { d.lcText = d.text.toLowerCase(); d.lcStrong = d.strong.toLowerCase(); });
  INDEX_DOCS = docs;
}

/* very small stop list so "how to install go" behaves like "install go" */
const STOP = new Set(["a","an","the","to","of","in","is","it","for","and","or","do","i","how","what",
                      "my","me","on","with","does","can","use","using","be","are","as","at","by"]);

function searchDocs(raw) {
  const q = raw.trim().toLowerCase();
  if (q.length < 2) return [];
  let terms = q.split(/\s+/).filter(t => t.length > 1 && !STOP.has(t));
  if (!terms.length) terms = q.split(/\s+/).filter(Boolean);

  const hits = [];
  for (const d of INDEX_DOCS) {
    if (!terms.every(t => d.lcText.includes(t))) continue;     /* AND over terms */
    let score = 0;
    for (const t of terms) {
      if (d.title.toLowerCase().includes(t)) score += 60;
      if (d.lcStrong.includes(t)) score += 25;
      score += Math.min(12, (d.lcText.split(t).length - 1)) * 2;   /* frequency, capped */
    }
    if (d.kind === "Module") score += 8;                        /* prefer the course itself */
    if (d.kind === "Glossary") score += 4;
    hits.push({ d, score, term: terms[0] });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 40);
}

function snippet(text, term) {
  const i = text.toLowerCase().indexOf(term);
  if (i < 0) return esc(text.slice(0, 150)) + "…";
  const from = Math.max(0, i - 70), to = Math.min(text.length, i + term.length + 110);
  const raw = (from > 0 ? "…" : "") + text.slice(from, to).replace(/\s+/g, " ") + (to < text.length ? "…" : "");
  const re = new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
  return esc(raw).replace(re, "<mark>$1</mark>");
}

function searchPage(raw, hits) {
  if (!hits.length) {
    return '<div class="wrap"><div class="empty">' +
      "<h1>No results for “" + esc(raw) + "”</h1>" +
      "<p>Try fewer or different words — the search covers every module, project, cheat sheet, " +
      "glossary term and page.</p>" +
      '<p style="margin-top:18px">Popular: ' +
      ["printf", "slices", "goroutine", "install", "testing", "garbage collector", "docker"]
        .map(t => '<button class="mini" type="button" data-q="' + t + '">' + t + "</button>").join(" ") +
      "</p></div></div>";
  }
  const groups = {};
  hits.forEach(h => (groups[h.d.kind] = groups[h.d.kind] || []).push(h));
  const order = ["Module", "Glossary", "Cheat sheet", "Project", "Page"];
  const labels = { Module: "Modules", Glossary: "Glossary", "Cheat sheet": "Cheat sheets", Project: "Projects", Page: "Pages" };
  return '<div class="wrap"><div class="section-head"><h2>' + hits.length +
    " result" + (hits.length === 1 ? "" : "s") + " for “" + esc(raw) + "”</h2>" +
    '<span><button class="mini" type="button" data-clearq>clear</button></span></div>' +
    order.filter(k => groups[k]).map(k =>
      '<div class="search-group"><h3>' + labels[k] + "<span>" + groups[k].length + "</span></h3>" +
      groups[k].map(h =>
        '<a class="sr" href="' + h.d.href + '">' +
          '<span class="sr-ico">' + h.d.icon + "</span>" +
          '<span class="sr-body"><b>' + esc(h.d.title) + "</b>" +
          '<span class="sr-sub">' + esc(h.d.sub) + "</span>" +
          '<span class="sr-snip">' + snippet(h.d.text, h.term) + "</span></span></a>").join("") +
      "</div>").join("") + "</div>";
}

let searchTimer = null;
let searching = false;
let popRestoring = false;

function urlWithQuery(q) {
  const params = new URLSearchParams(location.search);
  if (q) params.set("q", q); else params.delete("q");
  const s = params.toString();
  return location.pathname + (s ? "?" + s : "") + location.hash;
}

function runSearch(raw, opts) {
  opts = opts || {};
  const q = (raw || "").trim();
  applyNavFilter(q);
  if (q.length < 2) {
    if (searching) {
      searching = false;
      const remembered = (history.state && history.state.search) || new URLSearchParams(location.search).get("q");
      if (!opts.fromHistory && remembered) { history.back(); return; }
      route();
    }
    return;
  }
  if (!opts.fromHistory) {
    const url = urlWithQuery(q);
    const st = { search: q };
    if (searching) history.replaceState(st, "", url);
    else history.pushState(st, "", url);
  }
  searching = true;
  $("#main").innerHTML = searchPage(q, searchDocs(q));
  window.scrollTo(0, 0);
}

function restoreSearchFromHistory() {
  /* Only an entry we created carries this state. A hash link keeps ?q= in the
     address but has no state, and some browsers fire popstate for that click. */
  const q = (history.state && history.state.search || "").trim();
  if (q.length >= 2) {
    $("#search").value = q;
    runSearch(q, { fromHistory: true });
    return true;
  }
  return false;
}

function applyNavFilter(q) {
  const lc = q.toLowerCase();
  const matchNav = new Set(lc.length >= 2 ? searchDocs(q).map(h => h.d.navId) : []);
  let visible = 0;
  $$("#nav .nav-item").forEach(a => {
    const hide = lc.length >= 2 && !matchNav.has(a.dataset.id) && !(a.dataset.hay || "").includes(lc);
    a.classList.toggle("hidden", hide);
    if (!hide) visible++;
  });
  $$(".nav-group").forEach(g => {
    const any = $$(".nav-item", g).some(a => !a.classList.contains("hidden"));
    g.style.display = any ? "" : "none";
    if (any && lc.length >= 2) g.classList.remove("closed");   /* reveal matches */
    else if (lc.length < 2 && state.collapsed[g.dataset.grp]) g.classList.add("closed");
  });
  let note = $("#navNote");
  if (!visible && lc.length >= 2) {
    if (!note) {
      note = document.createElement("p");
      note.id = "navNote";
      note.className = "nav-note";
      $("#nav").appendChild(note);
    }
    note.textContent = "No section titles match “" + q + "” — see the results on the right.";
  } else if (note) note.remove();
}

/* ---------- legacy card filter (home / sheets / projects pages) ---------- */
function applySearch(raw) {
  const q = (raw || "").trim().toLowerCase();
  const cards = $$("[data-search]");
  if (cards.length) {
    cards.forEach(c => { c.style.display = (!q || c.dataset.search.includes(q)) ? "" : "none"; });
    $$("[data-level-head]").forEach(h => {
      const grid = h.nextElementSibling;
      const any = $$("[data-search]", grid).some(c => c.style.display !== "none");
      h.style.display = any ? "" : "none";
      grid.style.display = any ? "" : "none";
    });
  }
}

/* ---------- drawer / theme ---------- */
function openDrawer()  { $("#sidebar").classList.add("open"); $("#scrim").hidden = false; $("#navToggle").setAttribute("aria-expanded", "true"); }
function closeDrawer() { $("#sidebar").classList.remove("open"); $("#scrim").hidden = true; $("#navToggle").setAttribute("aria-expanded", "false"); }

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  $("#themeToggle").textContent = t === "dark" ? "🌙" : "☀️";
  state.theme = t; save();
}

/* ---------- wiring ---------- */
function init() {
  if (!MODULES.length) { $("#main").innerHTML = '<div class="wrap"><div class="empty">Course data failed to load. Serve the folder over HTTP (<code>python3 -m http.server</code>) and reload.</div></div>'; return; }

  setTheme(state.theme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
  buildSearchIndex();
  renderNav();
  paintProgress();
  route();
  trackVisit();
  if (!storageWorks()) warnNoStorage();

  /* shareable (and testable) search links: ?q=printf */
  const q0 = new URLSearchParams(location.search).get("q");
  if (q0) {
    $("#search").value = q0;
    if (q0.trim().length >= 2) history.replaceState({ search: q0.trim() }, "", location.href);
    runSearch(q0, { fromHistory: true });
  }

  addEventListener("popstate", () => {
    popRestoring = true;
    setTimeout(() => { popRestoring = false; }, 0);
    if (restoreSearchFromHistory()) return;
    searching = false;
    if ($("#search")) $("#search").value = "";
    if (new URLSearchParams(location.search).get("q")) history.replaceState(null, "", urlWithQuery(""));
    route();
    trackVisit();
  });
  addEventListener("hashchange", () => {
    if (popRestoring) return;
    searching = false;
    $("#search").value = "";
    if (new URLSearchParams(location.search).get("q")) history.replaceState(null, "", urlWithQuery(""));
    route();
    trackVisit();
  });
  $("#themeToggle").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  $("#navToggle").addEventListener("click", () => $("#sidebar").classList.contains("open") ? closeDrawer() : openDrawer());
  $("#scrim").addEventListener("click", closeDrawer);
  $("#nav").addEventListener("click", e => {
    const t = e.target.closest("[data-grp-toggle]");
    if (!t) return;
    const key = t.dataset.grpToggle;
    setGroup(key, !state.collapsed[key]);
  });
  $("#collapseAll").addEventListener("click", () => setAllGroups(true));
  $("#expandAll").addEventListener("click", () => setAllGroups(false));

  $("#search").addEventListener("input", e => {
    const v = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(v), 110);
  });
  $("#search").addEventListener("keydown", e => {
    if (e.key === "Enter") { clearTimeout(searchTimer); runSearch(e.target.value); }
    if (e.key === "Escape") { e.target.value = ""; runSearch(""); e.target.blur(); }
  });

  $("#resetProgress").addEventListener("click", () => {
    if (!confirm("Clear all completed modules, quiz scores and project milestones?")) return;
    state.done = {}; state.scores = {}; state.ms = {}; save();
    renderNav(); paintProgress(); route(); toast("Progress cleared");
  });

  /* one delegated click handler for everything inside main */
  $("#main").addEventListener("click", async e => {
    const opt = e.target.closest(".opt");
    if (opt && !opt.disabled) { onQuizClick(opt); return; }

    const retry = e.target.closest("[data-retry]");
    if (retry) {
      const quiz = retry.closest(".quiz");
      const m = MODULES[INDEX.get(quiz.dataset.quiz)];
      if (m) quiz.outerHTML = quizHTML(m);
      return;
    }

    const md = e.target.closest("[data-markdone]");
    if (md) {
      const id = md.dataset.markdone;
      const now = !state.done[id];
      if (now) state.done[id] = true; else delete state.done[id];
      save();
      paintProgress();
      renderNav();
      applyNavFilter($("#search") ? $("#search").value : "");
      const wrap = md.closest("[data-markwrap]");
      wrap.classList.toggle("on", now);
      md.className = "btn " + (now ? "btn-ghost" : "btn-primary");
      md.textContent = now ? "✓ Completed — mark as not done" : "✓ Mark this module complete";
      const meta = $(".mod-meta");
      if (meta) {
        const chip = meta.querySelector(".done-chip");
        if (now && !chip) meta.insertAdjacentHTML("beforeend",
          '<span class="done-chip" style="color:var(--ok)">✓ completed</span>');
        if (!now && chip) chip.remove();
      }
      toast(now ? "Marked complete — " + pct() + "% of the course" : "Marked as not done");
      return;
    }

    const ms = e.target.closest("[data-ms]");
    if (ms) { onMilestone(ms); return; }

    const gl = e.target.closest(".gloss");
    if (gl) { e.stopPropagation(); openGloss(gl); return; }

    const pz = e.target.closest("[data-pause]");
    if (pz) {
      state.animPaused = !state.animPaused; save();
      $$(".dg").forEach(fig => fig.classList.toggle("paused", state.animPaused));
      $$("[data-pause]").forEach(btn => btn.textContent = state.animPaused ? "▶ play" : "⏸ pause");
      toast(state.animPaused ? "Animations paused" : "Animations playing");
      return;
    }

    const replay = e.target.closest("[data-replay]");
    if (replay) {
      const fig = replay.closest(".dg");
      const stage = fig.querySelector(".dg-stage");
      const svg = stage.firstElementChild;
      stage.replaceChild(svg.cloneNode(true), svg);   // restarts every CSS animation
      if (state.animPaused) {                         // replay implies play
        state.animPaused = false; save();
        $$(".dg").forEach(f2 => f2.classList.remove("paused"));
        $$("[data-pause]").forEach(btn => btn.textContent = "⏸ pause");
      }
      return;
    }

    const qb = e.target.closest("[data-q]");
    if (qb) { $("#search").value = qb.dataset.q; runSearch(qb.dataset.q); return; }
    if (e.target.closest("[data-clearq]")) { $("#search").value = ""; runSearch(""); return; }

    const jump = e.target.closest("[data-jump]");
    if (jump) {
      const el = document.getElementById(jump.dataset.jump);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const play = e.target.closest("[data-play]");
    if (play) { runInPlayground(play); return; }

    if (e.target.closest("[data-playtpl]")) { runInPlayground(e.target, BLANK_TPL); return; }

    const cpProg = e.target.closest("[data-copyprog]");
    if (cpProg) {
      const prog = decodeURIComponent(cpProg.closest("[data-prog]").dataset.prog);
      toast((await copyText(prog)) ? "Program copied" : "Copy blocked by browser");
      return;
    }

      const cp = e.target.closest("[data-copy]");
    if (cp) {
      const code = cp.closest(".code").querySelector("pre").innerText;
      cp.textContent = (await copyText(code)) ? "Copied ✓" : "Failed";
      cp.classList.add("copied");
      setTimeout(() => { cp.textContent = "Copy"; cp.classList.remove("copied"); }, 1400);
      return;
    }

    const pdf = e.target.closest("[data-pdf]");
    if (pdf) {
      const s = sheetById(pdf.dataset.pdf);
      pdf.textContent = "building…";
      downloadPDF("go-" + s.id + "-cheatsheet.pdf", [{ title: s.name, body: s.body }], s.name);
      pdf.textContent = "⬇ PDF";
      return;
    }

    const dl = e.target.closest("[data-dl]");
    if (dl) { const s = sheetById(dl.dataset.dl); download("go-" + s.id + "-cheatsheet.txt", s.body); return; }

    const mdBtn = e.target.closest("[data-md]");
    if (mdBtn) { const s = sheetById(mdBtn.dataset.md); download("go-" + s.id + "-cheatsheet.md", toMarkdown(s)); return; }

    const cpS = e.target.closest("[data-cp]");
    if (cpS) { const s = sheetById(cpS.dataset.cp); toast((await copyText(s.body)) ? "Copied to clipboard" : "Copy blocked by browser"); return; }

    const pv = e.target.closest("[data-pv]");
    if (pv) {
      const box = pv.closest(".sheet-card").querySelector(".preview");
      box.classList.toggle("show");
      pv.textContent = box.classList.contains("show") ? "✕ Hide" : "👁 Preview";
      return;
    }

    if (e.target.closest("#dlAll")) { download("go-cheatsheets-complete.txt", allSheetsText()); return; }

    const all = e.target.closest("#pdfAll");
    if (all) {
      all.textContent = "building…";
      const docs = [{ title: "Go From Zero — Cheat Sheet Bundle", body: bundleContents() }]
        .concat(SHEETS.map(s => ({ title: s.name, body: s.body })));
      downloadPDF("go-cheatsheets-complete.pdf", docs, "Go cheat sheets");
      all.textContent = "⬇ All " + SHEETS.length + " sheets as one PDF";
      return;
    }

    if (e.target.closest("#printAll")) { printSheets(SHEETS, "Go cheat sheets"); return; }
  });

  /* glossary popover: chips, close, outside click */
  document.addEventListener("click", e => {
    if (e.target.closest("[data-dismisswarn]")) { const w = $("#noStore"); if (w) w.remove(); return; }
    const chip = e.target.closest(".gloss-chip");
    if (chip) {
      const anchor = glossOpen;                     /* keep the inline term intact */
      if (anchor) openGloss(anchor, chip.dataset.g);
      return;
    }
    if (e.target.closest("[data-gclose]") || e.target.classList.contains("gloss-scrim")) { closeGloss(); return; }
    if (!e.target.closest(".gloss, .gloss-pop, .gloss-sheet")) closeGloss();
  });
  addEventListener("scroll", () => { if (glossOpen && innerWidth > 820) closeGloss(); }, { passive: true });

  /* keyboard shortcuts */
  addEventListener("keydown", e => {
    const el = document.activeElement;
    const typing = !!(el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
    const inControl = !!(el && (el.isContentEditable || el.closest("button, a, summary, [role='button'], [role='link']")));
    if (e.key === "/" && !typing) { e.preventDefault(); $("#search").focus(); return; }
    if (e.key === "Escape") { closeGloss(); $("#search").blur(); closeDrawer(); return; }
    if (typing || inControl || e.metaKey || e.ctrlKey || e.altKey) return;
    const h = location.hash;
    const list = h.startsWith("#/m/") ? MODULES : h.startsWith("#/p/") ? PORDER : null;
    if (!list) return;
    const pre = h.slice(0, 4);
    const i = (list === MODULES ? INDEX : PPOS).get(h.slice(4));
    if (i === undefined) return;
    if (e.key === "ArrowLeft"  && list[i - 1]) location.hash = pre + list[i - 1].id;
    if (e.key === "ArrowRight" && list[i + 1]) location.hash = pre + list[i + 1].id;
  });

  /* reading length and progress: header bar and the right-hand rail */
  addEventListener("scroll", updateReadingRail, { passive: true });
  addEventListener("resize", updateReadingRail);
  updateReadingRail();
}

document.readyState === "loading" ? addEventListener("DOMContentLoaded", init) : init();
})();
