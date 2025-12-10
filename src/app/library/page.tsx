"use client";

import React, { useState } from "react";

export default function LibraryPage() {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedStory = story.trim();

    if (!trimmedTitle || !trimmedStory) {
      setError("Title and story are required.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/library/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          story: trimmedStory,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : "We couldn’t save your entry. Please try again.";
        setError(msg);
      } else {
        setMessage("Thanks for sharing your story with the Lou Gehrig Fan Club!");
        setTitle("");
        setStory("");
      }
    } catch (err) {
      console.error("Library submit failed:", err);
      setError("Network error. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 520,
        margin: "40px auto",
        fontFamily: "sans-serif",
        padding: "0 16px",
      }}
    >
      <h1>Submit to the Library</h1>
      <p>
        Share your favorite Lou Gehrig story, memory, or piece of memorabilia.
        Selected entries may be featured on the site in a future update.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="title" style={{ display: "block", fontWeight: 600 }}>
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="story" style={{ display: "block", fontWeight: 600 }}>
            Story
          </label>
          <textarea
            id="story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={6}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "8px 16px",
            fontWeight: 600,
            cursor: submitting ? "default" : "pointer",
          }}
        >
          {submitting ? "Submitting..." : "Submit to the Library"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 16, color: "green", fontWeight: 600 }}>{message}</p>
      )}

      {error && (
        <p style={{ marginTop: 16, color: "red", fontWeight: 600 }}>{error}</p>
      )}
    </main>
  );
}
