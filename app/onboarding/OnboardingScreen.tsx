"use client";

import { Button } from "@/app/components/ui/Button";
import { Headphones, MapPin } from "lucide-react";
import { useState } from "react";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Headphones,
    title: "目を閉じて30秒、\n音で旅しよう",
    description:
      "世界中の誰かが録った\n環境音を、地図から探す。",
  },
  {
    icon: MapPin,
    title: "地図をタップして\n音を見つけよう",
    description:
      "渋谷の交差点、パリのカフェ、\nバリ島の棚田。30秒の余白をあなたに。",
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLast = currentSlide === slides.length - 1;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-deep-black px-8">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-full bg-dark-navy">
          <Icon size={36} className="text-soft-blue" />
        </div>

        <h1 className="mb-4 whitespace-pre-line text-center text-2xl font-light leading-relaxed text-off-white">
          {slide.title}
        </h1>

        <p className="whitespace-pre-line text-center text-sm leading-relaxed text-gray">
          {slide.description}
        </p>
      </div>

      <div className="pb-12 w-full max-w-xs flex flex-col items-center gap-6">
        {/* Page indicator */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "w-6 bg-soft-blue"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={() => {
            if (isLast) {
              onComplete();
            } else {
              setCurrentSlide((prev) => prev + 1);
            }
          }}
        >
          {isLast ? "はじめる" : "次へ"}
        </Button>
      </div>
    </div>
  );
}
