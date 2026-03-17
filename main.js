var Ct = Object.create;
var ot = Object.defineProperty;
var St = Object.getOwnPropertyDescriptor;
var Ft = Object.getOwnPropertyNames;
var At = Object.getPrototypeOf,
  Et = Object.prototype.hasOwnProperty;
var Ot = (c, t, o, f) => {
  if ((t && typeof t == "object") || typeof t == "function")
    for (let g of Ft(t))
      !Et.call(c, g) &&
        g !== o &&
        ot(c, g, {
          get: () => t[g],
          enumerable: !(f = St(t, g)) || f.enumerable,
        });
  return c;
};
var be = (c, t, o) => (
  (o = c != null ? Ct(At(c)) : {}),
  Ot(
    t || !c || !c.__esModule
      ? ot(o, "default", { value: c, enumerable: !0 })
      : o,
    c,
  )
);
var pt = require("child_process"),
  b = be(require("fs")),
  Ee = require("net"),
  ee = be(require("os")),
  x = be(require("path")),
  gt = require("url"),
  mt = require("util");
function lt(c) {
  if (!c || typeof c != "string") return null;
  let t = !0,
    o = c.split(".").map((f) => {
      let g = parseInt(f);
      return (isNaN(g) && (t = !1), g);
    });
  return t ? o : null;
}
function vt(c, t) {
  let o = Math.min(c.length, t.length);
  for (let f = 0; f < o; f++) {
    if (c[f] < t[f]) return !0;
    if (c[f] > t[f]) return !1;
  }
  return c.length < t.length ? !0 : (c.length > t.length, !1);
}
function at(c, t) {
  let o = lt(c),
    f = lt(t);
  return f ? (o ? vt(o, f) : !0) : !1;
}
var s = require("electron");
var we = class {
  constructor() {
    ((this.rawRules = []), (this.rules = []));
  }
  addList(t) {
    for (let o of t.split(`
`))
      this.add(o);
  }
  add(t) {
    if (
      (this.rawRules.push(t),
      (t = t.trim()),
      (t = t.replace(/[\r\n]/g, "")),
      t.length <= 3 || t[0] === "!")
    )
      return;
    let o = {
      hasStart: !1,
      hasEnd: !1,
      rule: t,
      text: t,
      domain: !1,
      items: [],
    };
    if (t.indexOf("##") >= 0) return;
    if (t.indexOf("@@") === 0) return;
    if (t[0] === "|" && t[1] === "|") {
      o.domain = !0;
      let C = t.slice(2);
      o.text = ct(C);
    } else
      t[0] === "|"
        ? ((o.hasStart = !0), (o.text = t.slice(1)))
        : t[t.length - 1] === "|" &&
          ((o.hasEnd = !0), (o.text = t.slice(0, -1)));
    let f = o.text.lastIndexOf("$");
    if (f >= 0) {
      o.text = o.text.slice(0, f);
      return;
    }
    if (
      (o.text[0] === "/" && o.text[o.text.length - 1] === "/") ||
      o.text.length <= 3
    )
      return;
    let g = o.text.split(/\*+/).filter(function (C) {
      return C;
    });
    for (let C = 0; C < g.length; C++) {
      let A = g[C],
        P = A.split("^");
      if (P.length > 0)
        for (let B = 0; B < P.length; B++) {
          let V = P[B];
          if (V === "") continue;
          let E = P[B - 1],
            T = P[B + 1];
          o.items.push({ text: V, before: E !== void 0, after: T !== void 0 });
        }
      else o.items.push({ text: A, before: !1, after: !1 });
    }
    this.rules.push(o);
  }
  clearRules() {
    ((this.rules = []), (this.rawRules = []));
  }
  matches(t) {
    let o = {};
    for (let f = 0; f < this.rules.length; f++) {
      let g = this.rules[f];
      if (Pt(g, t, o)) return !0;
    }
    return !1;
  }
};
function Pt(c, t, o) {
  let f = c.items;
  c.domain &&
    (o.domainUrl ? (t = o.domainUrl) : ((t = ct(t)), (o.domainUrl = t)));
  let g = -1;
  for (let C = 0; C < f.length; C++) {
    let A = f[C],
      P = t.indexOf(A.text, g + 1);
    if (P <= g || ((g = P), c.hasStart && C === 0 && P !== 0)) return !1;
    if (c.hasEnd && C === f.length - 1) {
      let B = t.length - A.text.length;
      if (P !== B) return !1;
    }
    if (A.before && !ut(t[g - 1])) return !1;
    if (A.after) {
      let B = g + A.text.length;
      if (t[B] !== void 0 && !ut(t[B])) return !1;
    }
  }
  return !0;
}
function ut(c) {
  return c === "/" || c === ":" || c === "?" || c === "=" || c === "&";
}
function ct(c) {
  return (
    c.indexOf("https://") === 0 && (c = c.slice(8)),
    c.indexOf("http://") === 0 && (c = c.slice(7)),
    c.indexOf("www.") === 0 && (c = c.slice(4)),
    c
  );
}
var U = be(require("os")),
  v = {
    reset: "\x1B[0m",
    bold: "\x1B[1m",
    faint: "\x1B[2m",
    muted: "\x1B[38;5;102m",
    green: "\x1B[32m",
    yellow: "\x1B[33m",
    blue: "\x1B[34m",
    purple: "\x1B[38;5;135m",
    cyan: "\x1B[36m",
    red: "\x1B[31m",
    clearLine: "\x1B[2K\r",
  },
  de = 10,
  Bt = 54;
