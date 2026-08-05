import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	__resetEmailEnvelopeStateForTests,
	assertEmailEnvOrThrow,
	emailDeliveryUserMessage,
	sendEmailEnvelope,
	type SendTransport,
} from '../../functions/_lib/email-envelope';
import { buildWelcomeEmailContent } from '../../functions/_lib/email-templates';

beforeEach(() => {
	__resetEmailEnvelopeStateForTests();
});

describe('email envelope delivery controls', () => {
	it('returns disabled without calling transport', async () => {
		const transport = vi.fn(async () => ({ statusCode: 202, bodyText: 'ok' })) as SendTransport;
		const result = await sendEmailEnvelope({
			env: { MAILCHANNELS_ENABLED: '0' },
			message: {
				to: [{ email: 'a@example.com' }],
				subject: 't',
				text: 't',
				html: '<p>t</p>',
				classification: 'transactional',
			},
			transport,
		});
		expect(result).toMatchObject({ sent: false, provider: 'disabled', reason: 'disabled' });
		expect(transport).not.toHaveBeenCalled();
		expect(emailDeliveryUserMessage(result)).toMatch(/disabled/i);
	});

	it('returns missing_api_key when enabled without key', async () => {
		const result = await sendEmailEnvelope({
			env: { MAILCHANNELS_ENABLED: '1', MAIL_FROM: 'LGFC <noreply@example.com>' },
			message: {
				to: [{ email: 'a@example.com' }],
				subject: 't',
				text: 't',
				html: '<p>t</p>',
			},
		});
		expect(result.reason).toBe('missing_api_key');
		expect(result.sent).toBe(false);
	});

	it('returns missing_from when enabled without MAIL_FROM', async () => {
		const result = await sendEmailEnvelope({
			env: { MAILCHANNELS_ENABLED: '1', MAILCHANNELS_API_KEY: 'k' },
			message: {
				to: [{ email: 'a@example.com' }],
				subject: 't',
				text: 't',
				html: '<p>t</p>',
			},
		});
		expect(result.reason).toBe('missing_from');
		expect(result.sent).toBe(false);
	});

	it('assertEmailEnvOrThrow fails closed when enabled and incomplete', () => {
		expect(() => assertEmailEnvOrThrow({ MAILCHANNELS_ENABLED: '1' })).toThrow(/MAILCHANNELS_API_KEY/);
		expect(() =>
			assertEmailEnvOrThrow({ MAILCHANNELS_ENABLED: '1', MAILCHANNELS_API_KEY: 'k' }),
		).toThrow(/MAIL_FROM/);
		expect(() =>
			assertEmailEnvOrThrow({
				MAILCHANNELS_ENABLED: '1',
				MAILCHANNELS_API_KEY: 'k',
				MAIL_FROM: 'a@example.com',
			}),
		).not.toThrow();
	});

	it('blocks optional-marketing until Product consent disposition', async () => {
		const transport = vi.fn(async () => ({ statusCode: 202, bodyText: 'ok' })) as SendTransport;
		const result = await sendEmailEnvelope({
			env: {
				MAILCHANNELS_ENABLED: '1',
				MAILCHANNELS_API_KEY: 'k',
				MAIL_FROM: 'LGFC <noreply@example.com>',
			},
			message: {
				to: [{ email: 'a@example.com' }],
				subject: 'promo',
				text: 'promo',
				html: '<p>promo</p>',
				classification: 'optional-marketing',
			},
			transport,
		});
		expect(result.sent).toBe(false);
		expect(result.skipped).toBe(true);
		expect(result.error).toMatch(/2919/);
		expect(transport).not.toHaveBeenCalled();
	});

	it('suppresses duplicate idempotency keys', async () => {
		const transport = vi.fn(async () => ({ statusCode: 202, bodyText: 'ok' })) as SendTransport;
		const env = {
			MAILCHANNELS_ENABLED: '1',
			MAILCHANNELS_API_KEY: 'k',
			MAIL_FROM: 'LGFC <noreply@example.com>',
		};
		const message = {
			to: [{ email: 'a@example.com' }],
			subject: 't',
			text: 't',
			html: '<p>t</p>',
			idempotencyKey: 'welcome:req-1',
			classification: 'transactional' as const,
		};
		const first = await sendEmailEnvelope({ env, message, transport });
		const second = await sendEmailEnvelope({ env, message, transport });
		expect(first.sent).toBe(true);
		expect(second.reason).toBe('duplicate');
		expect(second.skipped).toBe(true);
		expect(transport).toHaveBeenCalledTimes(1);
	});

	it('rate-limits when MAIL_RATE_LIMIT_PER_MINUTE is exceeded', async () => {
		const transport = vi.fn(async () => ({ statusCode: 202, bodyText: 'ok' })) as SendTransport;
		const env = {
			MAILCHANNELS_ENABLED: '1',
			MAILCHANNELS_API_KEY: 'k',
			MAIL_FROM: 'LGFC <noreply@example.com>',
			MAIL_RATE_LIMIT_PER_MINUTE: '1',
		};
		const base = {
			to: [{ email: 'a@example.com' }],
			subject: 't',
			text: 't',
			html: '<p>t</p>',
			classification: 'transactional' as const,
		};
		const first = await sendEmailEnvelope({
			env,
			message: { ...base, idempotencyKey: 'a' },
			transport,
		});
		const second = await sendEmailEnvelope({
			env,
			message: { ...base, idempotencyKey: 'b' },
			transport,
		});
		expect(first.sent).toBe(true);
		expect(second.reason).toBe('rate_limited');
		expect(second.sent).toBe(false);
	});

	it('returns rejected without retry for hard 4xx', async () => {
		const transport = vi.fn(async () => ({
			statusCode: 400,
			bodyText: 'bad request',
		})) as SendTransport;
		const result = await sendEmailEnvelope({
			env: {
				MAILCHANNELS_ENABLED: '1',
				MAILCHANNELS_API_KEY: 'k',
				MAIL_FROM: 'LGFC <noreply@example.com>',
				MAIL_RETRY_MAX: '2',
			},
			message: {
				to: [{ email: 'a@example.com' }],
				subject: 't',
				text: 't',
				html: '<p>t</p>',
			},
			transport,
		});
		expect(result.reason).toBe('rejected');
		expect(result.statusCode).toBe(400);
		expect(result.attempts).toBe(1);
		expect(transport).toHaveBeenCalledTimes(1);
	});

	it('retries on timeout then returns timeout', async () => {
		const transport = vi.fn(async () => {
			const err = new Error('The operation was aborted');
			err.name = 'AbortError';
			throw err;
		}) as SendTransport;
		const result = await sendEmailEnvelope({
			env: {
				MAILCHANNELS_ENABLED: '1',
				MAILCHANNELS_API_KEY: 'k',
				MAIL_FROM: 'LGFC <noreply@example.com>',
				MAIL_RETRY_MAX: '1',
			},
			message: {
				to: [{ email: 'a@example.com' }],
				subject: 't',
				text: 't',
				html: '<p>t</p>',
			},
			transport,
		});
		expect(result.reason).toBe('timeout');
		expect(result.sent).toBe(false);
		expect(result.attempts).toBe(2);
		expect(transport).toHaveBeenCalledTimes(2);
		expect(emailDeliveryUserMessage(result)).toMatch(/could not be sent/i);
	});

	it('builds accessible welcome text and html', () => {
		const content = buildWelcomeEmailContent({ toName: 'Ada', siteUrl: 'https://example.com' });
		expect(content.subject).toMatch(/Welcome/);
		expect(content.text).toContain('Ada');
		expect(content.html).toContain('<p>');
		expect(content.html).toContain('https://example.com');
	});
});
