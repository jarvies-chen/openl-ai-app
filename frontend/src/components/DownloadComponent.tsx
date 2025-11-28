'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { generateExcel, Rule, Datatype, api } from '@/lib/api';

interface DownloadComponentProps {
    selectedRules: Rule[];
    selectedDatatypes?: Datatype[];
}

export default function DownloadComponent({
    selectedRules,
    selectedDatatypes = []
}: DownloadComponentProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (selectedRules.length === 0 && selectedDatatypes.length === 0) {
            setError("Please select at least one rule or datatype.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setDownloadUrl(null);

        try {
            const result = await generateExcel(selectedRules, selectedDatatypes);

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
            setError('Failed to generate Excel file. Please try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full max-w-md text-center">
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {!downloadUrl ? (
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || (selectedRules.length === 0 && selectedDatatypes.length === 0)}
                    className={`
            flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-white transition-all
            ${isGenerating
                            ? 'bg-blue-400 cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        }
            disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none
          `}
                >
                    {isGenerating ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            Generating OpenL Excel...
                        </>
                    ) : (
                        <>
                            <FileSpreadsheet className="w-5 h-5" />
                            Generate Excel File
                        </>
                    )}
                </button>
            ) : (
                <div className="animate-in fade-in zoom-in duration-300">
                    <div className="mb-4 text-green-600 flex items-center justify-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Generation Complete!</span>
                    </div>
                    <a
                        href={downloadUrl}
                        download="OpenL_Rules.xlsx" // This attribute works if downloadUrl is a blob or file link
                        className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 shadow-lg transition-all"
                    >
                        <Download className="w-5 h-5" />
                        Download .xlsx File
                    </a>
                    <button
                        onClick={() => setDownloadUrl(null)}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Generate Another
                    </button>
                </div>
            )}
        </div>
    );
}
