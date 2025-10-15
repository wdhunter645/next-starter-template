export default function Services() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Our Services</h1>
					<p className="text-lg text-foreground/80">
						Discover the comprehensive services we offer
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
					<div className="p-8 border border-black/[.08] dark:border-white/[.145] rounded-lg">
						<h2 className="text-2xl font-semibold mb-4">Consulting Services</h2>
						<p className="text-foreground/70 leading-relaxed mb-4">
							Our expert consultants provide strategic guidance to help your business thrive. 
							We analyze your needs and develop customized solutions.
						</p>
						<ul className="list-disc list-inside text-foreground/70 space-y-2">
							<li>Business strategy development</li>
							<li>Process optimization</li>
							<li>Market analysis</li>
						</ul>
					</div>

					<div className="p-8 border border-black/[.08] dark:border-white/[.145] rounded-lg">
						<h2 className="text-2xl font-semibold mb-4">Technical Support</h2>
						<p className="text-foreground/70 leading-relaxed mb-4">
							Round-the-clock technical support to ensure your operations run smoothly. 
							Our team is always ready to assist you.
						</p>
						<ul className="list-disc list-inside text-foreground/70 space-y-2">
							<li>24/7 support availability</li>
							<li>Quick response times</li>
							<li>Expert problem resolution</li>
						</ul>
					</div>

					<div className="p-8 border border-black/[.08] dark:border-white/[.145] rounded-lg">
						<h2 className="text-2xl font-semibold mb-4">Training Programs</h2>
						<p className="text-foreground/70 leading-relaxed mb-4">
							Comprehensive training programs designed to upskill your team and improve 
							overall productivity and efficiency.
						</p>
						<ul className="list-disc list-inside text-foreground/70 space-y-2">
							<li>Customized training modules</li>
							<li>Hands-on workshops</li>
							<li>Certification programs</li>
						</ul>
					</div>

					<div className="p-8 border border-black/[.08] dark:border-white/[.145] rounded-lg">
						<h2 className="text-2xl font-semibold mb-4">Project Management</h2>
						<p className="text-foreground/70 leading-relaxed mb-4">
							Professional project management services to ensure your initiatives are 
							delivered on time and within budget.
						</p>
						<ul className="list-disc list-inside text-foreground/70 space-y-2">
							<li>End-to-end project oversight</li>
							<li>Risk management</li>
							<li>Stakeholder communication</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
