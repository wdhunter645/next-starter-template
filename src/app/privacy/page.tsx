export default function Privacy() {
	return (
		<div className="min-h-screen p-8">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
					<p className="text-lg text-foreground/80">
						Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
					</p>
				</div>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Introduction</h2>
					<p className="text-foreground/90 leading-relaxed">
						Welcome to the Lou Gehrig Fan Club. We respect your privacy and are committed to protecting your personal information. 
						This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Information We Collect</h2>
					<div className="space-y-3">
						<h3 className="text-xl font-medium">Personal Information</h3>
						<p className="text-foreground/90 leading-relaxed">
							We may collect personal information that you voluntarily provide to us when you:
						</p>
						<ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
							<li>Register for membership</li>
							<li>Subscribe to our newsletter</li>
							<li>Participate in community discussions</li>
							<li>Contact us with questions or feedback</li>
						</ul>
						<p className="text-foreground/90 leading-relaxed">
							This information may include your name, email address, and any other information you choose to provide.
						</p>
					</div>

					<div className="space-y-3 mt-6">
						<h3 className="text-xl font-medium">Automatically Collected Information</h3>
						<p className="text-foreground/90 leading-relaxed">
							When you visit our website, we automatically collect certain information about your device, including:
						</p>
						<ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
							<li>Browser type and version</li>
							<li>IP address</li>
							<li>Time zone setting</li>
							<li>Operating system and platform</li>
							<li>Pages you visit and features you use</li>
						</ul>
					</div>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">How We Use Your Information</h2>
					<p className="text-foreground/90 leading-relaxed">
						We use the information we collect to:
					</p>
					<ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
						<li>Provide, operate, and maintain our website</li>
						<li>Improve, personalize, and expand our website</li>
						<li>Understand and analyze how you use our website</li>
						<li>Communicate with you about events, news, and updates</li>
						<li>Send you newsletters and promotional materials (with your consent)</li>
						<li>Respond to your comments and questions</li>
						<li>Protect against fraudulent or illegal activity</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Information Sharing and Disclosure</h2>
					<p className="text-foreground/90 leading-relaxed">
						We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
					</p>
					<ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
						<li><strong>With your consent:</strong> We may share your information when you give us explicit permission</li>
						<li><strong>Service providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website</li>
						<li><strong>Legal compliance:</strong> We may disclose information if required by law or to protect our rights and safety</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Data Security</h2>
					<p className="text-foreground/90 leading-relaxed">
						We implement appropriate technical and organizational security measures to protect your personal information. 
						However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Your Rights</h2>
					<p className="text-foreground/90 leading-relaxed">
						You have the right to:
					</p>
					<ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
						<li>Access, update, or delete your personal information</li>
						<li>Opt-out of marketing communications</li>
						<li>Object to processing of your personal information</li>
						<li>Request data portability</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Cookies and Tracking Technologies</h2>
					<p className="text-foreground/90 leading-relaxed">
						We may use cookies and similar tracking technologies to track activity on our website and store certain information. 
						You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Children&apos;s Privacy</h2>
					<p className="text-foreground/90 leading-relaxed">
						Our website is not intended for children under the age of 13. We do not knowingly collect personal information 
						from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, 
						please contact us.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Changes to This Privacy Policy</h2>
					<p className="text-foreground/90 leading-relaxed">
						We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
						on this page and updating the &quot;Last updated&quot; date at the top of this policy.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Contact Us</h2>
					<p className="text-foreground/90 leading-relaxed">
						If you have any questions about this Privacy Policy, please contact us through our website or by email.
					</p>
				</section>
			</div>
		</div>
	);
}
