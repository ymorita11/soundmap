"use client";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { WaveAnimation } from "@/app/components/ui/WaveAnimation";
import { useAppStore } from "@/app/lib/store";
import { formatSeconds } from "@/app/lib/utils";
import { ArrowLeft, Check, MapPin, Play, RotateCcw, Square } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PostConfirmPage() {
  const router = useRouter();
  const { recording, setRecording, location, setLocation } = useAppStore();
  const [placeName, setPlaceName] = useState("");
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [locationLabel, setLocationLabel] = useState("位置情報を取得中...");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const duration = recording ? Math.ceil(recording.durationMs / 1000) : 30;

  useEffect(() => {
    if (!recording) {
      router.replace("/record");
      return;
    }
    previewUrlRef.current = URL.createObjectURL(recording.blob);
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [recording, router]);

  useEffect(() => {
    if (location) {
      setLocationLabel(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setLocationLabel(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => setLocationLabel("位置情報を取得できませんでした"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [location, setLocation]);

  const togglePreview = () => {
    if (!previewUrlRef.current) return;
    if (isPreviewPlaying) {
      audioRef.current?.pause();
      setIsPreviewPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(previewUrlRef.current);
        audioRef.current.onended = () => setIsPreviewPlaying(false);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPreviewPlaying(true);
    }
  };

  const handlePost = async () => {
    if (!placeName.trim()) {
      setError("場所名を入力してください");
      return;
    }
    if (!recording) {
      setError("録音データがありません");
      return;
    }
    if (!location) {
      setError("位置情報が取得できていません");
      return;
    }

    setError("");
    setIsPosting(true);

    try {
      const formData = new FormData();
      const ext = recording.mimeType.includes("webm") ? "webm" : "mp4";
      formData.append("audio", new File([recording.blob], `recording.${ext}`, { type: recording.mimeType }));
      formData.append("metadata", JSON.stringify({
        place_name: placeName.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        duration_ms: recording.durationMs,
        recorded_at: new Date().toISOString(),
      }));

      const res = await fetch("/api/posts", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "投稿に失敗しました");

      setRecording(null);
      setIsPosting(false);
      setIsSuccess(true);

      setTimeout(() => router.push("/"), 1000);
    } catch (err) {
      setIsPosting(false);
      setError(err instanceof Error ? err.message : "投稿に失敗しました");
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-dark-gray">
        <div
          className="flex flex-col items-center gap-4"
          style={{ animation: "fade-in 300ms ease-out" }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft-green/20">
            <svg
              className="h-8 w-8 text-soft-green"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeDasharray="24"
                style={{ animation: "check-draw 500ms ease-out forwards" }}
              />
            </svg>
          </div>
          <p className="text-lg font-light text-off-white">投稿しました</p>
        </div>
      </div>
    );
  }

  if (!recording) return null;

  return (
    <div className="flex min-h-dvh flex-col bg-dark-gray">
      <header className="flex h-12 items-center justify-between px-4">
        <Link
          href="/record"
          className="flex items-center gap-2 text-sm text-gray hover:text-off-white"
        >
          <ArrowLeft size={16} />
          戻る
        </Link>
        <span className="text-sm font-medium text-off-white">投稿確認</span>
        <div className="w-12" />
      </header>

      <div className="flex-1 px-6 pt-4">
        <section className="mb-6">
          <div className="rounded-xl bg-dark-navy p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={togglePreview}
                className="flex items-center gap-3 text-off-white"
                aria-label={isPreviewPlaying ? "一時停止" : "プレビュー再生"}
              >
                {isPreviewPlaying ? (
                  <Square size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
                <span className="text-sm">プレビュー再生</span>
              </button>
              <span className="font-mono text-sm text-gray">
                {formatSeconds(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 rounded-full bg-muted">
                <div className="h-1 w-1/3 rounded-full bg-soft-blue" />
              </div>
            </div>

            <WaveAnimation
              isActive={isPreviewPlaying}
              barCount={11}
              className="mt-3 h-8"
            />
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray">
            <MapPin size={14} />
            位置情報
          </div>
          <div className="rounded-xl bg-dark-navy p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-off-white">{locationLabel}</span>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <Input
            label="場所名"
            placeholder="どこで録りましたか？"
            value={placeName}
            onChange={(e) => {
              setPlaceName(e.target.value);
              if (error) setError("");
            }}
            error={error}
          />
        </section>
      </div>

      <div className="flex gap-3 px-6 pb-8">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => {
            setRecording(null);
            router.push("/record");
          }}
        >
          <RotateCcw size={16} />
          録り直す
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={handlePost}
          isLoading={isPosting}
        >
          <Check size={16} />
          投稿する
        </Button>
      </div>
    </div>
  );
}
