// components/docs/latex.tsx

import { InlineMath, BlockMath } from 'react-katex';

interface LatexProps {
  children: string;
  block?: boolean;
}

export function Latex({ children, block = false }: LatexProps) {
  return block ? <BlockMath>{children}</BlockMath> : <InlineMath>{children}</InlineMath>;
}