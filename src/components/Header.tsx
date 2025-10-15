import Link from "next/link";

export default function Header() {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-black/[.08] dark:border-white/[.145]">
			<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex-shrink-0">
						<Link 
							href="/" 
							className="text-xl font-bold hover:opacity-80 transition-opacity"
							aria-label="LGFC Home"
						>
							LGFC
						</Link>
					</div>
					<div className="flex space-x-8">
						<Link 
							href="/" 
							className="text-sm font-medium hover:underline hover:underline-offset-4"
						>
							Home
						</Link>
						<Link 
							href="/about" 
							className="text-sm font-medium hover:underline hover:underline-offset-4"
						>
							About
						</Link>
						<Link 
							href="/services" 
							className="text-sm font-medium hover:underline hover:underline-offset-4"
						>
							Services
						</Link>
						<Link 
							href="/contact" 
							className="text-sm font-medium hover:underline hover:underline-offset-4"
						>
							Contact
						</Link>
					</div>
				</div>
			</nav>
		</header>
	);
}
