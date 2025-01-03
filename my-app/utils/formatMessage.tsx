import React from 'react';

export const formatMessage = (text: string) => {
  // Split text into paragraphs first
  const paragraphs = text.split('\n\n');
  const formattedParagraphs: JSX.Element[] = [];
  let paragraphKey = 0;

  paragraphs.forEach(paragraph => {
    const segments: JSX.Element[] = [];
    let currentText = paragraph;
    let key = 0;

    // Check if this paragraph is a list
    const isList = /^(\d+\.|-)/.test(paragraph);
    const listItems: string[] = [];
    
    if (isList) {
      // Split into list items
      const items = paragraph.split('\n');
      items.forEach(item => {
        // Remove list markers and trim
        const cleanItem = item.replace(/^\d+\.\s+|-\s+/, '').trim();
        if (cleanItem) listItems.push(cleanItem);
      });

      // Create list element
      const isOrdered = /^\d+\./.test(paragraph);
      const ListComponent = isOrdered ? 'ol' : 'ul';
      segments.push(
        <ListComponent key={key++} className="my-2 space-y-1">
          {listItems.map((item, index) => (
            <li key={index} className="ml-4">
              {formatMessageContent(item)}
            </li>
          ))}
        </ListComponent>
      );
    } else {
      // Handle bold text
      currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
        segments.push(
          <strong key={key++} className="font-semibold">
            {content}
          </strong>
        );
        return '\u0000';
      });

      // Handle italic text
      currentText = currentText.replace(/\*(.*?)\*/g, (match, content) => {
        segments.push(
          <em key={key++} className="italic">
            {content}
          </em>
        );
        return '\u0000';
      });

      // Handle links [text](url)
      currentText = currentText.replace(/\[(.*?)\]$$(.*?)$$/g, (match, text, url) => {
        segments.push(
          <a 
            key={key++} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline"
          >
            {text}
          </a>
        );
        return '\u0000';
      });

      // Split remaining text by placeholder and combine with formatted segments
      const parts = currentText.split('\u0000');
      const result: JSX.Element[] = [];
      
      for (let i = 0; i < Math.max(parts.length, segments.length); i++) {
        if (parts[i]) {
          result.push(<span key={`text-${i}`}>{parts[i]}</span>);
        }
        if (segments[i]) {
          result.push(segments[i]);
        }
      }

      formattedParagraphs.push(
        <p key={paragraphKey++} className="mb-3 last:mb-0">
          {result}
        </p>
      );
    }
  });

  return <div className="space-y-2">{formattedParagraphs}</div>;
};

// Helper function to format individual list items or other content
const formatMessageContent = (text: string) => {
  const segments: JSX.Element[] = [];
  let currentText = text;
  let key = 0;

  // Handle bold text
  currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
    segments.push(
      <strong key={key++} className="font-semibold">
        {content}
      </strong>
    );
    return '\u0000';
  });

  // Handle italic text
  currentText = currentText.replace(/\*(.*?)\*/g, (match, content) => {
    segments.push(
      <em key={key++} className="italic">
        {content}
      </em>
    );
    return '\u0000';
  });

  // Handle links
  currentText = currentText.replace(/\[(.*?)\]$$(.*?)$$/g, (match, text, url) => {
    segments.push(
      <a 
        key={key++} 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-500 hover:underline"
      >
        {text}
      </a>
    );
    return '\u0000';
  });

  const parts = currentText.split('\u0000');
  const result: JSX.Element[] = [];
  
  for (let i = 0; i < Math.max(parts.length, segments.length); i++) {
    if (parts[i]) {
      result.push(<span key={`text-${i}`}>{parts[i]}</span>);
    }
    if (segments[i]) {
      result.push(segments[i]);
    }
  }

  return <>{result}</>;
};

