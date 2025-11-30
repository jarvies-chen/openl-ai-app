import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { generateExcel, Rule, Datatype, api, krakenDownload } from '@/lib/api';

interface DownloadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRules: Rule[];
    selectedDatatypes?: Datatype[];
    generatedRules?: string;
}

const DownloadDialog: React.FC<DownloadDialogProps> = ({
    isOpen,
    onClose,
    selectedRules,
    selectedDatatypes = [],
    generatedRules = ''
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('CapDentalLoss.rules');
    const [nameSpace, setNameSpace] = useState<string>('CapDentalLoss');

    const handleGenerate = async () => {
        if (!generatedRules) {
            setError("No generated rules found.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setDownloadUrl(null);

        try {
            // Call the krakenDownload API with the provided parameters
            const result = await krakenDownload({
                file_name: fileName,
                name_space: nameSpace,
                generated_rules: generatedRules
            });

            if (result && result.download_url) {
                // Prepend base URL if the result is a relative path
                const baseUrl = api.defaults.baseURL || '';
                const fullUrl = result.download_url.startsWith('http')
                    ? result.download_url
                    : `${baseUrl}${result.download_url}`;
                setDownloadUrl(fullUrl);
            } else {
                // Fallback simulation
                setDownloadUrl('#');
            }

        } catch (err) {
            setError('Failed to generate file. Please try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (downloadUrl) {
            window.open(downloadUrl, '_blank');
            onClose();
        }
    };

    const handleReset = () => {
        setDownloadUrl(null);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Download className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Download Kraken Rules</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {!downloadUrl ? (
                        <>
                            {/* File Name Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
                                <input
                                    type="text"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    placeholder="Enter file name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Name Space Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name Space</label>
                                <input
                                    type="text"
                                    value={nameSpace}
                                    onChange={(e) => setNameSpace(e.target.value)}
                                    placeholder="Enter name space"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>          

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !generatedRules}
                                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet className="w-5 h-5" />
                                        Generate File
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        /* Download Ready */
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Generation Complete!</h3>
                                <p className="text-gray-600 text-sm">
                                    Your Kraken rules file is ready for download.
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="text-sm text-gray-700 space-y-1">
                                    <div>File Name: <span className="font-medium">{fileName}</span></div>
                                    <div>Name Space: <span className="font-medium">{nameSpace}</span></div>
                                    <div>Rules Included: <span className="font-medium">{selectedRules.length}</span></div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleDownload}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    <Download className="w-5 h-5" />
                                    Download File
                                </button>
                                
                                <button
                                    onClick={handleReset}
                                    className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
                                >
                                    Generate Another File
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DownloadDialog;