import React from "react";

const CONTACT_EMAIL = "LouGehrigFanClub@gmail.com";

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 840, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "var(--lgfc-font-size-h1)", margin: 0, color: "var(--lgfc-blue)" }}>Terms of Use</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--lgfc-text-muted)" }}>
          These Terms describe the basic rules for using the Lou Gehrig Fan Club website.
        </p>
      </header>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Acceptance of terms</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          By accessing or using this site, you agree to these Terms. If you do not agree, please
          do not use the site.
        </p>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Fan conduct</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          The Lou Gehrig Fan Club is intended to be a respectful, family-friendly community. You
          agree not to:
        </p>
        <ul style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)", paddingLeft: "1.25rem" }}>
          <li>Post hateful, harassing, or defamatory content.</li>
          <li>Incite violence or promote discrimination.</li>
          <li>Use the site to spam, advertise, or solicit inappropriately.</li>
        </ul>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          The club may remove content or restrict access to protect the community and honor Lou
          Gehrig&apos;s legacy.
        </p>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Intellectual property</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          The site may include club-created content, historical commentary, and user
          contributions. Where possible, historical photos and materials will be attributed to
          their sources. You agree not to copy or redistribute content from this site in a way
          that violates the rights of others.
        </p>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Disclaimer</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          This site is an independent fan effort and is not officially affiliated with Major
          League Baseball, the New York Yankees, or the Gehrig family. The site is provided on
          an &quot;as is&quot; basis without warranties of any kind.
        </p>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Limitation of liability</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          To the fullest extent allowed by law, the club organizers are not liable for any
          indirect, incidental, or consequential damages arising out of your use of the site.
        </p>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Changes to these Terms</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          These Terms may be updated over time. If changes are material, the club will post a
          notice on the site indicating that the Terms have been updated.
        </p>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", color: "var(--lgfc-blue)" }}>Contact</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
          Questions about these Terms can be sent to{" "}
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
