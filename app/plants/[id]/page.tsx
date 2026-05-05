interface Props {
  params: { id: string };
}

export default function PlantDetailPage({ params }: Props) {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-6">
      <div>
        <p className="text-sm text-muted mb-1">Plant #{params.id}</p>
        <h1 className="text-3xl font-semibold text-ink">Plant detail</h1>
      </div>

      <div className="rounded-2xl border border-linen bg-paper p-8 text-center">
        <p className="text-muted text-sm">Plant details coming soon</p>
      </div>
    </main>
  );
}
