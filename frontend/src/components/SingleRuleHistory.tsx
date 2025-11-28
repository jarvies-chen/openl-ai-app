import React, { useEffect, useState } from 'react';
import { VersionMetadata, getVersions, getDiff, Rule, DiffResult } from '@/lib/api';
import { X, ArrowRight } from 'lucide-react';

interface SingleRuleHistoryProps {
    filename: string;
    rule: Rule;
    onClose: () => void;
}

const SingleRuleHistory: React.FC<SingleRuleHistoryProps> = ({ filename, rule, onClose }) => {
    const [versions, setVersions] = useState<VersionMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [comparingVersion, setComparingVersion] = useState<number | null>(null);
    const [diff, setDiff] = useState<any | null>(null); // Specific diff for this rule
    const [loadingDiff, setLoadingDiff] = useState(false);

    useEffect(() => {
        loadVersions();
    }, [filename]);

    const loadVersions = async () => {
        setLoading(true);
        try {
            const data = await getVersions(filename);
            setVersions(data.sort((a, b) => b.version - a.version));
        } catch (error) {
            console.error("Failed to load versions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = async (version: number) => {
        setComparingVersion(version);
        setLoadingDiff(true);
        setDiff(null);
        try {
            // We assume current rules are "latest" or "draft". 
            // But getDiff expects two version numbers.
            // If we haven't saved the current draft as a version, we can't use getDiff easily against "current".
            // However, usually "Single Rule History" implies looking at *saved* history.
            // Let's assume we are comparing the Selected Version against the *Previous* Version (or Next).

            // Actually, the user probably wants to see how this rule changed in Version X compared to Version X-1.
            // Or compare Current Draft (if not saved) vs Version X.

            // For simplicity, let's assume we are comparing Version X vs Version X-1.
            // If version is 1, no comparison.

            if (version <= 1) {
                setDiff({ type: 'initial', message: 'Initial version' });
                return;
            }

            const result = await getDiff(filename, version - 1, version);

            // Find this rule in the diff
            // Rule ID matching
            const added = result.added.find(r => r.id === rule.id);
            const removed = result.removed.find(r => r.id === rule.id);
            const modified = result.modified.find(m => m.rule.id === rule.id);

            if (added) {
                setDiff({ type: 'added', rule: added });
            } else if (removed) {
                setDiff({ type: 'removed', rule: removed });
            } else if (modified) {
                setDiff({ type: 'modified', changes: modified.changes });
            } else {
                setDiff({ type: 'unchanged', message: 'No changes in this version' });
            }

        } catch (error) {
            console.error("Failed to load diff", error);
        } finally {
            setLoadingDiff(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Rule History</h3>
                        <p className="text-sm text-gray-500">History for: <span className="font-medium text-gray-700">{rule.name || rule.id}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white flex gap-6">
                    {/* Version List */}
                    <div className="w-1/3 border-r border-gray-200 pr-4 space-y-2">
                        <h4 className="font-semibold text-gray-700 mb-2">Versions</h4>
                        {loading ? (
                            <div className="text-sm text-gray-500">Loading...</div>
                        ) : (
                            versions.map(v => (
                                <button
                                    key={v.version}
                                    onClick={() => handleCompare(v.version)}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${comparingVersion === v.version
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                        }`}
                                >
                                    <div className="font-medium">Version {v.version}</div>
                                    <div className="text-xs text-gray-500 mt-1">{new Date(v.created_at).toLocaleDateString()}</div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Diff Content */}
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-700 mb-4">
                            {comparingVersion ? `Changes in Version ${comparingVersion}` : 'Select a version to see changes'}
                        </h4>

                        {loadingDiff && <div className="text-sm text-gray-500">Loading changes...</div>}

                        {!loadingDiff && diff && (
                            <div className="space-y-4">
                                {diff.type === 'initial' && (
                                    <div className="text-gray-500 italic">This is the first version. Rule was created.</div>
                                )}

                                {diff.type === 'unchanged' && (
                                    <div className="text-gray-500 italic">No changes to this rule in this version.</div>
                                )}

                                {diff.type === 'added' && (
                                    <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
                                        <div className="font-medium flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Rule Added
                                        </div>
                                    </div>
                                )}

                                {diff.type === 'removed' && (
                                    <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200">
                                        <div className="font-medium flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            Rule Removed
                                        </div>
                                    </div>
                                )}

                                {diff.type === 'modified' && (
                                    <div className="space-y-3">
                                        <div className="font-medium text-yellow-800 flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                            Rule Modified
                                        </div>

                                        {Object.entries(diff.changes).map(([field, change]: [string, any]) => (
                                            <div key={field} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                                                <div className="font-medium text-gray-700 mb-1 capitalize">{field}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-red-50 text-red-700 p-2 rounded break-all">
                                                        {JSON.stringify(change.old)}
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                                    <div className="flex-1 bg-green-50 text-green-700 p-2 rounded break-all">
                                                        {JSON.stringify(change.new)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleRuleHistory;
