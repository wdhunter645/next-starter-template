"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../styles/weekly.css";

// Cookie helpers
function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
	return null;
}

function setCookie(name: string, value: string, maxAge: number) {
	if (typeof document === "undefined") return;
	document.cookie = `${name}=${value}; max-age=${maxAge}; path=/`;
}

export default function WeeklyMatchup() {
	const [hasVoted, setHasVoted] = useState(false);

	useEffect(() => {
		// Check if user has voted
		const voted = getCookie("lgfc_voted_weekly");
		if (voted === "true") {
			setHasVoted(true);
		}
	}, []);

	const handleVote = () => {
		// Set cookie for 7 days (7 * 24 * 60 * 60 = 604800 seconds)
		setCookie("lgfc_voted_weekly", "true", 604800);
		setHasVoted(true);
	};

	return (
		<section
			className="container"
			role="region"
			aria-label="Weekly Photo Matchup"
		>
			<h2 className="title-lgfc">Weekly Photo Matchup. Vote for your favorite!</h2>
			<div className="matchup">
				<article className="tile">
					<img
						src="https://placehold.co/800x600/jpg?text=Photo+A"
						alt="Photo A of Lou Gehrig"
					/>
					<div className="cap">
						<strong>Photo A:</strong> On-deck focus, Yankee Stadium.
					</div>
					<div className="vote-row">
						<button
							className="btn primary"
							type="button"
							aria-label="Vote Photo A"
							id="voteA"
							onClick={handleVote}
						>
							Vote A
						</button>
					</div>
				</article>
				<article className="tile">
					<img
						src="https://placehold.co/800x600/jpg?text=Photo+B"
						alt="Photo B of Lou Gehrig"
					/>
					<div className="cap">
						<strong>Photo B:</strong> Classic swing, late afternoon.
					</div>
					<div className="vote-row">
						<button
							className="btn primary"
							type="button"
							aria-label="Vote Photo B"
							id="voteB"
							onClick={handleVote}
						>
							Vote B
						</button>
					</div>
				</article>
			</div>

			{/* Current Voting placeholder/link (below the vote buttons on left) */}
			<div className="current-voting" id="currentVotingWrap">
				{hasVoted ? (
					<Link href="/weekly/current">Current Voting</Link>
				) : (
					<span id="currentVotingText">Current Voting</span>
				)}
			</div>
		</section>
	);
}
