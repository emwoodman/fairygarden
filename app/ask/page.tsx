export default function AskPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 flex flex-col h-[calc(100vh-6rem)] space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Ask Claude</h1>
        <p className="text-muted mt-1">
          Get gardening advice powered by Claude AI.
        </p>
      </div>

      <div className="flex-1 rounded-2xl border border-linen bg-paper p-6 overflow-y-auto">
        <p className="text-muted text-sm text-center mt-8">
          Start a conversation about your garden.
        </p>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          placeholder="Ask anything about your garden..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-linen bg-paper text-ink text-sm placeholder:text-lichen focus:outline-none focus:ring-2 focus:ring-moss/30"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg bg-ink text-parchment text-sm font-medium hover:bg-moss transition-colors"
        >
          Send
        </button>
      </form>
    </main>
  );
}
