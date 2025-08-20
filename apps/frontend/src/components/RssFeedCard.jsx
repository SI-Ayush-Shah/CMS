import { Button } from './Button';

const RssFeedCard = ({ 
  image, 
  title, 
  date, 
  summary, 
  onSummarizeClick,
  summarizeText = "Summarize" 
}) => {
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
        
        {/* Summarize button styled like Read More */}
        <div className="flex gap-2 items-center justify-start w-full max-w-max mt-auto">
          <Button 
            variant="solid" 
            size="md" 
            onClick={() => onSummarizeClick()} 
            className="!rounded-lg"
          >
            {summarizeText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RssFeedCard;
