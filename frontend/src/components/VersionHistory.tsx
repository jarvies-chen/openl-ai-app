import React, { useEffect, useState } from 'react';
import { VersionMetadata, getVersions } from '@/lib/api';

interface VersionHistoryProps {
    filename: string;
    onCompare: (vOld: number, vNew: number) => void;
    currentVersion?: number;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ filename, onCompare, currentVersion }) => {
    const [versions, setVersions] = useState<VersionMetadata[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (filename) {
            loadVersions();
        }
    }, [filename]);

    const loadVersions = async () => {
        setLoading(true);
        try {
            const data = await getVersions(filename);
            // Sort by version descending
            setVersions(data.sort((a, b) => b.version - a.version));
        } catch (error) {
            console.error("Failed to load versions", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-sm text-gray-500">Loading history...</div>;
    if (versions.length === 0) return null;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Version History</h3>
            <div className="space-y-3">
                {versions.map((v, index) => (
                    <div key={v.version} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                        <div>
                            <div className="font-medium text-gray-900">
                                Version {v.version}
                                {index === 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Latest</span>}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {new Date(v.created_at).toLocaleString()}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Only show compare if there is a previous version */}
                            {index < versions.length - 1 && (
                                <button
                                    onClick={() => onCompare(versions[index + 1].version, v.version)}
                                    className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                                >
                                    Compare with v{versions[index + 1].version}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VersionHistory;
