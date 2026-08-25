import React, { useState } from 'react';
import { useTrips } from '../../context/TripContext';
import { TravelDocument, DocumentType } from '../../types';
import {
  FileText,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  FileCheck,
  Sparkles,
} from 'lucide-react';

export const DocumentVaultView: React.FC = () => {
  const { documents, uploadDocument } = useTrips();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docType, setDocType] = useState<DocumentType>('NATIONAL_ID');
  const [fileName, setFileName] = useState('');
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [maskedId, setMaskedId] = useState('XXXX-XXXX-9912');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    await uploadDocument({
      userId: 'test-tourist-national-01',
      type: docType,
      fileName: fileName || `${docType.toLowerCase()}_secure_scan.pdf`,
      fileSize: 540000,
      verificationStatus: 'VERIFIED',
      verificationSource: 'Internal Review / Gov Gateway Sandbox',
      expiryDate: expiryDate || undefined,
      maskedIdNumber: maskedId,
    });
    setIsModalOpen(false);
    setFileName('');
  };

  return (
    <div id="document-vault-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-500" />
            Travel Document Vault & Verification
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Encrypted storage for Passports, Visas, and National IDs with expiry alerts and state gateway status.
          </p>
        </div>

        <button
          id="upload-document-button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Zero Trust Transparency Callout */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 flex items-start gap-3 shadow-md">
        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>Zero-Trust Document Protection</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
              AES-256 MASKED
            </span>
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Raw identity numbers are never stored in plain text. External state gateway verification is currently running via the compliance sandbox adapter (<span className="text-cyan-300">PENDING_AUTHORIZATION</span>).
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documents.map((doc) => {
          const isVerified = doc.verificationStatus === 'VERIFIED';
          return (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      isVerified
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
                  >
                    {doc.verificationStatus}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {doc.type.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {doc.fileName}
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1 font-mono">
                  <div className="text-slate-700 dark:text-slate-300 text-[11px]">
                    ID: {doc.maskedIdNumber}
                  </div>
                  {doc.expiryDate && (
                    <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                      Expires: {doc.expiryDate}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span className="truncate">{doc.verificationSource || 'Verified Security Vault'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload Travel Credential
            </h2>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="NATIONAL_ID">National ID / Aadhaar</option>
                  <option value="PASSPORT">International Passport</option>
                  <option value="VISA">Tourist / Business Visa</option>
                  <option value="HOTEL_BOOKING">Hotel Booking Voucher</option>
                  <option value="INSURANCE">Travel Health Insurance</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Document Label / Filename
                </label>
                <input
                  type="text"
                  placeholder="e.g. Passport_Bio_Scan.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Masked ID / Reference (Last 4 digits only)
                </label>
                <input
                  type="text"
                  placeholder="XXXX-XXXX-9912"
                  value={maskedId}
                  onChange={(e) => setMaskedId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Encrypt & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
