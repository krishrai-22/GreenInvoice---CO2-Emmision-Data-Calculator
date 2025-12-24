import React, { useState } from 'react';
import { Code, Check, Copy } from 'lucide-react';
import { ESGReport } from '../types';

interface JsonViewerProps {
  data: ESGReport | null;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 transition-all hover:scale-105"
          title="View Raw JSON"
        >
          <Code className="w-5 h-5" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-[90vw] md:w-[600px] max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-600" />
              Raw API Response
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-500 hover:bg-white hover:text-emerald-600 rounded-md transition-colors"
                title="Copy JSON"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2"
              >
                Close
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-900 p-4">
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default JsonViewer;
