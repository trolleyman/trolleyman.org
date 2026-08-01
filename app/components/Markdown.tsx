import { isValidElement } from 'react';
import hljs from 'highlight.js';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { cn } from '~/utils';

import 'highlight.js/styles/atom-one-dark.css';
import 'katex/dist/katex.min.css';

const components = {
  h1: ({ node, children, ...props }: any) => <h2 {...props}>{children}</h2>,
  h2: ({ node, children, ...props }: any) => <h3 {...props}>{children}</h3>,
  h3: ({ node, children, ...props }: any) => <h4 {...props}>{children}</h4>,
  a: ({ href, node, children, ...props }: any) => {
    const isExternal =
      href.startsWith('http://') || href.startsWith('https://');
    return (
      <Link
        to={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={props.className}
      >
        {children}
      </Link>
    );
  },
  /**
   * Highlighting happens here rather than in `code` because this is the only
   * place a code *block* can be told apart from inline code with certainty: a
   * fenced block is always wrapped in a `pre`, inline code never is. Checking
   * for a `language-` class instead would miss fences that declare no language,
   * and react-markdown dropped the `inline` prop it used to pass to `code`.
   */
  pre: ({ node, children, ...props }: any) => {
    const codeElement = isValidElement<{
      className?: string;
      children?: React.ReactNode;
    }>(children)
      ? children
      : null;
    if (!codeElement) return <pre {...props}>{children}</pre>;

    const className = codeElement.props.className ?? '';
    const language = /language-(\w+)/.exec(className)?.[1];
    const content = String(codeElement.props.children ?? '').replace(/\n$/, '');
    const highlighted = highlight(content, language);

    return (
      <pre {...props}>
        <code
          className={cn(
            className,
            language ? undefined : `language-${highlighted.language}`,
          )}
          dangerouslySetInnerHTML={{ __html: highlighted.value }}
        />
      </pre>
    );
  },
  /** Inline code is left as plain text, so it is never guessed at by hljs. */
  code: ({ node, className, children, ...props }: any) => (
    <code className={className} {...props}>
      {children}
    </code>
  ),
};

/**
 * Highlights a block, falling back to auto detection when the fence names a
 * language highlight.js does not know. Without this, a card containing
 * ```` ```notalanguage ```` would throw and take the whole page down.
 */
function highlight(content: string, language: string | undefined) {
  if (language && hljs.getLanguage(language)) {
    const result = hljs.highlight(content, { language });
    return { value: result.value, language };
  }
  const result = hljs.highlightAuto(content);
  return { value: result.value, language: result.language ?? 'plaintext' };
}

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePluginsWithHtml = [rehypeRaw, rehypeKatex];
const rehypePlugins = [rehypeKatex];

export type MarkdownProps = {
  children: string;
  className?: string;
  /**
   * Allows raw HTML through. Safe for content that comes from the repository,
   * such as blog posts. Leave it off for anything a visitor typed: today their
   * cards only ever render in their own browser, but if a sync backend is added
   * later then raw HTML becomes a way to attack whoever a deck is shared with.
   */
  allowHtml?: boolean;
  /**
   * Skips the `prose` wrapper, for callers that are already inside one such as
   * the blog's Article. Avoids nesting prose within prose.
   */
  bare?: boolean;
};

export default function Markdown({
  children,
  className,
  allowHtml,
  bare,
}: MarkdownProps) {
  const markdown = (
    <ReactMarkdown
      components={components}
      remarkPlugins={remarkPlugins}
      rehypePlugins={allowHtml ? rehypePluginsWithHtml : rehypePlugins}
    >
      {children}
    </ReactMarkdown>
  );

  if (bare) return markdown;

  return (
    <div className={cn('prose dark:prose-invert max-w-none', className)}>
      {markdown}
    </div>
  );
}
