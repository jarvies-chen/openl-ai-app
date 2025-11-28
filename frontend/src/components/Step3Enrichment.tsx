import React, { useState } from 'react';
import { Rule, Datatype } from '@/lib/api';
import { ArrowRight, Code, Database, Edit2, Check, Save, CheckCircle, Circle, Eye, History } from 'lucide-react';
import SourceTextModal from './SourceTextModal';
import CommentModal from './CommentModal';
import RuleHistoryModal from './RuleHistoryModal';

interface Step3EnrichmentProps {
    rules: Rule[];
    datatypes: Datatype[];
    onUpdateRule: (rule: Rule) => void;
    onNext: () => void;
    onSave: (comment: string) => void;
    loading: boolean;
    fullText: string;
    filename: string;
}

const Step3Enrichment: React.FC<Step3EnrichmentProps> = ({ rules, datatypes, onUpdateRule, onNext, onSave, loading, fullText, filename }) => {
    const [viewSourceRule, setViewSourceRule] = useState<Rule | null>(null);
    const [historyRule, setHistoryRule] = useState<Rule | null>(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [activeUpdateRule, setActiveUpdateRule] = useState<Rule | null>(null);

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

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Enrich & Review Rules</h2>
                    <p className="text-gray-500">Select rules to include, review OpenL conditions, and edit if necessary.</p>
                </div>
            </div>

            <div className="space-y-6 mb-8">
                {rules.map((rule) => (
                    <div key={rule.id} className={`bg-white rounded-xl border transition-all ${rule.selected ? 'border-blue-200 shadow-md' : 'border-gray-200 shadow-sm hover:border-blue-300'
                        }`}>
                        {/* Header Section */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={rule.selected}
                                    onChange={() => toggleRuleSelection(rule.id)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="font-mono text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">
                                    {rule.id}
                                </span>
                                <h3 className="font-medium text-gray-900">{rule.name || "Unnamed Rule"}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleRuleUpdateClick(rule)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                    title="Update this rule"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Update
                                </button>
                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                <button
                                    onClick={() => setHistoryRule(rule)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View History"
                                >
                                    <History className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewSourceRule(rule)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
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
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">OpenL Implementation</div>
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
                                            className="w-full text-sm font-mono border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
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

            <div className="flex justify-end gap-3 sticky bottom-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-lg">
                <button
                    onClick={onNext}
                    disabled={loading || rules.filter(r => r.selected).length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm font-medium"
                >
                    {loading ? 'Generating Excel...' : 'Generate Excel'}
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

export default Step3Enrichment;
