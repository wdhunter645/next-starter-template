import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { checkAdminAccess } from '@/lib/auth/adminGuard';

/**
 * B2 Presign Upload Endpoint - Admin Only
 * 
 * Generates a presigned URL for uploading files to Backblaze B2 via S3-compatible API.
 * This endpoint is feature-flagged and will degrade gracefully if B2 is not configured.
 * 
 * Security:
 * - Requires admin authentication (checked via ADMIN_EMAILS)
 * - Returns 401/403 for unauthorized requests
 * - Returns 503 if B2 environment variables are not configured
 * - No secrets are exposed in the response
 * 
 * Request body:
 * {
 *   "key": "path/to/file.jpg",           // Required: object key/path in bucket
 *   "contentType": "image/jpeg",         // Optional: MIME type
 *   "expiresIn": 300                     // Optional: seconds until URL expires (default: 300)
 * }
 * 
 * Response (success):
 * {
 *   "ok": true,
 *   "url": "https://s3.us-west-000.backblazeb2.com/...",
 *   "method": "PUT",
 *   "headers": { "Content-Type": "image/jpeg" },
 *   "expiresIn": 300
 * }
 * 
 * Response (not configured):
 * {
 *   "ok": false,
 *   "reason": "B2 not configured"
 * }
 */

interface PresignRequestBody {
	key: string;
	contentType?: string;
	expiresIn?: number;
}

export async function POST(request: NextRequest) {
	// Check admin access
	const adminCheck = await checkAdminAccess(request);
	if (!adminCheck.authorized) {
		return NextResponse.json(
			{ ok: false, error: adminCheck.reason },
			{ status: adminCheck.status }
		);
	}

	// Check B2 configuration
	const b2KeyId = process.env.B2_KEY_ID;
	const b2AppKey = process.env.B2_APP_KEY;
	const b2Bucket = process.env.B2_BUCKET;
	const b2Endpoint = process.env.B2_ENDPOINT;

	if (!b2KeyId || !b2AppKey || !b2Bucket || !b2Endpoint) {
		return NextResponse.json(
			{
				ok: false,
				reason: 'B2 not configured',
				missing: {
					keyId: !b2KeyId,
					appKey: !b2AppKey,
					bucket: !b2Bucket,
					endpoint: !b2Endpoint,
				},
			},
			{ status: 503 }
		);
	}

	// Parse and validate request body
	let body: PresignRequestBody;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ ok: false, error: 'Invalid JSON body' },
			{ status: 400 }
		);
	}

	const { key, contentType, expiresIn = 300 } = body;

	if (!key || typeof key !== 'string' || key.trim().length === 0) {
		return NextResponse.json(
			{ ok: false, error: 'Missing or invalid "key" field' },
			{ status: 400 }
		);
	}

	if (expiresIn && (typeof expiresIn !== 'number' || expiresIn <= 0 || expiresIn > 3600)) {
		return NextResponse.json(
			{ ok: false, error: 'expiresIn must be between 1 and 3600 seconds' },
			{ status: 400 }
		);
	}

	try {
		// Create S3 client for B2
		const s3Client = new S3Client({
			endpoint: b2Endpoint,
			region: 'auto', // B2 doesn't use regions
			credentials: {
				accessKeyId: b2KeyId,
				secretAccessKey: b2AppKey,
			},
			forcePathStyle: true, // Required for B2 S3-compatible API
		});

		// Create PUT command
		const command = new PutObjectCommand({
			Bucket: b2Bucket,
			Key: key.trim(),
			ContentType: contentType,
		});

		// Generate presigned URL
		const presignedUrl = await getSignedUrl(s3Client, command, {
			expiresIn,
		});

		// Return presigned URL with metadata
		return NextResponse.json({
			ok: true,
			url: presignedUrl,
			method: 'PUT',
			headers: contentType ? { 'Content-Type': contentType } : {},
			expiresIn,
		});
	} catch (error) {
		console.error('B2 presign error:', error);
		return NextResponse.json(
			{
				ok: false,
				error: 'Failed to generate presigned URL',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
