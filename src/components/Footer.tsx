export default function Footer() {
	return (
		<footer className="border-t border-black/[.08] dark:border-white/[.145] bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="text-sm text-center md:text-left">
						<p>&copy; {new Date().getFullYear()} LGFC. All rights reserved.</p>
					</div>
					<div className="flex gap-6 flex-wrap justify-center">
						<a 
							href="/privacy" 
							className="text-sm hover:underline hover:underline-offset-4"
						>
							Privacy Policy
						</a>
						<a 
							href="/terms" 
							className="text-sm hover:underline hover:underline-offset-4"
						>
							Terms of Service
						</a>
						<a 
							href="/contact" 
							className="text-sm hover:underline hover:underline-offset-4"
						>
							Contact Us
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
