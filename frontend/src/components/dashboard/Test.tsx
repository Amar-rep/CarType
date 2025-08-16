"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { SquareMousePointer, RotateCcw, Timer, Target } from "lucide-react";

const TEXT_TO_TYPE =
  "If I had the power to prevent my own birth I should certainly never have consented to accept existence under such ridiculous conditions.";


type CharStatus = "pending" | "correct" | "incorrect";
interface CharState {
  char: string;
  status: CharStatus;
}


const generateWords = (text: string): CharState[][] =>
  text.split(" ").map((word) =>
    word.split("").map((char) => ({
      char,
      status: "pending",
    }))
  );

export const TypingArea: React.FC<{ text_data?: string }> = ({
  text_data = TEXT_TO_TYPE,
}) => {

  const [words, setWords] = useState(() => generateWords(text_data));
  const [active, setActive] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);


  const [incorrectChars, setIncorrectChars] = useState(0);


  const { currentWordIndex, currentCharIndex } = useMemo(() => {
    let wordIdx = words.findIndex((word) =>
      word.some((c) => c.status === "pending")
    );
    if (wordIdx === -1) {

      return {
        currentWordIndex: words.length - 1,
        currentCharIndex: words[words.length - 1].length,
      };
    }
    let charIdx = words[wordIdx].findIndex((c) => c.status === "pending");
    return { currentWordIndex: wordIdx, currentCharIndex: charIdx };
  }, [words]);


  const resetTest = useCallback(() => {
    setWords(generateWords(text_data));
    setActive(true);
    setEndTime(null);
    startTimeRef.current = null;
    setIncorrectChars(0);
    inputRef.current?.focus();
  }, [text_data]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (endTime) return;


      if (
        !startTimeRef.current &&
        e.key !== "Shift" &&
        e.key !== "Tab" &&
        e.key !== "Escape"
      ) {
        startTimeRef.current = Date.now();
      }

      if (e.key === "Escape") {
        e.preventDefault();
        resetTest();
        return;
      }

      if (e.key === "Tab" || e.key === "Shift") {
        e.preventDefault();
        return;
      }

      setWords((prevWords) => {
        const newWords = structuredClone(prevWords);

        if (e.key === "Backspace") {
          let word = newWords[currentWordIndex];

          if (currentCharIndex === 0 && currentWordIndex > 0) {
            const prevWord = newWords[currentWordIndex - 1];

            prevWord[prevWord.length - 1].status = "pending";
          } else if (currentCharIndex > 0) {
            word[currentCharIndex - 1].status = "pending";
          }
        } else if (e.key === " ") {
          e.preventDefault();

          if (currentCharIndex === newWords[currentWordIndex].length) {

          }
        } else if (e.key.length === 1) {
          // Any printable character
          const word = newWords[currentWordIndex];
          if (currentCharIndex < word.length) {
            const isCorrect = word[currentCharIndex].char === e.key;
            word[currentCharIndex].status = isCorrect ? "correct" : "incorrect";
            if (!isCorrect) {
              setIncorrectChars((prev) => prev + 1);
            }
          }
        }
        return newWords;
      });
    },
    [endTime, currentWordIndex, currentCharIndex, resetTest]
  );




  useEffect(() => {
    const isFinished = words.every((word) =>
      word.every((char) => char.status !== "pending")
    );
    if (isFinished && !endTime) {
      setEndTime(Date.now());
    }
  }, [words, endTime]);


  useEffect(() => {
    if (!active || !caretRef.current || !inputRef.current) return;

    const wordElements = Array.from(
      inputRef.current.querySelectorAll("span[data-word-id]")
    );
    const currentWordEl = wordElements[currentWordIndex] as HTMLElement;

    if (currentWordEl) {
      const charElements = Array.from(
        currentWordEl.querySelectorAll("span[data-char-id]")
      );
      const targetCharEl = charElements[currentCharIndex] as HTMLElement;

      let left, top;

      if (targetCharEl) {

        left = targetCharEl.offsetLeft;
        top = targetCharEl.offsetTop;
      } else if (charElements.length > 0) {

        const lastCharEl = charElements[charElements.length - 1] as HTMLElement;
        left = lastCharEl.offsetLeft + lastCharEl.offsetWidth;
        top = lastCharEl.offsetTop;
      } else {

        left = currentWordEl.offsetLeft;
        top = currentWordEl.offsetTop;
      }

      caretRef.current.style.transform = `translate(${left}px, ${top}px)`;
    }
  }, [currentWordIndex, currentCharIndex, active, words]); // re-run on words change to handle line wraps


  return (
    <div className="bg-zinc-900 text-zinc-400 min-h-screen flex flex-col items-center justify-center font-mono p-4">
      <div className="w-full max-w-4xl">
        <StatsBar
          startTime={startTimeRef.current}
          endTime={endTime}
          totalChars={text_data.length}
          incorrectChars={incorrectChars}
          words={words}
        />

        <div
          ref={inputRef}
          className="relative text-3xl leading-relaxed tracking-wider outline-none"
          onClick={() => inputRef.current?.focus()}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >

          {(!active || endTime) && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-20 rounded-lg">
              {endTime ? (
                <ResultsScreen
                  startTime={startTimeRef.current}
                  endTime={endTime}
                  resetTest={resetTest}
                />
              ) : (
                <StartScreen
                  setActive={setActive}
                  focusInput={() => inputRef.current?.focus()}
                />
              )}
            </div>
          )}


          <div
            className={`transition-opacity duration-300 ${active && !endTime ? "opacity-100" : "opacity-0"
              }`}
          >

            <span
              ref={caretRef}
              className="absolute w-0.5 h-10 bg-amber-400 rounded transition-transform duration-100 ease-linear animate-pulse"
              style={{ top: 0, left: 0 }}
            />

            {words.map((word, wordIndex) => (
              <span
                key={wordIndex}
                data-word-id={wordIndex}
                className="inline-block mr-4 mb-2"
              >
                {word.map((charObj, charIndex) => (
                  <span
                    key={charIndex}
                    data-char-id={charIndex}
                    className={`
                      ${charObj.status === "correct" ? "text-zinc-200" : ""}
                      ${charObj.status === "incorrect" ? "text-red-500" : ""}
                      ${charObj.status === "pending" ? "text-zinc-500" : ""}
                    `}
                  >
                    {charObj.char}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



const StatsBar: React.FC<{
  startTime: number | null;
  endTime: number | null;
  totalChars: number;
  incorrectChars: number;
  words: CharState[][];
}> = ({ startTime, endTime, totalChars, incorrectChars, words }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!startTime || endTime) return;
    const interval = setInterval(() => {
      setTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const wpm = useMemo(() => {
    if (!startTime) return 0;
    const finalTime = endTime || Date.now();
    const minutes = (finalTime - startTime) / 60000;
    if (minutes < 0.01) return 0;
    const grossWpm = totalChars / 5 / minutes;
    return Math.max(0, Math.round(grossWpm));
  }, [startTime, endTime, time]); // re-calc wpm every second

  const accuracy = useMemo(() => {
    const typedChars =
      totalChars - words.flat().filter((c) => c.status === "pending").length;
    if (typedChars === 0) return 100;
    return Math.max(
      0,
      Math.round(((typedChars - incorrectChars) / typedChars) * 100)
    );
  }, []);

  return (
    <div className="flex items-center gap-8 text-amber-400 text-2xl mb-8 transition-opacity duration-300">
      <span className="flex items-center gap-2">
        <Timer size={24} />
        {time}s
      </span>
      <span className="flex items-center gap-2">{wpm} WPM</span>
      <span className="flex items-center gap-2">
        <Target size={24} />
        {accuracy}%
      </span>
    </div>
  );
};

const StartScreen: React.FC<{
  setActive: (a: boolean) => void;
  focusInput: () => void;
}> = ({ setActive, focusInput }) => (
  <div
    className="text-center cursor-pointer"
    onClick={() => {
      setActive(true);
      focusInput();
    }}
  >
    <SquareMousePointer
      className="mx-auto text-zinc-400 animate-pulse mb-4"
      size={40}
    />
    <p className="text-lg text-zinc-400">Click or start typing to begin</p>
  </div>
);

const ResultsScreen: React.FC<{
  startTime: number | null;
  endTime: number | null;
  resetTest: () => void;
}> = ({ startTime, endTime, resetTest }) => {
  const wpm = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const minutes = (endTime - startTime) / 60000;
    const wordCount = TEXT_TO_TYPE.length / 5;
    return Math.round(wordCount / minutes);
  }, [startTime, endTime]);

  return (
    <div className="text-center text-zinc-200">
      <h2 className="text-4xl font-bold text-amber-400">{wpm} WPM</h2>
      <p className="text-lg text-zinc-400 mb-6">Words Per Minute</p>
      <button
        onClick={resetTest}
        className="bg-amber-500 text-zinc-900 font-bold py-3 px-6 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2 mx-auto"
      >
        <RotateCcw size={20} />
        Try Again
      </button>
    </div>
  );
};
