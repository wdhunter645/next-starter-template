'use client';

import { useEffect, useState } from 'react';
import WelcomeSection from '@/components/member/WelcomeSection';
import PostCreation from '@/components/member/PostCreation';
import DiscussionFeed from '@/components/member/DiscussionFeed';
import ArchivesTiles from '@/components/member/ArchivesTiles';
import GehrigTimeline from '@/components/member/GehrigTimeline';
import AdminLink from '@/components/member/AdminLink';

/**
 * Member Home Page - Authoritative implementation per docs/memberpage.html
 * 
 * Section order (per spec):
 * 1. Header (in layout.tsx)
 * 2. Welcome Section
 * 3. Post Creation / Work Area
 * 4. Member Discussion Feed
 * 5. Archives Tiles
 * 6. Gehrig Timeline
 * 7. Admin Dashboard Link (conditional)
 */
export default function MemberHomePage() {
  const [email, setEmail] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Get member email from localStorage
    try {
      const memberEmail = window.localStorage.getItem('lgfc_member_email') || '';
      setEmail(memberEmail);

      // Check if user is admin
      if (memberEmail) {
        fetch(`/api/member/role?email=${encodeURIComponent(memberEmail)}`)
          .then(res => res.json())
          .then(data => {
            if (data.ok && data.role === 'admin') {
              setIsAdmin(true);
            }
          })
          .catch(() => {
            setIsAdmin(false);
          });
      }
    } catch {
      setEmail('');
    }
  }, []);

  const handlePostCreated = () => {
    // Trigger refresh of discussion feed
    setRefreshTrigger(prev => prev + 1);
  };

  // If not logged in, show login prompt
  if (!email) {
    return (
      <main style={{ padding: '40px 20px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {/* Required heading for static export (assessment requirement) */}
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 700, 
          textAlign: 'center', 
          margin: '0 0 24px 0',
          color: 'var(--lgfc-blue)',
        }}>
          WELCOME LOU GEHRIG FAN CLUB MEMBERS
        </h1>
        <h2 style={{ fontSize: 28, margin: '0 0 16px 0' }}>Member Area</h2>
        <p style={{ fontSize: 16, color: 'rgba(0,0,0,0.7)', margin: '0 0 24px 0' }}>
          You&apos;re not signed in yet. Please log in to continue.
        </p>
        <a
          href="/login"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            background: 'var(--lgfc-blue)',
            border: 'none',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          Go to Login
        </a>
      </main>
    );
  }

  return (
    <main>
      {/* 1. Required heading for static export (assessment requirement) */}
      <h1 style={{ 
        fontSize: 32, 
        fontWeight: 700, 
        textAlign: 'center', 
        margin: '40px 20px 32px 20px',
        color: 'var(--lgfc-blue)',
      }}>
        WELCOME LOU GEHRIG FAN CLUB MEMBERS
      </h1>

      {/* 2. Welcome Section */}
      <WelcomeSection email={email} />

      {/* 3. Post Creation / Work Area */}
      <PostCreation email={email} onPostCreated={handlePostCreated} />

      {/* 4. Member Discussion Feed */}
      <DiscussionFeed refreshTrigger={refreshTrigger} />

      {/* 5. Archives Tiles */}
      <ArchivesTiles />

      {/* 6. Gehrig Timeline */}
      <GehrigTimeline />

      {/* 7. Admin Dashboard Link (conditional) */}
      <AdminLink isAdmin={isAdmin} />
    </main>
  );
}
