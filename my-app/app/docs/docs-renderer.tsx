// app/docs/docs-renderer.tsx
"use client";
import { useMemo } from 'react';
import { getMDXComponent } from 'mdx-bundler/client';
import { Card, CardGroup } from "@/components/docs/card";
import { Accordion, AccordionGroup } from "@/components/docs/accordion";

interface DocsRendererProps {
  code: string;
  frontmatter?: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
}

const mdxComponents = {
  Card,
  CardGroup,
  Accordion,
  AccordionGroup,
};

export default function DocsRenderer({ code, frontmatter }: DocsRendererProps) {
  const Component = useMemo(() => {
    if (!code) return null;
    return getMDXComponent(code);
  }, [code]);
  
  if (!Component) {
    return <div>Loading...</div>;
  }

  return (
    <div className="docs-container max-w-5xl mx-auto px-4 py-8">
      <div className="prose dark:prose-invert">
        <Component components={mdxComponents} />
      </div>
    </div>
  );
}