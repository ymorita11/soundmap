"use client";

import { cn } from "@/app/lib/utils";

interface WaveAnimationProps {
  isActive: boolean;
  barCount?: number;
  color?: string;
  className?: string;
}

export function WaveAnimation({
  isActive,
  barCount = 7,
  color = "bg-soft-blue",
  className,
}: WaveAnimationProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-[3px]",
        className
      )}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-[3px] rounded-full transition-all duration-100",
            color,
            isActive ? "opacity-100" : "opacity-30"
          )}
          style={{
            height: isActive ? `${8 + Math.random() * 24}px` : "4px",
            animationName: isActive ? "wave-bar" : "none",
            animationDuration: `${400 + i * 100}ms`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `${i * 80}ms`,
            // @ts-expect-error CSS custom property
            "--wave-height": `${12 + ((i * 7) % 20)}px`,
          }}
        />
      ))}
    </div>
  );
}
