'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckSquare, Square, ChevronDown, ChevronRight, Database, FileText, Eye, Quote, X, History } from 'lucide-react';
import { Rule, Datatype } from '@/lib/api';

interface RuleListComponentProps {
    rules: Rule[];
    datatypes: Datatype[];
    fullText: string;
    onToggleRule: (id: string) => void;
    onToggleDatatype: (name: string) => void;
    onHistoryClick?: (rule: Rule) => void;
}

export default function RuleListComponent({
    rules, datatypes, fullText,
    onToggleRule, onToggleDatatype, onHistoryClick
}: RuleListComponentProps) {

    const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({
        'Rules': true,
        'Datatypes': true
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleViewSource = (e: React.MouseEvent, rule: Rule) => {
        e.stopPropagation();
        setSelectedRule(rule);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRule(null);
    };

    // Scroll to highlighted text when modal opens
    useEffect(() => {
        if (isModalOpen && selectedRule && modalContentRef.current) {
            const highlightedElement = modalContentRef.current.querySelector('.bg-yellow-200');
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isModalOpen, selectedRule]);

    const renderHighlightedText = (text: string, highlight: string | undefined) => {
        if (!highlight || !text) return <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{text}</p>;

        // Escape special regex characters in the highlight string
        const escapeRegExp = (string: string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        const normalizedHighlight = highlight.trim();
        if (!normalizedHighlight) return <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{text}</p>;

        const escapedHighlight = escapeRegExp(normalizedHighlight);
        // Replace spaces with \s+ to match newlines and multiple spaces
        const pattern = escapedHighlight.replace(/\s+/g, '[\\s\\n]+');

        try {
            const regex = new RegExp(`(${pattern})`, 'gi');
            const parts = text.split(regex);

            if (parts.length === 1) {
                return <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{text}</p>;
            }

            return (
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {parts.map((part, i) => {
                        if (part.match(new RegExp(`^${pattern}$`, 'i'))) {
                            return (
                                <span key={i} className="bg-yellow-200 text-yellow-900 font-semibold px-1 rounded">
                                    {part}
                                </span>
                            );
                        }
                        return <React.Fragment key={i}>{part}</React.Fragment>;
                    })}
                </p>
            );
        } catch (e) {
            console.error("Regex error:", e);
            return <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{text}</p>;
        }
    };

    const renderSection = (title: string, icon: React.ReactNode, items: any[], onToggle: (id: string) => void, idKey: string = 'id') => {
        if (!items || items.length === 0) return null;

        return (
            <div className="mb-6">
                <button
                    onClick={() => toggleCategory(title)}
                    className="flex items-center gap-2 w-full text-left mb-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {expandedCategories[title] ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-800">{title} ({items.length})</h3>
                </button>

                {expandedCategories[title] && (
                    <div className="space-y-3 pl-4">
                        {items.map((item) => (
                            <div
                                key={item[idKey] || item.name}
                                className={`
                        flex flex-col p-4 rounded-xl border transition-all duration-200
                        ${item.selected
                                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                    }
                    `}
                            >
                                <div className="flex items-start gap-3 cursor-pointer" onClick={() => onToggle(item[idKey] || item.name)}>
                                    <div className={`mt-1 ${item.selected ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {item.selected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{item.id || item.name}</span>
                                                {item.category && (
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                        {item.category}
                                                    </span>
                                                )}
                                                {item.type && (
                                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                                                        {item.type}
                                                    </span>
                                                )}
                                                {item.rule_type && (
                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                                                        {item.rule_type}
                                                    </span>
                                                )}
                                            </div>
                                            {/* View Source Button for Rules */}
                                            {title === 'Rules' && item.source_text && (
                                                <button
                                                    onClick={(e) => handleViewSource(e, item)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Context
                                                </button>
                                            )}
                                            {/* History Button for Rules */}
                                            {title === 'Rules' && onHistoryClick && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onHistoryClick(item); }}
                                                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors ml-2"
                                                >
                                                    <History className="w-4 h-4" />
                                                    History
                                                </button>
                                            )}
                                        </div>

                                        {/* Rule Specific Fields */}
                                        {item.summary && <p className="text-gray-700 font-medium text-sm mb-1">{item.summary}</p>}

                                        {item.source_text && (
                                            <div className="mb-2 flex gap-2 items-start text-xs text-gray-500 italic bg-gray-100 p-2 rounded">
                                                <Quote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">"{item.source_text}"</span>
                                            </div>
                                        )}

                                        {item.condition && (
                                            <div className="mb-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 font-mono">
                                                <span className="font-semibold text-gray-500 select-none">Condition: </span>
                                                {item.condition}
                                            </div>
                                        )}

                                        {item.result && (
                                            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 font-mono mb-2">
                                                <span className="text-xs text-blue-400 uppercase tracking-wider font-bold mr-2">Result:</span>
                                                {item.result}
                                            </div>
                                        )}
                                        {item.description && !item.summary && <p className="text-gray-600 text-sm">{item.description}</p>}

                                        {/* Datatype Fields */}
                                        {item.fields && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                <strong>Fields:</strong> {item.fields.map((f: any) => `${f.name} (${f.type})`).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {renderSection('Datatypes', <Database className="w-5 h-5 text-purple-600" />, datatypes, onToggleDatatype, 'name')}
            {renderSection('Rules', <FileText className="w-5 h-5 text-blue-600" />, rules, onToggleRule, 'id')}

            {/* Document Viewer Modal */}
            {isModalOpen && selectedRule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Document Source Context</h3>
                                <p className="text-sm text-gray-500">Viewing source for rule: <span className="font-medium text-gray-700">{selectedRule.summary}</span></p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-white" ref={modalContentRef}>
                            <div className="max-w-3xl mx-auto font-serif text-lg leading-relaxed">
                                {renderHighlightedText(fullText, selectedRule.source_text)}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Close Viewer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
