import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Member Area - LGFC",
	description: "Access member-exclusive content and manage your Lou Gehrig Fan Club membership.",
};

function getUpcomingEvents() {
	// Static placeholder data for now. Later this will be fed from Supabase events.
	return [
		{
			date: "Dec 15, 2025",
			title: "Annual Lou Gehrig Memorial Event",
			location: "Yankee Stadium / Virtual",
		},
		{
			date: "Jan 8, 2026",
			title: "Virtual Q&A with Baseball Historians",
			location: "Online",
		},
		{
			date: "Feb 3, 2026",
			title: "Fan Club Meet & Greet",
			location: "New York / Hybrid",
		},
	];
}

export default function MemberPage() {
	const events = getUpcomingEvents();

	return (
		<main className="memberpage">
			{/* Welcome section */}
			<section className="memberpage-section memberpage-welcome" style={{ marginBottom: '2.5rem' }}>
				<div className="memberpage-section-header">
					<h1 className="memberpage-title">Welcome back, Member</h1>
					<p className="memberpage-subtitle">
						This is your home inside the Lou Gehrig Fan Club. Here&apos;s what&apos;s happening over the next 30 days.
					</p>
				</div>

				<div className="memberpage-welcome-grid">
					<div className="memberpage-card memberpage-card-profile">
						<h2 className="memberpage-card-title">Your Profile</h2>
						<p className="memberpage-card-text">
							View your contributions, update your name or screen name, and manage your email address.
						</p>
						<a href="/member/profile" className="memberpage-button">
							Go to Profile Page
						</a>
						<p className="memberpage-card-note">
							Email changes will require a new magic-link verification before they take effect.
						</p>
					</div>

					<div className="memberpage-card memberpage-card-events">
						<h2 className="memberpage-card-title">Upcoming Events (30 days)</h2>
						<ul className="memberpage-events-list">
							{events.map((event) => (
								<li key={event.date} className="memberpage-events-item">
									<div className="memberpage-events-date">{event.date}</div>
									<div className="memberpage-events-meta">
										<div className="memberpage-events-title">{event.title}</div>
										<div className="memberpage-events-location">{event.location}</div>
									</div>
								</li>
							))}
						</ul>
						<a href="/calendar" className="memberpage-link">
							View full club calendar →
						</a>
					</div>
				</div>
			</section>

			{/* Discussions section */}
			<section className="memberpage-section memberpage-discussions" style={{ marginBottom: '2.5rem' }}>
				<div className="memberpage-section-header">
					<h2 className="memberpage-section-title">Club Discussions</h2>
					<p className="memberpage-subtitle">
						Top-level posts require text and at least one attached photo or video. Replies require text and can optionally include an attachment.
					</p>
				</div>

				<div className="memberpage-discussions-grid">
					{/* New discussion composer stub */}
					<div className="memberpage-card memberpage-card-composer">
						<h3 className="memberpage-card-title">Start a New Discussion</h3>
						<p className="memberpage-card-text">
							This is a layout placeholder. Posting will be wired to Supabase and Backblaze B2 in a later phase.
						</p>

						<div className="memberpage-composer-fields">
							<div className="memberpage-field">
								<label className="memberpage-label">Topic title</label>
								<input
									type="text"
									className="memberpage-input"
									placeholder="Example: Favorite Gehrig moment or memorabilia story"
									readOnly
								/>
							</div>

							<div className="memberpage-field">
								<label className="memberpage-label">Post text</label>
								<textarea
									className="memberpage-textarea"
									placeholder="Tell the story behind your post..."
									readOnly
								/>
							</div>

							<div className="memberpage-field">
								<label className="memberpage-label">Photo / video attachment</label>
								<div className="memberpage-upload-placeholder">
									Upload will be powered by B2 + Supabase from the members site in a future phase.
								</div>
							</div>
						</div>

						<button className="memberpage-button memberpage-button-disabled" disabled>
							Posting from this page will be enabled later
						</button>
					</div>

					{/* Example discussion thread */}
					<article className="memberpage-card memberpage-thread">
						<header className="memberpage-thread-header">
							<h3 className="memberpage-thread-title">
								Remembering Lou&apos;s &quot;Luckiest Man&quot; Speech
							</h3>
							<div className="memberpage-thread-meta">
								<span>Posted by @GehrigFan42</span>
								<span>•</span>
								<span>2 days ago</span>
							</div>
						</header>

						<div className="memberpage-thread-body">
							<p>
								Where were you when you first saw or heard the &quot;Luckiest Man on the face of the earth&quot; speech?
								Share how it hit you the first time.
							</p>
						</div>

						<div className="memberpage-thread-controls">
							<button type="button" className="memberpage-pill-button">
								👍 Like
							</button>
							<button type="button" className="memberpage-pill-button">
								👎 Dislike
							</button>
							<button type="button" className="memberpage-pill-button memberpage-pill-danger">
								🚩 Report
							</button>
						</div>

						<div className="memberpage-thread-replies">
							<div className="memberpage-reply">
								<div className="memberpage-reply-meta">
									<span>@IronHorse1939</span>
									<span>•</span>
									<span>1 day ago</span>
								</div>
								<p>
									I watched it for the first time with my dad when MLB released the restored footage.
									We both cried. It&apos;s the heart of why this club exists.
								</p>
								<div className="memberpage-reply-controls">
									<button type="button" className="memberpage-pill-button">
										👍
									</button>
									<button type="button" className="memberpage-pill-button memberpage-pill-danger">
										🚩
									</button>
								</div>
							</div>

							<div className="memberpage-reply">
								<div className="memberpage-reply-meta">
									<span>@ALSAdvocate</span>
									<span>•</span>
									<span>18 hours ago</span>
								</div>
								<p>
									I show that speech every year to new volunteers for ALS fundraisers.
									The grace in his voice still floors people who see it for the first time.
								</p>
								<div className="memberpage-reply-controls">
									<button type="button" className="memberpage-pill-button">
										👍
									</button>
									<button type="button" className="memberpage-pill-button memberpage-pill-danger">
										🚩
									</button>
								</div>
							</div>
						</div>
					</article>
				</div>
			</section>

			{/* Archives tiles */}
			<section className="memberpage-section memberpage-archives" style={{ marginBottom: '2.5rem' }}>
				<div className="memberpage-section-header">
					<h2 className="memberpage-section-title">Club Archives</h2>
					<p className="memberpage-subtitle">
						Deep dives into memorabilia, photo history, and the Gehrig library—each backed by tagged media in Backblaze B2.
					</p>
				</div>

				<div className="memberpage-archives-grid">
					<a href="/archives/memorabilia" className="memberpage-archive-tile">
						<h3 className="memberpage-archive-title">Memorabilia Archive</h3>
						<p className="memberpage-archive-text">
							Game-used items, tickets, programs, and vintage pieces submitted by members.
						</p>
						<span className="memberpage-archive-link">Browse memorabilia →</span>
					</a>

					<a href="/archives/photos" className="memberpage-archive-tile">
						<h3 className="memberpage-archive-title">Photo Gallery</h3>
						<p className="memberpage-archive-text">
							Curated photo sets from Gehrig&apos;s career, stadium shots, and fan-submitted images.
						</p>
						<span className="memberpage-archive-link">View photo sets →</span>
					</a>

					<a href="/archives/library" className="memberpage-archive-tile">
						<h3 className="memberpage-archive-title">Library</h3>
						<p className="memberpage-archive-text">
							Books, articles, and research materials about Lou Gehrig, ALS, and baseball history.
						</p>
						<span className="memberpage-archive-link">Enter library →</span>
					</a>
				</div>
			</section>

			{/* Admin tools stub */}
			<section className="memberpage-section memberpage-admin">
				<div className="memberpage-section-header">
					<h2 className="memberpage-section-title">Admin & Moderator Tools</h2>
					<p className="memberpage-subtitle">
						This block will only be visible to admins and moderators once Supabase auth and role checks are wired in.
					</p>
				</div>

				<div className="memberpage-card memberpage-card-admin">
					<h3 className="memberpage-card-title">Admin Dashboard</h3>
					<p className="memberpage-card-text">
						Review reported posts and comments, manage media tagging, and oversee member activity in a unified view.
					</p>
					<a href="/admin" className="memberpage-button">
						Go to Admin Dashboard
					</a>
				</div>
			</section>
		</main>
	);
}
