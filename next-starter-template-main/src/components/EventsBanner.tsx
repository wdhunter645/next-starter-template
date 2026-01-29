import Link from "next/link";
import styles from "./EventsBanner.module.css";

// Mock events data - in a real app, this would come from an API or database
const mockEvents = [
	{
		id: 1,
		date: "2025-11-15",
		title: "Annual Fan Meetup",
	},
	{
		id: 2,
		date: "2025-12-01",
		title: "ALS Awareness Walk",
	},
];

// Format date as "Nov 15, 2025"
function formatEventDate(dateString: string): string {
	const [year, month, day] = dateString.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export default function EventsBanner() {
	return (
		<div className={styles.banner}>
			<div className={styles.container}>
				<h2 className={styles.heading}>Upcoming Events</h2>
				<div className={styles.events}>
					{mockEvents.map((event) => (
						<Link
							key={event.id}
							href="/calendar"
							className={styles.eventCard}
						>
							<div className={styles.eventDate}>
								{formatEventDate(event.date)}
							</div>
							<div className={styles.eventTitle}>{event.title}</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
