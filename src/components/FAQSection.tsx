"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";

interface FAQItem {
	q: string;
	a: string;
	approved: boolean;
}

const defaultFaq: FAQItem[] = [
	{
		q: "How do I join the Fan Club?",
		a: "Use the Join link in the menu to create your account via email.",
		approved: true,
	},
	{
		q: "Is the Club a nonprofit?",
		a: "Yes. All proceeds benefit ALS research via partner charities.",
		approved: true,
	},
	{
		q: "Where can I vote in the weekly photo matchup?",
		a: "Here on the homepage while voting is open.",
		approved: true,
	},
	{
		q: "How do I submit memorabilia?",
		a: "Members can post details and photos in the discussion area.",
		approved: true,
	},
	{
		q: "Can I request a specific photo in the matchup?",
		a: "Yes—post your suggestion in the discussion area.",
		approved: true,
	},
	{
		q: "What is the Members Area?",
		a: "A private space for posts, archives, and events.",
		approved: true,
	},
	{
		q: "How do I reset my login?",
		a: "Use the email magic-link flow on the login page.",
		approved: true,
	},
	{
		q: "How can I donate to ALS research?",
		a: "See the Charities page for direct links.",
		approved: true,
	},
	{
		q: "Do you sell merchandise?",
		a: "Yes—see Store for official items.",
		approved: true,
	},
	{
		q: "Can I help moderate?",
		a: "Message an admin in the Members Area.",
		approved: true,
	},
];

const FAQ_KEY = "lgfc_faq_submissions";

export default function FAQSection() {
	const [faqList, setFaqList] = useState<FAQItem[]>(defaultFaq);
	const [searchTerm, setSearchTerm] = useState("");
	const [question, setQuestion] = useState("");
	const [showSuccess, setShowSuccess] = useState(false);

	useEffect(() => {
		// Load FAQ list from localStorage
		const fromLS = localStorage.getItem(FAQ_KEY);
		if (fromLS) {
			try {
				const submissions = JSON.parse(fromLS);
				// Merge submissions with default FAQ
				setFaqList([...submissions, ...defaultFaq]);
			} catch (e) {
				console.error("Failed to parse FAQ submissions", e);
			}
		}
	}, []);

	const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleClear = () => {
		setSearchTerm("");
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const text = question.trim();
		if (!text) return;

		const newSubmission: FAQItem = {
			q: text,
			a: "(Pending answer)",
			approved: false,
		};

		// Store to localStorage
		const fromLS = localStorage.getItem(FAQ_KEY);
		let submissions: FAQItem[] = [];
		if (fromLS) {
			try {
				submissions = JSON.parse(fromLS);
			} catch (e) {
				console.error("Failed to parse FAQ submissions", e);
			}
		}
		submissions.unshift(newSubmission);
		localStorage.setItem(FAQ_KEY, JSON.stringify(submissions));

		// Update state
		setFaqList([...submissions, ...defaultFaq]);
		setQuestion("");
		setShowSuccess(true);
		setTimeout(() => setShowSuccess(false), 3000);
	};

	// Filter FAQ items
	const filteredList = searchTerm
		? faqList.filter(
				(item) =>
					item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(item.a || "").toLowerCase().includes(searchTerm.toLowerCase())
		  )
		: faqList;

	// Only show approved items, top 10
	const approvedList = filteredList
		.filter((x) => x.approved !== false)
		.slice(0, 10);

	return (
		<div>
			<h2>FAQ and Ask a Question</h2>
			<p className="sub">
				Browse top questions, search, or submit a new one. Submissions are held
				for admin approval before appearing.
			</p>
			<div className="faq">
				<div className="search">
					<input
						id="faqSearch"
						type="search"
						placeholder="Search questions..."
						aria-label="Search questions"
						value={searchTerm}
						onChange={handleSearch}
					/>
					<button id="faqClear" onClick={handleClear}>
						Clear
					</button>
				</div>
				<div id="faqList">
					{approvedList.length === 0 ? (
						<p className="sub">No questions yet.</p>
					) : (
						approvedList.map((item, idx) => (
							<div key={idx} className="q">
								<strong>{item.q}</strong>
								<br />
								<span className="sub">{item.a}</span>
							</div>
						))
					)}
				</div>
				<form id="faqForm" aria-label="Submit a question" onSubmit={handleSubmit}>
					<label htmlFor="qtext">
						<strong>Ask a question</strong>
					</label>
					<textarea
						id="qtext"
						placeholder="Type your question..."
						value={question}
						onChange={(e) => setQuestion(e.target.value)}
					></textarea>
					<button type="submit">Submit</button>
					{showSuccess && (
						<div id="qsuccess" className="success">
							Thanks! Your question was received and queued for review.
						</div>
					)}
				</form>
			</div>
		</div>
	);
}
