'use client';

import React, { useState } from 'react';
import UploadComponent from '@/components/UploadComponent';
import DownloadComponent from '@/components/DownloadComponent';
import OverviewPage from '@/components/OverviewPage';
import Stepper from '@/components/Stepper';
import Step2Candidates from '@/components/Step2Candidates';
import Step3Enrichment from '@/components/Step3Enrichment';
import { Loader2 } from 'lucide-react';
import {
  extractCandidates,
  enrichRules,
  saveVersion,
  getVersions,
  getRulesVersion,
  getDocumentContent,
  CandidateRule,
  Rule,
  Datatype
} from '@/lib/api';

export default function Home() {
  // View State
  const [view, setView] = useState<'overview' | 'workflow'>('overview');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Data State
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [tempPath, setTempPath] = useState<string>('');
  const [fullText, setFullText] = useState<string>('');

  const [candidates, setCandidates] = useState<CandidateRule[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [datatypes, setDatatypes] = useState<Datatype[]>([]);

  // --- Actions ---

  const handleNewDocument = () => {
    setView('workflow');
    setCurrentStep(1);
    setCandidates([]);
    setRules([]);
    setDatatypes([]);
    setCurrentFilename('');
    setTempPath('');
    setFullText('');
  };

  const handleSelectDocument = async (filename: string) => {
    setIsLoading(true);
    setLoadingMessage('Loading document...');
    try {
      const versions = await getVersions(filename);
      if (versions.length > 0) {
        const latest = versions.sort((a, b) => b.version - a.version)[0];
        const loadedRules = await getRulesVersion(filename, latest.version);

        // Load original text content
        try {
          const docContent = await getDocumentContent(filename, latest.version);
          setFullText(docContent.content);
        } catch (e) {
          console.error("Failed to load document content", e);
          setFullText("Source text not available.");
        }

        setCurrentFilename(filename);
        setRules(loadedRules);
        // We don't have datatypes stored separately in version history currently (it just stores rules).
        // For now, we might lose datatypes if we reload. 
        // TODO: Update backend to store datatypes or infer them.

        setView('workflow');
        setCurrentStep(3); // Jump to Enrichment/Review
      }
    } catch (error) {
      console.error("Failed to load document", error);
      alert("Failed to load document");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleUploadComplete = async (data: any) => {
    setIsLoading(true);
    setLoadingMessage('Extracting candidate rules...');
    try {
      // Handle both object (from file upload) and string (from manual entry)
      let extractedText = '';
      if (typeof data === 'string') {
        extractedText = data;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        setCurrentFilename(`Manual_Entry_${timestamp}.txt`);
        setTempPath(''); // No temp path for manual entry
      } else {
        extractedText = data.extracted_text;
        setCurrentFilename(data.filename);
        setTempPath(data.temp_path);
      }

      setFullText(extractedText);

      // Step 1 -> 2: Extract Candidates
      const extractedCandidates = await extractCandidates(extractedText);
      setCandidates(extractedCandidates);
      setCurrentStep(2);
    } catch (error) {
      console.error("Failed to extract candidates", error);
      alert("Failed to extract rules");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleEnrich = async () => {
    setIsLoading(true);
    setLoadingMessage('Enriching rules with OpenL syntax...');
    try {
      // Pass ALL candidates to enrichment (selection removed in Step 2)
      const result = await enrichRules(candidates, fullText);

      // Initialize all rules as selected by default in Step 3
      setRules(result.rules.map(r => ({ ...r, selected: true })));
      setDatatypes(result.datatypes);

      // Auto-save Version (Step 2 -> 3)
      if (currentFilename) {
        await saveVersion(currentFilename, result.rules, tempPath, fullText, `Initialized from ${currentFilename}`);
      }

      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to enrich rules", error);
      alert("Failed to enrich rules");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSaveVersion = async (comment: string) => {
    if (!currentFilename) return;
    setIsLoading(true);
    setLoadingMessage('Saving version...');
    try {
      await saveVersion(currentFilename, rules, tempPath, fullText, comment);
      alert('Version saved successfully!');
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save version");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGenerate = async () => {
    // Step 3 -> 4: Just proceed to download, NO auto-save
    setCurrentStep(4);
  };

  // --- Render ---

  if (view === 'overview') {
    return (
      <OverviewPage
        onNewDocument={handleNewDocument}
        onSelectDocument={handleSelectDocument}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12 relative">
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700">{loadingMessage || 'Processing...'}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('overview')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              OL
            </div>
            <h1 className="text-xl font-bold text-gray-900">OpenL AI Assistant</h1>
          </div>
          <button
            onClick={() => setView('overview')}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Stepper currentStep={currentStep} steps={['Upload', 'Review Candidates', 'Enrich Rules', 'Generate']} />

        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto mt-8">
            <UploadComponent
              onUploadComplete={(data) => handleUploadComplete(data)}
              onLoadingChange={(loading) => {
                setIsLoading(loading);
                if (loading) setLoadingMessage('Uploading...');
              }}
            />
          </div>
        )}

        {currentStep === 2 && (
          <Step2Candidates
            candidates={candidates}
            onNext={handleEnrich}
            loading={isLoading}
            fullText={fullText}
          />
        )}

        {currentStep === 3 && (
          <Step3Enrichment
            rules={rules}
            datatypes={datatypes}
            onUpdateRule={(updatedRule) => setRules(rules.map(r => r.id === updatedRule.id ? updatedRule : r))}
            onNext={handleGenerate}
            onSave={handleSaveVersion}
            loading={isLoading}
            fullText={fullText}
            filename={currentFilename}
          />
        )}

        {currentStep === 4 && (
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Generate</h2>
              <p className="text-gray-600 mb-8">
                Your rules are ready. Click below to download the OpenL Excel file.
              </p>
              <div className="flex justify-center">
                <DownloadComponent
                  selectedRules={rules.filter(r => r.selected)}
                  selectedDatatypes={datatypes}
                />
              </div>
              <button
                onClick={() => setView('overview')}
                className="mt-8 text-blue-600 hover:text-blue-700 font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
