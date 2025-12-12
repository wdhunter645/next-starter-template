"use client";

import { useState } from "react";

export default function JoinPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending...");

const res = await fetch("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(`Error: ${data.error || "unknown"}`);
      return;
    }

    setStatus("Thanks 2014 your request has been received. We2019ll email you updates as the club launches.");
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Join the Lou Gehrig Fan Club</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: 25 }}>
        <label>Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: "block", marginBottom: 15, width: "100%" }}
        />

        <label>Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", marginBottom: 15, width: "100%" }}
        />

        <button type="submit">Submit</button>
      </form>

      {status && <p style={{ marginTop: 20 }}>{status}</p>}
    </div>
  );
}
