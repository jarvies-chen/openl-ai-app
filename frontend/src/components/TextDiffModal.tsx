import React from 'react';
import { X } from 'lucide-react';

interface TextDiffModalProps {
    isOpen: boolean;
    oldContent: string;
    newContent: string;
    onClose: () => void;
    versionOld: number;
    versionNew: number;
}

const TextDiffModal: React.FC<TextDiffModalProps> = ({ isOpen, oldContent, newContent, onClose, versionOld, versionNew }) => {
    if (!isOpen) return null;

    // Extract Kraken content from both versions
    const extractKrakenContent = (content: string) => {
        const krakenRegex = /```kraken\n([\s\S]*?)```/g;
        const matches = content.match(krakenRegex);
        if (matches) {
            return matches.map(match => match.replace(/```kraken\n|```/g, '')).join('\n\n');
        }
        return content;
    };

    const oldKrakenContent = extractKrakenContent(oldContent);
    const newKrakenContent = extractKrakenContent(newContent);

    // Simple line-by-line diff algorithm
    const getDiffLines = () => {
        const oldLines = oldKrakenContent.split('\n');
        const newLines = newKrakenContent.split('\n');
        const maxLines = Math.max(oldLines.length, newLines.length);
        const diffLines = [];

        for (let i = 0; i < maxLines; i++) {
            const oldLine = oldLines[i] || '';
            const newLine = newLines[i] || '';

            if (oldLine === newLine) {
                diffLines.push({ type: 'unchanged', line: oldLine, lineNumber: i + 1 });
            } else if (!newLine) {
                diffLines.push({ type: 'removed', line: oldLine, lineNumber: i + 1 });
            } else if (!oldLine) {
                diffLines.push({ type: 'added', line: newLine, lineNumber: i + 1 });
            } else {
                diffLines.push({ type: 'removed', line: oldLine, lineNumber: i + 1 });
                diffLines.push({ type: 'added', line: newLine, lineNumber: i + 1 });
            }
        }

        return diffLines;
    };

    const diffLines = getDiffLines();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-900">
                        Kraken Rule Changes: Version {versionOld} → Version {versionNew}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Summary */}
                    <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <div className="text-sm font-medium text-red-700">Removed Lines</div>
                            <div className="text-2xl font-bold text-red-800 mt-1">
                                {diffLines.filter(line => line.type === 'removed').length}
                            </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div className="text-sm font-medium text-green-700">Added Lines</div>
                            <div className="text-2xl font-bold text-green-800 mt-1">
                                {diffLines.filter(line => line.type === 'added').length}
                            </div>
                        </div>
                    </div>

                    {/* Diff */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-1">
                            {diffLines.map((line, index) => (
                                <div 
                                    key={index} 
                                    className={`flex items-start p-2 border-b border-gray-100 ${line.type === 'removed' ? 'bg-red-50 text-red-800' : line.type === 'added' ? 'bg-green-50 text-green-800' : 'bg-white text-gray-900'}`}
                                >
                                    <div className="w-12 text-right text-xs text-gray-500 mr-4 pt-1 select-none">
                                        {line.lineNumber}
                                    </div>
                                    <div className="flex-1 text-sm font-mono whitespace-pre-wrap">
                                        {line.line || ' '}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextDiffModal;