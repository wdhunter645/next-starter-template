import {
	assertEmailEnvOrThrow,
	emailDeliveryUserMessage,
	sendEmailEnvelope,
	type EmailSendResult,
} from './email-envelope';
import { buildAdminJoinNotificationContent, buildWelcomeEmailContent } from './email-templates';

export type MailSendResult = EmailSendResult;
export { assertEmailEnvOrThrow, emailDeliveryUserMessage };

export async function sendWelcomeEmail(opts: {
	env: any;
	toEmail: string;
	toName?: string;
	siteUrl?: string;
	introMd?: string;
	idempotencyKey?: string;
}): Promise<MailSendResult> {
	const siteUrl = (opts.siteUrl || String(opts.env?.NEXT_PUBLIC_SITE_URL || '')).trim();
	const content = buildWelcomeEmailContent({
		toName: opts.toName,
		siteUrl,
		introMd: opts.introMd,
	});

	return sendEmailEnvelope({
		env: opts.env,
		message: {
			to: [{ email: opts.toEmail, name: opts.toName || undefined }],
			subject: content.subject,
			text: content.text,
			html: content.html,
			idempotencyKey: opts.idempotencyKey,
			classification: 'transactional',
		},
	});
}

export async function sendAdminJoinNotification(opts: {
	env: any;
	name: string;
	email: string;
	requestId: string;
	siteUrl?: string;
	idempotencyKey?: string;
}): Promise<MailSendResult> {
	const adminToRaw = String(opts.env?.MAIL_ADMIN_TO || '').trim();
	if (!adminToRaw) {
		return {
			sent: false,
			provider: 'mailchannels',
			error: 'MAIL_ADMIN_TO not configured',
			skipped: true,
			reason: 'skipped',
			attempts: 0,
		};
	}

	const siteUrl = (opts.siteUrl || String(opts.env?.NEXT_PUBLIC_SITE_URL || '')).trim();
	const recipients = adminToRaw
		.split(',')
		.map((s: string) => s.trim())
		.filter(Boolean)
		.map((email: string) => ({ email }));

	const content = buildAdminJoinNotificationContent({
		name: opts.name,
		email: opts.email,
		requestId: opts.requestId,
		siteUrl,
	});

	return sendEmailEnvelope({
		env: opts.env,
		message: {
			to: recipients,
			subject: content.subject,
			text: content.text,
			html: content.html,
			idempotencyKey: opts.idempotencyKey,
			classification: 'admin-internal',
		},
	});
}
