const fs = require("fs");
const path = "resources/data/diagrams.js";
let src = fs.readFileSync(path, "utf8");

function setDiagram(key, title, caption, svg) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    "(" + escaped + ": \\{\\n  title: )\"(?:\\\\.|[^\"\\\\])*\"(,\\n  caption: )\"(?:\\\\.|[^\"\\\\])*\"(,\\n  svg: `)[\\s\\S]*?(`\\n\\})"
  );
  if (!re.test(src)) throw new Error("not found: " + key);
  src = src.replace(re, (_, a, b, c, d) => a + JSON.stringify(title) + b + JSON.stringify(caption) + c + svg + d);
}

const head = (id) =>
  `<defs><marker id="${id}" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path class="dg-head" d="M0,0 L10,5 L0,10 z"/></marker></defs>`;

setDiagram(
  "pipeline",
  "Source becomes one file",
  "Go compiles ahead of time. Your code, the packages you import, and the runtime link into one file.",
  `<svg viewBox="0 0 960 440" role="img" aria-label="Source is parsed, type-checked, tidied, and turned into CPU code, then linked with imports and the runtime into one file">
    ${head("dgArrP")}
    <text class="dg-t lg" x="24" y="40">1. The program changes shape</text>
    <rect class="dg-box" x="24" y="60" width="152" height="156" rx="16"/>
    <text class="dg-t xl" x="100" y="132" text-anchor="middle">1</text>
    <text class="dg-t lg" x="100" y="184" text-anchor="middle">source</text>
    <path class="dg-arrow" d="M184 138 L204 138" marker-end="url(#dgArrP)"/>
    <rect class="dg-box" x="212" y="60" width="152" height="156" rx="16"/>
    <text class="dg-t xl" x="288" y="132" text-anchor="middle">2</text>
    <text class="dg-t lg" x="288" y="184" text-anchor="middle">parse</text>
    <path class="dg-arrow" d="M372 138 L392 138" marker-end="url(#dgArrP)"/>
    <rect class="dg-box" x="400" y="60" width="152" height="156" rx="16"/>
    <text class="dg-t xl" x="476" y="132" text-anchor="middle">3</text>
    <text class="dg-t lg" x="476" y="184" text-anchor="middle">types</text>
    <path class="dg-arrow" d="M560 138 L580 138" marker-end="url(#dgArrP)"/>
    <rect class="dg-box" x="588" y="60" width="152" height="156" rx="16"/>
    <text class="dg-t xl" x="664" y="132" text-anchor="middle">4</text>
    <text class="dg-t lg" x="664" y="184" text-anchor="middle">tidy</text>
    <path class="dg-arrow" d="M748 138 L768 138" marker-end="url(#dgArrP)"/>
    <rect class="dg-box accent dg-beat" x="776" y="60" width="152" height="156" rx="16"/>
    <text class="dg-t xl" x="852" y="132" text-anchor="middle">5</text>
    <text class="dg-t lg" x="852" y="184" text-anchor="middle">CPU</text>
    <text class="dg-t lg" x="24" y="268">2. Three pieces, one file</text>
    <rect class="dg-box accent" x="24" y="288" width="190" height="120" rx="16"/>
    <text class="dg-t lg" x="119" y="356" text-anchor="middle">your code</text>
    <text class="dg-t xl" x="236" y="360" text-anchor="middle">+</text>
    <rect class="dg-box" x="258" y="288" width="170" height="120" rx="16"/>
    <text class="dg-t lg" x="343" y="356" text-anchor="middle">imports</text>
    <text class="dg-t xl" x="450" y="360" text-anchor="middle">+</text>
    <rect class="dg-box" x="472" y="288" width="180" height="120" rx="16"/>
    <text class="dg-t lg" x="562" y="356" text-anchor="middle">runtime</text>
    <path class="dg-arrow" d="M668 348 L748 348" marker-end="url(#dgArrP)"/>
    <rect class="dg-box ok dg-beat" x="756" y="288" width="180" height="120" rx="16"/>
    <text class="dg-t mono lg" x="846" y="340" text-anchor="middle">./app</text>
    <text class="dg-t lg" x="846" y="376" text-anchor="middle">one file</text>
  </svg>`
);

setDiagram(
  '"exec-models"',
  "Three ways to run",
  "Go is compiled. The program is machine code before it starts, so the first run is already fast.",
  `<svg viewBox="0 0 960 660" role="img" aria-label="Compiled Go goes from source to machine code to the CPU. An interpreter re-reads source. A JIT starts slow, then compiles hot code.">
    ${head("dgArrE")}
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
);

setDiagram(
  '"string-runes"',
  "Bytes, then runes",
  "Héllo is 6 bytes and 5 runes. é is the two bytes C3 and A9, so range jumps from index 1 to index 3.",
  `<svg viewBox="0 0 960 500" role="img" aria-label="The string Héllo is six bytes. The two bytes of é are one rune, so ranging visits five runes at indexes 0, 1, 3, 4 and 5.">
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
);

