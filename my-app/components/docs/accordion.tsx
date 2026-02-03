// components/docs/accordion.tsx
import { ReactNode } from 'react';
import { CodeBlock } from './code-block'; // Adjust the path if necessary

interface AccordionProps {
  title: string;
  icon?: string;
  children: ReactNode;
}

export function Accordion({ title, icon, children }: AccordionProps) {
  // Function to render content with code blocks
  const renderContent = (content: ReactNode) => {
    if (typeof content === 'string') {
      const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
      const parts = content.split(codeBlockRegex);

      return parts.map((part, index) => {
        if (index % 3 === 0) {
          return <p key={index}>{part}</p>;
        } else if (index % 3 === 1) {
          const language = part;
          const code = parts[index + 1];
          return <CodeBlock key={index} language={language}>{code}</CodeBlock>;
        }
        return null;
      });
    }
    return content;
  };

  return (
    <details className="group border-b">
      <summary className="flex items-center justify-between p-4 cursor-pointer">
        <div className="flex items-center gap-2">
          {icon && <span className={`icon-${icon}`} />}
          <h3 className="font-medium">{title}</h3>
        </div>
      </summary>
      <div className="p-4 pt-0">{renderContent(children)}</div>
    </details>
  );
}

export function AccordionGroup({ children }: { children: ReactNode }) {
  return <div className="border rounded-lg">{children}</div>;
}