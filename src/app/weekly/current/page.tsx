import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Current Voting - LGFC",
  description: "View the current weekly photo matchup voting results.",
};

export default function CurrentVoting() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Current Voting</h1>
          <p className="text-lg text-foreground/80">
            This page is reserved for the “live view” of the current Weekly Matchup—what&apos;s being voted on right now, plus
            the running totals and final results once voting closes.
          </p>

          <div className="mt-6 text-left max-w-2xl mx-auto space-y-3">
            <p className="text-base text-foreground/80">
              Today, LGFC‑Lite is still hardening the content pipeline. That means the matchup tiles are live, but the
              live-vote wiring is intentionally not enabled yet. The priority is stability first, then interactivity.
            </p>

            <ul className="list-disc pl-5 text-base text-foreground/80 space-y-2">
              <li>Want to participate? Start on the homepage Weekly Matchup section.</li>
              <li>Want the “vote is live” announcement? Join the mailing list on the Join page.</li>
              <li>Found a mislabeled photo or missing credit? Use the Contact page so we can correct it.</li>
            </ul>

            <p className="text-base text-foreground/80">
              When voting is switched on, this page becomes the canonical place to see the current matchup and results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
