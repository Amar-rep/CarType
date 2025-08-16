import {Bell, User} from "lucide-react";
import React from "react";
import Image from "next/image";
import Logo from "./Logo";
export const LogoHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center w-full ">
      {/* Left side: Logo and Name */}
      <div className="flex  flex-col ml-5 relative">
        <div className="text-zinc-400 tracking-wider">Car see</div>
        <h1 className="text-3xl font-bold text-zinc-400 tracking-widest relative">
          Cartype
          <Logo color="#0ABAB5" />
        </h1>

        {/* You could add the Keyboard, Crown, Info, Settings icons here */}
      </div>

      {/* Right side: User actions */}
      <div className="flex items-center gap-4 mr-8">
        <button className="text-zinc-500 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        <button className="text-zinc-500 hover:text-white transition-colors">
          <User size={20} />
        </button>
      </div>
    </div>
  );
};
