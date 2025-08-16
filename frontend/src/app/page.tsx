// src/app/page.tsx

"use client";

import React, {useCallback, useEffect, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useAppSelector} from "@/lib/hooks";
import {Button} from "@/components/ui/button";
import sentenceService from "@/services/sentenceService";
import {createResultInput} from "@/lib/types";
import {
  Keyboard,
  Crown,
  Info,
  Settings,
  Bell,
  User,
  Hash,
  Clock,
  Quote,
  Flame,
  Wrench,
  Globe,
  RotateCcw,
} from "lucide-react";
import resultService from "@/services/resultServices";
import {TypingArea} from "@/components/dashboard/TypingArea"; // Your component
import {sentenceData, statesData} from "@/lib/types";
export default function HomePage() {
  const [stats, setStats] = useState<statesData | null>();
  const [testMode, setTestMode] = useState("words");
  const [timeConfig, setTimeConfig] = useState(25);
  const [sentence, setSentence] = useState<sentenceData | null>();
  const [isLoading, setIsLoading] = useState(true);
  const {token, user} = useAppSelector((state) => state.auth);
  let name = user?.name;
  const router = useRouter();

  const fetchNewSentence = useCallback(async () => {
    if (!token) {
      setIsLoading(false);

      return;
    }

    setIsLoading(true);

    try {
      // *** PASS THE TOKEN TO THE SERVICE FUNCTION ***
      const response = await sentenceService.getRandomSentence(
        token,
        timeConfig
      );
      console.log("Sentence service response:", response);
      console.log("Response data:", response.data);
      setSentence(response.data);
      //console.log(response.data);
    } catch (err: any) {
      console.error("Failed to fetch sentence:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, timeConfig]); // Add token as a dependency to the useCallback hook

  // Fetch the initial sentence when the component mounts
  useEffect(() => {
    console.log("Dman");
    fetchNewSentence();
  }, [fetchNewSentence, timeConfig]);

  useEffect(() => {
    if (!token) {
      router.push("/Login");
    }
  }, [token, router]);

  const handleStatsUpdate = useCallback((newStats: statesData) => {
    setStats(newStats);
  }, []);

  const handleTestComplete = useCallback(async () => {
    if (!sentence) {
      console.log(sentence);
      console.error("Missing sentence data");
      return;
    }

    if (!stats) {
      console.error("Missing stats data");
      return;
    }

    if (!user) {
      console.error("Missing user data");
      return;
    }

    if (!token) {
      console.error("Missing token");
      return;
    }
    try {
      const resultData: createResultInput = {
        userId: user.userId,
        sentenceId: sentence.id,
        wpm: stats.wpm,
        accuracy: stats.acc,
        rawWpm: stats.totalTypedChars,
        errorCount: stats.incorrect,
        timeTaken: stats.timeTaken,
      };
      console.log("REsult : " + resultData);
      const response = await resultService.submitResult(resultData, token);
      await fetchNewSentence();
    } catch (error) {
      console.error("Failed to submit test result:", error);
    }
  }, [token, stats, user, sentence, fetchNewSentence]);

  const handleRestart = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape"}));
  };

  const ConfigButton = ({
    mode,
    children,
  }: {
    mode: string;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      className={`transition-all duration-200 ${
        testMode === mode
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={() => setTestMode(mode)}
    >
      {children}
    </Button>
  );

  const TimeButton = ({time}: {time: number}) => (
    <Button
      variant="ghost"
      className={`transition-all duration-200 ${
        timeConfig === time
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={() => setTimeConfig(time)}
    >
      {time}
    </Button>
  );
  function UserDisplay() {
    const [isClient, setIsClient] = useState(false);
    const {user} = useAppSelector((state) => state.auth);

    useEffect(() => {
      setIsClient(true);
    }, []);
    return isClient ? (
      <span className="hidden sm:inline">{user?.name || "user"}</span>
    ) : (
      <span className="hidden sm:inline">user</span>
    );
  }
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between p-4 sm:p-6 md:p-8">
      {/* HEADER */}
      <header className="flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Keyboard className="text-primary" size={28} />
            <h1 className="text-2xl font-bold text-foreground">CarType</h1>
          </div>
          <div className=" items-center gap-3 md:flex">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
            >
              <Crown size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
            >
              <Info size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
            >
              <Settings size={20} />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
          >
            <Bell size={20} />
          </Button>
          <Link href="/Login">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <User size={20} />
              <UserDisplay />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex w-full max-w-5xl flex-grow flex-col items-center justify-center gap-8">
        {/* CONFIG BAR */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg bg-card p-2 md:gap-4">
            <ConfigButton mode="punctuation">
              <Hash size={16} className="mr-1" /> punctuation
            </ConfigButton>
            <ConfigButton mode="numbers">
              <Hash size={16} className="mr-1" /> numbers
            </ConfigButton>
            <span className="h-4 w-px bg-muted-foreground/50"></span>
            <ConfigButton mode="time">
              <Clock size={16} className="mr-1" /> time
            </ConfigButton>
            <ConfigButton mode="words">
              <span className="mr-1 font-bold">A</span> words
            </ConfigButton>
            <ConfigButton mode="quote">
              <Quote size={16} className="mr-1" /> quote
            </ConfigButton>
            <span className="h-4 w-px bg-muted-foreground/50"></span>
            <ConfigButton mode="zen">
              <Flame size={16} className="mr-1" /> zen
            </ConfigButton>
            <ConfigButton mode="custom">
              <Wrench size={16} className="mr-1" /> custom
            </ConfigButton>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-card p-2 md:gap-4">
            <TimeButton time={15} />
            <TimeButton time={25} />
            <TimeButton time={50} />
          </div>
        </div>

        {/* TYPING AREA */}
        <div className="relative w-full">
          <div className="absolute -top-8 flex w-full justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe size={14} />
              <span>english</span>
            </div>
          </div>
          {/* The core typing component you provided */}
          <TypingArea
            textToType={sentence?.text ?? null}
            onStatsUpdate={handleStatsUpdate}
            onTestComplete={handleTestComplete}
          />
          <div className="absolute -bottom-10 flex w-full justify-center">
            <Button
              onClick={handleRestart}
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="flex w-full max-w-7xl flex-col items-center justify-between gap-4 text-muted-foreground md:flex-row">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link href="#" className="hover:text-primary">
            contact
          </Link>
          <Link href="#" className="hover:text-primary">
            support
          </Link>
          <Link href="#" className="hover:text-primary">
            github
          </Link>
          <Link href="#" className="hover:text-primary">
            terms
          </Link>
        </div>
        <div className="text-sm">v25.38.0</div>
      </footer>
    </main>
  );
}
