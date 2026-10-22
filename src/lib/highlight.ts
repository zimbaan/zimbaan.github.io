export type TokenKind = "kw" | "fn" | "str" | "num" | "cm" | "op";
export type Token = { t: string; c?: TokenKind };

const TOKEN_RE =
  /(\s+)|(--[^\n]*|#[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([^\sA-Za-z0-9_])/g;

/** Tiny tokenizer for the SQL and Python snippets in the demos. */
export function tokenize(code: string, keywords: Set<string>, caseInsensitive = false): Token[] {
  const out: Token[] = [];
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(code))) {
    const [text, ws, cm, str, num, word] = m;
    if (ws) out.push({ t: text });
    else if (cm) out.push({ t: text, c: "cm" });
    else if (str) out.push({ t: text, c: "str" });
    else if (num) out.push({ t: text, c: "num" });
    else if (word) {
      const key = caseInsensitive ? word.toUpperCase() : word;
      if (keywords.has(key)) out.push({ t: text, c: "kw" });
      else if (code[TOKEN_RE.lastIndex] === "(") out.push({ t: text, c: "fn" });
      else out.push({ t: text });
    } else out.push({ t: text, c: "op" });
  }
  return out;
}

export const SQL_KEYWORDS = new Set(
  "SELECT FROM JOIN LEFT ON WHERE AND OR GROUP BY ORDER DESC ASC LIMIT AS INTERVAL IS NOT NULL CASE WHEN THEN ELSE END".split(
    " ",
  ),
);

export const PY_KEYWORDS = new Set(
  "def return for in if not and or else elif while import from as None True False".split(" "),
);
