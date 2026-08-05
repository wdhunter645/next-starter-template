import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	__resetEmailEnvelopeStateForTests,
	emailDeliveryUserMessage,
	isEmailEnabled,
	sendEmailEnvelope,
	type SendTransport,
} from '../../functions/_lib/email-envelope';
import {
	buildAdminJoinNotificationContent,
	buildWelcomeEmailContent,
} from '../../functions/_lib/email-templates';

beforeEach(() => {
	__resetEmailEnvelopeStateForTests();
});

describe('#2925 deliverability qualification (controlled / stub only)', () => {
	it('proves configuration-disable rollback after a successful stub send', async () => {
		const transport = vi.fn(async () => ({ statusCode: 202, bodyText: 'accepted' })) as SendTransport;
		const enabledEnv = {
			MAILCHANNELS_ENABLED: '1',
			MAILCHANNELS_API_KEY: 'test-key-not-secret',
			MAIL_FROM: 'LGFC <noreply@example.com>',
		};

		const first = await sendEmailEnvelope({
			env: enabledEnv,
			message: {
				to: [{ email: 'member@example.com' }],
				subject: 'welcome',
				text: 'welcome',
				html: '<p>welcome</p>',
				idempotencyKey: '2925-rollback-a',
				classification: 'transactional',
			},
			transport,
		});
		expect(first.sent).toBe(true);
		expect(transport).toHaveBeenCalledTimes(1);

		const disabledEnv = { ...enabledEnv, MAILCHANNELS_ENABLED: '0' };
		expect(isEmailEnabled(disabledEnv)).toBe(false);

		const afterDisable = await sendEmailEnvelope({
			env: disabledEnv,
			message: {
				to: [{ email: 'member@example.com' }],
				subject: 'welcome',
				text: 'welcome',
				html: '<p>welcome</p>',
				idempotencyKey: '2925-rollback-b',
				classification: 'transactional',
			},
			transport,
		});

		expect(afterDisable).toMatchObject({
			sent: false,
			provider: 'disabled',
			reason: 'disabled',
		});
		expect(transport).toHaveBeenCalledTimes(1);
		expect(emailDeliveryUserMessage(afterDisable)).toMatch(/disabled/i);
		expect(emailDeliveryUserMessage(afterDisable)).not.toMatch(/was accepted for delivery/i);
	});

	it('keeps launch-event templates free of secret-like placeholders', () => {
		const welcome = buildWelcomeEmailContent({
			toName: 'Test Member',
			siteUrl: 'https://example.com',
		});
		const admin = buildAdminJoinNotificationContent({
			name: 'Test Member',
			email: 'member@example.com',
			requestId: 'join_test_1',
			siteUrl: 'https://example.com',
		});

		for (const content of [welcome, admin]) {
			expect(content.subject.length).toBeGreaterThan(0);
			expect(content.text).toContain('Test Member');
			expect(content.html).toMatch(/<(p|h3|ul|li)\b/);
			expect(content.text + content.html).not.toMatch(/MAILCHANNELS_API_KEY|api[_-]?key\s*[:=]/i);
			expect(content.text + content.html).not.toMatch(/Bearer\s+[A-Za-z0-9._-]+/);
		}
	});

	it('never claims delivery for failed launch-event shaped results', () => {
		const failed = {
			sent: false as const,
			provider: 'mailchannels',
			reason: 'rejected' as const,
			error: 'MailChannels status 400: bad request',
			attempts: 1,
		};
		const msg = emailDeliveryUserMessage(failed);
		expect(msg).toBeTruthy();
		expect(msg).not.toMatch(/accepted for delivery/i);
		expect(msg).toMatch(/could not be sent|saved/i);
	});
});
