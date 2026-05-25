"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/lib/store/user";

export default function LoginPage() {
  const router = useRouter();
  const signIn = useUser((s) => s.signIn);
  const [email, setEmail] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const username = email.split("@")[0] || "you";
    signIn(username);
    router.push("/learn");
  }

  function google() {
    signIn("you");
    router.push("/learn");
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-ink-muted mb-6">Sign in to continue your streak.</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="btn-primary" type="submit">Sign in</button>
        </form>
        <div className="my-4 text-center text-xs text-ink-subtle">or</div>
        <button onClick={google} className="btn-secondary w-full">Continue with Google</button>
        <p className="text-xs text-ink-muted mt-4 text-center">
          New here? <Link className="text-primary font-medium" href="/signup">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
