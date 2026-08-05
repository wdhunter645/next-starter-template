/**
 * Provider-neutral transactional email envelope.
 * MailChannels is one adapter; disabled/missing/rejection/timeout/rate-limit are first-class outcomes.
 * Never claims delivery unless the provider accepted the send.
 */

export type EmailAddress = { email: string; name?: string };

export type EmailSendResult = {
	sent: boolean;
	provider: string;
	statusCode?: number;
	error?: string;
	skipped?: boolean;
	reason?:
		| 'disabled'
		| 'missing_api_key'
		| 'missing_from'
		| 'missing_recipients'
		| 'rate_limited'
		| 'duplicate'
		| 'timeout'
		| 'rejected'
		| 'network_error'
		| 'skipped';
	attempts?: number;
};

export type EmailMessage = {
	to: EmailAddress[];
	subject: string;
	text: string;
	html: string;
	replyTo?: EmailAddress;
	/** Optional idempotency key for duplicate suppression within the Worker isolate. */
	idempotencyKey?: string;
	classification?: 'transactional' | 'admin-internal' | 'optional-marketing';
};

export type SendTransport = (input: {
	env: any;
	message: EmailMessage;
	from: EmailAddress;
	apiKey: string;
	timeoutMs: number;
}) => Promise<{ statusCode: number; bodyText: string }>;

const recentIdempotency = new Map<string, number>();
const recentSendTimestamps: number[] = [];

function parseFrom(from: string): EmailAddress {
	const m = from.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
	if (m) return { name: m[1] || undefined, email: m[2] };
	return { email: from.trim() };
}

export function isEmailEnabled(env: any): boolean {
	return String(env?.MAILCHANNELS_ENABLED || '0') === '1';
}

export function assertEmailEnvOrThrow(env: any): void {
	if (!isEmailEnabled(env)) return;
	const apiKey = String(env?.MAILCHANNELS_API_KEY || '').trim();
	const fromRaw = String(env?.MAIL_FROM || '').trim();
	if (!apiKey) throw new Error('Missing required env var: MAILCHANNELS_API_KEY');
	if (!fromRaw) throw new Error('Missing required env var: MAIL_FROM');
}

function rateLimitMax(env: any): number {
	const n = Number(env?.MAIL_RATE_LIMIT_PER_MINUTE || 0);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function retryMax(env: any): number {
	const n = Number(env?.MAIL_RETRY_MAX || 0);
	return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 2) : 0;
}

function timeoutMs(env: any): number {
	const n = Number(env?.MAIL_TIMEOUT_MS || 8000);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : 8000;
}

function pruneIdempotency(now: number) {
	for (const [k, ts] of recentIdempotency) {
		if (now - ts > 60_000) recentIdempotency.delete(k);
	}
}

function checkRateLimit(env: any, now: number): boolean {
	const max = rateLimitMax(env);
	if (max <= 0) return true;
	while (recentSendTimestamps.length && now - recentSendTimestamps[0] > 60_000) {
		recentSendTimestamps.shift();
	}
	return recentSendTimestamps.length < max;
}

/** Test helper: clear isolate-local suppression state. */
export function __resetEmailEnvelopeStateForTests() {
	recentIdempotency.clear();
	recentSendTimestamps.length = 0;
}

export async function mailchannelsTransport(input: {
	env: any;
	message: EmailMessage;
	from: EmailAddress;
	apiKey: string;
	timeoutMs: number;
}): Promise<{ statusCode: number; bodyText: string }> {
	const payload: any = {
		personalizations: [{ to: input.message.to }],
		from: input.from,
		subject: input.message.subject,
		content: [
			{ type: 'text/plain', value: input.message.text },
			{ type: 'text/html', value: input.message.html },
		],
	};
	if (input.message.replyTo) payload.reply_to = input.message.replyTo;

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), input.timeoutMs);
	try {
		const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': input.apiKey,
			},
			body: JSON.stringify(payload),
			signal: controller.signal,
		});
		const bodyText = (await res.text()).slice(0, 2048);
		return { statusCode: res.status, bodyText };
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Send through the provider-neutral envelope.
 * Marketing classification is accepted only when callers pass it; this envelope does not invent Product consent gates.
 */
