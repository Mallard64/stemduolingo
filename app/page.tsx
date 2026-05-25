import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center max-w-5xl w-full mx-auto">
        <div className="font-bold text-lg flex items-center gap-2">
          <span className="text-primary text-2xl">⚛</span>
          OmniSTEM
        </div>
        <Link href="/login" className="text-sm font-medium text-ink-muted hover:text-ink">
          Sign in
        </Link>
      </header>

      <section className="flex-1 grid place-items-center px-6">
        <div className="text-center max-w-2xl">
          <span className="badge mb-6">⚗️ AP Chemistry, gamified</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-4">
            Ace AP Chem, one streak at a time.
          </h1>
          <p className="text-ink-muted text-lg mb-8">
            Bite-size lessons, a daily Element Match puzzle, and a leaderboard that keeps you coming back.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup" className="btn-primary">Get started — it's free</Link>
            <Link href="/daily" className="btn-secondary">Try today's puzzle</Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: "📚", h: "5 lessons", p: "Atomic structure → stoichiometry." },
              { icon: "🔥", h: "Daily streak", p: "Show up daily, level up." },
              { icon: "⚗️", h: "Element Match", p: "A new puzzle every day." },
            ].map((f) => (
              <div key={f.h} className="card">
                <div className="text-2xl mb-2" aria-hidden>{f.icon}</div>
                <div className="font-semibold">{f.h}</div>
                <p className="text-sm text-ink-muted">{f.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center text-xs text-ink-subtle py-6">
        Built for the OmniSTEM 7-day demo.
      </footer>
    </main>
  );
}
