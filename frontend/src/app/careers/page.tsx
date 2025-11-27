import Link from 'next/link';
import { Metadata } from 'next';
import { FaUserTie, FaCut } from 'react-icons/fa';
import LocationsFooter from '@/components/LocationsFooter';

export const metadata: Metadata = {
  title: 'Careers & Hiring | Stylr SA',
  description: 'The #1 Job Marketplace for the Hair & Beauty Industry in South Africa. Find staff or get hired.',
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            The #1 Job Marketplace for the Hair & Beauty Industry
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Connecting South Africa's top salons with elite beauty professionals.
          </p>
        </div>
      </div>

      {/* Split Choice Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 -mt-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Employers */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 hover:shadow-2xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 mx-auto">
              <FaUserTie size={32} />
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              I am Hiring
            </h2>
            <p className="text-gray-600 text-center mb-8 text-lg">
              Find staff, browse CVs, and post vacancies to reach thousands of local candidates.
            </p>
            <ul className="space-y-3 mb-8 text-gray-600 max-w-sm mx-auto">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Access candidate database
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Post salon jobs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Find freelance talent
              </li>
            </ul>
            <div className="text-center">
              <Link
                href="/employers"
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors w-full md:w-auto"
              >
                Find Talent
              </Link>
            </div>
          </div>

          {/* For Talent */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 hover:shadow-2xl transition-shadow border border-gray-100">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-6 mx-auto">
              <FaCut size={32} />
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              I am Job Seeking
            </h2>
            <p className="text-gray-600 text-center mb-8 text-lg">
              Upload your CV, view vacancies, and let top salons find you.
            </p>
            <ul className="space-y-3 mb-8 text-gray-600 max-w-sm mx-auto">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Create professional profile
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Apply for salon jobs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Get headhunted
              </li>
            </ul>
            <div className="text-center">
              <Link
                href="/jobs"
                className="inline-block px-8 py-4 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors w-full md:w-auto"
              >
                Find Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Why use Stylr SA?</h3>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Specialized Database</h4>
            <p className="text-gray-600 text-sm">Unlike generic job boards, we focus 100% on the hair, beauty, and wellness industry.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Verified Professionals</h4>
            <p className="text-gray-600 text-sm">Our candidates are vetted professionals with portfolios you can view instantly.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Fast Hiring</h4>
            <p className="text-gray-600 text-sm">Connect directly with talent or employers without the middleman delays.</p>
          </div>
        </div>
      </div>

      <LocationsFooter />
    </div>
  );
}
