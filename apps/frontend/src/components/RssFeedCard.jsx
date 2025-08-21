import { Button } from './Button';
import { HiOutlineSparkles } from "react-icons/hi2";
import ContentCard from './ContentCard';

const RssFeedCard = ({ 
  image, 
  title, 
  date, 
  summary, 
  onSummarizeClick,
  summarizeText = "Summarize" 
}) => {
  return (
    <ContentCard
      image={image}
      date={date}
      title={title}
      description={summary}
      button={
        <Button 
          variant="solid" 
          size="sm" 
          onClick={() => onSummarizeClick()} 
          className="!rounded-lg"
        >
          <HiOutlineSparkles className="text-lg" />
          {summarizeText}
        </Button>
      }
    />
  );
};

export default RssFeedCard;
