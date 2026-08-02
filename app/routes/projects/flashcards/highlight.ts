/**
 * A deliberately small markdown tokeniser for the editor's syntax highlighting.
 *
 * This is not a parser and does not try to be correct in the way remark is. It
 * only needs to be good enough to colour text as it is typed, and to fail
 * quietly on half written syntax, since every keystroke passes through it mid
 * construction. The one hard requirement is that the tokens concatenate back to
 * exactly the input, because they are painted underneath a transparent textarea
 * and any dropped or added character would shift the text out of alignment.
 */

export type TokenKind =
  | 'text'
  | 'code'
  | 'math'
  | 'heading'
  | 'quote'
  | 'marker'
  | 'link'
  | 'strong'
  | 'emphasis'
  | 'strongEmphasis';

export interface Token {
  text: string;
  kind: TokenKind;
}

/**
 * Ordered by priority: the first pattern to match at a position wins. Code and
 * maths come first so that a `*` or `_` inside them is left alone.
 */
/**
 * End of input. Not `$`, because these patterns are compiled with the `m` flag
 * for the line anchored rules below, which would make `$` stop a multi-line
 * fence at the end of its first line.
 */
const END = '(?![\\s\\S])';

const PATTERNS: [TokenKind, string][] = [
  ['code', `\`\`\`[\\s\\S]*?(?:\`\`\`|${END})`],
  ['code', '``[^`]*``'],
  ['code', '`[^`\\n]*`'],
  ['math', `\\$\\$[\\s\\S]*?(?:\\$\\$|${END})`],
  ['math', '\\$[^$\\n]+\\$'],
  ['heading', '^[ \\t]*#{1,6}[ \\t].*$'],
  ['quote', '^[ \\t]*>[ \\t]?.*$'],
  ['marker', '^[ \\t]*(?:[-*+]|\\d+[.)])[ \\t]+'],
  ['link', '!?\\[[^\\]\\n]*\\]\\([^)\\n]*\\)'],
  ['strongEmphasis', '\\*\\*\\*[^*\\n]+\\*\\*\\*'],
  ['strong', '\\*\\*[^*\\n]+\\*\\*'],
  ['emphasis', '\\*[^*\\n]+\\*'],
  ['strongEmphasis', '___[^_\\n]+___'],
  ['strong', '__[^_\\n]+__'],
  ['emphasis', '_[^_\\n]+_'],
];

const SCANNER = new RegExp(
  PATTERNS.map(([, pattern], index) => `(?<g${index}>${pattern})`).join('|'),
  'gm',
);

function kindOf(match: RegExpExecArray): TokenKind {
  const groups = match.groups ?? {};
  for (let index = 0; index < PATTERNS.length; index++) {
    if (groups[`g${index}`] !== undefined) return PATTERNS[index][0];
  }
  return 'text';
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;

  SCANNER.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SCANNER.exec(input)) !== null) {
    // A zero length match would spin forever, so step past it. No pattern here
    // can match empty today, but that is one careless edit away.
    if (match[0] === '') {
      SCANNER.lastIndex++;
      continue;
    }
    if (match.index > last) {
      tokens.push({ text: input.slice(last, match.index), kind: 'text' });
    }
    tokens.push({ text: match[0], kind: kindOf(match) });
    last = match.index + match[0].length;
  }

  if (last < input.length) {
    tokens.push({ text: input.slice(last), kind: 'text' });
  }
  return tokens;
}

/**
 * Colour, weight and slant, but never size or letter spacing.
 *
 * Bold is safe here only because Fira Code is duplexed: its 700 weight has the
 * same advance width as its 400 weight for every glyph, so bolding a run of
 * text does not move any character sideways. That matters because only the
 * highlighted layer is styled, while the textarea over it stays at weight 400,
 * so the two must agree on where every character sits.
 *
 * Do not add font-size, letter-spacing or a non duplexed family here. See the
 * `font-synthesis-weight` note in MarkdownInput for what protects the fallback
 * case where Fira Code has not loaded.
 */
export const TOKEN_CLASSES: Record<TokenKind, string> = {
  text: '',
  code: 'text-amber-700 dark:text-amber-300',
  math: 'text-violet-700 dark:text-violet-300',
  heading: 'font-bold text-blue-700 dark:text-blue-300',
  quote: 'text-gray-500 dark:text-gray-400',
  marker: 'font-bold text-blue-700 dark:text-blue-300',
  link: 'text-sky-700 dark:text-sky-300',
  strong: 'font-bold text-emerald-700 dark:text-emerald-300',
  emphasis: 'italic text-emerald-700 dark:text-emerald-300',
  strongEmphasis: 'font-bold italic text-emerald-700 dark:text-emerald-300',
};
