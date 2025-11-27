import Link from 'next/link';
import { Metadata } from 'next';
import { FaSearch, FaBriefcase, FaUserCheck, FaCheckCircle } from 'react-icons/fa';

export const metadata: Metadata = {
    title: 'Hire Hairdressers & Beauty Staff | Salon Recruitment | Stylr SA',
    description: 'Find and hire qualified hair & beauty professionals fast. Access our CV database of verified hairdressers, nail techs, and therapists in South Africa.',
    keywords: 'hire salon staff, recruit hairdressers, find beauty talent, salon staffing, spa recruitment, hire nail technician',
};

export default function EmployersPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-blue-900 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Find and Hire Qualified Hair & Beauty Professionals Fast
                    </h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Stop wasting time on generic job boards. Access a dedicated database of verified hairdressers, nail technicians, and massage therapists who are actively looking for work.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/admin/candidates"
                            className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                        >
                            Browse Candidate CVs
                        </Link>
                        <Link
                            href="/create-salon"
                            className="px-8 py-4 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors border border-blue-500"
                        >
                            Post a Job
                        </Link>
                    </div>
                </div>
            </div>

            {/* Value Props */}
            <div className="py-20 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        The Smartest Way to Staff Your Salon
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                                <FaSearch size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Search CV Database</h3>
                            <p className="text-gray-600">
                                Filter candidates by role (Hair, Nails, Spa), location, and skills. View detailed profiles and portfolios instantly.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                                <FaBriefcase size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Post Vacancies</h3>
                            <p className="text-gray-600">
                                Advertise full-time roles, rent-a-chair opportunities, or freelance gigs to thousands of local professionals.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                                <FaUserCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Verified Talent</h3>
                            <p className="text-gray-600">
                                We verify qualifications and identity, so you can hire with confidence. See ratings and reviews from previous employers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles We Cover */}
            <div className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Who Can You Hire?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-lg">Hair Stylists & Barbers</h4>
                                <p className="text-gray-600 text-sm">Senior stylists, colorists, braiders, and barbers.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-lg">Nail Technicians</h4>
                                <p className="text-gray-600 text-sm">Acrylic experts, gel polish specialists, and nail artists.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-lg">Spa Therapists</h4>
                                <p className="text-gray-600 text-sm">Massage therapists, estheticians, and skin care experts.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-lg">Salon Managers</h4>
                                <p className="text-gray-600 text-sm">Experienced receptionists and business managers.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gray-900 text-white py-16 px-4 text-center">
                <h2 className="text-3xl font-bold mb-6">Ready to build your dream team?</h2>
                <Link
                    href="/admin/candidates"
                    className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                    Start Hiring Now
                </Link>
            </div>
        </div>
    );
}
