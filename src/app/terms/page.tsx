export default function Terms() {
	return (
		<div className="min-h-screen p-8">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
					<p className="text-lg text-foreground/80">
						Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
					</p>
				</div>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Agreement to Terms</h2>
					<p className="text-foreground/90 leading-relaxed">
						By accessing and using the Lou Gehrig Fan Club website, you agree to be bound by these Terms of Service 
						and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
						from using or accessing this site.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Use License</h2>
					<p className="text-foreground/90 leading-relaxed">
						Permission is granted to temporarily access the materials on the Lou Gehrig Fan Club website for personal, 
						non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
					</p>
					<ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
						<li>Modify or copy the materials</li>
						<li>Use the materials for any commercial purpose or public display</li>
						<li>Attempt to reverse engineer any software contained on the website</li>
						<li>Remove any copyright or proprietary notations from the materials</li>
						<li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
					</ul>
					<p className="text-foreground/90 leading-relaxed mt-4">
						This license shall automatically terminate if you violate any of these restrictions and may be terminated 
						by Lou Gehrig Fan Club at any time.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">User Accounts and Membership</h2>
					<p className="text-foreground/90 leading-relaxed">
						When you create an account or become a member, you agree to:
					</p>
					<ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
						<li>Provide accurate, current, and complete information</li>
						<li>Maintain and update your information to keep it accurate</li>
						<li>Maintain the security of your account credentials</li>
						<li>Accept responsibility for all activities that occur under your account</li>
						<li>Notify us immediately of any unauthorized use of your account</li>
					</ul>
					<p className="text-foreground/90 leading-relaxed mt-4">
						We reserve the right to suspend or terminate accounts that violate these terms.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">User Content and Conduct</h2>
					<p className="text-foreground/90 leading-relaxed">
						Our website may allow you to post, submit, or share content. By doing so, you agree that:
					</p>
					<ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
						<li>You will not post content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
						<li>You will not impersonate any person or entity or misrepresent your affiliation</li>
						<li>You will not post spam or engage in unauthorized advertising</li>
						<li>You will respect intellectual property rights of others</li>
						<li>You grant us a non-exclusive, royalty-free license to use, reproduce, and display your content on our platform</li>
					</ul>
					<p className="text-foreground/90 leading-relaxed mt-4">
						We reserve the right to remove any content that violates these terms or is otherwise inappropriate.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Intellectual Property</h2>
					<p className="text-foreground/90 leading-relaxed">
						The content, features, and functionality of the Lou Gehrig Fan Club website, including but not limited to text, 
						graphics, logos, and software, are owned by or licensed to us and are protected by copyright, trademark, 
						and other intellectual property laws.
					</p>
					<p className="text-foreground/90 leading-relaxed mt-4">
						You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any of our 
						content without our prior written permission.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Third-Party Links</h2>
					<p className="text-foreground/90 leading-relaxed">
						Our website may contain links to third-party websites or services that are not owned or controlled by us. 
						We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any 
						third-party websites or services.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Disclaimer</h2>
					<p className="text-foreground/90 leading-relaxed">
						The materials on the Lou Gehrig Fan Club website are provided on an &quot;as is&quot; basis. We make no warranties, 
						expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties 
						or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
					</p>
					<p className="text-foreground/90 leading-relaxed mt-4">
						We do not warrant that the website will be uninterrupted, timely, secure, or error-free, or that defects will be corrected.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Limitations of Liability</h2>
					<p className="text-foreground/90 leading-relaxed">
						In no event shall Lou Gehrig Fan Club or its suppliers be liable for any damages (including, without limitation, 
						damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use 
						the materials on our website, even if we or an authorized representative has been notified of the possibility of such damage.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Indemnification</h2>
					<p className="text-foreground/90 leading-relaxed">
						You agree to indemnify, defend, and hold harmless Lou Gehrig Fan Club and its officers, directors, employees, 
						and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorneys&apos; fees, 
						arising out of or in any way connected with your access to or use of the website, or your violation of these Terms of Service.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Governing Law</h2>
					<p className="text-foreground/90 leading-relaxed">
						These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which 
						Lou Gehrig Fan Club operates, without regard to its conflict of law provisions.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Changes to Terms</h2>
					<p className="text-foreground/90 leading-relaxed">
						We reserve the right to revise these Terms of Service at any time. By continuing to use the website after changes 
						are posted, you agree to be bound by the revised terms. We encourage you to review these terms periodically.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Termination</h2>
					<p className="text-foreground/90 leading-relaxed">
						We may terminate or suspend your access to our website immediately, without prior notice or liability, 
						for any reason whatsoever, including without limitation if you breach these Terms of Service.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Contact Information</h2>
					<p className="text-foreground/90 leading-relaxed">
						If you have any questions about these Terms of Service, please contact us through our website or by email.
					</p>
				</section>
			</div>
		</div>
	);
}
