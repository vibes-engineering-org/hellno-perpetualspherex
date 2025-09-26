import { sdk } from "@farcaster/miniapp-sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { RippleButton } from "./components/RippleButton";

function App() {
  useEffect(() => {
    // important, never remove this sdk init
    sdk.actions.ready();
  }, []);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700/20 via-slate-900/5 to-transparent pointer-events-none" />
      <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8 sm:py-10">
        <header className="space-y-3 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400/80">Countdown Control</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">Defuse The Device</h1>
          <p className="text-sm text-slate-400/90 leading-relaxed max-w-xs mx-auto">
            Keep an eye on the clock and hold steady to disarm before time runs out.
          </p>
        </header>
        <CountdownBomb />
      </main>
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
  const hasAutoStartedRef = useRef(false);

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
    if (!hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      startTimer();
    }
  }, [startTimer]);

  useEffect(() => {
    if (isActive && !isHolding && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
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
    if (isDefused) return "text-emerald-400";
    if (timeLeft <= 3) return "text-red-400";
    if (timeLeft <= 5) return "text-amber-300";
    return "text-sky-300";
  };

  const getButtonState = () => {
    if (isDefused) return "Defused";
    if (isHolding) return holdTimeLeft > 0 ? `Disarming... ${holdTimeLeft}s` : "Disarmed";
    return "Stop The Bomb";
  };

  const getButtonColor = () => {
    if (isDefused) return "bg-emerald-500 hover:bg-emerald-600 focus-visible:outline-emerald-400";
    if (isHolding) return "bg-amber-500 hover:bg-amber-600 focus-visible:outline-amber-300";
    if (timeLeft <= 3) return "bg-red-500 hover:bg-red-600 focus-visible:outline-red-300";
    return "bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-300";
  };

  const getBombStatus = () => {
    if (showExplosion && !isDefused) {
      return {
        label: "Explosion",
        accent: "border border-red-500/40 bg-red-500/10 text-red-200",
        helper: "Boom! Reset to try again",
      };
    }
    if (isDefused) {
      return {
        label: "Defused",
        accent: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
        helper: "Bomb successfully disarmed",
      };
    }
    if (isActive && !isHolding) {
      return {
        label: "Live Timer",
        accent: "border border-sky-500/30 bg-sky-500/10 text-sky-100",
        helper: "Countdown in progress, stay sharp",
      };
    }
    if (isHolding) {
      return {
        label: "Disarming",
        accent: "border border-amber-500/30 bg-amber-500/10 text-amber-100",
        helper: "Keep holding to finish the job",
      };
    }
    return {
      label: "Armed",
      accent: "border border-slate-600/50 bg-slate-800/70 text-slate-200",
      helper: "Tap Arm Bomb to begin",
    };
  };

  const bombStatus = getBombStatus();

  return (
    <section className="flex flex-1 flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
      <div className="relative flex flex-1 flex-col gap-6 rounded-3xl border border-slate-800/50 bg-slate-900/80 backdrop-blur-sm p-6 shadow-2xl shadow-slate-950/50 sm:p-8">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-800/10 via-transparent to-slate-800/5 pointer-events-none" />

        <div className="relative space-y-3 text-center">
          <div
            className={`mx-auto inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition-all duration-300 ${bombStatus.accent}`}
          >
            {bombStatus.label}
          </div>
          <p className="text-sm text-slate-300/90">{bombStatus.helper}</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/90 backdrop-blur-sm p-8 text-center shadow-inner">
          {showExplosion && !isDefused && <ExplosionOverlay />}
          <div
            className={`relative text-7xl font-mono font-bold transition-all duration-300 ${getTimerColor()} ${
              timeLeft <= 3 && isActive ? "animate-pulse" : ""
            }`}
          >
            {timeLeft.toString().padStart(2, "0")}
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.4em] text-slate-400/80">
            {isActive ? "Timer Active" : "Timer Idle"}
          </p>

          {timeLeft === 0 && !isDefused && (
            <p className="mt-4 text-sm font-semibold text-red-400 animate-in fade-in duration-300">
              Time expired. Reset to try again.
            </p>
          )}

          {isDefused && (
            <p className="mt-4 text-sm font-semibold text-emerald-400 animate-in fade-in duration-300">
              Device secure. You can reset to restart.
            </p>
          )}

          {isHolding && !isDefused && holdTimeLeft > 0 && timeLeft > 0 && (
            <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/80 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-200 shadow-sm"
                  style={{ width: `${((3 - holdTimeLeft) / 3) * 100}%` }}
                />
              </div>
              <p className="text-xs font-medium text-amber-300/90">Hold steady for {holdTimeLeft}s</p>
            </div>
          )}
        </div>

        <div className="relative mt-auto space-y-4">
          {!isActive && timeLeft > 0 && !isDefused && (
            <RippleButton
              type="button"
              onClick={startTimer}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-base font-semibold text-white transition-all duration-200 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 shadow-lg hover:shadow-xl"
              rippleColor="rgba(255, 193, 7, 0.7)"
            >
              Arm Bomb
            </RippleButton>
          )}

          {(isActive || isDefused) && (
            <RippleButton
              type="button"
              onMouseDown={handleDefuseStart}
              onMouseUp={handleDefuseEnd}
              onMouseLeave={handleDefuseEnd}
              onTouchStart={handleDefuseStart}
              onTouchEnd={handleDefuseEnd}
              disabled={timeLeft === 0 || isDefused}
              className={`w-full rounded-2xl px-6 py-5 text-base font-semibold text-white transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 shadow-lg hover:shadow-xl ${getButtonColor()} ${
                isHolding ? "scale-[0.96] shadow-inner" : "hover:scale-[1.02] active:scale-[0.98]"
              } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
              rippleColor={
                isDefused
                  ? "rgba(34, 197, 94, 0.8)"
                  : isHolding
                    ? "rgba(245, 158, 11, 0.8)"
                    : timeLeft <= 3
                      ? "rgba(239, 68, 68, 0.8)"
                      : "rgba(14, 165, 233, 0.8)"
              }
            >
              {getButtonState()}
            </RippleButton>
          )}

          <RippleButton
            type="button"
            onClick={resetTimer}
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-sm px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300 transition-all duration-200 hover:bg-slate-800/80 hover:border-slate-600 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 shadow-md hover:shadow-lg"
            rippleColor="rgba(148, 163, 184, 0.6)"
          >
            Reset
          </RippleButton>

          <p className="text-center text-sm text-slate-400/80 leading-relaxed px-2">
            {!isActive && timeLeft > 0 && !isDefused && "Tap Arm Bomb to start the countdown."}
            {isActive && !isHolding && !isDefused && "Press and hold Stop The Bomb for three seconds to disarm."}
            {isHolding && !isDefused && "Keep holding until the progress bar completes."}
            {isDefused && "Bomb secured. Reset to play again."}
            {timeLeft === 0 && !isDefused && "Too late. Hit reset for another round."}
          </p>
        </div>
      </div>
    </section>
  );
}

function ExplosionOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-in fade-in duration-100">
      <div className="h-40 w-40 rounded-full bg-red-500/30 blur-3xl animate-pulse" />
      <div className="absolute h-32 w-32 rounded-full bg-orange-500/20 blur-2xl animate-ping" />
      <div className="absolute h-24 w-24 rounded-full bg-yellow-500/25 blur-xl animate-pulse delay-75" />
    </div>
  );
}

export default App;
