'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';

type Profile = {
  email: string;
  first_name: string;
  last_name: string;
  screen_name: string;
  email_opt_in: boolean;
};

type MemberCardContent = {
  id: number;
  title: string | null;
  body_md: string | null;
  updated_at: string | null;
};

const emptyProfile: Profile = {
  email: '',
  first_name: '',
  last_name: '',
  screen_name: '',
  email_opt_in: true,
};

export default function MemberProfilePage() {
  const { isLoading, isAuthenticated } = useMemberSession({ redirectTo: '/' });
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [savedProfile, setSavedProfile] = useState<Profile>(emptyProfile);
  const [cardContent, setCardContent] = useState<MemberCardContent | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');

  const dirty = useMemo(() => JSON.stringify(profile) !== JSON.stringify(savedProfile), [profile, savedProfile]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    let cancelled = false;
    const load = async () => {
      setLoadingProfile(true);
      setMessage('');
      try {
        const [profileRes, cardRes] = await Promise.all([
          fetch('/api/fanclub/profile', { credentials: 'include' }),
          fetch('/api/content/membercard', { credentials: 'include' }),
        ]);

        const profileData = await profileRes.json().catch(() => ({}));
        if (!cancelled && profileRes.ok && profileData?.ok && profileData.profile) {
          const nextProfile: Profile = {
            email: String(profileData.profile.email || ''),
            first_name: String(profileData.profile.first_name || ''),
            last_name: String(profileData.profile.last_name || ''),
            screen_name: String(profileData.profile.screen_name || ''),
            email_opt_in: profileData.profile.email_opt_in == null ? true : Boolean(profileData.profile.email_opt_in),
          };
          setProfile(nextProfile);
          setSavedProfile(nextProfile);
        }

        const cardData = await cardRes.json().catch(() => ({}));
        if (!cancelled && cardRes.ok && cardData?.ok) {
          setCardContent(cardData.content || null);
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated]);

  async function saveProfile() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/fanclub/profile', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          screen_name: profile.screen_name,
          email_opt_in: profile.email_opt_in,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setMessage(data?.error || 'Failed to save profile.');
        return;
      }
      const nextProfile: Profile = {
        email: String(data.profile.email || ''),
        first_name: String(data.profile.first_name || ''),
        last_name: String(data.profile.last_name || ''),
        screen_name: String(data.profile.screen_name || ''),
        email_opt_in: data.profile.email_opt_in == null ? true : Boolean(data.profile.email_opt_in),
      };
      setProfile(nextProfile);
      setSavedProfile(nextProfile);
      setMessage('Profile saved.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main style={{ padding: '40px 16px', maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 12px 0' }}>My Profile</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>Your member profile and membership card content.</p>

      <section style={{ marginTop: 18, padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
        <h2 style={{ marginTop: 0 }}>Profile</h2>
        {loadingProfile ? (
          <p>Loading profile…</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            <label>
              First name
              <input
                value={profile.first_name}
                onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </label>
            <label>
              Last name
              <input
                value={profile.last_name}
                onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </label>
            <label>
              Screen name
              <input
                value={profile.screen_name}
                onChange={(e) => setProfile((p) => ({ ...p, screen_name: e.target.value }))}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </label>
            <label>
              Email address
              <input value={profile.email} disabled style={{ width: '100%', padding: 8, marginTop: 4, opacity: 0.7 }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={profile.email_opt_in}
                onChange={(e) => setProfile((p) => ({ ...p, email_opt_in: e.target.checked }))}
              />
              Email opt-in
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveProfile} disabled={saving || !dirty} style={{ padding: '10px 14px' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setProfile(savedProfile)} disabled={!dirty || saving} style={{ padding: '10px 14px' }}>
                Cancel
              </button>
            </div>
            {message ? <p style={{ margin: 0, opacity: 0.85 }}>{message}</p> : null}
          </div>
        )}
      </section>

      <section style={{ marginTop: 36 }}>
        <h2 style={{ fontSize: 24, margin: '0 0 12px 0' }}>{cardContent?.title || 'Membership Card'}</h2>
        <div
          style={{
            display: 'flex',
            gap: 18,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 420px', minWidth: 280 }}>
            <p style={{ marginTop: 0, opacity: 0.9, whiteSpace: 'pre-wrap' }}>
              {cardContent?.body_md ||
                "Your membership card is a digital keepsake. Save the front and back card images below for personal use and sharing."}
            </p>
          </div>

          <div style={{ flex: '0 0 360px', maxWidth: 420, display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <figure style={{ margin: 0 }}>
              <img
                src="/membercard-front.png"
                alt="Membership card - front"
                style={{ width: 170, height: 'auto', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)' }}
              />
              <figcaption style={{ fontSize: 12, opacity: 0.75, marginTop: 6, textAlign: 'center' }}>Front</figcaption>
            </figure>
            <figure style={{ margin: 0 }}>
              <img
                src="/membercard-back.png"
                alt="Membership card - back"
                style={{ width: 170, height: 'auto', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)' }}
              />
              <figcaption style={{ fontSize: 12, opacity: 0.75, marginTop: 6, textAlign: 'center' }}>Back</figcaption>
            </figure>
          </div>
        </div>
      </section>
    </main>
  );
}
