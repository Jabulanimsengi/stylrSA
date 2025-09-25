// frontend/src/app/dashboard/page.tsx
'use client'; 

import { useEffect, useState } from 'react';
import { Salon, Service } from '@/types';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const salonRes = await fetch('http://localhost:3000/api/salons/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (salonRes.status === 401) router.push('/login');
        if (!salonRes.ok) throw new Error('Could not fetch your salon data.');
        
        const salonData: Salon = await salonRes.json();
        setSalon(salonData);

        const servicesRes = await fetch(`http://localhost:3000/api/salons/${salonData.id}/services`);
        if (!servicesRes.ok) throw new Error('Could not fetch services.');
        const servicesData: Service[] = await servicesRes.json();
        setServices(servicesData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [router]);

  if (isLoading) {
    return <div className="text-center p-10 text-white">Loading your dashboard...</div>; // Added text-white
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!salon) {
    return <div className="text-center p-10 text-white">You have not created a salon profile yet.</div>; // Added text-white
  }

  return (
    <div className="container mx-auto p-8">
      {/* --- The changes are here --- */}
      <h1 className="text-4xl font-bold mb-4 text-white">My Dashboard</h1>
      <h2 className="text-3xl font-semibold text-gray-200">{salon.name}</h2>
      <p className="text-gray-400 mb-8">{salon.city}, {salon.province}</p>
      {/* --- End of changes --- */}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Your Services</h3>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="border p-4 rounded-md flex justify-between items-center">
              <div>
                <h4 className="text-xl font-medium text-gray-900">{service.title}</h4>
                <p className="text-gray-600">R{service.price.toFixed(2)}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  service.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  service.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {service.approvalStatus}
              </span>
            </div>
          ))}
          {services.length === 0 && <p className="text-gray-700">You haven't added any services yet.</p>}
        </div>
      </div>
    </div>
  );
}