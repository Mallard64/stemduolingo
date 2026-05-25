import Link from "next/link";

export default function FailedPage() {
  return (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div className="max-w-md">
        <div className="text-6xl mb-4" aria-hidden>💔</div>
        <h1 className="text-2xl font-bold mb-2">Out of hearts</h1>
        <p className="text-ink-muted mb-6">No XP this round. Take a breather and try again — hearts refill on your next attempt.</p>
        <Link href="/learn" className="btn-primary w-full">Back to skill tree</Link>
      </div>
    </div>
  );
}
