/* ──────────────────────────────────────────────────────────────
   Feature flags.

   Flip a value to true/false and reload — nothing else to change.
   Anything gated by a flag disappears completely when it is off: its
   nav entry, buttons, routes, footer links, and the sentences in the
   About / How to use / Privacy pages that describe it.

   A flag can also be overridden per session without editing this file:
     http://localhost:8000/?ff=playground        -> force ON
     http://localhost:8000/?ff=-playground       -> force OFF
   (comma-separate several: ?ff=playground,-foo)
   ────────────────────────────────────────────────────────────── */
window.FLAGS = {

  /* "▶ Run" buttons on code blocks, the #/playground index page, and every
     mention of them. Off: the course reads as pure reference material and
     never points at an external service. */
  playground: false

};
