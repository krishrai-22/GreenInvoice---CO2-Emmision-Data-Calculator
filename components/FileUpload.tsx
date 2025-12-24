import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2, X, Plus } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFiles = (newFiles: File[]) => {
    // Combine current and new, unique by name, max 2
    const combined = [...selectedFiles, ...newFiles].slice(0, 2); 
    setSelectedFiles(combined);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      validateAndSetFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      validateAndSetFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };

  const onButtonClick = () => {
    if (selectedFiles.length < 2) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div
        className={`relative group rounded-xl border-2 border-dashed p-8 transition-all duration-300 ease-in-out text-center ${
          dragActive
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
        } ${isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleChange}
          disabled={isLoading || selectedFiles.length >= 2}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full bg-white shadow-sm ring-1 ring-slate-100 ${dragActive ? 'text-emerald-500' : 'text-slate-400'}`}>
            {isLoading ? (
               <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            ) : (
               <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-700">
              {isLoading ? "Processing Documents..." : "Upload Invoices"}
            </h3>
            <p className="text-sm text-slate-500">
              Drag & drop or click to upload (Max 2 files for comparison)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            <FileText className="w-3 h-3" />
            <span>JPG, PNG, PDF</span>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Selected Documents ({selectedFiles.length}/2)</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-white p-2 rounded-md border border-slate-200 text-emerald-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {selectedFiles.length === 1 && (
               <button 
                onClick={onButtonClick}
                className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
               >
                 <Plus className="w-4 h-4" /> Add another file to compare
               </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg shadow-sm transition-all active:scale-[0.99]"
          >
            Analyze {selectedFiles.length > 1 ? " & Compare" : ""} Documents
          </button>
        </div>
      )}

      {selectedFiles.length === 0 && !isLoading && (
        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 px-4">
          <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Upload one invoice for a detailed report, or two invoices to compare emissions side-by-side. 
            Powered by <span className="font-semibold text-emerald-700">Gemini 2.5 Flash</span>.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;