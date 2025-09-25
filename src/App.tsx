import { sdk } from "@farcaster/miniapp-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

function App() {
  useEffect(() => {
    // important, never remove this sdk init
    sdk.actions.ready();
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <CyberpunkBackground />
      <main className="flex flex-1">
        <CountdownBomb />
      </main>
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
      return {
        label: "Explosion",
        indicator: "bg-gradient-to-br from-red-500 via-amber-500 to-yellow-400",
        accent: "text-red-100 border-red-500/60 bg-red-500/10",
        helper: "Boom! Reset to try again",
      };
    }
    if (isDefused) {
      return {
        label: "Defused",
        indicator: "bg-gradient-to-br from-green-500 via-emerald-500 to-lime-400",
        accent: "text-emerald-100 border-emerald-400/70 bg-emerald-500/10",
        helper: "Bomb successfully disarmed",
      };
    }
    if (isActive && !isHolding) {
      return {
        label: "Live Timer",
        indicator: "bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500",
        accent: "text-cyan-100 border-cyan-400/60 bg-cyan-400/10",
        helper: "Countdown in progress, stay sharp",
      };
    }
    if (isHolding) {
      return {
        label: "Disarming",
        indicator: "bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400",
        accent: "text-amber-100 border-amber-400/60 bg-amber-400/10",
        helper: "Keep holding to finish the job",
      };
    }
    return {
      label: "Armed",
      indicator: "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500",
      accent: "text-cyan-100 border-cyan-400/60 bg-cyan-400/10",
      helper: "Tap ARM BOMB to begin",
    };
  };

  const bombStatus = getBombStatus();

  return (
    <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 sm:py-16">
      <div className="relative bg-black/85 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-md sm:max-w-lg w-full shadow-2xl shadow-cyan-500/20">
        {showExplosion && !isDefused && <ExplosionOverlay />}

        <div className="flex flex-col items-center text-center mb-7 sm:mb-9">
          <div className="flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full border border-cyan-400/40 shadow-inner shadow-cyan-500/40">
            <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full ${bombStatus.indicator} blur-[1px]`}></div>
          </div>
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 border text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] ${bombStatus.accent}`}
          >
            {bombStatus.label}
          </div>
          <p className="mt-3 text-sm sm:text-base text-cyan-100/80 font-medium">
            {bombStatus.helper}
          </p>
        </div>

        <div className="mb-8 sm:mb-10 text-center">
          <div className={`text-6xl sm:text-8xl font-mono font-bold mb-4 ${getTimerColor()} drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]`}>
            {timeLeft.toString().padStart(2, "0")}
          </div>

          {timeLeft === 0 && !isDefused && (
            <div className="text-red-400 text-lg sm:text-xl font-bold animate-pulse mb-4">BOOM!</div>
          )}

          {isDefused && <div className="text-green-400 text-lg sm:text-xl font-bold mb-4">BOMB DEFUSED</div>}

          <div className="text-cyan-100 text-sm sm:text-base font-semibold tracking-wider">
            {isActive ? "TIMER ACTIVE" : "TIMER INACTIVE"}
          </div>

          {isHolding && !isDefused && holdTimeLeft > 0 && timeLeft > 0 && (
            <div className="mt-5">
              <div className="mx-auto h-3 sm:h-3.5 w-48 sm:w-60 rounded-full bg-cyan-900/60 overflow-hidden border border-cyan-500/50">
                <div
                  className="h-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 transition-all duration-200"
                  style={{ width: `${((3 - holdTimeLeft) / 3) * 100}%` }}
                />
              </div>
              <div className="mt-3 text-yellow-100 text-sm sm:text-base font-medium tracking-wide">
                HOLD TO DISARM: {holdTimeLeft}s
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-5">
          {!isActive && timeLeft > 0 && !isDefused && (
            <button
              type="button"
              onClick={startTimer}
              className="w-full py-7 sm:py-8 px-8 sm:px-10 bg-red-600 hover:bg-red-700 text-white font-semibold text-2xl sm:text-3xl rounded-[2.25rem] border-2 border-red-400 transition-transform duration-200 hover:scale-[1.03] shadow-xl shadow-red-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300 min-h-[92px] sm:min-h-[112px]"
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
              className={`w-full py-6 sm:py-7 px-6 sm:px-8 text-white font-bold text-xl sm:text-2xl rounded-[2rem] border-2 transition-transform duration-200 hover:scale-[1.03] shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 min-h-[88px] sm:min-h-[100px] ${getButtonColor()} ${
                isHolding ? "scale-95" : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {getButtonState()}
            </button>
          )}

          <button
            type="button"
            onClick={resetTimer}
            className="w-full py-4 sm:py-4 px-5 sm:px-6 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-base sm:text-lg rounded-[1.75rem] border border-gray-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 min-h-[64px] sm:min-h-[72px]"
          >
            RESET
          </button>
        </div>

        <div className="mt-6 sm:mt-8 text-sm sm:text-base text-gray-200 px-1 sm:px-0 text-center leading-relaxed">
          {!isActive && timeLeft > 0 && !isDefused && "Tap ARM BOMB to start the countdown."}
          {isActive && !isHolding && !isDefused && "Press and hold STOP THE BOMB for three seconds to disarm."}
          {isHolding && !isDefused && "Keep steady pressure until the disarm meter completes."}
          {isDefused && "Bomb secured. You can reset to play again."}
          {timeLeft === 0 && !isDefused && "Too late, hit RESET for another round."}
        </div>
      </div>
    </div>
  );
}

function ExplosionOverlay() {
  const bursts: {
    size: string;
    color: string;
    animation: string;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  }[] = [
    {
      size: "h-16 w-16 sm:h-20 sm:w-20",
      color: "from-red-500 via-amber-400 to-yellow-300",
      animation: "animate-ping",
      top: "8%",
      left: "12%",
    },
    {
      size: "h-20 w-20 sm:h-24 sm:w-24",
      color: "from-orange-500 via-red-400 to-amber-300",
      animation: "animate-bounce",
      top: "12%",
      right: "10%",
    },
    {
      size: "h-14 w-14 sm:h-18 sm:w-18",
      color: "from-yellow-400 via-amber-500 to-orange-500",
      animation: "animate-pulse",
      bottom: "12%",
      left: "18%",
    },
    {
      size: "h-18 w-18 sm:h-22 sm:w-22",
      color: "from-red-600 via-orange-500 to-yellow-400",
      animation: "animate-bounce",
      bottom: "10%",
      right: "14%",
    },
    {
      size: "h-12 w-12 sm:h-16 sm:w-16",
      color: "from-amber-400 via-yellow-400 to-emerald-300",
      animation: "animate-ping",
      top: "28%",
      left: "50%",
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative w-full h-full">
        {bursts.map((burst, index) => (
          <span
            key={index}
            className={`absolute ${burst.size} rounded-full bg-gradient-to-br ${burst.color} opacity-70 blur-[1px] ${burst.animation}`}
            style={{
              top: burst.top,
              bottom: burst.bottom,
              left: burst.left,
              right: burst.right,
            }}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default App;
