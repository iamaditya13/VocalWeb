"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Welcome back!");
        window.location.href = "/dashboard";
      } else {
        toast.error("Sign-in incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as { errors?: { message: string }[] };
      toast.error(error?.errors?.[0]?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel - form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-700 mb-10 transition-colors"
          >
            <ArrowLeft size={13} />
            Back to home
          </Link>

          <div className="flex items-center gap-2 mb-10">
            <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2C5.5 2 4 3 4 5v2c0 1.7 1.3 3 3 3s3-1.3 3-3V5c0-2-1.5-3-3-3z" fill="white" />
                <path d="M2 7c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-semibold text-[15px] text-zinc-900">VocalWeb</span>
          </div>

          <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 mb-1.5">
            Sign in
          </h1>
          <p className="text-[14px] text-zinc-500 mb-8">
            Welcome back. Continue building.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3 pr-10 text-[14px] text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-[12px] text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-zinc-400">
            No account yet?{" "}
            <Link href="/auth/signup" className="text-zinc-900 font-medium hover:underline underline-offset-2">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right panel - visual */}
      <div className="hidden lg:flex flex-1 bg-zinc-50 border-l border-zinc-100 items-center justify-center p-12">
        <AuthVisual />
      </div>
    </div>
  );
}

function AuthVisual() {
  return (
    <div className="max-w-sm w-full space-y-4">
      <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-6">
        Latest creation
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-card">
        <div className="bg-zinc-900 h-32 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white font-bold text-lg">Bloom Salon</div>
            <div className="text-zinc-400 text-xs mt-1">Premium Hair & Bridal</div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12px] font-semibold text-zinc-700">bloom-salon.vocalweb.ai</div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-medium text-emerald-700">Live</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 bg-zinc-100 rounded w-full" />
            <div className="h-1.5 bg-zinc-100 rounded w-3/4" />
            <div className="h-1.5 bg-zinc-100 rounded w-5/6" />
          </div>
        </div>
      </div>

      <div className="text-[12px] text-zinc-400 text-center">
        Generated from a 45-second voice recording
      </div>
    </div>
  );
}
