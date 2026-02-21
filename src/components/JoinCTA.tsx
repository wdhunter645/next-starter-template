import Link from 'next/link';

export default function JoinCTA() {
  return (
    <div className="joinBanner section-gap">
      <h2 className="section-title">Join the Lou Gehrig Fan Club</h2>
      <div className="join-banner__container">
        <p className="join-banner__text">Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more.</p>
        <div className="join-banner__actions">
          <Link className="join-banner__btn" href="/join">Join</Link>
          <Link className="join-banner__btn" href="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
