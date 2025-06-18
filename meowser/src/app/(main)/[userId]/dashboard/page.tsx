"use client";
import React from "react";
import {LogoHeader} from "@/components/dashboard/LogoHeader";
import {SettingsBar} from "@/components/dashboard/SettingBar";
import {TypingArea} from "@/components/dashboard/words";
import {Footer} from "@/components/dashboard/Footer";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full items-center gap-16">
      <LogoHeader />
      <SettingsBar />
      <TypingArea />
      <Footer />
    </div>
  );
}
