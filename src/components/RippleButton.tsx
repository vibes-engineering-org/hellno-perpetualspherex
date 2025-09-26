import type React from "react";
import { type ReactNode, useRef, useState } from "react";

interface RippleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  rippleColor?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function RippleButton({
  children,
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  disabled = false,
  className = "",
  type = "button",
  rippleColor = "rgba(255, 255, 255, 0.6)",
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const nextRippleId = useRef(0);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (disabled || !buttonRef.current) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();

    // Determine touch/click position
    let clientX: number;
    let clientY: number;
    if ("touches" in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ("clientX" in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      // Fallback to center if no coordinates available
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple: Ripple = {
      id: nextRippleId.current++,
      x: x - size / 2,
      y: y - size / 2,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(event);
    if (onClick) onClick();
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(event);
    if (onMouseDown) onMouseDown();
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    createRipple(event);
    if (onTouchStart) onTouchStart();
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      onMouseDown={onMouseDown ? handleMouseDown : undefined}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart ? handleTouchStart : undefined}
      onTouchEnd={onTouchEnd}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
    >
      {children}

      {/* Ripple container */}
      <div className="absolute inset-0 pointer-events-none">
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute rounded-full animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              background: `radial-gradient(circle, ${rippleColor} 0%, transparent 70%)`,
              transform: "scale(0)",
              animation: "ripple 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          />
        ))}
      </div>
    </button>
  );
}
