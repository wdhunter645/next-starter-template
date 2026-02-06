"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

type FAQItem = {
  id: number;
  question: string;
  answer: string;
  updated_at: string;
};

export default function FAQSection() {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [submitOk, setSubmitOk] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const query = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let alive = true;
    let completed = false;
    
    const timer = setTimeout(() => {
      if (alive && !completed) {
        setLoading(false);
        setItems([]);
      }
    }, 10000); // 10 second timeout
    
    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: FAQItem[] }>(
          `/api/faq/list?limit=10${query ? `&q=${encodeURIComponent(query)}` : ""}`
        );
        if (alive) setItems(data.items || []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) {
          setLoading(false);
          completed = true;
        }
      }
    })();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query]);

  const isValidEmail = (email: string): boolean => {
    const trimmed = email.trim();
    // Basic email validation: at least one char before @, domain name, and TLD
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return trimmed.length > 0 && 
           trimmed.length <= 254 &&
           emailRegex.test(trimmed);
  };

  const canSubmit = question.trim().length >= 10 && isValidEmail(email);

  const submit = async () => {
    const text = question.trim();
    const emailText = email.trim();
    if (!text || !emailText || !canSubmit) return;
    setSubmitOk(false);
    setSubmitErr(null);

    try {
      const res = await apiPost<{ ok: boolean; error?: string }>("/api/faq/submit", { question: text, email: emailText });
      if (!res.ok) throw new Error(res.error || "Submit failed");
      setQuestion("");
      setEmail("");
      setSubmitOk(true);
      // do not reload approved list (pending won't show). keep UX simple.
    } catch (e: unknown) {
      setSubmitErr(String((e as Error)?.message || e));
    }
  };

  return (
    <div>
      <h2 className="section-title">FAQ – Frequently Asked Questions</h2>
      <p className="sub">
        FAQ is pulled live from D1. Search shows up to 10 approved answers.
        If you don&apos;t find what you need, submit a new question for admin review.
      </p>

      <div className="faq">
        <div className="search">
          <input
            id="faqSearch"
            type="search"
            placeholder="Search questions..."
            aria-label="Search questions"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button id="faqClear" onClick={() => setQ("")}>Clear</button>
        </div>

        <div id="faqList">
          {loading ? (
            <p className="sub">Loading FAQ…</p>
          ) : items.length === 0 ? (
            <p className="sub">
              No matching FAQ answers found.
              <span style={{ marginLeft: 8 }}>
                <Link className="link" href="/faq#ask">Ask a Question</Link>
              </span>
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="q">
                <strong>{item.question}</strong>
                <br />
                <span className="sub">{item.answer}</span>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 18 }} id="ask">
          <h3 style={{marginTop: 20}}>Ask a Question</h3>
          <label htmlFor="qtext" className="visually-hidden">Ask a question</label>
          <textarea
            id="qtext"
            placeholder="Type your question (minimum 10 characters)..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <label htmlFor="qemail" className="visually-hidden">Your email address</label>
          <input
            id="qemail"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginTop: 10, padding: 8, width: '100%', maxWidth: 400 }}
            required
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <button type="button" onClick={submit} disabled={!canSubmit}>Submit</button>
            
          </div>
          {submitOk ? (
            <div id="qsuccess" className="success">Thanks! Your question was received and queued for review.</div>
          ) : null}
          {submitErr ? (
            <div className="sub" style={{ marginTop: 8, color: "#b00020" }}>Submit failed: {submitErr}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
