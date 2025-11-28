import React, { useEffect, useState } from 'react';
import { X, History, RotateCcw, Loader2 } from 'lucide-react';
import { Rule, RuleHistoryEntry, getRuleHistory } from '@/lib/api';

interface RuleHistoryModalProps {
    filename: string;
    rule: Rule;
    onClose: () => void;
    onRollback: (rule: Rule) => void;
}

const RuleHistoryModal: React.FC<RuleHistoryModalProps> = ({ filename, rule, onClose, onRollback }) => {
    const [history, setHistory] = useState<RuleHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getRuleHistory(filename, rule.id);
                // Sort by version descending (newest first)
                setHistory(data.sort((a, b) => b.version - a.version));
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [filename, rule.id]);

    const handleRollback = (entry: RuleHistoryEntry) => {
        if (confirm(`Are you sure you want to rollback this rule to Version ${entry.version}?`)) {
            onRollback(entry.rule);
            onClose();
        }
    };

    const renderDiff = (current: Rule, previous: Rule | null) => {
        if (!previous) {
            return (
                <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                    <span className="font-semibold">New Rule Created</span>
                    <div className="mt-1 font-mono text-xs">{current.condition || "(No condition)"}</div>
                </div>
            );
        }

        const changes: React.ReactNode[] = [];

        if (current.condition !== previous.condition) {
            changes.push(
                <div key="condition" className="mb-2">
                    <div className="text-xs font-semibold text-gray-500 mb-1">Condition Changed:</div>
                    <div className="grid grid-cols-1 gap-1 text-xs font-mono">
                        <div className="bg-red-50 text-red-700 p-1 rounded line-through opacity-75">
                            {previous.condition || "(Empty)"}
                        </div>
                        <div className="bg-green-50 text-green-700 p-1 rounded">
                            {current.condition || "(Empty)"}
                        </div>
                    </div>
                </div>
            );
        }

        if (current.rule_type !== previous.rule_type) {
            changes.push(
                <div key="type" className="mb-2 text-xs">
                    <span className="font-semibold text-gray-500">Type Changed: </span>
                    <span className="text-red-600 line-through mr-2">{previous.rule_type}</span>
                    <span className="text-green-600">{current.rule_type}</span>
                </div>
            );
        }

        if (current.summary !== previous.summary) {
            changes.push(
                <div key="summary" className="mb-2 text-xs">
                    <div className="font-semibold text-gray-500 mb-1">Summary Updated:</div>
                    <div className="text-gray-600 italic">"{current.summary}"</div>
                </div>
            );
        }

        if (changes.length === 0) {
            return <div className="text-sm text-gray-500 italic">No changes in this version.</div>;
        }

        return <div>{changes}</div>;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg text-gray-900">History: {rule.id}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No history found for this rule.</p>
                    ) : (
                        <div className="space-y-6">
                            {history.map((entry, index) => {
                                // Find previous version (since sorted descending, it's the next item)
                                const previousEntry = index < history.length - 1 ? history[index + 1] : null;

                                return (
                                    <div key={entry.version} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Version {entry.version}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {new Date(entry.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleRollback(entry)}
                                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 font-medium border border-gray-300 rounded px-2 py-1 hover:border-blue-300 transition-colors"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                Rollback
                                            </button>
                                        </div>

                                        {entry.comments && (
                                            <div className="mb-3 text-sm text-gray-600 italic bg-gray-100 p-2 rounded">
                                                "{entry.comments}"
                                            </div>
                                        )}

                                        <div className="space-y-2 mt-3 pl-2 border-l-2 border-gray-200">
                                            {renderDiff(entry.rule, previousEntry ? previousEntry.rule : null)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RuleHistoryModal;
