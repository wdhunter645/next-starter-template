'use client';

import React, { FormEvent, useState } from "react";

interface LibraryResponse {
  ok: boolean;
  id?: number | null;
  message?: string;
  error?: string;
}

const LibraryPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      const res = await fetch("/api/library/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, title, content }),
      });

      const data = (await res.json()) as LibraryResponse;

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Library submission failed");
      }

      setStatus("Thank you for contributing to the LGFC Library!");
      setTitle("");
      setContent("");
      // Keep name/email so members can submit multiple entries easily
    } catch (err: any) {
      setError(
        err?.message ?? "Something went wrong submitting your library entry."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        LGFC Library Submission
      </h1>
      <p style={{ marginBottom: "1.5rem" }}>
        Share your Lou Gehrig memories, stories, or reflections. Approved
        entries will appear in the public LGFC-Lite Library.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "0.75rem" }}
      >
        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span>Your Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            style={{ padding: "0.5rem", fontSize: "1rem" }}
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ padding: "0.5rem", fontSize: "1rem" }}
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span>Story Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            style={{ padding: "0.5rem", fontSize: "1rem" }}
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span>Your Story</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={loading}
            rows={8}
            style={{ padding: "0.5rem", fontSize: "1rem" }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem 1.2rem",
            fontSize: "1rem",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Submitting…" : "Submit to the Library"}
        </button>
      </form>

      {status && (
        <p style={{ marginTop: "1rem", color: "green" }}>{status}</p>
      )}
      {error && (
        <p style={{ marginTop: "1rem", color: "red" }}>{error}</p>
      )}
    </main>
  );
};

export default LibraryPage;
