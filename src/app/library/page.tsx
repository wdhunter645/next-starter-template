"use client";
import { useState } from "react";

export default function LibraryPage() {
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
      title: form.get("title") as string,
      story: form.get("story") as string,
    };

    try {
      const res = await fetch("/api/library/submit", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      setStatus("Your story has been collected and stored. Thank you!");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Submit to the

