"use client";

import { useRef } from "react";
import styles from "./FriendsOfFanClub.module.css";

type Friend = {
	id: string;
	name: string;
	logo: string;
};

// Mock data - in production this would come from a partners/friends table
const friends: Friend[] = [
	{ id: "1", name: "ALS Association", logo: "ALS" },
	{ id: "2", name: "Baseball Hall of Fame", logo: "HOF" },
	{ id: "3", name: "Yankees Foundation", logo: "NYY" },
	{ id: "4", name: "Columbia University", logo: "CU" },
	{ id: "5", name: "ALS Research", logo: "ALS-R" },
	{ id: "6", name: "Historic Baseball", logo: "HB" },
];

export default function FriendsOfFanClub() {
	const scrollRef = useRef<HTMLDivElement>(null);

	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<h2 className={styles.heading}>Friends of the Fan Club</h2>
				<div className={styles.scrollContainer} ref={scrollRef}>
					<div className={styles.logoGrid}>
						{friends.map((friend) => (
							<div key={friend.id} className={styles.logoItem}>
								<div className={styles.logoPlaceholder}>
									{friend.logo}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
