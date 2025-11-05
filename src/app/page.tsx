import Link from "next/link";
import styles from "./page.module.css";
import MilestoneTeaser from "@/components/MilestoneTeaser";
import WeeklyMatchup from "@/components/WeeklyMatchup";
import JoinLogin from "@/components/JoinLogin";
import SocialWall from "@/components/SocialWall";
import MemberPostsPreview from "@/components/MemberPostsPreview";
import FriendsOfFanClub from "@/components/FriendsOfFanClub";
import EventsCalendar from "@/components/EventsCalendar";

export default function Home() {
	return (
		<>
			{/* Section: Hero Banner */}
			<div className={styles.hero}>
				<div className={styles.container}>
					<h1 className={styles.title}>Lou Gehrig Fan Club</h1>
					<p className={styles.subtitle}>
						Honoring the legacy of baseball&apos;s Iron Horse through community, education, and support for ALS research.
					</p>
					<div className={styles.actions}>
						<Link href="/member/join" className={styles.primaryButton}>
							Join the Club
						</Link>
					</div>
				</div>
			</div>
			{/* Section: Weekly Photo Matchup */}
			<WeeklyMatchup />
			{/* Section: Social Wall */}
			<SocialWall />
			{/* Section: Join/Login CTA */}
			<JoinLogin />
			{/* Section: Member Posts Preview */}
			<MemberPostsPreview />
			{/* Section: Milestone Highlight */}
			<MilestoneTeaser />
			{/* Section: Friends of the Fan Club */}
			<FriendsOfFanClub />
			{/* Section: Events Calendar */}
			<EventsCalendar />
			{/* Section: Footer (handled by layout) */}
		</>
	);
}
