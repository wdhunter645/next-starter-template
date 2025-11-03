import Link from "next/link";
import styles from "./MemberPostsPreview.module.css";

type Post = {
	id: string;
	title: string;
	excerpt: string;
	image: string;
	kind: "news" | "qna";
};

// Mock data - in production this would come from the posts table
const posts: Post[] = [
	{
		id: "1",
		title: "Gehrig's Record-Breaking Streak",
		excerpt: "Exploring the incredible 2,130 consecutive games played by the Iron Horse...",
		image: "/placeholder-post.jpg",
		kind: "news",
	},
	{
		id: "2",
		title: "What Made Gehrig Great?",
		excerpt: "Community members discuss the qualities that made Lou Gehrig a legend...",
		image: "/placeholder-post.jpg",
		kind: "qna",
	},
	{
		id: "3",
		title: "New ALS Research Update",
		excerpt: "Latest developments in ALS research funded by the Lou Gehrig community...",
		image: "/placeholder-post.jpg",
		kind: "news",
	},
];

export default function MemberPostsPreview() {
	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<h2 className={styles.heading}>From Our Members</h2>
				<div className={styles.grid}>
					{posts.map((post) => (
						<article key={post.id} className={styles.card}>
							<div className={styles.imageContainer}>
								<div className={styles.imagePlaceholder}>
									{post.kind === "news" ? "News" : "Q&A"}
								</div>
							</div>
							<div className={styles.content}>
								<h3 className={styles.title}>{post.title}</h3>
								<p className={styles.excerpt}>{post.excerpt}</p>
								<Link href={`/posts/${post.id}`} className={styles.link}>
									Read More →
								</Link>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
