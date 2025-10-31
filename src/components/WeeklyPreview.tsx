import Link from "next/link";
import Image from "next/image";
import weeklyData from "../../data/mock-weekly.json";
import "../styles/weekly-preview.css";

export default function WeeklyPreview() {
	return (
		<div className="weekly-preview">
			<div className="weekly-preview-container">
				<h2 className="weekly-preview-title">{weeklyData.title}</h2>
				<div className="weekly-preview-week">{weeklyData.week}, {weeklyData.year}</div>
				
				<div className="weekly-preview-image-wrapper">
					<Image 
						src={weeklyData.matchupImage} 
						alt={weeklyData.title}
						className="weekly-preview-image"
						width={800}
						height={450}
					/>
				</div>
				
				<p className="weekly-preview-caption">{weeklyData.caption}</p>
				
				<div className="weekly-preview-actions">
					<Link href="/weekly" className="weekly-preview-button">
						Vote Now
					</Link>
				</div>
			</div>
		</div>
	);
}
