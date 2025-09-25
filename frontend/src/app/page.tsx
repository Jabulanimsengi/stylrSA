// frontend/src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-ghost-white tracking-tight">
          Online Hair Salon Marketplace
        </h1>
        <p className="mt-4 text-xl text-slate-gray">
          Your one-stop platform for salon services.
        </p>
        <Link
          href="/salons"
          className="mt-10 inline-block bg-vivid-cyan text-gunmetal font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity duration-300"
        >
          Explore Salons Now
        </Link>
      </div>
    </main>
  );
}