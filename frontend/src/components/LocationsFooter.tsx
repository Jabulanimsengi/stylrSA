'use client';

import Link from 'next/link';
import { getAllCities, PROVINCES } from '@/lib/locationData';

const POPULAR_ROLES = [
    { slug: 'hairdresser', label: 'Hairdresser' },
    { slug: 'nail-tech', label: 'Nail Tech' },
    { slug: 'makeup-artist', label: 'Makeup Artist' },
    { slug: 'barber', label: 'Barber' },
    { slug: 'massage-therapist', label: 'Massage Therapist' },
    { slug: 'esthetician', label: 'Esthetician' },
];

export default function LocationsFooter() {
    const cities = getAllCities();
    const provinces = Object.values(PROVINCES);

    return (
        <div className="bg-gray-100 py-12 px-4 mt-12 border-t border-gray-200">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Searches</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Column 1: Jobs by Province */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Jobs by Province</h3>
                        <ul className="space-y-2 text-sm">
                            {provinces.map((province) => (
                                <li key={province.slug}>
                                    <Link
                                        href={`/jobs/beauty-professional/${province.slug}`}
                                        className="text-gray-600 hover:text-blue-600 hover:underline"
                                    >
                                        Jobs in {province.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 2: Hairdresser Jobs */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Hairdresser Jobs</h3>
                        <ul className="space-y-2 text-sm">
                            {cities.slice(0, 10).map((city) => (
                                <li key={city.slug}>
                                    <Link
                                        href={`/jobs/hairdresser/${city.slug}`}
                                        className="text-gray-600 hover:text-blue-600 hover:underline"
                                    >
                                        Hairdresser Jobs in {city.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Nail Tech Jobs */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Nail Tech Jobs</h3>
                        <ul className="space-y-2 text-sm">
                            {cities.slice(0, 10).map((city) => (
                                <li key={city.slug}>
                                    <Link
                                        href={`/jobs/nail-tech/${city.slug}`}
                                        className="text-gray-600 hover:text-blue-600 hover:underline"
                                    >
                                        Nail Tech Jobs in {city.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Other Roles */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Browse by Role</h3>
                        <ul className="space-y-2 text-sm">
                            {POPULAR_ROLES.map((role) => (
                                <li key={role.slug}>
                                    <Link
                                        href={`/jobs/${role.slug}/south-africa`}
                                        className="text-gray-600 hover:text-blue-600 hover:underline"
                                    >
                                        {role.label} Jobs
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* All Cities List (Collapsed or Full) */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">All Locations</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                        {cities.map((city) => (
                            <Link
                                key={city.slug}
                                href={`/jobs/beauty-professional/${city.slug}`}
                                className="hover:text-blue-600 hover:underline"
                            >
                                Jobs in {city.name}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
