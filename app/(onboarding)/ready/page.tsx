import Link from "next/link";

export default function Ready() {
  return (
    <main className="min-h-screen grid place-items-center px-6 text-center">
      <div className="max-w-md">
        <div className="text-6xl mb-4" aria-hidden>🚀</div>
        <h1 className="text-3xl font-bold mb-2">You're set.</h1>
        <p className="text-ink-muted mb-8">
          Let's start with <span className="font-semibold text-ink">Atomic Structure</span>.
        </p>
        <Link href="/learn" className="btn-primary w-full">Start learning</Link>
      </div>
    </main>
  );
}
