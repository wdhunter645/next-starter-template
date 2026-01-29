// Cloudflare Pages Function for POST /api/support
// Sends support request email via MailChannels
// Uses authorized sender model (From: support@lougehrigfanclub.com, Reply-To: requester)

type MailChannelsAddress = { email: string; name?: string };

function parseFrom(from: string): MailChannelsAddress {
	// Supports: "Name <email@domain>" or "email@domain"
	const m = from.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
	if (m) return { name: m[1] || undefined, email: m[2] };
	return { email: from.trim() };
}

type MailSendResult = { sent: boolean; provider: string; statusCode?: number; error?: string };

async function sendSupportEmail(opts: {
	env: any;
	requesterEmail: string;
	subjectDetail?: string;
	message: string;
	sourcePage: string;
	timestamp: string;
}): Promise<MailSendResult> {
	const enabled = String(opts.env?.MAILCHANNELS_ENABLED || '0') === '1';
	if (!enabled) {
		return { sent: false, provider: 'disabled' };
	}

	const apiKey = String(opts.env?.MAILCHANNELS_API_KEY || '').trim();
	if (!apiKey) {
		return { sent: false, provider: 'mailchannels', error: 'Missing MAILCHANNELS_API_KEY' };
	}

	const fromRaw = String(opts.env?.MAIL_FROM || '').trim();
	if (!fromRaw) {
		return { sent: false, provider: 'mailchannels', error: 'MAIL_FROM not configured' };
	}

	// Locked envelope
	const from = parseFrom(fromRaw);
	const to: MailChannelsAddress = { email: 'lougehrigfanclub@gmail.com' };
	const replyTo: MailChannelsAddress = { email: opts.requesterEmail };

	// Subject format: SUPPORT - <email> [- subject detail]
	const subject = opts.subjectDetail
		? `SUPPORT - ${opts.requesterEmail} - ${opts.subjectDetail}`
		: `SUPPORT - ${opts.requesterEmail}`;

	// Body includes all required fields
	const text = `Support Request

From: ${opts.requesterEmail}
Source Page: ${opts.sourcePage}
Timestamp: ${opts.timestamp}

Message:
${opts.message}`;

	const html = `<h3>Support Request</h3>
<ul>
<li><strong>From:</strong> ${escapeHtml(opts.requesterEmail)}</li>
<li><strong>Source Page:</strong> ${escapeHtml(opts.sourcePage)}</li>
<li><strong>Timestamp:</strong> ${escapeHtml(opts.timestamp)}</li>
</ul>
<h4>Message:</h4>
<p>${escapeHtml(opts.message).replace(/\n/g, '<br/>')}</p>`;

	const payload: any = {
		personalizations: [{ to: [to] }],
		from,
		reply_to: replyTo,
		subject,
		content: [
			{ type: 'text/plain', value: text },
			{ type: 'text/html', value: html },
		],
	};

	try {
		const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': apiKey,
			},
			body: JSON.stringify(payload),
		});

		const status = res.status;
		const body = await res.text();
		const truncatedBody = body.slice(0, 2048);

		if (status === 202) {
			return { sent: true, provider: 'mailchannels', statusCode: status };
		}

		const errorMsg = `MailChannels status ${status}: ${truncatedBody}`.slice(0, 600);
		return { sent: false, provider: 'mailchannels', statusCode: status, error: errorMsg };
	} catch (e: any) {
		const errorMsg = String(e?.message || e);
		return { sent: false, provider: 'mailchannels', error: errorMsg };
	}
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function jsonResponse(data: any, status = 200): Response {
	return new Response(JSON.stringify(data, null, 2), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function onRequestPost(context: { env: any; request: Request }): Promise<Response> {
	const { request, env } = context;

	try {
		const body = await request.json();

		const email = String(body?.email || '').trim().toLowerCase();
		const subjectDetail = body?.subjectDetail ? String(body.subjectDetail).trim() : undefined;
		const message = String(body?.message || '').trim();
		const sourcePage = String(body?.sourcePage || '/').trim();

		// Validation
		if (!email || !email.includes('@')) {
			return jsonResponse(
				{ ok: false, error: 'Valid email is required.' },
				400
			);
		}

		if (!message) {
			return jsonResponse(
				{ ok: false, error: 'Message is required.' },
				400
			);
		}

		const timestamp = new Date().toISOString();

		// Send email
		const result = await sendSupportEmail({
			env,
			requesterEmail: email,
			subjectDetail,
			message,
			sourcePage,
			timestamp,
		});

		if (result.sent) {
			return jsonResponse({ ok: true, sent: true }, 200);
		} else {
			return jsonResponse(
				{
					ok: false,
					error: 'Failed to send support request.',
					detail: result.error || 'Unknown error',
					provider: result.provider,
				},
				500
			);
		}
	} catch (err: any) {
		return jsonResponse(
			{ ok: false, error: 'Server error', detail: String(err?.message || err) },
			500
		);
	}
}
