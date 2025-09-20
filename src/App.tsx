import { sdk } from "@farcaster/miniapp-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

function App() {
  useEffect(() => {
    // important, never remove this sdk init
    sdk.actions.ready();
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <MatrixBackground />
      <CountdownBomb />
    </div>
  );
}

function MatrixBackground() {
  useEffect(() => {
    const canvas = document.getElementById("matrix-bg") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const charArray = chars.split("");
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff41";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas id="matrix-bg" className="absolute inset-0 z-0" style={{ background: "black" }} />;
}

function CountdownBomb() {
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [isDefused, setIsDefused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (isDefused) return;
    setIsActive(true);
  }, [isDefused]);

  const resetTimer = useCallback(() => {
    setTimeLeft(10);
    setIsActive(false);
    setIsDefused(false);
    setIsHolding(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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

  const handleDefuseStart = useCallback(() => {
    setIsHolding(true);
  }, []);

  const handleDefuseEnd = useCallback(() => {
    setIsHolding(false);
    if (timeLeft > 0) {
      setIsDefused(true);
      setIsActive(false);
    }
  }, [timeLeft]);

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
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
      <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-8 max-w-md w-full text-center shadow-2xl shadow-cyan-500/20">
        <div className="mb-8">
          <div className={`text-8xl font-mono font-bold mb-4 ${getTimerColor()} drop-shadow-lg`}>
            {timeLeft.toString().padStart(2, "0")}
          </div>

          {timeLeft === 0 && !isDefused && (
            <div className="text-red-400 text-xl font-bold animate-pulse mb-4">BOOM!</div>
          )}

          {isDefused && <div className="text-green-400 text-xl font-bold mb-4">BOMB DEFUSED</div>}

          <div className="text-cyan-300 text-sm font-mono opacity-70">
            {isActive ? "TIMER ACTIVE" : "TIMER INACTIVE"}
          </div>
        </div>

        <div className="space-y-4">
          {!isActive && timeLeft > 0 && !isDefused && (
            <button
              type="button"
              onClick={startTimer}
              className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-lg border-2 border-red-400 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-500/30"
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
              className={`w-full py-6 px-6 text-white font-bold text-lg rounded-lg border-2 transition-all duration-200 transform hover:scale-105 shadow-lg ${getButtonColor()} ${
                isHolding ? "scale-95" : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {getButtonState()}
            </button>
          )}

          <button
            type="button"
            onClick={resetTimer}
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-sm rounded border border-gray-600 transition-colors"
          >
            RESET
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-400 font-mono">
          {!isActive && timeLeft > 0 && !isDefused && "Click ARM BOMB to start countdown"}
          {isActive && !isHolding && "Hold STOP THE BOMB to defuse"}
          {isHolding && "Keep holding to defuse..."}
          {isDefused && "Bomb successfully defused!"}
          {timeLeft === 0 && !isDefused && "Game over! Click RESET to try again"}
        </div>
      </div>
    </div>
  );
}

export default App;
