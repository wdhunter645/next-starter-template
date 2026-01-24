/**
 * Health check endpoint
 * Validates that routing and basic server-side rendering work
 */
export default function HealthPage() {
	return (
		<div style={{ padding: '2rem', fontFamily: 'monospace' }}>
			<div>OK: health</div>
			<div style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
				Timestamp: {new Date().toISOString()}
			</div>
		</div>
	);
}
