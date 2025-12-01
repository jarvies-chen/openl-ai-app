'use client';

import React, { useState, useEffect } from 'react';
import { Rule, Datatype, getDiff, DiffResult } from '@/lib/api';
import { ArrowRight, Code, Database, Edit2, Check, Save, CheckCircle, Circle, Eye, History, Download, Zap } from 'lucide-react';
import SourceTextModal from './SourceTextModal';
import CommentModal from './CommentModal';
import RuleHistoryModal from './RuleHistoryModal';
import KrakenDownloadDialog from './KrakenDownloadDialog';

import TextDiffModal from './TextDiffModal';

interface KrakenGenerateComponentProps {
    rules: Rule[];
    datatypes: Datatype[];
    onUpdateRule: (rule: Rule) => void;
    onNext: () => void;
    onSave: (comment: string) => void;
    loading: boolean;
    fullText: string;
    filename: string;
    generatedKrakenRules: string;
}

const KrakenGenerateComponent: React.FC<KrakenGenerateComponentProps> = ({ rules, datatypes, onUpdateRule, onNext, onSave, loading, fullText, filename, generatedKrakenRules }) => {
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);
    const [versions, setVersions] = useState<number[]>([]);
    const [loadingCompare, setLoadingCompare] = useState(false);
    const [showTextDiffModal, setShowTextDiffModal] = useState(false);
    const [oldContent, setOldContent] = useState<string>('');
    const [newContent, setNewContent] = useState<string>('');
    const [diffVersions, setDiffVersions] = useState<{ old: number; new: number } | null>(null);

    const handleDownloadClick = () => {
        setShowDownloadDialog(true);
    };

    // Fetch versions to determine if compare button should be shown
    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const { getVersions } = await import('@/lib/api');
                const versionData = await getVersions(filename);
                setVersions(versionData.map(v => v.version).sort((a, b) => b - a));
            } catch (error) {
                console.error("Failed to fetch versions", error);
            }
        };

        if (filename) {
            fetchVersions();
        }
    }, [filename]);

    // Compare current version with previous version
    const handleCompareCurrentWithPrevious = async () => {
        setLoadingCompare(true);
        try {
            // Get the two latest versions
            const latestVersions = [...versions].sort((a, b) => b - a);
            if (latestVersions.length >= 2) {
                const [newVersion, oldVersion] = latestVersions;
                
                // Fetch document content for both versions instead of rule diffs
                const { getDocumentContent } = await import('@/lib/api');
                const oldDoc = await getDocumentContent(filename, oldVersion);
                const newDoc = await getDocumentContent(filename, newVersion);
                
                setOldContent(oldDoc.content);
                setNewContent(newDoc.content);
                setDiffVersions({ old: oldVersion, new: newVersion });
                setShowTextDiffModal(true);
            }
        } catch (error) {
            console.error("Failed to compare versions", error);
        } finally {
            setLoadingCompare(false);
        }
    };

    // Extract Kraken rules from the generated text
    const extractKrakenRules = () => {
        if (!generatedKrakenRules) return '';
        
        // Simple approach: return the entire generated content
        // This ensures we always show the Kraken Rule Content
        return generatedKrakenRules;
    };

    const krakenRulesContent = extractKrakenRules();

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header with Kraken branding */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Generate Kraken Rules</h1>
                </div>
                {/* Compare button in top right corner */}
                {versions.length >= 2 && (
                    <button
                        onClick={handleCompareCurrentWithPrevious}
                        disabled={loadingCompare}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm font-medium"
                        title="Compare current version with previous version"
                    >
                        {loadingCompare ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Comparing...
                            </>
                        ) : (
                            <>
                                <History className="w-4 h-4" />
                                Compare Versions
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Generated Kraken Rules Display */}
            {krakenRulesContent && (
                <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Kraken Rule Content</h3>
                    </div>
                    <div className="p-6">
                        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-900 whitespace-pre-wrap">
                            {krakenRulesContent}
                        </pre>
                    </div>
                </div>
            )}

            <div className="flex justify-center mb-8">
                <button
                    onClick={handleDownloadClick}
                    disabled={loading || !krakenRulesContent}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-medium text-lg"
                >
                    <Download className="w-5 h-5" />
                    {loading ? 'Generating...' : 'Download Kraken Rules'}
                </button>
            </div>

            {/* Download Dialog */}
            <KrakenDownloadDialog
                isOpen={showDownloadDialog}
                onClose={() => setShowDownloadDialog(false)}
                selectedRules={rules.filter(r => r.selected)}
                selectedDatatypes={datatypes}
                generatedRules={krakenRulesContent}
            />

            {/* Text Diff Modal for Kraken Rule Content */}
            <TextDiffModal
                isOpen={showTextDiffModal}
                oldContent={oldContent}
                newContent={newContent}
                onClose={() => setShowTextDiffModal(false)}
                versionOld={diffVersions?.old || 1}
                versionNew={diffVersions?.new || 2}
            />
        </div>
    );
};

export default KrakenGenerateComponent;