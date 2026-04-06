"use client";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }
    if (!password) {
      newErrors.password = "パスワードを入力してください";
    } else if (password.length < 8) {
      newErrors.password = "パスワードは8文字以上で入力してください";
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "パスワードは英数字を含めてください";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-dark-gray px-6 pt-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-sm text-gray hover:text-off-white"
      >
        <ArrowLeft size={16} />
        戻る
      </Link>

      <div className="flex flex-1 flex-col items-center">
        <div className="w-full max-w-sm">
          <h1 className="mb-1 text-center text-2xl font-light text-off-white">
            SoundMap
          </h1>
          <p className="mb-10 text-center text-sm text-gray">
            音で旅する地図SNS
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="パスワード"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-xs text-muted hover:text-gray"
              >
                {showPassword ? "隠す" : "表示"}
              </button>
            </div>

            <Button type="submit" fullWidth size="md" className="mt-2">
              ログイン / 登録
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">または</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-transparent text-off-white transition-colors hover:bg-dark-navy"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Googleで続ける
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-black transition-opacity hover:opacity-90"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.34-3.74 4.25z" />
              </svg>
              Appleで続ける
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button className="text-xs text-gray hover:text-soft-blue">
              パスワードをお忘れですか？
            </button>

            <Link
              href="/"
              className="text-xs text-gray hover:text-off-white"
            >
              ゲストとして地図を見る →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
