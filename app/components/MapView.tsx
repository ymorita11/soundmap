"use client";

import { mockPosts } from "@/app/lib/mock-data";
import { useAppStore } from "@/app/lib/store";
import { Post } from "@/app/lib/types";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { BottomSheet } from "./BottomSheet";

interface MapPinProps {
  post: Post;
  offsetX: number;
  offsetY: number;
  isSelected: boolean;
  onClick: () => void;
}

function MapPin({ post, offsetX, offsetY, isSelected, onClick }: MapPinProps) {
  return (
    <button
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${offsetX}%`, top: `${offsetY}%` }}
      onClick={onClick}
      aria-label={`${post.place_name}の音声スポット`}
    >
      <div className="group flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full transition-all duration-200 ${
            isSelected
              ? "h-4 w-4 bg-amber shadow-[0_0_8px_rgba(232,168,56,0.5)]"
              : "bg-soft-blue shadow-[0_0_6px_rgba(91,141,239,0.4)] group-hover:h-4 group-hover:w-4"
          }`}
        />
        <span className="mt-1 hidden whitespace-nowrap rounded bg-dark-navy/90 px-2 py-0.5 text-[10px] text-gray group-hover:block">
          {post.place_name}
        </span>
      </div>
    </button>
  );
}

function latLngToOffset(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 100;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 50 - (mercN / Math.PI) * 50;
  return { x, y };
}

export function MapView() {
  const { selectedPost, setSelectedPost } = useAppStore();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    },
    [offset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => Math.min(8, Math.max(0.5, prev - e.deltaY * 0.001)));
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-deep-black">
      {/* Map area */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        role="application"
        aria-label="音声スポットの地図"
      >
        <div
          className="absolute h-full w-full"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* Dark map background with grid pattern */}
          <div className="absolute inset-0 bg-deep-black">
            {/* Continent shapes (simplified SVG) */}
            <svg
              viewBox="0 0 1000 500"
              className="absolute inset-0 h-full w-full opacity-20"
              aria-hidden="true"
            >
              {/* Grid lines */}
              {Array.from({ length: 19 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * 28}
                  x2="1000"
                  y2={i * 28}
                  stroke="#1a1a2e"
                  strokeWidth="0.5"
                />
              ))}
              {Array.from({ length: 37 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 28}
                  y1="0"
                  x2={i * 28}
                  y2="500"
                  stroke="#1a1a2e"
                  strokeWidth="0.5"
                />
              ))}
              {/* Simplified landmass outlines */}
              {/* North America */}
              <path
                d="M150,80 Q180,70 210,90 Q240,85 250,110 Q260,140 240,160 Q220,180 200,170 Q180,200 160,220 Q140,200 130,170 Q120,140 130,110 Z"
                fill="#1a1a2e"
                stroke="#2a2a3e"
                strokeWidth="0.5"
              />
              {/* South America */}
              <path
                d="M220,250 Q240,240 250,260 Q260,290 270,320 Q265,360 250,380 Q240,400 220,390 Q210,370 215,340 Q210,310 215,280 Z"
                fill="#1a1a2e"
                stroke="#2a2a3e"
                strokeWidth="0.5"
              />
              {/* Europe */}
              <path
                d="M450,80 Q470,70 490,85 Q510,80 520,100 Q515,120 500,130 Q485,125 475,115 Q460,120 450,110 Z"
                fill="#1a1a2e"
                stroke="#2a2a3e"
                strokeWidth="0.5"
              />
              {/* Africa */}
              <path
                d="M470,160 Q500,140 520,160 Q540,190 550,230 Q545,280 530,320 Q510,350 490,340 Q470,310 465,270 Q460,230 465,190 Z"
                fill="#1a1a2e"
                stroke="#2a2a3e"
                strokeWidth="0.5"
              />
              {/* Asia */}
              <path
                d="M540,60 Q580,50 630,70 Q680,60 720,80 Q760,70 790,90 Q810,110 800,140 Q780,160 750,150 Q720,170 690,160 Q660,180 630,170 Q600,160 580,140 Q560,130 550,110 Q540,90 540,60 Z"
                fill="#1a1a2e"
                stroke="#2a2a3e"
                strokeWidth="0.5"
              />
              {/* Japan */}
              <path
                d="M820,110 Q825,100 830,105 Q835,115 832,130 Q828,140 825,135 Q820,125 820,110 Z"
                fill="#1a1a2e"
                stroke="#2a2a3e"
                strokeWidth="1"
              />
              {/* Australia */}
              <path
                d="M780,310 Q810,290 840,300 Q860,310 860,340 Q850,370 830,380 Q800,375 785,355 Q775,335 780,310 Z"
                fill="#1a1a2e"
                stroke="#2a2a3e"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          {/* Sound spot pins */}
          {mockPosts.map((post) => {
            const pos = latLngToOffset(post.latitude, post.longitude);
            return (
              <MapPin
                key={post.id}
                post={post}
                offsetX={pos.x}
                offsetY={pos.y}
                isSelected={selectedPost?.id === post.id}
                onClick={() => setSelectedPost(post)}
              />
            );
          })}
        </div>
      </div>

      {/* Zoom hint */}
      <div className="pointer-events-none absolute bottom-24 left-4 text-xs text-muted">
        スクロールでズーム・ドラッグで移動
      </div>

      {/* FAB - Post button */}
      <Link
        href="/record"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-amber text-deep-black shadow-lg shadow-amber/20 transition-transform hover:scale-105 active:scale-95"
        aria-label="音声を投稿する"
      >
        <Plus size={24} strokeWidth={2.5} />
      </Link>

      <BottomSheet />
    </div>
  );
}
