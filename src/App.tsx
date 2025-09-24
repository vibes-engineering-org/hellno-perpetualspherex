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
  const [holdTimeLeft, setHoldTimeLeft] = useState(3);
  const intervalRef = useRef<number | null>(null);
  const explosionTimeoutRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);

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
    setHoldTimeLeft(3);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (explosionTimeoutRef.current) {
      clearTimeout(explosionTimeoutRef.current);
      explosionTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
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
    if (isDefused || timeLeft === 0) return;
    setHoldTimeLeft(3);
    setIsHolding(true);
  }, [isDefused, timeLeft]);

  const handleDefuseEnd = useCallback(() => {
    setIsHolding(false);
    setHoldTimeLeft((prev) => (prev === 3 ? prev : 3));
    // Don't automatically defuse when releasing the button
    // The bomb only gets defused if held continuously until timer reaches 0
  }, []);

  useEffect(() => {
    if (!isHolding || isDefused || timeLeft === 0) {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
      if (!isDefused && timeLeft > 0) {
        setHoldTimeLeft((prev) => (prev === 3 ? prev : 3));
      }
      return;
    }

    holdIntervalRef.current = window.setInterval(() => {
      setHoldTimeLeft((prev) => {
        if (prev <= 1) {
          if (holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
          }
          setIsDefused(true);
          setIsActive(false);
          setIsHolding(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
    };
  }, [isHolding, isDefused, timeLeft]);

  const getTimerColor = () => {
    if (isDefused) return "text-green-400";
    if (timeLeft <= 3) return "text-red-400";
    if (timeLeft <= 5) return "text-yellow-400";
    return "text-cyan-400";
  };

  const getButtonState = () => {
    if (isDefused) return "DEFUSED";
    if (isHolding)
      return holdTimeLeft > 0 ? `DISARMING... ${holdTimeLeft}` : "DISARMED";
    return "STOP THE BOMB";
  };

  const getButtonColor = () => {
    if (isDefused) return "bg-green-600 hover:bg-green-700 border-green-400";
    if (isHolding) return "bg-yellow-600 hover:bg-yellow-700 border-yellow-400";
    if (timeLeft <= 3) return "bg-red-600 hover:bg-red-700 border-red-400";
    return "bg-cyan-600 hover:bg-cyan-700 border-cyan-400";
  };

  const getBombStatus = () => {
    if (showExplosion && !isDefused) {
      return { emoji: "💥", label: "Exploded" };
    }
    if (isDefused) {
      return { emoji: "🛡️", label: "Saved" };
    }
    if (isHolding) {
      return { emoji: "🧰", label: "Disarming" };
    }
    return { emoji: "💣", label: "Countdown" };
  };

  const bombStatus = getBombStatus();

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10 sm:px-8 sm:py-16">
      <div className="relative bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-5 sm:p-8 max-w-sm sm:max-w-md w-full text-center shadow-2xl shadow-cyan-500/20">
        {showExplosion && !isDefused && <ExplosionOverlay />}

        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="text-6xl sm:text-7xl drop-shadow-[0_0_18px_rgba(165,243,252,0.35)]">
            {bombStatus.emoji}
          </div>
          <div className="mt-2 text-sm sm:text-base font-semibold uppercase tracking-[0.3em] text-cyan-200/80">
            {bombStatus.label}
          </div>
        </div>

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

          {isHolding && !isDefused && holdTimeLeft > 0 && timeLeft > 0 && (
            <div className="mt-3 sm:mt-4">
              <div className="mx-auto h-2 sm:h-2.5 w-40 sm:w-48 rounded-full bg-cyan-900/60 overflow-hidden border border-cyan-500/40">
                <div
                  className="h-full bg-yellow-400 transition-all duration-200"
                  style={{ width: `${((3 - holdTimeLeft) / 3) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-yellow-200 text-xs sm:text-sm font-mono tracking-wide">
                HOLD TO DISARM: {holdTimeLeft}s
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          {!isActive && timeLeft > 0 && !isDefused && (
            <button
              type="button"
              onClick={startTimer}
              className="w-full py-6 sm:py-7 px-7 sm:px-9 bg-red-600 hover:bg-red-700 text-white font-semibold text-2xl sm:text-3xl rounded-3xl border-2 border-red-400 transition-all duration-200 transform hover:scale-105 shadow-xl shadow-red-500/40 min-h-[84px] sm:min-h-[96px]"
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
              className={`w-full py-5 sm:py-6 px-5 sm:px-6 text-white font-bold text-lg sm:text-xl rounded-3xl border-2 transition-all duration-200 transform hover:scale-105 shadow-lg min-h-[72px] sm:min-h-[80px] ${getButtonColor()} ${
                isHolding ? "scale-95" : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {getButtonState()}
            </button>
          )}

          <button
            type="button"
            onClick={resetTimer}
            className="w-full py-3 sm:py-3 px-4 sm:px-5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-sm sm:text-sm rounded-2xl border border-gray-600 transition-colors min-h-[48px] sm:min-h-[52px]"
          >
            RESET
          </button>
        </div>

        <div className="mt-4 sm:mt-6 text-xs sm:text-xs text-gray-400 font-mono px-2 sm:px-0">
          {!isActive && timeLeft > 0 && !isDefused && "Click ARM BOMB to start countdown"}
          {isActive && !isHolding && !isDefused && "Hold STOP THE BOMB for 3 seconds to disarm"}
          {isHolding && !isDefused && "Hold steady... countdown to safety in progress"}
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
