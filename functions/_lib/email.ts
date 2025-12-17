type MailChannelsAddress = { email: string; name?: string };

function parseFrom(from: string): MailChannelsAddress {
	// Supports: "Name <email@domain>" or "email@domain"
	const m = from.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
	if (m) return { name: m[1] || undefined, email: m[2] };
	return { email: from.trim() };
}

export async function sendWelcomeEmail(opts: {
	env: any;
	toEmail: string;
	toName?: string;
	siteUrl?: string;
}): Promise<{ sent: boolean; provider?: string; error?: string }> {
	const enabled = String(opts.env?.MAILCHANNELS_ENABLED || '0') === '1';
	if (!enabled) return { sent: false, provider: 'disabled' };

	const apiKey = String(opts.env?.MAILCHANNELS_API_KEY || '').trim();
	if (!apiKey) return { sent: false, provider: 'mailchannels', error: 'Missing MAILCHANNELS_API_KEY' };

	const fromRaw = String(opts.env?.MAIL_FROM || '').trim();
	if (!fromRaw) return { sent: false, provider: 'mailchannels', error: 'MAIL_FROM not configured' };

	const replyTo = String(opts.env?.MAIL_REPLY_TO || '').trim();
	const siteUrl = (opts.siteUrl || String(opts.env?.NEXT_PUBLIC_SITE_URL || '')).trim();

	const from = parseFrom(fromRaw);
	const to: MailChannelsAddress = { email: opts.toEmail, name: opts.toName || undefined };

	const subject = 'Welcome to the Lou Gehrig Fan Club';
	const joinUrl = siteUrl ? `${siteUrl.replace(/\/$/, '')}/join` : '';
	const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.4">
      <h2>Welcome${opts.toName ? `, ${opts.toName}` : ''}.</h2>
      <p>Thanks for joining the Lou Gehrig Fan Club mailing list.</p>
      <p>You'll get updates on new posts, events, and additions to the Library and Photo Archive.</p>
      ${joinUrl ? `<p>Bookmark the Join page: <a href="${joinUrl}">${joinUrl}</a></p>` : ''}
      <p style="margin-top: 24px">— Lou Gehrig Fan Club</p>
    </div>
  `.trim();

	const text = `Welcome${opts.toName ? `, ${opts.toName}` : ''}.

Thanks for joining the Lou Gehrig Fan Club mailing list.

— Lou Gehrig Fan Club`;

	const payload: any = {
		personalizations: [{ to: [to] }],
		from,
		subject,
		content: [
			{ type: 'text/plain', value: text },
			{ type: 'text/html', value: html },
		],
	};

	if (replyTo) payload.reply_to = parseFrom(replyTo);

	try {
		const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': apiKey,
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const body = await res.text().catch(() => '');
			return { sent: false, provider: 'mailchannels', error: `MailChannels error ${res.status}: ${body}`.slice(0, 600) };
		}

		return { sent: true, provider: 'mailchannels' };
	} catch (e: any) {
		return { sent: false, provider: 'mailchannels', error: String(e?.message || e) };
	}
}
