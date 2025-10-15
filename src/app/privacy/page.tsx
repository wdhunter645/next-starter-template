export default function Privacy() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
					<p className="text-lg text-foreground/80">
						Your privacy is important to us
					</p>
				</div>
				
				<div className="space-y-6 text-left">
					<section>
						<h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
						<p className="text-foreground/70 leading-relaxed">
							We collect information that you provide directly to us, including when you create an account, 
							use our services, or communicate with us. This may include your name, email address, and any 
							other information you choose to provide.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
						<p className="text-foreground/70 leading-relaxed">
							We use the information we collect to provide, maintain, and improve our services, to process 
							your requests, and to communicate with you about our services and offerings.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">Information Sharing</h2>
						<p className="text-foreground/70 leading-relaxed">
							We do not share your personal information with third parties except as described in this policy 
							or with your consent. We may share information with service providers who perform services on our behalf.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">Data Security</h2>
						<p className="text-foreground/70 leading-relaxed">
							We take reasonable measures to help protect your personal information from loss, theft, misuse, 
							and unauthorized access, disclosure, alteration, and destruction.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
						<p className="text-foreground/70 leading-relaxed">
							If you have any questions about this Privacy Policy, please contact us through our contact page.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
