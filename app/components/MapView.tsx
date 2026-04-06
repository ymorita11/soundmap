"use client";

import { useAppStore } from "@/app/lib/store";
import { Post } from "@/app/lib/types";
import { useUser } from "@clerk/nextjs";
import { Loader2, Plus } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import { BottomSheet } from "./BottomSheet";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface SoundPinProps {
  post: Post;
  isSelected: boolean;
  onClick: () => void;
}

function SoundPin({ post, isSelected, onClick }: SoundPinProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group relative flex flex-col items-center"
      aria-label={`${post.place_name}の音声スポット`}
    >
      <div
        className={`rounded-full transition-all duration-200 ${
          isSelected
            ? "h-5 w-5 bg-amber shadow-[0_0_12px_rgba(232,168,56,0.6)]"
            : "h-3.5 w-3.5 bg-soft-blue shadow-[0_0_8px_rgba(91,141,239,0.5)] group-hover:h-4 group-hover:w-4"
        }`}
      />
      {isSelected && (
        <span className="mt-1 whitespace-nowrap rounded bg-dark-navy/95 px-2 py-1 text-[11px] text-off-white shadow-lg">
          {post.place_name}
        </span>
      )}
    </button>
  );
}

export function MapView() {
  const { isSignedIn } = useUser();
  const { posts, setPosts, selectedPost, setSelectedPost } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchPosts() {
      try {
        const params = new URLSearchParams({
          swLat: "-90", swLng: "-180",
          neLat: "90", neLng: "180",
          limit: "200",
        });
        const res = await fetch(`/api/posts?${params}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [setPosts]);

  const handleMapClick = useCallback(() => {
    if (selectedPost) setSelectedPost(null);
  }, [selectedPost, setSelectedPost]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="relative flex h-dvh w-full items-center justify-center bg-deep-black">
        <div className="text-center px-8">
          <p className="text-sm text-off-white mb-2">Mapbox トークンが未設定です</p>
          <p className="text-xs text-gray">
            .env.local に NEXT_PUBLIC_MAPBOX_TOKEN を設定してください。
            <br />
            トークンは{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-soft-blue underline"
            >
              Mapbox Dashboard
            </a>
            {" "}から無料で取得できます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-deep-black">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          latitude: 35.68,
          longitude: 139.76,
          zoom: 3,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={handleMapClick}
        attributionControl={false}
      >
        <NavigationControl position="bottom-left" showCompass={false} />

        {posts.map((post) => (
          <Marker
            key={post.id}
            latitude={post.latitude}
            longitude={post.longitude}
            anchor="center"
          >
            <SoundPin
              post={post}
              isSelected={selectedPost?.id === post.id}
              onClick={() => setSelectedPost(post)}
            />
          </Marker>
        ))}
      </Map>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-16 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2 rounded-full bg-dark-navy/90 px-4 py-2 text-xs text-gray">
          <Loader2 size={14} className="animate-spin" />
          読み込み中...
        </div>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && (
        <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-sm text-gray">まだ投稿がありません</p>
          <p className="mt-1 text-xs text-muted">右下のボタンから最初の音を投稿しましょう</p>
        </div>
      )}

      {/* FAB - Post button (only for signed-in users) */}
      {isSignedIn && (
        <Link
          href="/record"
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-amber text-deep-black shadow-lg shadow-amber/20 transition-transform hover:scale-105 active:scale-95"
          aria-label="音声を投稿する"
        >
          <Plus size={24} strokeWidth={2.5} />
        </Link>
      )}

      <BottomSheet />
    </div>
  );
}
