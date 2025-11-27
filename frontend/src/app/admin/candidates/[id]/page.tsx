'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaClock, FaCalendarAlt, FaFilePdf } from 'react-icons/fa';
import Link from 'next/link';

export default function AdminCandidateDetailPage() {
    const { user, authStatus } = useAuth();
    const router = useRouter();
    const params = useParams();
    const [candidate, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authStatus !== 'loading') {
            if (authStatus !== 'authenticated' || user?.role !== 'ADMIN') {
                toast.error('Access denied. Admin only.');
                router.push('/');
                return;
            }
            if (params?.id) {
                fetchCandidate(params.id as string);
            }
        }
    }, [authStatus, user, router, params]);

    const fetchCandidate = async (id: string) => {
        try {
            const res = await apiFetch(`/api/candidates/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCandidate(data);
            } else {
                toast.error('Failed to fetch candidate details');
            }
        } catch (error) {
            console.error('Error fetching candidate:', error);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading candidate details...</div>;
    if (!candidate) return <div className="p-8 text-center">Candidate not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/candidates" className="inline-flex items-center text-gray-600 hover:text-primary mb-6">
                    <FaArrowLeft className="mr-2" /> Back to Candidates
                </Link>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-10 text-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    {candidate.user.firstName} {candidate.user.lastName}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-gray-300">
                                    <span className="flex items-center gap-2">
                                        <FaBriefcase /> {candidate.profession.replace('_', ' ')}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <FaMapMarkerAlt /> {candidate.city}, {candidate.province}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <FaClock /> {candidate.yearsExperience} Years Exp.
                                    </span>
                                </div>
                            </div>
                            {candidate.cvUrl && (
                                <a
                                    href={candidate.cvUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 font-medium border border-white/20"
                                >
                                    <FaFilePdf /> Download CV
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Contact Info (Admin View) */}
                    <div className="px-8 py-6 bg-yellow-50 border-b border-yellow-100">
                        <h3 className="text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-4">
                            Private Contact Information (Admin Only)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                    <FaEnvelope />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email Address</p>
                                    <p className="font-medium">{candidate.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                    <FaPhone />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Phone Number</p>
                                    <p className="font-medium">{candidate.user.phoneNumber || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* About / Bio */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                                <div className="prose text-gray-600">
                                    {/* Assuming there's a bio or using questionnaire answers */}
                                    <p>
                                        {candidate.questionnaireAnswers?.bio ||
                                            candidate.questionnaireAnswers?.introduction ||
                                            "No bio provided."}
                                    </p>
                                </div>
                            </section>

                            {/* Experience & Qualifications */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Experience & Qualifications</h2>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <FaBriefcase className="text-primary" /> Previous Workplaces
                                        </h3>
                                        <ul className="list-disc list-inside text-gray-600 ml-2">
                                            {candidate.previousWorkplaces.map((place: string, i: number) => (
                                                <li key={i}>{place}</li>
                                            ))}
                                            {candidate.previousWorkplaces.length === 0 && <li>None listed</li>}
                                        </ul>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <FaGraduationCap className="text-primary" /> Qualifications
                                        </h3>
                                        <ul className="list-disc list-inside text-gray-600 ml-2">
                                            {candidate.qualifications.map((qual: string, i: number) => (
                                                <li key={i}>{qual}</li>
                                            ))}
                                            {candidate.qualifications.length === 0 && <li>None listed</li>}
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Questionnaire Answers */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Questionnaire Responses</h2>
                                <div className="space-y-4">
                                    {Object.entries(candidate.questionnaireAnswers || {}).map(([key, value]) => {
                                        if (key === 'bio' || key === 'introduction') return null;
                                        return (
                                            <div key={key} className="border-b border-gray-100 pb-2">
                                                <p className="text-sm font-medium text-gray-500 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                                <p className="text-gray-800 mt-1">
                                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Availability */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaCalendarAlt className="text-primary" /> Availability
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Available Days</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {candidate.availableDays.map((day: string) => (
                                                <span key={day} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                                                    {day}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Preferred Times</p>
                                        <p className="font-medium text-gray-900">{candidate.availableTimes || 'Flexible'}</p>
                                    </div>
                                    {candidate.urgentBookings && (
                                        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg text-sm font-medium">
                                            <FaClock /> Available for Urgent Jobs
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Specializations */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Specializations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.specializations.map((spec: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-primary/5 text-primary text-sm rounded-full border border-primary/10">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
