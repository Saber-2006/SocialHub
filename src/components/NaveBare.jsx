import React from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { FaHome } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import AccountMenu from "./AccountMenu";
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { useState } from 'react';
import { IoChatbox } from "react-icons/io5";


export default function NaveBare() {
  const navigate = useNavigate();
  const location = useLocation();
const [isDarkMode, setDarkMode] = useState(false);

const toggleDarkMode = (checked) => {
  setDarkMode(checked);
  if (checked) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

  const pathToValue = {
    "/": "home",
    "/Followers": "followers",
    "/profile": "profile",
    "/chat": "chat",
  };

  const value = pathToValue[location.pathname] ?? "home";

  const handleChange = (event, newValue) => {
    const valueToPath = {
      home: "/",
      followers: "/Followers",
      profile: "/profile",
      chat: "/chat",
      "new-group-chat": "/chat/new-group",
    };
    navigate(valueToPath[newValue]);
  };

  return (
    <>
      <div className="sticky top-0 z-50  left-0 mb-4 w-full flex justify-between items-center p-3 shadow-lg bg-white/10  backdrop-blur-sm  z-50. dark:bg-gray-800">
        
        {/* logo */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white rounded-xl font-bold text-xl w-10 h-10 flex items-center justify-center">
            S
          </div>
          <h1 className="text-blue-500 text-xl font-bold hidden md:block">SocialHub</h1>
        </div>
{/* navgation */}
        <div className="flex items-center gap-3">
          <BottomNavigation  value={value} onChange={handleChange} style={{ backgroundColor: "transparent" }} >
            <BottomNavigationAction label="home" value="home" icon={<FaHome  className="dark:text-white"/>} className="text-xl" />
            <BottomNavigationAction label="followers" value="followers" icon={<BsFillPeopleFill  className="dark:text-white"/>} className="text-xl" />
            <BottomNavigationAction label="profile" value="profile" icon={<FaUser className="dark:text-white" />} className="text-xl" />
            <BottomNavigationAction label="chat" value="chat" icon={<IoChatbox className="dark:text-white" />} className="text-xl" />
            
          </BottomNavigation>
        </div>
        <div className="flex items-center gap-3">
          <AccountMenu />
<button
  onClick={() => toggleDarkMode(!isDarkMode)}
  className="w-9 h-9 flex items-center justify-center rounded-full text-xl"
>
  {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
</button>
      </div>
      </div>
    </>
  );
}