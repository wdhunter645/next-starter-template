"use client";

export default function MilestonesSection() {
	return (
		<aside>
			<h2 className="section-title">Milestones</h2>
			<p className="sub">Key moments from Gehrig&apos;s life and career.</p>
			<div className="timeline">
				<div className="item">
					<div>
						<span className="badge">1923</span>
					</div>
					<div>
						<strong>MLB Debut</strong>
						<br />
						<span className="sub">
							First appearance with the New York Yankees.
						</span>
					</div>
				</div>
				<div className="item">
					<div>
						<span className="badge">1939</span>
					</div>
					<div>
						<strong>Farewell Address</strong>
						<br />
						<span className="sub">
							&quot;The luckiest man on the face of the earth.&quot;
						</span>
					</div>
				</div>
				<div className="item">
					<div>
						<span className="badge">2021</span>
					</div>
					<div>
						<strong>Lou Gehrig Day</strong>
						<br />
						<span className="sub">MLB establishes annual day in his honor.</span>
					</div>
				</div>
			</div>
		</aside>
	);
}
