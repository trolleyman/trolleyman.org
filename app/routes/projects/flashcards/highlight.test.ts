import { describe, expect, it } from 'vitest';

import { type TokenKind, tokenize } from './highlight';

function kinds(input: string, kind: TokenKind): string[] {
  return tokenize(input)
    .filter((token) => token.kind === kind)
    .map((token) => token.text);
}

function rebuild(input: string): string {
  return tokenize(input)
    .map((token) => token.text)
    .join('');
}

describe('tokenize round trip', () => {
  // This is the property the overlay editor depends on. If the tokens ever stop
  // reconstructing the input exactly, the highlighted layer drifts out of
  // alignment with the textarea on top of it.
  const samples = [
    '',
    'plain text',
    'a `code` span',
    'maths $x^2$ inline',
    '$$\\int_0^1 x\\,dx$$',
    '# heading\n\ntext',
    '- one\n- two\n1. three',
    '> quoted\n> more',
    '[link](https://example.com) and ![img](a.png)',
    '**bold** and *italic* and _under_ and ***all***',
    '```python\ndef f():\n    return 1\n```',
    'unterminated `code',
    'unterminated ```fence\nstuff',
    'unterminated $math',
    'trailing newline\n',
    '\n\n\n',
    'mixed `a` $b$ **c** [d](e) # not a heading',
    'a*b*c_d_e',
    '****',
    '$$',
    '```',
  ];

  it.each(samples)('rebuilds %j exactly', (sample) => {
    expect(rebuild(sample)).toBe(sample);
  });

  it('rebuilds a long mixed document', () => {
    const document = samples.join('\n\n');
    expect(rebuild(document)).toBe(document);
  });

  it('never emits an empty token', () => {
    for (const sample of samples) {
      for (const token of tokenize(sample)) {
        expect(token.text.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('code', () => {
  it('picks up inline code', () => {
    expect(kinds('use `xs[::-1]` here', 'code')).toEqual(['`xs[::-1]`']);
  });

  // Fenced blocks are their own kind because they are drawn differently from
  // inline code: their background runs the full width of the field.
  it('picks up a fenced block including the fences', () => {
    expect(kinds('```js\nlet a = 1\n```', 'codeBlock')).toEqual([
      '```js\nlet a = 1\n```',
    ]);
    expect(kinds('```js\nlet a = 1\n```', 'code')).toEqual([]);
  });

  it('runs an unterminated fence to the end rather than giving up', () => {
    expect(kinds('```js\nlet a = 1', 'codeBlock')).toEqual([
      '```js\nlet a = 1',
    ]);
  });

  it('keeps a fence with a blank line in it as one token', () => {
    expect(kinds('```\na\n\nb\n```', 'codeBlock')).toEqual([
      '```\na\n\nb\n```',
    ]);
  });

  it('does not confuse inline code for a block', () => {
    expect(kinds('a `b` c', 'code')).toEqual(['`b`']);
    expect(kinds('a `b` c', 'codeBlock')).toEqual([]);
  });

  it('does not treat emphasis inside code as emphasis', () => {
    expect(kinds('`a *b* c`', 'emphasis')).toEqual([]);
  });
});

describe('maths', () => {
  it('picks up inline maths', () => {
    expect(kinds('so $e^{i\\pi}$ then', 'math')).toEqual(['$e^{i\\pi}$']);
  });

  it('picks up display maths spanning lines', () => {
    expect(kinds('$$\na = b\n$$', 'math')).toEqual(['$$\na = b\n$$']);
  });

  it('leaves a lone dollar alone', () => {
    expect(kinds('costs $5', 'math')).toEqual([]);
  });
});

describe('structure', () => {
  it('picks up headings only at the start of a line', () => {
    expect(kinds('# yes\nnot # no', 'heading')).toEqual(['# yes']);
  });

  it('requires a space after the hashes', () => {
    expect(kinds('#tag', 'heading')).toEqual([]);
  });

  it('picks up list markers without swallowing the item text', () => {
    expect(kinds('- one\n2. two', 'marker')).toEqual(['- ', '2. ']);
  });

  it('picks up block quotes', () => {
    expect(kinds('> a quote', 'quote')).toEqual(['> a quote']);
  });

  it('picks up links and images', () => {
    expect(kinds('[a](b) ![c](d)', 'link')).toEqual(['[a](b)', '![c](d)']);
  });
});

describe('emphasis', () => {
  // Bold and italic are separate kinds because they are drawn differently, so
  // the marker count has to decide which one a run gets.
  it('separates bold from italic', () => {
    expect(kinds('**a**', 'strong')).toEqual(['**a**']);
    expect(kinds('**a**', 'emphasis')).toEqual([]);
    expect(kinds('*a*', 'emphasis')).toEqual(['*a*']);
    expect(kinds('*a*', 'strong')).toEqual([]);
  });

  it('treats three markers as both', () => {
    expect(kinds('***a***', 'strongEmphasis')).toEqual(['***a***']);
    expect(kinds('___a___', 'strongEmphasis')).toEqual(['___a___']);
    expect(kinds('***a***', 'strong')).toEqual([]);
  });

  it('handles both underscore and asterisk forms', () => {
    expect(kinds('_a_ and *b*', 'emphasis')).toEqual(['_a_', '*b*']);
    expect(kinds('__a__ and **b**', 'strong')).toEqual(['__a__', '**b**']);
  });

  it('does not run across lines', () => {
    expect(kinds('*a\nb*', 'emphasis')).toEqual([]);
    expect(kinds('**a\nb**', 'strong')).toEqual([]);
  });

  it('does not treat bold inside code as bold', () => {
    expect(kinds('`a **b** c`', 'strong')).toEqual([]);
  });
});
