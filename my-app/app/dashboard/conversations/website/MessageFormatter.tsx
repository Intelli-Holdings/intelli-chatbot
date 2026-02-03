'use client';
import React, { useState, useEffect, useCallback } from "react";
import { marked } from 'marked';
import type { Tokens } from 'marked';

interface MessageFormatterProps {
  content: string;
}

export const MessageFormatter: React.FC<MessageFormatterProps> = ({ content }) => {
  const [formattedContent, setFormattedContent] = useState('');

  const formatObject = useCallback((obj: any): string => {
    if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        `${index + 1}. ${formatObject(item)}`
      ).join('\n');
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj)
        .map(([key, value]) => `* ${key}: ${value}`)
        .join('\n');
    }
    return String(obj);
  }, []);

  useEffect(() => {
    const formatMessage = async () => {
      // Pre-process content to remove excessive asterisks
      let processedContent = content
        .replace(/\*\*/g, '')  // Remove double asterisks
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/ - /g, '\n- ') // Convert dashes to new lines with bullets
        .replace(/(\d+\.) /g, '\n$1 '); // Ensure numbers start on new lines

      // Configure marked options
      marked.setOptions({
        breaks: true,
        gfm: true
      });

      // Create a new renderer by extending the default one
      const renderer = new marked.Renderer();

      renderer.paragraph = ({ tokens }: Tokens.Paragraph) => {
        return `<p class="mb-4">${tokens.map(t => 'text' in t ? t.text : '').join('')}</p>`;
      };

      renderer.list = (token: Tokens.List) => {
        const ordered = token.ordered;
        const tag = ordered ? 'ol' : 'ul';
        return `<${tag} class="pl-6 space-y-2 mb-4 ${ordered ? 'list-decimal' : 'list-disc'}">${token.raw}</${tag}>`;
      };

      renderer.listitem = (token: Tokens.ListItem) => {
        const text = token.text || '';
        const processedText = text
          .replace(/\[object Object\]/g, '')
          .trim();
        return `<li class="mb-2">${processedText}</li>`;
      };

      renderer.heading = (token: Tokens.Heading) => {
        const text = token.text || '';
        return `<h${token.depth} class="font-bold text-lg mb-4">${text}</h${token.depth}>`;
      };

      // Process the content
      try {
        const html = await marked(processedContent, { renderer });
        setFormattedContent(html);
      } catch (e) {
        // Fallback to plain text if markdown parsing fails
        setFormattedContent(`<p>${processedContent}</p>`);
      }
    };

    formatMessage();
  }, [content, formatObject]);

  return (
    <div
      className="message-content prose prose-sm max-w-none space-y-4"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
};