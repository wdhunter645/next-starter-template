import React from "react";

type WelcomeSectionProps = {
  email?: string | null;
};

export default function WelcomeSection({ email }: WelcomeSectionProps) {
  // Use email safely (no full email exposure). This also satisfies eslint no-unused-vars.
  const emailHint =
    typeof email === "string" && email.includes("@")
      ? email.split("@")[0]
      : "";

  return (
    <section aria-label="Welcome section">
      <h2>Welcome back{emailHint ? `, ${emailHint}` : ""}.</h2>
      <p>
        This is your FanClub home. New features will appear here as they go live.
      </p>
    </section>
  );
}
