// components/docs/CodeGroup.tsx

"use client";
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CheckIcon, ClipboardIcon } from 'lucide-react';

interface CodeGroupProps {
  children: React.ReactNode;
}

const CodeGroup: React.FC<CodeGroupProps> = ({ children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCodeBlocks = () => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child) && typeof child.props.children === 'string') {
        const code = child.props.children.trim();
        const language = child.props.className?.replace('language-', '') || 'text';

        return (
          <div className="relative group mt-4 mb-6">
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => handleCopy(code)}
                className="
                  p-2 
                  rounded-md 
                  bg-gray-100 
                  dark:bg-gray-800 
                  text-gray-600 
                  dark:text-gray-300
                  hover:bg-gray-200 
                  dark:hover:bg-gray-700
                  transition-all 
                  duration-200
                  opacity-0 
                  group-hover:opacity-100
                "
                aria-label="Copy code"
              >
                {copied ? (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ClipboardIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <SyntaxHighlighter language={language} style={oneDark}>
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }
      return null;
    });
  };

  return <div>{renderCodeBlocks()}</div>;
};

export default CodeGroup;