function It(c) {
  return `       \u2597\u2584\u259F\u2588\u2588
       \u2584\u2588\u2588\u2588\u2588\u2588\u259B \u2588\u2584
      \u2590\u2588\u2588\u2588\u2588\u2588\u259B \u259F\u2588\u2588\u2588
      \u2590\u2588\u2588\u2588\u2588\u259B \u259F\u2588\u2588\u2588\u2588\u258C
     \u2597 \u259C\u2588\u2588\u2588\u258E\u2590\u2588\u2588\u2588\u2588\u2588\u258C
    \u2597\u2588\u2599 \u259C\u2588\u2588\u258E\u2590\u2588\u2588\u2588\u2588\u2588\u2588
   \u2597\u2588\u2588\u2588\u2599 \u259C\u2588\u2599 \u259C\u2588\u2588\u2588\u2588\u2588\u2599
  \u2597\u2588\u2588\u2588\u2588\u2588\u2599 \u2584\u2584\u2584\u2584\u2583\u2594\u2580\u2588\u2588\u2588\u2599
  \u259D\u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588\u2584 \u259C\u2588\u2598
   \u2580\u2588\u2588\u2588\u2588\u259B \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2599 \u2598
     \u2580\u2588\u259B \u259F\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u258C  Obsidian ${c}
        \u259D\u2580\u2580\u2580\u2580\u2588\u2588\u2588\u2588\u2580`;
}
function Lt(c) {
  let t = c.toString();
  return t === "\x1B[A"
    ? { name: "up" }
    : t === "\x1B[B"
      ? { name: "down" }
      : t === "\x1B[C"
        ? { name: "right" }
        : t === "\x1B[D"
          ? { name: "left" }
          : t === "\x1B[3~"
            ? { name: "delete" }
            : t === "\x1B[Z"
              ? { name: "shift-tab" }
              : t === "\r"
                ? { name: "return" }
                : t === "	"
                  ? { name: "tab" }
                  : t === "\x7F" || t === "\b"
                    ? { name: "backspace" }
                    : t === ""
                      ? { name: "a", ctrl: !0 }
                      : t === ""
                        ? { name: "b", ctrl: !0 }
                        : t === ""
                          ? { name: "c", ctrl: !0 }
                          : t === ""
                            ? { name: "d", ctrl: !0 }
                            : t === ""
                              ? { name: "e", ctrl: !0 }
                              : t === ""
                                ? { name: "f", ctrl: !0 }
                                : t === "\v"
                                  ? { name: "k", ctrl: !0 }
                                  : t === "\f"
                                    ? { name: "l", ctrl: !0 }
                                    : t === ""
                                      ? { name: "n", ctrl: !0 }
                                      : t === ""
                                        ? { name: "p", ctrl: !0 }
                                        : t === ""
                                          ? { name: "r", ctrl: !0 }
                                          : t === ""
                                            ? { name: "u", ctrl: !0 }
                                            : t === ""
                                              ? { name: "w", ctrl: !0 }
                                              : t === "\x1Bb"
                                                ? { name: "b", alt: !0 }
                                                : t === "\x1Bf"
                                                  ? { name: "f", alt: !0 }
                                                  : t === "\x1B\x7F" ||
                                                      t === "\x1B\b"
                                                    ? {
                                                        name: "backspace",
                                                        alt: !0,
                                                      }
                                                    : t === "\x1B" ||
                                                        t === "\x1B\x1B" ||
                                                        t === "\x1B["
                                                      ? { name: "escape" }
                                                      : { name: t };
}
function Tt(c) {
  let t = [],
    o = "",
    f = null,
    g = !1;
  for (let C of c) {
    if (g) {
      ((o += C), (g = !1));
      continue;
    }
    if (C === "\\") {
      g = !0;
      continue;
    }
    if (f) {
      C === f ? (f = null) : (o += C);
      continue;
    }
    if (C === '"' || C === "'") {
      f = C;
      continue;
    }
    if (C === " " || C === "	") {
      o && (t.push(o), (o = ""));
      continue;
    }
    o += C;
  }
  return (o && t.push(o), t);
}
function Mt(c) {
  if (!c) return [];
  let t = [],
    o = Array.from(c.matchAll(/\[?(\w+(?:=(?:<[^>]+>)?)?)\]?/g));
  for (let f of o) {
    let g = f[1];
    g.startsWith("<") ||
      (g.includes("=") && (g = g.replace(/<[^>]+>/, "")), t.push(g));
  }
  return t;
}
var ke = class {
  constructor(t, o) {
    this.currentVaultName = "";
    this.inputBuffer = "";
    this.cursorPos = 0;
    this.history = [];
    this.historyIndex = -1;
    this.isProcessing = !1;
    this.inputBeforeAutocomplete = "";
    this.suggestions = [];
    this.suggestionIndex = -1;
    this.suggestionWindowStart = 0;
    this.suggestionLines = 0;
    this.isSearchMode = !1;
    this.searchQuery = "";
    this.searchMatchIndex = 0;
    this.searchMatches = [];
    this.inputBeforeSearch = "";
    this.getCompletions = () => [];
    this.maxCommandLen = 0;
    this.totalLines = 2 + de + 2;
    ((this.socket = t), (this.currentVaultId = o));
  }
  async initCompletions(t) {
    this.currentVaultName = t.getNameForVault(this.currentVaultId) || "";
    let o = {},
      f = [],
      g = [];
    try {
      let E = await t.executeCliRequest(this.currentVaultId, ["__completions"]);
      E && E.startsWith("{") && (o = JSON.parse(E));
    } catch (E) {}
    try {
      f = (await t.executeCliRequest(this.currentVaultId, ["vaults"]))
        .split(
          `
`,
        )
        .filter((T) => T.trim());
    } catch (E) {}
    try {
      let E = await t.executeCliRequest(this.currentVaultId, [
        "__files",
        "limit=1000",
      ]);
      E && E.startsWith("[") && (g = JSON.parse(E));
    } catch (E) {}
    let C = {},
      A = {},
      P = {},
      B = {};
    for (let [E, T] of Object.entries(o))
      if (((B[E] = T.description), T.flags)) {
        let I = [],
          W = {},
          R = {};
        for (let [J, te] of Object.entries(T.flags)) {
          let ie = te.value ? `${J}=` : J;
          (I.push(ie),
            (W[ie] = te.description),
            te.value && te.value.includes("|") && (R[J] = te.value.split("|")));
        }
        ((C[E] = I), (A[E] = W), (P[E] = R));
      } else C[E] = Mt(T.usage);
    ((B.exit = "Exit the CLI"),
      (B.quit = "Exit the CLI"),
      (B["vault:open"] = "Switch to a different vault"));
    let V = Object.keys(o).concat(["exit", "quit", "vault:open"]).sort();
    ((this.maxCommandLen = Math.max(...V.map((E) => E.length))),
      (this.getCompletions = (E) => {
        let T = E.trim(),
          I = T.split(/\s+/),
          W = E.length > 0 && E[E.length - 1] === " ",
          R = W ? "" : I[I.length - 1] || "";
        if (I.length <= 1 && !W) {
          let N = R.toLowerCase(),
            M = V.filter((j) => j.toLowerCase().startsWith(N)),
            Q =
              N.length > 0
                ? V.filter((j) => {
                    var Y;
                    return (
                      !j.toLowerCase().startsWith(N) &&
                      ((Y = B[j]) == null
                        ? void 0
                        : Y.toLowerCase().includes(N))
                    );
                  })
                : [];
          return [...M, ...Q].map((j) => ({ text: j, description: B[j] }));
        }
        let J = I[0],
          te = W ? T : I.slice(0, -1).join(" ");
        if (J === "vault:open" && I.length <= 2)
          return f
            .filter((N) => N.toLowerCase().startsWith(R.toLowerCase()))
            .map((N) => ({
              text: "vault:open " + (N.includes(" ") ? `"${N}"` : N),
              description: "Open vault",
            }));
        let ie = C[J],
          he = A[J] || {},
          pe = P[J] || {};
        if (R.includes("=")) {
          let N = R.indexOf("="),
            M = R.substring(0, N),
            Q = R.substring(N + 1).toLowerCase(),
            j = W ? T : I.slice(0, -1).join(" ");
          if (M === "file" || M === "path") {
            let Z = J.startsWith("base:") ? ".base" : null;
            return g
              .filter(
                (K) => (!Z || K.endsWith(Z)) && K.toLowerCase().includes(Q),
              )
              .slice(0, 20)
              .map((K) => {
                let ne = M === "file" && K.endsWith(".md") ? K.slice(0, -3) : K;
                return {
                  text: j + (j ? " " : "") + M + `="${ne}"`,
                  description: "",
                };
              });
          }
          if (M === "folder") {
            let Z = new Set();
            for (let K of g) {
              let ne = K.lastIndexOf("/");
              ne > 0 && Z.add(K.substring(0, ne));
            }
            return Array.from(Z)
              .filter((K) => K.toLowerCase().includes(Q))
              .slice(0, 20)
              .map((K) => ({
                text: j + (j ? " " : "") + M + `="${K}"`,
                description: "",
              }));
          }
          let Y = pe[M];
          if (Y)
            return Y.filter((Z) => Z.toLowerCase().startsWith(Q)).map((Z) => ({
              text: j + (j ? " " : "") + M + "=" + Z,
              description: he[M + "="],
            }));
        }
        if (ie && ie.length > 0) {
          let N = I.slice(1).map((M) => {
            let Q = M.indexOf("=");
            return Q >= 0 ? M.substring(0, Q + 1) : M;
          });
          return ie
            .filter((M) => {
              let Q =
                M.indexOf("=") >= 0 ? M.substring(0, M.indexOf("=") + 1) : M;
              return M.startsWith(R) && !N.includes(Q);
            })
            .map((M) => ({ text: te + " " + M, description: he[M] }));
        }
        return [];
      }));
  }
  writeWelcome(t) {
    (this.socket.write("\x1B[2J\x1B[H"),
      this.socket.write(`${U.EOL}  ${v.bold}${v.purple}${It(t)}
${v.reset}${U.EOL}`),
      this.currentVaultName &&
        this.socket.write(
          `  ${v.bold}${this.currentVaultName}${v.reset}${U.EOL}`,
        ),
      this.socket.write(
        `  ${v.faint}Tab to autocomplete, \u2191/\u2193 for history, Ctrl+C to quit${v.reset}${U.EOL}${U.EOL}`,
      ));
  }
  writeDivider() {
    this.socket.write(
      `${U.EOL}${v.clearLine}${v.faint}${"\u2500".repeat(Bt)}${v.reset}${U.EOL}`,
    );
  }
  writePrompt(t) {
    if (this.isSearchMode) {
      let o = this.searchMatches[this.searchMatchIndex] || "",
        f = o;
      if (o && this.searchQuery) {
        let g = o.toLowerCase().indexOf(this.searchQuery.toLowerCase());
        if (g >= 0) {
          let C = o.slice(0, g),
            A = o.slice(g, g + this.searchQuery.length),
            P = o.slice(g + this.searchQuery.length);
          f = `${C}${v.yellow}${A}${v.reset}${P}`;
        }
      }
      (this.socket.write(`${v.clearLine}${v.purple}>${v.reset} ${f || t}`),
        this.socket.write(
          `${U.EOL}${v.clearLine}${v.purple}search:${v.reset} ${this.searchQuery}${this.searchMatches.length === 0 && this.searchQuery ? `${v.faint} (no match)${v.reset}` : ""}`,
        ));
    } else this.socket.write(`${v.clearLine}${v.purple}>${v.reset} ${t}`);
  }
  writeSuggestions() {
    let {
      suggestions: t,
      suggestionIndex: o,
      suggestionWindowStart: f,
      maxCommandLen: g,
    } = this;
    o >= 0 &&
      (o < f
        ? (this.suggestionWindowStart = o)
        : o >= f + de && (this.suggestionWindowStart = o - de + 1));
    let C = Math.min(this.suggestionWindowStart + de, t.length),
      A = Math.max(g, ...t.map((B) => B.text.length));
    for (let B = 0; B < de; B++) {
      this.socket.write(U.EOL);
      let V = this.suggestionWindowStart + B;
      if (V < t.length) {
        let { text: E, description: T } = t[V],
          I = T ? E.padEnd(A + 2) : E,
          W = T ? `${v.faint}${T}${v.reset}` : "";
        V === o
          ? this.socket.write(`  ${v.bold}${v.purple}> ${I}${v.reset}${W}`)
          : this.socket.write(`    ${v.muted}${I}${v.reset}${W}`);
      }
      this.socket.write("\x1B[K");
    }
    let P = t.length - C;
    (this.socket.write(U.EOL),
      P > 0 && this.socket.write(`    ${v.faint}${P} more${v.reset}`),
      this.socket.write("\x1B[K"),
      this.socket.write(U.EOL + "\x1B[K"),
      (this.suggestionLines = de + 2));
  }
  writeOutput(t, o) {
    let f = o ? `${o}${t}${v.reset}` : t;
    this.socket.write(`${U.EOL}${U.EOL}${f}${U.EOL}`);
  }
  clearSuggestionDisplay() {
    if (this.suggestionLines > 0) {
      for (let t = 0; t < this.suggestionLines; t++)
        this.socket.write("\x1B[B");
      for (let t = 0; t < this.suggestionLines; t++)
        this.socket.write("\x1B[2K\x1B[A");
      this.suggestionLines = 0;
    }
  }
  reserveSpace() {
    for (let t = 0; t < this.totalLines; t++) this.socket.write(U.EOL);
    this.socket.write(`\x1B[${this.totalLines}A`);
  }
  moveCursorLeft() {
    this.socket.write("\x1B[D");
  }
  moveCursorRight() {
    this.socket.write("\x1B[C");
  }
  positionCursor() {
    let t = this.isSearchMode
        ? 8 + this.searchQuery.length
        : 2 + this.cursorPos,
      o = this.isSearchMode ? this.suggestionLines : this.suggestionLines;
    (o > 0 && this.socket.write(`\x1B[${o}A`),
      this.socket.write(`\r\x1B[${t}C`));
  }
  clearAndEnd() {
    (this.socket.write(U.EOL), this.socket.end());
  }
  prepareForOutput() {
    (this.socket.write("\x1B[A\x1B[2K\x1B[A\x1B[2K"),
      this.socket.write(U.EOL + U.EOL));
  }
  clearSuggestions() {
    (this.clearSuggestionDisplay(),
      (this.suggestions = []),
      (this.suggestionIndex = -1),
      (this.suggestionWindowStart = 0));
  }
  updateSuggestions() {
    ((this.suggestions = this.getCompletions(this.inputBuffer)),
      (this.suggestionIndex = -1),
      (this.suggestionWindowStart = 0),
      this.clearSuggestionDisplay(),
      this.writePrompt(this.inputBuffer),
      this.writeSuggestions(),
      this.positionCursor());
  }
  updateSearchMatches() {
    let t = this.searchQuery.toLowerCase();
    ((this.searchMatches = this.history.filter((o) =>
      o.toLowerCase().includes(t),
    )),
      (this.searchMatchIndex = 0));
  }
  redraw() {
    this.isSearchMode
      ? (this.socket.write("\x1B[A\x1B[2K\r"),
        this.writePrompt(this.inputBuffer),
        this.socket.write(`\r\x1B[${8 + this.searchQuery.length}C`))
      : (this.clearSuggestionDisplay(),
        this.writePrompt(this.inputBuffer),
        this.writeSuggestions(),
        this.positionCursor());
  }
  resetPrompt() {
    ((this.inputBuffer = ""),
      (this.cursorPos = 0),
      (this.historyIndex = -1),
      this.reserveSpace(),
      this.writeDivider(),
      this.updateSuggestions());
  }
  handleKeyInput(t) {
    if (t.ctrl && (t.name === "c" || t.name === "d"))
      return (
        this.clearSuggestionDisplay(),
        (this.suggestions = []),
        (this.suggestionIndex = -1),
        (this.suggestionWindowStart = 0),
        { type: "exit" }
      );
    if (t.ctrl && t.name === "l")
      return (
        this.socket.write("\x1B[2J\x1B[H"),
        this.reserveSpace(),
        this.writeDivider(),
        this.redraw(),
        { type: "continue" }
      );
    if (t.ctrl && t.name === "r")
      return (
        this.isSearchMode
          ? (this.searchMatches.length > 0 &&
              (this.searchMatchIndex =
                (this.searchMatchIndex + 1) % this.searchMatches.length),
            this.redraw())
          : ((this.isSearchMode = !0),
            (this.inputBeforeSearch = this.inputBuffer),
            (this.searchQuery = ""),
            (this.searchMatchIndex = 0),
            (this.searchMatches = this.history.slice()),
            this.clearSuggestionDisplay(),
            this.writePrompt(this.inputBuffer),
            this.socket.write(`\r\x1B[${8 + this.searchQuery.length}C`)),
        { type: "continue" }
      );
    if (this.isSearchMode) {
      if (t.name === "escape")
        return (
          (this.isSearchMode = !1),
          (this.inputBuffer = this.inputBeforeSearch),
          (this.cursorPos = this.inputBuffer.length),
          this.socket.write("\x1B[2K\x1B[A\x1B[2K\r"),
          this.updateSuggestions(),
          { type: "continue" }
        );
      if (t.name === "return") {
        this.isSearchMode = !1;
        let o = this.searchMatches[this.searchMatchIndex];
        return (
          o
            ? ((this.inputBuffer = o.endsWith(" ") ? o : o + " "),
              (this.cursorPos = this.inputBuffer.length))
            : ((this.inputBuffer = this.inputBeforeSearch),
              (this.cursorPos = this.inputBuffer.length)),
          this.socket.write("\x1B[2K\x1B[A\x1B[2K\r"),
          this.updateSuggestions(),
          { type: "continue" }
        );
      }
      return t.name === "backspace"
        ? (this.searchQuery.length > 0 &&
            ((this.searchQuery = this.searchQuery.slice(0, -1)),
            this.updateSearchMatches(),
            this.redraw()),
          { type: "continue" })
        : t.name.length === 1 && !t.ctrl
          ? ((this.searchQuery += t.name),
            this.updateSearchMatches(),
            this.redraw(),
            { type: "continue" })
          : { type: "continue" };
    }
    if (t.name === "escape")
      return (
        this.inputBeforeAutocomplete
          ? ((this.inputBuffer = this.inputBeforeAutocomplete),
            (this.cursorPos = this.inputBuffer.length),
            (this.inputBeforeAutocomplete = ""),
            this.updateSuggestions())
          : this.suggestionIndex >= 0
            ? ((this.suggestionIndex = -1), this.redraw())
            : this.inputBuffer &&
              ((this.inputBuffer = ""),
              (this.cursorPos = 0),
              (this.historyIndex = -1),
              this.updateSuggestions()),
        { type: "continue" }
      );
    if (t.name === "return") {
      if (!this.inputBuffer.trim() && this.suggestionIndex < 0)
        return { type: "continue" };
      if (this.suggestionIndex >= 0 && this.suggestions[this.suggestionIndex]) {
        let f = this.suggestions[this.suggestionIndex].text;
        if (f !== this.inputBuffer.trim() || !this.inputBuffer.endsWith(" "))
          return (
            (this.inputBeforeAutocomplete = this.inputBuffer),
            (this.inputBuffer = f.endsWith("=") ? f : f + " "),
            (this.cursorPos = this.inputBuffer.length),
            this.updateSuggestions(),
            { type: "continue" }
          );
      }
      let o = this.inputBuffer.trim();
      return (
        this.clearSuggestions(),
        this.prepareForOutput(),
        { type: "execute", command: o }
      );
    }
    if (t.name === "tab") {
      if (this.suggestions.length > 0)
        if (this.suggestionIndex < 0)
          ((this.inputBeforeAutocomplete = this.inputBuffer),
            (this.suggestionIndex = 0),
            this.redraw());
        else {
          let o = this.suggestions[this.suggestionIndex].text;
          ((this.inputBeforeAutocomplete = this.inputBuffer),
            (this.inputBuffer = o.endsWith("=") ? o : o + " "),
            (this.cursorPos = this.inputBuffer.length),
            this.updateSuggestions());
        }
      return { type: "continue" };
    }
    if (t.name === "shift-tab")
      return (
        this.suggestionIndex >= 0 &&
          (this.inputBeforeAutocomplete &&
            ((this.inputBuffer = this.inputBeforeAutocomplete),
            (this.cursorPos = this.inputBuffer.length),
            (this.inputBeforeAutocomplete = "")),
          (this.suggestionIndex = -1),
          this.updateSuggestions()),
        { type: "continue" }
      );
    if (t.name === "up" || (t.ctrl && t.name === "p"))
      return (
        this.suggestionIndex >= 0
          ? ((this.suggestionIndex =
              this.suggestionIndex <= 0
                ? this.suggestions.length - 1
                : this.suggestionIndex - 1),
            this.redraw())
          : this.history.length > 0 &&
            this.historyIndex < this.history.length - 1 &&
            (this.historyIndex++,
            (this.inputBuffer = this.history[this.historyIndex]),
            (this.cursorPos = this.inputBuffer.length),
            this.updateSuggestions()),
        { type: "continue" }
      );
    if (t.name === "down" || (t.ctrl && t.name === "n"))
      return (
        this.suggestionIndex >= 0
          ? ((this.suggestionIndex =
              (this.suggestionIndex + 1) % this.suggestions.length),
            this.redraw())
          : this.historyIndex > 0
            ? (this.historyIndex--,
              (this.inputBuffer = this.history[this.historyIndex]),
              (this.cursorPos = this.inputBuffer.length),
              this.updateSuggestions())
            : this.historyIndex === 0
              ? ((this.historyIndex = -1),
                (this.inputBuffer = ""),
                (this.cursorPos = 0),
                this.updateSuggestions())
              : this.suggestions.length > 0 &&
                ((this.inputBeforeAutocomplete = this.inputBuffer),
                (this.suggestionIndex = 0),
                this.redraw()),
        { type: "continue" }
      );
    if (t.name === "backspace")
      return (
        this.cursorPos > 0 &&
          ((this.inputBuffer =
            this.inputBuffer.slice(0, this.cursorPos - 1) +
            this.inputBuffer.slice(this.cursorPos)),
          this.cursorPos--,
          this.updateSuggestions()),
        { type: "continue" }
      );
    if (t.name === "delete")
      return (
        this.cursorPos < this.inputBuffer.length &&
          ((this.inputBuffer =
            this.inputBuffer.slice(0, this.cursorPos) +
            this.inputBuffer.slice(this.cursorPos + 1)),
          this.updateSuggestions()),
        { type: "continue" }
      );
    if (t.name === "left" || (t.ctrl && t.name === "b"))
      return (
        this.cursorPos > 0 && (this.cursorPos--, this.moveCursorLeft()),
        { type: "continue" }
      );
    if (t.name === "right" || (t.ctrl && t.name === "f")) {
      if (
        this.cursorPos === this.inputBuffer.length &&
        this.suggestions.length > 0
      ) {
        let o = this.suggestionIndex >= 0 ? this.suggestionIndex : 0,
          f = this.suggestions[o].text;
        ((this.inputBeforeAutocomplete = ""),
          (this.suggestionIndex = -1),
          (this.inputBuffer = f.endsWith("=") ? f : f + " "),
          (this.cursorPos = this.inputBuffer.length),
          this.updateSuggestions());
      } else
        this.cursorPos < this.inputBuffer.length &&
          (this.cursorPos++, this.moveCursorRight());
      return { type: "continue" };
    }
    if (t.ctrl && t.name === "a")
      return ((this.cursorPos = 0), this.redraw(), { type: "continue" });
    if (t.ctrl && t.name === "e")
      return (
        (this.cursorPos = this.inputBuffer.length),
        this.redraw(),
        { type: "continue" }
      );
    if (t.ctrl && t.name === "u")
      return (
        (this.inputBuffer = this.inputBuffer.slice(this.cursorPos)),
        (this.cursorPos = 0),
        this.updateSuggestions(),
        { type: "continue" }
      );
    if (t.ctrl && t.name === "k")
      return (
        (this.inputBuffer = this.inputBuffer.slice(0, this.cursorPos)),
        this.updateSuggestions(),
        { type: "continue" }
      );
    if ((t.ctrl && t.name === "w") || (t.alt && t.name === "backspace")) {
      if (this.cursorPos > 0) {
        let o = this.inputBuffer.slice(0, this.cursorPos),
          f = this.inputBuffer.slice(this.cursorPos),
          g = o.trimEnd(),
          C = g.lastIndexOf(" "),
          A = C >= 0 ? g.slice(0, C + 1) : "";
        ((this.inputBuffer = A + f),
          (this.cursorPos = A.length),
          this.updateSuggestions());
      }
      return { type: "continue" };
    }
    if (t.alt && t.name === "b") {
      if (this.cursorPos > 0) {
        let g = this.inputBuffer
          .slice(0, this.cursorPos)
          .trimEnd()
          .lastIndexOf(" ");
        ((this.cursorPos = g >= 0 ? g + 1 : 0), this.redraw());
      }
      return { type: "continue" };
    }
    if (t.alt && t.name === "f") {
      if (this.cursorPos < this.inputBuffer.length) {
        let f = this.inputBuffer.slice(this.cursorPos).match(/^\s*\S+/);
        (f
          ? (this.cursorPos += f[0].length)
          : (this.cursorPos = this.inputBuffer.length),
          this.redraw());
      }
      return { type: "continue" };
    }
    return !t.ctrl && !t.alt && !t.name.startsWith("\x1B")
      ? ((this.inputBuffer =
          this.inputBuffer.slice(0, this.cursorPos) +
          t.name +
          this.inputBuffer.slice(this.cursorPos)),
        (this.cursorPos += t.name.length),
        this.updateSuggestions(),
        { type: "continue" })
      : { type: "continue" };
  }
  async executeCommand(t, o) {
    var T;
    let { executeCliRequest: f, getIdForVault: g, openVaultById: C } = o;
    if (t === "exit" || t === "quit") {
      this.clearAndEnd();
      return;
    }
    this.history[0] !== t && this.history.unshift(t);
    let A = Tt(t);
    if (A[0] === "obsidian") {
      let I =
        'You are already in the Obsidian TUI. Commands can be typed directly, e.g. "help"';
      (A.length > 1 &&
        (I += `
Did you mean: ${A.slice(1).join(" ")}`),
        this.writeOutput(I, v.yellow));
      return;
    }
    if (A[0] === "vault:open") {
      if (!A[1]) {
        this.writeOutput("Missing vault name: vault:open <vault-name>", v.red);
        return;
      }
      let I = A[1],
        W = g(I);
      if (!W) {
        this.writeOutput(`Vault not found: ${I}`, v.red);
        return;
      }
      (C(W),
        (this.currentVaultId = W),
        (this.currentVaultName = I),
        this.writeOutput(`Opened vault: ${I}`));
      return;
    }
    let P = (T = A[0]) != null && T.startsWith("vault=") ? A[0] : null,
      B = P ? g(P.slice(6)) : this.currentVaultId,
      V = P ? A.slice(1) : A,
      E = await f(B, V);
    E && this.writeOutput(E);
  }
};
async function ft(c, t, o) {
  let f = new ke(c, t);
  (await f.initCompletions(o),
    f.writeWelcome(o.version),
    f.reserveSpace(),
    f.writeDivider(),
    f.updateSuggestions());
  let g = () => {
      (c.removeListener("data", P),
        c.removeListener("error", A),
        c.removeListener("close", C));
    },
    C = () => {
      g();
    },
    A = () => {
      (g(), c.destroy());
    },
    P = async (B) => {
      if (f.isProcessing) return;
      let V = Lt(B),
        E = f.handleKeyInput(V);
      if (E.type === "exit") {
        (g(), f.clearAndEnd());
        return;
      }
      if (E.type === "execute") {
        f.isProcessing = !0;
        try {
          await f.executeCommand(E.command, o);
        } catch (T) {
          f.writeOutput(
            `Error: ${T instanceof Error ? T.message : String(T)}`,
            v.red,
          );
        } finally {
          f.isProcessing = !1;
        }
        if (c.destroyed) {
          g();
          return;
        }
        f.resetPrompt();
      }
    };
  (c.on("data", P), c.on("error", A), c.on("close", C));
}
var bt = be(require("original-fs"));
function Ae(c, t) {
  return c.length <= t ? c : c.slice(0, t - 1).trim() + "\u2026";
}
var $ = process.platform === "darwin",
  G = process.platform === "win32",
  kt = process.versions.electron,
  Rt = parseInt(kt.split(".")[0]);
