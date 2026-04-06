"use client";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { WaveAnimation } from "@/app/components/ui/WaveAnimation";
import { formatSeconds } from "@/app/lib/utils";
import { ArrowLeft, Check, MapPin, Play, RotateCcw, Square } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PostConfirmPage() {
  const router = useRouter();
  const [placeName, setPlaceName] = useState("");
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const mockLocation = "東京都渋谷区神宮前";
  const duration = 30;

  const handlePost = async () => {
    if (!placeName.trim()) {
      setError("場所名を入力してください");
      return;
    }
    setError("");
    setIsPosting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsPosting(false);
    setIsSuccess(true);

    setTimeout(() => {
      router.push("/");
    }, 1000);
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

  return (
    <div className="flex min-h-dvh flex-col bg-dark-gray">
      {/* Header */}
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
        {/* Preview playback */}
        <section className="mb-6">
          <div className="rounded-xl bg-dark-navy p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
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

        {/* Location */}
        <section className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray">
            <MapPin size={14} />
            位置情報
          </div>
          <div className="rounded-xl bg-dark-navy p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-off-white">{mockLocation}</span>
              <button className="text-xs text-soft-blue hover:underline">
                地図で修正
              </button>
            </div>
            {/* Mini map placeholder */}
            <div className="flex h-28 items-center justify-center rounded-lg bg-deep-black">
              <div className="flex flex-col items-center gap-1">
                <MapPin size={20} className="text-soft-blue" />
                <span className="text-[10px] text-muted">地図プレビュー</span>
              </div>
            </div>
          </div>
        </section>

        {/* Place name input */}
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

      {/* Action buttons */}
      <div className="flex gap-3 px-6 pb-8">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => router.push("/record")}
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
