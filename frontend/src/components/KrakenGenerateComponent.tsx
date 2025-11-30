'use client';

import React, { useState } from 'react';
import { Rule, Datatype } from '@/lib/api';
import { ArrowRight, Code, Database, Edit2, Check, Save, CheckCircle, Circle, Eye, History, Download, Zap } from 'lucide-react';
import SourceTextModal from './SourceTextModal';
import CommentModal from './CommentModal';
import RuleHistoryModal from './RuleHistoryModal';
import KrakenDownloadDialog from './KrakenDownloadDialog';

interface KrakenGenerateComponentProps {
    rules: Rule[];
    datatypes: Datatype[];
    onUpdateRule: (rule: Rule) => void;
    onNext: () => void;
    onSave: (comment: string) => void;
    loading: boolean;
    fullText: string;
    filename: string;
    generatedKrakenRules: string;
}

const KrakenGenerateComponent: React.FC<KrakenGenerateComponentProps> = ({ rules, datatypes, onUpdateRule, onNext, onSave, loading, fullText, filename, generatedKrakenRules }) => {
    const [viewSourceRule, setViewSourceRule] = useState<Rule | null>(null);
    const [historyRule, setHistoryRule] = useState<Rule | null>(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [activeUpdateRule, setActiveUpdateRule] = useState<Rule | null>(null);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);

    const toggleRuleSelection = (ruleId: string) => {
        const rule = rules.find(r => r.id === ruleId);
        if (rule) {
            onUpdateRule({ ...rule, selected: !rule.selected });
        }
    };

    const updateRule = (ruleId: string, field: keyof Rule, value: any) => {
        const rule = rules.find(r => r.id === ruleId);
        if (rule) {
            onUpdateRule({ ...rule, [field]: value });
        }
    };

    const handleRuleUpdateClick = (rule: Rule) => {
        setActiveUpdateRule(rule);
        setShowCommentModal(true);
    };

    const handleConfirmUpdate = (comment: string) => {
        // If no comment provided, default to "Updated {RuleID}"
        const finalComment = comment.trim() || (activeUpdateRule ? `Updated ${activeUpdateRule.id}` : "Updated rules");
        onSave(finalComment);
        setShowCommentModal(false);
        setActiveUpdateRule(null);
    };

    const handleDownloadClick = () => {
        setShowDownloadDialog(true);
    };

    // Extract Kraken rules from the generated text, only show content between ```kraken and ```
    const extractKrakenRules = () => {
        if (!generatedKrakenRules) return '';
        
        const krakenRegex = /```kraken\n([\s\S]*?)```/g;
        const matches = generatedKrakenRules.match(krakenRegex);
        
        if (matches) {
            // Extract the content between the delimiters
            return matches.map(match => match.replace(/```kraken\n|```/g, '')).join('\n\n');
        }
        
        return '';
    };

    const krakenRulesContent = extractKrakenRules();

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header with Kraken branding */}
            <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Generate Kraken Rules</h1>
                </div>
            </div>

            <div className="space-y-6 mb-8">
                {rules.map((rule) => (
                    <div key={rule.id} className={`bg-white rounded-xl border transition-all ${rule.selected ? 'border-green-200 shadow-md' : 'border-gray-200 shadow-sm hover:border-green-300'}
                        }`}>
                        {/* Header Section */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={rule.selected}
                                    onChange={() => toggleRuleSelection(rule.id)}
                                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
                                />
                                <span className="font-mono text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">
                                    {rule.id}
                                </span>
                                <h3 className="font-medium text-gray-900">{rule.name || "Unnamed Rule"}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewSourceRule(rule)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    View Source
                                </button>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4 space-y-4">
                            {/* Summary */}
                            <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Summary</div>
                                <p className="text-gray-700 text-sm leading-relaxed">{rule.summary}</p>
                            </div>

                            {/* Technical Implementation */}
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kraken Implementation</div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rule.rule_type === 'DecisionTable'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {rule.rule_type || 'SmartRules'}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Condition</label>
                                        <textarea
                                            value={rule.condition || ''}
                                            onChange={(e) => updateRule(rule.id, 'condition', e.target.value)}
                                            className="w-full text-sm font-mono border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white"
                                            rows={2}
                                            placeholder="e.g. policy.type == 'Standard' && coverage.amount > 5000"
                                        />
                                    </div>

                                    {/* Related Datatypes */}
                                    {rule.related_datatypes && rule.related_datatypes.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Related Datatypes</label>
                                            <div className="flex flex-wrap gap-2">
                                                {rule.related_datatypes.map((dt, idx) => (
                                                    <span key={idx} className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                                                        {dt}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Generated Kraken Rules Display */}
            {krakenRulesContent && (
                <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Kraken Rule Content</h3>
                    </div>
                    <div className="p-6">
                        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-900 whitespace-pre-wrap">
                            {krakenRulesContent}
                        </pre>
                    </div>
                </div>
            )}

            <div className="flex justify-center mb-8">
                <button
                    onClick={handleDownloadClick}
                    disabled={loading || !krakenRulesContent}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-medium text-lg"
                >
                    <Download className="w-5 h-5" />
                    {loading ? 'Generating...' : 'Download Kraken Rules'}
                </button>
            </div>

            {/* Download Dialog */}
            <KrakenDownloadDialog
                isOpen={showDownloadDialog}
                onClose={() => setShowDownloadDialog(false)}
                selectedRules={rules.filter(r => r.selected)}
                selectedDatatypes={datatypes}
                generatedRules={krakenRulesContent}
            />

            {viewSourceRule && (
                <SourceTextModal
                    text={fullText}
                    highlight={viewSourceRule.source_text}
                    onClose={() => setViewSourceRule(null)}
                />
            )}

            <CommentModal
                isOpen={showCommentModal}
                onClose={() => setShowCommentModal(false)}
                onConfirm={handleConfirmUpdate}
                title={activeUpdateRule ? `Update ${activeUpdateRule.id}` : "Update Version"}
            />

            {historyRule && (
                <RuleHistoryModal
                    filename={filename}
                    rule={historyRule}
                    onClose={() => setHistoryRule(null)}
                    onRollback={(oldRule) => {
                        onUpdateRule(oldRule);
                        setHistoryRule(null);
                    }}
                />
            )}
        </div>
    );
};

export default KrakenGenerateComponent;