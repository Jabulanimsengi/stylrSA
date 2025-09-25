// frontend/src/app/salons/[id]/page.tsx
import { Salon, Service } from '@/types'; // <-- Change this import

async function getSalonDetails(id: string): Promise<Salon | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/salons/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

async function getSalonServices(id: string): Promise<Service[]> {
  try {
    const res = await fetch(`http://localhost:3000/api/salons/${id}/services`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function SalonProfilePage({ params }: { params: { id: string } }) {
  const salon = await getSalonDetails(params.id);
  const services = await getSalonServices(params.id);

  if (!salon) {
    return <div className="text-center p-8">Salon not found.</div>;
  }

  return (
    <div>
      <div
        className="h-80 bg-cover bg-center"
        style={{ backgroundImage: `url(${salon.backgroundImage || 'https://via.placeholder.com/1200x400'})` }}
      >
        <div className="flex items-center justify-center h-full w-full bg-black bg-opacity-50">
          <h1 className="text-5xl font-bold text-white text-center">{salon.name}</h1>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <div className="bg-white p-6 rounded-lg shadow-md -mt-20">
          <h2 className="text-3xl font-semibold text-gray-800">Our Services</h2>
          <p className="text-gray-600 mb-6">
            Location: {salon.town}, {salon.city}
          </p>

          <div className="space-y-4">
            {services.filter(s => s.approvalStatus === 'APPROVED').length > 0 ? (
              services.filter(s => s.approvalStatus === 'APPROVED').map((service) => (
                <div key={service.id} className="border p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium text-gray-900">{service.title}</h3>
                    <p className="text-lg font-semibold text-indigo-600">R{service.price.toFixed(2)}</p>
                  </div>
                  <p className="text-gray-600 mt-2">{service.description}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No approved services listed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}