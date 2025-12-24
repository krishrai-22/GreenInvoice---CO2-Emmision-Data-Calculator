import React, { useState, useEffect } from 'react';
import { Leaf, FileText, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import ComparisonDashboard from './components/ComparisonDashboard';
import JsonViewer from './components/JsonViewer';
import { ESGReport } from './types';
import { analyzeDocument } from './services/geminiService';
import { MOCK_LOADING_STEPS, LOADING_TIPS } from './constants';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ESGReport[]>([]);
  const [loadingStep, setLoadingStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Simulating loading steps and cycling tips for better UX
  useEffect(() => {
    let stepInterval: ReturnType<typeof setInterval>;
    let tipInterval: ReturnType<typeof setInterval>;

    if (loading) {
      setLoadingStep(0);
      setTipIndex(0);

      // Advance loading steps text
      stepInterval = setInterval(() => {
        setLoadingStep((prev) => (prev < MOCK_LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2000);

      // Cycle through educational tips
      tipInterval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 4000);
    }
    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, [loading]);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setLoading(true);
    setError(null);
    setReports([]);

    try {
      // Process files in parallel
      const analysisPromises = selectedFiles.map(async (file) => {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = error => reject(error);
        });

        return analyzeDocument(base64Data, file.type);
      });

      const results = await Promise.all(analysisPromises);
      setReports(results);
    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze one or more documents. Please ensure files are valid images or PDFs and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReports([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Green <span className="text-emerald-600">Invoice</span></h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Scope 3 Emissions Agent</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Bank Grade Security</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {reports.length === 0 && (
          <div className="text-center mb-12 animate-fade-in-down">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">
              Automated Carbon Accounting
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Upload supplier invoices to instantly extract emission data. <br/>
              <span className="text-emerald-600 font-medium">New:</span> Upload 2 files to generate a comparative analysis.
            </p>
          </div>
        )}

        {/* Upload State */}
        {reports.length === 0 && !loading && (
          <div className="animate-fade-in-up">
            <FileUpload onFilesSelected={handleFilesSelected} isLoading={loading} />
            {error && (
               <div className="mt-6 max-w-2xl mx-auto bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 flex items-start gap-3">
                 <div className="mt-0.5"><FileText className="w-5 h-5" /></div>
                 <div>
                   <h3 className="font-semibold text-sm">Processing Error</h3>
                   <p className="text-sm opacity-90">{error}</p>
                 </div>
               </div>
            )}
          </div>
        )}

        {/* Loading State with Fillers */}
        {loading && (
          <div className="max-w-md mx-auto py-12 animate-fade-in">
            {/* Spinner Container */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <Leaf className="absolute inset-0 m-auto text-emerald-600 w-8 h-8 animate-pulse" />
            </div>

            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Documents</h3>
              <p className="text-emerald-600 font-medium animate-pulse transition-all duration-300">
                {MOCK_LOADING_STEPS[loadingStep]}
              </p>
            </div>

            {/* Filler Content: ESG Facts */}
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-500 ease-in-out">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 animate-progress"></div>
               
               <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 fill-emerald-100" /> 
                  Did you know?
               </div>
               
               <div className="min-h-[80px] flex items-center justify-center">
                 <p className="text-slate-600 text-sm md:text-base font-medium text-center italic leading-relaxed animate-fade-in key={tipIndex}">
                   "{LOADING_TIPS[tipIndex]}"
                 </p>
               </div>

               <div className="mt-4 flex justify-center gap-1.5">
                  {LOADING_TIPS.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === tipIndex ? 'w-6 bg-emerald-500' : 'w-1.5 bg-emerald-200'}`}
                    />
                  ))}
               </div>
            </div>
            
            <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Powered by Gemini 3.0 Pro Vision
            </p>
          </div>
        )}

        {/* Results State */}
        {reports.length > 0 && (
          <>
            {reports.length === 1 ? (
              <Dashboard report={reports[0]} onReset={handleReset} />
            ) : (
              <ComparisonDashboard reports={reports} onReset={handleReset} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 Green Invoice. Powered by Google Gemini.</p>
        </div>
      </footer>

      {/* Utilities - View the first report's JSON by default if multiple */}
      <JsonViewer data={reports.length > 0 ? reports[0] : null} />
    </div>
  );
}

export default App;