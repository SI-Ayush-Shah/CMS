import { useState } from "react";
import { FaHeart, FaComment, FaShare } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { Button } from "./Button";

const InstagramCard = ({
  id,
  image,
  username,
  date,
  title,
  hashtags,
  likes,
  comments,
  status,
  onPublished,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div className="bg-[#0E0A14] rounded-lg overflow-hidden w-full">
      {/* User info */}
      <div className="flex items-center p-3">
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white overflow-hidden">
          {username.charAt(0).toUpperCase()}
        </div>
        <div className="ml-2">
          <p className="text-gray-200 font-medium text-sm">{username}</p>
          <p className="text-gray-400 text-xs">{date}</p>
        </div>
      </div>

      {/* Image - 1:1 aspect ratio */}
      <div className="aspect-square w-full overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Action buttons */}
        <div className="flex items-center mb-2">
          <button
            onClick={toggleLike}
            className={`mr-4 transition-colors ${isLiked ? "text-red-500" : "text-gray-300 hover:text-red-500"}`}
            aria-label="Like"
          >
            <FaHeart />
          </button>
          <button
            className="mr-4 text-gray-300 hover:text-gray-100"
            aria-label="Comment"
          >
            <FaComment />
          </button>
          <button
            className="text-gray-300 hover:text-gray-100"
            aria-label="Share"
          >
            <FaShare />
          </button>
        </div>

        {/* Likes */}
        {/* <p className="text-gray-200 text-sm font-medium mb-1">{likes} likes</p> */}

        {/* Caption */}
        <div className="mb-2">
          <span className="text-gray-200 text-sm font-medium mr-2">
            {username}
          </span>
          <span className="text-gray-300 text-sm">{title}</span>
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {hashtags.map((tag, index) => (
            <span
              key={index}
              className="text-purple-400 text-xs hover:underline cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Comments count */}
        <p className="text-gray-400 text-xs">Read more ...</p>
      </div>

      <div className="flex gap-2 items-center justify-start w-full max-w-max mt-4">
        <Button
          variant="solid"
          size="sm"
          onClick={() => onPublished && onPublished(id)}
          className="!rounded-lg py-1"
          disabled={status === "published"}
        >
          <HiOutlineSparkles className="text-lg" />
          {status === "published" ? "Published" : "Publish"}
        </Button>
      </div>
    </div>
  );
};

export default InstagramCard;
