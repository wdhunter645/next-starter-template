import AuthClient from '../auth/AuthClient';

export default function JoinPage() {
  return <AuthClient forcedMode="join" hideModeToggle />;
}
