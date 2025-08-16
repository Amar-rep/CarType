"use client";
import React, {useState, useRef, useEffect, useCallback} from "react";
import {SquareMousePointer} from "lucide-react";
import {statesData} from "@/lib/types";
const TEXT_TO_TYPE =
  "the quick brown fox jumps over the lazy dog and types with great speed and accuracy on the keyboard if i had a dollar for every time i made a typo i would be a very rich person indeed";
type CharStatus = "pending" | "correct" | "incorrect";
interface CharState {
  char: string;
  status: CharStatus;
}
const generateWords = (text: string): CharState[][] =>
  text
    .split(" ")
    .map((word) => word.split("").map((char) => ({char, status: "pending"})));

interface TypingAreaProps {
  textToType: string | null;
  onStatsUpdate: (stats: statesData) => void;
  onTestComplete: () => void;
}

export function TypingArea({
  textToType = TEXT_TO_TYPE,
  onStatsUpdate,
  onTestComplete,
}: TypingAreaProps) {
  const [words, setWords] = useState(() =>
    generateWords(textToType ?? TEXT_TO_TYPE)
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resetTest = useCallback(() => {
    setWords(generateWords(textToType ?? TEXT_TO_TYPE));
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    startTimeRef.current = null;
    setIsActive(false);
    onStatsUpdate({wpm: 0, acc: 0, totalTypedChars: 0, incorrect: 0});
    containerRef.current?.focus();
  }, [textToType, onStatsUpdate]);

  useEffect(() => {
    resetTest();
  }, [textToType, resetTest]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Tab") e.preventDefault();
    if (e.key === "Escape") {
      resetTest();
      return;
    }
    if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    if (e.key === "Backspace") {
      if (currentWordIndex === 0 && currentCharIndex === 0) return;
      setWords((prev) => {
        const newWords = [...prev];
        if (currentCharIndex > 0) {
          newWords[currentWordIndex][currentCharIndex - 1].status = "pending";
        } else {
          newWords[currentWordIndex - 1][
            newWords[currentWordIndex - 1].length - 1
          ].status = "pending";
        }
        return newWords;
      });
      if (currentCharIndex > 0) {
        setCurrentCharIndex((p) => p - 1);
      } else {
        setCurrentWordIndex((p) => p - 1);
        setCurrentCharIndex(words[currentWordIndex - 1].length);
      }
      return;
    }

    const currentWord = words[currentWordIndex];
    const isLastCharOfWord = currentCharIndex === currentWord.length;
    const isLastCharOfTest =
      currentWordIndex === words.length - 1 &&
      currentCharIndex === currentWord.length - 1;

    if (e.key === " ") {
      if (!isLastCharOfWord || currentWordIndex === words.length - 1) return;
      setCurrentWordIndex((p) => p + 1);
      setCurrentCharIndex(0);
      return;
    }

    if (isLastCharOfWord) return;

    setWords((prev) => {
      const newWords = [...prev];
      newWords[currentWordIndex][currentCharIndex].status =
        newWords[currentWordIndex][currentCharIndex].char === e.key
          ? "correct"
          : "incorrect";
      return newWords;
    });

    if (isLastCharOfTest) {
      onTestComplete();
    }

    setCurrentCharIndex((p) => p + 1);
  };

  useEffect(() => {
    if (!startTimeRef.current || !isActive) return;

    const timeTakenSeconds = (Date.now() - startTimeRef.current) / 1000;
    const timeTakenMinutes = timeTakenSeconds / 60;
    if (timeTakenMinutes <= 0.01) return;

    let correctChars = 0;
    let totalTypedChars = 0;
    words.forEach((word) => {
      word.forEach((char) => {
        if (char.status !== "pending") {
          totalTypedChars++;
          if (char.status === "correct") {
            correctChars++;
          }
        }
      });
    });

    const wpm = Math.round(correctChars / 5 / timeTakenMinutes);
    const acc =
      totalTypedChars > 0
        ? Math.round((correctChars / totalTypedChars) * 100)
        : 0;
    const incorrect = totalTypedChars - correctChars;
    onStatsUpdate({
      wpm,
      acc,
      totalTypedChars,
      incorrect,
      timeTaken: timeTakenSeconds,
    });
  }, [words, isActive, onStatsUpdate]);

  useEffect(() => {
    const handleReset = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        resetTest();
      }
    };
    window.addEventListener("keydown", handleReset);
    return () => window.removeEventListener("keydown", handleReset);
  }, [resetTest]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl bg-card p-6 outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
    >
      {!isActive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/50">
          <div
            className="cursor-pointer text-center"
            onClick={() => containerRef.current?.focus()}
          >
            <div className="mb-4 flex justify-center">
              <SquareMousePointer
                className="animate-pulse text-muted-foreground"
                size={40}
              />
            </div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Click to Focus
            </h2>
          </div>
        </div>
      )}
      <div
        className={`select-none text-center font-mono text-xl md:text-2xl tracking-wider leading-relaxed ${
          !isActive ? "blur-sm" : ""
        }`}
        onClick={() => containerRef.current?.focus()}
      >
        {words.map((wordChars, wordIndex) => (
          <span key={wordIndex} className="inline-block mr-3 mb-2">
            {wordChars.map((charObj, charIndex) => (
              <span
                key={`${wordIndex}-${charIndex}`}
                className={`relative transition-colors duration-150 ${
                  charObj.status === "correct"
                    ? "text-green-400"
                    : charObj.status === "incorrect"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {charObj.char}
                {currentCharIndex === charIndex &&
                  currentWordIndex === wordIndex &&
                  isActive && (
                    <span className="absolute bottom-[-4px] left-0 h-1 w-full rounded-xl bg-primary"></span>
                  )}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
