import Link from "next/link";

const FEATURES = [
  {
    title: "Property map",
    description:
      "Sketch your lot, place your buildings and zones, and plan every corner of your space.",
  },
  {
    title: "Plant inventory",
    description:
      "Identify unknown plants with a photo, track what you have, and get care advice for your zone.",
  },
  {
    title: "Garden plan",
    description:
      "Build a multi-year planting plan with seasonal tasks and budget tracking.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment text-ink flex flex-col">
      {/* Nav */}
      <header className="bg-paper border-b border-linen px-6 py-4 flex items-center justify-between">
        <span className="font-serif text-xl text-ink">Fairy Garden</span>
        <Link
          href="/signin"
          className="text-sm font-medium text-olive hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="font-serif text-4xl sm:text-5xl leading-tight text-ink">
            Your garden, beautifully planned.
          </h1>
          <p className="text-base sm:text-lg text-muted leading-relaxed max-w-xl mx-auto">
            Plan your outdoor space, identify your plants, and grow with
            confidence — wherever you are in Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/signin?mode=signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-olive text-parchment text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-linen text-ink text-sm font-medium hover:bg-paper transition-colors"
            >
              Browse gardens
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-linen bg-paper px-6 py-6 text-left"
            >
              <h2 className="font-medium text-ink mb-2">{f.title}</h2>
              <p className="text-sm text-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <p className="mt-12 text-sm text-muted">
          No GPS. No ads. Your garden data stays yours.
        </p>
      </main>
    </div>
  );
}