setDiagram(
  '"slice-header"',
  "Same array, or a new one",
  "While length is under capacity, append writes into the same array. When it is full, append copies into a new array. Keep the slice append returns.",
  `<svg viewBox="0 0 960 520" role="img" aria-label="Append writes 4 into the spare slot of an array with room. When the array is full, append copies 1 2 3 4 into a new array and adds 5.">
    ${head("dgArrSL")}
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
    <text class="dg-t lg" x="820" y="458" text-anchor="middle">s = append</text>
  </svg>`
);

setDiagram(
  '"iface-value"',
  "Two words",
  "An interface holds a type and a value. It is nil only when both are empty. A nil pointer still has a type, so the interface is not nil.",
  `<svg viewBox="0 0 960 460" role="img" aria-label="An interface holding a Rect has both words set. An interface holding a nil pointer has a type, so it is not nil. Both words empty is nil.">
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
    <text class="dg-t lg" x="134" y="400" text-anchor="middle">type</text>
    <text class="dg-t lg" x="244" y="400" text-anchor="middle">empty</text>
    <text class="dg-t lg" x="354" y="400" text-anchor="middle">data empty</text>
    <text class="dg-t lg" x="718" y="400" text-anchor="middle">this is nil</text>
  </svg>`
);

setDiagram(
  "channel",
  "They meet, or they queue",
  "With no buffer, a send waits until someone receives. With room for 4, the sender waits only when all 4 slots are full.",
  `<svg viewBox="0 0 960 500" role="img" aria-label="An unbuffered send and receive wait for each other, then both continue. A buffer of 4 lets the sender continue until every slot is full.">
    ${head("dgArrCH")}
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
    <rect class="dg-box ok" x="24" y="300" width="160" height="140" rx="16"/>
    <text class="dg-t mono xl" x="104" y="384" text-anchor="middle">1</text>
    <rect class="dg-box ok" x="204" y="300" width="160" height="140" rx="16"/>
    <text class="dg-t mono xl" x="284" y="384" text-anchor="middle">2</text>
    <rect class="dg-box dashed" x="384" y="300" width="160" height="140" rx="16"/>
    <rect class="dg-box dashed" x="564" y="300" width="160" height="140" rx="16"/>
    <text class="dg-t lg" x="804" y="356">sender</text>
    <text class="dg-t lg" x="804" y="396">waits if full</text>
    <text class="dg-t lg" x="24" y="480">receiver waits if empty</text>
  </svg>`
);

setDiagram(
  "gmp",
  "G runs on M, when a P allows it",
  "P0 and P1 have goroutines. P2 has none, so it takes half of P0. Each P sits on an OS thread. GOMAXPROCS is how many Ps exist.",
  `<svg viewBox="0 0 960 500" role="img" aria-label="P0 has a queue of goroutines, P1 has one parked on a channel, and idle P2 steals half of P0. Each P runs on an OS thread.">
    ${head("dgArrGM")}
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
    <path class="dg-arrow" d="M320 200 L640 200" marker-end="url(#dgArrGM)"/>

    <rect class="dg-box" x="24" y="360" width="296" height="80" rx="16"/>
    <text class="dg-t lg" x="172" y="408" text-anchor="middle">M0, OS thread</text>
    <rect class="dg-box" x="336" y="360" width="296" height="80" rx="16"/>
    <text class="dg-t lg" x="484" y="408" text-anchor="middle">M1, OS thread</text>
    <rect class="dg-box" x="648" y="360" width="288" height="80" rx="16"/>
    <text class="dg-t lg" x="792" y="408" text-anchor="middle">M2, OS thread</text>
  </svg>`
);

