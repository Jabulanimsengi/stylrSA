import Link from 'next/link';
import { Metadata } from 'next';
import { FaRocket, FaHandshake, FaMoneyBillWave, FaStar } from 'react-icons/fa';

export const metadata: Metadata = {
    title: 'Hair & Beauty Jobs | Salon Vacancies | Upload CV | Stylr SA',
    description: 'Get hired by top salons. Upload your CV and let jobs find you. Browse hairdressing jobs, nail tech vacancies, and spa therapist roles in South Africa.',
    keywords: 'hairdressing jobs, nail tech vacancies, spa therapist jobs, upload cv, salon jobs, beauty careers, freelance beauty work',
};

export default function TalentPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-pink-600 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Get Hired by Top Salons: Upload Your CV & Let Jobs Find You
                    </h1>
                    <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
                        Don’t just apply for hairdressing jobs—let the employers come to you. Create your free professional profile and showcase your skills to hundreds of salon owners and recruiters looking to hire right now.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/create-candidate-profile"
                            className="px-8 py-4 bg-white text-pink-600 rounded-xl font-bold hover:bg-pink-50 transition-colors"
                        >
                            Create Free Profile
                        </Link>
                        <Link
                            href="/jobs"
                            className="px-8 py-4 bg-pink-700 text-white rounded-xl font-bold hover:bg-pink-800 transition-colors border border-pink-400"
                        >
                            Browse Vacancies
                        </Link>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="py-20 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Boost Your Beauty Career
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-6">
                                <FaRocket size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Get Headhunted</h3>
                            <p className="text-gray-600">
                                Top salons browse our database daily. By having a profile, you put yourself in the shop window for the best opportunities.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-6">
                                <FaHandshake size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Full-Time or Freelance</h3>
                            <p className="text-gray-600">
                                Whether you want a stable salary, a rent-a-chair deal, or just some extra freelance gigs, you can set your availability.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-6">
                                <FaStar size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Showcase Your Work</h3>
                            <p className="text-gray-600">
                                Upload photos of your best cuts, colors, and nail art. Let your portfolio speak for itself and attract premium employers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs We Have */}
            <div className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Find Your Perfect Role
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <FaMoneyBillWave className="text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-lg">High-End Salon Jobs</h4>
                                <p className="text-gray-600 text-sm">Join established brands with great benefits and training.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <FaMoneyBillWave className="text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-lg">Rent-a-Chair / Booth Rental</h4>
                                <p className="text-gray-600 text-sm">Be your own boss within a busy salon environment.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <FaMoneyBillWave className="text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-lg">Mobile & Freelance</h4>
                                <p className="text-gray-600 text-sm">Pick up extra shifts or build your own mobile client base.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <FaMoneyBillWave className="text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-lg">Spa & Wellness Roles</h4>
                                <p className="text-gray-600 text-sm">Tranquil environments for massage and beauty therapy.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gray-900 text-white py-16 px-4 text-center">
                <h2 className="text-3xl font-bold mb-6">Ready to upgrade your career?</h2>
                <Link
                    href="/create-candidate-profile"
                    className="inline-block px-8 py-4 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors"
                >
                    Upload Your CV Now
                </Link>
            </div>
        </div>
    );
}
