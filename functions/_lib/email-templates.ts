/**
 * Accessible text/HTML email templates for launch-required events.
 * Welcome default copy is unchanged pending #2919 Product classification disposition.
 */

function escapeHtml(s: string): string {
	return String(s || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

export function mdToPlain(md: string): string {
	return String(md || '')
		.replace(/^#+\s+/gm, '')
		.replace(/\*\*(.*?)\*\*/g, '$1')
		.replace(/\*(.*?)\*/g, '$1')
		.replace(/`([^`]*)`/g, '$1')
		.trim();
}

export function mdToBasicHtml(md: string): string {
	const plain = mdToPlain(md);
	const parts = plain
		.split(/\n\s*\n/g)
		.map((s) => s.trim())
		.filter(Boolean);
	return parts.map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`).join('\n');
}

export function buildWelcomeEmailContent(opts: {
	toName?: string;
	siteUrl?: string;
	introMd?: string;
}): { subject: string; text: string; html: string } {
	const subject = 'Welcome to the Lou Gehrig Fan Club';
	const siteUrl = String(opts.siteUrl || '').trim();
	const introMd = String(opts.introMd || '').trim();

	const defaultIntroText = `Thanks for joining the Lou Gehrig Fan Club mailing list.

You’ll get periodic updates about new content, milestones, events, and ways to support ALS charities.

If you ever want to stop receiving messages, reply to this email and we’ll remove you.`;
	const introText = introMd ? mdToPlain(introMd) : defaultIntroText;

	const text = `Hi${opts.toName ? ` ${opts.toName}` : ''},

${introText}

${siteUrl ? `Visit: ${siteUrl}\n` : ''}— Lou Gehrig Fan Club`;

	const defaultIntroHtml = `<p>Thanks for joining the <strong>Lou Gehrig Fan Club</strong> mailing list.</p>
<p>You’ll get periodic updates about new content, milestones, events, and ways to support ALS charities.</p>
<p>If you ever want to stop receiving messages, reply to this email and we’ll remove you.</p>`;
	const introHtml = introMd ? mdToBasicHtml(introMd) : defaultIntroHtml;

	const html = `<p>Hi${opts.toName ? ` ${escapeHtml(opts.toName)}` : ''},</p>
${introHtml}
${siteUrl ? `<p>Visit: <a href="${escapeHtml(siteUrl)}">${escapeHtml(siteUrl)}</a></p>` : ''}
<p>— Lou Gehrig Fan Club</p>`;

	return { subject, text, html };
}

export function buildAdminJoinNotificationContent(opts: {
	name: string;
	email: string;
	requestId: string;
	siteUrl?: string;
	whenIso?: string;
}): { subject: string; text: string; html: string } {
	const subject = 'LGFC Lite – New Join Request';
	const when = opts.whenIso || new Date().toISOString();
	const siteUrl = String(opts.siteUrl || '').trim();

	const text = `New join request

Name: ${opts.name}
Email: ${opts.email}
When (UTC): ${when}
Request ID: ${opts.requestId}
${siteUrl ? `Site: ${siteUrl}` : ''}`;

	const html = `<h3>New join request</h3>
<ul>
<li><strong>Name:</strong> ${escapeHtml(opts.name)}</li>
<li><strong>Email:</strong> ${escapeHtml(opts.email)}</li>
<li><strong>When (UTC):</strong> ${escapeHtml(when)}</li>
<li><strong>Request ID:</strong> ${escapeHtml(opts.requestId)}</li>
${siteUrl ? `<li><strong>Site:</strong> <a href="${escapeHtml(siteUrl)}">${escapeHtml(siteUrl)}</a></li>` : ''}
</ul>`;

	return { subject, text, html };
}
