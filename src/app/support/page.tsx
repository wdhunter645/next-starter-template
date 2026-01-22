'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateInternalPath } from '@/lib/urlUtils';

function SupportForm() {
const router = useRouter();
const searchParams = useSearchParams();
const fromParam = searchParams.get('from');
const validatedFrom = validateInternalPath(fromParam, '/');

const [email, setEmail] = useState('');
const [subjectDetail, setSubjectDetail] = useState('');
const [message, setMessage] = useState('');
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
const [error, setError] = useState('');

useEffect(() => {
if (typeof window !== 'undefined') {
const memberEmail = window.localStorage.getItem('lgfc_member_email');
if (memberEmail && memberEmail.includes('@')) {
setEmail(memberEmail);
setIsLoggedIn(true);
}
}
}, []);

const handleCancel = () => {
router.push(validatedFrom);
};

const handleReturn = () => {
router.push(validatedFrom);
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError('');

if (!email || !email.includes('@')) {
setError('Please enter a valid email address.');
return;
}

if (!message.trim()) {
setError('Please enter a message.');
return;
}

setIsSubmitting(true);

try {
const response = await fetch('/api/support', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
email,
subjectDetail: subjectDetail.trim() || undefined,
message: message.trim(),
sourcePage: validatedFrom,
}),
});

const data = await response.json();

if (response.ok && data.ok) {
setShowSuccess(true);
} else {
setError(data.error || 'Failed to send support request. Please try again.');
}
} catch {
setError('Network error. Please try again.');
} finally {
setIsSubmitting(false);
}
};

if (showSuccess) {
return (
<main style={styles.main}>
<div style={styles.successContainer}>
<h1 style={styles.h1}>Support Request Sent</h1>
<p style={styles.lead}>
Thank you for contacting us. We have received your message and will respond as soon as possible.
</p>
<button onClick={handleReturn} style={styles.returnButton}>
Return to Previous Page
</button>
</div>
</main>
);
}

return (
<main style={styles.main}>
<h1 style={styles.h1}>Support</h1>
<p style={styles.lead}>
Need help or have questions? Send us a message and we will get back to you.
</p>

<form onSubmit={handleSubmit} style={styles.form}>
{error && (
<div style={styles.error} role="alert">
{error}
</div>
)}

{!isLoggedIn ? (
<div style={styles.formGroup}>
<label htmlFor="email" style={styles.label}>
Email <span style={styles.required}>*</span>
</label>
<input
type="email"
id="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
style={styles.input}
placeholder="your.email@example.com"
disabled={isSubmitting}
/>
</div>
) : (
<input type="hidden" value={email} />
)}

<div style={styles.formGroup}>
<label htmlFor="subjectDetail" style={styles.label}>
Subject Detail <span style={styles.optional}>(optional)</span>
</label>
<input
type="text"
id="subjectDetail"
value={subjectDetail}
onChange={(e) => setSubjectDetail(e.target.value)}
style={styles.input}
placeholder="Brief description of your inquiry"
disabled={isSubmitting}
/>
</div>

<div style={styles.formGroup}>
<label htmlFor="message" style={styles.label}>
Message <span style={styles.required}>*</span>
</label>
<textarea
id="message"
value={message}
onChange={(e) => setMessage(e.target.value)}
required
rows={8}
style={Object.assign({}, styles.input, styles.textarea)}
placeholder="Please describe your question or issue..."
disabled={isSubmitting}
/>
</div>

<div style={styles.buttonGroup}>
<button
type="submit"
disabled={isSubmitting}
style={Object.assign({}, styles.button, styles.submitButton, isSubmitting ? styles.buttonDisabled : {})}
>
{isSubmitting ? 'Sending...' : 'Send'}
</button>
<button
type="button"
onClick={handleCancel}
disabled={isSubmitting}
style={Object.assign({}, styles.button, styles.cancelButton, isSubmitting ? styles.buttonDisabled : {})}
>
Cancel
</button>
</div>
</form>
</main>
);
}

export default function SupportPage() {
return (
<Suspense fallback={<div style={styles.main}>Loading...</div>}>
<SupportForm />
</Suspense>
);
}

const styles: Record<string, React.CSSProperties> = {
main: { padding: '60px 16px 40px 16px', maxWidth: 700, margin: '0 auto' },
h1: { fontSize: 34, lineHeight: 1.15, margin: '0 0 12px 0', fontWeight: 600 },
lead: { fontSize: 18, lineHeight: 1.6, margin: '0 0 32px 0', color: '#555' },
form: { width: '100%' },
formGroup: { marginBottom: 24 },
label: { display: 'block', fontSize: 16, fontWeight: 500, marginBottom: 8, color: '#333' },
required: { color: '#d00' },
optional: { color: '#888', fontWeight: 400, fontSize: 14 },
input: { width: '100%', padding: '12px 16px', fontSize: 16, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' as const, fontFamily: 'inherit' },
textarea: { resize: 'vertical' as const, minHeight: 120 },
buttonGroup: { display: 'flex', gap: 12, marginTop: 32 },
button: { padding: '12px 32px', fontSize: 16, fontWeight: 500, border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' },
submitButton: { backgroundColor: 'var(--lgfc-blue, #0033cc)', color: '#fff' },
cancelButton: { backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ccc' },
buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
error: { padding: '12px 16px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, marginBottom: 24, fontSize: 15 },
successContainer: { textAlign: 'center' as const, paddingTop: 40 },
returnButton: { marginTop: 32, padding: '12px 32px', fontSize: 16, fontWeight: 500, backgroundColor: 'var(--lgfc-blue, #0033cc)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' },
};
