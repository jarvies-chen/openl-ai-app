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
    selectedDatatypes = [],
    filename
}: DownloadComponentProps & { filename: string }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [createPr, setCreatePr] = useState(false);
    const [prMessage, setPrMessage] = useState<string | null>(null);
    const [mrUrl, setMrUrl] = useState<string | null>(null);
    const [autoDownloaded, setAutoDownloaded] = useState(false);

    const handleGenerate = async () => {
        if (selectedRules.length === 0 && selectedDatatypes.length === 0) {
            setError("Please select at least one rule or datatype.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setDownloadUrl(null);
        setPrMessage(null);
        setMrUrl(null);
        setAutoDownloaded(false);

        try {
            const result = await generateExcel(selectedRules, selectedDatatypes, createPr, filename);

            if (createPr) {
                // Handle Git/PR success
                if (result && result.message) {
                    setPrMessage(result.message);
                    if (result.mr_url) {
                        setMrUrl(result.mr_url);
                    }
                } else {
                    setPrMessage("Merge Request created successfully (details unavailable).");
                }
            } else {
                // Handle Download
                if (result && result.download_url) {
                    // Prepend base URL if the result is a relative path
                    const baseUrl = api.defaults.baseURL || '';
                    const fullUrl = result.download_url.startsWith('http')
                        ? result.download_url
                        : `${baseUrl}${result.download_url}`;
                    setDownloadUrl(fullUrl);

                    // Auto-download
                    const link = document.createElement('a');
                    link.href = fullUrl;
                    link.download = filename ? `${filename.replace(/\.[^/.]+$/, "")}.xlsx` : 'OpenL_Rules.xlsx';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setAutoDownloaded(true);
                } else {
                    // Fallback simulation
                    setDownloadUrl('#');
                }
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

            {!downloadUrl && !prMessage ? (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-center gap-2 mb-2 p-3 border border-blue-100 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setCreatePr(!createPr)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${createPr ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'}`}>
                            {createPr && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-gray-700 font-medium select-none">Create Merge Request</span>
                    </div>

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
                                {createPr ? 'Creating Merge Request...' : 'Generating OpenL Excel...'}
                            </>
                        ) : (
                            <>
                                <FileSpreadsheet className="w-5 h-5" />
                                {createPr ? 'Generate & Create PR' : 'Generate Excel File'}
                            </>
                        )}
                    </button>
                    {createPr && (
                        <p className="text-xs text-gray-500 mt-1">
                            File will be pushed to branch 'openl-ai-demo' and a Merge Request to 'development' will be created.
                        </p>
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in zoom-in duration-300">
                    <div className="mb-4 text-green-600 flex items-center justify-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">{createPr ? "Process Complete!" : "Generation Complete!"}</span>
                    </div>

                    {prMessage ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-left">
                            <h4 className="font-bold text-green-800 mb-2">Merge Request Created</h4>
                            <p className="text-green-700 text-sm whitespace-pre-wrap break-words">
                                {prMessage.split(/((?:https?:\/\/|www\.)[^\s]+)/g).map((part, i) =>
                                    /((?:https?:\/\/|www\.)[^\s]+)/g.test(part) ? (
                                        <a
                                            key={i}
                                            href={part}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline font-bold hover:text-green-900 break-all"
                                        >
                                            {part}
                                        </a>
                                    ) : part
                                )}
                            </p>

                            {mrUrl && (
                                <a
                                    href={mrUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    View Merge Request
                                </a>
                            )}

                            <button
                                onClick={() => { setPrMessage(null); setCreatePr(false); setMrUrl(null); }}
                                className="mt-2 w-full py-2 text-sm text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50"
                            >
                                Start New Generate
                            </button>
                        </div>
                    ) : (
                        <>
                            {autoDownloaded ? (
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <p className="text-sm text-gray-600">Your download should start automatically.</p>
                                    <a
                                        href={downloadUrl || '#'}
                                        download={filename ? `${filename.replace(/\.[^/.]+$/, "")}.xlsx` : 'OpenL_Rules.xlsx'}
                                        className="text-blue-600 underline text-sm hover:text-blue-800"
                                    >
                                        Click here if it didn't start
                                    </a>
                                </div>
                            ) : (
                                <a
                                    href={downloadUrl || '#'}
                                    download={filename ? `${filename.replace(/\.[^/.]+$/, "")}.xlsx` : 'OpenL_Rules.xlsx'}
                                    className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 shadow-lg transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                    Download .xlsx File
                                </a>
                            )}
                            <button
                                onClick={() => { setDownloadUrl(null); setAutoDownloaded(false); }}
                                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Generate Another
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
