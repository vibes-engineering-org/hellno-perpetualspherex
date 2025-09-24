import { sdk } from "@farcaster/miniapp-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

function App() {
  useEffect(() => {
    // important, never remove this sdk init
    sdk.actions.ready();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <CyberpunkBackground />
      <CountdownBomb />
    </div>
  );
}

function CyberpunkBackground() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />

      {/* Cyberpunk grid overlay */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(0deg,transparent_24%,rgba(59,130,246,0.3)_25%,rgba(59,130,246,0.3)_26%,transparent_27%,transparent_74%,rgba(59,130,246,0.3)_75%,rgba(59,130,246,0.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(59,130,246,0.3)_25%,rgba(59,130,246,0.3)_26%,transparent_27%,transparent_74%,rgba(59,130,246,0.3)_75%,rgba(59,130,246,0.3)_76%,transparent_77%,transparent)] bg-[100px_100px]" />

      {/* Neon accent lines */}
      <div className="absolute top-1/4 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
      <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-40" />

      {/* Glowing orbs */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-cyan-400 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-purple-400 rounded-full blur-2xl opacity-30" />

      {/* Subtle scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_51%)] bg-[length:100%_4px] opacity-40" />
    </div>
  );
}

function CountdownBomb() {
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [isDefused, setIsDefused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const explosionTimeoutRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (isDefused) return;
    setIsActive(true);
  }, [isDefused]);

  const resetTimer = useCallback(() => {
    setTimeLeft(10);
    setIsActive(false);
    setIsDefused(false);
    setIsHolding(false);
    setShowExplosion(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (explosionTimeoutRef.current) {
      clearTimeout(explosionTimeoutRef.current);
      explosionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive && !isHolding && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isHolding, timeLeft]);

  // Check if bomb should be defused when timer reaches 0 while holding
  useEffect(() => {
    if (isActive && isHolding && timeLeft === 0) {
      setIsDefused(true);
      setIsActive(false);
    }
  }, [isActive, isHolding, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !isDefused && !isHolding) {
      setShowExplosion(true);
      explosionTimeoutRef.current = window.setTimeout(() => {
        setShowExplosion(false);
        explosionTimeoutRef.current = null;
      }, 1600);
    }

    return () => {
      if (explosionTimeoutRef.current) {
        clearTimeout(explosionTimeoutRef.current);
        explosionTimeoutRef.current = null;
      }
    };
  }, [timeLeft, isDefused, isHolding]);

  const handleDefuseStart = useCallback(() => {
    setIsHolding(true);
  }, []);

  const handleDefuseEnd = useCallback(() => {
    setIsHolding(false);
    // Don't automatically defuse when releasing the button
    // The bomb only gets defused if held continuously until timer reaches 0
  }, []);

  const getTimerColor = () => {
    if (isDefused) return "text-green-400";
    if (timeLeft <= 3) return "text-red-400";
    if (timeLeft <= 5) return "text-yellow-400";
    return "text-cyan-400";
  };

  const getButtonState = () => {
    if (isDefused) return "DEFUSED";
    if (isHolding) return "DEFUSING...";
    return "STOP THE BOMB";
  };

  const getButtonColor = () => {
    if (isDefused) return "bg-green-600 hover:bg-green-700 border-green-400";
    if (isHolding) return "bg-yellow-600 hover:bg-yellow-700 border-yellow-400";
    if (timeLeft <= 3) return "bg-red-600 hover:bg-red-700 border-red-400";
    return "bg-cyan-600 hover:bg-cyan-700 border-cyan-400";
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10 sm:px-8 sm:py-16">
      <div className="relative bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-5 sm:p-8 max-w-sm sm:max-w-md w-full text-center shadow-2xl shadow-cyan-500/20">
        {showExplosion && !isDefused && <ExplosionOverlay />}

        <div className="mb-6 sm:mb-8">
          <div className={`text-6xl sm:text-8xl font-mono font-bold mb-3 sm:mb-4 ${getTimerColor()} drop-shadow-lg`}>
            {timeLeft.toString().padStart(2, "0")}
          </div>

          {timeLeft === 0 && !isDefused && (
            <div className="text-red-400 text-lg sm:text-xl font-bold animate-pulse mb-3 sm:mb-4">BOOM!</div>
          )}

          {isDefused && <div className="text-green-400 text-lg sm:text-xl font-bold mb-3 sm:mb-4">BOMB DEFUSED</div>}

          <div className="text-cyan-300 text-xs sm:text-sm font-mono opacity-70">
            {isActive ? "TIMER ACTIVE" : "TIMER INACTIVE"}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {!isActive && timeLeft > 0 && !isDefused && (
            <button
              type="button"
              onClick={startTimer}
              className="w-full py-5 sm:py-7 px-6 sm:px-8 bg-red-600 hover:bg-red-700 text-white font-semibold text-xl sm:text-2xl rounded-2xl border-2 border-red-400 transition-all duration-200 transform hover:scale-105 shadow-xl shadow-red-500/40 min-h-[72px] sm:min-h-[84px]"
            >
              ARM BOMB
            </button>
          )}

          {(isActive || isDefused) && (
            <button
              type="button"
              onMouseDown={handleDefuseStart}
              onMouseUp={handleDefuseEnd}
              onMouseLeave={handleDefuseEnd}
              onTouchStart={handleDefuseStart}
              onTouchEnd={handleDefuseEnd}
              disabled={timeLeft === 0 || isDefused}
              className={`w-full py-4 sm:py-6 px-4 sm:px-6 text-white font-bold text-base sm:text-lg rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 shadow-lg min-h-[60px] sm:min-h-[68px] ${getButtonColor()} ${
                isHolding ? "scale-95" : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {getButtonState()}
            </button>
          )}

          <button
            type="button"
            onClick={resetTimer}
            className="w-full py-2 sm:py-2 px-3 sm:px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs sm:text-sm rounded-xl border border-gray-600 transition-colors min-h-[36px] sm:min-h-[40px]"
          >
            RESET
          </button>
        </div>

        <div className="mt-4 sm:mt-6 text-xs sm:text-xs text-gray-400 font-mono px-2 sm:px-0">
          {!isActive && timeLeft > 0 && !isDefused && "Click ARM BOMB to start countdown"}
          {isActive && !isHolding && "Hold STOP THE BOMB until timer hits 0 to defuse"}
          {isHolding && "Keep holding until timer reaches 0..."}
          {isDefused && "Bomb successfully defused!"}
          {timeLeft === 0 && !isDefused && "Game over! Click RESET to try again"}
        </div>
      </div>
    </div>
  );
}

function ExplosionOverlay() {
  const bursts: {
    emoji: string;
    animation: string;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  }[] = [
    { emoji: "💥", top: "10%", left: "15%", animation: "animate-bounce" },
    { emoji: "🔥", top: "5%", right: "12%", animation: "animate-ping" },
    { emoji: "⚡", bottom: "12%", left: "18%", animation: "animate-pulse" },
    { emoji: "💥", bottom: "8%", right: "15%", animation: "animate-bounce" },
    { emoji: "🔥", top: "30%", left: "50%", animation: "animate-ping" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative w-full h-full">
        {bursts.map((burst, index) => (
          <span
            key={index}
            className={`absolute text-4xl sm:text-6xl drop-shadow-[0_0_12px_rgba(255,125,125,0.7)] ${burst.animation}`}
            style={{
              top: burst.top,
              bottom: burst.bottom,
              left: burst.left,
              right: burst.right,
            }}
          >
            {burst.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
