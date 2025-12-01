import React from 'react';
import { X, PlusCircle, MinusCircle, Edit3 } from 'lucide-react';
import { DiffResult } from '@/lib/api';

interface DiffModalProps {
    isOpen: boolean;
    diff: DiffResult | null;
    onClose: () => void;
    versionOld: number;
    versionNew: number;
}

const DiffModal: React.FC<DiffModalProps> = ({ isOpen, diff, onClose, versionOld, versionNew }) => {
    if (!isOpen || !diff) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg text-gray-900">
                            Diff: Version {versionOld} → Version {versionNew}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Summary */}
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                                <PlusCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">Added</span>
                            </div>
                            <div className="text-2xl font-bold text-green-800 mt-1">{diff.added.length}</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2">
                                <MinusCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium text-red-700">Removed</span>
                            </div>
                            <div className="text-2xl font-bold text-red-800 mt-1">{diff.removed.length}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-700">Modified</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-800 mt-1">{diff.modified.length}</div>
                        </div>
                    </div>

                    {/* Added Rules */}
                    {diff.added.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1">
                                <PlusCircle className="w-4 h-4" />
                                Added Rules
                            </h4>
                            <div className="space-y-3">
                                {diff.added.map((rule) => (
                                    <div key={rule.id} className="border border-green-200 bg-green-50 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-mono text-xs font-medium text-green-800 bg-white border border-green-300 px-2 py-1 rounded">
                                                    {rule.id}
                                                </span>
                                                <h5 className="font-medium text-gray-900 mt-1">{rule.name || "Unnamed Rule"}</h5>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-700">{rule.summary}</div>
                                        {rule.condition && (
                                            <div className="mt-2">
                                                <div className="text-xs font-semibold text-gray-500 mb-1">Condition:</div>
                                                <div className="bg-white p-2 rounded text-xs font-mono text-gray-800">
                                                    {rule.condition}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Removed Rules */}
                    {diff.removed.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1">
                                <MinusCircle className="w-4 h-4" />
                                Removed Rules
                            </h4>
                            <div className="space-y-3">
                                {diff.removed.map((rule) => (
                                    <div key={rule.id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-mono text-xs font-medium text-red-800 bg-white border border-red-300 px-2 py-1 rounded">
                                                    {rule.id}
                                                </span>
                                                <h5 className="font-medium text-gray-900 mt-1">{rule.name || "Unnamed Rule"}</h5>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-700">{rule.summary}</div>
                                        {rule.condition && (
                                            <div className="mt-2">
                                                <div className="text-xs font-semibold text-gray-500 mb-1">Condition:</div>
                                                <div className="bg-white p-2 rounded text-xs font-mono text-gray-800 line-through">
                                                    {rule.condition}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Modified Rules */}
                    {diff.modified.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-1">
                                <Edit3 className="w-4 h-4" />
                                Modified Rules
                            </h4>
                            <div className="space-y-4">
                                {diff.modified.map(({ rule, changes }) => (
                                    <div key={rule.id} className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="font-mono text-xs font-medium text-blue-800 bg-white border border-blue-300 px-2 py-1 rounded">
                                                    {rule.id}
                                                </span>
                                                <h5 className="font-medium text-gray-900 mt-1">{rule.name || "Unnamed Rule"}</h5>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-700 mb-3">{rule.summary}</div>
                                        
                                        {/* Changes */}
                                        <div className="space-y-3">
                                            {Object.entries(changes).map(([field, { old: oldValue, new: newValue }]) => (
                                                <div key={field} className="bg-white rounded p-2 border border-gray-200">
                                                    <div className="text-xs font-semibold text-gray-500 mb-1 capitalize">
                                                        {field} changed:
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-1 text-xs font-mono">
                                                        <div className="bg-red-50 text-red-700 p-1 rounded line-through opacity-75">
                                                            {oldValue || "(Empty)"}
                                                        </div>
                                                        <div className="bg-green-50 text-green-700 p-1 rounded">
                                                            {newValue || "(Empty)"}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Changes */}
                    {diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No changes between these versions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiffModal;