import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PropertyMap from "@/components/PropertyMap";

export default async function MapPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/signin");
  }

  const BOTTOM_NAV = [
    { label: "Home",      href: "/dashboard" },
    { label: "Map",       href: "/map" },
    { label: "Plants",    href: "/plants" },
    { label: "Plan",      href: "/plan" },
    { label: "Community", href: "/community" },
  ];

  return (
    <div className="h-screen flex flex-col bg-parchment overflow-hidden">

      {/* Top nav */}
      <header className="flex-shrink-0 bg-paper border-b border-linen px-5 py-3 flex items-center justify-between gap-4">
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

      {/* Map fills all available height */}
      <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <PropertyMap />
      </div>

      {/* Bottom nav — Map tab active */}
      <nav className="flex-shrink-0 bg-paper border-t border-linen">
        <div className="flex">
          {BOTTOM_NAV.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex-1 flex items-center justify-center py-3.5 text-xs transition-colors ${
                i === 1 ? "text-olive font-medium" : "text-muted hover:text-olive"
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
