'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ClubHomeApiResponse } from '@/lib/clubHomeApi';

export type AiReviewSnapshot = {
  path: string;
  reviewMode: boolean;
  adminReview: boolean;
  sections: string[];
  contentSources?: {
    clubHome: string;
    fallback: string;
  };
  clubHome?: ClubHomeApiResponse;
  discussions?: Array<{
    id: number;
    title: string;
    body: string;
    created_at: string;
  }>;
  readOnly?: boolean;
};

type AiReviewGateProps = {
  reviewPath: '/' | '/fanclub' | '/admin';
  children: (snapshot: AiReviewSnapshot) => ReactNode;
};

export default function AiReviewGate({ reviewPath, children }: AiReviewGateProps) {
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState<AiReviewSnapshot | null>(null);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = searchParams.get('token');
    if (!token) {
      setDenied(true);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const query = new URLSearchParams({
          path: reviewPath,
          token,
        });
        const response = await fetch(`/api/_ai-review/page-snapshot?${query.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        });
        if (!response.ok) {
          if (!cancelled) setDenied(true);
          return;
        }
        const data = (await response.json()) as AiReviewSnapshot;
        if (!cancelled) setSnapshot(data);
      } catch {
        if (!cancelled) setDenied(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [reviewPath, searchParams]);

  if (loading) return null;
  if (denied || !snapshot) return null;
  return <>{children(snapshot)}</>;
}
