import React, { useState, useEffect } from 'react';
import {
  UploadCloud, FileText, Presentation, Video, CheckCircle2,
  AlertCircle, RefreshCw, Layers, Plus, BookOpen, Clock, File, Trash2
} from 'lucide-react';
import { DocumentItem, ContentUnit } from '../types';
import { api } from '../api/client';

interface DocumentManagerProps {
  courseId: string;
  onOpenViewerWithDoc: (doc: DocumentItem) => void;
  onDocumentsChanged?: () => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  courseId,
  onOpenViewerWithDoc,
  onDocumentsChanged,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('textbook');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');

  // Units Drawer
  const [selectedDocUnits, setSelectedDocUnits] = useState<{ docTitle: string; units: ContentUnit[] } | null>(null);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [courseId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.listDocuments(courseId);
      setDocuments(res);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgressMsg('Uploading file to secure local store...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title || selectedFile.name);
      formData.append('file_type', fileType);

      await api.uploadDocument(courseId, formData);
      setUploadProgressMsg('File uploaded! Ingestion pipeline started...');

      // Polling for processing completion
      setTimeout(() => {
        setIsUploading(false);
        setShowUploadModal(false);
        setSelectedFile(null);
        setTitle('');
        loadDocuments();
      }, 1500);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
      setIsUploading(false);
    }
  };

  const inspectUnits = async (doc: DocumentItem) => {
    setIsLoadingUnits(true);
    try {
      const units = await api.getDocumentUnits(doc.id);
      setSelectedDocUnits({ docTitle: doc.title, units });
    } catch (err: any) {
      alert(`Failed to load content units: ${err.message}`);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const handleDeleteDocument = async (docId: string, docTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${docTitle}"? All associated indexed chunks will be permanently removed.`)) {
      return;
    }
    try {
      await api.deleteDocument(docId);
      await loadDocuments();
      onDocumentsChanged?.();
    } catch (err: any) {
      alert(`Failed to delete document: ${err.message}`);
    }
  };

  const handleDeleteAllVideos = async () => {
    if (!window.confirm('Are you sure you want to delete all video recordings and their indexed transcripts?')) {
      return;
    }
    try {
      const res = await api.deleteVideoRecordings(courseId);
      alert(res.message || 'Video recordings deleted successfully');
      await loadDocuments();
      onDocumentsChanged?.();
    } catch (err: any) {
      alert(`Failed to delete video recordings: ${err.message}`);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem',
          padding: '1.75rem',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Layers size={22} style={{ color: 'var(--accent-indigo)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Course Knowledge Base & Materials
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Multi-source repository bringing textbooks, PowerPoint presentation slides, and lecture audio/video recordings into one grounded index.
          </p>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
          <UploadCloud size={16} />
          <span>Upload Learning Material</span>
        </button>
      </div>

      {/* Documents List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
          Uploaded Curated Files ({documents.length})
        </h3>

        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor:
                    doc.file_type === 'textbook'
                      ? 'rgba(59, 130, 246, 0.15)'
                      : doc.file_type === 'slides'
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color:
                    doc.file_type === 'textbook'
                      ? '#60a5fa'
                      : doc.file_type === 'slides'
                      ? '#fbbf24'
                      : '#c084fc',
                }}
              >
                {doc.file_type === 'textbook' && <FileText size={22} />}
                {doc.file_type === 'slides' && <Presentation size={22} />}
                {doc.file_type === 'lecture_video' && <Video size={22} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{doc.title}</h4>
                  <span
                    className={`badge ${
                      doc.status === 'indexed'
                        ? 'badge-emerald'
                        : doc.status === 'processing'
                        ? 'badge-blue'
                        : 'badge-rose'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                  <span>{doc.filename}</span>
                  <span>•</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                  {doc.total_pages > 0 && (
                    <>
                      <span>•</span>
                      <span>{doc.total_pages} Pages Indexed</span>
                    </>
                  )}
                  {doc.total_duration_seconds > 0 && (
                    <>
                      <span>•</span>
                      <span>{Math.round(doc.total_duration_seconds / 60)} Mins Video Transcript</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => inspectUnits(doc)}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              >
                Inspect Chunks
              </button>
              <button
                onClick={() => handleDeleteDocument(doc.id, doc.title)}
                title="Delete this document from knowledge base"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#fb7185',
                  borderRadius: '0.375rem',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Extracted Content Units Drawer Modal */}
      {selectedDocUnits && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-active)',
              borderRadius: '0.75rem',
              padding: '1.75rem',
              maxWidth: '44rem',
              width: '90%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  Indexed Content Units: {selectedDocUnits.docTitle}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedDocUnits.units.length} Structured searchable units with verified source metadata
                </div>
              </div>
              <button onClick={() => setSelectedDocUnits(null)} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                Close
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedDocUnits.units.map((u) => (
                <div
                  key={u.id}
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.5rem',
                    padding: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.825rem', color: '#ffffff' }}>
                      {u.title}
                    </span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                      {u.unit_type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {u.text_content.length > 220 ? u.text_content.substring(0, 220) + '...' : u.text_content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-active)',
              borderRadius: '0.75rem',
              padding: '1.75rem',
              maxWidth: '32rem',
              width: '90%',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Upload Multimodal Learning Material
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Upload textbook PDFs, PowerPoint presentation decks, or audio/video lecture transcripts.
              The pipeline automatically extracts layout, tables, diagrams, and builds searchable semantic embeddings.
            </p>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Material Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Raft Consensus Lecture Slides..."
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Material Category
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                >
                  <option value="textbook">Textbook / Academic PDF</option>
                  <option value="slides">Presentation Slides (.pptx / .pdf)</option>
                  <option value="lecture_video">Lecture Audio / Video Recording</option>
                  <option value="notes">Course Notes / Syllabus</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Select File (.pdf, .pptx, .mp4, .vtt, .txt)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                  }}
                />
              </div>

              {isUploading && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw className="spin" size={14} />
                  <span>{uploadProgressMsg}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="btn-primary"
                  style={{ fontSize: '0.8rem' }}
                >
                  {isUploading ? 'Processing...' : 'Start Ingestion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
