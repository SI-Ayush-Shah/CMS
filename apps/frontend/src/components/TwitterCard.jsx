import { useState } from "react";
import { FaRetweet, FaRegComment, FaHeart, FaShare } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { Button } from "./Button";
import rajasthanroyals from "../assets/rr.jpg";

const TwitterCard = ({
  id,
  username,
  handle,
  date,
  content,
  image,
  status,
  onPublished,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const toggleRetweet = () => {
    setIsRetweeted(!isRetweeted);
  };

  return (
    <div className="bg-[#0E0A14] rounded-lg overflow-hidden w-full">
      {/* User info */}
      <div className="flex p-4">
        <div className="w-10 h-10 rounded-full  flex items-center justify-center text-white overflow-hidden">
          {/* {username.charAt(0).toUpperCase()} */}
          <img className="object-cover rounded-full" src={rajasthanroyals} alt={username} />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-200 font-bold text-sm">{username}</p>
              <p className="text-gray-400 text-xs">@{handle}</p>
            </div>
            <span className="text-gray-400 text-xs">{date}</span>
          </div>

          {/* Tweet content */}
          <div className="mt-2">
            <p className="text-gray-300 text-sm whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Image (if provided) */}
          {image && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img
                src={image}
                alt="Tweet attachment"
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between mt-3 text-sm">
            <button className="flex items-center text-gray-400 hover:text-blue-400 transition-colors">
              <FaRegComment className="mr-1" />
            </button>
            <button
              onClick={toggleRetweet}
              className={`flex items-center transition-colors ${isRetweeted ? "text-green-500" : "text-gray-400 hover:text-green-500"}`}
            >
              <FaRetweet className="mr-1" />
            </button>
            <button
              onClick={toggleLike}
              className={`flex items-center transition-colors ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
            >
              <FaHeart className="mr-1" />
            </button>
            <button className="flex items-center text-gray-400 hover:text-blue-400 transition-colors">
              <FaShare />
            </button>
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
      </div>
    </div>
  );
};

export default TwitterCard;
