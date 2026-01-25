import Link from "next/link";
import styles from "./NewsTeaser.module.css";
import mockPosts from "../../data/mock-posts.json";

interface Post {
	id: number;
	title: string;
	date: string;
	excerpt: string;
}

export default function NewsTeaser() {
	// Get the two latest posts (sorted by date descending)
	const latestPosts = (mockPosts as Post[])
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 2);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<section className={styles.newsTeaser}>
			<div className={styles.container}>
				<h2 className={styles.sectionTitle}>Latest News &amp; Q&amp;A</h2>
				<div className={styles.grid}>
					{latestPosts.map((post) => (
						<article key={post.id} className={styles.card}>
							<h3 className={styles.cardTitle}>{post.title}</h3>
							<time className={styles.date} dateTime={post.date}>
								{formatDate(post.date)}
							</time>
							<p className={styles.excerpt}>{post.excerpt}</p>
							<Link href="/faq" className={styles.readMore}>
								Read More
							</Link>
						</article>
					))}
				</div>
				<div className={styles.actions}>
					<Link href="/faq" className={styles.visitButton}>
						Visit News &amp; Q&amp;A
					</Link>
				</div>
			</div>
		</section>
	);
}
