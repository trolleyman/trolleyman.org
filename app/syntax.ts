/**
 * Syntax highlighting, shared by rendered markdown and the flashcard editor.
 *
 * highlight.js is imported through `lib/core` with languages registered by
 * hand, rather than as the default bundle. The default bundle carries all ~190
 * grammars, which measured at 306KB gzipped, against 26KB for the list below.
 * That was most of the JavaScript on the site.
 *
 * Adding a language is one import and one registration. Registering one also
 * brings its aliases with it, so `javascript` covers `js` and `jsx`, `xml`
 * covers `html` and `svg`, `markdown` covers `md`, `bash` covers `sh`, `python`
 * covers `py`, and `cpp` covers `c++`, `cc` and `hpp`.
 */
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

for (const [name, language] of [
  ['bash', bash],
  ['c', c],
  ['cpp', cpp],
  ['css', css],
  ['diff', diff],
  ['go', go],
  ['java', java],
  ['javascript', javascript],
  ['json', json],
  ['markdown', markdown],
  ['python', python],
  ['rust', rust],
  ['sql', sql],
  ['typescript', typescript],
  ['xml', xml],
  ['yaml', yaml],
] as const) {
  hljs.registerLanguage(name, language);
}

/**
 * Highlights a block against the language its fence declared, or returns null
 * to say it should be left alone.
 *
 * There is deliberately no auto detection. Guessing gets it wrong often enough
 * to be worse than plain text, and it used to colour short snippets as whatever
 * language they happened to resemble. A language that is not registered above
 * takes the same path as no language at all: rendered plain rather than guessed
 * at, and never thrown over.
 */
export function highlight(
  content: string,
  language: string | undefined,
): string | null {
  if (!language || !hljs.getLanguage(language)) return null;
  return hljs.highlight(content, { language }).value;
}
