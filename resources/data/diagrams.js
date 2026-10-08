/* Animated SVG diagrams.
   Referenced from content as { t: "diagram", id: "<key>" }.
   All colour comes from CSS classes so both themes work; every figure is
   readable with animation disabled (prefers-reduced-motion). */
window.DIAGRAMS = {

/* ─────────────── the compile pipeline ─────────────── */
pipeline: {
  title: "Source becomes one file",
  caption: "Go compiles ahead of time. Your code, the packages you import, and the runtime link into one file.",
  svg: `<svg viewBox="0 0 960 500" role="img" aria-label="Source text becomes a tree, is type-checked and tidied, turns into a stack of CPU instructions, then links with imports and the runtime into one file">
    <defs><marker id="dgArrP" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <text class="dg-t lg" x="24" y="36">1. The program changes shape</text>

    <rect class="dg-box dg-step" style="--i:0" x="24" y="52" width="152" height="220" rx="16"/>
    <rect class="dg-ink fill" x="48" y="100" width="104" height="10" rx="3"/>
    <rect class="dg-ink fill" x="48" y="122" width="78" height="10" rx="3"/>
    <rect class="dg-ink fill" x="48" y="144" width="96" height="10" rx="3"/>
    <rect class="dg-ink fill" x="48" y="166" width="60" height="10" rx="3"/>
    <text class="dg-t lg" x="100" y="244" text-anchor="middle">source</text>
    <path class="dg-arrow" d="M184 150 L204 150" marker-end="url(#dgArrP)"/>

    <rect class="dg-box dg-step" style="--i:1" x="212" y="52" width="152" height="220" rx="16"/>
    <circle class="dg-g" cx="288" cy="108" r="14"/>
    <path class="dg-ink" d="M288 122 L252 164 M288 122 L288 164 M288 122 L324 164"/>
    <circle class="dg-g" cx="252" cy="176" r="12"/>
    <circle class="dg-g" cx="288" cy="176" r="12"/>
    <circle class="dg-g" cx="324" cy="176" r="12"/>
    <text class="dg-t lg" x="288" y="244" text-anchor="middle">parse</text>
    <path class="dg-arrow" d="M372 150 L392 150" marker-end="url(#dgArrP)"/>

    <rect class="dg-box dg-step" style="--i:2" x="400" y="52" width="152" height="220" rx="16"/>
    <circle class="dg-badge" cx="520" cy="92" r="16"/>
    <path class="dg-mark" d="M512 92 l5 6 l11 -12"/>
    <circle class="dg-g" cx="476" cy="108" r="14"/>
    <path class="dg-ink" d="M476 122 L440 164 M476 122 L476 164 M476 122 L512 164"/>
    <circle class="dg-g" cx="440" cy="176" r="12"/>
    <circle class="dg-g" cx="476" cy="176" r="12"/>
    <circle class="dg-g" cx="512" cy="176" r="12"/>
    <text class="dg-t lg" x="476" y="244" text-anchor="middle">types</text>
    <path class="dg-arrow" d="M560 150 L580 150" marker-end="url(#dgArrP)"/>

    <rect class="dg-box dg-step" style="--i:3" x="588" y="52" width="152" height="220" rx="16"/>
    <circle class="dg-g" cx="664" cy="108" r="14"/>
    <path class="dg-ink" d="M664 122 L628 164 M664 122 L664 164"/>
    <path class="dg-ink soft" d="M664 122 L700 164"/>
    <circle class="dg-g" cx="628" cy="176" r="12"/>
    <circle class="dg-g" cx="664" cy="176" r="12"/>
    <circle class="dg-g dg-ink soft" cx="700" cy="176" r="12"/>
    <path class="dg-ink" d="M692 168 L708 184 M708 168 L692 184"/>
    <text class="dg-t lg" x="664" y="244" text-anchor="middle">tidy</text>
    <path class="dg-arrow" d="M748 150 L768 150" marker-end="url(#dgArrP)"/>

    <rect class="dg-box accent dg-step" style="--i:4" x="776" y="52" width="152" height="220" rx="16"/>
    <rect class="dg-ink fill" x="796" y="104" width="112" height="12" rx="3"/>
    <rect class="dg-ink fill" x="796" y="128" width="78" height="12" rx="3"/>
    <rect class="dg-ink fill" x="796" y="152" width="100" height="12" rx="3"/>
    <rect class="dg-ink fill" x="796" y="176" width="56" height="12" rx="3"/>
    <text class="dg-t lg" x="852" y="244" text-anchor="middle">CPU</text>

    <text class="dg-t lg" x="24" y="312">2. Three pieces, one file</text>
    <rect class="dg-box accent" x="24" y="332" width="190" height="120" rx="16"/>
    <text class="dg-t lg" x="119" y="400" text-anchor="middle">your code</text>
    <text class="dg-t xl" x="236" y="404" text-anchor="middle">+</text>
    <rect class="dg-box" x="258" y="332" width="170" height="120" rx="16"/>
    <text class="dg-t lg" x="343" y="400" text-anchor="middle">imports</text>
    <text class="dg-t xl" x="450" y="404" text-anchor="middle">+</text>
    <rect class="dg-box" x="472" y="332" width="180" height="120" rx="16"/>
    <text class="dg-t lg" x="562" y="400" text-anchor="middle">runtime</text>
    <path class="dg-arrow" d="M668 392 L748 392" marker-end="url(#dgArrP)"/>
    <rect class="dg-box ok dg-beat" x="756" y="332" width="180" height="120" rx="16"/>
    <text class="dg-t mono lg" x="846" y="384" text-anchor="middle">./app</text>
    <text class="dg-t lg" x="846" y="420" text-anchor="middle">one file</text>
  </svg>`
},

/* ─────────────── compiled vs interpreted vs JIT ─────────────── */
"exec-models": {
  title: "Three ways to run",
  caption: "Go is compiled. The program is machine code before it starts, so the first run is already fast.",
  svg: `<svg viewBox="0 0 960 660" role="img" aria-label="Compiled Go goes from source to machine code to the CPU. An interpreter re-reads source. A JIT starts slow, then compiles hot code.">
    <defs><marker id="dgArrE" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <rect class="dg-laneBg" x="12" y="12" width="936" height="204" rx="16"/>
    <text class="dg-t lg" x="28" y="48">1. Compiled</text>
    <text class="dg-t lg" x="220" y="48">Go, Rust, C</text>
    <text class="dg-t lg" x="620" y="48">fast from the start</text>
    <rect class="dg-box" x="28" y="80" width="180" height="108" rx="16"/>
    <text class="dg-t lg" x="118" y="142" text-anchor="middle">source</text>
    <path class="dg-arrow" d="M216 134 L252 134" marker-end="url(#dgArrE)"/>
    <rect class="dg-box" x="260" y="80" width="200" height="108" rx="16"/>
    <text class="dg-t lg" x="360" y="142" text-anchor="middle">compiler</text>
    <path class="dg-arrow" d="M468 134 L504 134" marker-end="url(#dgArrE)"/>
    <rect class="dg-box ok" x="512" y="80" width="240" height="108" rx="16"/>
    <text class="dg-t lg" x="632" y="142" text-anchor="middle">machine code</text>
    <path class="dg-arrow" d="M760 134 L796 134" marker-end="url(#dgArrE)"/>
    <rect class="dg-box accent dg-beat" x="804" y="80" width="124" height="108" rx="16"/>
    <text class="dg-t lg" x="866" y="142" text-anchor="middle">CPU</text>

    <rect class="dg-laneBg" x="12" y="232" width="936" height="204" rx="16"/>
    <text class="dg-t lg" x="28" y="268">2. Interpreted</text>
    <text class="dg-t lg" x="240" y="268">Python, Ruby</text>
    <text class="dg-t lg" x="620" y="268">read again each run</text>
    <rect class="dg-box" x="28" y="300" width="200" height="108" rx="16"/>
    <text class="dg-t lg" x="128" y="362" text-anchor="middle">source</text>
    <path class="dg-arrow" d="M236 354 L292 354" marker-end="url(#dgArrE)"/>
    <rect class="dg-box" x="300" y="300" width="360" height="108" rx="16"/>
    <text class="dg-t lg" x="480" y="362" text-anchor="middle">one line at a time</text>
    <path class="dg-arrow" d="M668 354 L796 354" marker-end="url(#dgArrE)"/>
    <rect class="dg-box" x="804" y="300" width="124" height="108" rx="16"/>
    <text class="dg-t lg" x="866" y="362" text-anchor="middle">CPU</text>

    <rect class="dg-laneBg" x="12" y="448" width="936" height="196" rx="16"/>
    <text class="dg-t lg" x="28" y="484">3. JIT</text>
    <text class="dg-t lg" x="160" y="484">Java, C#, JS</text>
    <text class="dg-t lg" x="680" y="484">slow, then fast</text>
    <rect class="dg-box" x="28" y="516" width="160" height="100" rx="16"/>
    <text class="dg-t lg" x="108" y="574" text-anchor="middle">source</text>
    <path class="dg-arrow" d="M196 566 L228 566" marker-end="url(#dgArrE)"/>
    <rect class="dg-box" x="236" y="516" width="180" height="100" rx="16"/>
    <text class="dg-t lg" x="326" y="574" text-anchor="middle">bytecode</text>
    <path class="dg-arrow" d="M424 566 L456 566" marker-end="url(#dgArrE)"/>
    <rect class="dg-box accent" x="464" y="516" width="200" height="100" rx="16"/>
    <text class="dg-t lg" x="564" y="574" text-anchor="middle">hot paths</text>
    <path class="dg-arrow" d="M672 566 L796 566" marker-end="url(#dgArrE)"/>
    <rect class="dg-box" x="804" y="516" width="124" height="100" rx="16"/>
    <text class="dg-t lg" x="866" y="574" text-anchor="middle">CPU</text>
  </svg>`
},

/* ─────────────── variables & zero values ─────────────── */
variable: {
  title: "age",
  caption: "One name, one type, one slot. The number 30 lives in that slot.",
  svg: `<svg viewBox="0 0 960 240" role="img" aria-label="The variable age has type int and holds the value 30">
    <text class="dg-t lg" x="48" y="40">name</text>
    <text class="dg-t mono xl" x="48" y="130">age</text>

    <text class="dg-t lg" x="280" y="40">type</text>
    <rect class="dg-box accent" x="280" y="60" width="200" height="120" rx="16"/>
    <text class="dg-t mono xl" x="380" y="136" text-anchor="middle">int</text>

    <text class="dg-t lg" x="540" y="40">value</text>
    <rect class="dg-box ok" x="540" y="60" width="372" height="150" rx="16"/>
    <text class="dg-t mono xl" x="726" y="152" text-anchor="middle">30</text>
  </svg>`
},

"assign-stack": {
  title: "Same slot",
  caption: "age = 40 writes 40 over 30. The slot does not move, and nothing new is allocated.",
  svg: `<svg viewBox="0 0 960 280" role="img" aria-label="age starts as 30 on the stack, then age equals 40 overwrites that same slot">
    <defs><marker id="dgArrAS" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>

    <text class="dg-t lg" x="40" y="36">stack</text>

    <text class="dg-t lg" x="40" y="84">age := 30</text>
    <rect class="dg-box accent" x="40" y="100" width="300" height="140" rx="16"/>
    <text class="dg-t lg" x="190" y="148" text-anchor="middle">age</text>
    <text class="dg-t mono xl" x="190" y="204" text-anchor="middle">30</text>

    <path class="dg-arrow" d="M360 170 L470 170" marker-end="url(#dgArrAS)"/>
    <text class="dg-t lg" x="415" y="150" text-anchor="middle">same slot</text>

    <text class="dg-t lg" x="500" y="84">age = 40</text>
    <rect class="dg-box ok" x="500" y="100" width="300" height="140" rx="16"/>
    <text class="dg-t lg" x="650" y="148" text-anchor="middle">age</text>
    <text class="dg-t mono xl" x="650" y="204" text-anchor="middle">40</text>
  </svg>`
},

"assign-heap": {
  title: "The letters live on the heap",
  caption: "name is a small slot on the stack. The letters sit on the heap. After name = Grace, nothing points at Ada, so the collector can free Ada.",
  svg: `<svg viewBox="0 0 960 420" role="img" aria-label="name points at Ada on the heap, then points at Grace, and Ada is swept because nothing points at it">
    <defs><marker id="dgArrAH" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>

    <text class="dg-t lg" x="24" y="36">1. name := &quot;Ada&quot;</text>
    <rect class="dg-box accent" x="24" y="52" width="240" height="110" rx="16"/>
    <text class="dg-t lg" x="144" y="96" text-anchor="middle">name</text>
    <text class="dg-t" x="144" y="128" text-anchor="middle">stack</text>
    <path class="dg-arrow" d="M280 107 L390 107" marker-end="url(#dgArrAH)"/>
    <rect class="dg-box" x="404" y="52" width="240" height="110" rx="16"/>
    <text class="dg-t mono xl" x="524" y="122" text-anchor="middle">Ada</text>

    <text class="dg-t lg" x="24" y="214">2. name = &quot;Grace&quot;</text>
    <rect class="dg-box accent" x="24" y="230" width="240" height="110" rx="16"/>
    <text class="dg-t lg" x="144" y="274" text-anchor="middle">name</text>
    <text class="dg-t" x="144" y="306" text-anchor="middle">stack</text>
    <path class="dg-arrow" d="M280 285 L390 285" marker-end="url(#dgArrAH)"/>
    <rect class="dg-box ok dg-arrive" x="404" y="230" width="240" height="110" rx="16"/>
    <text class="dg-t mono xl" x="524" y="300" text-anchor="middle">Grace</text>

    <rect class="dg-box bad" x="688" y="230" width="240" height="110" rx="16"/>
    <text class="dg-t mono xl" x="808" y="286" text-anchor="middle">Ada</text>
    <text class="dg-t" x="808" y="318" text-anchor="middle">no pointer</text>
  </svg>`
},

/* ─────────────── bytes vs runes ─────────────── */
"string-runes": {
  title: "Bytes, then runes",
  caption: "Héllo is 6 bytes and 5 runes. é is the two bytes C3 and A9, so range jumps from index 1 to index 3.",
  svg: `<svg viewBox="0 0 960 500" role="img" aria-label="The string Héllo is six bytes. The two bytes of é are one rune, so ranging visits five runes at indexes 0, 1, 3, 4 and 5.">
    <text class="dg-t lg" x="24" y="40">1. Six bytes. len is 6.</text>
    <rect class="dg-box" x="24" y="60" width="128" height="110" rx="16"/>
    <text class="dg-t mono xl" x="88" y="132" text-anchor="middle">H</text>
    <rect class="dg-box accent" x="168" y="60" width="128" height="110" rx="16"/>
    <text class="dg-t mono lg" x="232" y="128" text-anchor="middle">C3</text>
    <rect class="dg-box accent" x="312" y="60" width="128" height="110" rx="16"/>
    <text class="dg-t mono lg" x="376" y="128" text-anchor="middle">A9</text>
    <rect class="dg-box" x="456" y="60" width="128" height="110" rx="16"/>
    <text class="dg-t mono xl" x="520" y="132" text-anchor="middle">l</text>
    <rect class="dg-box" x="600" y="60" width="128" height="110" rx="16"/>
    <text class="dg-t mono xl" x="664" y="132" text-anchor="middle">l</text>
    <rect class="dg-box" x="744" y="60" width="128" height="110" rx="16"/>
    <text class="dg-t mono xl" x="808" y="132" text-anchor="middle">o</text>
    <text class="dg-t lg" x="88" y="204" text-anchor="middle">0</text>
    <text class="dg-t lg" x="232" y="204" text-anchor="middle">1</text>
    <text class="dg-t lg" x="376" y="204" text-anchor="middle">2</text>
    <text class="dg-t lg" x="520" y="204" text-anchor="middle">3</text>
    <text class="dg-t lg" x="664" y="204" text-anchor="middle">4</text>
    <text class="dg-t lg" x="808" y="204" text-anchor="middle">5</text>
    <path class="dg-brace2" d="M168 220 L168 236 L440 236 L440 220"/>
    <text class="dg-t lg" x="304" y="268" text-anchor="middle">one rune, é</text>

    <text class="dg-t lg" x="24" y="320">2. range sees five. Indexes jump.</text>
    <rect class="dg-box" x="24" y="340" width="168" height="130" rx="16"/>
    <text class="dg-t mono xl" x="108" y="400" text-anchor="middle">H</text>
    <text class="dg-t lg" x="108" y="444" text-anchor="middle">0</text>
    <rect class="dg-box ok dg-beat" x="208" y="340" width="168" height="130" rx="16"/>
    <text class="dg-t mono xl" x="292" y="400" text-anchor="middle">é</text>
    <text class="dg-t lg" x="292" y="444" text-anchor="middle">1</text>
    <rect class="dg-box" x="392" y="340" width="168" height="130" rx="16"/>
    <text class="dg-t mono xl" x="476" y="400" text-anchor="middle">l</text>
    <text class="dg-t lg" x="476" y="444" text-anchor="middle">3</text>
    <rect class="dg-box" x="576" y="340" width="168" height="130" rx="16"/>
    <text class="dg-t mono xl" x="660" y="400" text-anchor="middle">l</text>
    <text class="dg-t lg" x="660" y="444" text-anchor="middle">4</text>
    <rect class="dg-box" x="760" y="340" width="168" height="130" rx="16"/>
    <text class="dg-t mono xl" x="844" y="400" text-anchor="middle">o</text>
    <text class="dg-t lg" x="844" y="444" text-anchor="middle">5</text>
  </svg>`
},

/* ─────────────── slice header & append ─────────────── */
"slice-header": {
  title: "Same array, or a new one",
  caption: "While length is under capacity, append writes into the same array. When it is full, append copies into a new array. Keep the slice append returns.",
  svg: `<svg viewBox="0 0 960 520" role="img" aria-label="Append writes 4 into the spare slot of an array with room. When the array is full, append copies 1 2 3 4 into a new array and adds 5.">
    <defs><marker id="dgArrSL" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <text class="dg-t lg" x="24" y="40">1. Room left. Same array.</text>
    <rect class="dg-box accent" x="24" y="60" width="200" height="150" rx="16"/>
    <text class="dg-t lg" x="124" y="112" text-anchor="middle">len 3</text>
    <text class="dg-t lg" x="124" y="164" text-anchor="middle">cap 4</text>
    <path class="dg-arrow" d="M240 135 L300 135" marker-end="url(#dgArrSL)"/>
    <rect class="dg-box" x="312" y="76" width="120" height="120" rx="16"/>
    <text class="dg-t mono xl" x="372" y="152" text-anchor="middle">1</text>
    <rect class="dg-box" x="448" y="76" width="120" height="120" rx="16"/>
    <text class="dg-t mono xl" x="508" y="152" text-anchor="middle">2</text>
    <rect class="dg-box" x="584" y="76" width="120" height="120" rx="16"/>
    <text class="dg-t mono xl" x="644" y="152" text-anchor="middle">3</text>
    <rect class="dg-box ok dg-beat" x="720" y="76" width="120" height="120" rx="16"/>
    <text class="dg-t mono xl" x="780" y="152" text-anchor="middle">4</text>
    <text class="dg-t lg" x="780" y="230" text-anchor="middle">written</text>

    <text class="dg-t lg" x="24" y="290">2. Full. A new array.</text>
    <rect class="dg-box" x="24" y="310" width="150" height="80" rx="16"/>
    <text class="dg-t lg" x="99" y="358" text-anchor="middle">old</text>
    <rect class="dg-box" x="190" y="310" width="80" height="80" rx="16"/>
    <text class="dg-t mono lg" x="230" y="358" text-anchor="middle">1</text>
    <rect class="dg-box" x="282" y="310" width="80" height="80" rx="16"/>
    <text class="dg-t mono lg" x="322" y="358" text-anchor="middle">2</text>
    <rect class="dg-box" x="374" y="310" width="80" height="80" rx="16"/>
    <text class="dg-t mono lg" x="414" y="358" text-anchor="middle">3</text>
    <rect class="dg-box" x="466" y="310" width="80" height="80" rx="16"/>
    <text class="dg-t mono lg" x="506" y="358" text-anchor="middle">4</text>
    <path class="dg-arrow" d="M570 350 L640 350" marker-end="url(#dgArrSL)"/>
    <text class="dg-t lg" x="605" y="334" text-anchor="middle">copy</text>

    <rect class="dg-box ok" x="24" y="410" width="150" height="80" rx="16"/>
    <text class="dg-t lg" x="99" y="458" text-anchor="middle">new</text>
    <rect class="dg-box ok" x="190" y="410" width="80" height="80" rx="16"/>
    <text class="dg-t mono lg" x="230" y="458" text-anchor="middle">1</text>
    <rect class="dg-box ok" x="282" y="410" width="80" height="80" rx="16"/>
    <text class="dg-t mono lg" x="322" y="458" text-anchor="middle">2</text>
    <rect class="dg-box ok" x="374" y="410" width="80" height="80" rx="16"/>
    <text class="dg-t mono lg" x="414" y="458" text-anchor="middle">3</text>
    <rect class="dg-box ok" x="466" y="410" width="80" height="80" rx="16"/>
    <text class="dg-t mono lg" x="506" y="458" text-anchor="middle">4</text>
    <rect class="dg-box ok dg-beat" x="558" y="410" width="80" height="80" rx="16"/>
    <text class="dg-t mono lg" x="598" y="458" text-anchor="middle">5</text>
    <rect class="dg-box dashed" x="650" y="410" width="80" height="80" rx="16"/>
    <rect class="dg-box" x="746" y="410" width="190" height="80" rx="16"/>
    <text class="dg-t lg" x="841" y="458" text-anchor="middle">append</text>
  </svg>`
},

/* ─────────────── a call pushes a frame ─────────────── */
"call-stack": {
  title: "Call pushes. Return pops.",
  caption: "score sits on top of main. n = 10 is a slot in that frame. Return removes score. main stays.",
  svg: `<svg viewBox="0 0 960 320" role="img" aria-label="main stays on the stack while score is pushed on top with n equals 10, then popped on return">
    <defs><marker id="dgArrCS" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>

    <text class="dg-t lg" x="40" y="36">stack</text>

    <g class="dg-pushpop">
      <rect class="dg-box accent" x="40" y="56" width="420" height="110" rx="16"/>
      <text class="dg-t lg" x="64" y="100">score</text>
      <text class="dg-t mono xl" x="250" y="128">n = 10</text>
    </g>

    <rect class="dg-box" x="40" y="182" width="420" height="100" rx="16"/>
    <text class="dg-t lg" x="64" y="242">main</text>

    <path class="dg-arrow" d="M500 120 L680 120" marker-end="url(#dgArrCS)"/>
    <text class="dg-t lg" x="590" y="96" text-anchor="middle">return</text>
    <text class="dg-t lg" x="700" y="242">main stays</text>
  </svg>`
},

/* ─────────────── stack vs heap ─────────────── */
"stack-heap": {
  title: "A copy stays. A pointer leaves.",
  caption: "return x copies 42 and the frame can die. return &x must keep 42 alive, so that 42 moves to the heap.",
  svg: `<svg viewBox="0 0 960 300" role="img" aria-label="Returning x copies 42 off the stack. Returning the address of x puts 42 on the heap.">
    <defs><marker id="dgArrH" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>

    <rect class="dg-laneBg" x="16" y="16" width="452" height="268" rx="16"/>
    <text class="dg-t lg" x="36" y="52">return x</text>
    <rect class="dg-box dg-rest" x="36" y="72" width="180" height="120" rx="14"/>
    <text class="dg-t" x="126" y="112" text-anchor="middle">stack</text>
    <text class="dg-t mono xl" x="126" y="164" text-anchor="middle">42</text>
    <path class="dg-arrow" d="M230 132 L300 132" marker-end="url(#dgArrH)"/>
    <text class="dg-t" x="265" y="118" text-anchor="middle">copy</text>
    <rect class="dg-box ok dg-arrive" x="312" y="84" width="130" height="96" rx="14"/>
    <text class="dg-t mono xl" x="377" y="146" text-anchor="middle">42</text>

    <rect class="dg-laneBg" x="492" y="16" width="452" height="268" rx="16"/>
    <text class="dg-t lg" x="512" y="52">return &amp;x</text>
    <rect class="dg-box dg-rest" x="512" y="72" width="160" height="120" rx="14"/>
    <text class="dg-t" x="592" y="112" text-anchor="middle">stack</text>
    <text class="dg-t lg" x="592" y="156" text-anchor="middle">&amp;x</text>
    <path class="dg-arrow" d="M688 132 L760 132" marker-end="url(#dgArrH)"/>
    <rect class="dg-box accent dg-arrive go" x="772" y="72" width="150" height="120" rx="14"/>
    <text class="dg-t" x="847" y="112" text-anchor="middle">heap</text>
    <text class="dg-t mono xl" x="847" y="164" text-anchor="middle">42</text>
  </svg>`
},

/* ─────────────── interface value ─────────────── */
"iface-value": {
  title: "Two words",
  caption: "An interface holds a type and a value. It is nil only when both are empty. A nil pointer still has a type, so the interface is not nil.",
  svg: `<svg viewBox="0 0 960 460" role="img" aria-label="An interface holding a Rect has both words set. An interface holding a nil pointer has a type, so it is not nil. Both words empty is nil.">
    <text class="dg-t lg" x="24" y="40">1. A real value</text>
    <rect class="dg-box accent" x="24" y="56" width="440" height="180" rx="16"/>
    <text class="dg-t lg" x="134" y="120" text-anchor="middle">type</text>
    <text class="dg-t mono lg" x="134" y="172" text-anchor="middle">*Rect</text>
    <line class="dg-rule" x1="244" y1="72" x2="244" y2="220"/>
    <text class="dg-t lg" x="354" y="120" text-anchor="middle">data</text>
    <text class="dg-t mono xl" x="354" y="180" text-anchor="middle">3, 4</text>

    <text class="dg-t lg" x="500" y="40">2. A nil pointer</text>
    <rect class="dg-box bad" x="500" y="56" width="436" height="180" rx="16"/>
    <text class="dg-t lg" x="610" y="110" text-anchor="middle">type</text>
    <text class="dg-t mono lg" x="610" y="156" text-anchor="middle">*MyErr</text>
    <line class="dg-rule" x1="718" y1="72" x2="718" y2="220"/>
    <text class="dg-t lg" x="828" y="110" text-anchor="middle">data</text>
    <text class="dg-t mono xl" x="828" y="170" text-anchor="middle">nil</text>
    <text class="dg-t lg" x="718" y="270" text-anchor="middle">err != nil</text>

    <text class="dg-t lg" x="24" y="330">3. Both empty</text>
    <rect class="dg-box ok" x="24" y="346" width="440" height="90" rx="16"/>
    <text class="dg-t lg" x="134" y="400" text-anchor="middle">type empty</text>
    <text class="dg-t lg" x="354" y="400" text-anchor="middle">data empty</text>
    <rect class="dg-box ok" x="500" y="346" width="436" height="90" rx="16"/>
    <text class="dg-t lg" x="718" y="400" text-anchor="middle">this is nil</text>
  </svg>`
},

/* ─────────────── channels ─────────────── */
channel: {
  title: "They meet, or they queue",
  caption: "With no buffer, a send waits until someone receives. With room for 4, the sender waits only when all 4 slots are full.",
  svg: `<svg viewBox="0 0 960 510" role="img" aria-label="An unbuffered send and receive wait for each other, then both continue. A buffer of 4 lets the sender continue until every slot is full.">
    <defs><marker id="dgArrCH" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <text class="dg-t lg" x="24" y="40">1. No buffer. They wait for each other.</text>
    <rect class="dg-box" x="24" y="60" width="280" height="160" rx="16"/>
    <text class="dg-t lg" x="164" y="112" text-anchor="middle">send</text>
    <text class="dg-t mono xl" x="164" y="168" text-anchor="middle">42</text>
    <path class="dg-arrow" d="M316 140 L360 140" marker-end="url(#dgArrCH)"/>
    <rect class="dg-box ok dg-beat" x="372" y="72" width="216" height="136" rx="16"/>
    <text class="dg-t lg" x="480" y="128" text-anchor="middle">they meet</text>
    <text class="dg-t lg" x="480" y="168" text-anchor="middle">both go</text>
    <path class="dg-arrow" d="M600 140 L656 140" marker-end="url(#dgArrCH)"/>
    <rect class="dg-box" x="668" y="60" width="268" height="160" rx="16"/>
    <text class="dg-t lg" x="802" y="112" text-anchor="middle">receive</text>
    <text class="dg-t mono xl" x="802" y="168" text-anchor="middle">42</text>

    <text class="dg-t lg" x="24" y="276">2. Buffer of 4. Two slots used.</text>
    <rect class="dg-box ok" x="32" y="300" width="200" height="140" rx="16"/>
    <text class="dg-t mono xl" x="132" y="384" text-anchor="middle">1</text>
    <rect class="dg-box ok" x="264" y="300" width="200" height="140" rx="16"/>
    <text class="dg-t mono xl" x="364" y="384" text-anchor="middle">2</text>
    <rect class="dg-box dashed" x="496" y="300" width="200" height="140" rx="16"/>
    <rect class="dg-box dashed" x="728" y="300" width="200" height="140" rx="16"/>
    <text class="dg-t lg" x="24" y="480">sender waits if full</text>
    <text class="dg-t lg" x="520" y="480">receiver waits if empty</text>
  </svg>`
},

/* ─────────────── GMP scheduler ─────────────── */
gmp: {
  title: "G runs on M, when a P allows it",
  caption: "P0 and P1 have goroutines. P2 has none, so it takes half of P0. Each P sits on an OS thread. GOMAXPROCS is how many Ps exist.",
  svg: `<svg viewBox="0 0 960 500" role="img" aria-label="P0 has a queue of goroutines, P1 has one parked on a channel, and idle P2 steals half of P0. Each P runs on an OS thread.">
    <defs><marker id="dgArrGM" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <rect class="dg-box" x="24" y="16" width="912" height="80" rx="16"/>
    <text class="dg-t lg" x="48" y="64">global queue</text>
    <rect class="dg-box accent" x="280" y="32" width="72" height="48" rx="12"/>
    <text class="dg-t lg" x="316" y="64" text-anchor="middle">G</text>
    <rect class="dg-box accent" x="364" y="32" width="72" height="48" rx="12"/>
    <text class="dg-t lg" x="400" y="64" text-anchor="middle">G</text>
    <rect class="dg-box accent" x="448" y="32" width="72" height="48" rx="12"/>
    <text class="dg-t lg" x="484" y="64" text-anchor="middle">G</text>

    <rect class="dg-box accent" x="24" y="116" width="296" height="220" rx="16"/>
    <text class="dg-t lg" x="44" y="156">P0</text>
    <rect class="dg-box" x="44" y="176" width="56" height="56" rx="12"/>
    <text class="dg-t lg" x="72" y="212" text-anchor="middle">G</text>
    <rect class="dg-box" x="112" y="176" width="56" height="56" rx="12"/>
    <text class="dg-t lg" x="140" y="212" text-anchor="middle">G</text>
    <rect class="dg-box" x="180" y="176" width="56" height="56" rx="12"/>
    <text class="dg-t lg" x="208" y="212" text-anchor="middle">G</text>
    <rect class="dg-box" x="248" y="176" width="56" height="56" rx="12"/>
    <text class="dg-t lg" x="276" y="212" text-anchor="middle">G</text>
    <text class="dg-t lg" x="44" y="280">busy</text>

    <rect class="dg-box" x="336" y="116" width="296" height="220" rx="16"/>
    <text class="dg-t lg" x="356" y="156">P1</text>
    <rect class="dg-box" x="356" y="176" width="56" height="56" rx="12"/>
    <text class="dg-t lg" x="384" y="212" text-anchor="middle">G</text>
    <text class="dg-t lg" x="356" y="268">parked</text>
    <text class="dg-t lg" x="356" y="304">on a channel</text>

    <rect class="dg-box ok dg-beat" x="648" y="116" width="288" height="220" rx="16"/>
    <text class="dg-t lg" x="668" y="156">P2</text>
    <text class="dg-t lg" x="668" y="220">empty</text>
    <text class="dg-t lg" x="668" y="268">steals half</text>
    <text class="dg-t lg" x="668" y="304">of P0</text>

    <rect class="dg-box" x="24" y="360" width="296" height="80" rx="16"/>
    <text class="dg-t lg" x="172" y="408" text-anchor="middle">M0, OS thread</text>
    <rect class="dg-box" x="336" y="360" width="296" height="80" rx="16"/>
    <text class="dg-t lg" x="484" y="408" text-anchor="middle">M1, OS thread</text>
    <rect class="dg-box" x="648" y="360" width="288" height="80" rx="16"/>
    <text class="dg-t lg" x="792" y="408" text-anchor="middle">M2, OS thread</text>
  </svg>`
},

/* ─────────────── lesson 1: what the collector keeps ─────────────── */
"gc-reach": {
  title: "Keep what a name still holds",
  caption: "order still holds dinner, so dinner stays. lunch has no name left, so Go throws lunch away.",
  svg: `<svg viewBox="0 0 960 340" role="img" aria-label="The name order still holds dinner, which is kept. lunch has no name, so it is thrown away.">
    <defs><marker id="dgArrGR" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>

    <text class="dg-t lg" x="24" y="36">still in use</text>
    <rect class="dg-box accent" x="24" y="52" width="240" height="110" rx="16"/>
    <text class="dg-t" x="144" y="96" text-anchor="middle">name</text>
    <text class="dg-t mono xl" x="144" y="140" text-anchor="middle">order</text>
    <path class="dg-arrow" d="M280 107 L390 107" marker-end="url(#dgArrGR)"/>
    <text class="dg-t" x="335" y="92" text-anchor="middle">holds</text>
    <rect class="dg-box ok" x="404" y="52" width="240" height="110" rx="16"/>
    <text class="dg-t mono xl" x="524" y="122" text-anchor="middle">dinner</text>
    <text class="dg-t lg" x="720" y="118">kept</text>

    <text class="dg-t lg" x="24" y="214">no longer used</text>
    <rect class="dg-box bad" x="24" y="230" width="240" height="90" rx="16"/>
    <text class="dg-t mono xl" x="144" y="286" text-anchor="middle">lunch</text>
    <text class="dg-t lg" x="300" y="284">thrown away</text>
  </svg>`
},

/* ─────────────── tri-colour GC ─────────────── */
gc: {
  title: "White, grey, black",
  caption: "White is not checked yet. Grey is found, and its children are still to look at. Black is finished. Anything still white with no path is thrown away. A write into a black object marks the new one grey.",
  svg: `<svg viewBox="0 0 960 620" role="img" aria-label="Roots reach A, B and C, which are finished. D and E are found but not finished. F is not checked yet. X and Y have no path and are thrown away.">
    <defs><marker id="dgArrGC" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <g class="dg-node white"><circle cx="48" cy="40" r="22"/></g>
    <text class="dg-t lg" x="84" y="46">white, not checked</text>
    <g class="dg-node grey"><circle cx="360" cy="40" r="22"/></g>
    <text class="dg-t lg" x="396" y="46">grey, look inside</text>
    <g class="dg-node black"><circle cx="680" cy="40" r="22"/></g>
    <text class="dg-t lg" x="716" y="46">black, finished</text>

    <rect class="dg-box accent" x="24" y="178" width="140" height="80" rx="16"/>
    <text class="dg-t lg" x="94" y="226" text-anchor="middle">roots</text>
    <path class="dg-arrow" d="M172 218 L220 218" marker-end="url(#dgArrGC)"/>

    <g class="dg-node black"><circle cx="270" cy="218" r="40"/><text class="dg-t lg" x="270" y="224" text-anchor="middle">A</text></g>
    <path class="dg-arrow" d="M310 202 L380 170" marker-end="url(#dgArrGC)"/>
    <path class="dg-arrow" d="M310 234 L380 266" marker-end="url(#dgArrGC)"/>
    <g class="dg-node black"><circle cx="430" cy="162" r="40"/><text class="dg-t lg" x="430" y="168" text-anchor="middle">B</text></g>
    <g class="dg-node black"><circle cx="430" cy="274" r="40"/><text class="dg-t lg" x="430" y="280" text-anchor="middle">C</text></g>
    <path class="dg-arrow" d="M470 162 L540 162" marker-end="url(#dgArrGC)"/>
    <path class="dg-arrow" d="M470 274 L540 274" marker-end="url(#dgArrGC)"/>
    <g class="dg-node grey"><circle cx="590" cy="162" r="40"/><text class="dg-t lg" x="590" y="168" text-anchor="middle">D</text></g>
    <g class="dg-node grey"><circle cx="590" cy="274" r="40"/><text class="dg-t lg" x="590" y="280" text-anchor="middle">E</text></g>
    <path class="dg-arrow" d="M630 274 L700 310" marker-end="url(#dgArrGC)"/>
    <g class="dg-node white"><circle cx="750" cy="326" r="40"/><text class="dg-t lg" x="750" y="332" text-anchor="middle">F</text></g>

    <g class="dg-node white"><circle cx="860" cy="190" r="36"/><text class="dg-t lg" x="860" y="196" text-anchor="middle">X</text></g>
    <g class="dg-node white"><circle cx="860" cy="280" r="36"/><text class="dg-t lg" x="860" y="286" text-anchor="middle">Y</text></g>
    <text class="dg-t lg" x="860" y="350" text-anchor="middle">no path</text>

    <text class="dg-t lg" x="24" y="410">Write barrier</text>
    <rect class="dg-box" x="24" y="430" width="280" height="150" rx="16"/>
    <text class="dg-t lg" x="164" y="494" text-anchor="middle">black A</text>
    <text class="dg-t lg" x="164" y="538" text-anchor="middle">stores F</text>
    <path class="dg-arrow" d="M320 505 L400 505" marker-end="url(#dgArrGC)"/>
    <text class="dg-t lg" x="360" y="486" text-anchor="middle">marks</text>
    <rect class="dg-box ok dg-beat" x="412" y="430" width="280" height="150" rx="16"/>
    <text class="dg-t lg" x="552" y="494" text-anchor="middle">F turns grey</text>
    <text class="dg-t lg" x="552" y="538" text-anchor="middle">kept</text>
  </svg>`
},

/* ─────────────── module or just a file? ─────────────── */
"module-or-file": {
  title: "One file, or a module",
  caption: "A single file that only uses the standard library can run on its own. Anything else starts with go mod init.",
  svg: `<svg viewBox="0 0 960 360" role="img" aria-label="One standard-library file uses go run scratch.go. Anything else uses go mod init example/hello-world.">
    <defs><marker id="dgArrMF" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <rect class="dg-box accent" x="24" y="24" width="420" height="120" rx="16"/>
    <text class="dg-t lg" x="234" y="76" text-anchor="middle">One file?</text>
    <text class="dg-t lg" x="234" y="112" text-anchor="middle">Standard library only</text>
    <path class="dg-arrow" d="M460 84 L520 84" marker-end="url(#dgArrMF)"/>
    <text class="dg-t lg" x="490" y="68" text-anchor="middle">yes</text>
    <rect class="dg-box ok dg-beat" x="532" y="36" width="404" height="96" rx="16"/>
    <text class="dg-t mono lg" x="734" y="92" text-anchor="middle">go run scratch.go</text>
    <path class="dg-arrow" d="M234 152 L234 196" marker-end="url(#dgArrMF)"/>
    <text class="dg-t lg" x="270" y="184">no</text>
    <rect class="dg-box" x="24" y="208" width="912" height="120" rx="16"/>
    <text class="dg-t mono lg" x="480" y="278" text-anchor="middle">go mod init example/hello-world</text>
  </svg>`
},

/* ─────────────── middleware chain ─────────────── */
middleware: {
  title: "In on the way, out on the way back",
  caption: "The request walks request id, recover, metrics, limit, auth, then your handler. The response walks back out through the same layers.",
  svg: `<svg viewBox="0 0 960 340" role="img" aria-label="A request passes through request id, recover, metrics, limit and auth before the handler. The response returns through the same layers.">
    <defs><marker id="dgArrMW" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <text class="dg-t lg" x="24" y="36">request</text>
    <rect class="dg-box" x="16" y="56" width="148" height="150" rx="16"/>
    <text class="dg-t xl" x="90" y="120" text-anchor="middle">1</text>
    <text class="dg-t lg" x="90" y="168" text-anchor="middle">id</text>
    <rect class="dg-box" x="176" y="56" width="148" height="150" rx="16"/>
    <text class="dg-t xl" x="250" y="120" text-anchor="middle">2</text>
    <text class="dg-t lg" x="250" y="168" text-anchor="middle">recover</text>
    <rect class="dg-box" x="336" y="56" width="148" height="150" rx="16"/>
    <text class="dg-t xl" x="410" y="120" text-anchor="middle">3</text>
    <text class="dg-t lg" x="410" y="168" text-anchor="middle">metrics</text>
    <rect class="dg-box" x="496" y="56" width="148" height="150" rx="16"/>
    <text class="dg-t xl" x="570" y="120" text-anchor="middle">4</text>
    <text class="dg-t lg" x="570" y="168" text-anchor="middle">limit</text>
    <rect class="dg-box" x="656" y="56" width="148" height="150" rx="16"/>
    <text class="dg-t xl" x="730" y="120" text-anchor="middle">5</text>
    <text class="dg-t lg" x="730" y="168" text-anchor="middle">auth</text>
    <rect class="dg-box accent dg-beat" x="816" y="56" width="128" height="150" rx="16"/>
    <text class="dg-t xl" x="880" y="120" text-anchor="middle">6</text>
    <text class="dg-t lg" x="880" y="168" text-anchor="middle">handler</text>
    <path class="dg-arrow" d="M900 240 L40 240" marker-end="url(#dgArrMW)"/>
    <text class="dg-t lg" x="480" y="280" text-anchor="middle">response comes back out</text>
  </svg>`
}
,

/* ─────────────── if / for / switch ─────────────── */
"control-if": {
  title: "One test, one branch",
  caption: "err == nil runs use(v). Anything else returns the error. v and err exist only in those branches.",
  svg: `<svg viewBox="0 0 960 250" role="img" aria-label="The test err equals nil. True runs use(v). False returns the error.">
    <defs><marker id="dgArrIF" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>

    <rect class="dg-box accent" x="28" y="36" width="280" height="150" rx="16"/>
    <text class="dg-t mono lg" x="168" y="104" text-anchor="middle">err == nil</text>
    <text class="dg-t lg" x="168" y="152" text-anchor="middle">the test</text>

    <path class="dg-arrow" d="M320 80 L468 80" marker-end="url(#dgArrIF)"/>
    <text class="dg-t lg" x="394" y="64" text-anchor="middle">true</text>
    <circle class="dg-run" r="8" style="offset-path: path('M328 80 L452 80')"/>
    <rect class="dg-box ok dg-beat" x="480" y="40" width="250" height="80" rx="16"/>
    <text class="dg-t mono lg" x="605" y="88" text-anchor="middle">use(v)</text>

    <path class="dg-arrow" d="M320 150 L468 170" marker-end="url(#dgArrIF)"/>
    <text class="dg-t lg" x="390" y="136" text-anchor="middle">false</text>
    <circle class="dg-run" r="8" style="offset-path: path('M328 152 L452 170'); --i: 1"/>
    <rect class="dg-box bad" x="480" y="136" width="250" height="80" rx="16"/>
    <text class="dg-t mono lg" x="605" y="184" text-anchor="middle">return err</text>

    <text class="dg-t lg" x="756" y="100">v, err</text>
    <text class="dg-t lg" x="756" y="132">only here</text>
  </svg>`
},

"control-for": {
  title: "One keyword, four shapes",
  caption: "A counter, a condition, a loop until break, and range. The highlight walks 1, then 2, then 3, then 4.",
  svg: `<svg viewBox="0 0 960 250" role="img" aria-label="for has four shapes: a counter, a condition, a loop until break, and range.">
    <rect class="dg-box dg-step" style="--i:0" x="28" y="28" width="216" height="196" rx="16"/>
    <text class="dg-t xl" x="48" y="80">1</text>
    <text class="dg-t mono lg" x="48" y="124">for i := 0</text>
    <text class="dg-t mono lg" x="48" y="160">i &lt; n; i++</text>
    <text class="dg-t lg" x="48" y="204">counter</text>

    <rect class="dg-box dg-step" style="--i:1" x="260" y="28" width="216" height="196" rx="16"/>
    <text class="dg-t xl" x="280" y="80">2</text>
    <text class="dg-t mono lg" x="280" y="148">for n &gt; 0</text>
    <text class="dg-t lg" x="280" y="204">while</text>

    <rect class="dg-box dg-step" style="--i:2" x="492" y="28" width="216" height="196" rx="16"/>
    <text class="dg-t xl" x="512" y="80">3</text>
    <text class="dg-t mono lg" x="512" y="148">for { }</text>
    <text class="dg-t lg" x="512" y="204">until break</text>

    <rect class="dg-box accent dg-step" style="--i:3" x="724" y="28" width="212" height="196" rx="16"/>
    <text class="dg-t xl" x="744" y="80">4</text>
    <text class="dg-t mono lg" x="744" y="124">for i, v :=</text>
    <text class="dg-t mono lg" x="744" y="160">range x</text>
    <text class="dg-t lg" x="744" y="204">walk</text>
  </svg>`
},

"control-switch": {
  title: "One case, then stop",
  caption: "day is Mon, so that case runs. Sat, Sun and default are skipped.",
  svg: `<svg viewBox="0 0 960 220" role="img" aria-label="switch on Monday runs the Mon case and skips the others.">
    <defs><marker id="dgArrSW" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>

    <rect class="dg-box accent" x="28" y="36" width="180" height="150" rx="16"/>
    <text class="dg-t lg" x="118" y="92" text-anchor="middle">day</text>
    <text class="dg-t mono xl" x="118" y="148" text-anchor="middle">Mon</text>

    <path class="dg-arrow" d="M220 110 L292 110" marker-end="url(#dgArrSW)"/>
    <text class="dg-t lg" x="256" y="92" text-anchor="middle">runs</text>
    <circle class="dg-run" r="8" style="offset-path: path('M228 110 L284 110')"/>

    <rect class="dg-box" x="304" y="36" width="200" height="150" rx="16"/>
    <text class="dg-t lg" x="404" y="100" text-anchor="middle">Sat, Sun</text>
    <text class="dg-t lg" x="404" y="140" text-anchor="middle">skipped</text>

    <rect class="dg-box ok dg-beat" x="520" y="36" width="200" height="150" rx="16"/>
    <text class="dg-t mono xl" x="620" y="108" text-anchor="middle">Mon</text>
    <text class="dg-t lg" x="620" y="152" text-anchor="middle">this one</text>

    <rect class="dg-box" x="736" y="36" width="200" height="150" rx="16"/>
    <text class="dg-t lg" x="836" y="100" text-anchor="middle">default</text>
    <text class="dg-t lg" x="836" y="140" text-anchor="middle">skipped</text>
  </svg>`
},


/* ─────────────── defer ─────────────── */
"defer-stack": {
  title: "Last in runs first",
  caption: "Written as Close, then Unlock, then log. The stack puts log on top, so return runs log, then Unlock, then Close. The 0 saved at defer stays 0.",
  svg: `<svg viewBox="0 0 960 660" role="img" aria-label="Three defers are stacked with log on top. Return runs log, then Unlock, then Close. A saved 0 still prints 0 after i becomes 1.">
    <defs><marker id="dgArrDF" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>

    <text class="dg-t lg" x="28" y="36">1. Written</text>
    <rect class="dg-box" x="28" y="56" width="300" height="72" rx="16"/>
    <text class="dg-t xl" x="48" y="104">1</text>
    <text class="dg-t mono lg" x="100" y="100">Close()</text>

    <rect class="dg-box" x="28" y="144" width="300" height="72" rx="16"/>
    <text class="dg-t xl" x="48" y="192">2</text>
    <text class="dg-t mono lg" x="100" y="188">Unlock()</text>

    <rect class="dg-box" x="28" y="232" width="300" height="72" rx="16"/>
    <text class="dg-t xl" x="48" y="280">3</text>
    <text class="dg-t mono lg" x="100" y="276">log()</text>

    <path class="dg-arrow" d="M348 180 L468 180" marker-end="url(#dgArrDF)"/>
    <text class="dg-t lg" x="408" y="164" text-anchor="middle">push</text>
    <circle class="dg-run" r="8" style="offset-path: path('M356 180 L456 180')"/>

    <text class="dg-t lg" x="488" y="36">stack, top is last</text>
    <rect class="dg-box ok dg-beat" x="488" y="56" width="440" height="72" rx="16"/>
    <text class="dg-t mono lg" x="512" y="100">log()</text>
    <text class="dg-t lg" x="800" y="100">top</text>

    <rect class="dg-box" x="488" y="144" width="440" height="72" rx="16"/>
    <text class="dg-t mono lg" x="512" y="188">Unlock()</text>

    <rect class="dg-box" x="488" y="232" width="440" height="72" rx="16"/>
    <text class="dg-t mono lg" x="512" y="276">Close()</text>

    <text class="dg-t lg" x="28" y="352">2. On return</text>
    <rect class="dg-box ok dg-step" style="--i:0" x="28" y="372" width="280" height="88" rx="16"/>
    <text class="dg-t xl" x="48" y="428">1</text>
    <text class="dg-t mono lg" x="100" y="424">log()</text>

    <rect class="dg-box ok dg-step" style="--i:1" x="340" y="372" width="280" height="88" rx="16"/>
    <text class="dg-t xl" x="360" y="428">2</text>
    <text class="dg-t mono lg" x="412" y="424">Unlock()</text>

    <rect class="dg-box ok dg-step" style="--i:2" x="652" y="372" width="280" height="88" rx="16"/>
    <text class="dg-t xl" x="672" y="428">3</text>
    <text class="dg-t mono lg" x="724" y="424">Close()</text>

    <text class="dg-t lg" x="28" y="508">3. The number is saved then</text>
    <rect class="dg-box accent" x="28" y="528" width="200" height="100" rx="16"/>
    <text class="dg-t lg" x="128" y="564" text-anchor="middle">i is</text>
    <text class="dg-t mono xl" x="128" y="608" text-anchor="middle">0</text>

    <path class="dg-arrow" d="M244 578 L360 578" marker-end="url(#dgArrDF)"/>
    <text class="dg-t lg" x="302" y="560" text-anchor="middle">saved</text>
    <circle class="dg-run" r="8" style="offset-path: path('M252 578 L348 578'); --i: 1"/>

    <rect class="dg-box ok" x="372" y="528" width="280" height="100" rx="16"/>
    <text class="dg-t lg" x="512" y="564" text-anchor="middle">prints</text>
    <text class="dg-t mono xl" x="512" y="608" text-anchor="middle">0</text>

    <rect class="dg-box" x="688" y="528" width="244" height="100" rx="16"/>
    <text class="dg-t lg" x="810" y="568" text-anchor="middle">i = 1</text>
    <text class="dg-t lg" x="810" y="604" text-anchor="middle">still prints 0</text>
  </svg>`
},

/* ─────────────── multiple returns ─────────────── */
"func-returns": {
  title: "A number and an error",
  caption: "divide(10, 2) gives 5 and nil, so you use 5. divide(10, 0) gives 0 and an error, so you stop. A map, a type check, and a channel use the same pair.",
  svg: `<svg viewBox="0 0 960 520" role="img" aria-label="divide of 10 and 2 returns 5 and nil. divide of 10 and 0 returns 0 and an error. Map, type, and channel reads use the same two-result shape.">
    <defs><marker id="dgArrFR" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <text class="dg-t lg" x="24" y="40">1. It worked</text>
    <rect class="dg-box" x="24" y="56" width="280" height="120" rx="16"/>
    <text class="dg-t mono lg" x="164" y="128" text-anchor="middle">divide(10, 2)</text>
    <path class="dg-arrow" d="M316 116 L360 116" marker-end="url(#dgArrFR)"/>
    <rect class="dg-box ok dg-beat" x="372" y="56" width="250" height="120" rx="16"/>
    <text class="dg-t mono xl" x="497" y="112" text-anchor="middle">5</text>
    <text class="dg-t lg" x="497" y="152" text-anchor="middle">nil</text>
    <path class="dg-arrow" d="M634 116 L690 116" marker-end="url(#dgArrFR)"/>
    <rect class="dg-box ok" x="702" y="56" width="234" height="120" rx="16"/>
    <text class="dg-t lg" x="819" y="128" text-anchor="middle">use it</text>

    <text class="dg-t lg" x="24" y="224">2. It failed</text>
    <rect class="dg-box" x="24" y="240" width="280" height="120" rx="16"/>
    <text class="dg-t mono lg" x="164" y="312" text-anchor="middle">divide(10, 0)</text>
    <path class="dg-arrow" d="M316 300 L360 300" marker-end="url(#dgArrFR)"/>
    <rect class="dg-box bad" x="372" y="240" width="250" height="120" rx="16"/>
    <text class="dg-t mono xl" x="497" y="296" text-anchor="middle">0</text>
    <text class="dg-t lg" x="497" y="336" text-anchor="middle">error</text>
    <path class="dg-arrow" d="M634 300 L690 300" marker-end="url(#dgArrFR)"/>
    <rect class="dg-box bad" x="702" y="240" width="234" height="120" rx="16"/>
    <text class="dg-t lg" x="819" y="312" text-anchor="middle">stop</text>

    <text class="dg-t lg" x="24" y="404">3. Same pair, three places</text>
    <rect class="dg-box" x="24" y="420" width="292" height="80" rx="16"/>
    <text class="dg-t lg" x="170" y="468" text-anchor="middle">map, v, ok</text>
    <rect class="dg-box" x="332" y="420" width="292" height="80" rx="16"/>
    <text class="dg-t lg" x="478" y="468" text-anchor="middle">type, v, ok</text>
    <rect class="dg-box" x="640" y="420" width="296" height="80" rx="16"/>
    <text class="dg-t lg" x="788" y="468" text-anchor="middle">channel, v, ok</text>
  </svg>`
},

/* ─────────────── closures ─────────────── */
closure: {
  title: "Same count, then a new one",
  caption: "c() keeps adding to the same count, so three calls give 1, then 2, then 3. c2 is a second call to counter, so it has its own count and starts again at 1.",
  svg: `<svg viewBox="0 0 960 400" role="img" aria-label="Three calls to c return 1, then 2, then 3 from one count. c2 has its own count and returns 1.">
    <text class="dg-t lg" x="24" y="40">1. c, one count</text>
    <rect class="dg-box ok" x="24" y="60" width="200" height="160" rx="16"/>
    <text class="dg-t mono xl" x="124" y="156" text-anchor="middle">1</text>
    <rect class="dg-box ok" x="244" y="60" width="200" height="160" rx="16"/>
    <text class="dg-t mono xl" x="344" y="156" text-anchor="middle">2</text>
    <rect class="dg-box ok dg-beat" x="464" y="60" width="200" height="160" rx="16"/>
    <text class="dg-t mono xl" x="564" y="156" text-anchor="middle">3</text>
    <rect class="dg-box accent" x="700" y="60" width="236" height="160" rx="16"/>
    <text class="dg-t lg" x="818" y="120" text-anchor="middle">count</text>
    <text class="dg-t mono xl" x="818" y="176" text-anchor="middle">3</text>

    <text class="dg-t lg" x="24" y="270">2. c2, its own count</text>
    <rect class="dg-box ok dg-beat" x="24" y="290" width="200" height="90" rx="16"/>
    <text class="dg-t mono xl" x="124" y="350" text-anchor="middle">1</text>
    <rect class="dg-box accent" x="700" y="276" width="236" height="104" rx="16"/>
    <text class="dg-t lg" x="818" y="320" text-anchor="middle">count</text>
    <text class="dg-t mono xl" x="818" y="364" text-anchor="middle">1</text>
  </svg>`
},

/* ─────────────── worker pool ─────────────── */
"worker-pool": {
  title: "Jobs in, results out",
  caption: "Workers pull from one jobs queue. They send to one results queue. Close jobs, wait until the workers finish, then close results.",
  svg: `<svg viewBox="0 0 960 480" role="img" aria-label="Jobs 7 and 8 wait in a queue for three workers. Results 3 and 4 go to a collector. Shutdown closes jobs, waits, then closes results.">
    <defs><marker id="dgArrWP" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <text class="dg-t lg" x="24" y="36">jobs</text>
    <rect class="dg-box ok" x="24" y="52" width="100" height="100" rx="16"/>
    <text class="dg-t mono xl" x="74" y="116" text-anchor="middle">7</text>
    <rect class="dg-box ok" x="136" y="52" width="100" height="100" rx="16"/>
    <text class="dg-t mono xl" x="186" y="116" text-anchor="middle">8</text>
    <rect class="dg-box dashed" x="248" y="52" width="100" height="100" rx="16"/>
    <path class="dg-arrow" d="M364 102 L420 102" marker-end="url(#dgArrWP)"/>

    <rect class="dg-box accent dg-beat" x="432" y="16" width="220" height="64" rx="16"/>
    <text class="dg-t lg" x="542" y="56" text-anchor="middle">worker 1</text>
    <rect class="dg-box accent" x="432" y="92" width="220" height="64" rx="16"/>
    <text class="dg-t lg" x="542" y="132" text-anchor="middle">worker 2</text>
    <rect class="dg-box" x="432" y="168" width="220" height="64" rx="16"/>
    <text class="dg-t lg" x="542" y="208" text-anchor="middle">worker 3</text>
    <path class="dg-arrow" d="M664 124 L720 124" marker-end="url(#dgArrWP)"/>

    <text class="dg-t lg" x="732" y="36">results</text>
    <rect class="dg-box ok" x="732" y="52" width="90" height="90" rx="16"/>
    <text class="dg-t mono xl" x="777" y="110" text-anchor="middle">3</text>
    <rect class="dg-box ok" x="834" y="52" width="90" height="90" rx="16"/>
    <text class="dg-t mono xl" x="879" y="110" text-anchor="middle">4</text>

    <text class="dg-t lg" x="24" y="280">Then, in order</text>
    <rect class="dg-box" x="24" y="300" width="292" height="140" rx="16"/>
    <text class="dg-t xl" x="48" y="360">1</text>
    <text class="dg-t mono lg" x="110" y="356">close</text>
    <text class="dg-t mono lg" x="110" y="396">jobs</text>
    <rect class="dg-box" x="332" y="300" width="292" height="140" rx="16"/>
    <text class="dg-t xl" x="356" y="360">2</text>
    <text class="dg-t lg" x="430" y="380">wait</text>
    <rect class="dg-box ok" x="640" y="300" width="296" height="140" rx="16"/>
    <text class="dg-t xl" x="664" y="360">3</text>
    <text class="dg-t mono lg" x="730" y="356">close</text>
    <text class="dg-t mono lg" x="730" y="396">results</text>
  </svg>`
},

/* ─────────────── select ─────────────── */
select: {
  title: "One case runs",
  caption: "select waits on results, a timeout, and cancel. The first one ready runs. If two are ready, Go picks at random. default does not wait.",
  svg: `<svg viewBox="0 0 960 460" role="img" aria-label="select waits on results, a timeout, and cancel. Results is ready, so that case runs. A tie is random. default does not wait.">
    <defs><marker id="dgArrSE" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <rect class="dg-box ok dg-beat" x="24" y="24" width="300" height="110" rx="16"/>
    <text class="dg-t lg" x="174" y="72" text-anchor="middle">results</text>
    <text class="dg-t lg" x="174" y="108" text-anchor="middle">this one</text>
    <rect class="dg-box" x="24" y="150" width="300" height="110" rx="16"/>
    <text class="dg-t lg" x="174" y="198" text-anchor="middle">timeout</text>
    <text class="dg-t lg" x="174" y="234" text-anchor="middle">waits</text>
    <rect class="dg-box" x="24" y="276" width="300" height="110" rx="16"/>
    <text class="dg-t lg" x="174" y="324" text-anchor="middle">cancel</text>
    <text class="dg-t lg" x="174" y="360" text-anchor="middle">waits</text>

    <path class="dg-arrow" d="M336 79 L430 190" marker-end="url(#dgArrSE)"/>
    <path class="dg-arrow" d="M336 205 L430 220" marker-end="url(#dgArrSE)"/>
    <path class="dg-arrow" d="M336 331 L430 250" marker-end="url(#dgArrSE)"/>

    <rect class="dg-box accent" x="442" y="160" width="180" height="120" rx="16"/>
    <text class="dg-t lg" x="532" y="230" text-anchor="middle">select</text>

    <path class="dg-arrow" d="M634 220 L700 220" marker-end="url(#dgArrSE)"/>
    <rect class="dg-box ok" x="712" y="160" width="224" height="120" rx="16"/>
    <text class="dg-t lg" x="824" y="212" text-anchor="middle">one case</text>
    <text class="dg-t lg" x="824" y="248" text-anchor="middle">runs</text>

    <rect class="dg-box" x="442" y="340" width="220" height="90" rx="16"/>
    <text class="dg-t lg" x="552" y="394" text-anchor="middle">tie: random</text>
    <rect class="dg-box" x="680" y="340" width="256" height="90" rx="16"/>
    <text class="dg-t lg" x="808" y="394" text-anchor="middle">default: no wait</text>
  </svg>`
},

/* ─────────────── %T and v, ok ─────────────── */
"percent-t": {
  title: "%T prints the type name",
  caption: "T means type. Printf writes the type name of the value you pass, and \\n starts a new line. 30 prints as int. Ada prints as string.",
  svg: `<svg viewBox="0 0 960 420" role="img" aria-label="Printf, percent T, backslash n, and v. Percent T prints the type. 30 prints as int. Ada prints as string.">
    <defs><marker id="dgArrPT" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <text class="dg-t lg" x="24" y="36">1. Each piece of Printf("%T\\n", v)</text>

    <rect class="dg-box" x="24" y="56" width="210" height="150" rx="16"/>
    <text class="dg-t mono lg" x="129" y="125" text-anchor="middle">Printf</text>
    <text class="dg-t lg" x="129" y="172" text-anchor="middle">the call</text>

    <rect class="dg-box accent dg-beat" x="258" y="56" width="210" height="150" rx="16"/>
    <text class="dg-t mono xl" x="363" y="130" text-anchor="middle">%T</text>
    <text class="dg-t lg" x="363" y="178" text-anchor="middle">means type</text>

    <rect class="dg-box" x="492" y="56" width="210" height="150" rx="16"/>
    <text class="dg-t mono xl" x="597" y="130" text-anchor="middle">\\n</text>
    <text class="dg-t lg" x="597" y="178" text-anchor="middle">new line</text>

    <rect class="dg-box" x="726" y="56" width="210" height="150" rx="16"/>
    <text class="dg-t mono xl" x="831" y="130" text-anchor="middle">v</text>
    <text class="dg-t lg" x="831" y="178" text-anchor="middle">the value</text>

    <text class="dg-t lg" x="24" y="256">2. The name that prints</text>

    <rect class="dg-box" x="24" y="276" width="190" height="110" rx="16"/>
    <text class="dg-t lg" x="119" y="318" text-anchor="middle">age</text>
    <text class="dg-t mono xl" x="119" y="362" text-anchor="middle">30</text>
    <path class="dg-arrow" d="M222 331 L268 331" marker-end="url(#dgArrPT)"/>
    <circle class="dg-run" r="7" style="offset-path: path('M222 331 L268 331')"/>
    <rect class="dg-box ok dg-beat" style="--i:1" x="276" y="276" width="190" height="110" rx="16"/>
    <text class="dg-t lg" x="371" y="318" text-anchor="middle">prints</text>
    <text class="dg-t mono xl" x="371" y="362" text-anchor="middle">int</text>

    <rect class="dg-box" x="520" y="276" width="190" height="110" rx="16"/>
    <text class="dg-t lg" x="615" y="318" text-anchor="middle">name</text>
    <text class="dg-t mono xl" x="615" y="362" text-anchor="middle">Ada</text>
    <path class="dg-arrow" d="M718 331 L764 331" marker-end="url(#dgArrPT)"/>
    <circle class="dg-run" r="7" style="offset-path: path('M718 331 L764 331'); --i:1"/>
    <rect class="dg-box ok dg-beat" style="--i:2" x="772" y="276" width="164" height="110" rx="16"/>
    <text class="dg-t lg" x="854" y="318" text-anchor="middle">prints</text>
    <text class="dg-t mono lg" x="854" y="358" text-anchor="middle">string</text>
  </svg>`
},

"comma-ok": {
  title: "v and ok",
  caption: "x is the slot. (string) is the question. v is the value when the type matches. ok is true or false, and the program keeps running either way.",
  svg: `<svg viewBox="0 0 960 560" role="img" aria-label="v, ok asks whether x holds a string. Ada and true when it does. Zero and false when the question is int.">
    <defs><marker id="dgArrOK" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <text class="dg-t lg" x="24" y="36">1. Each piece of v, ok := x.(string)</text>

    <rect class="dg-box" x="24" y="56" width="216" height="140" rx="16"/>
    <text class="dg-t mono xl" x="132" y="120" text-anchor="middle">x</text>
    <text class="dg-t lg" x="132" y="164" text-anchor="middle">the slot</text>

    <rect class="dg-box accent dg-beat" x="256" y="56" width="216" height="140" rx="16"/>
    <text class="dg-t mono lg" x="364" y="118" text-anchor="middle">(string)</text>
    <text class="dg-t lg" x="364" y="164" text-anchor="middle">the question</text>

    <rect class="dg-box" x="488" y="56" width="216" height="140" rx="16"/>
    <text class="dg-t mono xl" x="596" y="120" text-anchor="middle">v</text>
    <text class="dg-t lg" x="596" y="164" text-anchor="middle">the value</text>

    <rect class="dg-box" x="720" y="56" width="216" height="140" rx="16"/>
    <text class="dg-t mono xl" x="828" y="120" text-anchor="middle">ok</text>
    <text class="dg-t lg" x="828" y="164" text-anchor="middle">yes or no</text>

    <text class="dg-t lg" x="24" y="240">2. x holds Ada. Ask for a string.</text>
    <rect class="dg-box" x="24" y="258" width="200" height="110" rx="16"/>
    <text class="dg-t lg" x="124" y="300" text-anchor="middle">x holds</text>
    <text class="dg-t mono xl" x="124" y="344" text-anchor="middle">Ada</text>
    <path class="dg-arrow" d="M232 313 L276 313" marker-end="url(#dgArrOK)"/>
    <rect class="dg-box" x="284" y="258" width="200" height="110" rx="16"/>
    <text class="dg-t mono lg" x="384" y="322" text-anchor="middle">(string)</text>
    <path class="dg-arrow" d="M492 313 L536 313" marker-end="url(#dgArrOK)"/>
    <circle class="dg-run" r="7" style="offset-path: path('M492 313 L536 313')"/>
    <rect class="dg-box ok" x="544" y="258" width="180" height="110" rx="16"/>
    <text class="dg-t lg" x="634" y="300" text-anchor="middle">v is</text>
    <text class="dg-t mono xl" x="634" y="344" text-anchor="middle">Ada</text>
    <rect class="dg-box ok dg-beat" style="--i:1" x="740" y="258" width="196" height="110" rx="16"/>
    <text class="dg-t lg" x="838" y="300" text-anchor="middle">ok is</text>
    <text class="dg-t mono xl" x="838" y="344" text-anchor="middle">true</text>

    <text class="dg-t lg" x="24" y="412">3. Same slot. Ask for an int.</text>
    <rect class="dg-box" x="24" y="430" width="200" height="110" rx="16"/>
    <text class="dg-t lg" x="124" y="472" text-anchor="middle">x holds</text>
    <text class="dg-t mono xl" x="124" y="516" text-anchor="middle">Ada</text>
    <path class="dg-arrow" d="M232 485 L276 485" marker-end="url(#dgArrOK)"/>
    <rect class="dg-box" x="284" y="430" width="200" height="110" rx="16"/>
    <text class="dg-t mono lg" x="384" y="494" text-anchor="middle">(int)</text>
    <path class="dg-arrow" d="M492 485 L536 485" marker-end="url(#dgArrOK)"/>
    <circle class="dg-run" r="7" style="offset-path: path('M492 485 L536 485'); --i:1"/>
    <rect class="dg-box bad" x="544" y="430" width="180" height="110" rx="16"/>
    <text class="dg-t lg" x="634" y="472" text-anchor="middle">v is</text>
    <text class="dg-t mono xl" x="634" y="516" text-anchor="middle">0</text>
    <rect class="dg-box bad" x="740" y="430" width="196" height="110" rx="16"/>
    <text class="dg-t lg" x="838" y="472" text-anchor="middle">ok is</text>
    <text class="dg-t mono xl" x="838" y="516" text-anchor="middle">false</text>
  </svg>`
},

"rune-list": {
  title: "[]rune(s) is the characters",
  caption: "s is the string. []rune means a list of characters. (s) converts the string into that list. Counting starts at 0, so chars[1] is é.",
  svg: `<svg viewBox="0 0 960 440" role="img" aria-label="[]rune converts the string s into a list of characters. Index 1 of Héllo is é.">
    <defs><marker id="dgArrRN" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <text class="dg-t lg" x="24" y="36">1. Each piece of []rune(s)</text>

    <rect class="dg-box" x="24" y="56" width="250" height="150" rx="16"/>
    <text class="dg-t mono xl" x="149" y="120" text-anchor="middle">s</text>
    <text class="dg-t lg" x="149" y="168" text-anchor="middle">the string</text>
    <path class="dg-arrow" d="M282 131 L348 131" marker-end="url(#dgArrRN)"/>

    <rect class="dg-box accent dg-beat" x="356" y="56" width="250" height="150" rx="16"/>
    <text class="dg-t mono lg" x="481" y="118" text-anchor="middle">[]rune</text>
    <text class="dg-t lg" x="481" y="168" text-anchor="middle">list of characters</text>
    <path class="dg-arrow" d="M614 131 L680 131" marker-end="url(#dgArrRN)"/>
    <circle class="dg-run" r="7" style="offset-path: path('M614 131 L680 131')"/>

    <rect class="dg-box" x="688" y="56" width="248" height="150" rx="16"/>
    <text class="dg-t mono xl" x="812" y="120" text-anchor="middle">(s)</text>
    <text class="dg-t lg" x="812" y="168" text-anchor="middle">convert s</text>

    <text class="dg-t lg" x="24" y="252">2. chars, five characters. [1] is é.</text>
    <rect class="dg-box" x="40" y="272" width="160" height="140" rx="16"/>
    <text class="dg-t mono xl" x="120" y="340" text-anchor="middle">H</text>
    <text class="dg-t lg" x="120" y="384" text-anchor="middle">[0]</text>
    <rect class="dg-box ok dg-beat" style="--i:1" x="220" y="272" width="160" height="140" rx="16"/>
    <text class="dg-t mono xl" x="300" y="340" text-anchor="middle">é</text>
    <text class="dg-t lg" x="300" y="384" text-anchor="middle">[1]</text>
    <rect class="dg-box" x="400" y="272" width="160" height="140" rx="16"/>
    <text class="dg-t mono xl" x="480" y="340" text-anchor="middle">l</text>
    <text class="dg-t lg" x="480" y="384" text-anchor="middle">[2]</text>
    <rect class="dg-box" x="580" y="272" width="160" height="140" rx="16"/>
    <text class="dg-t mono xl" x="660" y="340" text-anchor="middle">l</text>
    <text class="dg-t lg" x="660" y="384" text-anchor="middle">[3]</text>
    <rect class="dg-box" x="760" y="272" width="160" height="140" rx="16"/>
    <text class="dg-t mono xl" x="840" y="340" text-anchor="middle">o</text>
    <text class="dg-t lg" x="840" y="384" text-anchor="middle">[4]</text>
  </svg>`
},

/* ─────────────── fmt ─────────────── */
"fmt-where": {
  title: "Where it goes, and how it is shaped",
  caption: "Print writes to the terminal. Sprint builds a string. Fprint writes to a writer you pass in. Println separates the values. Printf follows the format string.",
  svg: `<svg viewBox="0 0 960 440" role="img" aria-label="Print goes to the terminal, Sprint builds a string, Fprint writes to a writer. Println separates values. Printf follows the format.">
    <text class="dg-t lg" x="24" y="36">1. The first letters say where the text goes</text>
    <rect class="dg-box accent dg-beat" x="24" y="56" width="288" height="140" rx="16"/>
    <text class="dg-t mono lg" x="168" y="118" text-anchor="middle">Print</text>
    <text class="dg-t lg" x="168" y="162" text-anchor="middle">the terminal</text>
    <rect class="dg-box" x="336" y="56" width="288" height="140" rx="16"/>
    <text class="dg-t mono lg" x="480" y="118" text-anchor="middle">Sprint</text>
    <text class="dg-t lg" x="480" y="162" text-anchor="middle">a string you keep</text>
    <rect class="dg-box" x="648" y="56" width="288" height="140" rx="16"/>
    <text class="dg-t mono lg" x="792" y="118" text-anchor="middle">Fprint</text>
    <text class="dg-t lg" x="792" y="162" text-anchor="middle">a writer you pass</text>

    <text class="dg-t lg" x="24" y="244">2. The ending says how the same values look</text>
    <rect class="dg-box" x="24" y="264" width="288" height="140" rx="16"/>
    <text class="dg-t mono lg" x="168" y="322" text-anchor="middle">Print</text>
    <text class="dg-t mono xl" x="168" y="370" text-anchor="middle">ab1 2</text>
    <rect class="dg-box ok dg-beat" style="--i:1" x="336" y="264" width="288" height="140" rx="16"/>
    <text class="dg-t mono lg" x="480" y="322" text-anchor="middle">Println</text>
    <text class="dg-t mono lg" x="480" y="370" text-anchor="middle">a b 1 2</text>
    <rect class="dg-box" x="648" y="264" width="288" height="140" rx="16"/>
    <text class="dg-t mono lg" x="792" y="322" text-anchor="middle">Printf</text>
    <text class="dg-t mono lg" x="792" y="370" text-anchor="middle">a has 1</text>
  </svg>`
},

"fmt-printf": {
  title: "Printf fills the verbs in order",
  caption: "%s is a string. %d is a whole number. \\n starts a new line. Ada fills %s, and 2 fills %d.",
  svg: `<svg viewBox="0 0 960 400" role="img" aria-label="Printf, percent s, percent d, and backslash n. Ada fills the string verb. 2 fills the number verb. The line prints Ada has 2.">
    <defs><marker id="dgArrPF" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>
    <text class="dg-t lg" x="24" y="36">1. Each piece of the call</text>
    <rect class="dg-box" x="24" y="56" width="210" height="140" rx="16"/>
    <text class="dg-t mono lg" x="129" y="120" text-anchor="middle">Printf</text>
    <text class="dg-t lg" x="129" y="164" text-anchor="middle">the call</text>
    <rect class="dg-box accent dg-beat" x="258" y="56" width="210" height="140" rx="16"/>
    <text class="dg-t mono xl" x="363" y="120" text-anchor="middle">%s</text>
    <text class="dg-t lg" x="363" y="164" text-anchor="middle">a string</text>
    <rect class="dg-box accent dg-beat" style="--i:1" x="492" y="56" width="210" height="140" rx="16"/>
    <text class="dg-t mono xl" x="597" y="120" text-anchor="middle">%d</text>
    <text class="dg-t lg" x="597" y="164" text-anchor="middle">a number</text>
    <rect class="dg-box" x="726" y="56" width="210" height="140" rx="16"/>
    <text class="dg-t mono xl" x="831" y="120" text-anchor="middle">\\n</text>
    <text class="dg-t lg" x="831" y="164" text-anchor="middle">new line</text>

    <text class="dg-t lg" x="24" y="244">2. Values fill those verbs, left to right</text>
    <rect class="dg-box" x="24" y="264" width="200" height="110" rx="16"/>
    <text class="dg-t mono xl" x="124" y="332" text-anchor="middle">Ada</text>
    <path class="dg-arrow" d="M232 319 L300 319" marker-end="url(#dgArrPF)"/>
    <circle class="dg-run" r="7" style="offset-path: path('M232 319 L300 319')"/>
    <rect class="dg-box" x="308" y="264" width="160" height="110" rx="16"/>
    <text class="dg-t mono xl" x="388" y="332" text-anchor="middle">2</text>
    <path class="dg-arrow" d="M476 319 L544 319" marker-end="url(#dgArrPF)"/>
    <circle class="dg-run" r="7" style="offset-path: path('M476 319 L544 319'); --i:1"/>
    <rect class="dg-box ok dg-beat" style="--i:2" x="552" y="264" width="384" height="110" rx="16"/>
    <text class="dg-t lg" x="744" y="306" text-anchor="middle">prints</text>
    <text class="dg-t mono lg" x="744" y="348" text-anchor="middle">Ada has 2</text>
  </svg>`
},

"fmt-struct": {
  title: "Three ways to print a struct",
  caption: "%v prints the values. %+v adds the field names. %#v prints Go syntax.",
  svg: `<svg viewBox="0 0 960 440" role="img" aria-label="Percent v prints Ada and 30. Percent plus v adds the field names. Percent hash v prints Go syntax.">
    <rect class="dg-box" x="24" y="24" width="180" height="100" rx="16"/>
    <text class="dg-t mono xl" x="114" y="86" text-anchor="middle">%v</text>
    <text class="dg-t lg" x="230" y="58">values only</text>
    <rect class="dg-box" x="230" y="72" width="706" height="52" rx="14"/>
    <text class="dg-t mono lg" x="250" y="106">{Ada 30}</text>

    <rect class="dg-box accent dg-beat" x="24" y="148" width="180" height="100" rx="16"/>
    <text class="dg-t mono xl" x="114" y="210" text-anchor="middle">%+v</text>
    <text class="dg-t lg" x="230" y="182">with the field names</text>
    <rect class="dg-box ok" x="230" y="196" width="706" height="52" rx="14"/>
    <text class="dg-t mono lg" x="250" y="230">{Name:Ada Age:30}</text>

    <rect class="dg-box" x="24" y="272" width="180" height="140" rx="16"/>
    <text class="dg-t mono xl" x="114" y="354" text-anchor="middle">%#v</text>
    <text class="dg-t lg" x="230" y="306">Go syntax</text>
    <rect class="dg-box" x="230" y="320" width="706" height="92" rx="14"/>
    <text class="dg-t mono lg" x="250" y="360">main.User{</text>
    <text class="dg-t mono lg" x="250" y="394">Name:&quot;Ada&quot;, Age:30}</text>
  </svg>`
}

};
