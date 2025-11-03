"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./EventsCalendar.module.css";

type Event = {
	id: string;
	date: number; // day of month
	title: string;
	month: number;
	year: number;
};

// Mock data - in production this would come from the events table
const events: Event[] = [
	{ id: "1", date: 15, month: 11, year: 2025, title: "ALS Awareness Day" },
	{ id: "2", date: 23, month: 11, year: 2025, title: "Member Meetup" },
	{ id: "3", date: 4, month: 11, year: 2025, title: "Gehrig Birthday Celebration" },
];

export default function EventsCalendar() {
	const [currentMonth] = useState(11); // November
	const [currentYear] = useState(2025);
	
	// Get days in month
	const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
	const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
	
	// Create calendar grid
	const calendarDays: (number | null)[] = [];
	for (let i = 0; i < firstDayOfMonth; i++) {
		calendarDays.push(null);
	}
	for (let i = 1; i <= daysInMonth; i++) {
		calendarDays.push(i);
	}
	
	// Check if a day has an event
	const hasEvent = (day: number | null) => {
		if (!day) return false;
		return events.some(event => event.date === day && event.month === currentMonth);
	};
	
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<h2 className={styles.heading}>Upcoming Events</h2>
				<div className={styles.calendarContainer}>
					<div className={styles.calendarHeader}>
						{monthNames[currentMonth - 1]} {currentYear}
					</div>
					<div className={styles.weekdays}>
						{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
							<div key={day} className={styles.weekday}>
								{day}
							</div>
						))}
					</div>
					<div className={styles.calendarGrid}>
						{calendarDays.map((day, index) => (
							<div
								key={index}
								className={`${styles.calendarCell} ${
									day && hasEvent(day) ? styles.hasEvent : ""
								}`}
							>
								{day || ""}
							</div>
						))}
					</div>
				</div>
				<div className={styles.eventsList}>
					{events.map((event) => (
						<div key={event.id} className={styles.eventItem}>
							<div className={styles.eventDate}>
								{monthNames[event.month - 1]} {event.date}
							</div>
							<div className={styles.eventTitle}>{event.title}</div>
						</div>
					))}
				</div>
				<div className={styles.buttonContainer}>
					<Link href="/calendar" className={styles.button}>
						View Full Calendar
					</Link>
				</div>
			</div>
		</section>
	);
}
