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
            This page is currently in “draft content” mode while the final voting flow is wired up.
          </p>
        </div>
      </div>
    </div>
  );
}
