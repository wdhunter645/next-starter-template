'use client';

import WeeklyMatchup from '@/components/WeeklyMatchup';

export default function CurrentVoting() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Current Voting</h1>
          <p className="text-lg text-foreground/80">
            Vote is live. Results are hidden until you cast your vote.
          </p>
        </div>

        <WeeklyMatchup />
      </div>
    </div>
  );
}
