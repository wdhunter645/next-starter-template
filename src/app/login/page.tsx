import AuthClient from '../auth/AuthClient';

export default function LoginPage() {
  return <AuthClient forcedMode="login" hideModeToggle />;
}