function le(c, t) {
  return c ? t() : [];
}
function Re(c) {
  let t = [];
  for (let o = 0; o < c; o++) t.push(((Math.random() * 16) | 0).toString(16));
  return t.join("");
}
function dt(c) {
  return typeof c == "string" && /^[\\\/]{2,}[^\\\/]+[\\\/]+[^\\\/]+/.test(c);
}
async function Vt(c) {
  try {
    let t = await b.promises.stat(c);
    if (t.isDirectory()) return !1;
    let o = x.extname(c).toLowerCase();
    if (G)
      return [
        ".exe",
        ".bat",
        ".cmd",
        ".ps1",
        ".com",
        ".msi",
        ".vbs",
        ".js",
        ".jse",
        ".wsf",
        ".wsh",
      ].includes(o);
    if (
      [
        ".sh",
        ".command",
        ".csh",
        ".ksh",
        ".bash",
        ".zsh",
        ".fish",
        ".desktop",
        ".action",
        ".workflow",
      ].includes(o)
    )
      return !0;
    if (!o && (t.mode & 73) !== 0) {
      let g = Buffer.alloc(4),
        C = await b.promises.open(c, "r");
      if (
        (await C.read(g, 0, 4, 0),
        await C.close(),
        g.toString("ascii", 0, 2) === "#!" ||
          g.toString("hex", 0, 4) === "7f454c46" ||
          g.toString("hex", 0, 4) === "cffaedfe" ||
          g.toString("hex", 0, 4) === "feedface")
      )
        return !0;
    }
    return !1;
  } catch (t) {
    return !1;
  }
}
function ht(c, t, o) {
  let { editFlags: f, misspelledWord: g, dictionarySuggestions: C } = o,
    A = o.selectionText.trim(),
    P = A.length > 0,
    B = !!o.linkURL,
    V = (I) => f[`can${I}`] && P,
    E = o.isEditable || P,
    T = [
      ...le($, () => [
        {
          label: `Look up \u201C${A.length <= 40 ? A : A.slice(0, 39).trim() + "\u2026"}\u201D`,
          visible: P && !B,
          click() {
            t.showDefinitionForSelection();
          },
        },
        { type: "separator" },
      ]),
      {
        accelerator: "CmdOrCtrl+X",
        label: "Cut",
        role: V("Cut") ? "cut" : void 0,
        enabled: V("Cut"),
        visible: o.isEditable,
      },
      {
        accelerator: "CmdOrCtrl+C",
        label: "Copy",
        role: V("Copy") ? "copy" : void 0,
        enabled: V("Copy"),
        visible: o.isEditable || P,
      },
      {
        accelerator: "CmdOrCtrl+V",
        label: "Paste",
        role: f.canPaste ? "paste" : void 0,
        enabled: f.canPaste,
        visible: o.isEditable,
      },
      {
        accelerator: "CmdOrCtrl+Shift+V",
        label: "Paste as text",
        role: f.canPaste ? "pasteAndMatchStyle" : void 0,
        enabled: f.canPaste,
        visible: o.isEditable,
      },
    ];
  if (g && g.length >= 1) {
    let I = [];
    (C && C.length > 0
      ? C.slice(0, 5).forEach((W) => {
          I.push({
            label: W,
            click: () => {
              t.replaceMisspelling(W);
            },
          });
        })
      : I.push({ label: "No suggestion", enabled: !1 }),
      I.push({
        label: "Add to Dictionary",
        click: () => {
          (t.session.addWordToSpellCheckerDictionary(g),
            t.replaceMisspelling(g));
        },
      }),
      I.push({ type: "separator" }),
      (T = I.concat(T)),
      (E = !0));
  }
  E && s.Menu.buildFromTemplate(T).popup({ window: c });
}
function oe(c, t) {
  try {
    return c();
  } catch (o) {
    return (console.log("Ignored:", o.toString()), t);
  }
}
module.exports = function (c, t, o) {
  var st;
  if (Rt < 18) {
    (s.dialog.showErrorBox(
      "Manual update required",
      "This version of Obsidian is no longer supported. Please download and install the latest version from https://obsidian.md",
    ),
      s.shell.openExternal("https://obsidian.md/download"),
      s.app.quit());
    return;
  }
  s.app.commandLine.appendSwitch("log-level", "3");
  let f = (i) => {
      let r = i.shift();
      return (
        (i = i.filter(
          (a) =>
            !a.startsWith("--") ||
            a === "--copy" ||
            a === "--help" ||
            a === "--json" ||
            a === "--md" ||
            a === "--tsv" ||
            a === "--csv",
        )),
        x.basename(r).toLowerCase().includes("electron") && i.shift(),
        i
      );
    },
    g = x.basename(process.argv0),
    C = g.toLowerCase().includes("obsidian"),
    A = f(process.argv),
    P = Re(16),
    B = !!process.stdin.isTTY && !!process.stdout.isTTY,
    V = !1;
  G &&
    (st = A[0]) != null &&
    st.startsWith("session=") &&
    ((P = A.shift().slice(8)),
    (V = !0),
    A[0] === "tty" ? ((B = !0), A.shift()) : (B = !1));
  let E = (i) => (G ? `\\\\.\\pipe\\${i}` : x.join(ee.tmpdir(), `${i}.sock`));
  if (!s.app.requestSingleInstanceLock({ session: P, tty: B })) {
    if (V) {
      process.exit(0);
      return;
    }
    at(s.app.getVersion(), "1.11.7") &&
      console.log(
        "Your Obsidian installer is out of date. Please download the latest installer which includes better CLI support: https://obsidian.md/download",
      );
    let i = E(P);
    ($ && s.app.dock.hide(),
      t.emit("disable", !0),
      t.emit("silence", !0),
      process.removeAllListeners("uncaughtException"),
      process.on("uncaughtException", function (a) {
        (console.error("Uncaught Exception", a), process.exit(1));
      }));
    let r = (0, Ee.createServer)((a) => {
      (a.setNoDelay(!0),
        B && process.stdin.setRawMode(!0),
        process.stdin.pipe(a),
        a.pipe(process.stdout),
        a.on("end", async () => {
          if (!G)
            try {
              b.unlinkSync(i);
            } catch (d) {}
          (await new Promise((d) => {
            process.stdout.writableLength > 0
              ? process.stdout.once("drain", d)
              : process.nextTick(d);
          }),
            process.exit(0));
        }),
        a.on("error", () => {
          r.close(() => process.exit(1));
        }),
        r.close());
    });
    r.listen(i);
    return;
  }
  let T = ["SharedArrayBuffer"];
  for (let i of process.argv)
    i.startsWith("--enable-features=") &&
      (T = T.concat(
        i
          .substring(18)
          .split(",")
          .map((r) => r.trim()),
      ));
  (s.app.commandLine.appendSwitch("enable-features", T.join(",")),
    process.removeAllListeners("uncaughtException"),
    process.on("uncaughtException", function (i) {
      if (
        (console.error("Uncaught Exception", i),
        i.message.includes(
          "Render frame was disposed before WebFrameMain could be accessed",
        ) || i.message.indexOf("net::ERR") !== -1)
      )
        return;
      let a =
        `Uncaught Exception:
` + (i.stack ? i.stack : `${i.name}: ${i.message}`);
      s.dialog.showErrorBox(
        "A JavaScript error occurred in the main process",
        a,
      );
    }));
  let I = "",
    W = !1;
  (t.on("update-manual-required", () => (I = "update-manual-required")),
    t.on("update-downloaded", () => (I = "update-downloaded")),
    t.on("check-start", () => (W = !0)),
    t.on("check-end", () => (W = !1)));
  let R = s.app.getPath("userData"),
    J = (() => {
      try {
        return s.app.getPath("documents");
      } catch (i) {}
      try {
        let i = x.join(s.app.getPath("home"), "Documents");
        if (i && b.existsSync(i)) return i;
      } catch (i) {}
      return R;
    })(),
    te = (() => {
      try {
        return s.app.getPath("desktop");
      } catch (i) {}
      try {
        let i = x.join(s.app.getPath("home"), "Desktop");
        if (i && b.existsSync(i)) return i;
      } catch (i) {}
      return R;
    })(),
    ie = {},
    he = new we(),
    pe = (i) => x.join(R, i + ".json");
  function N(i, r) {
    oe(() => b.writeFileSync(pe(i), JSON.stringify(r)));
  }
  function M(i) {
    return oe(() => JSON.parse(b.readFileSync(pe(i), "utf8")) || {}, {});
  }
  function Q(i) {
    oe(() => b.unlinkSync(pe(i)));
  }
  let j = null;
  async function Y() {
    let i = x.join(R, "adblock");
    b.existsSync(i) || b.mkdirSync(i);
    let r = D.hasOwnProperty("adblockFrequency") ? D.adblockFrequency : Ke,
      a = new we(),
      d = D.adblock || He;
    for (let p of d) {
      let y = x.basename(p),
        w = x.join(i, y),
        e = !0;
      try {
        let n = await b.promises.stat(w),
          l = (new Date().getTime() - n.mtime.getTime()) / 864e5;
        e = r === 0 ? !1 : l >= r;
      } catch (n) {}
      if (!e) {
        let n = x.join(i, x.basename(p)),
          l = await b.promises.readFile(n, "utf8");
        a.addList(l);
        continue;
      }
      console.log(`Retrieving newer version of ${p}`);
      try {
        let l = await (await s.net.fetch(p)).text();
        (await b.promises.writeFile(w, l), a.addList(l));
      } catch (n) {
        console.log("Failed to retrieve adblock list: " + n);
      }
    }
    ((he = a),
      j !== null && clearTimeout(j),
      r !== 0 && ((r = Math.min(r, 24)), (j = setTimeout(Y, r * 864e5))));
  }
  function Z(i) {
    try {
      return (b.accessSync(i, b.constants.R_OK | b.constants.W_OK), !0);
    } catch (r) {
      return !1;
    }
  }
  let ue = (() => {
    let i = x.join(c, "package.json");
    try {
      if (b.existsSync(i)) return JSON.parse(b.readFileSync(i, "utf8")).version;
    } catch (r) {}
    return s.app.getVersion();
  })();
  function K(i) {
    let r = i.replace(/^file:(\/\/)?/, "");
    G && r.startsWith("/") && (r = r.substring(1));
    let a = i.lastIndexOf("#"),
      d = "";
    return (
      a !== -1 && ((d = i.substring(a)), (i = i.substring(0, a))),
      (r = decodeURIComponent(r)),
      x.normalize(r) + d
    );
  }
  async function ne(i, r, a, d) {
    let p = r.match(/^([a-z][a-z0-9+\-.]*):/i),
      y = p ? p[1].toLowerCase() : "";
    if (!y || y === qe || y === "about") return;
    let w = y === "file" ? K(r) : "";
    if (
      !(w && Ye(w)) &&
      y !== "http" &&
      y !== "https" &&
      y !== "obsidian" &&
      !(D.openSchemes && D.openSchemes[y])
    ) {
      let n = await s.dialog.showMessageBox(i, {
        message:
          `This link will open an external application outside of Obsidian. Only proceed if you trust the source of this link.

Link: ` + Ae(r, 200),
        type: "warning",
        buttons: ["Open Link", "Cancel"],
        defaultId: 1,
        cancelId: 1,
        title: "Open external link?",
        checkboxLabel: "Always open " + y + ":// links",
      });
      if (n.response !== 0) return;
      y &&
        n.checkboxChecked &&
        ((D.openSchemes = D.openSchemes || {}), (D.openSchemes[y] = !0), _());
    }
    if (d !== "_external" && (y === "http" || y === "https")) {
      let n = "tab",
        l = !1;
      a === "new-window"
        ? ((n = "window"), (l = !0))
        : d === "split"
          ? ((n = "split"), (l = !0))
          : a === "background-tab"
            ? ((n = "tab"), (l = !1))
            : a === "foreground-tab" && ((n = "tab"), (l = !0));
      let h = `(() => {let e = new CustomEvent('open-url', ${JSON.stringify({ cancelable: !0, detail: { url: r, leaf: n, active: l } })}); window.dispatchEvent(e); return e.defaultPrevented;})()`;
      if (await i.webContents.executeJavaScript(h)) return;
    }
    if (y !== "file")
      return (console.log("Opening URL: " + r), s.shell.openExternal(r));
    ((dt(w) || (G && !/^[a-z]:/i.test(w))) &&
      (
        await s.dialog.showMessageBox(i, {
          message:
            `This file is located on a remote server, and may be dangerous.
Are you sure you want to open it?

Location: ` + Ae(w, 200),
          type: "warning",
          buttons: ["Open this file", "Cancel"],
          defaultId: 1,
          cancelId: 1,
          title: "Remote file warning",
        })
      ).response !== 0) ||
      ((await Vt(w)) &&
        (
          await s.dialog.showMessageBox(i, {
            message:
              `This link points to an executable file. Running it could harm your computer.

File: ` + Ae(w, 200),
            type: "warning",
            buttons: ["Run File", "Cancel"],
            defaultId: 1,
            cancelId: 1,
            title: "Run executable file?",
          })
        ).response !== 0) ||
      (console.log("Opening file: " + w), Ve(w));
  }
  function Ve(i) {
    !G && !$
      ? s.shell.openExternal((0, gt.pathToFileURL)(i).href)
      : s.shell.openPath(i);
  }
  function We(i) {
    if (s.remote)
      try {
        s.remote.enable(i);
      } catch (r) {
        console.error(r);
      }
  }
  function $e(i, r) {
    let a = i.webContents;
    (Ue(a),
      We(a),
      a.on("will-navigate", (y, w) => {
        w.indexOf(_e) !== 0 &&
          (y.preventDefault(), w.indexOf(se) !== 0 && ne(i, w));
      }),
      i.on("app-command", (y, w) => {
        w === "browser-backward"
          ? a.executeJavaScript("history.back()")
          : w === "browser-forward" && a.executeJavaScript("history.forward()");
      }),
      i.on("swipe", (y, w) => {
        w === "left"
          ? a.executeJavaScript("history.back()")
          : w === "right" && a.executeJavaScript("history.forward()");
      }),
      i.on("focus", () => {
        ((i.focusTime = Date.now()),
          Ce(),
          Te(me(i), "window-always-on-top", {
            checked: i.isAlwaysOnTop(),
            enabled: !r,
          }));
      }),
      i.on("always-on-top-changed", () => {
        i === s.BrowserWindow.getFocusedWindow() &&
          Te(me(i), "window-always-on-top", { checked: i.isAlwaysOnTop() });
      }),
      i.on("maximize", () => {
        i.isAlwaysOnTop() && i.setAlwaysOnTop(!1);
      }),
      i.on("enter-full-screen", () => {
        i.isAlwaysOnTop() && i.setAlwaysOnTop(!1);
      }));
    let d = () =>
      i.webContents.executeJavaScript(
        "window.dispatchEvent(new Event('focuschange'));",
      );
    (i.on("focus", d), i.on("blur", d));
    let p = () =>
      a.executeJavaScript(
        "window.dispatchEvent(new Event('fullscreenchange'));",
      );
    (i.on("enter-full-screen", p), i.on("leave-full-screen", p));
  }
  function Ue(i) {
    if (i.isSecured) return;
    ((i.isSecured = !0),
      i.setWindowOpenHandler((a) => {
        if (
          a.url === "about:blank" &&
          a.features &&
          a.features.startsWith("popup")
        ) {
          let d = a.features.split(","),
            p = {},
            y = "";
          for (let w of d) {
            let [e, n] = w.split("=");
            ((e === "x" || e === "y" || e === "width" || e === "height") &&
              (p[e] = parseInt(n)),
              e === "background" && (y = n));
          }
          return {
            action: "allow",
            overrideBrowserWindowOptions: {
              trafficLightPosition: { x: 19, y: 12 },
              autoHideMenuBar: !0,
              frame: ye,
              titleBarStyle: Pe,
              ...Ne(p),
              webPreferences: {
                contextIsolation: !1,
                nodeIntegration: !0,
                nodeIntegrationInWorker: !0,
                spellcheck: !0,
                webviewTag: !0,
                affinity: "main-window",
              },
              show: !1,
              backgroundColor: y,
            },
          };
        }
        try {
          let { url: d, disposition: p, frameName: y } = a;
          ne(s.BrowserWindow.fromWebContents(i), d, p, y);
        } catch (d) {
          console.error(d);
        }
        return { action: "deny" };
      }),
      i.on("will-attach-webview", (a, d) => {
        (delete d.preload,
          delete d.preloadURL,
          (d.sandbox = !0),
          (d.nodeIntegration = !1),
          (d.nodeIntegrationInWorker = !1),
          (d.nodeIntegrationInSubFrames = !1),
          (d.webSecurity = !0),
          (d.plugins = !1),
          (d.experimentalFeatures = !1),
          (d.webviewTag = !1));
      }));
    let r = !0;
    i.on("did-attach-webview", (a, d) => {
      (d.setWindowOpenHandler((p) => {
        let { url: y, disposition: w, frameName: e } = p;
        if (w === "foreground-tab") {
          if (!r) return { action: "deny" };
          r = !1;
        }
        if (/^https?:\/\//.test(y))
          try {
            ne(s.BrowserWindow.fromWebContents(d), y, w, e);
          } catch (n) {
            console.error(n);
          }
        return { action: "deny" };
      }),
        d.on("will-navigate", (p, y) => {
          /^https?:\/\//.test(y) || p.preventDefault();
        }),
        d.on("will-frame-navigate", (p) => {
          /^https?:\/\//.test(p.url) || p.preventDefault();
        }),
        d.on("will-attach-webview", (p) => {
          p.preventDefault();
        }),
        d.on("did-navigate", () => {
          r = !0;
        }));
    });
  }
  function Ne(i) {
    let r = { width: 800, height: 600 };
    oe(() => {
      let d = s.screen.getPrimaryDisplay().workArea;
      ((r.width = Math.min(1024, d.width)),
        (r.height = Math.min(800, d.height - 1)));
    });
    let a = !1;
    if (
      i.x !== void 0 &&
      i.y !== void 0 &&
      i.width !== void 0 &&
      i.height !== void 0
    )
      try {
        for (let d of s.screen.getAllDisplays()) {
          let p = d.workArea;
          if (
            i.x < p.x + p.width - 2 &&
            i.x + i.width > p.x + 2 &&
            i.y < p.y + p.height - 2 &&
            i.y + i.height > p.y + 2
          ) {
            a = !0;
            break;
          }
        }
      } catch (d) {
        console.error(d);
      }
    else
      i.x === void 0 &&
        i.y === void 0 &&
        i.width !== void 0 &&
        i.height !== void 0 &&
        (a = !0);
    return (
      a &&
        ((r.x = i.x), (r.y = i.y), (r.width = i.width), (r.height = i.height)),
      r.width < 300 && (r.width = 300),
      r.height < 200 && (r.height = 200),
      r
    );
  }
  let wt = x.join(J, "Obsidian Vault"),
    je = x.join(R, "Obsidian Sandbox"),
    yt = x.join(R, "Obsidian Help"),
    qe = "app",
    Oe = qe + "://",
    se = Oe + "obsidian.md/",
    ve = Oe + Re(36) + "/",
    _e = se + "index.html",
    He = [
      "https://easylist.to/easylist/easylist.txt",
      "https://easylist.to/easylist/easyprivacy.txt",
    ],
    Ke = 4,
    ze = ["clipboard-read", "clipboard-sanitized-write"],
    D = M("obsidian");
  (!D || typeof D != "object") && (D = {});
  let L = D.vaults || {};
  xt();
  for (let i in L) {
    let r = L[i];
    ((r.path = x.resolve(r.path)),
      (!r.path || r.path === yt || !b.existsSync(r.path)) &&
        (delete L[i], Q(i)));
  }
  ((D.vaults = L), D.insider && t.emit("insider", !0));
  let ye = D.frame === "native",
    Pe = ye ? "default" : "hidden";
  if (
    (D.updateDisabled &&
      (t.emit("disable", !0), console.log("Updates disabled.")),
    D.disableGpu && !s.app.isReady())
  )
    try {
      (s.app.disableHardwareAcceleration(),
        console.log("GPU Acceleration disabled."));
    } catch (i) {
      console.error(i);
    }
  let X;
  (D.icon && b.existsSync(x.join(R, D.icon)) && (X = x.join(R, D.icon)),
    !X && o && (X = x.join(c, "icon-dev.png")));
  function _() {
    N("obsidian", D);
  }
  function Je(i, r) {
    let a = L[i];
    a && (r ? (a.open = !0) : delete a.open, _());
  }
  async function xt() {
    let i = x.join(R, "Partitions");
    try {
      let r = await b.promises.readdir(i);
      if (!r) return;
      for (let a of r) {
        let d = a.replace(/^vault-/, "");
        L[d] || (await Qe(d));
      }
    } catch (r) {
      r.code !== "ENOENT" && console.error("ERROR: " + r);
    }
  }
  async function Qe(i) {
    console.log("Removing partition for vault " + i);
    let r = x.join(R, "Partitions", `vault-${i}`);
    return b.promises.rm(r, { recursive: !0, force: !0 });
  }
  let H = {},
    Be = new WeakMap(),
    ge = !1,
    xe = null,
    De = Ze([], !0);
  function me(i) {
    if (!i) return De;
    for (; !i.appMenu && Be.has(i); ) i = Be.get(i);
    return i.appMenu || De;
  }
  function Ce() {
    let i = s.BrowserWindow.getFocusedWindow();
    if (!i || !$) return;
    let r = me(i);
    s.Menu.setApplicationMenu(r);
  }
  function Ge(i) {
    return (
      !i.triggeredByAccelerator ||
      (!i.shiftKey && !i.ctrlKey && !i.metaKey && !i.altKey)
    );
  }
  function Ze(i, r = !1) {
    let a = [];
    for (let w = i.length - 1; w >= 0; w--) {
      let e = i[w];
      (e.label === "&Window" || e.label === "&Help") &&
        (a.push(e), i.splice(w, 1));
    }
    function d(w) {
      w.forEach((e) => {
        if (e.appCommand) {
          let n = e.appCommand;
          ((e.id = n),
            (e.click = (l, u, h) => {
              if (u instanceof s.BrowserWindow) {
                if (!u) {
                  let S = Se();
                  if (S)
                    if (((u = H[S]), u && u.isMinimized())) u.restore();
                    else return;
                }
                u &&
                  Ge(h) &&
                  u.webContents.executeJavaScript(
                    `app.commands.executeCommandById(${JSON.stringify(n)})`,
                  );
              }
            }),
            delete e.appCommand);
        }
        "submenu" in e && d(e.submenu);
      });
    }
    function p(w) {
      let e = [];
      for (let n of w) {
        let l = e.find((u) => (u.id && u.id === n.id) || u.label === n.label);
        if (l)
          for (let u of n.submenu) {
            let h =
              u.before && l.submenu.findIndex((S) => S.id === u.before[0]);
            h != null ? l.submenu.splice(h, 0, u) : l.submenu.push(u);
          }
        else e.push(n);
      }
      return e;
    }
    let y = p([
      ...le($, () => [
        {
          label: "Obsidian",
          submenu: [
            {
              label: "About Obsidian",
              async click(w, e) {
                let n = `Version ${ue} (Installer ${s.app.getVersion()})`;
                (
                  await s.dialog.showMessageBox(e, {
                    message: "Obsidian",
                    icon: x.join(c, "icon.png"),
                    detail: `${n}

Copyright \xA9 Dynalist Inc.`,
                    type: "info",
                    buttons: ["OK", "Copy"],
                    defaultId: 0,
                    cancelId: 0,
                  })
                ).response === 1 &&
                  s.clipboard.writeText(`About Obsidian
${n}`);
              },
            },
            { type: "separator" },
            { id: "preferences-section", visible: !1, label: "" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            {
              label: "Hide Obsidian",
              click: () => s.app.hide(),
              accelerator: "Cmd+H",
            },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            {
              label: "Quit Obsidian",
              click: () => s.app.quit(),
              accelerator: "Cmd+Q",
            },
          ],
        },
      ]),
      {
        label: "&File",
        submenu: [
          { id: "open-section", type: "separator" },
          { id: "open-vault", click: ce, label: "Open Vault..." },
          ...le($ || G, () => [
            {
              role: "recentDocuments",
              submenu: [
                { label: "Clear Recent", role: "clearRecentDocuments" },
              ],
            },
          ]),
          { type: "separator" },
          ...le(r, () => [{ id: "close-window", role: "close" }]),
          ...le(!$, () => [
            { type: "separator" },
            { id: "quit", role: "quit" },
          ]),
        ],
      },
      {
        label: "&Edit",
        submenu: [
          { type: "separator", id: "undo-section" },
          { role: "undo" },
          {
            label: "Redo",
            accelerator: "CmdOrCtrl+Shift+Z",
            click: function (w, e, n) {
              if (e instanceof s.BrowserWindow)
                if (Ge(n)) {
                  let l = $ ? "metaKey" : "ctrlKey";
                  e.webContents.executeJavaScript(`
									activeDocument.activeElement.dispatchEvent(new KeyboardEvent('keydown', {
										keyCode: 90,
										which: 90,
										code: 'KeyZ',
										key: 'z',
										${l}: true,
										shiftKey: true,
										bubbles: true,
										cancelable: true,
									}));
								`);
                } else e.webContents.redo();
            },
          },
          { type: "separator", id: "copy-section" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          {
            role: "pasteAndMatchStyle",
            accelerator: $ ? "Cmd+Shift+V" : "Shift+CommandOrControl+V",
          },
          {
            label: "Paste and Match Style",
            accelerator: $
              ? "Cmd+Option+Shift+V"
              : "Shift+CommandOrControl+Alt+V",
            click: (w, e) => {
              e instanceof s.BrowserWindow &&
                e.webContents.pasteAndMatchStyle();
            },
            visible: !1,
          },
          { role: "delete" },
          { role: "selectAll" },
          ...le($, () => [
            { type: "separator", id: "speech-section" },
            {
              label: "Substitutions",
              submenu: [
                { role: "showSubstitutions" },
                { type: "separator" },
                { role: "toggleSmartQuotes" },
                { role: "toggleSmartDashes" },
                { role: "toggleTextReplacement" },
              ],
            },
            {
              label: "Speech",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]),
        ],
      },
      ...i,
      {
        label: "&View",
        submenu: [
          ...le(o, () => [{ role: "reload" }]),
          {
            id: "actual-size",
            label: "Actual Size",
            accelerator: "CommandOrControl+0",
            click(w, e) {
              e &&
                e instanceof s.BrowserWindow &&
                (e.webContents.zoomLevel = 0);
            },
          },
          {
            label: "Zoom In",
            accelerator: "CommandOrControl+=",
            click(w, e) {
              e &&
                e instanceof s.BrowserWindow &&
                e.webContents.executeJavaScript(`
									(() => {
										let wf = require('electron').webFrame;
										let zoom = wf.getZoomLevel();
										if (zoom < 3) {
											wf.setZoomLevel(zoom + 0.5);
										}
									})()
								`);
            },
          },
          {
            label: "Zoom Out",
            accelerator: "CommandOrControl+-",
            click(w, e) {
              e &&
                e instanceof s.BrowserWindow &&
                e.webContents.executeJavaScript(`
									(() => {
										let wf = require('electron').webFrame;
										let zoom = wf.getZoomLevel();
										if (zoom > -2.5) {
											wf.setZoomLevel(zoom - 0.5);
										}
									})()
								`);
            },
          },
          { id: "developer-section", type: "separator" },
          { role: "forceReload", accelerator: "" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
      {
        label: "&Window",
        role: "window",
        submenu: [
          { role: "minimize", accelerator: $ ? "CommandOrControl+M" : "" },
          ...le($, () => [{ role: "zoom" }]),
          { type: "separator" },
          { type: "separator", id: "tab-management" },
          {
            id: "window-always-on-top",
            checked: !1,
            enabled: !1,
            type: "checkbox",
            label: "Always on Top",
            click(w, e) {
              if (e) {
                let n = e.isAlwaysOnTop();
                e.setAlwaysOnTop(!n);
              }
            },
          },
          { role: "front" },
        ],
      },
      {
        label: "&Help",
        role: "help",
        submenu: [
          { label: "Open Help", click: () => et() },
          { type: "separator", id: "help-links" },
          {
            label: "Homepage",
            click: () => s.shell.openExternal("https://obsidian.md"),
          },
          {
            label: "Community",
            click: () => s.shell.openExternal("https://obsidian.md/community"),
          },
          {
            label: "Help Center",
            click: () => s.shell.openExternal("https://help.obsidian.md/"),
          },
          { type: "separator" },
        ],
      },
      ...a,
    ]);
    return (d(y), s.Menu.buildFromTemplate(y));
  }
  function Se() {
    let i = null,
      r = null;
    for (let a in H) {
      let d = H[a];
      d.isDestroyed() ||
        ((!i || d.focusTime > i.focusTime) && ((i = d), (r = a)));
    }
    return r;
  }
  function Ie(i) {
    for (let r in L) {
      let a = L[r].path;
      if (r === i || x.basename(a).toUpperCase() === i.toUpperCase()) return r;
    }
    return null;
  }
  function Dt(i) {
    return L[i] ? x.basename(L[i].path) : null;
  }
  function Ye(i) {
    let r = x.resolve(i);
    for (let a in L) {
      let d = x.resolve(L[a].path);
      if (r === d || r.startsWith(d + x.sep)) return a;
    }
    return null;
  }
  function ae(i, r = !0) {
    if (H[i]) {
      let m = H[i];
      return (r && (m.isMinimized() && m.restore(), m.focus()), m);
    }
    let a = M(i),
      d = {
        width: 800,
        height: 600,
        minWidth: 200,
        minHeight: 150,
        backgroundColor: "#00000000",
        trafficLightPosition: { x: 19, y: 12 },
        show: !1,
        frame: ye,
        titleBarStyle: Pe,
        webPreferences: {
          contextIsolation: !1,
          nodeIntegration: !0,
          nodeIntegrationInWorker: !0,
          spellcheck: !0,
          webviewTag: !0,
        },
        ...Ne(a),
      },
      p = new s.BrowserWindow(d);
    H[i] = p;
    let y = p.webContents,
      w = !1,
      e = () => {
        if (w) return;
        ((w = !0),
          a.isMaximized && p.maximize(),
          a.devTools && y.openDevTools(),
          p.show());
        let m = a.zoom;
        m &&
          typeof m == "number" &&
          y.executeJavaScript(
            `require('electron').webFrame.setZoomLevel(${a.zoom})`,
          );
      };
    ((p.menuBarVisible = !1), X && !$ && oe(() => p.setIcon(X)));
    function n() {
      return !p.isMaximized() && !p.isMinimized() && !p.isFullScreen();
    }
    function l() {
      try {
        let m = p.getBounds();
        (n() &&
          ((a.x = m.x),
          (a.y = m.y),
          (a.width = m.width),
          (a.height = m.height)),
          (a.isMaximized = p.isMaximized()),
          (a.devTools = y.isDevToolsOpened()),
          (a.zoom = y.zoomLevel));
      } catch (m) {}
    }
    (y.on("did-finish-load", () => {
      p.loaded = !0;
    }),
      $e(p, !0));
    let u = (m) => {
      m.on("context-menu", (O, F) => {
        if (xe && xe === y.id) {
          xe = null;
          try {
            let {
              editFlags: k,
              misspelledWord: q,
              dictionarySuggestions: z,
            } = F;
            y.send("context-menu", {
              editFlags: k,
              misspelledWord: q,
              dictionarySuggestions: z,
              webContentsId: m.id,
            });
            return;
          } catch (k) {
            console.error(k);
          }
        }
        ht(p, m, F);
      });
    };
    (u(y),
      p.on("close", (m) => {
        (l(),
          N(i, a),
          setTimeout(() => {
            !m.defaultPrevented && !p.isDestroyed() && p.destroy();
          }, 3e3));
      }),
      p.on("closed", () => {
        (delete H[i], !ge && (re || Object.keys(H).length > 0) && Je(i, !1));
      }));
    let h;
    function S() {
      (clearTimeout(h), (h = setTimeout(l, 100)));
    }
    return (
      p.on("resize", S),
      p.on("move", S),
      p.on("ready-to-show", e),
      y.on("did-create-window", (m) => {
        let O = m.webContents;
        (Be.set(m, p), X && !$ && oe(() => m.setIcon(X)), $e(m, !1), u(O));
      }),
      p.loadURL(_e).then(e, e),
      Je(i, !0),
      p
    );
  }
  function Xe(i) {
    let r = new s.BrowserWindow({
      width: 800,
      height: 600,
      resizable: !1,
      maximizable: !1,
      fullscreenable: !1,
      show: !1,
      frame: ye,
      titleBarStyle: Pe,
      backgroundColor: "#1e1e1e",
      webPreferences: { contextIsolation: !1, nodeIntegration: !0 },
      ...i,
    });
    return (
      X && !$ && oe(() => r.setIcon(X)),
      We(r.webContents),
      (r.menuBarVisible = !1),
      r.on("focus", () => {
        Ce();
      }),
      r
    );
  }
  let re;
  function ce() {
    if (re) {
      (re.isMinimized() && re.restore(), re.focus());
      return;
    }
    let i = (re = Xe({ width: 800, height: 650 }));
    i.on("closed", () => {
      re = null;
    });
    let r = () => i.show();
    i.loadURL(se + "starter.html").then(r, r);
  }
  let fe;
  function et() {
    if (fe) {
      (fe.isMinimized() && fe.restore(), fe.focus());
      return;
    }
    let i = (fe = Xe({ width: 600, height: 680 }));
    i.on("closed", () => {
      fe = null;
    });
    let r = () => i.show();
    i.loadURL(se + "help.html").then(r, r);
  }
  let Fe = null;
  s.app.on("will-finish-launching", () => {
    s.app.once("open-url", (i, r) => {
      (i.preventDefault(), (Fe = r));
    });
  });
  let Le = () => {
    for (let i in L) L[i].open && ae(i);
    Object.keys(H).length === 0 && ce();
  };
  function Te(i, r, a) {
    let d = i.getMenuItemById(r);
    if (d) for (let p in a) d[p] = a[p];
  }
  async function tt(i, r) {
    if (!D.cli)
      return "Command line interface is not enabled. Please turn it on in Settings > General > Advanced.";
    if (!i || !L[i]) return "Vault not found.";
    let a = ae(i, !1);
    try {
      return await a.webContents.executeJavaScript(`
				new Promise((resolve, reject) => {
					let argv = ${JSON.stringify(r)};
					if (window.handleCli) {
						Promise.resolve(window.handleCli(argv)).then(resolve, reject);
					} else {
						window.cliQueue = window.cliQueue || [];
						window.cliQueue.push({ argv, resolve, reject });
					}
				})
			`);
    } catch (d) {
      return typeof d == "string" ? "Error: " + d : String(d);
    }
  }
  (s.app.on("second-instance", async (i, r, a, d) => {
    var m, O;
    if (!d) return;
    let { session: p, tty: y } = d;
    if (!p) return;
    let w = E(p);
    ((r = f(r)),
      G &&
        (m = r[0]) != null &&
        m.startsWith("session=") &&
        (r.shift(), r[0] === "tty" && r.shift()),
      console.log("Received command line", r),
      !y && r.length === 0 && ce());
    let e = await new Promise((F) => {
      let k = Date.now() + 2e3,
        q = () => {
          let z = (0, Ee.createConnection)(w);
          (z.setNoDelay(!0),
            z.once("connect", () => {
              F(z);
            }),
            z.once("error", (rt) => {
              if ((z.destroy(), Date.now() > k)) {
                (console.error(
                  "Failed to process command line call, timed out.",
                ),
                  F(null));
                return;
              }
              setTimeout(q, 10);
            }));
        };
      q();
    });
    if (!e) return;
    let n = (F) => {
        ((F = F.replace(/(\r?\n)/g, ee.EOL)),
          e.write(F),
          F.endsWith(ee.EOL) || e.write(ee.EOL));
      },
      l = r.at(-1);
    if (l && l.startsWith("obsidian://"))
      return (Me(l), n("Processed URI " + l), e.end());
    if (!D.cli)
      return (
        n(
          "Command line interface is not enabled. Please turn it on in Settings > General > Advanced.",
        ),
        e.end()
      );
    let u = (O = r[0]) != null && O.startsWith("vault=") ? r.shift() : "",
      h = u ? Ie(u.slice(6)) : Ye(a) || Se() || "";
    if (!(y && r.length === 0)) {
      let F = await tt(h, r);
      return (F && n(F), e.end());
    }
    ft(e, h, {
      executeCliRequest: tt,
      getIdForVault: Ie,
      getNameForVault: Dt,
      openVaultById: ae,
      version: ue,
    });
  }),
    s.app.whenReady().then(() => {
      let i = (e) => {
        let n = !1;
        return (
          e.indexOf("?") > 0 && (e = e.substring(0, e.indexOf("?"))),
          e.indexOf("#") > 0 && (e = e.substring(0, e.indexOf("#"))),
          e.indexOf(se) === 0
            ? ((e = decodeURIComponent(e.substring(se.length))),
              (e = x.resolve(x.join(c, e))),
              e.indexOf(x.resolve(c)) !== 0 && (e = ""),
              (n = !0))
            : e.indexOf(ve) === 0
              ? ((e = decodeURIComponent(e.substring(ve.length))),
                G || (e = "/" + e),
                (e = x.resolve(e)),
                dt(e) && (n = !0))
              : (e = ""),
          { url: e, noframe: n }
        );
      };
      (s.protocol.registerFileProtocol
        ? s.protocol.registerFileProtocol("app", (e, n) => {
            let { url: l, noframe: u } = i(e.url),
              h = {};
            (u && (h["X-Frame-Options"] = "DENY"), n({ path: l, headers: h }));
          })
        : s.protocol.handle("app", async (e) => {
            let { url: n, noframe: l } = i(e.url);
            if (!n) return new Response("Not Found", { status: 400 });
            try {
              let u = await b.promises.stat(n),
                h = 200,
                S,
                m = new Headers(),
                O = e.headers.get("Range");
              if (O) {
                let F = O.match(/^bytes=(\d*)-(\d*)/);
                if (!F)
                  return new Response("Range Not Satisfiable", { status: 416 });
                let k = Number(F[1] || 0),
                  q = Number(F[2] || u.size - 1);
                if (isNaN(k) || isNaN(q) || k < 0 || q > u.size - 1 || q < k)
                  return new Response("Range Not Satisfiable", { status: 416 });
                (m.set("Accept-Ranges", "bytes"),
                  m.set("Content-Length", `${q - k + 1}`),
                  m.set("Content-Range", `bytes ${k}-${q}/${u.size}`),
                  (h = 206),
                  (S = b.createReadStream(n, { start: k, end: q })));
              } else
                (m.set("Content-Length", `${u.size}`),
                  (S = b.createReadStream(n)));
              return (
                m.set("Access-Control-Allow-Origin", "*"),
                m.set("Last-Modified", u.mtime.toUTCString()),
                l && m.set("X-Frame-Options", "DENY"),
                new Response(S, { status: h, headers: m })
              );
            } catch (u) {
              return (
                console.error(u),
                new Response("Not Found", { status: 400 })
              );
            }
          }),
        s.ipcMain.on("is-dev", (e) => {
          e.returnValue = o;
        }),
        s.ipcMain.on("is-quitting", (e) => {
          e.returnValue = ge;
        }),
        s.ipcMain.on("desktop-dir", (e) => {
          e.returnValue = te;
        }),
        s.ipcMain.on("documents-dir", (e) => {
          e.returnValue = J;
        }),
        s.ipcMain.on("resources", (e) => {
          e.returnValue = c;
        }),
        s.ipcMain.on("version", (e) => {
          e.returnValue = ue;
        }),
        s.ipcMain.on("file-url", (e) => {
          e.returnValue = ve;
        }),
        s.ipcMain.on("relaunch", (e) => {
          ((e.returnValue = ""),
            console.log("Relaunching!"),
            (ge = !0),
            s.app.relaunch(),
            s.app.quit());
        }),
        s.ipcMain.on("update", (e) => {
          e.returnValue = I;
        }),
        s.ipcMain.on("check-update", (e, n) => {
          (n &&
            (D.updateDisabled && t.emit("disable", !1),
            t.emit("check"),
            D.updateDisabled && setTimeout(() => t.emit("disable", !0), 50)),
            (e.returnValue = W));
        }),
        s.ipcMain.on("disable-update", (e, n) => {
          (n === !0
            ? ((D.updateDisabled = !0),
              t.emit("disable", !0),
              _(),
              console.log("Updates disabled."))
            : n === !1 &&
              (delete D.updateDisabled,
              t.emit("disable", !1),
              _(),
              console.log("Updates enabled.")),
            (e.returnValue = D.updateDisabled));
        }),
        s.ipcMain.on("copy-asar", (e, n) => {
          try {
            let l = x.basename(n),
              u = /^obsidian-(\d+\.\d+\.\d+)/.exec(l),
              h = x.join(R, `${u[0]}.asar`);
            (bt.copyFileSync(n, h), (e.returnValue = !0));
          } catch (l) {
            (console.error("Failed to copy asar", l), (e.returnValue = !1));
          }
        }),
        s.ipcMain.on("disable-gpu", (e, n) => {
          (n === !0
            ? ((D.disableGpu = !0), _())
            : n === !1 && (delete D.disableGpu, _()),
            (e.returnValue = D.disableGpu));
        }),
        s.ipcMain.on("insider-build", (e, n) => {
          (n === !0 && !D.insider
            ? ((D.insider = !0), t.emit("insider", !0), _())
            : n === !1 &&
              D.insider &&
              (delete D.insider, t.emit("insider", !1), _()),
            (e.returnValue = !!D.insider));
        }),
        s.ipcMain.on("cli", (e, n) => {
          (n === !0 && !D.cli
            ? ((D.cli = !0), t.emit("cli", !0), _())
            : n === !1 && D.cli && (delete D.cli, t.emit("cli", !1), _()),
            (e.returnValue = !!D.cli));
        }),
        s.ipcMain.on("frame", (e, n) => {
          (typeof n == "string" && ((D.frame = n), n || delete D.frame, _()),
            (e.returnValue = D.frame));
        }),
        s.ipcMain.on("adblock-lists", (e, n) => {
          (Array.isArray(n) && ((D.adblock = n), _(), Y()),
            (e.returnValue = D.adblock || He));
        }),
        s.ipcMain.on("adblock-frequency", (e, n) => {
          (typeof n == "number" && ((D.adblockFrequency = n), _(), Y()),
            (e.returnValue = D.adblockFrequency || Ke));
        }),
        s.ipcMain.on("print-to-pdf", async (e, n) => {
          console.log("Saving PDF...");
          let l = e.sender;
          try {
            let { filepath: u } = n,
              h = await l.printToPDF(n);
            (await b.promises.writeFile(u, h), n.open && Ve(u));
          } finally {
            (console.log("Done."), l.send("print-to-pdf", {}));
          }
        }),
        s.ipcMain.on("vault", (e) => {
          for (let n in H)
            if (H[n].webContents === e.sender) {
              e.returnValue = { id: n, path: x.resolve(L[n].path) };
              return;
            }
          e.returnValue = {};
        }),
        s.ipcMain.on("vault-list", (e) => {
          e.returnValue = L;
        }),
        s.ipcMain.on("vault-remove", (e, n) => {
          if (n && typeof n == "string") {
            for (let l in L)
              if (L[l].path === n) {
                if (H[l]) {
                  e.returnValue = !1;
                  return;
                }
                ((e.returnValue = !0), delete L[l], _(), Q(l), Qe(l));
                return;
              }
          }
          e.returnValue = !1;
        }),
        s.ipcMain.on("vault-move", (e, n, l) => {
          if (n && typeof n == "string")
            for (let u in L) {
              let h = L[u];
              if (h.path === n) {
                if (H[u]) {
                  e.returnValue = "EVAULTOPEN";
                  return;
                }
                try {
                  b.renameSync(n, l);
                } catch (S) {
                  e.returnValue = S.toString();
                  return;
                }
                ((e.returnValue = ""), (h.path = l), _());
                return;
              }
            }
          e.returnValue = !1;
        }),
        s.ipcMain.on("vault-open", (e, n, l) => {
          if (l) {
            if (b.existsSync(n)) {
              e.returnValue = "Vault already exists";
              return;
            }
            try {
              b.mkdirSync(n, { recursive: !0 });
            } catch (u) {
              e.returnValue = u.toString();
              return;
            }
          }
          e.returnValue = d(n);
        }),
        s.ipcMain.on("vault-message", (e, n, l) => {
          n = x.resolve(n);
          for (let u in L)
            if (L[u].path === n) {
              nt(u, l);
              break;
            }
          e.returnValue = "";
        }),
        s.ipcMain.on("starter", (e) => {
          ((e.returnValue = null), ce());
        }),
        s.ipcMain.on("help", (e) => {
          ((e.returnValue = null), et());
        }),
        s.ipcMain.on("sandbox", (e) => {
          ((e.returnValue = null), p());
        }),
        s.ipcMain.on("context-menu", (e) => {
          xe = e.sender.id;
        }),
        s.ipcMain.on("request-url", async (e, n, l) => {
          try {
            let { url: u, method: h, contentType: S, body: m, headers: O } = l,
              F = s.net.request({ url: u, method: h, redirect: "follow" });
            if ((S && F.setHeader("Content-Type", S), O))
              for (let k in O)
                try {
                  F.setHeader(k, O[k]);
                } catch (q) {
                  console.error(q);
                }
            (F.on("login", (k, q) => q()),
              F.on("error", (k) => {
                e.reply(n, { error: k });
              }),
              F.on("response", (k) => {
                let q = [];
                (k.on("data", (z) => q.push(z)),
                  k.on("end", () => {
                    let z = Buffer.concat(q),
                      rt = z.buffer.slice(
                        z.byteOffset,
                        z.byteOffset + z.byteLength,
                      );
                    e.reply(n, {
                      status: k.statusCode,
                      headers: k.headers,
                      body: rt,
                    });
                  }));
              }),
              typeof m == "string"
                ? F.write(m)
                : m instanceof ArrayBuffer &&
                  F.write(Buffer.from(new Uint8Array(m))),
              F.end());
          } catch (u) {
            e.reply(n, { error: u });
          }
        }),
        s.ipcMain.on("open-url", (e, n) => {
          let l = s.BrowserWindow.fromWebContents(e.sender);
          l && typeof n == "string" && ne(l, n);
        }),
        s.ipcMain.on("trash", async (e, n) => {
          try {
            (await s.shell.trashItem(n), (e.returnValue = !0));
          } catch (l) {
            (console.log(l), (e.returnValue = !1));
          }
        }),
        s.ipcMain.on("get-documents-path", (e) => {
          e.returnValue = J;
        }),
        s.ipcMain.on("get-sandbox-vault-path", (e) => {
          e.returnValue = je;
        }),
        s.ipcMain.on("get-default-vault-path", (e) => {
          e.returnValue = wt;
        }),
        s.ipcMain.on("set-menu", (e, { template: n }) => {
          let l = s.BrowserWindow.fromWebContents(e.sender);
          if (!l) return;
          let u = Ze(n);
          ((l.appMenu = u), $ ? Ce() : l.setMenu(u));
        }),
        s.ipcMain.on("update-menu-items", (e, n, l) => {
          let u = s.BrowserWindow.fromWebContents(e.sender),
            h = me(u);
          if (h !== De) {
            for (let { itemId: S, eState: m } of n) Te(h, S, m);
            l && Ce();
          }
        }),
        s.ipcMain.on("render-menu", (e) => {
          let n = s.BrowserWindow.fromWebContents(e.sender);
          me(n).popup({ window: n });
        }),
        s.ipcMain.on("set-icon", (e, n, l) => {
          (D.icon && b.rmSync(x.join(R, D.icon), { force: !0 }),
            n && l ? b.writeFileSync(x.join(R, n), l) : (n = null),
            (D.icon || "") !== (n || "") &&
              (n ? (D.icon = n) : delete D.icon, _()),
            (e.returnValue = null));
        }),
        s.ipcMain.on("get-icon", (e) => {
          e.returnValue = D.icon;
        }),
        s.ipcMain.on("create-browser-session", async (e, n, l) => {
          let u = ie[n];
          (u ||
            (l === !0 && Y(),
            (u = { session: s.session.fromPartition(n), adblock: !!l }),
            (ie[n] = u),
            u.session.setUserAgent(
              u.session
                .getUserAgent()
                .split(" ")
                .filter((h) => !/^(obsidian|electron)/i.test(h))
                .join(" "),
            ),
            u.session.webRequest.onBeforeRequest(
              { urls: ["https://*/*", "http://*/*"] },
              (h, S) => {
                let m = u.adblock && he.matches(h.url);
                S({ cancel: m });
              },
            ),
            u.session.webRequest.onBeforeSendHeaders(
              { urls: ["https://*/*", "http://*/*"] },
              (h, S) => {
                let { requestHeaders: m } = h;
                for (let O in m)
                  O.toLowerCase() === "sec-fetch-dest" ||
                  O.toLowerCase() === "sec-ch-ua"
                    ? delete m[O]
                    : O.toLowerCase() === "user-agent" &&
                      h.url.startsWith("https://accounts.google.com/") &&
                      (m[O] = "Chrome");
                S({ requestHeaders: m });
              },
            ),
            u.session.setPermissionCheckHandler((h, S, m) => ze.includes(S)),
            u.session.setPermissionRequestHandler((h, S, m, O) => {
              m(ze.includes(S));
            }),
            u.session.setDevicePermissionHandler((h) => !1)),
            (l === !0 || l === !1) && (u.adblock = l));
        }),
        s.ipcMain.handle("register-cli", async (e) => {
          if (!C)
            return {
              success: !1,
              message: `Unable to add to command line because the executable is "${g}" instead of "obsidian".`,
            };
          try {
            let n = (0, mt.promisify)(pt.exec),
              l = process.execPath,
              u = x.dirname(l);
            if (G) {
              let { stdout: h } = await n(
                `powershell -Command "[Environment]::GetEnvironmentVariable('Path', 'User')"`,
              );
              return h
                .trim()
                .split(";")
                .some((m) => m.trim().toLowerCase() === u.toLowerCase())
                ? { success: !0, message: "Already registered in PATH" }
                : (await n(
                    `powershell -Command "[Environment]::SetEnvironmentVariable('Path', ([Environment]::GetEnvironmentVariable('Path', 'User') + ';${u}'), 'User')"`,
                  ),
                  {
                    success: !0,
                    message:
                      "Successfully registered to PATH. Please restart your terminal.",
                  });
            } else if ($) {
              let h = x.join(ee.homedir(), ".zprofile");
              return b.existsSync(h) && b.readFileSync(h, "utf8").includes(u)
                ? { success: !0, message: "Already registered in PATH" }
                : (b.appendFileSync(
                    h,
                    `
# Added by Obsidian
export PATH="$PATH:${u}"
`,
                  ),
                  {
                    success: !0,
                    message:
                      "Successfully registered to PATH. Please restart your terminal.",
                  });
            } else {
              let h = l,
                S = process.env.FLATPAK_ID;
              if (S) {
                let F = x.join(
                    ee.homedir(),
                    `.local/share/flatpak/exports/bin/${S}`,
                  ),
                  k = `/var/lib/flatpak/exports/bin/${S}`;
                h = b.existsSync(F) ? F : k;
              }
              process.env.APPIMAGE && (h = process.env.APPIMAGE);
              let m = x.join(ee.homedir(), ".local", "bin"),
                O = x.join(m, "obsidian");
              if (b.existsSync(O)) {
                if (b.readlinkSync(O) === h)
                  return { success: !0, message: "Already registered in PATH" };
                b.unlinkSync(O);
              }
              return (
                b.existsSync(m) || b.mkdirSync(m, { recursive: !0 }),
                b.symlinkSync(h, O),
                {
                  success: !0,
                  message: `Successfully registered to ${m}. Make sure this directory is in your PATH.`,
                }
              );
            }
          } catch (n) {
            return { success: !1, message: n.toString() };
          }
        }));
      let r = s.session.defaultSession.webRequest;
      (r.onBeforeRequest({ urls: [Oe + "*/*"] }, (e, n) => {
        let { frame: l, url: u } = e,
          h = l.origin,
          S = !0;
        (h + "/" === se && (S = !1),
          h === "null" && l === l.top && u.startsWith(se) && (S = !1),
          n({ cancel: S }));
      }),
        r.onBeforeSendHeaders(
          { urls: ["https://*/*", "http://*/*"] },
          (e, n) => {
            let { requestHeaders: l } = e;
            if (
              e.url.startsWith("https://www.youtube.com/embed/") ||
              e.url.startsWith("https://www.youtube-nocookie.com/embed/")
            )
              l.Referer || (l.Referer = "md.obsidian");
            else
              for (let u in l)
                (u.toLowerCase() === "sec-fetch-dest" ||
                  u.toLowerCase() === "sec-ch-ua") &&
                  delete l[u];
            n({ requestHeaders: l });
          },
        ),
        r.onHeadersReceived({ urls: ["https://*/*", "http://*/*"] }, (e, n) => {
          let {
              responseHeaders: l,
              resourceType: u,
              frame: h,
              webContents: S,
            } = e,
            m = u === "subFrame";
          try {
            if (!m) {
              let O = S.mainFrame;
              m = O.framesInSubtree
                .filter((F) => F !== O)
                .some(
                  (F) =>
                    ((F.routingId && F.routingId === h.routingId) ||
                      (F.frameToken && F.frameToken === h.frameToken)) &&
                    F.processId === h.processId,
                );
            }
          } catch (O) {}
          for (let O in l)
            (O.toLowerCase() === "x-frame-options" && delete l[O],
              O.toLowerCase() === "cross-origin-opener-policy" && delete l[O],
              O.toLowerCase() === "content-security-policy" &&
                (l[O] = l[O].map((F) =>
                  F.replace(/\s*frame-ancestors [^;]*(;|$)/g, ""),
                )),
              O.toLowerCase() === "set-cookie" &&
                m &&
                (l[O] = l[O].map((F) =>
                  /Secure;/i.test(F)
                    ? F.replace(/SameSite=Lax/i, "SameSite=None")
                    : F,
                )));
          n({ responseHeaders: l });
        }));
      let a = () => !1;
      ((r.onBeforeRequest = a),
        (r.onBeforeSendHeaders = a),
        (r.onHeadersReceived = a));
      for (let e of [s.protocol, s.session.defaultSession.protocol])
        ((e.interceptBufferProtocol = a),
          (e.interceptStreamProtocol = a),
          (e.interceptStringProtocol = a),
          (e.interceptFileProtocol = a),
          (e.interceptHttpProtocol = a),
          (e.handle = a));
      s.session.defaultSession.setPermissionRequestHandler((e, n, l, u) => {
        let h = e.getURL().startsWith(se);
        (u.isMainFrame &&
          u.requestingUrl === "about:blank" &&
          n.startsWith("clipboard-") &&
          (h = !0),
          n === "openExternal" ? (h = !1) : n === "fullscreen" && (h = !0),
          h || console.log("Blocked permission request", e.getURL(), n, u),
          l(h));
      });
      function d(e) {
        if (e && typeof e == "string") {
          if (((e = x.resolve(e)), !b.existsSync(e))) return "folder not found";
          if (!Z(e)) return "no permission to access folder";
          for (let l in L) {
            let u = L[l];
            if (u.path === e)
              return (
                (u.ts = Date.now()),
                ae(l),
                s.app.addRecentDocument(e),
                !0
              );
          }
          let n = Re(16);
          return (
            (L[n] = { path: e, ts: Date.now() }),
            ae(n),
            s.app.addRecentDocument(e),
            !0
          );
        }
        return "folder not found";
      }
      function p() {
        let e = x.join(c, "sandbox"),
          n = je;
        for (let l in H) {
          let u = L[l];
          if (u.path === n) {
            ((u.ts = Date.now()), ae(l));
            return;
          }
        }
        try {
          b.rmSync
            ? b.rmSync(n, { recursive: !0 })
            : b.rmdirSync(n, { recursive: !0 });
        } catch (l) {
          l.code !== "ENOENT" && console.error(l);
        }
        (y(e, n), d(n));
      }
      function y(e, n) {
        b.mkdirSync(n, { recursive: !0 });
        let l = b.readdirSync(e);
        for (let u of l) {
          let h = x.join(e, u),
            S = b.statSync(h),
            m = n + "/" + u;
          (S.isFile() && b.writeFileSync(m, b.readFileSync(h)),
            S.isDirectory() && y(h, m));
        }
      }
      (s.app.setAboutPanelOptions({
        applicationName: "Obsidian",
        applicationVersion: ue + " (installer " + s.app.getVersion() + ")",
        version: "",
        copyright: "Copyright \xA9 Dynalist Inc.",
        website: "https://obsidian.md",
      }),
        $ && oe(() => s.app.dock.setIcon(X)),
        s.Menu.setApplicationMenu(De),
        s.app.on("web-contents-created", (e, n) => {
          (Ue(n),
            (n.noContextMenu = !1),
            n.hostWebContents &&
              n.on("context-menu", (l, u) => {
                n.noContextMenu || ht(s.BrowserWindow.fromWebContents(n), n, u);
              }));
        }),
        s.app.on("open-file", function (e, n) {
          e.preventDefault();
          let l = x.resolve(n),
            u = "";
          for (let h in L) {
            let S = L[h].path;
            l.startsWith(S) && u.length < S.length && (u = S);
          }
          u && d(u);
        }),
        s.app.on("window-all-closed", () => {
          $ || s.app.quit();
        }),
        s.app.on("before-quit", () => {
          ge = !0;
        }),
        s.app.on("activate", () => {
          ((ge = !1), s.BrowserWindow.getAllWindows().length === 0 && Le());
        }));
      let w = A.at(-1);
      if (
        (w && w.startsWith("obsidian://") && (Fe = w),
        Fe && Me(Fe),
        s.app.on("open-url", function (e, n) {
          (e.preventDefault(), Me(n));
        }),
        !re && Object.keys(H).length === 0)
      )
        Le();
      else {
        for (let e in L) H[e] || delete L[e].open;
        _();
      }
    }),
    !o &&
      !s.app.isDefaultProtocolClient("obsidian") &&
      s.app.setAsDefaultProtocolClient("obsidian"));
  let it = "obsidian://";
  function Me(i) {
    if (!i.startsWith(it)) return;
    let r = i;
    (console.log("Received callback URL", i), (i = i.substr(it.length)));
    let a = {};
    if (i.startsWith("/")) {
      let w = i;
      (G && (w = i.substr(1)), (a.action = "open"), (a.path = decodeURI(w)));
    } else if (i.startsWith("sync-setup")) {
      ce();
      return;
    } else if (i.startsWith("choose-vault")) {
      ce();
      return;
    } else if (i.startsWith("vault/")) {
      i = i.substr(6);
      let w = i.split("/").map((e) => decodeURIComponent(e));
      ((a.action = "open"), (a.vault = w[0]), (a.file = w.slice(1).join("/")));
    } else {
      let w = "",
        e = "",
        n = i.indexOf("?"),
        l = i.indexOf("#", Math.max(0, n));
      (l >= 0 && ((e = i.substr(l + 1)), (i = i.substr(0, l)), (a.hash = e)),
        n >= 0 && ((w = i.substr(n + 1)), (i = i.substr(0, n))));
      for (let u of w.split("&")) {
        let h = u.split("="),
          S = "true";
        (h.length > 1 && (S = decodeURIComponent(h[1])),
          (a[decodeURIComponent(h[0])] = S));
      }
      a.action = i.replace(/\/+$/g, "");
    }
    let d = null,
      p = a.path,
      y = a.vault;
    if (p && typeof p == "string") {
      let w = x.resolve(p),
        e = "";
      for (let n in L) {
        let l = L[n].path;
        w.startsWith(l) && e.length < l.length && ((e = l), (d = n));
      }
      d && (a.file = w.substr(e.length));
    } else
      y && typeof y == "string"
        ? (d = Ie(y))
        : ((d = Se()), d || Le(), (d = Se()));
    d
      ? nt(d, a)
      : s.dialog.showErrorBox(
          "Vault not found.",
          "Unable to find a vault for the URL " + r,
        );
  }
  function nt(i, r) {
    let a = ae(i, !1),
      p = `(function(){var w=window,o=${JSON.stringify(r)};if(typeof w.OBS_ACT === "function"){w.OBS_ACT(o)}else{w.OBS_ACT=o}})()`,
      y = a.webContents;
    a.loaded
      ? y.executeJavaScript(p)
      : y.once("did-finish-load", () => y.executeJavaScript(p));
  }
};
