import React, { useState, useEffect } from "react";
import {
  FaShoppingBag,
  FaUser,
  FaWhatsapp,
  FaGooglePlay,
  FaApple,
  FaChevronDown,
} from "react-icons/fa";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    console.log("Header component mounted!");
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    console.log("Dark mode toggled:", !isDarkMode);
  };

  return (
    <header className="w-full z-50 relative">
      {/* Top Section - Pink Background */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white flex ">
        <div className="flex items-center w-25 ">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/This_is_the_logo_for_Rajasthan_Royals%2C_a_cricket_team_playing_in_the_Indian_Premier_League_%28IPL%29.svg/800px-This_is_the_logo_for_Rajasthan_Royals%2C_a_cricket_team_playing_in_the_Indian_Premier_League_%28IPL%29.svg.png"
            alt="logo"
            className=" w-full h-full"
          />
        </div>
        <div className="w-full ">
          <div className="flex items-center justify-between h-10">
            {/* Middle - Navigation Links */}
            <div className="flex items-center gap-2 px-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold hover:text-pink-200 transition-colors cursor-pointer">
                  ROYALS ACADEMY
                </span>
                <div className="w-px h-4 bg-white opacity-50"></div>
                <span className="text-[11px] font-semibold hover:text-pink-200 transition-colors cursor-pointer">
                  ROYALS SCHOOL OF BUSINESS
                </span>
                <div className="w-px h-4 bg-white opacity-50"></div>
                <span className="text-[11px] font-semibold hover:text-pink-200 transition-colors cursor-pointer">
                  ROYAL RAJASTHAN FOUNDATION
                </span>
              </div>
            </div>

            {/* Right - Utility Elements */}
            <div className="flex items-center gap-2 px-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold hover:text-pink-200 transition-colors cursor-pointer flex items-center space-x-2">
                  <FaShoppingBag className="w-4 h-4" />
                  <span>SHOP</span>
                </span>
                <div className="w-px h-4 bg-white opacity-50"></div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-semibold">DARK MODE</span>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                      isDarkMode ? "bg-white" : "bg-white bg-opacity-30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-pink-600 transition-transform ${
                        isDarkMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="w-px h-4 bg-white opacity-50"></div>

                <span className="text-[11px] font-semibold hover:text-pink-200 transition-colors cursor-pointer flex items-center space-x-2">
                  <FaUser className="w-4 h-4" />
                  <span>LOGIN</span>
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#950460] text-white">
            <div className="w-full">
              <div className="flex items-center justify-between h-13 w-full">
                {/* Left - Content Navigation */}
                <div className="flex items-center gap-3 px-2">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-pink-200 transition-colors">
                      <span className="text-[11px] font-semibold">Latest</span>
                      <FaChevronDown className="w-3 h-3" />
                    </div>
                    <div className="w-px h-4 bg-white opacity-50"></div>

                    <div className="flex items-center space-x-2 cursor-pointer hover:text-pink-200 transition-colors">
                      <span className="text-[11px] font-semibold">IPL 2025</span>
                      <FaChevronDown className="w-3 h-3" />
                    </div>
                    <div className="w-px h-4 bg-white opacity-50"></div>

                    <div className="flex items-center space-x-2 cursor-pointer hover:text-pink-200 transition-colors">
                      <span className="text-[11px] font-semibold">Fan Zone</span>
                      <FaChevronDown className="w-3 h-3" />
                    </div>
                    <div className="w-px h-4 bg-white opacity-50"></div>

                    <div className="flex items-center space-x-2 cursor-pointer hover:text-pink-200 transition-colors">
                      <span className="text-[11px] font-semibold">Royals Corner</span>
                      <FaChevronDown className="w-3 h-3" />
                    </div>
                    <div className="w-px h-4 bg-white opacity-50"></div>

                    <span className="text-[11px] font-semibold cursor-pointer hover:text-pink-200 transition-colors">
                      हिंदी
                    </span>
                  </div>
                </div>

                {/* Right - App Downloads and WhatsApp */}
                <div className="flex items-center gap-2 px-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold">Download App</span>
                    <FaGooglePlay className="w-5 h-5 cursor-pointer hover:text-pink-200 transition-colors" />
                    <FaApple className="w-5 h-5 cursor-pointer hover:text-pink-200 transition-colors" />
                  </div>

                  <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-1 rounded-lg font-semibold flex items-center space-x-2 transition-colors">
                    <FaWhatsapp className="w-4 h-4" />
                    <span className="text-[11px] font-semibold">WHATSAPP</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Magenta Background */}
    </header>
  );
};

export default Header;
