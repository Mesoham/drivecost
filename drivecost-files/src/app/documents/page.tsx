'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Plus,
  X,
  FileCheck2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DocumentType } from '@/types';
import { formatDateIndian } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const DOCUMENT_CATEGORIES: DocumentType[] = [
  'Registration Certificate (RC)',
  'Insurance Policy',
  'PUC Certificate',
  'Driving License',
  'Commercial Permit',
  'Fitness Certificate',
  'Service Receipt / Invoice',
  'Warranty Card',
  'Other Document'
];

export default function DocumentsPage() {
  const { 
    vehicles, 
    documents, 
    selectedVehicleId, 
    setSelectedVehicleId, 
    settings, 
    setProModalOpen, 
    addDocument, 
    deleteDocument, 
    importFromDigiLocker,
    setDynamicAlert
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentType>('Registration Certificate (RC)');
  const [docNumber, setDocNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [targetVehicleId, setTargetVehicleId] = useState(
    selectedVehicleId !== 'all' ? selectedVehicleId : (vehicles[0]?.id || '')
  );

  // File upload state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: 'image' | 'pdf';
    data: string;
    size: number;
  } | null>(null);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const filteredDocs = documents.filter(d => {
    if (selectedVehicleId === 'all') return true;
    return d.vehicleId === selectedVehicleId;
  });

  const vehiclesMap = vehicles.reduce((acc, v) => {
    acc[v.id] = v.name;
    return acc;
  }, {} as Record<string, string>);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB limit. Please upload a smaller image or compressed PDF.');
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      alert('Please upload a valid image (JPG, PNG, WebP) or PDF document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        type: isPdf ? 'pdf' : 'image',
        data: reader.result as string,
        size: file.size
      });
      if (!docTitle.trim()) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !docTitle.trim() || !targetVehicleId) return;

    await addDocument({
      vehicleId: targetVehicleId,
      title: docTitle.trim(),
      type: docCategory,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileData: selectedFile.data,
      fileSize: selectedFile.size,
      documentNumber: docNumber.trim() || undefined,
      expiryDate: expiryDate || undefined,
      notes: notes.trim() || undefined,
      isDigiLockerVerified: false
    });

    setDynamicAlert({
      title: 'Document Saved! 📄',
      subtitle: `${docTitle.trim()} encrypted & stored locally`,
      icon: 'check',
      color: '#34c759'
    });

    // Reset form
    setIsUploadOpen(false);
    setSelectedFile(null);
    setDocTitle('');
    setDocNumber('');
    setExpiryDate('');
    setNotes('');
  };

  const handleDigiLockerSync = () => {
    if (!settings?.isProUser) {
      setProModalOpen(true);
      return;
    }

    const vehId = selectedVehicleId !== 'all' ? selectedVehicleId : vehicles[0]?.id;
    if (!vehId) {
      alert('Please add or select a vehicle first.');
      return;
    }
    importFromDigiLocker(vehId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight daylight-text-main">
              Vehicle Documents Vault
            </h1>
            {settings?.isProUser ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> DigiLocker Pro
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Local Vault (Free)
              </span>
            )}
          </div>
          <p className="text-xs daylight-text-muted mt-1">
            Store RC, Insurance, PUC photos & PDFs on this device, or sync with DigiLocker.
          </p>
        </div>

        {/* Action buttons in header only appear when documents exist so empty state remains clean */}
        {documents.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* DigiLocker Official Sync CTA (Pro Gate) */}
            <button
              type="button"
              onClick={handleDigiLockerSync}
              className="h-10 px-4 rounded-2xl apple-glass border border-emerald-500/30 flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.97] transition-all relative overflow-hidden group"
            >
              {/* DigiLocker Tri-color emblem */}
              <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-amber-500 via-white to-emerald-600 flex items-center justify-center text-[10px] font-black text-black shadow-xs">
                DL
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 leading-none">
                  Connect DigiLocker {!settings?.isProUser && <Lock className="h-3 w-3 text-amber-500" />}
                </span>
                <span className="text-[9px] daylight-text-tertiary block leading-none mt-0.5">
                  {settings?.isProUser ? 'MoRTH Instant Import' : 'Pro Feature (MoRTH Sync)'}
                </span>
              </div>
            </button>

            {/* Upload Document Button */}
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Document</span>
            </Button>
          </div>
        )}
      </div>

      {/* DigiLocker Banner highlight */}
      {!settings?.isProUser && (
        <div className="apple-glass p-4 rounded-2xl border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold daylight-text-main flex items-center gap-1.5">
                <span>DigiLocker</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 font-extrabold border border-purple-500/30">
                  Pro Plan
                </span>
              </h4>
              <p className="text-[11px] daylight-text-muted mt-0.5">
                Upgrade to DriveCost Pro for ₹74/mo to auto-fetch your certified RC, Insurance, and PUC directly from the Ministry database.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setProModalOpen(true)}
            className="text-xs gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Unlock DigiLocker</span>
          </Button>
        </div>
      )}

      {/* Documents Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isPdf = doc.fileType === 'pdf';
            return (
              <div
                key={doc.id}
                className="apple-glass p-5 rounded-3xl border border-black/8 dark:border-white/10 flex flex-col justify-between hover:scale-[1.01] transition-all relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-xs border ${
                        isPdf
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      }`}>
                        {isPdf ? <FileText className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm daylight-text-main line-clamp-1" title={doc.title}>
                          {doc.title}
                        </h3>
                        <div className="text-[11px] daylight-text-muted">
                          {vehiclesMap[doc.vehicleId] || 'Universal Vehicle'}
                        </div>
                      </div>
                    </div>

                    {/* DigiLocker Badge */}
                    {doc.isDigiLockerVerified ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="h-3 w-3" /> DigiLocker
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold daylight-text-tertiary border border-black/8 dark:border-white/10 shrink-0">
                        {isPdf ? 'PDF' : 'IMAGE'}
                      </span>
                    )}
                  </div>

                  {/* Document Category & Number Pill */}
                  <div className="p-2.5 rounded-xl apple-glass border border-black/5 dark:border-white/8 space-y-1 my-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold daylight-text-tertiary">Type</span>
                      <span className="font-semibold daylight-text-main text-[11px]">{doc.type}</span>
                    </div>
                    {doc.documentNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold daylight-text-tertiary">Doc #</span>
                        <span className="font-mono font-bold daylight-text-main text-[11px]">{doc.documentNumber}</span>
                      </div>
                    )}
                    {doc.expiryDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold daylight-text-tertiary">Valid Till</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 text-[11px]">
                          {formatDateIndian(doc.expiryDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  {doc.notes && (
                    <p className="text-[11px] daylight-text-muted line-clamp-2 italic mb-2">
                      {doc.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] daylight-text-tertiary font-mono">
                    {(doc.fileSize / 1024).toFixed(0)} KB • {formatDateIndian(doc.createdAt)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2.5 py-1 text-xs font-bold rounded-xl apple-glass border border-black/8 dark:border-white/10 daylight-text-main hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDocument(doc.id)}
                      className="apple-delete-btn p-1.5 text-rose-500 rounded-xl cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="apple-glass rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <FolderOpen className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold daylight-text-main">No documents stored</h3>
            <p className="text-xs daylight-text-muted mt-1 leading-relaxed">
              Upload photos or PDFs of your Vehicle RC, Insurance policy, PUC certificate, and maintenance invoices to keep them safe and offline.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload documents (photo/PDF)</span>
            </Button>
            <Button variant="outline" onClick={handleDigiLockerSync} className="gap-2 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-amber-500 via-white to-emerald-600 flex items-center justify-center text-[8px] font-black text-black">
                DL
              </div>
              <span>Connect DigiLocker</span>
            </Button>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="apple-glass bg-white/95 dark:bg-slate-900/95 max-w-lg w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-black/10 dark:border-white/15 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base daylight-text-main">Upload Vehicle Document</h3>
                  <p className="text-[11px] daylight-text-muted">Images (JPG, PNG) or PDFs up to 8MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 daylight-text-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-4">
              {/* File Dropzone */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="p-4 rounded-2xl apple-glass border border-emerald-500/40 bg-emerald-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {selectedFile.type === 'pdf' ? (
                        <FileText className="h-8 w-8 text-rose-500 shrink-0" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-blue-500 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="font-bold text-xs daylight-text-main truncate">{selectedFile.name}</div>
                        <div className="text-[10px] daylight-text-tertiary font-mono">
                          {(selectedFile.size / 1024).toFixed(0)} KB • {selectedFile.type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-blue-600 hover:underline shrink-0 ml-2"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 rounded-2xl border-2 border-dashed border-black/15 dark:border-white/20 hover:border-blue-500/60 dark:hover:border-blue-400/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="h-8 w-8 text-blue-500" />
                    <div className="text-xs font-bold daylight-text-main">
                      Click to choose Document Photo or PDF
                    </div>
                    <span className="text-[10px] daylight-text-muted">
                      RC front/back, Policy PDF, Pollution Certificate
                    </span>
                  </button>
                )}
              </div>

              {/* Target Vehicle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1">
                  Assign to Vehicle *
                </label>
                <select
                  value={targetVehicleId}
                  onChange={(e) => setTargetVehicleId(e.target.value)}
                  required
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-xs font-bold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.manufacturer} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1">
                  Document Category *
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  required
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-xs font-bold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                >
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maruti Swift RC Front, ICICI Comprehensive Policy"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-xs font-bold daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1">
                    Document / Policy Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL01AB1234 / POL-12345"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full rounded-2xl apple-glass px-4 py-2.5 text-xs daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1">
                    Expiry / Renewal Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-2xl apple-glass px-4 py-2.5 text-xs daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider daylight-text-muted mb-1">
                  Notes / Details
                </label>
                <input
                  type="text"
                  placeholder="Optional details or reminders"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-2xl apple-glass px-4 py-2.5 text-xs daylight-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!selectedFile || !docTitle.trim() || !targetVehicleId}
                  className="gap-1.5"
                >
                  <Upload className="h-4 w-4" />
                  <span>Save to Vault</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Document View / Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="apple-glass bg-white/95 dark:bg-slate-900/95 max-w-2xl w-full p-6 rounded-3xl shadow-2xl border border-black/10 dark:border-white/15 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-black/8 dark:border-white/10 mb-4">
              <div>
                <h3 className="font-bold text-base daylight-text-main">{previewDoc.title}</h3>
                <p className="text-xs daylight-text-muted">{previewDoc.type} • {previewDoc.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 daylight-text-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl bg-black/5 dark:bg-black/40 flex items-center justify-center p-4 min-h-[300px]">
              {previewDoc.fileType === 'pdf' ? (
                <div className="text-center space-y-3">
                  <FileText className="h-16 w-16 text-rose-500 mx-auto" />
                  <div className="text-sm font-bold daylight-text-main">{previewDoc.fileName}</div>
                  <p className="text-xs daylight-text-muted max-w-md">
                    PDF document safely encrypted and stored in local IndexedDB.
                  </p>
                  <a
                    href={previewDoc.fileData}
                    download={previewDoc.fileName}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
                  >
                    <span>Download PDF File</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <img
                  src={previewDoc.fileData}
                  alt={previewDoc.title}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
                />
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs daylight-text-tertiary">
                {previewDoc.documentNumber ? `ID: ${previewDoc.documentNumber}` : 'Document preview'}
              </span>
              <Button size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
