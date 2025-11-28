import React, { useMemo } from 'react';
import { X } from 'lucide-react';

interface SourceTextModalProps {
    text: string;
    highlight?: string;
    onClose: () => void;
}

const SourceTextModal: React.FC<SourceTextModalProps> = ({ text, highlight, onClose }) => {

    const renderText = useMemo(() => {
        if (!highlight || !text) return <div className="whitespace-pre-wrap">{text}</div>;

        // Normalize whitespace for matching (collapse multiple spaces/newlines to single space)
        const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
        const normalizedText = normalize(text);
        const normalizedHighlight = normalize(highlight);

        // If simple match fails, try fuzzy-ish match via normalization
        if (!text.includes(highlight)) {
            // Find start index in normalized text
            const normStartIndex = normalizedText.indexOf(normalizedHighlight);

            if (normStartIndex === -1) {
                // Fallback: try to match just the first 20 chars if full match fails (sometimes LLM hallucinates slightly)
                const shortHighlight = normalizedHighlight.slice(0, 50);
                const shortStartIndex = normalizedText.indexOf(shortHighlight);

                if (shortStartIndex === -1) {
                    return <div className="whitespace-pre-wrap">{text}</div>;
                }
                // If we found a partial match, we can't easily map back to original indices perfectly without complex logic.
                // For now, let's just show the text. 
                // BETTER APPROACH: Use a library or a more robust "find original index" algorithm.
                // Let's implement a simple "find original index" heuristic.
            }
        }

        // Robust approach: Tokenize and match sequence
        const tokenize = (s: string) => s.match(/\S+/g) || [];
        const textTokens = tokenize(text);
        const highlightTokens = tokenize(highlight);

        if (highlightTokens.length === 0) return <div className="whitespace-pre-wrap">{text}</div>;

        // Find sequence of highlightTokens in textTokens
        let startTokenIndex = -1;
        for (let i = 0; i <= textTokens.length - highlightTokens.length; i++) {
            let match = true;
            for (let j = 0; j < highlightTokens.length; j++) {
                if (textTokens[i + j] !== highlightTokens[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                startTokenIndex = i;
                break;
            }
        }

        if (startTokenIndex === -1) return <div className="whitespace-pre-wrap">{text}</div>;

        // Reconstruct text with highlight
        // This is tricky because we lost whitespace. 
        // Alternative: Regex escaping and matching with \s+

        try {
            // Escape special regex chars in highlight
            const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Replace whitespace in highlight with \s+ pattern to match any whitespace in original
            const patternString = escapedHighlight.split(/\s+/).join('[\\s\\n]+');
            const regex = new RegExp(`(${patternString})`, 'i'); // Case insensitive? Maybe.

            const parts = text.split(regex);
            if (parts.length === 1) return <div className="whitespace-pre-wrap">{text}</div>;

            return (
                <div className="whitespace-pre-wrap">
                    {parts.map((part, i) => {
                        // Check if this part matches the pattern (it's the captured group)
                        if (regex.test(part)) {
                            return <span key={i} className="bg-yellow-200 font-semibold">{part}</span>;
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </div>
            );
        } catch (e) {
            console.error("Highlight regex failed", e);
            return <div className="whitespace-pre-wrap">{text}</div>;
        }

    }, [text, highlight]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-900">Source Text Context</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 font-mono leading-relaxed">
                    {renderText}
                </div>
            </div>
        </div>
    );
};

export default SourceTextModal;
