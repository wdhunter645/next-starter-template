'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMemberSession } from '@/hooks/useMemberSession';

type Profile = {
  email: string;
  first_name: string;
  last_name: string;
  screen_name: string;
  email_opt_in: boolean;
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
        const profileRes = await fetch('/api/fanclub/profile', { credentials: 'include' });

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
      <p style={{ opacity: 0.85, marginTop: 0 }}>Manage your member profile details.</p>

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

      <section
        style={{
          marginTop: 24,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Link href="/fanclub/membercard" style={{ textDecoration: 'none' }}>
          <span
            style={{
              display: 'inline-flex',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.2)',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            View Membership Card
          </span>
        </Link>
        <Link href="/fanclub" style={{ textDecoration: 'none' }}>
          <span
            style={{
              display: 'inline-flex',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.2)',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            Back to Fan Club Home
          </span>
        </Link>
      </section>
    </main>
  );
}
