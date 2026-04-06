"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);

    try {
      const firstName = name.split(" ")[0];
      const lastName = name.split(" ").slice(1).join(" ") || undefined;

      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Welcome to VocalWeb!");
        window.location.href = "/dashboard";
      } else if (result.status === "missing_requirements") {
        // Auto-attempt email verification if Clerk requires it
        const verification = result.verifications?.emailAddress;
        if (verification?.status === "unverified") {
          await result.prepareEmailAddressVerification({ strategy: "email_code" });
          toast.error("Please verify your email — check your inbox for a code.");
        } else {
          toast.error("Sign-up incomplete. Please try again.");
        }
      }
    } catch (err: unknown) {
      const error = err as { errors?: { message: string }[] };
      toast.error(error?.errors?.[0]?.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
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
            Create your account
          </h1>
          <p className="text-[14px] text-zinc-500 mb-8">
            Free to start. Your first website in minutes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
              />
            </div>

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
                  placeholder="At least 8 characters"
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3 pr-10 text-[14px] text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 h-1 rounded-full transition-colors ${
                        passwordStrength >= level
                          ? level === 1
                            ? "bg-red-400"
                            : level === 2
                            ? "bg-amber-400"
                            : "bg-emerald-500"
                          : "bg-zinc-100"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div id="clerk-captcha" />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-4 text-[11px] text-zinc-400 text-center leading-relaxed">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-zinc-600 hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-zinc-600 hover:underline">Privacy Policy</Link>.
          </p>

          <p className="mt-6 text-center text-[13px] text-zinc-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-zinc-900 font-medium hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-1 bg-zinc-50 border-l border-zinc-100 items-center justify-center p-12">
        <div className="max-w-xs w-full space-y-6">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            What you get
          </div>
          {[
            "Beautiful website generated from your voice",
            "Mobile-responsive HTML you can download",
            "Instant public link to share",
            "Regenerate as many times as you want",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={10} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[14px] text-zinc-600">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
