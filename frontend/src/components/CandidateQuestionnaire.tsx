import React, { useState } from 'react';

interface Question {
    id: string;
    text: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect' | 'boolean';
    options?: string[];
    required?: boolean;
}

interface Section {
    title: string;
    questions: Question[];
}

type Profession = 
    | 'HAIRDRESSER' 
    | 'NAIL_TECH' 
    | 'MASSAGE_THERAPIST'
    | 'MAKEUP_ARTIST'
    | 'BARBER'
    | 'ESTHETICIAN'
    | 'LASH_TECH'
    | 'BROW_ARTIST'
    | 'SPA_THERAPIST'
    | 'SALON_MANAGER'
    | 'RECEPTIONIST'
    | 'BEAUTY_THERAPIST';

interface CandidateQuestionnaireProps {
    profession: Profession;
    onComplete: (answers: any) => void;
}

export default function CandidateQuestionnaire({ profession, onComplete }: CandidateQuestionnaireProps) {
    const [currentSection, setCurrentSection] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});

    // Define questions based on the user request
    const universalQuestions: Section = {
        title: 'Experience & Background',
        questions: [
            { id: 'yearsExperience', text: 'How many years of experience do you have in your field?', type: 'text', required: true },
            { id: 'qualifications', text: 'What qualifications or certificates do you hold?', type: 'textarea', required: true },
            { id: 'previousWorkplaces', text: 'Where have you worked previously?', type: 'textarea' },
            { id: 'specializations', text: 'Which services do you specialize in?', type: 'textarea', required: true },
        ]
    };

    const workQualityQuestions: Section = {
        title: 'Work Quality & Professionalism',
        questions: [
            { id: 'clientSatisfaction', text: 'How do you ensure your clients are satisfied with your service?', type: 'textarea' },
            { id: 'difficultClients', text: 'How do you handle difficult or unhappy clients?', type: 'textarea' },
            { id: 'stayUpdated', text: 'Do you stay updated with new trends and techniques? How?', type: 'textarea' },
            { id: 'uniqueSellingPoint', text: 'What makes your service different from others?', type: 'textarea' },
        ]
    };

    const availabilityQuestions: Section = {
        title: 'Availability & Flexibility',
        questions: [
            { id: 'availableTimes', text: 'What days and times are you available to work?', type: 'textarea', required: true },
            { id: 'urgentBookings', text: 'Are you available for urgent or last-minute bookings?', type: 'boolean' },
            { id: 'weekendsHolidays', text: 'Are you open to working on weekends and holidays?', type: 'boolean' },
            { id: 'mobileWork', text: 'Can you travel to clients (mobile work), or do you only work from a salon?', type: 'select', options: ['Salon Only', 'Mobile Only', 'Both'] },
        ]
    };

    const toolsQuestions: Section = {
        title: 'Tools, Products & Hygiene',
        questions: [
            { id: 'ownTools', text: 'Do you have your own tools and equipment?', type: 'boolean' },
            { id: 'preferredProducts', text: 'What products do you prefer to use?', type: 'textarea' },
            { id: 'hygieneProtocol', text: 'How do you maintain hygiene and sanitize tools?', type: 'textarea', required: true },
            { id: 'healthSafetyKnowledge', text: 'Are you familiar with health and safety regulations?', type: 'boolean' },
        ]
    };

    const communicationQuestions: Section = {
        title: 'Communication & Client Management',
        questions: [
            { id: 'communicationStyle', text: 'How do you communicate with clients before and after appointments?', type: 'textarea' },
            { id: 'upselling', text: 'Do you upsell or recommend additional treatments?', type: 'boolean' },
            { id: 'peakTimeManagement', text: 'How do you handle peak times and appointment overlaps?', type: 'textarea' },
        ]
    };

    const pricingQuestions: Section = {
        title: 'Salary / Commission / Pricing',
        questions: [
            { id: 'expectedEarnings', text: 'What are your expected earnings or commission structure?', type: 'text' },
            { id: 'servicePrices', text: 'What are your prices for your main services?', type: 'textarea' },
            { id: 'negotiablePricing', text: 'Are you open to negotiating your pricing depending on the location?', type: 'boolean' },
        ]
    };

    const roleSpecificQuestions: Record<string, Section> = {
        HAIRDRESSER: {
            title: 'Hairdresser Specifics',
            questions: [
                { id: 'cuttingTechniques', text: 'Which hair cutting techniques are you most confident in?', type: 'textarea' },
                { id: 'hairTypes', text: 'Can you cut both caucasian and afro-textured hair?', type: 'select', options: ['Caucasian Only', 'Afro-textured Only', 'Both'] },
                { id: 'coloringTechniques', text: 'What coloring techniques do you specialize in? (Balayage, highlights, tinting, etc.)', type: 'textarea' },
                { id: 'chemicalTreatments', text: 'Do you do chemical treatments? (Botox, keratin, relaxers, perms)', type: 'boolean' },
                { id: 'protectiveHairstyles', text: 'Can you do protective hairstyles? (Braids, twists, weaves)', type: 'boolean' },
                { id: 'childrenHair', text: 'Are you comfortable with children’s hair?', type: 'boolean' },
            ]
        },
        NAIL_TECH: {
            title: 'Nail Tech Specifics',
            questions: [
                { id: 'nailSystems', text: 'Which nail systems do you work with? (Acrylic, gel, builder gel, dip powder, etc.)', type: 'textarea' },
                { id: 'nailArt', text: 'Can you do advanced nail art?', type: 'boolean' },
                { id: 'applicationTime', text: 'What is your fastest full set application time?', type: 'text' },
                { id: 'removalMethod', text: 'How do you remove products safely without damaging the natural nail?', type: 'textarea' },
                { id: 'eFile', text: 'Do you use an e-file?', type: 'boolean' },
            ]
        },
        MASSAGE_THERAPIST: {
            title: 'Massage Therapist Specifics',
            questions: [
                { id: 'massageStyles', text: 'Which massage styles are you trained in?', type: 'textarea' },
                { id: 'pressureLevels', text: 'What pressure levels are you comfortable with?', type: 'text' },
                { id: 'addOns', text: 'Do you offer add-ons like cupping, scrubs, reflexology?', type: 'boolean' },
                { id: 'clientInjuries', text: 'How do you handle clients with injuries or medical conditions?', type: 'textarea' },
            ]
        }
    };

    const sections = [
        universalQuestions,
        workQualityQuestions,
        availabilityQuestions,
        toolsQuestions,
        communicationQuestions,
        pricingQuestions,
        roleSpecificQuestions[profession]
    ].filter(Boolean) as Section[];

    const handleInputChange = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleNext = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            onComplete(answers);
        }
    };

    const handleBack = () => {
        if (currentSection > 0) {
            setCurrentSection(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const currentSectionData = sections[currentSection];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{currentSectionData.title}</h2>
                    <span className="text-sm text-gray-500">Step {currentSection + 1} of {sections.length}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="space-y-6">
                {currentSectionData.questions.map((question) => (
                    <div key={question.id} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {question.text} {question.required && <span className="text-red-500">*</span>}
                        </label>

                        {question.type === 'text' && (
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                            />
                        )}

                        {question.type === 'textarea' && (
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                            />
                        )}

                        {question.type === 'boolean' && (
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={question.id}
                                        checked={answers[question.id] === true}
                                        onChange={() => handleInputChange(question.id, true)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={question.id}
                                        checked={answers[question.id] === false}
                                        onChange={() => handleInputChange(question.id, false)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                        )}

                        {question.type === 'select' && question.options && (
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                            >
                                <option value="">Select an option</option>
                                {question.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-between">
                <button
                    onClick={handleBack}
                    disabled={currentSection === 0}
                    className={`px-6 py-2 rounded-lg font-medium ${currentSection === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    {currentSection === sections.length - 1 ? 'Submit' : 'Next'}
                </button>
            </div>
        </div>
    );
}
