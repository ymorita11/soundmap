"use client";

import { Post } from "@/app/lib/types";
import { formatSeconds } from "@/app/lib/utils";
import { Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { WaveAnimation } from "./ui/WaveAnimation";

interface ImmersiveOverlayProps {
  post: Post;
  onClose: () => void;
}

export function ImmersiveOverlay({ post, onClose }: ImmersiveOverlayProps) {
  const totalSeconds = Math.ceil(post.duration_ms / 1000);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isClosing, setIsClosing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 500);
  }, [onClose]);

  useEffect(() => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => handleClose(), 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-deep-black/95"
      style={{
        animation: isClosing
          ? "fade-out 500ms ease-in-out forwards"
          : "fade-in 300ms ease-in-out",
      }}
      role="dialog"
      aria-label="音声再生中"
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <p
          className="font-mono text-5xl font-extralight tracking-widest text-off-white"
          aria-live="polite"
        >
          {formatSeconds(remaining)}
        </p>

        <WaveAnimation isActive={remaining > 0} className="h-8" />

        <p className="text-sm text-gray">{post.place_name}</p>
      </div>

      <div className="pb-16">
        <button
          onClick={handleClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-muted text-muted transition-colors hover:border-off-white hover:text-off-white"
          aria-label="停止"
        >
          <Square size={14} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
