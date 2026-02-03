"use client";
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CheckIcon, ClipboardIcon } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className,
  language = 'typescript',
}) => {
  const [copied, setCopied] = useState(false);

  // Extract the language from the className if provided
  const extractedLanguage = 
    className?.replace(/^language-/, '') || language;

  const handleCopy = () => {
    if (typeof children === 'string') {
      navigator.clipboard.writeText(children.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Ensure children is a string
  let codeString = '';
  if (typeof children === 'string') {
    codeString = children.trim();
  } else if (React.isValidElement(children) && typeof children.props.children === 'string') {
    codeString = children.props.children.trim();
  }

  return (
    <div className="relative group mt-4 mb-6">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleCopy}
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
      <SyntaxHighlighter
        language={extractedLanguage}
        style={oneDark}
        customStyle={{
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
        }}
        codeTagProps={{
          className: 'text-sm',
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};