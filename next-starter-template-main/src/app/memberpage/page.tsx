// Alias route to support /memberpage.
// Source of truth is /member.

import MemberHomePage from '../member/page';

export default function MemberPageAlias() {
  return <MemberHomePage />;
}
