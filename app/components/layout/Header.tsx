"use client";

import {
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
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
        <div className="flex items-center">
          <Show
            when="signed-in"
            fallback={
              <SignInButton mode="modal">
                <button className="flex h-8 items-center gap-2 rounded-full bg-dark-navy px-4 text-sm text-gray transition-colors hover:text-off-white">
                  ログイン
                </button>
              </SignInButton>
            }
          >
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full",
                },
              }}
            />
          </Show>
        </div>
      )}
    </header>
  );
}
