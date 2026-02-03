import React from 'react';

interface HighlightMatchProps {
  text: string | null | undefined;
  searchTerm: string | null | undefined;
  className?: string; // Allow passing additional class names
}

const HighlightMatch: React.FC<HighlightMatchProps> = ({ text, searchTerm, className }) => {
  if (!searchTerm || !text) {
    return <span className={className}>{text || 'N/A'}</span>; // Return original text if no search term or text
  }

  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  while (lastIndex < text.length) {
    const index = lowerText.indexOf(lowerSearchTerm, lastIndex);

    if (index === -1) {
      parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
      break; // No more matches
    }

    // Add the part before the match
    if (index > lastIndex) {
      parts.push(<span key={`pre-${lastIndex}`}>{text.substring(lastIndex, index)}</span>);
    }

    // Add the highlighted match
    const match = text.substring(index, index + searchTerm.length);
    parts.push(
      <span key={index} className="bg-yellow-200 font-semibold">
        {match}
      </span>
    );

    lastIndex = index + searchTerm.length;
  }

  return <span className={className}>{parts}</span>;
};

export default HighlightMatch; 