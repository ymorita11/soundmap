"use client";

import { useAppStore } from "@/app/lib/store";
import { formatDate } from "@/app/lib/utils";
import { MapPin, Play } from "lucide-react";
import { Button } from "./ui/Button";
import { useState } from "react";
import { ImmersiveOverlay } from "./ImmersiveOverlay";

export function BottomSheet() {
  const { selectedPost, setSelectedPost } = useAppStore();
  const [showOverlay, setShowOverlay] = useState(false);

  if (!selectedPost) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-deep-black/40"
        onClick={() => setSelectedPost(null)}
        aria-hidden="true"
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl border-t border-border bg-dark-navy"
        style={{ animation: "slide-up 300ms ease-out" }}
        role="dialog"
        aria-label="投稿情報"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-8 rounded-full bg-muted" />
        </div>

        <div className="px-6 pb-8">
          <div className="mb-1 flex items-start gap-2">
            <MapPin size={18} className="mt-0.5 shrink-0 text-soft-blue" />
            <h2 className="text-xl font-normal text-off-white">
              {selectedPost.place_name}
            </h2>
          </div>

          <p className="mb-6 ml-[26px] text-xs text-gray">
            @{selectedPost.user.username} ・{" "}
            {formatDate(selectedPost.recorded_at)}
          </p>

          <Button
            fullWidth
            onClick={() => setShowOverlay(true)}
            className="gap-2"
          >
            <Play size={18} />
            再生する
          </Button>
        </div>
      </div>

      {showOverlay && (
        <ImmersiveOverlay
          post={selectedPost}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </>
  );
}
