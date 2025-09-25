'use client';

import { useEffect, useState } from 'react';
import { Salon, Service } from '@/types';
import BookingModal from '@/components/BookingModal';

// Fetches details for a single salon
async function getSalonDetails(id: string): Promise<Salon | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/salons/${id}`);
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Failed to fetch salon details:', error);
    return null;
  }
}

// Fetches all services for a given salon
async function getSalonServices(id: string): Promise<Service[]> {
  try {
    const res = await fetch(`http://localhost:3000/api/salons/${id}/services`);
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Failed to fetch salon services:', error);
    return [];
  }
}

export default function SalonProfilePage({ params }: { params: { id: string } }) {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [salonData, servicesData] = await Promise.all([
        getSalonDetails(params.id),
        getSalonServices(params.id),
      ]);
      setSalon(salonData);
      setServices(servicesData);
      setIsLoading(false);
    }
    fetchData();
  }, [params.id]);

  if (isLoading) {
    return <div className="text-center p-10 text-white">Loading Salon...</div>;
  }

  if (!salon) {
    return <div className="text-center p-8 text-white">Salon not found.</div>;
  }

  return (
    <>
      {selectedService && (
        <BookingModal
          salon={salon}
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onBookingSuccess={() => {
            alert('Booking successful!');
            setSelectedService(null);
          }}
        />
      )}
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
          <div className="bg-white p-6 rounded-lg shadow-md -mt-20 text-gray-800">
            <h2 className="text-3xl font-semibold">Our Services</h2>
            <p className="text-slate-gray mb-6">
              Location: {salon.town}, {salon.city}
            </p>

            <div className="space-y-4">
              {services.filter((s) => s.approvalStatus === 'APPROVED').length > 0 ? (
                services
                  .filter((s) => s.approvalStatus === 'APPROVED')
                  .map((service) => (
                    <div key={service.id} className="border p-4 rounded-md">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <div className="mb-4 sm:mb-0">
                          <h3 className="text-xl font-medium">{service.title}</h3>
                          <p className="text-lg font-semibold text-indigo-600">
                            R{service.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedService(service)}
                          className="px-6 py-2 bg-vivid-cyan text-gunmetal font-bold rounded-md self-start sm:self-center"
                        >
                          Book Now
                        </button>
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
    </>
  );
}