"use client";

export default function JoinBanner() {
	return (
		<section className="container" role="region" aria-label="Join the Club">
			<div className="cta-band">
				<div>
					<div>
						<strong>Become a member.</strong> Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more.
					</div>
					<div className="cta-actions">
						<a className="btn" href="/member">
							Join
						</a>
						<a className="btn" href="/member">
							Login
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
