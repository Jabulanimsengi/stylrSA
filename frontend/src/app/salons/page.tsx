// frontend/src/app/salons/page.tsx
import Link from 'next/link';
import { Salon } from '@/types'; // <-- Change this import

async function getSalons(): Promise<Salon[]> {
  try {
    const res = await fetch('http://localhost:3000/api/salons', {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch salons');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function SalonsPage() {
  const salons = await getSalons();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Explore Salons</h1>
      {salons.length === 0 ? (
        <p className="text-gray-600">No approved salons found at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {salons.map((salon) => (
            <Link
              href={`/salons/${salon.id}`}
              key={salon.id}
              className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div
                className="h-48 bg-cover bg-center rounded-t-lg"
                style={{
                  backgroundImage: `url(${salon.backgroundImage || 'https://via.placeholder.com/400x200'})`,
                }}
              ></div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900">{salon.name}</h2>
                <p className="text-gray-600 mt-2">
                  {salon.city}, {salon.province}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}