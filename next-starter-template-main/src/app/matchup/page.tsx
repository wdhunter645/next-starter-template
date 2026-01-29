import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Matchup - LGFC",
  description: "Vote for your favorite Lou Gehrig photos and moments in our weekly matchup.",
};

export default function Matchup() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Weekly Matchup</h1>
          <p className="text-lg text-foreground/80">
            Each week we feature two Lou Gehrig photos (or related moments) and let the community pick a favorite.
            The goal is simple: keep the archive moving, surface great images, and spark conversation.
          </p>

          <div className="mt-6 text-left max-w-2xl mx-auto space-y-3">
            <p className="text-base text-foreground/80">
              For now, voting is in Phase 7 “baseline mode”: the matchup tiles and page layout are live, while the
              live vote totals and history views will be enabled after the content pipeline is fully stable.
            </p>
            <ul className="list-disc pl-5 text-base text-foreground/80 space-y-2">
              <li>See the featured matchup on the homepage or the Weekly page.</li>
              <li>Use the Join page to get notified when voting/results are switched on.</li>
              <li>Send corrections or source notes via the Contact page—accuracy matters.</li>
            </ul>
            <p className="text-base text-foreground/80">
              This feature is intentionally lightweight so we can ship reliably, then expand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
