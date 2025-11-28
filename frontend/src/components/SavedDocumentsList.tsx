import React, { useEffect, useState } from 'react';
import { DocumentSummary, getDocuments } from '@/lib/api';
import { FileText, Clock, ChevronRight } from 'lucide-react';

interface SavedDocumentsListProps {
    onSelectDocument: (filename: string) => void;
}

const SavedDocumentsList: React.FC<SavedDocumentsListProps> = ({ onSelectDocument }) => {
    const [documents, setDocuments] = useState<DocumentSummary[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const data = await getDocuments();
            // Sort by latest version creation date
            setDocuments(data.sort((a, b) => {
                const dateA = a.latest_version ? new Date(a.latest_version.created_at).getTime() : 0;
                const dateB = b.latest_version ? new Date(b.latest_version.created_at).getTime() : 0;
                return dateB - dateA;
            }));
        } catch (error) {
            console.error("Failed to load documents", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-8 text-gray-500">Loading saved documents...</div>;
    if (documents.length === 0) return null;

    return (
        <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Saved Documents
            </h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100">
                    {documents.map((doc) => (
                        <button
                            key={doc.base_filename}
                            onClick={() => onSelectDocument(doc.base_filename)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{doc.base_filename}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {doc.latest_version ? new Date(doc.latest_version.created_at).toLocaleDateString() : 'Unknown'}
                                        </span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium text-gray-600">
                                            {doc.version_count} Version{doc.version_count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SavedDocumentsList;
