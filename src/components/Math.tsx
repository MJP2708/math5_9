import { useMemo } from "react";
import katex from "katex";

interface MathProps {
  latex: string;
  display?: boolean;
}

export function Math({ latex, display = false }: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: display, errorColor: "#dc2626" });
    } catch {
      return latex;
    }
  }, [latex, display]);

  const Tag = display ? "div" : "span";
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
}
