import { Clock, Type, Quote, Zap, Wrench } from "lucide-react";
import React from "react";

export const SettingsBar: React.FC = () => {

  const activeStyle = "text-yellow-400";
  const inactiveStyle = "text-zinc-500 hover:text-zinc-300";

  return (
    <div className="  bg-zinc-800/50  rounded-lg py-3 px-4 flex items-center justify-center gap-6 text-sm ">
      <button className={`${inactiveStyle} flex items-center gap-2`}>
        <Clock size={16} /> time
      </button>
      <button className={`${inactiveStyle} flex items-center gap-2`}>
        <Type size={16} /> words
      </button>
      <button className={`${activeStyle} flex items-center gap-2`}>
        <Quote size={16} /> quote
      </button>
      <button className={`${inactiveStyle} flex items-center gap-2`}>
        <Zap size={16} /> zen
      </button>
      <button className={`${inactiveStyle} flex items-center gap-2`}>
        <Wrench size={16} /> custom
      </button>
    </div>
  );
};
