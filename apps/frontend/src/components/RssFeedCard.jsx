import { useState } from 'react';
import { Button } from './Button';

const RssFeedCard = ({ image, title, date, summary, onSummarizeClick }) => {
  const formatDate = (input) => {
    if (!input) return "";
    const d = new Date(input);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  };

  return (
    <div className="flex flex-col h-full bg-surface-main-default rounded-[15px] overflow-hidden">
      {/* Image section - conditional rendering */}
      {image && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Content section */}
      <div className="flex flex-col flex-grow p-4">
        {/* Date */}
        <div className="text-xs text-invert-low mb-2">
          {formatDate(date)}
        </div>
        
        {/* Title */}
        <h3 className="text-invert-high font-medium text-lg mb-2 line-clamp-2">
          {title}
        </h3>
        
        {/* Summary */}
        <p className="text-invert-medium text-sm mb-4 line-clamp-3 flex-grow">
          {summary}
        </p>
        
        {/* Summarize button */}
        <div className="mt-auto">
          <Button 
            variant="secondary"
            size="sm"
            onClick={onSummarizeClick}
            className="w-full"
          >
            Summarize
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RssFeedCard;
