import React, { useState } from 'react';

interface MessageContentProps {
  text: string | null;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const processTextWithLinks = (text: string): (string | JSX.Element)[] => {
  const urlRegex = /(https?:\/\/[^\s\]]+|\[([^\]]+)\]$$([^\s$$]+)\))/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      const match = part.match(/\[([^\]]+)\]$$([^\s$$]+)\)/);
      if (match) {
        const [, linkText, url] = match;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            title={url}
          >
            {linkText}
          </a>
        );
      } else {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            title={part}
          >
            {part}
          </a>
        );
      }
    }
    return part;
  });
};

const processInlineStyles = (content: string | (string | JSX.Element)[]): (string | JSX.Element)[] => {
  if (Array.isArray(content)) {
    return content.map((item, index) => {
      if (typeof item === 'string') {
        const parts = item.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return parts.map((part, subIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={`${index}-${subIndex}`}>{part.slice(2, -2)}</strong>;
          } else if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={`${index}-${subIndex}`}>{part.slice(1, -1)}</em>;
          }
          return part;
        });
      }
      return item;
    }).flat();
  }
  
  const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    } else if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const formatTable = (tableContent: string): JSX.Element => {
  const rows = tableContent.split('\n').map(row => row.trim()).filter(row => row.length > 0);
  const headers = rows[0].split('|').map(header => header.trim()).filter(header => header.length > 0);
  const bodyRows = rows.slice(2); // Skip the header and separator rows

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {processInlineStyles(header)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {bodyRows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.split('|').map((cell, cellIndex) => (
              <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {processInlineStyles(cell.trim())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const formatContent = (text: string): JSX.Element => {
  const lines = text.split('\n');
  const formattedLines: JSX.Element[] = [];
  
  let currentList: JSX.Element[] = [];
  let isProcessingList = false;
  let isProcessingTable = false;
  let tableContent = '';
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Table handling
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      if (!isProcessingTable) {
        isProcessingTable = true;
        tableContent = trimmedLine + '\n';
      } else {
        tableContent += trimmedLine + '\n';
      }
      return;
    } else if (isProcessingTable) {
      formattedLines.push(formatTable(tableContent));
      isProcessingTable = false;
      tableContent = '';
    }

    // List handling
    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d+\.*/.test(trimmedLine)) {
      isProcessingList = true;
      const itemText = trimmedLine.replace(/^[-•\d+\.]\s*/, '').trim();
      currentList.push(
        <li key={index} className="py-1 flex items-start">
          <span className="mr-2 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-60" />
          <span>{processInlineStyles(processTextWithLinks(itemText))}</span>
        </li>
      );
    } else {
      if (isProcessingList && currentList.length > 0) {
        formattedLines.push(
          <ul key={`list-${index}`} className="space-y-1 pl-4 list-none">
            {currentList}
          </ul>
        );
        currentList = [];
        isProcessingList = false;
      }
      
      if (trimmedLine) {
        const headingMatch = trimmedLine.match(/^(#{1,6})\s(.+)$/);
        if (headingMatch) {
          const [, hashes, content] = headingMatch;
          const HeadingTag = `h${hashes.length}` as keyof JSX.IntrinsicElements;
          formattedLines.push(
            <HeadingTag key={`heading-${index}`} className={`text-${7-hashes.length}xl font-bold mb-2`}>
              {processInlineStyles(processTextWithLinks(content))}
            </HeadingTag>
          );
        } else {
          formattedLines.push(
            <p key={index}>
              {processInlineStyles(processTextWithLinks(trimmedLine))}
            </p>
          );
        }
      }
    }
  });
  
  if (currentList.length > 0) {
    formattedLines.push(
      <ul key="final-list" className="space-y-1 pl-4 list-none">
        {currentList}
      </ul>
    );
  }

  if (isProcessingTable) {
    formattedLines.push(formatTable(tableContent));
  }
  
  return <div className="space-y-2">{formattedLines}</div>;
};

export const MessageContent: React.FC<MessageContentProps> = ({ 
  text, 
  isExpanded = false,
  onToggle 
}) => {
  if (!text) return null;
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formattedContent = React.useMemo(() => {
    return formatContent(text);
  }, [text]);
  
  return (
    <div className={`message-content ${!isExpanded ? 'collapsed' : ''}`}>
      <div className="prose prose-sm">
        {formattedContent}
      </div>
      {text.split('\n').length > 4 && (
        <button 
          onClick={onToggle}
          className="read-more hover:opacity-80"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

export const FormattedMessage: React.FC<{ text: string | null }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <MessageContent 
      text={text}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    />
  );
};

export const formatMessage = (text: string): JSX.Element => {
  return <FormattedMessage text={text} />;
};

