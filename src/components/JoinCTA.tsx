import Link from "next/link";

export default function JoinCTA() {
	return (
		<section className="joinBanner section-gap">
			<div className="container">
				<p style={{ margin: "0 0 16px" }}>
					Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more.
				</p>
				<div style={{ display: "flex", gap: "12px" }}>
					<Link 
						href="/join" 
						style={{
							background: "#fff",
							color: "#0033cc",
							padding: "10px 20px",
							borderRadius: "8px",
							fontWeight: "700",
							textDecoration: "none"
						}}
					>
						Join
					</Link>
					<Link 
						href="/member" 
						style={{
							background: "transparent",
							color: "#fff",
							padding: "10px 20px",
							borderRadius: "8px",
							fontWeight: "700",
							border: "2px solid #fff",
							textDecoration: "none"
						}}
					>
						Login
					</Link>
				</div>
			</div>
		</section>
	);
}
