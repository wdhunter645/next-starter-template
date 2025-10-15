export default function Terms() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
					<p className="text-lg text-foreground/80">
						Please read these terms carefully
					</p>
				</div>
				
				<div className="space-y-6 text-left">
					<section>
						<h2 className="text-2xl font-semibold mb-3">Acceptance of Terms</h2>
						<p className="text-foreground/70 leading-relaxed">
							By accessing and using our services, you accept and agree to be bound by the terms and 
							provisions of this agreement. If you do not agree to these terms, please do not use our services.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">Use of Services</h2>
						<p className="text-foreground/70 leading-relaxed">
							You agree to use our services only for lawful purposes and in accordance with these Terms. 
							You are responsible for maintaining the confidentiality of your account and for all activities 
							that occur under your account.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">Intellectual Property</h2>
						<p className="text-foreground/70 leading-relaxed">
							The content, features, and functionality of our services are owned by LGFC and are protected 
							by international copyright, trademark, and other intellectual property laws.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">Limitation of Liability</h2>
						<p className="text-foreground/70 leading-relaxed">
							LGFC shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
							resulting from your use of or inability to use the services.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">Changes to Terms</h2>
						<p className="text-foreground/70 leading-relaxed">
							We reserve the right to modify these terms at any time. We will notify users of any material 
							changes by posting the new Terms of Service on this page.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">Contact Information</h2>
						<p className="text-foreground/70 leading-relaxed">
							If you have any questions about these Terms of Service, please contact us through our contact page.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