setDiagram(
  "gc",
  "White, grey, black",
  "White is not checked yet. Grey is found, and its children are still to look at. Black is finished. Anything still white with no path is thrown away. A write into a black object marks the new one grey.",
  `<svg viewBox="0 0 960 560" role="img" aria-label="Roots reach A, B and C, which are finished. D and E are found but not finished. F is not checked yet. X and Y have no path and are thrown away.">
    ${head("dgArrGC")}
    <g class="dg-node white"><circle cx="48" cy="40" r="22"/></g>
    <text class="dg-t lg" x="84" y="46">white, not checked</text>
    <g class="dg-node grey"><circle cx="360" cy="40" r="22"/></g>
    <text class="dg-t lg" x="396" y="46">grey, look inside</text>
    <g class="dg-node black"><circle cx="680" cy="40" r="22"/></g>
    <text class="dg-t lg" x="716" y="46">black, finished</text>

    <rect class="dg-box accent" x="24" y="88" width="140" height="80" rx="16"/>
    <text class="dg-t lg" x="94" y="136" text-anchor="middle">roots</text>
    <path class="dg-arrow" d="M172 128 L220 128" marker-end="url(#dgArrGC)"/>

    <g class="dg-node black"><circle cx="270" cy="128" r="40"/><text class="dg-t lg" x="270" y="134" text-anchor="middle">A</text></g>
    <path class="dg-arrow" d="M310 112 L380 80" marker-end="url(#dgArrGC)"/>
    <path class="dg-arrow" d="M310 144 L380 176" marker-end="url(#dgArrGC)"/>
    <g class="dg-node black"><circle cx="430" cy="72" r="40"/><text class="dg-t lg" x="430" y="78" text-anchor="middle">B</text></g>
    <g class="dg-node black"><circle cx="430" cy="184" r="40"/><text class="dg-t lg" x="430" y="190" text-anchor="middle">C</text></g>
    <path class="dg-arrow" d="M470 72 L540 72" marker-end="url(#dgArrGC)"/>
    <path class="dg-arrow" d="M470 184 L540 184" marker-end="url(#dgArrGC)"/>
    <g class="dg-node grey"><circle cx="590" cy="72" r="40"/><text class="dg-t lg" x="590" y="78" text-anchor="middle">D</text></g>
    <g class="dg-node grey"><circle cx="590" cy="184" r="40"/><text class="dg-t lg" x="590" y="190" text-anchor="middle">E</text></g>
    <path class="dg-arrow" d="M630 184 L700 220" marker-end="url(#dgArrGC)"/>
    <g class="dg-node white"><circle cx="750" cy="236" r="40"/><text class="dg-t lg" x="750" y="242" text-anchor="middle">F</text></g>

    <g class="dg-node white"><circle cx="860" cy="100" r="36"/><text class="dg-t lg" x="860" y="106" text-anchor="middle">X</text></g>
    <g class="dg-node white"><circle cx="860" cy="190" r="36"/><text class="dg-t lg" x="860" y="196" text-anchor="middle">Y</text></g>
    <text class="dg-t lg" x="860" y="260" text-anchor="middle">no path</text>

    <text class="dg-t lg" x="24" y="340">Write barrier</text>
    <rect class="dg-box" x="24" y="360" width="280" height="150" rx="16"/>
    <text class="dg-t lg" x="164" y="424" text-anchor="middle">black A</text>
    <text class="dg-t lg" x="164" y="468" text-anchor="middle">stores F</text>
    <path class="dg-arrow" d="M320 435 L400 435" marker-end="url(#dgArrGC)"/>
    <text class="dg-t lg" x="360" y="416" text-anchor="middle">marks</text>
    <rect class="dg-box ok dg-beat" x="412" y="360" width="280" height="150" rx="16"/>
    <text class="dg-t lg" x="552" y="424" text-anchor="middle">F turns grey</text>
    <text class="dg-t lg" x="552" y="468" text-anchor="middle">kept</text>
  </svg>`
);

setDiagram(
  '"module-or-file"',
  "One file, or a module",
  "A single file that only uses the standard library can run on its own. Anything else starts with go mod init.",
  `<svg viewBox="0 0 960 360" role="img" aria-label="One standard-library file uses go run scratch.go. Anything else uses go mod init example/hello-world.">
    ${head("dgArrMF")}
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
);

setDiagram(
  "middleware",
  "In on the way, out on the way back",
  "The request walks request id, recover, metrics, limit, auth, then your handler. The response walks back out through the same layers.",
  `<svg viewBox="0 0 960 340" role="img" aria-label="A request passes through request id, recover, metrics, limit and auth before the handler. The response returns through the same layers.">
    ${head("dgArrMW")}
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
);

setDiagram(
  '"func-returns"',
  "A number and an error",
  "divide(10, 2) gives 5 and nil, so you use 5. divide(10, 0) gives 0 and an error, so you stop. A map, a type check, and a channel use the same pair.",
  `<svg viewBox="0 0 960 520" role="img" aria-label="divide of 10 and 2 returns 5 and nil. divide of 10 and 0 returns 0 and an error. Map, type, and channel reads use the same two-result shape.">
    ${head("dgArrFR")}
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
);

setDiagram(
  "closure",
  "Same count, then a new one",
  "c() keeps adding to the same count, so three calls give 1, then 2, then 3. c2 is a second call to counter, so it has its own count and starts again at 1.",
  `<svg viewBox="0 0 960 400" role="img" aria-label="Three calls to c return 1, then 2, then 3 from one count. c2 has its own count and returns 1.">
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
);

setDiagram(
  '"worker-pool"',
  "Jobs in, results out",
  "Workers pull from one jobs queue. They send to one results queue. Close jobs, wait until the workers finish, then close results.",
  `<svg viewBox="0 0 960 480" role="img" aria-label="Jobs 7 and 8 wait in a queue for three workers. Results 3 and 4 go to a collector. Shutdown closes jobs, waits, then closes results.">
    ${head("dgArrWP")}
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
);

setDiagram(
  "select",
  "One case runs",
  "select waits on results, a timeout, and cancel. The first one ready runs. If two are ready, Go picks at random. default does not wait.",
  `<svg viewBox="0 0 960 460" role="img" aria-label="select waits on results, a timeout, and cancel. Results is ready, so that case runs. A tie is random. default does not wait.">
    ${head("dgArrSE")}
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
);

fs.writeFileSync(path, src);
console.log("updated", (src.match(/dg-t sm/g) || []).length, "sm labels left");
