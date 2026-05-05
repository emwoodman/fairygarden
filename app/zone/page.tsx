export default function ZonePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Zone finder</h1>
        <p className="text-muted mt-1">
          Find your USDA hardiness zone and frost dates.
        </p>
      </div>

      <div className="rounded-2xl border border-linen bg-paper p-6 space-y-4">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted">ZIP code</span>
          <input
            type="text"
            placeholder="e.g. 94103"
            className="w-full px-3 py-2 rounded-lg border border-linen bg-parchment text-ink text-sm placeholder:text-lichen focus:outline-none focus:ring-2 focus:ring-moss/30"
          />
        </label>
        <button className="px-4 py-2 rounded-lg bg-ink text-parchment text-sm font-medium hover:bg-moss transition-colors">
          Look up zone
        </button>
      </div>
    </main>
  );
}
