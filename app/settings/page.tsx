export default function SettingsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Settings</h1>
        <p className="text-muted mt-1">Manage your account and preferences.</p>
      </div>

      <section className="rounded-2xl border border-linen bg-paper p-6 space-y-4">
        <h2 className="font-medium text-ink">Account</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">Display name</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-linen bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss/30"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-lg border border-linen bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss/30"
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-ink text-parchment text-sm font-medium hover:bg-moss transition-colors">
            Save changes
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-linen bg-paper p-6 space-y-4">
        <h2 className="font-medium text-ink">Danger zone</h2>
        <button className="px-4 py-2 rounded-lg border border-rose text-rose text-sm font-medium hover:bg-rose/10 transition-colors">
          Delete account
        </button>
      </section>
    </main>
  );
}
