// คอมโพเนนต์ render สูตรคณิตศาสตร์ด้วย KaTeX จากสตริง LaTeX
import katex from 'katex';
import { useMemo } from 'react';

interface Props {
  latex: string;
  display?: boolean;
  className?: string;
}

export const KaTeXSpan = ({ latex, display = false, className }: Props) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { displayMode: display, throwOnError: false, strict: false });
    } catch {
      return latex;
    }
  }, [latex, display]);
  // eslint-disable-next-line react/no-danger
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
