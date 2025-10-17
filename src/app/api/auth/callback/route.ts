import { NextRequest, NextResponse } from 'next/server';

/**
 * GitHub App OAuth Callback Handler
 * 
 * This endpoint handles the OAuth callback from GitHub after a user
 * authorizes the GitHub App. This is required for apps to appear in
 * the OAuth authorization list.
 * 
 * Flow:
 * 1. User clicks "Authorize" on GitHub
 * 2. GitHub redirects to this callback with a code
 * 3. We exchange the code for an access token
 * 4. Store token and redirect user to success page
 */
export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const code = searchParams.get('code');
	const state = searchParams.get('state');
	const error = searchParams.get('error');
	const errorDescription = searchParams.get('error_description');

	// Handle OAuth errors (user denied, etc.)
	if (error) {
		console.error('OAuth error:', error, errorDescription);
		return NextResponse.redirect(
			new URL(`/auth/error?error=${error}&description=${errorDescription}`, request.url)
		);
	}

	// Validate required parameters
	if (!code) {
		return NextResponse.json(
			{ error: 'Missing authorization code' },
			{ status: 400 }
		);
	}

	// Verify state parameter to prevent CSRF attacks
	// In production, validate this against a stored state value
	if (!state) {
		console.warn('OAuth callback missing state parameter');
	}

	try {
		// Get GitHub App credentials from environment
		const clientId = process.env.GITHUB_APP_CLIENT_ID;
		const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;

		if (!clientId || !clientSecret) {
			console.error('Missing GitHub App credentials in environment variables');
			return NextResponse.json(
				{ error: 'Server configuration error' },
				{ status: 500 }
			);
		}

		// Exchange authorization code for access token
		const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				client_id: clientId,
				client_secret: clientSecret,
				code,
				state,
			}),
		});

		if (!tokenResponse.ok) {
			throw new Error(`GitHub API error: ${tokenResponse.statusText}`);
		}

		const tokenData = await tokenResponse.json() as {
			access_token?: string;
			token_type?: string;
			scope?: string;
			error?: string;
			error_description?: string;
		};

		// Check for errors in token response
		if (tokenData.error) {
			console.error('Token exchange error:', tokenData.error, tokenData.error_description);
			return NextResponse.json(
				{ error: tokenData.error, description: tokenData.error_description },
				{ status: 400 }
			);
		}

		// Successfully obtained access token
		const { token_type, scope } = tokenData;
		// access_token is available but not logged for security
		// TODO: Store the access token securely
		// Options:
		// 1. Store in secure HTTP-only cookie
		// 2. Store in database with user session
		// 3. Store in secure session storage
		
		console.log('OAuth authorization successful:', {
			token_type,
			scope,
			// Don't log the actual token
		});

		// In production, you might want to:
		// 1. Fetch user info from GitHub API
		// 2. Create or update user in your database
		// 3. Create a session
		// 4. Set secure session cookies

		// For now, redirect to a success page
		// You can pass data via query params or session
		return NextResponse.redirect(
			new URL('/auth/success', request.url)
		);

	} catch (error) {
		console.error('OAuth callback error:', error);
		return NextResponse.json(
			{ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
