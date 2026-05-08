"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.68 3.68 0 0 1-1.6 2.42v2h2.58c1.51-1.39 2.4-3.44 2.4-5.88Z"
        fill="#4285F4"
      />
      <path
        d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.59-2a4.8 4.8 0 0 1-7.15-2.52H.96v2.06A8 8 0 0 0 8 16Z"
        fill="#34A853"
      />
      <path
        d="M3.56 9.54A4.81 4.81 0 0 1 3.3 8c0-.54.09-1.06.25-1.54V4.4H.96A8 8 0 0 0 0 8c0 1.29.31 2.51.96 3.6l2.6-2.06Z"
        fill="#FBBC05"
      />
      <path
        d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A7.94 7.94 0 0 0 8 0 8 8 0 0 0 .96 4.4l2.6 2.06A4.77 4.77 0 0 1 8 3.18Z"
        fill="#EA4335"
      />
    </svg>
  );
}

const INPUT_CLASS =
  "w-full px-3 py-2 rounded border border-linen bg-parchment text-ink text-sm placeholder:text-lichen focus:outline-none focus:ring-1 focus:ring-olive";

export default function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSignUp = searchParams.get("mode") === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleGoogleSignIn() {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3001/auth/callback",
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Check your email to confirm your account.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    }

    setLoading(false);
  }

  return (
    <div
      className="w-full bg-paper border border-linen rounded-xl p-6 space-y-5"
      style={{ maxWidth: 340 }}
    >
      {/* Heading */}
      <div className="text-center space-y-1">
        <h1 className="font-serif text-2xl text-ink">
          {isSignUp ? "Welcome to Fairy Garden" : "Welcome back"}
        </h1>
        <p className="text-xs text-muted">
          {isSignUp
            ? "Create your free garden — no credit card needed."
            : "Sign in to your garden."}
        </p>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-linen bg-parchment text-ink text-sm font-medium hover:bg-linen transition-colors"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-linen" />
        <span className="text-xs text-muted whitespace-nowrap">
          or sign in with email
        </span>
        <div className="flex-1 h-px bg-linen" />
      </div>

      {/* Error / success messages */}
      {error && <p className="text-xs text-rose">{error}</p>}
      {success && <p className="text-xs text-olive">{success}</p>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {isSignUp && (
          <div className="space-y-1">
            <label htmlFor="name" className="block text-xs text-muted">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              className={INPUT_CLASS}
            />
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="block text-xs text-muted">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-xs text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-olive text-parchment text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isSignUp ? "Create my garden" : "Sign in"}
        </button>
      </form>

      {/* Forgot password — sign-in mode only */}
      {!isSignUp && (
        <p className="text-center">
          <a
            href="#"
            className="text-xs text-olive hover:underline underline-offset-4"
          >
            Forgot your password?
          </a>
        </p>
      )}

      {/* Mode toggle */}
      <p className="text-center text-xs text-muted">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-olive hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            No account yet?{" "}
            <Link
              href="/signin?mode=signup"
              className="text-olive hover:underline underline-offset-4"
            >
              Create one free
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
