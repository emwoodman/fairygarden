export default function IdentifyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Identify a plant</h1>
        <p className="text-muted mt-1">
          Upload a photo and Claude will identify it for you.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-linen bg-paper p-12 flex flex-col items-center justify-center gap-4">
        <p className="text-muted text-sm">Drop a photo here, or click to upload</p>
        <button className="px-4 py-2 rounded-lg border border-linen bg-parchment text-ink text-sm hover:bg-linen transition-colors">
          Choose photo
        </button>
      </div>
    </main>
  );
}
