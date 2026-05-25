import Link from "next/link";

export default function Welcome() {
  return (
    <main className="min-h-screen grid place-items-center px-6 text-center">
      <div className="max-w-md">
        <div className="text-6xl mb-4" aria-hidden>⚛</div>
        <h1 className="text-3xl font-bold mb-2">Welcome to OmniSTEM</h1>
        <p className="text-ink-muted mb-8">
          Crush AP Chem with daily 2-minute lessons and a puzzle that keeps you sharp.
        </p>
        <Link href="/pick-goal" className="btn-primary w-full">Get started</Link>
      </div>
    </main>
  );
}
