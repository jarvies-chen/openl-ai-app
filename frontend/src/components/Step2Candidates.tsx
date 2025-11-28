import React, { useState } from 'react';
import { CandidateRule } from '@/lib/api';
import { ArrowRight, FileText, Eye } from 'lucide-react';
import SourceTextModal from './SourceTextModal';

interface Step2CandidatesProps {
    candidates: CandidateRule[];
    onNext: () => void;
    loading: boolean;
    fullText: string;
}

const Step2Candidates: React.FC<Step2CandidatesProps> = ({ candidates, onNext, loading, fullText }) => {
    const [viewSourceRule, setViewSourceRule] = useState<CandidateRule | null>(null);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Review Candidate Rules</h2>
                <p className="text-gray-500">Review the extracted rules below before proceeding to enrichment.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
                <div className="divide-y divide-gray-100">
                    {candidates.map((rule) => (
                        <div key={rule.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            {rule.id}
                                        </span>
                                        <button
                                            onClick={() => setViewSourceRule(rule)}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Source
                                        </button>
                                    </div>
                                    <p className="text-gray-900 leading-relaxed">{rule.summary}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onNext}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm font-medium"
                >
                    {loading ? 'Enriching Rules...' : 'Next: Enrich Rules'}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
            </div>

            {viewSourceRule && (
                <SourceTextModal
                    text={fullText}
                    highlight={viewSourceRule.source_text}
                    onClose={() => setViewSourceRule(null)}
                />
            )}
        </div>
    );
};

export default Step2Candidates;
