"use client";

import { WaveAnimation } from "@/app/components/ui/WaveAnimation";
import { formatSeconds } from "@/app/lib/utils";
import { ArrowLeft, Mic, Square } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type RecordingState = "idle" | "recording" | "recorded";

export default function RecordPage() {
  const router = useRouter();
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const maxDuration = 30;

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState("recorded");
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Audio blob is ready in chunksRef
      };

      recorder.start();
      setState("recording");
      setElapsed(0);

      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert("マイクの許可が必要です。ブラウザの設定から許可してください。");
    }
  }, [stopRecording]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (state === "recorded") {
      router.push("/post-confirm");
    }
  }, [state, router]);

  return (
    <div className="flex min-h-dvh flex-col bg-dark-gray">
      {/* Header */}
      <header className="flex h-12 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray hover:text-off-white"
        >
          <ArrowLeft size={16} />
          戻る
        </Link>
        <span className="text-sm font-medium text-off-white">録音</span>
        <div className="w-12" />
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-12 px-8">
        {/* Timer */}
        <p className="text-2xl font-light text-off-white">
          {formatSeconds(elapsed)}{" "}
          <span className="text-muted">/ {formatSeconds(maxDuration)}</span>
        </p>

        {/* Wave */}
        <WaveAnimation
          isActive={state === "recording"}
          barCount={9}
          className="h-16"
        />

        {/* Record button */}
        <div className="relative">
          {state === "recording" && (
            <div
              className="absolute inset-0 rounded-full bg-soft-red/30"
              style={{
                animation: "pulse-ring 1.5s ease-in-out infinite",
              }}
            />
          )}
          <button
            onClick={() => {
              if (state === "idle") {
                startRecording();
              } else if (state === "recording") {
                stopRecording();
              }
            }}
            className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
              state === "recording"
                ? "bg-soft-red"
                : "bg-amber hover:bg-amber/80"
            }`}
            aria-label={state === "recording" ? "録音停止" : "録音開始"}
          >
            {state === "recording" ? (
              <Square size={20} fill="white" className="text-white" />
            ) : (
              <Mic size={24} className="text-deep-black" />
            )}
          </button>
        </div>

        <p className="text-xs text-muted">
          {state === "idle"
            ? "ボタンをタップして録音開始"
            : state === "recording"
              ? "録音中... 30秒で自動停止します"
              : "録音完了"}
        </p>
      </div>
    </div>
  );
}
