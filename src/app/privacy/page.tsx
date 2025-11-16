import React from "react";

const CONTACT_EMAIL = "LouGehrigFanClub@gmail.com";

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 840, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "var(--lgfc-font-size-h1)", margin: 0, color: "var(--lgfc-blue)" }}>Privacy Policy</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--lgfc-text-muted)" }}>
          This page explains how the Lou Gehrig Fan Club handles basic information collected
          when you use the site and, in the future, when you join the club.
        </p>
      </header>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Who we are</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          The Lou Gehrig Fan Club is an independent, fan-run effort to honor the life and legacy
          of Lou Gehrig, support ALS-focused charities, and build a respectful community of fans.
        </p>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Information we expect to collect</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          The public site is primarily informational. In future phases, when the members area is
          active, the club expects to collect only:
        </p>
        <ul style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)", paddingLeft: "1.25rem" }}>
          <li>Name</li>
          <li>Email address</li>
          <li>Screen name (which may default to your email address)</li>
        </ul>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          The club will not intentionally collect sensitive categories of personal data, and will
          not sell your information.
        </p>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>How we use information</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          When the members site is live, your basic information will be used to:
        </p>
        <ul style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)", paddingLeft: "1.25rem" }}>
          <li>Send email-based magic links to sign in.</li>
          <li>Display your chosen screen name with posts you make.</li>
          <li>Administer the community (for example, moderation and safety work).</li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Cookies and basic logs</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          The site may use basic cookies or equivalent technology to keep you signed in and to
          help protect against abuse. Hosting providers (such as Cloudflare or Vercel) may also
          maintain standard server logs for security and performance.
        </p>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Your choices</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          When the members site is available, you will be able to:
        </p>
        <ul style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)", paddingLeft: "1.25rem" }}>
          <li>Update your name and screen name.</li>
          <li>Change your email address via a confirmed magic-link process.</li>
          <li>Request that your account be closed.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Contact</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          Questions about this Privacy Policy can be sent to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{ color: "var(--lgfc-blue)", textDecoration: "underline" }}
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
