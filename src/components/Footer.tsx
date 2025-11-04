import React from "react";

const SITE_NAME = "Lou Gehrig Fan Club";
// Cloudflare Pages policy: ZERO env vars in this repo.
const commitSha: string | undefined = undefined;

export default function Footer() {
  return (
    <footer className="footer">
      <span className="site-name">{SITE_NAME}</span>
      {/* Commit ID intentionally hidden on Cloudflare Pages (no envs allowed). */}
    </footer>
  );
}
