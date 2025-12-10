"use client";
import { useState } from "react";

export default function JoinPage() {
  const [status, setStatus] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setStatus(null);
    setError(null);

    const form = new FormData(e.target);
    const payload = {
      name: form.get("name") as string,
      email: form.get("email") as string,
    };

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      setStatus("You're on the list! Welcome to the LGFC.");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Join the Fan Club</h1>

      {status && <p style={{ color: "green" }}>{status}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <p><input name="name" placeholder="Your name" required /></p>
        <p><input name="email" type="email" placeholder="Your email" required /></p>
        <button type="submit">Join</button>
      </form>
    </div>
  );
}
