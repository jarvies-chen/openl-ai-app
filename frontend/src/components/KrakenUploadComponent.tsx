'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Type, Zap } from 'lucide-react';
import { uploadDocument, extractRules, krakenUploadDocument } from '@/lib/api';

interface KrakenUploadComponentProps {
    onUploadComplete: (data: any) => void;
    onLoadingChange: (isLoading: boolean) => void;
}

export default function KrakenUploadComponent({ onUploadComplete, onLoadingChange }: KrakenUploadComponentProps) {
    const [mode, setMode] = useState<'file' | 'text'>('file');
    const [textInput, setTextInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await handleUpload(files[0]);
        }
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        onLoadingChange(true);
        setError(null);
        try {
            const result = await krakenUploadDocument(file);
            // Pass full result to parent (contains filename, temp_path, candidates)
            onUploadComplete(result);
        } catch (err) {
            setError('Failed to upload document. Please try again.');
            console.error(err);
            onLoadingChange(false);
        }
    };

    const handleTextSubmit = async () => {
        if (!textInput.trim()) return;

        onLoadingChange(true);
        setError(null);
        try {
            // Pass text directly to parent to trigger extraction
            onUploadComplete(textInput);
        } catch (err) {
            setError('Failed to process text. Please try again.');
            console.error(err);
            onLoadingChange(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            {/* Header with Kraken branding */}
            <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Kraken Rules</h1>
                </div>
                <p className="text-gray-600 text-lg">Upload your business requirements to generate optimized rules</p>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 border-b border-gray-200">
                <button
                    onClick={() => setMode('file')}
                    className={`pb-2 px-4 font-medium transition-colors ${mode === 'file'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Upload Document
                </button>
                <button
                    onClick={() => setMode('text')}
                    className={`pb-2 px-4 font-medium transition-colors ${mode === 'text'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Enter Requirements
                </button>
            </div>

            {mode === 'file' ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ease-in-out
            ${isDragging
                            ? 'border-green-500 bg-green-50 scale-[1.02]'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }
          `}
                >
                    <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.docx,.txt,.xlsx,.xls"
                        />

                    <div className="flex flex-col items-center gap-4">
                        <div className={`p-4 rounded-full ${isDragging ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Upload Business Requirements
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Drag and drop your EXCEL, PDF, DOCX, or TXT here, or{' '}
                                <label htmlFor="file-upload" className="text-green-600 hover:text-green-700 cursor-pointer font-medium">
                                    browse files
                                </label>
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Requirements
                        </label>
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Enter your business rules, requirements, or policy text here..."
                            className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleTextSubmit}
                            disabled={!textInput.trim()}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4" />
                            Generate Rules
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}


        </div>
    );
}