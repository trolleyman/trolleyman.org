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
  | 'emphasis';

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
  ['emphasis', '\\*\\*\\*[^*\\n]+\\*\\*\\*'],
  ['emphasis', '\\*\\*[^*\\n]+\\*\\*'],
  ['emphasis', '\\*[^*\\n]+\\*'],
  ['emphasis', '___[^_\\n]+___'],
  ['emphasis', '__[^_\\n]+__'],
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
 * Colour only, never weight, size or spacing. Anything that changes the metrics
 * of the text would move it out from under the caret of the textarea sitting on
 * top of it.
 */
export const TOKEN_CLASSES: Record<TokenKind, string> = {
  text: '',
  code: 'text-amber-700 dark:text-amber-300',
  math: 'text-violet-700 dark:text-violet-300',
  heading: 'text-blue-700 dark:text-blue-300',
  quote: 'text-gray-500 dark:text-gray-400',
  marker: 'text-blue-700 dark:text-blue-300',
  link: 'text-sky-700 dark:text-sky-300',
  emphasis: 'text-emerald-700 dark:text-emerald-300',
};
