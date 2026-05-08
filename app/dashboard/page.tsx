import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(user: {
  email?: string | null;
  user_metadata?: Record<string, string>;
}) {
  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  if (fullName) return fullName.split(" ")[0];
  const local = (user.email ?? "").split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const METRICS = [
  { value: "19", label: "Plants on property" },
  { value: "0", label: "Seeds in inventory" },
  { value: "3", label: "Year 1 tasks done" },
  { value: "$950", label: "Year 1 budget" },
];

const TASKS = [
  "Divide hostas near the north fence",
  "Apply pre-emergent to front beds",
  "Prune roses after last frost",
];

const PLANTS = [
  { common: "Peony", botanical: "Paeonia lactiflora" },
  { common: "Hosta", botanical: "Hosta 'Sum and Substance'" },
  { common: "Rose", botanical: "Rosa 'Knock Out'" },
  { common: "Hydrangea", botanical: "Hydrangea paniculata" },
];

const BOTTOM_NAV = [
  { label: "Home", href: "/dashboard" },
  { label: "Map", href: "/map" },
  { label: "Plants", href: "/plants" },
  { label: "Plan", href: "/plan" },
  { label: "Community", href: "/community" },
];

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/signin");
  }

  const firstName = getFirstName(user);
  const today = formatDate(new Date());

  return (
    <div className="min-h-screen bg-parchment flex flex-col">

      {/* ── Top nav ── */}
      <header className="bg-paper border-b border-linen px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg text-ink">Fairy Garden</span>
          <span className="text-xs font-medium text-olive bg-grass px-2.5 py-1 rounded-full leading-none">
            Zone 5b
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:block">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg border border-linen text-sm text-muted hover:bg-parchment transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8 space-y-5 pb-28">

        {/* Greeting */}
        <div>
          <h1 className="font-serif text-3xl text-ink">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-sm text-muted mt-1">{today}</p>
        </div>

        {/* Seasonal tip */}
        <div className="bg-paper border border-linen rounded-[10px] px-5 py-4">
          <p className="text-xs text-clay mb-1.5">Seasonal tip</p>
          <p className="text-sm text-ink leading-relaxed">
            Your peonies in Bloomfield are likely pushing up right now. Mark their
            locations before the foliage disappears.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { emoji: "🌱", label: "Add plant", href: "/plants" },
            { emoji: "📷", label: "Identify plant", href: "/identify" },
            { emoji: "🗺️", label: "View map", href: "/map" },
            { emoji: "🤖", label: "Ask Claude", href: "/ask" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="bg-paper border border-linen rounded-lg flex flex-col items-center justify-center gap-1.5 py-4 hover:border-lichen transition-colors"
            >
              <span className="text-xl leading-none">{action.emoji}</span>
              <span className="text-xs text-ink">{action.label}</span>
            </a>
          ))}
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-4 gap-3">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="bg-paper border border-linen rounded-[10px] px-4 py-4"
            >
              <p className="text-2xl font-semibold text-ink">{m.value}</p>
              <p className="text-xs text-muted mt-1 leading-snug">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Two-column cards */}
        <div className="grid grid-cols-2 gap-4">

          {/* Upcoming tasks */}
          <div className="bg-paper border border-linen rounded-[10px] px-5 py-5">
            <h2 className="font-serif italic text-base text-ink mb-4">
              Upcoming tasks
            </h2>
            <ul className="space-y-3">
              {TASKS.map((task) => (
                <li key={task} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-4 h-4 rounded border border-linen flex-shrink-0" />
                  <span className="text-sm text-ink leading-snug">{task}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent plants */}
          <div className="bg-paper border border-linen rounded-[10px] px-5 py-5">
            <h2 className="font-serif italic text-base text-ink mb-4">
              Recent plants
            </h2>
            <ul className="space-y-3">
              {PLANTS.map((p) => (
                <li key={p.botanical}>
                  <p className="text-sm text-ink">{p.common}</p>
                  <p className="text-xs text-muted italic">{p.botanical}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>

      {/* ── Bottom nav ── */}
      <nav className="fixed bottom-0 inset-x-0 bg-paper border-t border-linen">
        <div className="max-w-2xl mx-auto flex">
          {BOTTOM_NAV.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex-1 flex items-center justify-center py-3.5 text-xs transition-colors ${
                i === 0 ? "text-olive font-medium" : "text-muted hover:text-olive"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

    </div>
  );
}
