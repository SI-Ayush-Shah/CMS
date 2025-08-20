import React from "react";
import { FaCalendarAlt, FaShare } from "react-icons/fa";
import { IoShareSocial } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const CricketNewsCard = ({ id, title, date, imageUrl, description }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/details/${id}`);
  };

  return (
    <div 
      className="w-[270px] h-[250px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-[150px] overflow-hidden">
        {/* Cricket Player Image */}
        <img
          src={imageUrl || "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc"}
          alt="Cricket News"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="p-4 relative bg-white">
        <div className="absolute -top-[2px] left-0 w-full h-full">
          <div className="flex items-center justify-center w-[80%]  h-1 mx-auto bg-pink-500 rounded-full "></div>
        </div>
        {/* Headline */}
        <h3 className="text-sm text-left font-bold text-gray-800 leading-tight mb-3 line-clamp-2">
          {title || "Sanju Samson makes the cut in India's Asia Cup 2025 squad"}
        </h3>

        {/* Date and Share Row */}
        <div className="flex items-center justify-between">
          {/* Date */}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded-full flex items-center justify-center">
              <FaCalendarAlt className="w-2 h-2 text-gray-500" />
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {date || "19 Aug, 2025"}
            </span>
          </div>

          {/* Share Icon */}
          <IoShareSocial className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default CricketNewsCard;
