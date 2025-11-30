import React, { useEffect, useState } from 'react';
import { DocumentSummary, getDocuments, deleteDocument } from '@/lib/api';
import { FileText, Clock, ChevronRight, Trash2, Plus } from 'lucide-react';

interface OverviewPageProps {
    onSelectDocument: (filename: string) => void;
    onNewDocument: () => void;
    onNewKrakenDocument: () => void;
}

const OverviewPage: React.FC<OverviewPageProps> = ({ onSelectDocument, onNewDocument, onNewKrakenDocument }) => {
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

    const handleDelete = async (e: React.MouseEvent, filename: string) => {
        e.stopPropagation(); // Prevent opening the document
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

        try {
            await deleteDocument(filename);
            await loadDocuments(); // Refresh list
        } catch (error) {
            console.error("Failed to delete document", error);
            alert("Failed to delete document");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">OpenL Rules Manager</h1>
                    <p className="text-gray-500 mt-1">Manage your insurance policy documents and rules</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onNewDocument}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        New Document
                    </button>
                    <button
                        onClick={onNewKrakenDocument}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        New Kraken Document
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading documents...</div>
            ) : documents.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
                    <p className="text-gray-500 mt-1 mb-6">Upload a policy document to get started</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onNewDocument}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Upload your first document
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            onClick={onNewKrakenDocument}
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            Create Kraken document
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100">
                        {documents.map((doc) => (
                            <div
                                key={doc.base_filename}
                                onClick={() => onSelectDocument(doc.base_filename)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-lg">{doc.base_filename}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {doc.latest_version ? new Date(doc.latest_version.created_at).toLocaleDateString() : 'Unknown'}
                                            </span>
                                            <span className="bg-gray-100 px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600">
                                                {doc.version_count} Version{doc.version_count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={(e) => handleDelete(e, doc.base_filename)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete document"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverviewPage;
