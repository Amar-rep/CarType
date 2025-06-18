"use client";
import React from "react";
import {useState, useRef, useEffect} from "react";
import {SquareMousePointer} from "lucide-react";
const TEXT_TO_TYPE = "If I had";
const activeStyle = " bg-zinc-800/50 z-10   rounded-xl  text-white  ";
//
//
type CharStatus = "pending" | "correct" | "incorrect";
interface CharState {
  char: string;
  status: CharStatus;
}
interface TypingAreaProps {
  text_data?: string;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  text_data = TEXT_TO_TYPE,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [active, setActive] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [words, setWords] = useState((): CharState[][] => {
    return text_data.split(" ").map((word) => {
      return word.split("").map((char) => ({
        char,
        status: "pending",
      }));
    });
  });
  const inputRef = useRef<HTMLDivElement>(null);

  const resetStates = () => {
    setWords(() => {
      return text_data.split(" ").map((word) => {
        return word.split("").map((char) => ({
          char,
          status: "pending",
        }));
      });
    });
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    startTimeRef.current = null;
    setEndTime(null);
    setActive(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log("Key pressed:", e.key);
    if (e.key === "Tab" || e.key === " ") e.preventDefault();
    else if (e.key === "Escape") {
      resetStates();
      return;
    }

    if (e.key == "Shift") return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      //  console.log("start at" + Date.now());
    }

    if (e.key == "Backspace") {
      if (currentCharIndex > 0) {
        setWords((prev) => {
          const newWords = [...prev];

          newWords[currentWordIndex][currentCharIndex].status = "pending";
          newWords[currentWordIndex][currentCharIndex - 1].status = "pending";

          return newWords;
        });
        setCurrentCharIndex((prev) => prev - 1);
      }
    } else if (e.key !== " ") {
      setWords((prevWords) => {
        const newWords = [...prevWords];

        newWords[currentWordIndex][currentCharIndex].status =
          newWords[currentWordIndex][currentCharIndex].char === e.key
            ? "correct"
            : "incorrect";
        return newWords;
      });
      if (
        currentWordIndex == words.length - 1 &&
        currentCharIndex == words[currentWordIndex].length - 1
      ) {
        setEndTime(Date.now());
        console.log("End time :" + Date.now());
      } else if (words[currentWordIndex].length - 1 != currentCharIndex) {
        setCurrentCharIndex((prev) => prev + 1);
      }
    } else if (e.key === " ") {
      if (words.length - 1 != currentWordIndex)
        setCurrentWordIndex((prev) => prev + 1);
      if (currentWordIndex != words.length - 1) setCurrentCharIndex(0);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (inputRef.current && inputRef.current !== document.activeElement) {
        //   console.log("Focus lost, setting active to false.");
        setActive(false);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (endTime) {
      const timeTaken = (endTime - (startTimeRef.current || 0)) / 60000;
      const totalChars = words.reduce((acc, word) => acc + word.length, 0);
      console.log(words);
      let correctChars = 0;
      correctChars = words.reduce((acc, word) => {
        return (
          acc + word.filter((charObj) => charObj.status === "correct").length
        );
      }, 0);
      const accuracy = Math.round((correctChars / totalChars) * 100);

      const wpm = Math.round(correctChars / 5 / timeTaken);
      console.log(
        `Time taken: ${timeTaken} minutes correct chars: ${correctChars} total chars: ${totalChars} Accuracy: ${accuracy}% WPM: ${wpm}`
      );
      resetStates();
    }
  }, [endTime, words, resetStates]);

  return (
    <div
      ref={inputRef}
      className={`relative ${!active ? activeStyle : ""} outline-none`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-20">
          <ModalText
            active={active}
            setActive={setActive}
            inputRef={inputRef}
          />
        </div>
      )}
      <div
        className={`flex-1 flex items-center justify-center select-none  ${
          !active ? "invisible" : ""
        }`}
      >
        <div className="font-mono text-3xl text-zinc-500 tracking-wide max-w-4xl text-center">
          {words.map((wordChars, wordIndex) => (
            <span key={wordIndex} className="inline-block px-2 m-1 rounded-lg">
              {wordChars.map((charObj, charIndex) => (
                <span
                  key={`${wordIndex}-${charIndex}`}
                  className={`inline-block relative ${
                    charObj.status === "correct"
                      ? "text-green-500"
                      : charObj.status === "incorrect"
                      ? "text-red-500"
                      : "text-zinc-500"
                  }`}
                >
                  {charObj.char}
                  {currentCharIndex == charIndex &&
                    currentWordIndex == wordIndex && (
                      <span className="mt-1  bg-amber-400 h-1 absolute  w-[80%] rounded-xl bottom-0.5 left-0.5"></span>
                    )}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ModalTextProps {
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  inputRef: React.RefObject<HTMLDivElement | null>;
}

const ModalText: React.FC<ModalTextProps> = ({active, setActive, inputRef}) => {
  return (
    <div
      className="text-center "
      onClick={() => {
        inputRef.current?.focus();
        setActive(!active);
      }}
    >
      <div className="flex justify-center mb-4">
        {/* Pulsing icon to draw attention */}
        <SquareMousePointer className="text-zinc-400 animate-pulse" size={40} />
      </div>

      <h2 className="text-2xl font-bold text-zinc-100 mb-2">Welcome!</h2>

      <p className="text-md text-zinc-400">
        Click here on the screen to begin.
      </p>
    </div>
  );
};
