import Link from "next/link";
import "../styles/weekly.css";

export default function WeeklyMatchup() {
	return (
		<div className="matchup">
			<h2 className="matchup-heading">Vote for your favorite picture</h2>
			
			<div className="matchup-grid">
				{/* Photo 1 */}
				<div className="matchup-tile">
					<div className="matchup-image-placeholder">
						Photo A
					</div>
					<h3 className="matchup-title">Yankees vs Red Sox (1936)</h3>
					<button 
						className="matchup-button" 
						disabled 
						aria-disabled="true"
					>
						Vote
					</button>
				</div>

				{/* Photo 2 */}
				<div className="matchup-tile">
					<div className="matchup-image-placeholder">
						Photo B
					</div>
					<h3 className="matchup-title">Gehrig at bat (1934)</h3>
					<button 
						className="matchup-button" 
						disabled 
						aria-disabled="true"
					>
						Vote
					</button>
				</div>
			</div>

			{/* Visually hidden results link */}
			<Link href="/weekly/results" className="visually-hidden">
				See results
			</Link>
		</div>
	);
}
