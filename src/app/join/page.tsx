"use client";

import React, { useState } from "react";

export default function JoinPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setError("Name and email are required.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : "We couldn’t save your request. Please try again.";
        setError(msg);
      } else {
        setMessage(
          "Thanks for joining the Lou Gehrig Fan Club mailing list! Check your email for future updates."
        );
        setName("");
        setEmail("");
      }
    } catch (err) {
      console.error("Join request failed:", err);
      setError("Network error. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Join the Lou Gehrig Fan Club</h1>
      <p className="mb-6">
        Share your name and email to receive club updates, event news, and
        featured memorabilia highlights. No spam, ever.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-blue-700 text-white font-semibold disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Join the Club"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-green-700 font-medium" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 text-red-700 font-medium" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
