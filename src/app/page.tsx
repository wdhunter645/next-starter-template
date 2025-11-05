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
						Celebrating Lou Gehrig & Supporting ALS Research
					</p>
				</div>
			</div>
			{/* Section: Weekly Photo Matchup */}
			<WeeklyMatchup />
			{/* Section: Join/Login CTA */}
			<JoinLogin />
			{/* Section: Social Wall */}
			<SocialWall />
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
