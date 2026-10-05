/* Animated SVG diagrams.
   Referenced from content as { t: "diagram", id: "<key>" }.
   All colour comes from CSS classes so both themes work; every figure is
   readable with animation disabled (prefers-reduced-motion). */
window.DIAGRAMS = {

/* ─────────────── the compile pipeline ─────────────── */
pipeline: {
  title: "From source to a single binary",
  caption: "One ahead-of-time pass. No bytecode, no VM, no JIT at run time — the Go runtime is linked in as ordinary code.",
  svg: `<svg viewBox="0 0 980 360" role="img" aria-label="Source text becomes a tree, is type-checked and tidied, turns into CPU instructions, then links with imports and the runtime into one file">
    <defs><marker id="dgArrP" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>

    <text class="dg-t sm" x="20" y="22">The program changes shape. Then three pieces become one file.</text>

    <g class="dg-seq" style="--i:0">
      <rect class="dg-box dg-lit" style="--i:0" x="20" y="40" width="136" height="132" rx="12"/>
      <text class="dg-t mono sm" x="88" y="64" text-anchor="middle">main.go</text>
      <rect class="dg-ink fill" x="40" y="76" width="96" height="5" rx="2"/>
      <rect class="dg-ink fill" x="40" y="90" width="72" height="5" rx="2"/>
      <rect class="dg-ink fill" x="40" y="104" width="88" height="5" rx="2"/>
      <rect class="dg-ink fill" x="40" y="118" width="56" height="5" rx="2"/>
      <text class="dg-t sm" x="88" y="156" text-anchor="middle">source</text>
    </g>

    <g class="dg-seq" style="--i:1">
      <rect class="dg-box dg-lit" style="--i:1" x="200" y="40" width="136" height="132" rx="12"/>
      <circle class="dg-g" cx="268" cy="70" r="9"/>
      <path class="dg-ink" d="M268 80 L240 108 M268 80 L268 108 M268 80 L296 108"/>
      <circle class="dg-g" cx="236" cy="118" r="8"/>
      <circle class="dg-g" cx="268" cy="118" r="8"/>
      <circle class="dg-g" cx="300" cy="118" r="8"/>
      <text class="dg-t sm" x="268" y="156" text-anchor="middle">parse</text>
    </g>

    <g class="dg-seq" style="--i:2">
      <rect class="dg-box dg-lit" style="--i:2" x="380" y="40" width="136" height="132" rx="12"/>
      <circle class="dg-badge" cx="490" cy="66" r="11"/>
      <path class="dg-mark" d="M484 66 l4 4 l8 -9"/>
      <circle class="dg-g" cx="448" cy="78" r="9"/>
      <path class="dg-ink" d="M448 88 L424 112 M448 88 L448 112 M448 88 L472 112"/>
      <circle class="dg-g" cx="420" cy="122" r="8"/>
      <circle class="dg-g" cx="448" cy="122" r="8"/>
      <circle class="dg-g" cx="476" cy="122" r="8"/>
      <text class="dg-t sm" x="448" y="156" text-anchor="middle">type check</text>
    </g>

    <g class="dg-seq" style="--i:3">
      <rect class="dg-box accent dg-lit" style="--i:3" x="560" y="40" width="136" height="132" rx="12"/>
      <circle class="dg-g" cx="628" cy="70" r="9"/>
      <path class="dg-ink" d="M628 80 L600 108 M628 80 L628 108"/>
      <path class="dg-ink soft" d="M628 80 L656 108"/>
      <circle class="dg-g" cx="596" cy="118" r="8"/>
      <circle class="dg-g" cx="628" cy="118" r="8"/>
      <circle class="dg-g dg-ink soft" cx="660" cy="118" r="8"/>
      <path class="dg-ink" d="M654 112 L666 124 M666 112 L654 124"/>
      <text class="dg-t sm" x="628" y="156" text-anchor="middle">tidy</text>
    </g>

    <g class="dg-seq" style="--i:4">
      <rect class="dg-box dg-lit" style="--i:4" x="740" y="40" width="136" height="132" rx="12"/>
      <rect class="dg-ink fill" x="762" y="64" width="92" height="6" rx="2"/>
      <rect class="dg-ink fill" x="762" y="80" width="64" height="6" rx="2"/>
      <rect class="dg-ink fill" x="762" y="96" width="84" height="6" rx="2"/>
      <rect class="dg-ink fill" x="762" y="112" width="48" height="6" rx="2"/>
      <text class="dg-t sm" x="808" y="156" text-anchor="middle">CPU code</text>
    </g>

    <g class="dg-arrow dg-ants mid" marker-end="url(#dgArrP)">
      <line x1="164" y1="96" x2="192" y2="96"/>
      <line x1="344" y1="96" x2="372" y2="96"/>
      <line x1="524" y1="96" x2="552" y2="96"/>
      <line x1="704" y1="96" x2="732" y2="96"/>
    </g>

    <text class="dg-t sm" x="20" y="204">link — your code, the packages you import, and the runtime</text>

    <g class="dg-seq" style="--i:5"><rect class="dg-box accent" x="20" y="230" width="156" height="50" rx="10"/>
      <text class="dg-t" x="98" y="259" text-anchor="middle">your code</text></g>
    <text class="dg-t sm dim" x="194" y="260" text-anchor="middle">+</text>
    <g class="dg-seq" style="--i:6"><rect class="dg-box" x="212" y="230" width="140" height="50" rx="10"/>
      <text class="dg-t" x="282" y="259" text-anchor="middle">imports</text></g>
    <text class="dg-t sm dim" x="370" y="260" text-anchor="middle">+</text>
    <g class="dg-seq" style="--i:7"><rect class="dg-box" x="388" y="230" width="168" height="50" rx="10"/>
      <text class="dg-t" x="472" y="259" text-anchor="middle">the runtime</text></g>

    <path class="dg-arrow dg-ants slow" d="M572 255 L728 255" marker-end="url(#dgArrP)"/>

    <g class="dg-seq" style="--i:8">
      <rect class="dg-box ok dg-lit" style="--i:8" x="740" y="214" width="210" height="82" rx="14"/>
      <text class="dg-t mono" x="845" y="248" text-anchor="middle">./app</text>
      <text class="dg-t sm" x="845" y="272" text-anchor="middle">one file</text>
    </g>

    <text class="dg-t sm dim" x="20" y="336">go run is this same path, into a temp file that is run and then deleted.</text>
  </svg>`
},

/* ─────────────── compiled vs interpreted vs JIT ─────────────── */
"exec-models": {
  title: "Compiled vs interpreted vs JIT",
  caption: "Three ways source becomes CPU instructions. Go sits firmly in the first row.",
  svg: `<svg viewBox="0 0 940 400" role="img" aria-label="Comparison of ahead-of-time compilation, interpretation and just-in-time compilation">
    <defs><marker id="dgArrE" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <g class="dg-lane accent">
      <rect class="dg-laneBg" x="4" y="8" width="932" height="112" rx="10"/>
      <text class="dg-t" x="18" y="40">AOT compiled</text>
      <text class="dg-t sm" x="18" y="62">Go, Rust, C</text>
      <text class="dg-t sm ok" x="18" y="84">fast immediately</text>
      <rect class="dg-box" x="200" y="34" width="120" height="56" rx="8"/><text class="dg-t mono" x="260" y="68" text-anchor="middle">source</text>
      <rect class="dg-box" x="380" y="34" width="140" height="56" rx="8"/><text class="dg-t" x="450" y="68" text-anchor="middle">compiler</text>
      <rect class="dg-box ok" x="580" y="34" width="160" height="56" rx="8"/><text class="dg-t" x="660" y="68" text-anchor="middle">machine code</text>
      <rect class="dg-box" x="800" y="34" width="110" height="56" rx="8"/><text class="dg-t" x="855" y="68" text-anchor="middle">CPU</text>
      <g class="dg-arrow dg-ants fast" marker-end="url(#dgArrE)"><line x1="324" y1="62" x2="374" y2="62"/><line x1="524" y1="62" x2="574" y2="62"/><line x1="744" y1="62" x2="794" y2="62"/></g>
    </g>

    <g class="dg-lane">
      <rect class="dg-laneBg" x="4" y="136" width="932" height="112" rx="10"/>
      <text class="dg-t" x="18" y="168">Interpreted</text>
      <text class="dg-t sm" x="18" y="190">Python, Ruby, PHP</text>
      <text class="dg-t sm warn" x="18" y="212">re-read every run</text>
      <rect class="dg-box" x="200" y="162" width="120" height="56" rx="8"/><text class="dg-t mono" x="260" y="196" text-anchor="middle">source</text>
      <rect class="dg-box" x="380" y="154" width="330" height="72" rx="8"/>
      <text class="dg-t" x="545" y="182" text-anchor="middle">interpreter reads and runs</text>
      <text class="dg-t sm" x="545" y="204" text-anchor="middle">one statement at a time</text>
      <rect class="dg-box" x="800" y="162" width="110" height="56" rx="8"/><text class="dg-t" x="855" y="196" text-anchor="middle">CPU</text>
      <g class="dg-arrow dg-ants slow" marker-end="url(#dgArrE)"><line x1="324" y1="190" x2="374" y2="190"/><line x1="714" y1="190" x2="794" y2="190"/></g>
    </g>

    <g class="dg-lane">
      <rect class="dg-laneBg" x="4" y="264" width="932" height="124" rx="10"/>
      <text class="dg-t" x="18" y="296">JIT compiled</text>
      <text class="dg-t sm" x="18" y="318">Java, C#, JavaScript</text>
      <text class="dg-t sm" x="18" y="340">slow, then fast</text>
      <rect class="dg-box" x="188" y="292" width="96" height="56" rx="8"/><text class="dg-t mono" x="236" y="326" text-anchor="middle">source</text>
      <rect class="dg-box" x="316" y="284" width="112" height="72" rx="8"/><text class="dg-t sm" x="372" y="312" text-anchor="middle">bytecode</text>
      <text class="dg-t sm dim" x="372" y="332" text-anchor="middle">portable</text>
      <rect class="dg-box" x="460" y="284" width="168" height="72" rx="8"/><text class="dg-t sm" x="544" y="312" text-anchor="middle">VM interprets</text>
      <text class="dg-t sm dim" x="544" y="332" text-anchor="middle">profiles hot code</text>
      <rect class="dg-box accent" x="660" y="284" width="140" height="72" rx="8"/>
      <text class="dg-t sm" x="730" y="312" text-anchor="middle">JIT compiles</text>
      <text class="dg-t sm dim" x="730" y="332" text-anchor="middle">hot paths only</text>
      <rect class="dg-box" x="832" y="292" width="88" height="56" rx="8"/><text class="dg-t" x="876" y="326" text-anchor="middle">CPU</text>
      <g class="dg-arrow dg-ants mid" marker-end="url(#dgArrE)"><line x1="288" y1="320" x2="310" y2="320"/><line x1="432" y1="320" x2="454" y2="320"/><line x1="632" y1="320" x2="654" y2="320"/><line x1="804" y1="320" x2="826" y2="320"/></g>
      <path class="dg-arrow dashed" d="M544 362 Q640 384 730 362" marker-end="url(#dgArrE)"/>
    </g>
  </svg>`
},

/* ─────────────── variables & zero values ─────────────── */
variable: {
  title: "A variable is a named, typed box",
  caption: "age is one slot in this function's stack memory. age = 40 overwrites that same slot. The garbage collector is not involved until a value has to outlive the function and moves to the heap.",
  svg: `<svg viewBox="0 0 940 320" role="img" aria-label="Variable declaration forms writing into a named typed memory cell, and a table of zero values">
    <defs><marker id="dgArrV" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <text class="dg-t mono dg-seq" style="--i:0" x="10" y="36">var age int = 30</text>
    <text class="dg-t mono dg-seq" style="--i:1" x="10" y="62">var age     = 30</text>
    <text class="dg-t mono dg-seq" style="--i:2" x="10" y="88">age := 30</text>
    <text class="dg-t mono dg-seq dim" style="--i:3" x="10" y="114">var age int</text>
    <text class="dg-t sm dim" x="150" y="114">← no value given</text>

    <path class="dg-arrow" d="M300 60 L392 60" marker-end="url(#dgArrV)"/>
    <text class="dg-t sm" x="312" y="48">stores</text>

    <g>
      <rect class="dg-box accent" x="400" y="26" width="200" height="86" rx="10"/>
      <text class="dg-t sm" x="408" y="18">age</text>
      <text class="dg-t big mono dg-pop" x="500" y="80" text-anchor="middle">30</text>
      <rect class="dg-chip" x="604" y="34" width="52" height="24" rx="12"/>
      <text class="dg-t sm mono" x="630" y="50" text-anchor="middle">int</text>
      <text class="dg-t sm dim" x="604" y="86">8 bytes</text>
      <text class="dg-t sm dim" x="604" y="104">on the stack</text>
    </g>

    <text class="dg-t" x="10" y="166">No value? You still get a usable one — the ZERO VALUE. Go has no &quot;undefined&quot;.</text>

    <g class="dg-seq" style="--i:4"><rect class="dg-box" x="10"  y="186" width="128" height="72" rx="8"/>
      <text class="dg-t sm mono dim" x="74"  y="206" text-anchor="middle">int, float64</text><text class="dg-t mono" x="74"  y="232" text-anchor="middle">0</text></g>
    <g class="dg-seq" style="--i:5"><rect class="dg-box" x="152" y="186" width="118" height="72" rx="8"/>
      <text class="dg-t sm mono dim" x="211" y="206" text-anchor="middle">bool</text><text class="dg-t mono" x="211" y="232" text-anchor="middle">false</text></g>
    <g class="dg-seq" style="--i:6"><rect class="dg-box" x="284" y="186" width="118" height="72" rx="8"/>
      <text class="dg-t sm mono dim" x="343" y="206" text-anchor="middle">string</text><text class="dg-t mono" x="343" y="232" text-anchor="middle">&quot;&quot;</text></g>
    <g class="dg-seq" style="--i:7"><rect class="dg-box" x="416" y="186" width="150" height="72" rx="8"/>
      <text class="dg-t sm mono dim" x="491" y="206" text-anchor="middle">ptr, func, chan</text><text class="dg-t mono" x="491" y="232" text-anchor="middle">nil</text></g>
    <g class="dg-seq" style="--i:8"><rect class="dg-box ok" x="580" y="186" width="160" height="72" rx="8"/>
      <text class="dg-t sm mono dim" x="660" y="206" text-anchor="middle">slice (nil)</text><text class="dg-t sm ok" x="660" y="230" text-anchor="middle">append works</text></g>
    <g class="dg-seq" style="--i:9"><rect class="dg-box bad" x="754" y="186" width="176" height="72" rx="8"/>
      <text class="dg-t sm mono dim" x="842" y="206" text-anchor="middle">map (nil)</text><text class="dg-t sm bad" x="842" y="230" text-anchor="middle">write → panic</text></g>

    <text class="dg-t sm dim" x="10" y="282">age = 40 writes over 30 in the same bytes. Nothing new is allocated, so nothing is collected.</text>
    <text class="dg-t sm dim" x="10" y="304">Return from the function and this stack slot is reused. A heap value is collected only when nothing still points at it.</text>
  </svg>`
},

/* ─────────────── bytes vs runes ─────────────── */
"string-runes": {
  title: "A string is bytes; range gives you runes",
  caption: "len() counts bytes. Indexing returns one byte. Ranging decodes UTF-8 into code points.",
  svg: `<svg viewBox="0 0 940 280" role="img" aria-label="The string Héllo shown as six UTF-8 bytes grouping into five runes">
    <text class="dg-t mono" x="10" y="28">s := &quot;Héllo&quot;</text>

    <text class="dg-t sm dim" x="10" y="64">bytes — what len(s) and s[i] see</text>
    <g class="dg-seq" style="--i:0"><rect class="dg-cell" x="10"  y="76" width="80" height="54" rx="7"/><text class="dg-t mono" x="50"  y="108" text-anchor="middle">H</text><text class="dg-t sm dim" x="50"  y="146" text-anchor="middle">0</text></g>
    <g class="dg-seq pair" style="--i:1"><rect class="dg-cell hot" x="98" y="76" width="80" height="54" rx="7"/><text class="dg-t mono sm" x="138" y="108" text-anchor="middle">0xC3</text><text class="dg-t sm dim" x="138" y="146" text-anchor="middle">1</text></g>
    <g class="dg-seq pair" style="--i:2"><rect class="dg-cell hot" x="186" y="76" width="80" height="54" rx="7"/><text class="dg-t mono sm" x="226" y="108" text-anchor="middle">0xA9</text><text class="dg-t sm dim" x="226" y="146" text-anchor="middle">2</text></g>
    <g class="dg-seq" style="--i:3"><rect class="dg-cell" x="274" y="76" width="80" height="54" rx="7"/><text class="dg-t mono" x="314" y="108" text-anchor="middle">l</text><text class="dg-t sm dim" x="314" y="146" text-anchor="middle">3</text></g>
    <g class="dg-seq" style="--i:4"><rect class="dg-cell" x="362" y="76" width="80" height="54" rx="7"/><text class="dg-t mono" x="402" y="108" text-anchor="middle">l</text><text class="dg-t sm dim" x="402" y="146" text-anchor="middle">4</text></g>
    <g class="dg-seq" style="--i:5"><rect class="dg-cell" x="450" y="76" width="80" height="54" rx="7"/><text class="dg-t mono" x="490" y="108" text-anchor="middle">o</text><text class="dg-t sm dim" x="490" y="146" text-anchor="middle">5</text></g>

    <path class="dg-brace2 dg-glow" d="M102 160 L102 172 L262 172 L262 160"/>
    <text class="dg-t sm accentT dg-glow" x="182" y="192" text-anchor="middle">these two bytes are ONE rune: é</text>

    <text class="dg-t sm dim" x="600" y="64">runes — what for i, r := range s sees</text>
    <g class="dg-seq" style="--i:6"><rect class="dg-cell ok" x="600" y="76" width="56" height="54" rx="7"/><text class="dg-t mono" x="628" y="108" text-anchor="middle">H</text><text class="dg-t sm dim" x="628" y="146" text-anchor="middle">i=0</text></g>
    <g class="dg-seq" style="--i:7"><rect class="dg-cell ok" x="664" y="76" width="56" height="54" rx="7"/><text class="dg-t mono" x="692" y="108" text-anchor="middle">é</text><text class="dg-t sm dim" x="692" y="146" text-anchor="middle">i=1</text></g>
    <g class="dg-seq" style="--i:8"><rect class="dg-cell ok" x="728" y="76" width="56" height="54" rx="7"/><text class="dg-t mono" x="756" y="108" text-anchor="middle">l</text><text class="dg-t sm dim" x="756" y="146" text-anchor="middle">i=3</text></g>
    <g class="dg-seq" style="--i:9"><rect class="dg-cell ok" x="792" y="76" width="56" height="54" rx="7"/><text class="dg-t mono" x="820" y="108" text-anchor="middle">l</text><text class="dg-t sm dim" x="820" y="146" text-anchor="middle">i=4</text></g>
    <g class="dg-seq" style="--i:10"><rect class="dg-cell ok" x="856" y="76" width="56" height="54" rx="7"/><text class="dg-t mono" x="884" y="108" text-anchor="middle">o</text><text class="dg-t sm dim" x="884" y="146" text-anchor="middle">i=5</text></g>
    <text class="dg-t sm dim" x="600" y="192">byte offsets jump — they are not 0,1,2,3,4</text>

    <text class="dg-t mono sm" x="10"  y="232">len(s) = 6</text>
    <text class="dg-t mono sm" x="150" y="232">utf8.RuneCountInString(s) = 5</text>
    <text class="dg-t mono sm" x="430" y="232">s[1] = 195</text>
    <text class="dg-t mono sm" x="580" y="232">[]rune(s)[1] = 'é'</text>
    <text class="dg-t sm dim" x="10" y="262">Strings are immutable: build with strings.Builder, never += in a loop.</text>
  </svg>`
},

/* ─────────────── slice header & append ─────────────── */
"slice-header": {
  title: "The slice header, and what append really does",
  caption: "A slice is three words pointing at an array. Whether append writes in place or reallocates is the whole story behind aliasing bugs.",
  svg: `<svg viewBox="0 0 940 390" role="img" aria-label="Slice header with pointer length and capacity, append writing in place while capacity remains, then reallocating and copying when full">
    <defs><marker id="dgArrS" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <text class="dg-t" x="10" y="22">① len &lt; cap → append writes IN PLACE and the backing array is shared</text>

    <rect class="dg-box accent" x="10" y="38" width="150" height="104" rx="9"/>
    <text class="dg-t sm mono" x="22" y="62">array ●</text>
    <text class="dg-t sm mono" x="22" y="88">len   3</text>
    <text class="dg-t sm mono" x="22" y="114">cap   4</text>
    <text class="dg-t sm dim" x="22" y="160">24 bytes, on the stack</text>

    <path class="dg-arrow" d="M100 62 C 200 62 200 82 268 82" marker-end="url(#dgArrS)"/>

    <rect class="dg-cell" x="270" y="58" width="70" height="48" rx="6"/><text class="dg-t mono" x="305" y="88" text-anchor="middle">1</text>
    <rect class="dg-cell" x="344" y="58" width="70" height="48" rx="6"/><text class="dg-t mono" x="379" y="88" text-anchor="middle">2</text>
    <rect class="dg-cell" x="418" y="58" width="70" height="48" rx="6"/><text class="dg-t mono" x="453" y="88" text-anchor="middle">3</text>
    <rect class="dg-cell dashed dg-fill" x="492" y="58" width="70" height="48" rx="6"/>
    <text class="dg-t mono dg-pop" x="527" y="88" text-anchor="middle">4</text>
    <text class="dg-t sm accentT dg-pop" x="580" y="88">← append(s, 4)</text>

    <path class="dg-brace2" d="M272 116 L272 126 L486 126 L486 116"/><text class="dg-t sm dim" x="379" y="142" text-anchor="middle">len = 3</text>
    <path class="dg-brace2" d="M272 150 L272 160 L560 160 L560 150"/><text class="dg-t sm dim" x="416" y="176" text-anchor="middle">cap = 4 (room to grow)</text>

    <line class="dg-rule" x1="10" y1="196" x2="930" y2="196"/>

    <text class="dg-t" x="10" y="226">② len == cap → append ALLOCATES a bigger array, copies, and returns a new header</text>

    <rect class="dg-box dim" x="10" y="244" width="150" height="70" rx="9"/>
    <text class="dg-t sm mono dim" x="22" y="268">array ●</text>
    <text class="dg-t sm mono dim" x="22" y="292">len 4  cap 4</text>
    <text class="dg-t sm dim" x="22" y="332">old header still points</text>
    <text class="dg-t sm dim" x="22" y="350">at the OLD array</text>

    <rect class="dg-cell dim" x="200" y="244" width="48" height="40" rx="5"/><text class="dg-t mono sm dim" x="224" y="270" text-anchor="middle">1</text>
    <rect class="dg-cell dim" x="252" y="244" width="48" height="40" rx="5"/><text class="dg-t mono sm dim" x="276" y="270" text-anchor="middle">2</text>
    <rect class="dg-cell dim" x="304" y="244" width="48" height="40" rx="5"/><text class="dg-t mono sm dim" x="328" y="270" text-anchor="middle">3</text>
    <rect class="dg-cell dim" x="356" y="244" width="48" height="40" rx="5"/><text class="dg-t mono sm dim" x="380" y="270" text-anchor="middle">4</text>
    <text class="dg-t sm dim" x="200" y="302">orphaned → collected later</text>

    <g class="dg-copy">
      <path class="dg-arrow dashed" d="M224 292 L560 338" marker-end="url(#dgArrS)"/>
      <path class="dg-arrow dashed" d="M276 292 L612 338" marker-end="url(#dgArrS)"/>
      <path class="dg-arrow dashed" d="M328 292 L664 338" marker-end="url(#dgArrS)"/>
      <path class="dg-arrow dashed" d="M380 292 L716 338" marker-end="url(#dgArrS)"/>
    </g>
    <text class="dg-t sm accentT" x="430" y="320">copy</text>

    <rect class="dg-cell ok" x="536" y="340" width="48" height="40" rx="5"/><text class="dg-t mono sm" x="560" y="366" text-anchor="middle">1</text>
    <rect class="dg-cell ok" x="588" y="340" width="48" height="40" rx="5"/><text class="dg-t mono sm" x="612" y="366" text-anchor="middle">2</text>
    <rect class="dg-cell ok" x="640" y="340" width="48" height="40" rx="5"/><text class="dg-t mono sm" x="664" y="366" text-anchor="middle">3</text>
    <rect class="dg-cell ok" x="692" y="340" width="48" height="40" rx="5"/><text class="dg-t mono sm" x="716" y="366" text-anchor="middle">4</text>
    <rect class="dg-cell ok dg-fill" x="744" y="340" width="48" height="40" rx="5"/><text class="dg-t mono sm dg-pop" x="768" y="366" text-anchor="middle">5</text>
    <rect class="dg-cell dashed" x="796" y="340" width="40" height="40" rx="5"/>
    <rect class="dg-cell dashed" x="840" y="340" width="40" height="40" rx="5"/>
    <rect class="dg-cell dashed" x="884" y="340" width="40" height="40" rx="5"/>
    <text class="dg-t sm dim" x="536" y="332">new array: cap 8 — doubles under 256 elements, then ~1.25×</text>

    <text class="dg-t sm bad" x="200" y="330">this is why you MUST write s = append(s, …)</text>
  </svg>`
},

/* ─────────────── stack vs heap ─────────────── */
"stack-heap": {
  title: "Stack or heap? The compiler decides",
  caption: "Escape analysis asks one question: can this value outlive the function's frame?",
  svg: `<svg viewBox="0 0 940 300" role="img" aria-label="Two functions: one returning a value that stays on the stack, one returning a pointer that escapes to the heap">
    <defs><marker id="dgArrH" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <rect class="dg-laneBg" x="4" y="10" width="460" height="280" rx="10"/>
    <text class="dg-t mono" x="20" y="38">func stays() int {</text>
    <text class="dg-t mono" x="20" y="60">    x := 42; return x</text>
    <text class="dg-t mono" x="20" y="82">}</text>
    <g class="dg-frame">
      <rect class="dg-box" x="20" y="100" width="180" height="76" rx="9"/>
      <text class="dg-t sm dim" x="30" y="120">stack frame</text>
      <text class="dg-t mono" x="30" y="146">x = 42</text>
      <text class="dg-t sm dim" x="30" y="166">popped on return</text>
    </g>
    <path class="dg-arrow" d="M206 138 L286 138" marker-end="url(#dgArrH)"/>
    <text class="dg-t sm" x="214" y="128">copy out</text>
    <rect class="dg-box ok" x="290" y="114" width="150" height="48" rx="9"/>
    <text class="dg-t mono" x="365" y="144" text-anchor="middle">42</text>
    <text class="dg-t sm ok" x="20" y="214">STACK: allocation is a pointer bump,</text>
    <text class="dg-t sm ok" x="20" y="234">reclaimed instantly, zero GC work</text>
    <text class="dg-t sm mono dim" x="20" y="266">./main.go:4: x does not escape</text>

    <rect class="dg-laneBg" x="476" y="10" width="460" height="280" rx="10"/>
    <text class="dg-t mono" x="492" y="38">func escapes() *int {</text>
    <text class="dg-t mono" x="492" y="60">    x := 42; return &amp;x</text>
    <text class="dg-t mono" x="492" y="82">}</text>
    <g class="dg-frame">
      <rect class="dg-box" x="492" y="100" width="170" height="76" rx="9"/>
      <text class="dg-t sm dim" x="502" y="120">stack frame</text>
      <text class="dg-t mono sm" x="502" y="146">&amp;x ●</text>
      <text class="dg-t sm dim" x="502" y="166">frame still pops…</text>
    </g>
    <path class="dg-arrow dg-glow" d="M600 146 C 700 146 700 138 772 138" marker-end="url(#dgArrH)"/>
    <rect class="dg-box accent" x="776" y="108" width="148" height="60" rx="9"/>
    <text class="dg-t sm dim" x="786" y="128">HEAP</text>
    <text class="dg-t mono" x="850" y="156" text-anchor="middle">42</text>
    <text class="dg-t sm warn" x="492" y="214">HEAP: the value must outlive the frame,</text>
    <text class="dg-t sm warn" x="492" y="234">so the GC owns it from now on</text>
    <text class="dg-t sm mono dim" x="492" y="266">./main.go:4: moved to heap: x</text>
  </svg>`
},

/* ─────────────── interface value ─────────────── */
"iface-value": {
  title: "An interface value is two words",
  caption: "A type word and a data word — which is exactly why a nil pointer inside an interface is not nil.",
  svg: `<svg viewBox="0 0 940 300" role="img" aria-label="Interface value holding a type pointer and a data pointer, and the typed-nil trap">
    <defs><marker id="dgArrI" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <text class="dg-t mono" x="10" y="26">var s Shape = &amp;Rect{3, 4}</text>

    <rect class="dg-box accent" x="10" y="42" width="300" height="96" rx="9"/>
    <line class="dg-rule" x1="160" y1="42" x2="160" y2="138"/>
    <text class="dg-t sm dim" x="22" y="64">type word</text>
    <text class="dg-t mono sm" x="22" y="90">*Rect itab</text>
    <text class="dg-t sm dim" x="172" y="64">data word</text>
    <text class="dg-t mono sm" x="172" y="90">●</text>
    <text class="dg-t sm dim" x="22" y="124">8 bytes</text>
    <text class="dg-t sm dim" x="172" y="124">8 bytes</text>

    <path class="dg-arrow" d="M70 100 C 70 170 180 170 236 170" marker-end="url(#dgArrI)"/>
    <rect class="dg-box" x="240" y="146" width="200" height="74" rx="9"/>
    <text class="dg-t sm dim" x="250" y="166">itab: method table</text>
    <text class="dg-t mono sm" x="250" y="188">Area      → Rect.Area</text>
    <text class="dg-t mono sm" x="250" y="208">Perim → Rect.Perim</text>

    <path class="dg-arrow" d="M200 100 C 320 100 420 100 472 100" marker-end="url(#dgArrI)"/>
    <rect class="dg-box ok" x="476" y="72" width="150" height="56" rx="9"/>
    <text class="dg-t mono sm" x="551" y="96" text-anchor="middle">Rect{W:3, H:4}</text>
    <text class="dg-t sm dim" x="551" y="118" text-anchor="middle">the actual value</text>

    <line class="dg-rule" x1="660" y1="20" x2="660" y2="280"/>
    <text class="dg-t bad" x="680" y="30">the classic trap</text>
    <text class="dg-t mono sm" x="680" y="58">var p *MyErr = nil</text>
    <text class="dg-t mono sm" x="680" y="78">return p   // as error</text>

    <rect class="dg-box bad dg-glow" x="680" y="96" width="246" height="72" rx="9"/>
    <line class="dg-rule" x1="803" y1="96" x2="803" y2="168"/>
    <text class="dg-t sm dim" x="690" y="118">type</text>
    <text class="dg-t mono sm bad" x="690" y="140">*MyErr</text>
    <text class="dg-t sm dim" x="690" y="158">SET</text>
    <text class="dg-t sm dim" x="813" y="118">data</text>
    <text class="dg-t mono sm" x="813" y="140">nil</text>
    <text class="dg-t sm dim" x="813" y="158">empty</text>

    <text class="dg-t sm bad" x="680" y="196">err != nil is TRUE — the type word is set</text>
    <text class="dg-t sm dim" x="680" y="222">An interface is nil only when BOTH words are nil.</text>
    <text class="dg-t sm ok" x="680" y="252">Fix: return a literal nil, never a typed nil pointer.</text>
  </svg>`
},

/* ─────────────── channels ─────────────── */
channel: {
  title: "Unbuffered channels synchronise; buffered ones decouple",
  caption: "An unbuffered send is a rendezvous: it does not complete until a receiver is ready.",
  svg: `<svg viewBox="0 0 940 330" role="img" aria-label="Unbuffered channel rendezvous between two goroutines, and a buffered channel with four slots">
    <defs><marker id="dgArrC" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <text class="dg-t" x="10" y="24">ch := make(chan int)   — unbuffered</text>

    <rect class="dg-box" x="10" y="40" width="170" height="96" rx="9"/>
    <text class="dg-t sm" x="24" y="66">goroutine A</text>
    <text class="dg-t mono sm" x="24" y="92">ch &lt;- 42</text>
    <text class="dg-t sm bad dg-blink" x="24" y="116">blocked…</text>

    <rect class="dg-gate" x="420" y="50" width="100" height="60" rx="8"/>
    <text class="dg-t sm dim" x="470" y="28" text-anchor="middle">ch</text>
    <text class="dg-t sm dim" x="470" y="85" text-anchor="middle">no buffer</text>

    <rect class="dg-box" x="760" y="40" width="170" height="96" rx="9"/>
    <text class="dg-t sm" x="774" y="66">goroutine B</text>
    <text class="dg-t mono sm" x="774" y="92">v := &lt;-ch</text>
    <text class="dg-t sm bad dg-blink" x="774" y="116">blocked…</text>

    <line class="dg-arrow dashed" x1="184" y1="80" x2="414" y2="80"/>
    <line class="dg-arrow dashed" x1="526" y1="80" x2="756" y2="80"/>
    <g class="dg-handoff"><circle class="dg-token" cx="0" cy="80" r="13"/><text class="dg-t mono sm tok" x="0" y="85" text-anchor="middle">42</text></g>

    <text class="dg-t sm ok" x="300" y="158">both resume at the hand-off — that is the synchronisation</text>

    <line class="dg-rule" x1="10" y1="172" x2="930" y2="172"/>

    <text class="dg-t" x="10" y="204">ch := make(chan int, 4)   — buffered</text>

    <rect class="dg-box" x="10" y="220" width="170" height="74" rx="9"/>
    <text class="dg-t sm" x="24" y="244">sender</text>
    <text class="dg-t sm ok" x="24" y="268">keeps going until full</text>

    <rect class="dg-cell ok dg-fill" style="--i:0" x="300" y="226" width="60" height="52" rx="6"/><text class="dg-t mono sm" x="330" y="258" text-anchor="middle">1</text>
    <rect class="dg-cell ok dg-fill" style="--i:1" x="368" y="226" width="60" height="52" rx="6"/><text class="dg-t mono sm" x="398" y="258" text-anchor="middle">2</text>
    <rect class="dg-cell dashed" x="436" y="226" width="60" height="52" rx="6"/>
    <rect class="dg-cell dashed" x="504" y="226" width="60" height="52" rx="6"/>
    <text class="dg-t sm dim" x="300" y="296">len 2 / cap 4 — a queue, in FIFO order</text>

    <rect class="dg-box" x="760" y="220" width="170" height="74" rx="9"/>
    <text class="dg-t sm" x="774" y="244">receiver</text>
    <text class="dg-t sm dim" x="774" y="268">blocks only when empty</text>

    <line class="dg-arrow" x1="184" y1="252" x2="294" y2="252" marker-end="url(#dgArrC)"/>
    <line class="dg-arrow" x1="570" y1="252" x2="756" y2="252" marker-end="url(#dgArrC)"/>
  </svg>`
},

/* ─────────────── GMP scheduler ─────────────── */
gmp: {
  title: "The scheduler: G, M, P and work stealing",
  caption: "Goroutines are queued per-P and run on OS threads. An idle P steals half of someone else's queue rather than sitting still.",
  svg: `<svg viewBox="0 0 940 360" role="img" aria-label="Three processors with local run queues, OS threads beneath them, a global queue, and an idle processor stealing work">
    <defs><marker id="dgArrG" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <rect class="dg-box" x="600" y="10" width="330" height="56" rx="9"/>
    <text class="dg-t sm dim" x="614" y="32">global queue — overflow and new goroutines</text>
    <circle class="dg-g" cx="640" cy="50" r="10"/><circle class="dg-g" cx="668" cy="50" r="10"/><circle class="dg-g" cx="696" cy="50" r="10"/>

    <g>
      <rect class="dg-box accent" x="10" y="90" width="290" height="104" rx="9"/>
      <text class="dg-t sm" x="24" y="112">P0 — local queue, 256 slots</text>
      <circle class="dg-g" cx="40"  cy="146" r="12"/><text class="dg-t sm tok" x="40"  y="151" text-anchor="middle">G</text>
      <circle class="dg-g" cx="74"  cy="146" r="12"/><text class="dg-t sm tok" x="74"  y="151" text-anchor="middle">G</text>
      <circle class="dg-g steal" cx="108" cy="146" r="12"/><text class="dg-t sm tok" x="108" y="151" text-anchor="middle">G</text>
      <circle class="dg-g steal" cx="142" cy="146" r="12"/><text class="dg-t sm tok" x="142" y="151" text-anchor="middle">G</text>
      <circle class="dg-g" cx="176" cy="146" r="12"/><circle class="dg-g" cx="210" cy="146" r="12"/>
      <text class="dg-t sm dim" x="24" y="180">runnext: 1-slot fast path</text>
    </g>

    <g>
      <rect class="dg-box" x="324" y="90" width="270" height="104" rx="9"/>
      <text class="dg-t sm" x="338" y="112">P1</text>
      <circle class="dg-g" cx="354" cy="146" r="12"/><circle class="dg-g" cx="388" cy="146" r="12"/>
      <text class="dg-t sm warn" x="420" y="140">a G blocked on a channel:</text>
      <text class="dg-t sm warn" x="420" y="158">it parks; the thread keeps P</text>
      <text class="dg-t sm dim" x="338" y="180">nothing blocks at the OS level</text>
    </g>

    <g>
      <rect class="dg-box dashed" x="618" y="90" width="312" height="104" rx="9"/>
      <text class="dg-t sm" x="632" y="112">P2 — queue empty</text>
      <text class="dg-t sm accentT dg-blink" x="632" y="148">idle, then steal half a queue</text>
      <text class="dg-t sm dim" x="632" y="180">never sits still while work exists</text>
    </g>

    <path class="dg-arrow dashed dg-steal-path" d="M125 200 C 300 266 560 266 740 200" marker-end="url(#dgArrG)"/>
    <text class="dg-t sm accentT" x="430" y="262" text-anchor="middle">steals half of P0's queue</text>

    <rect class="dg-box" x="10"  y="286" width="130" height="54" rx="9"/><text class="dg-t sm" x="75"  y="310" text-anchor="middle">M0</text><text class="dg-t sm dim" x="75"  y="328" text-anchor="middle">OS thread</text>
    <rect class="dg-box" x="324" y="286" width="130" height="54" rx="9"/><text class="dg-t sm" x="389" y="310" text-anchor="middle">M1</text><text class="dg-t sm dim" x="389" y="328" text-anchor="middle">OS thread</text>
    <rect class="dg-box" x="618" y="286" width="130" height="54" rx="9"/><text class="dg-t sm" x="683" y="310" text-anchor="middle">M2</text><text class="dg-t sm dim" x="683" y="328" text-anchor="middle">OS thread</text>
    <text class="dg-t sm dim" x="770" y="312">GOMAXPROCS = how many</text>
    <text class="dg-t sm dim" x="770" y="330">Ps exist (default: NumCPU)</text>
  </svg>`
},

/* ─────────────── tri-colour GC ─────────────── */
gc: {
  title: "Tri-colour concurrent mark and sweep",
  caption: "Marking runs alongside your program. The write barrier is what makes that safe.",
  svg: `<svg viewBox="0 0 940 340" role="img" aria-label="Tri-colour garbage collection: roots become grey, then black as children are greyed, unreachable white objects are swept">
    <defs><marker id="dgArrGC" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <rect class="dg-box" x="10" y="14" width="150" height="76" rx="9"/>
    <text class="dg-t sm" x="24" y="38">ROOTS</text>
    <text class="dg-t sm dim" x="24" y="58">goroutine stacks</text>
    <text class="dg-t sm dim" x="24" y="76">globals, registers</text>

    <g class="dg-arrow" marker-end="url(#dgArrGC)">
      <line x1="168" y1="52" x2="218" y2="52"/>
      <line x1="294" y1="52" x2="338" y2="78"/>
      <line x1="294" y1="52" x2="338" y2="26"/>
      <line x1="414" y1="78" x2="458" y2="104"/>
      <line x1="414" y1="26" x2="458" y2="26"/>
      <line x1="534" y1="104" x2="578" y2="130"/>
    </g>

    <g class="dg-node black" style="--i:0"><circle cx="256" cy="52" r="30"/><text class="dg-t sm" x="256" y="57" text-anchor="middle">A</text></g>
    <g class="dg-node black" style="--i:1"><circle cx="376" cy="26" r="30"/><text class="dg-t sm" x="376" y="31" text-anchor="middle">B</text></g>
    <g class="dg-node black" style="--i:1"><circle cx="376" cy="78" r="30"/><text class="dg-t sm" x="376" y="83" text-anchor="middle">C</text></g>
    <g class="dg-node grey"  style="--i:2"><circle cx="496" cy="26" r="30"/><text class="dg-t sm" x="496" y="31" text-anchor="middle">D</text></g>
    <g class="dg-node grey"  style="--i:2"><circle cx="496" cy="104" r="30"/><text class="dg-t sm" x="496" y="109" text-anchor="middle">E</text></g>
    <g class="dg-node white" style="--i:3"><circle cx="616" cy="130" r="30"/><text class="dg-t sm" x="616" y="135" text-anchor="middle">F</text></g>

    <g class="dg-node white dg-sweep"><circle cx="760" cy="40" r="30"/><text class="dg-t sm" x="760" y="45" text-anchor="middle">X</text></g>
    <g class="dg-node white dg-sweep"><circle cx="848" cy="96" r="30"/><text class="dg-t sm" x="848" y="101" text-anchor="middle">Y</text></g>
    <text class="dg-t sm bad" x="722" y="152">unreachable → swept</text>

    <g class="dg-legend">
      <circle class="lg white" cx="24" cy="196" r="11"/><text class="dg-t sm" x="44" y="201">WHITE — not yet proven reachable</text>
      <circle class="lg grey"  cx="24" cy="226" r="11"/><text class="dg-t sm" x="44" y="231">GREY — reachable, children not scanned yet</text>
      <circle class="lg black" cx="24" cy="256" r="11"/><text class="dg-t sm" x="44" y="261">BLACK — reachable and fully scanned</text>
    </g>

    <rect class="dg-box accent" x="470" y="178" width="460" height="92" rx="9"/>
    <text class="dg-t sm accentT" x="484" y="200">WRITE BARRIER</text>
    <text class="dg-t sm" x="484" y="222">Your code keeps running while marking. If it stores a pointer to a</text>
    <text class="dg-t sm" x="484" y="240">WHITE object into a BLACK one, the barrier greys it — otherwise</text>
    <text class="dg-t sm" x="484" y="258">live data would be collected.</text>

    <text class="dg-t sm dim" x="10" y="300">STW ~10-100µs → concurrent mark (~25% of CPU) → STW ~10-100µs → concurrent lazy sweep</text>
    <text class="dg-t sm dim" x="10" y="324">Pause time is independent of heap size. Cost scales with live POINTERS, not bytes. Non-moving, non-generational.</text>
  </svg>`
},

/* ─────────────── module or just a file? ─────────────── */
"module-or-file": {
  title: "Do I need a module, or just a .go file?",
  caption: "A module costs one command. The only reason to skip it is a throwaway snippet.",
  svg: `<svg viewBox="0 0 940 300" role="img" aria-label="Decision flow: a throwaway single stdlib-only file can use go run directly, everything else needs go mod init">
    <defs><marker id="dgArrM" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <rect class="dg-box" x="10" y="20" width="250" height="80" rx="9"/>
    <text class="dg-t sm" x="24" y="46">One file, standard library</text>
    <text class="dg-t sm" x="24" y="66">only, and you'll delete it</text>
    <text class="dg-t sm" x="24" y="86">in ten minutes?</text>

    <path class="dg-arrow dg-path-a" d="M264 44 L368 44" marker-end="url(#dgArrM)"/>
    <text class="dg-t sm ok" x="286" y="34">yes</text>
    <rect class="dg-box ok" x="372" y="18" width="330" height="56" rx="9"/>
    <text class="dg-t mono sm" x="386" y="42">go run scratch.go</text>
    <text class="dg-t sm dim" x="386" y="62">no go.mod needed — or just use the Playground</text>

    <path class="dg-arrow dg-path-b" d="M135 104 L135 150" marker-end="url(#dgArrM)"/>
    <text class="dg-t sm" x="146" y="132">no</text>

    <rect class="dg-box accent" x="10" y="154" width="430" height="124" rx="9"/>
    <text class="dg-t sm accentT" x="24" y="178">ANY of these → make a module</text>
    <text class="dg-t sm" x="24" y="202">· a third-party import (go get needs go.mod)</text>
    <text class="dg-t sm" x="24" y="222">· more than a file or two, or any subpackage</text>
    <text class="dg-t sm" x="24" y="242">· tests, go build ./... , or go vet ./...</text>
    <text class="dg-t sm" x="24" y="262">· it goes into git, or anyone else will run it</text>

    <path class="dg-arrow" d="M444 216 L520 216" marker-end="url(#dgArrM)"/>
    <rect class="dg-box ok" x="524" y="154" width="406" height="124" rx="9"/>
    <text class="dg-t mono sm" x="538" y="180">mkdir thing &amp;&amp; cd thing</text>
    <text class="dg-t mono sm" x="538" y="202">go mod init thing</text>
    <text class="dg-t sm dim" x="538" y="230">Two seconds. You get dependency pinning, reproducible</text>
    <text class="dg-t sm dim" x="538" y="248">builds, ./... commands and editor tooling that works.</text>
    <text class="dg-t sm ok" x="538" y="270">When unsure: make the module.</text>
  </svg>`
},

/* ─────────────── middleware chain ─────────────── */
middleware: {
  title: "Middleware is just handlers wrapping handlers",
  caption: "Each layer sees the request on the way in and the response on the way out — which is why logging and recovery belong at the edges.",
  svg: `<svg viewBox="0 0 940 240" role="img" aria-label="An HTTP request passing inward through middleware layers to the handler and the response returning outward">
    <defs><marker id="dgArrW" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <text class="dg-t sm dim" x="10" y="24">request →</text>
    <g class="dg-seq" style="--i:0"><rect class="dg-box" x="10"  y="40" width="150" height="104" rx="9"/><text class="dg-t sm" x="85"  y="70" text-anchor="middle">requestID</text><text class="dg-t sm dim" x="85" y="92" text-anchor="middle">adds a trace key</text></g>
    <g class="dg-seq" style="--i:1"><rect class="dg-box" x="172" y="40" width="150" height="104" rx="9"/><text class="dg-t sm" x="247" y="70" text-anchor="middle">recover</text><text class="dg-t sm dim" x="247" y="92" text-anchor="middle">panic → 500</text></g>
    <g class="dg-seq" style="--i:2"><rect class="dg-box" x="334" y="40" width="150" height="104" rx="9"/><text class="dg-t sm" x="409" y="70" text-anchor="middle">metrics</text><text class="dg-t sm dim" x="409" y="92" text-anchor="middle">rate, errors, duration</text></g>
    <g class="dg-seq" style="--i:3"><rect class="dg-box" x="496" y="40" width="150" height="104" rx="9"/><text class="dg-t sm" x="571" y="70" text-anchor="middle">rate limit</text><text class="dg-t sm dim" x="571" y="92" text-anchor="middle">429 + Retry-After</text></g>
    <g class="dg-seq" style="--i:4"><rect class="dg-box" x="658" y="40" width="130" height="104" rx="9"/><text class="dg-t sm" x="723" y="70" text-anchor="middle">auth</text><text class="dg-t sm dim" x="723" y="92" text-anchor="middle">401 / 403</text></g>
    <g class="dg-seq" style="--i:5"><rect class="dg-box accent" x="800" y="40" width="130" height="104" rx="9"/><text class="dg-t sm" x="865" y="70" text-anchor="middle">handler</text><text class="dg-t sm dim" x="865" y="92" text-anchor="middle">your logic</text><text class="dg-t sm dim" x="865" y="112" text-anchor="middle">+ the database</text></g>

    <path class="dg-arrow" d="M10 160 L924 160" marker-end="url(#dgArrW)"/>
    <g class="dg-travel in"><rect class="dg-tokbox" x="-22" y="150" width="44" height="20" rx="10"/><text class="dg-t sm tok" x="0" y="164" text-anchor="middle">req</text></g>
    <text class="dg-t sm dim" x="10" y="182">ServeHTTP inward: each layer may short-circuit and never call the next</text>

    <path class="dg-arrow ret" d="M924 206 L10 206" marker-end="url(#dgArrW)"/>
    <g class="dg-travel out"><rect class="dg-tokbox alt" x="-24" y="196" width="48" height="20" rx="10"/><text class="dg-t sm tok" x="0" y="210" text-anchor="middle">200</text></g>
    <text class="dg-t sm dim" x="620" y="228">← response outward: status recorded, duration observed, panic caught</text>
  </svg>`
}
,

/* ─────────────── if / for / switch ─────────────── */
"control-flow": {
  title: "One loop keyword, and a switch with no fallthrough",
  caption: "Go's three control structures: a branch, the single for loop in its four shapes, and a switch where cases never fall through.",
  svg: `<svg viewBox="0 0 940 360" role="img" aria-label="if-else branching, the four forms of the for loop, and a switch selecting one case">
    <defs><marker id="dgArrF" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <text class="dg-t" x="10" y="22">if / else — with an initialiser scoped to the branch</text>
    <rect class="dg-box accent" x="10" y="34" width="220" height="64" rx="10"/>
    <text class="dg-t mono sm" x="24" y="60">v, err := Atoi(s)</text>
    <text class="dg-t mono sm dim" x="24" y="82">err == nil ?</text>
    <path class="dg-arrow dg-ants fast" d="M236 50 L298 50" marker-end="url(#dgArrF)"/>
    <text class="dg-t sm ok" x="244" y="42">true</text>
    <rect class="dg-box ok dg-alt-a" x="304" y="28" width="190" height="44" rx="9"/>
    <text class="dg-t mono sm" x="322" y="56">use(v)</text>
    <path class="dg-arrow dg-ants slow" d="M236 82 L298 102" marker-end="url(#dgArrF)"/>
    <text class="dg-t sm bad" x="244" y="96">false</text>
    <rect class="dg-box bad dg-alt-b" x="304" y="80" width="190" height="44" rx="9"/>
    <text class="dg-t mono sm" x="322" y="108">return err</text>
    <text class="dg-t sm dim" x="510" y="52">v and err exist only inside</text>
    <text class="dg-t sm dim" x="510" y="70">these two branches</text>
    <text class="dg-t sm dim" x="510" y="98">guard clauses keep the happy path flat</text>

    <line class="dg-rule" x1="10" y1="128" x2="930" y2="128"/>

    <text class="dg-t" x="10" y="156">for — the only loop keyword, in four shapes</text>
    <g class="dg-seq" style="--i:0"><rect class="dg-box" x="10"  y="168" width="220" height="68" rx="10"/>
      <text class="dg-t mono sm" x="24" y="196">for i := 0; i &lt; n; i++</text>
      <text class="dg-t sm dim" x="24" y="218">three-clause</text></g>
    <g class="dg-seq" style="--i:1"><rect class="dg-box" x="244" y="168" width="150" height="68" rx="10"/>
      <text class="dg-t mono sm" x="258" y="196">for cond { }</text>
      <text class="dg-t sm dim" x="258" y="218">a while loop</text></g>
    <g class="dg-seq" style="--i:2"><rect class="dg-box" x="408" y="168" width="140" height="68" rx="10"/>
      <text class="dg-t mono sm" x="422" y="196">for { }</text>
      <text class="dg-t sm dim" x="422" y="218">until break</text></g>
    <g class="dg-seq" style="--i:3"><rect class="dg-box accent" x="562" y="168" width="250" height="68" rx="10"/>
      <text class="dg-t mono sm" x="576" y="196">for i, v := range x</text>
      <text class="dg-t sm dim" x="576" y="218">own i on each pass</text></g>

    <line class="dg-rule" x1="10" y1="256" x2="930" y2="256"/>

    <text class="dg-t" x="10" y="282">switch — one case runs. No break. No fallthrough.</text>
    <rect class="dg-box dg-case" style="--i:0" x="10"  y="298" width="180" height="42" rx="8"/><text class="dg-t mono sm" x="24" y="324">case "Sat", "Sun":</text>
    <rect class="dg-box dg-case" style="--i:1" x="202" y="298" width="140" height="42" rx="8"/><text class="dg-t mono sm" x="216" y="324">case "Mon":</text>
    <rect class="dg-box dg-case" style="--i:2" x="354" y="298" width="168" height="42" rx="8"/><text class="dg-t mono sm" x="368" y="324">case score &gt; 90:</text>
    <rect class="dg-box dg-case" style="--i:3" x="534" y="298" width="210" height="42" rx="8"/><text class="dg-t mono sm" x="548" y="324">case v := x.(type):</text>
    <text class="dg-t sm dim" x="758" y="324">or fallthrough</text>
  </svg>`
},

/* ─────────────── defer ─────────────── */
"defer-stack": {
  title: "defer is a stack: last in, first out",
  caption: "Deferred calls are pushed as they execute and popped when the function returns — including during a panic.",
  svg: `<svg viewBox="0 0 940 330" role="img" aria-label="Three deferred calls pushed onto a stack and popped in reverse order on return">
    <defs><marker id="dgArrD" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <text class="dg-t mono sm" x="10" y="26">func read() error {</text>
    <text class="dg-t mono sm" x="10" y="48">    f, _ := os.Open(p);  defer f.Close()</text>
    <text class="dg-t mono sm" x="10" y="70">    mu.Lock();           defer mu.Unlock()</text>
    <text class="dg-t mono sm" x="10" y="92">    t := time.Now();     defer log(t)</text>
    <text class="dg-t mono sm" x="10" y="114">    return work()</text>
    <text class="dg-t mono sm" x="10" y="136">}</text>

    <path class="dg-arrow dg-ants mid" d="M360 70 L430 70" marker-end="url(#dgArrD)"/>
    <text class="dg-t sm" x="366" y="60">push</text>

    <text class="dg-t sm dim" x="440" y="26">defer stack</text>
    <g class="dg-push" style="--i:0"><rect class="dg-box" x="430" y="28" width="220" height="42" rx="8"/><text class="dg-t mono sm" x="446" y="54">log(t)        ← top</text></g>
    <g class="dg-push" style="--i:1"><rect class="dg-box" x="430" y="78" width="220" height="42" rx="8"/><text class="dg-t mono sm" x="446" y="104">mu.Unlock()</text></g>
    <g class="dg-push" style="--i:2"><rect class="dg-box" x="430" y="128" width="220" height="42" rx="8"/><text class="dg-t mono sm" x="446" y="154">f.Close()</text></g>

    <path class="dg-arrow dg-ants fast" d="M660 86 L730 86" marker-end="url(#dgArrD)"/>
    <text class="dg-t sm" x="668" y="72">pop</text>

    <g class="dg-pop-seq" style="--i:0"><rect class="dg-box ok" x="730" y="28" width="198" height="42" rx="8"/><text class="dg-t mono sm" x="746" y="54">1. log(t)</text></g>
    <g class="dg-pop-seq" style="--i:1"><rect class="dg-box ok" x="730" y="78" width="198" height="42" rx="8"/><text class="dg-t mono sm" x="746" y="104">2. mu.Unlock()</text></g>
    <g class="dg-pop-seq" style="--i:2"><rect class="dg-box ok" x="730" y="128" width="198" height="42" rx="8"/><text class="dg-t mono sm" x="746" y="154">3. f.Close()</text></g>

    <text class="dg-t sm" x="10" y="182">Arguments are evaluated AT the defer statement; the call happens later:</text>
    <rect class="dg-box" x="10" y="196" width="440" height="100" rx="9"/>
    <text class="dg-t mono sm" x="22" y="218">i := 0</text>
    <text class="dg-t mono sm" x="22" y="238">defer fmt.Println(i)          // prints 0</text>
    <text class="dg-t mono sm" x="22" y="258">defer func(){ print(i) }()    // prints 1</text>
    <text class="dg-t mono sm" x="22" y="272">i++</text>

    <rect class="dg-box bad" x="470" y="196" width="460" height="100" rx="9"/>
    <text class="dg-t sm bad" x="482" y="218">Never defer inside a loop body</text>
    <text class="dg-t sm" x="482" y="240">defer fires at FUNCTION return, so 10,000 iterations</text>
    <text class="dg-t sm" x="482" y="258">hold 10,000 files open. Extract the body into its own</text>
    <text class="dg-t sm" x="482" y="272">function, or close explicitly each pass.</text>
  </svg>`
},

/* ─────────────── multiple returns ─────────────── */
"func-returns": {
  title: "Multiple returns: the feature that replaced exceptions",
  caption: "A function hands back a result and an error. The caller must look at both — failure is visible in the signature.",
  svg: `<svg viewBox="0 0 940 280" role="img" aria-label="A function returning a value and an error, with the caller branching on the error">
    <defs><marker id="dgArrR" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <rect class="dg-box" x="10" y="36" width="220" height="68" rx="9"/>
    <text class="dg-t sm dim" x="22" y="60">caller</text>
    <text class="dg-t mono sm" x="22" y="86">v, err := Divide(a, b)</text>

    <path class="dg-arrow dg-ants mid" d="M238 70 L286 70" marker-end="url(#dgArrR)"/>
    <text class="dg-t sm dim" x="244" y="58">call</text>

    <rect class="dg-box accent" x="290" y="22" width="250" height="108" rx="9"/>
    <text class="dg-t mono sm" x="302" y="48">func Divide(a, b float64)</text>
    <text class="dg-t mono sm" x="302" y="68">        (float64, error)</text>
    <text class="dg-t sm dim" x="302" y="92">result first, error LAST</text>
    <text class="dg-t sm dim" x="302" y="108">— always, by convention</text>

    <path class="dg-arrow dg-ants fast" d="M546 50 L636 50" marker-end="url(#dgArrR)"/>
    <path class="dg-arrow dg-ants fast" d="M546 90 L636 90" marker-end="url(#dgArrR)"/>

    <rect class="dg-box ok dg-alt-a" x="640" y="32" width="290" height="36" rx="8"/>
    <text class="dg-t mono sm" x="652" y="55">5.0, nil      → use the value</text>
    <rect class="dg-box bad dg-alt-b" x="640" y="74" width="290" height="36" rx="8"/>
    <text class="dg-t mono sm" x="652" y="97">0, ErrDivByZero → handle it</text>

    <text class="dg-t" x="10" y="150">What the caller writes, every time:</text>
    <rect class="dg-box" x="10" y="164" width="450" height="98" rx="9"/>
    <text class="dg-t mono sm" x="22" y="186">v, err := Divide(a, b)</text>
    <text class="dg-t mono sm bad" x="22" y="206">if err != nil {</text>
    <text class="dg-t mono sm" x="22" y="226">    return fmt.Errorf("dividing: %w", err)</text>
    <text class="dg-t mono sm bad" x="22" y="246">}</text>
    <text class="dg-t mono sm ok" x="300" y="226">use(v)</text>

    <rect class="dg-box" x="480" y="164" width="450" height="98" rx="9"/>
    <text class="dg-t sm" x="492" y="186">Also returned in pairs across the language:</text>
    <text class="dg-t mono sm" x="492" y="208">v, ok := m[key]        // map presence</text>
    <text class="dg-t mono sm" x="492" y="228">v, ok := i.(string)    // type assertion</text>
    <text class="dg-t mono sm" x="492" y="248">v, ok := &lt;-ch          // channel open?</text>
  </svg>`
},

/* ─────────────── closures ─────────────── */
closure: {
  title: "The inner function keeps the variable, not a copy",
  caption: "c() keeps adding to the same count, so three calls give 1, then 2, then 3. c2 is a second call to counter, so it has its own count and starts again at 1.",
  svg: `<svg viewBox="0 0 940 330" role="img" aria-label="Two closures returned from the same function, each owning an independent captured counter on the heap">
    <defs><marker id="dgArrC2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <text class="dg-t mono sm" x="10" y="26">func counter() func() int {</text>
    <text class="dg-t mono sm" x="10" y="48">    count := 0              // captured</text>
    <text class="dg-t mono sm" x="10" y="70">    return func() int { count++; return count }</text>
    <text class="dg-t mono sm" x="10" y="92">}</text>
    <text class="dg-t mono sm" x="10" y="126">c  := counter()</text>
    <text class="dg-t mono sm" x="10" y="148">c2 := counter()   // independent</text>

    <path class="dg-arrow dg-ants mid" d="M380 70 L470 70" marker-end="url(#dgArrC2)"/>
    <text class="dg-t sm dim" x="386" y="60">returns</text>

    <rect class="dg-box accent" x="474" y="30" width="200" height="86" rx="9"/>
    <text class="dg-t sm" x="486" y="52">closure c</text>
    <text class="dg-t sm dim" x="486" y="72">code + a reference to</text>
    <text class="dg-t sm dim" x="486" y="90">its captured variable</text>
    <path class="dg-arrow dg-glow" d="M680 72 L756 72" marker-end="url(#dgArrC2)"/>
    <rect class="dg-box ok" x="760" y="46" width="170" height="52" rx="9"/>
    <text class="dg-t sm dim" x="772" y="66">HEAP</text>
    <text class="dg-t mono big dg-count" x="845" y="92" text-anchor="middle">3</text>

    <rect class="dg-box" x="474" y="134" width="200" height="60" rx="9"/>
    <text class="dg-t sm" x="486" y="156">closure c2</text>
    <text class="dg-t sm dim" x="486" y="178">its own count</text>
    <path class="dg-arrow" d="M680 164 L756 164" marker-end="url(#dgArrC2)"/>
    <rect class="dg-box ok" x="760" y="140" width="170" height="48" rx="9"/>
    <text class="dg-t mono" x="845" y="170" text-anchor="middle">1</text>

    <text class="dg-t sm dim" x="10" y="196">count cannot live on the stack: the frame that</text>
    <text class="dg-t sm dim" x="10" y="214">declared it has already returned → escape analysis</text>
    <text class="dg-t sm dim" x="10" y="232">moves it to the heap.</text>

    <rect class="dg-box ok" x="10" y="250" width="450" height="58" rx="9"/>
    <text class="dg-t mono sm" x="22" y="274">c(); c(); c()  → 1, 2, 3        c2() → 1</text>
    <text class="dg-t sm dim" x="22" y="294">same code, separate state</text>

    <rect class="dg-box" x="480" y="250" width="450" height="58" rx="9"/>
    <text class="dg-t sm" x="492" y="274">Go 1.22+: each loop pass gets a fresh variable,</text>
    <text class="dg-t sm" x="492" y="294">so a goroutine captures the i you expect.</text>
  </svg>`
},

/* ─────────────── worker pool ─────────────── */
"worker-pool": {
  title: "Worker pool: bounded concurrency over channels",
  caption: "One jobs channel, N workers, one results channel. The pool size is the throttle — unbounded goroutines just move the bottleneck to memory.",
  svg: `<svg viewBox="0 0 940 330" role="img" aria-label="Jobs flowing from a channel into three workers and out to a results channel, coordinated by a WaitGroup">
    <defs><marker id="dgArrP2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <text class="dg-t sm dim" x="10" y="24">producer</text>
    <rect class="dg-box" x="10" y="34" width="120" height="70" rx="9"/>
    <text class="dg-t mono sm" x="22" y="60">for _, j :=</text>
    <text class="dg-t mono sm" x="22" y="78">  range input {</text>
    <text class="dg-t mono sm" x="22" y="96">  jobs &lt;- j }</text>

    <text class="dg-t sm dim" x="160" y="24">jobs chan Job (buffered)</text>
    <rect class="dg-cell ok" x="160" y="46" width="44" height="44" rx="6"/><text class="dg-t mono sm" x="182" y="74" text-anchor="middle">7</text>
    <rect class="dg-cell ok" x="208" y="46" width="44" height="44" rx="6"/><text class="dg-t mono sm" x="230" y="74" text-anchor="middle">8</text>
    <rect class="dg-cell dashed" x="256" y="46" width="44" height="44" rx="6"/>
    <rect class="dg-cell dashed" x="304" y="46" width="44" height="44" rx="6"/>
    <text class="dg-t sm dim" x="160" y="108">full → the producer blocks (backpressure)</text>

    <g class="dg-arrow dg-ants fast" marker-end="url(#dgArrP2)">
      <line x1="352" y1="68" x2="420" y2="40"/><line x1="352" y1="68" x2="420" y2="68"/><line x1="352" y1="68" x2="420" y2="96"/>
    </g>

    <g class="dg-work" style="--i:0"><rect class="dg-box accent" x="424" y="20" width="170" height="40" rx="8"/>
      <text class="dg-t mono sm" x="436" y="45">worker 1  job 5</text></g>
    <g class="dg-work" style="--i:1"><rect class="dg-box accent" x="424" y="68" width="170" height="40" rx="8"/>
      <text class="dg-t mono sm" x="436" y="93">worker 2  job 6</text></g>
    <g class="dg-work" style="--i:2"><rect class="dg-box accent" x="424" y="116" width="170" height="40" rx="8"/>
      <text class="dg-t mono sm" x="436" y="141">worker 3  idle</text></g>
    <text class="dg-t sm dim" x="424" y="176">each worker: for j := range jobs { out &lt;- f(j) }</text>

    <g class="dg-arrow dg-ants mid" marker-end="url(#dgArrP2)">
      <line x1="600" y1="40" x2="668" y2="68"/><line x1="600" y1="88" x2="668" y2="68"/><line x1="600" y1="136" x2="668" y2="68"/>
    </g>

    <text class="dg-t sm dim" x="676" y="24">results chan</text>
    <rect class="dg-cell" x="676" y="46" width="44" height="44" rx="6"/><text class="dg-t mono sm" x="698" y="74" text-anchor="middle">3</text>
    <rect class="dg-cell" x="724" y="46" width="44" height="44" rx="6"/><text class="dg-t mono sm" x="746" y="74" text-anchor="middle">4</text>
    <path class="dg-arrow" d="M776 68 L844 68" marker-end="url(#dgArrP2)"/>
    <rect class="dg-box" x="848" y="44" width="82" height="48" rx="9"/>
    <text class="dg-t sm" x="889" y="73" text-anchor="middle">collector</text>

    <line class="dg-rule" x1="10" y1="206" x2="930" y2="206"/>
    <rect class="dg-box" x="10" y="222" width="450" height="96" rx="9"/>
    <text class="dg-t sm accentT" x="22" y="244">the shutdown dance (get this wrong and it hangs)</text>
    <text class="dg-t mono sm" x="22" y="266">close(jobs)      // producer done → range ends</text>
    <text class="dg-t mono sm" x="22" y="286">wg.Wait()        // all workers finished</text>
    <text class="dg-t mono sm" x="22" y="306">close(results)   // safe: no senders left</text>

    <rect class="dg-box" x="480" y="222" width="450" height="96" rx="9"/>
    <text class="dg-t sm" x="492" y="244">Why bound it at all?</text>
    <text class="dg-t sm dim" x="492" y="266">Goroutines are cheap, but the things they hold are not:</text>
    <text class="dg-t sm dim" x="492" y="284">sockets, DB connections, buffers, the remote API's quota.</text>
    <text class="dg-t sm dim" x="492" y="302">N workers (or a semaphore, or g.SetLimit) caps all of it.</text>
  </svg>`
},

/* ─────────────── select ─────────────── */
select: {
  title: "select waits on whichever case is ready first",
  caption: "The concurrency switch: data, a timeout and cancellation compete, and the first ready case wins. Ties are broken at random.",
  svg: `<svg viewBox="0 0 940 290" role="img" aria-label="A select statement waiting on a data channel, a timeout and a context cancellation, with one case winning">
    <defs><marker id="dgArrS2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path class="dg-head" d="M0,0 L8,4 L0,8 z"/></marker></defs>

    <rect class="dg-box accent" x="380" y="96" width="180" height="76" rx="9"/>
    <text class="dg-t" x="470" y="128" text-anchor="middle">select</text>
    <text class="dg-t sm dim" x="470" y="150" text-anchor="middle">parked until one is ready</text>

    <g class="dg-sel" style="--i:0">
      <rect class="dg-box ok" x="10" y="16" width="300" height="62" rx="9"/>
      <text class="dg-t mono sm" x="22" y="42">case v := &lt;-results:</text>
      <text class="dg-t sm dim" x="22" y="64">the happy path — work arrived</text>
    </g>
    <g class="dg-sel" style="--i:1">
      <rect class="dg-box warn" x="10" y="104" width="300" height="62" rx="9"/>
      <text class="dg-t mono sm" x="22" y="130">case &lt;-time.After(2*time.Second):</text>
      <text class="dg-t sm dim" x="22" y="152">timeout — bound every wait</text>
    </g>
    <g class="dg-sel" style="--i:2">
      <rect class="dg-box bad" x="10" y="192" width="300" height="62" rx="9"/>
      <text class="dg-t mono sm" x="22" y="218">case &lt;-ctx.Done():</text>
      <text class="dg-t sm dim" x="22" y="240">cancelled — return ctx.Err()</text>
    </g>

    <g class="dg-arrow dg-ants mid" marker-end="url(#dgArrS2)">
      <line x1="314" y1="43"  x2="376" y2="110"/>
      <line x1="314" y1="133" x2="376" y2="133"/>
      <line x1="314" y1="223" x2="376" y2="158"/>
    </g>

    <path class="dg-arrow dg-ants fast" d="M566 134 L636 134" marker-end="url(#dgArrS2)"/>
    <rect class="dg-box" x="640" y="104" width="290" height="64" rx="9"/>
    <text class="dg-t sm" x="652" y="130">exactly ONE case body runs,</text>
    <text class="dg-t sm" x="652" y="152">then the code after select runs</text>

    <rect class="dg-box" x="640" y="20" width="290" height="70" rx="9"/>
    <text class="dg-t sm accentT" x="652" y="42">two or more ready at once?</text>
    <text class="dg-t sm" x="652" y="62">A uniformly RANDOM one is chosen —</text>
    <text class="dg-t sm" x="652" y="80">no starvation, no accidental priority.</text>

    <rect class="dg-box" x="640" y="178" width="290" height="92" rx="9"/>
    <text class="dg-t sm accentT" x="652" y="200">add default: → never blocks</text>
    <text class="dg-t mono sm" x="652" y="222">select {</text>
    <text class="dg-t mono sm" x="652" y="240">case q &lt;- job:   // enqueued</text>
    <text class="dg-t mono sm" x="652" y="258">default:         // shed load, 503</text>

    <text class="dg-t sm dim" x="10" y="270">a nil channel blocks forever — set a channel variable to nil to switch its case OFF</text>
  </svg>`
}

};
