import React from "react";
import {Mail, ShieldCheck, Twitter, Lock} from "lucide-react";

// A small component for the keyboard-style keys
const KbdKey = ({children}: {children: React.ReactNode}) => (
  <span className="bg-zinc-800 rounded px-2 py-1 text-zinc-300 font-mono text-xs">
    {children}
  </span>
);

export const Footer: React.FC = () => {
  return (
    <footer className="w-full text-zinc-500 text-sm mt-5">
      <div className="flex justify-center items-center gap-4 mb-4">
        <KbdKey>esc</KbdKey> -{" "}
        <span className="text-zinc-600">restart test</span>
      </div>
      {/*  <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <a
            href="#"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Mail size={16} /> contact
          </a>
          <a
            href="#"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <ShieldCheck size={16} /> security
          </a>
          <a
            href="#"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Twitter size={16} /> twitter
          </a>
          <a
            href="#"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Lock size={16} /> privacy
          </a>
        </div>
        <div className="text-zinc-600">v25.22.0</div>
      </div> */}
    </footer>
  );
};
