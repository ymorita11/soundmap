"use client";

import { User } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  showProfile?: boolean;
}

export function Header({ showProfile = true }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-12 items-center justify-between bg-dark-gray/80 px-4 backdrop-blur-sm md:h-14">
      <Link href="/" className="text-lg font-light tracking-wide text-off-white">
        SoundMap
      </Link>
      {showProfile && (
        <Link
          href="/auth"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-navy text-gray transition-colors hover:text-off-white"
          aria-label="プロフィール"
        >
          <User size={18} />
        </Link>
      )}
    </header>
  );
}
