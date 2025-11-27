import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkerAlt, FaBriefcase, FaClock } from 'react-icons/fa';

interface CandidateCardProps {
    candidate: {
        id: string;
        user: {
            firstName: string;
            lastName?: string;
        };
        profession: string;
        province: string;
        city: string;
        yearsExperience: number;
        specializations: string[];
        qualifications: string[];
        portfolio: string[];
    };
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
    const { user, profession, province, city, yearsExperience, specializations, portfolio } = candidate;

    // Format profession for display
    const displayProfession = profession.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    return (
        <Link href={`/candidates/${candidate.id}`} className="block group">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full flex flex-col">
                {/* Portfolio Preview (if available) */}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                    {portfolio && portfolio.length > 0 ? (
                        <Image
                            src={portfolio[0]}
                            alt={`${user.firstName}'s work`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <span className="text-sm">No portfolio images</span>
                        </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700">
                        {yearsExperience} {yearsExperience === 1 ? 'Year' : 'Years'} Exp.
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                                {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-primary font-medium text-sm">{displayProfession}</p>
                        </div>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm mb-3">
                        <FaMapMarkerAlt className="mr-1.5 text-gray-400" />
                        <span>{city}, {province}</span>
                    </div>

                    <div className="mt-auto">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {specializations.slice(0, 3).map((spec, index) => (
                                <span key={index} className="inline-block bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-100">
                                    {spec}
                                </span>
                            ))}
                            {specializations.length > 3 && (
                                <span className="inline-block bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-full border border-gray-100">
                                    +{specializations.length - 3} more
                                </span>
                            )}
                        </div>

                        <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-xs text-gray-500">View full profile</span>
                            <span className="text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
