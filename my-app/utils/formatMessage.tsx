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

    // Check if this paragraph is a header
    const headerMatch = currentText.match(/^(#{1,6})\s(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
      segments.push(
        <HeaderTag key={key++} className={`text-${7-level}xl font-bold mb-2`}>
          {content}
        </HeaderTag>
      );
    } else if (currentText.startsWith('| ') && currentText.endsWith(' |')) {
      // Table handling
      const rows = currentText.split('\n');
      const tableData = rows.map(row => row.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim()));
      
      segments.push(
        <table key={key++} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableData[0].map((header, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (/^(\d+\.|-)/.test(paragraph)) {
      // List handling
      const items = paragraph.split('\n');
      const listItems: string[] = [];
      
      items.forEach(item => {
        const cleanItem = item.replace(/^\d+\.\s+|-\s+/, '').trim();
        if (cleanItem) listItems.push(cleanItem);
      });

      const isOrdered = /^\d+\./.test(paragraph);
      const ListComponent = isOrdered ? 'ol' : 'ul';
      segments.push(
        <ListComponent key={key++} className="my-2 space-y-1 list-inside">
          {listItems.map((item, index) => (
            <li key={index} className="ml-4">
              {formatMessageContent(item)}
            </li>
          ))}
        </ListComponent>
      );
    } else {
      // Handle bold text (both ** and ***)
      currentText = currentText.replace(/(\*{2,3})(.*?)\1/g, (match, asterisks, content) => {
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

  // Handle bold text (both ** and ***)
  currentText = currentText.replace(/(\*{2,3})(.*?)\1/g, (match, asterisks, content) => {
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