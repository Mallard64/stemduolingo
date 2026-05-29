"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/lib/store/user";

export default function SignupPage() {
  const router = useRouter();
  const signIn = useUser((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    signIn(username.trim() || email.split("@")[0] || "you", email);
    router.push("/welcome");
  }

  function google() {
    signIn("you", "user@gmail.com");
    router.push("/welcome");
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-sm text-ink-muted mb-6">Start your AP Chem journey.</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
            placeholder="Choose a password"
            className="rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="btn-primary" type="submit">Sign up</button>
        </form>
        <div className="my-4 text-center text-xs text-ink-subtle">or</div>
        <button onClick={google} className="btn-secondary w-full">Continue with Google</button>
        <p className="text-xs text-ink-muted mt-4 text-center">
          Already have an account? <Link className="text-primary font-medium" href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
