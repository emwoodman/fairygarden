import Link from "next/link";
import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* Nav */}
      <header className="bg-paper border-b border-linen px-6 py-4 flex items-center justify-between">
        <span className="font-serif text-xl text-ink">Fairy Garden</span>
        <Link
          href="/community"
          className="text-sm text-muted hover:text-ink transition-colors"
        >
          Browse community gardens
        </Link>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense>
          <SignInForm />
        </Suspense>

        {/* Privacy note */}
        <div className="absolute bottom-6 left-0 right-0 text-center px-4">
          <p className="text-xs text-lichen">
            No GPS. No ads. Your garden data stays yours.{" "}
            <a href="#" className="text-olive hover:underline underline-offset-4">
              Read our privacy promise
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
