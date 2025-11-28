import React from 'react';
import { DiffResult, Rule } from '@/lib/api';

interface DiffViewProps {
    diff: DiffResult;
    onClose: () => void;
}

const DiffView: React.FC<DiffViewProps> = ({ diff, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Version Comparison</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                    {/* Added Rules */}
                    {diff.added.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                                <span className="bg-green-100 p-1 rounded mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </span>
                                Added Rules ({diff.added.length})
                            </h3>
                            <div className="space-y-3">
                                {diff.added.map((rule) => (
                                    <div key={rule.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="font-medium text-green-900">{rule.name || 'Unnamed Rule'}</div>
                                        <div className="text-sm text-green-800 mt-1">{rule.summary}</div>
                                        <div className="text-xs text-green-600 mt-2 font-mono bg-green-100 p-2 rounded">
                                            {rule.condition}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Removed Rules */}
                    {diff.removed.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                                <span className="bg-red-100 p-1 rounded mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </span>
                                Removed Rules ({diff.removed.length})
                            </h3>
                            <div className="space-y-3">
                                {diff.removed.map((rule) => (
                                    <div key={rule.id} className="bg-red-50 border border-red-200 rounded-lg p-4 opacity-75">
                                        <div className="font-medium text-red-900 line-through">{rule.name || 'Unnamed Rule'}</div>
                                        <div className="text-sm text-red-800 mt-1">{rule.summary}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Modified Rules */}
                    {diff.modified.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center">
                                <span className="bg-yellow-100 p-1 rounded mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </span>
                                Modified Rules ({diff.modified.length})
                            </h3>
                            <div className="space-y-4">
                                {diff.modified.map((item, idx) => (
                                    <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="font-medium text-yellow-900 mb-2">{item.rule.name || 'Unnamed Rule'}</div>
                                        <div className="text-sm text-yellow-800 mb-3">{item.rule.summary}</div>

                                        <div className="bg-white rounded border border-yellow-200 overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-red-500 uppercase">Old Value</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-green-500 uppercase">New Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {Object.entries(item.changes).map(([field, change]) => (
                                                        <tr key={field}>
                                                            <td className="px-4 py-2 font-medium text-gray-900">{field}</td>
                                                            <td className="px-4 py-2 text-red-600 bg-red-50 font-mono text-xs break-all">
                                                                {JSON.stringify(change.old)}
                                                            </td>
                                                            <td className="px-4 py-2 text-green-600 bg-green-50 font-mono text-xs break-all">
                                                                {JSON.stringify(change.new)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No differences found between these versions.
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiffView;
