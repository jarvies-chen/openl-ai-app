import React, { useState } from 'react';
import { CandidateRule } from '@/lib/api';
import { ArrowRight, FileText, Eye, Zap, CheckCircle, X } from 'lucide-react';
import SourceTextModal from './SourceTextModal';

interface KrakenCandidatesComponentProps {
    candidates: CandidateRule[];
    onNext: () => void;
    onGenerateKrakenRules: () => void;
    loading: boolean;
    fullText: string;
}

const KrakenCandidatesComponent: React.FC<KrakenCandidatesComponentProps> = ({ candidates, onNext, onGenerateKrakenRules, loading, fullText }) => {
    const [viewSourceRule, setViewSourceRule] = useState<CandidateRule | null>(null);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Kraken Rules Review</h1>
                </div>
                <p className="text-gray-600 text-lg">Review the extracted business rules before optimization</p>
            </div>

            {/* Rules List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Extracted Business Rules</h3>
                    <p className="text-sm text-gray-600">Review each rule and verify accuracy</p>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {candidates.map((rule, index) => (
                        <div key={rule.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-500">Rule #{index + 1}</span>
                                            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                {rule.id}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setViewSourceRule(rule)}
                                            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Source
                                        </button>
                                    </div>
                                    <p className="text-gray-900 leading-relaxed text-lg">{rule.summary}</p>
                                    {rule.source_text && (
                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 italic">
                                                "{rule.source_text.substring(0, 200)}{rule.source_text.length > 200 ? '...' : ''}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-center">
                <button
                    onClick={onGenerateKrakenRules}
                    disabled={loading}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-medium text-lg"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating Kraken Rules...
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5" />
                            Generate Kraken Rules
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>

            {/* Source Text Modal */}
            {viewSourceRule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-lg text-gray-900">Source Text</h3>
                            <button onClick={() => setViewSourceRule(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 leading-relaxed">
                            <div className="whitespace-pre-wrap">{viewSourceRule.source_text}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KrakenCandidatesComponent;