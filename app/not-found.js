import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-[var(--accent)] mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-[var(--muted)] mb-8 max-w-md">
          The short URL you clicked doesn&apos;t exist or the link has expired.
        </p>
        <Link
          href="/"
          className="inline-block bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </main>
  );
}
