import Link from "next/link";

const NAV_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/plants", label: "Plants" },
  { href: "/seeds", label: "Seeds" },
  { href: "/plan", label: "Plan" },
  { href: "/identify", label: "Identify" },
  { href: "/zone", label: "Zone" },
  { href: "/ask", label: "Ask" },
];

export default function Nav() {
  return (
    <nav className="border-b border-linen bg-paper px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="font-semibold text-ink text-sm">
        Fairy Garden
      </Link>
      <div className="flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 rounded-lg text-sm text-muted hover:text-ink hover:bg-linen transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <Link
        href="/settings"
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        Settings
      </Link>
    </nav>
  );
}
