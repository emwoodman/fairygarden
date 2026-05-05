export default function PlantsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Plant inventory</h1>
          <p className="text-muted mt-1">All the plants in your garden.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-ink text-parchment text-sm font-medium hover:bg-moss transition-colors">
          Add plant
        </button>
      </div>

      <div className="rounded-2xl border border-linen bg-paper p-10 text-center">
        <p className="text-muted text-sm">No plants yet. Add your first one!</p>
      </div>
    </main>
  );
}