export async function sendEmailEnvelope(opts: {
	env: any;
	message: EmailMessage;
	transport?: SendTransport;
}): Promise<EmailSendResult> {
	const env = opts.env;
	const message = opts.message;
	const transport = opts.transport || mailchannelsTransport;
	const now = Date.now();

	if (message.classification === 'optional-marketing') {
		// Standing rule: optional marketing must stay consent-gated by Product-approved controls.
		// Until #2919 disposition lands, refuse marketing classification at the envelope.
		return {
			sent: false,
			provider: 'envelope',
			skipped: true,
			reason: 'skipped',
			error: 'optional-marketing sends are blocked until Product consent disposition (#2919) is accepted',
			attempts: 0,
		};
	}

	if (!isEmailEnabled(env)) {
		return { sent: false, provider: 'disabled', reason: 'disabled', attempts: 0 };
	}

	const apiKey = String(env?.MAILCHANNELS_API_KEY || '').trim();
	if (!apiKey) {
		return {
			sent: false,
			provider: 'mailchannels',
			reason: 'missing_api_key',
			error: 'Missing MAILCHANNELS_API_KEY',
			attempts: 0,
		};
	}

	const fromRaw = String(env?.MAIL_FROM || '').trim();
	if (!fromRaw) {
		return {
			sent: false,
			provider: 'mailchannels',
			reason: 'missing_from',
			error: 'MAIL_FROM not configured',
			attempts: 0,
		};
	}

	if (!message.to?.length) {
		return {
			sent: false,
			provider: 'mailchannels',
			reason: 'missing_recipients',
			error: 'No recipients',
			skipped: true,
			attempts: 0,
		};
	}

	pruneIdempotency(now);
	if (message.idempotencyKey) {
		if (recentIdempotency.has(message.idempotencyKey)) {
			return {
				sent: false,
				provider: 'envelope',
				reason: 'duplicate',
				skipped: true,
				error: 'Duplicate idempotency key suppressed',
				attempts: 0,
			};
		}
	}

	if (!checkRateLimit(env, now)) {
		return {
			sent: false,
			provider: 'envelope',
			reason: 'rate_limited',
			error: 'MAIL_RATE_LIMIT_PER_MINUTE exceeded',
			attempts: 0,
		};
	}

	const from = parseFrom(fromRaw);
	const replyToRaw = String(env?.MAIL_REPLY_TO || '').trim();
	const msg: EmailMessage = {
		...message,
		replyTo: message.replyTo || (replyToRaw ? parseFrom(replyToRaw) : undefined),
	};

	const maxAttempts = 1 + retryMax(env);
	const tmo = timeoutMs(env);
	let lastError = '';
	let lastStatus: number | undefined;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			const result = await transport({ env, message: msg, from, apiKey, timeoutMs: tmo });
			lastStatus = result.statusCode;
			if (result.statusCode === 202) {
				recentSendTimestamps.push(Date.now());
				if (message.idempotencyKey) recentIdempotency.set(message.idempotencyKey, Date.now());
				return {
					sent: true,
					provider: 'mailchannels',
					statusCode: 202,
					attempts: attempt,
				};
			}
			lastError = `MailChannels status ${result.statusCode}: ${result.bodyText}`.slice(0, 600);
			// Do not retry hard provider rejections (4xx except 429).
			if (result.statusCode >= 400 && result.statusCode < 500 && result.statusCode !== 429) {
				return {
					sent: false,
					provider: 'mailchannels',
					statusCode: result.statusCode,
					reason: 'rejected',
					error: lastError,
					attempts: attempt,
				};
			}
		} catch (e: any) {
			const name = String(e?.name || '');
			const msgText = String(e?.message || e);
			if (name === 'AbortError' || /aborted|timeout/i.test(msgText)) {
				lastError = msgText;
				if (attempt >= maxAttempts) {
					return {
						sent: false,
						provider: 'mailchannels',
						reason: 'timeout',
						error: lastError.slice(0, 600),
						attempts: attempt,
					};
				}
				continue;
			}
			lastError = msgText;
			if (attempt >= maxAttempts) {
				return {
					sent: false,
					provider: 'mailchannels',
					reason: 'network_error',
					error: lastError.slice(0, 600),
					attempts: attempt,
				};
			}
		}
	}

	return {
		sent: false,
		provider: 'mailchannels',
		statusCode: lastStatus,
		reason: 'rejected',
		error: lastError.slice(0, 600),
		attempts: maxAttempts,
	};
}

/** Human-readable delivery note for API/UI — never claims sent when sent!==true. */
export function emailDeliveryUserMessage(result: EmailSendResult | null | undefined): string | null {
	if (!result) return null;
	if (result.sent) return 'A confirmation email was accepted for delivery.';
	if (result.reason === 'disabled' || result.provider === 'disabled') {
		return 'Your request was saved. Email delivery is currently disabled; no email was sent.';
	}
	if (result.skipped || result.reason === 'skipped' || result.reason === 'duplicate') {
		return 'Your request was saved. No email was sent for this step.';
	}
	return 'Your request was saved, but the confirmation email could not be sent. An administrator can follow up manually.';
}
