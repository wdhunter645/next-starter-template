export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 max-w-6xl py-8 text-sm text-slate-600">
        <p>© {new Date().getFullYear()} Lou Gehrig Fan Club. All rights reserved.</p>
      </div>
    </footer>
  );
}
