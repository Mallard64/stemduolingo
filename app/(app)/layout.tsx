"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar, BottomNav } from "@/components/shared/nav";
import { useUser } from "@/lib/store/user";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const profile = useUser((s) => s.profile);
  const hydrated = useUser((s) => s.hydrated);
  const hydrate = useUser((s) => s.hydrate);
  const checkDaily = useUser((s) => s.checkDaily);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!profile) {
      router.replace("/");
      return;
    }
    checkDaily();
  }, [hydrated, profile, router, checkDaily]);

  if (!hydrated) {
    return <div className="min-h-screen grid place-items-center text-ink-muted">Loading…</div>;
  }
  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
