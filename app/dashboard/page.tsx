export default function DashboardPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Your garden</h1>
        <p className="text-muted mt-1">Here&apos;s what&apos;s happening this season.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Plants", count: 0, href: "/plants" },
          { label: "Seeds", count: 0, href: "/seeds" },
          { label: "Garden beds", count: 0, href: "/map" },
        ].map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-linen bg-paper p-5 hover:border-lichen transition-colors"
          >
            <p className="text-3xl font-semibold text-ink">{stat.count}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
          </a>
        ))}
      </div>

      <div className="rounded-2xl border border-linen bg-paper p-6">
        <h2 className="font-medium text-ink mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add plant", href: "/plants" },
            { label: "Identify plant", href: "/identify" },
            { label: "View map", href: "/map" },
            { label: "Ask Claude", href: "/ask" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center justify-center px-3 py-2.5 rounded-lg border border-linen text-sm text-ink hover:bg-parchment transition-colors"
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
