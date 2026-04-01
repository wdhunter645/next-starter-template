import AuthClient from '../auth/AuthClient';

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode: modeParam } = await searchParams;
  const mode = modeParam === 'login' ? 'login' : 'join';
  return <AuthClient defaultMode={mode} />;
}
