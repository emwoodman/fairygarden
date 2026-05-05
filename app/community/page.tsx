export default function CommunityPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Community gardens</h1>
        <p className="text-muted mt-1">Browse public gardens shared by the community.</p>
      </div>

      <div className="rounded-2xl border border-linen bg-paper p-10 text-center">
        <p className="text-muted text-sm">No public gardens yet. Be the first to share yours!</p>
      </div>
    </main>
  );
}
