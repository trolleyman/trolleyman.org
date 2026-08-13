import { describe, expect, it } from 'vitest';

import { highlight } from './syntax';

/**
 * Recovers the plain text from highlight.js output. The editor paints that
 * output underneath a transparent textarea, so if highlighting ever added or
 * dropped a character the two would stop lining up.
 */
function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&');
}

describe('highlight', () => {
  it('colours a language it knows', () => {
    const result = highlight('def f():\n    return 1', 'python');
    expect(result).toContain('hljs-keyword');
  });

  // Languages are registered by hand now, so a missing one is a silent
  // regression rather than a crash. These are the ones the site actually uses.
  it.each([
    ['javascript', 'let a = 1'],
    ['js', 'let a = 1'],
    ['typescript', 'let a: number = 1'],
    ['ts', 'let a: number = 1'],
    ['python', 'def f(): pass'],
    ['py', 'def f(): pass'],
    ['xml', '<a href="#">x</a>'],
    ['html', '<a href="#">x</a>'],
    ['markdown', '# heading'],
    ['md', '# heading'],
    ['bash', 'echo hi'],
    ['sh', 'echo hi'],
    ['json', '{"a": 1}'],
    ['css', 'a { color: red }'],
    ['rust', 'fn main() {}'],
    ['c', 'int main(void) { return 0; }'],
    ['cpp', 'int main() { return 0; }'],
    ['java', 'class A {}'],
    ['sql', 'select 1'],
    ['yaml', 'a: 1'],
    ['go', 'func main() {}'],
    ['diff', '+ added'],
  ])('knows %s, including as an alias', (language, snippet) => {
    expect(highlight(snippet, language)).not.toBeNull();
  });

  it('leaves an unregistered language alone rather than guessing', () => {
    expect(highlight('some text', 'notalanguage')).toBeNull();
    expect(highlight('let a = 1', 'brainfuck')).toBeNull();
  });

  it('leaves a fence with no language alone', () => {
    expect(highlight('let a = 1', undefined)).toBeNull();
    expect(highlight('let a = 1', '')).toBeNull();
  });

  it.each([
    ['python', 'x = "a & b" # <tag>'],
    ['javascript', 'const s = `a ${b} <c> & "d"`;'],
    ['xml', '<a href="?x=1&y=2">t</a>'],
    ['json', '{"a": "<b> & \\"c\\""}'],
    ['python', ''],
    ['python', '\n\n\n'],
    ['python', '   leading and trailing   '],
  ])('preserves the text of %s exactly', (language, source) => {
    const html = highlight(source, language);
    if (html === null) throw new Error('expected this language to be known');
    expect(textOf(html)).toBe(source);
  });
});
