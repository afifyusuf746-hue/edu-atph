'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Search,
  CheckCircle,
  X,
  Video,
  FileText,
  Image as ImageIcon,
  Sparkles,
  UploadCloud,
  Paperclip,
  Download,
  AlertCircle,
  File,
  FileCheck,
  Loader2,
  Folder,
  FolderOpen,
  GraduationCap,
  Layers,
  Globe,
  EyeOff,
  SendHorizonal,
  Link as LinkIcon,
  ExternalLink,
  RefreshCw,
  Check,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import {
  TeachingMaterial,
  MaterialCategory,
  ClassItem,
  MaterialAttachment,
  MaterialSource,
  MaterialSourceType,
} from '@/types';
import { formatDate } from '@/lib/utils';
import { uploadMultipleFiles, uploadFileToStorage, formatBytes, detectFileType } from '@/lib/storage';
import { UrlVerificationResult } from '@/lib/url-validator';

// formatBytes and detectFileType are imported from '@/lib/storage'

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState<'all' | 'X' | 'XI' | 'XII'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TeachingMaterial | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    categoryId: '',
    targetClassId: 'all',
    topic: '',
    learningObjectivesText: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    pdfUrl: '',
    status: 'published' as 'published' | 'draft' | 'archived',
    orderIndex: 1,
  });
  const [attachments, setAttachments] = useState<MaterialAttachment[]>([]);
  const [sources, setSources] = useState<MaterialSource[]>([]);
  const [activeSourceSection, setActiveSourceSection] = useState<'url' | 'upload' | 'text'>('url');

  // Sub-form for adding / editing URL source
  const [urlInputTitle, setUrlInputTitle] = useState('');
  const [urlInputUrl, setUrlInputUrl] = useState('');
  const [urlInputType, setUrlInputType] = useState<MaterialSourceType | 'auto'>('auto');
  const [isVerifyingUrl, setIsVerifyingUrl] = useState(false);
  const [urlVerificationResult, setUrlVerificationResult] = useState<UrlVerificationResult | null>(null);
  const [urlVerificationError, setUrlVerificationError] = useState<string | null>(null);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);

  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(() => {
    // 1. Initial read from local cache for instant UI response
    setMaterials(DataProvider.getMaterials());
    setCategories(DataProvider.getCategories());
    setClasses(DataProvider.getClasses());

    // 2. Fetch fresh verified materials directly from Supabase server
    DataProvider.fetchMaterialsAsync().then((freshMaterials) => {
      if (Array.isArray(freshMaterials) && freshMaterials.length > 0) {
        setMaterials(freshMaterials);
      }
    });
  }, []);

  useEffect(() => {
    // Clean up any large base64 data stored in previous sessions
    // (old versions stored full file contents in localStorage which caused quota errors)
    DataProvider.cleanupMaterialBase64();
    loadData();
  }, [loadData]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Calculate count per folder
  const countX = materials.filter(
    (m) => DataProvider.getMaterialGradeLevel(m.targetClassId, m.targetClassName) === 'X'
  ).length;

  const countXI = materials.filter(
    (m) => DataProvider.getMaterialGradeLevel(m.targetClassId, m.targetClassName) === 'XI'
  ).length;

  const countXII = materials.filter(
    (m) => DataProvider.getMaterialGradeLevel(m.targetClassId, m.targetClassName) === 'XII'
  ).length;

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.categoryId === selectedCategory;
    const matchesClass =
      selectedClass === 'all' || m.targetClassId === 'all' || m.targetClassId === selectedClass;

    const gradeLevel = DataProvider.getMaterialGradeLevel(m.targetClassId, m.targetClassName);
    const matchesFolder = selectedFolder === 'all' || gradeLevel === selectedFolder;

    return matchesSearch && matchesCategory && matchesClass && matchesFolder;
  });

  const resetUrlSubForm = () => {
    setUrlInputTitle('');
    setUrlInputUrl('');
    setUrlInputType('auto');
    setUrlVerificationResult(null);
    setUrlVerificationError(null);
    setEditingSourceId(null);
    setIsVerifyingUrl(false);
  };

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setAttachments([]);
    setSources([]);
    setActiveSourceSection('url');
    resetUrlSubForm();
    setUploadError(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      categoryId: categories[0]?.id || 'cat-1',
      targetClassId: 'all',
      topic: '',
      learningObjectivesText: '1. Memahami prinsip budidaya tanaman\n2. Mampu mempraktikkan teknik lapangan',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
      videoUrl: '',
      pdfUrl: '',
      status: 'published',
      orderIndex: materials.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mat: TeachingMaterial) => {
    setEditingMaterial(mat);
    setAttachments(mat.attachments || []);

    // Load existing sources, or synthesize from pdfUrl / videoUrl if sources were empty
    let initialSources: MaterialSource[] = mat.sources ? [...mat.sources] : [];
    if (initialSources.length === 0) {
      if (mat.pdfUrl) {
        initialSources.push({
          id: `src-pdf-${mat.id}`,
          title: 'Modul Dokumen PDF',
          url: mat.pdfUrl,
          sourceType: 'pdf',
          previewUrl: mat.pdfUrl,
          canEmbed: true,
          orderIndex: 1,
        });
      }
      if (mat.videoUrl) {
        initialSources.push({
          id: `src-yt-${mat.id}`,
          title: 'Video Pembelajaran YouTube',
          url: mat.videoUrl,
          sourceType: 'youtube',
          previewUrl: mat.videoUrl,
          canEmbed: true,
          orderIndex: initialSources.length + 1,
        });
      }
    }

    setSources(initialSources);
    setActiveSourceSection(initialSources.length > 0 ? 'url' : mat.attachments?.length ? 'upload' : 'text');
    resetUrlSubForm();
    setUploadError(null);

    setFormData({
      title: mat.title,
      slug: mat.slug,
      description: mat.description,
      categoryId: mat.categoryId,
      targetClassId: mat.targetClassId,
      topic: mat.topic,
      learningObjectivesText: mat.learningObjectives?.join('\n') || '',
      content: mat.content,
      imageUrl: mat.imageUrl || '',
      videoUrl: mat.videoUrl || '',
      pdfUrl: mat.pdfUrl || '',
      status: mat.status,
      orderIndex: mat.orderIndex,
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // URL SOURCE HANDLERS (Verify, Add, Edit, Delete)
  // -------------------------------------------------------------
  const handleVerifyUrl = async () => {
    const rawUrl = urlInputUrl.trim();
    if (!rawUrl) {
      setUrlVerificationError('Masukkan alamat URL terlebih dahulu.');
      return;
    }

    setIsVerifyingUrl(true);
    setUrlVerificationError(null);
    setUrlVerificationResult(null);

    try {
      const res = await fetch('/api/materials/verify-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setUrlVerificationError(data?.error || `Gagal memeriksa tautan (HTTP ${res.status}).`);
        return;
      }

      const ver: UrlVerificationResult = data.verification;
      setUrlVerificationResult(ver);

      // Auto-suggest title if user hasn't typed one
      if (!urlInputTitle.trim() && ver.titleSuggestion) {
        setUrlInputTitle(ver.titleSuggestion);
      }

      // Auto-match type if currently set to 'auto'
      if (urlInputType === 'auto' && ver.sourceType) {
        setUrlInputType(ver.sourceType);
      }
    } catch (err) {
      console.error('URL verification error:', err);
      setUrlVerificationError('Koneksi terputus saat memeriksa tautan.');
    } finally {
      setIsVerifyingUrl(false);
    }
  };

  const handleAddOrUpdateSource = () => {
    const rawUrl = urlInputUrl.trim();
    if (!rawUrl) {
      setUrlVerificationError('URL sumber tidak boleh kosong.');
      return;
    }

    try {
      new URL(rawUrl);
    } catch {
      setUrlVerificationError('Format URL tidak valid. Pastikan diawali http:// atau https://.');
      return;
    }

    let finalType: MaterialSourceType = urlInputType === 'auto' ? 'webpage' : urlInputType;

    // Auto-detect type if 'auto'
    if (urlInputType === 'auto') {
      const lower = rawUrl.toLowerCase();
      if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
        finalType = 'youtube';
      } else if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) {
        finalType = 'gdrive';
      } else if (lower.endsWith('.pdf') || (urlVerificationResult && urlVerificationResult.sourceType === 'pdf')) {
        finalType = 'pdf';
      } else if (urlVerificationResult?.sourceType) {
        finalType = urlVerificationResult.sourceType;
      }
    }

    const defaultTitle =
      finalType === 'pdf'
        ? 'Dokumen PDF Modul'
        : finalType === 'youtube'
        ? 'Video Praktik Lapangan'
        : finalType === 'gdrive'
        ? 'Materi Google Drive'
        : 'Tautan Materi Web';

    const sourceTitle = urlInputTitle.trim() || urlVerificationResult?.titleSuggestion || defaultTitle;
    const previewUrl = urlVerificationResult?.previewUrl || (finalType === 'pdf' ? rawUrl : undefined);
    const canEmbed = urlVerificationResult?.canEmbed ?? (finalType === 'pdf' || finalType === 'youtube' || finalType === 'gdrive');

    if (editingSourceId) {
      // Update existing source
      setSources((prev) =>
        prev.map((s) =>
          s.id === editingSourceId
            ? {
                ...s,
                title: sourceTitle,
                url: rawUrl,
                sourceType: finalType,
                previewUrl,
                canEmbed,
                fileSize: urlVerificationResult?.fileSize || s.fileSize,
              }
            : s
        )
      );
      showNotification(`Tautan "${sourceTitle}" berhasil diperbarui.`);
    } else {
      // Add new source
      const newSource: MaterialSource = {
        id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: sourceTitle,
        url: rawUrl,
        sourceType: finalType,
        previewUrl,
        canEmbed,
        fileSize: urlVerificationResult?.fileSize,
        orderIndex: sources.length + 1,
        createdAt: new Date().toISOString(),
      };
      setSources((prev) => [...prev, newSource]);
      showNotification(`Tautan "${sourceTitle}" berhasil ditambahkan.`);
    }

    // Auto-sync primary pdfUrl or videoUrl for convenience
    if (finalType === 'pdf' && !formData.pdfUrl) {
      setFormData((prev) => ({ ...prev, pdfUrl: rawUrl }));
    } else if (finalType === 'youtube' && !formData.videoUrl) {
      setFormData((prev) => ({ ...prev, videoUrl: previewUrl || rawUrl }));
    }

    resetUrlSubForm();
  };

  const handleEditSource = (s: MaterialSource) => {
    setUrlInputTitle(s.title);
    setUrlInputUrl(s.url);
    setUrlInputType(s.sourceType);
    setEditingSourceId(s.id);
    setUrlVerificationResult(null);
    setUrlVerificationError(null);
    setActiveSourceSection('url');
  };

  const handleRemoveSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    if (editingSourceId === id) {
      resetUrlSubForm();
    }
    showNotification('Tautan sumber materi dihapus.');
  };

  // -------------------------------------------------------------
  // FILE UPLOAD HANDLERS (Supabase Storage Cloud)
  // -------------------------------------------------------------
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFileUpload(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFileUpload = async (files: FileList | File[]) => {
    setIsUploadingFile(true);
    setUploadError(null);
    setUploadProgress(`Mengunggah 0/${files.length} file...`);

    try {
      const newAttachments = await uploadMultipleFiles(
        files,
        'documents',
        (processed, total) => {
          setUploadProgress(`Mengunggah ${processed}/${total} file...`);
        }
      );

      if (newAttachments.length > 0) {
        // Auto-set pdfUrl if a PDF is uploaded and pdfUrl is empty
        const firstPdf = newAttachments.find((a) => a.fileType === 'pdf');
        if (firstPdf && !formData.pdfUrl) {
          setFormData((prev) => ({ ...prev, pdfUrl: firstPdf.fileUrl }));
        }

        setAttachments((prev) => [...prev, ...newAttachments]);
        showNotification(`${newAttachments.length} file berkas modul berhasil diunggah.`);
      } else {
        setUploadError('Tidak ada file yang berhasil diunggah. Periksa koneksi internet Anda.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Gagal mengunggah file: ${msg}`);
    } finally {
      setIsUploadingFile(false);
      setUploadProgress('');
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadError(null);
    try {
      const result = await uploadFileToStorage(file, 'covers');
      setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      showNotification('Foto cover materi berhasil diunggah ke cloud storage.');
    } catch (err) {
      console.error('Cover upload error:', err);
      setUploadError('Gagal mengunggah foto cover.');
    } finally {
      setIsUploadingFile(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFileUpload(files);
    }
  }, [formData.pdfUrl]);

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    showNotification('Lampiran file dihapus.');
  };

  // -------------------------------------------------------------
  // SAVE MATERIAL (Async directly into Supabase database)
  // -------------------------------------------------------------
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block save while file upload is still in progress
    if (isUploadingFile) {
      showNotification('Tunggu hingga proses upload berkas selesai...');
      return;
    }

    if (!formData.title.trim()) {
      setUploadError('Judul materi pembelajaran wajib diisi.');
      return;
    }
    if (!formData.topic.trim()) {
      setUploadError('Topik / pokok bahasan wajib diisi.');
      return;
    }

    // Clean placeholder content
    let rawContent = formData.content.trim();
    if (
      rawContent === 'Tuliskan modul isi pembelajaran materi di sini...' ||
      rawContent.startsWith('Tuliskan modul isi') ||
      rawContent.includes('[Isi materi belum diisi]')
    ) {
      rawContent = '';
    }

    const hasText = rawContent.length > 0;
    const hasFiles = attachments.length > 0;
    const hasUrls = sources.length > 0 || Boolean(formData.pdfUrl) || Boolean(formData.videoUrl);

    // Rule: Minimal satu sumber: teks yang berisi, file terunggah, atau URL valid
    if (!hasText && !hasFiles && !hasUrls) {
      setUploadError(
        'Materi wajib memiliki minimal satu sumber pembelajaran: ketik isi materi, unggah file modul, atau tambahkan tautan URL.'
      );
      return;
    }

    let finalContent = rawContent;
    if (!finalContent) {
      if (hasUrls || hasFiles) {
        finalContent =
          'Modul materi pembelajaran dan berkas panduan lengkap dapat dipelajari melalui berkas lampiran atau tautan sumber materi di bawah ini.';
      }
    }

    setUploadError(null);
    setIsSaving(true);

    const selectedCat = categories.find((c) => c.id === formData.categoryId);
    const selectedCls = classes.find((c) => c.id === formData.targetClassId);
    const categoryName = selectedCat?.name || categories[0]?.name || 'Dasar-Dasar Agribisnis Tanaman';
    const targetClassName =
      formData.targetClassId === 'all'
        ? 'Semua Kelas'
        : selectedCls?.name || 'Semua Kelas';

    const objectives = formData.learningObjectivesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Strip large base64 data URLs to prevent quota errors
    const safeAttachments = attachments.map((att) => {
      const url = att?.fileUrl || '';
      if (typeof url === 'string' && url.startsWith('data:') && url.length > 262144) {
        return { ...att, fileUrl: '' };
      }
      return att;
    });

    let safePdfUrl = formData.pdfUrl || '';
    if (typeof safePdfUrl === 'string' && safePdfUrl.startsWith('data:') && safePdfUrl.length > 262144) {
      safePdfUrl = '';
    }

    // Auto-detect pdfUrl from sources if still blank
    if (!safePdfUrl && sources.length > 0) {
      const pdfSource = sources.find((s) => s.sourceType === 'pdf');
      if (pdfSource) {
        safePdfUrl = pdfSource.url;
      }
    }

    let safeImageUrl = formData.imageUrl || '';
    if (typeof safeImageUrl === 'string' && safeImageUrl.startsWith('data:') && safeImageUrl.length > 262144) {
      safeImageUrl = '';
    }

    try {
      const payload: Partial<TeachingMaterial> & { title: string; topic: string } = {
        id: editingMaterial?.id,
        title: formData.title.trim(),
        slug,
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        categoryName,
        targetClassId: formData.targetClassId,
        targetClassName,
        topic: formData.topic.trim(),
        learningObjectives: objectives,
        content: finalContent,
        imageUrl: safeImageUrl,
        videoUrl: formData.videoUrl,
        pdfUrl: safePdfUrl,
        attachments: safeAttachments,
        sources: sources,
        status: formData.status,
        orderIndex: Number(formData.orderIndex),
        createdAt: editingMaterial?.createdAt || new Date().toISOString(),
      };

      const result = await DataProvider.saveMaterialAsync(payload);

      if (!result.success) {
        setUploadError(result.error || 'Gagal menyimpan materi ke database Supabase.');
        setIsSaving(false);
        return;
      }

      showNotification(
        result.message ||
          (formData.status === 'published'
            ? 'Materi pembelajaran berhasil diterbitkan.'
            : 'Draf materi berhasil disimpan.')
      );
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      console.error('Failed to save material:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Gagal menyimpan materi: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus materi "${title}"?`)) {
      const res = await DataProvider.deleteMaterialAsync(id);
      if (res.success) {
        showNotification(`Materi "${title}" telah dihapus.`);
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus materi.');
      }
    }
  };

  const handleToggleStatus = async (m: TeachingMaterial) => {
    const newStatus = m.status === 'published' ? 'draft' : 'published';
    const res = await DataProvider.saveMaterialAsync({
      ...m,
      status: newStatus,
    });
    if (res.success) {
      showNotification(
        newStatus === 'published'
          ? `✅ Materi "${m.title}" kini diterbitkan dan terlihat oleh siswa.`
          : `📋 Materi "${m.title}" dijadikan draf — tersembunyi dari siswa.`
      );
      loadData();
    } else {
      alert(res.error || 'Gagal mengubah status materi.');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Manajemen Materi Pembelajaran ATPH"
        subtitle="Kelola modul pembelajaran, unggah file PDF/dokumen, cover gambar, video praktik, dan status rilis siswa"
        onRefresh={loadData}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {notification && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Filter & Action Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari materi atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              <option value="all">Semua Kategori (15 Modul)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              <option value="all">Semua Kelas Target</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Materi Baru</span>
          </button>
        </div>

        {/* FOLDER TABS KELAS X, XI, XII */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setSelectedFolder('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedFolder === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Semua Folder ({materials.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFolder('X')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedFolder === 'X'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            {selectedFolder === 'X' ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
            <span>Folder Kelas X ({countX})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFolder('XI')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedFolder === 'XI'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                : 'text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40'
            }`}
          >
            {selectedFolder === 'XI' ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
            <span>Folder Kelas XI ({countXI})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFolder('XII')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedFolder === 'XII'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            {selectedFolder === 'XII' ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
            <span>Folder Kelas XII ({countXII})</span>
          </button>
        </div>

        {/* Materials Table Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Modul Materi & Topik</th>
                  <th className="py-4 px-6">Kategori ATPH</th>
                  <th className="py-4 px-6">Folder & Kelas Target</th>
                  <th className="py-4 px-6">Berkas & Media</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Tidak ada materi yang sesuai kriteria pencarian di folder ini.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((m) => {
                    const gradeLevel = DataProvider.getMaterialGradeLevel(
                      m.targetClassId,
                      m.targetClassName
                    );

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6 max-w-sm">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {m.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            Topik: {m.topic}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                            {m.categoryName || 'ATPH'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                gradeLevel === 'XII'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                  : gradeLevel === 'XI'
                                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              }`}
                            >
                              <Folder className="w-3 h-3" />
                              <span>Folder Kelas {gradeLevel}</span>
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {m.targetClassName || 'Semua Kelas'}
                            </p>
                          </div>
                        </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                          {m.sources && m.sources.length > 0 && (
                            <span
                              title={`${m.sources.length} Tautan Sumber Terpasang`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md"
                            >
                              <LinkIcon className="w-3 h-3" />
                              <span>{m.sources.length} URL</span>
                            </span>
                          )}
                          {m.attachments && m.attachments.length > 0 && (
                            <span
                              title={`${m.attachments.length} Berkas Lampiran Terunggah`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md"
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{m.attachments.length} File</span>
                            </span>
                          )}
                          {m.videoUrl && (
                            <span title="Ada Video Tutorial">
                              <Video className="w-4 h-4 text-rose-500" />
                            </span>
                          )}
                          {m.pdfUrl && !m.attachments?.length && !m.sources?.some(s => s.sourceType === 'pdf') && (
                            <span title="Ada Dokumen PDF">
                              <FileText className="w-4 h-4 text-emerald-600" />
                            </span>
                          )}
                          {m.imageUrl && (
                            <span title="Ada Foto Cover">
                              <ImageIcon className="w-4 h-4 text-teal-600" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(m)}
                          title={m.status === 'published' ? 'Klik untuk jadikan draf (sembunyikan dari siswa)' : 'Klik untuk terbitkan (tampilkan ke siswa)'}
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all hover:scale-105 active:scale-95 ${
                            m.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                              : m.status === 'draft'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {m.status === 'published' ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          <span className="uppercase">{m.status === 'published' ? 'Published' : m.status === 'draft' ? 'Draft' : m.status}</span>
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          {m.status !== 'published' && (
                            <button
                              onClick={() => handleToggleStatus(m)}
                              title="Terbitkan sekarang ke siswa"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            >
                              <SendHorizonal className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(m)}
                            title="Edit Materi & Lampiran"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.title)}
                            title="Hapus Materi"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL EDITOR MATERI PEMBELAJARAN (DENGAN FITUR UPLOAD FILE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl my-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingMaterial ? 'Edit Modul Materi ATPH' : 'Buat Modul Materi Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lengkapi judul, modul teks, unggahan dokumen/PDF, dan media praktik
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Materi Pembelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Teknik Persemaian Bibit Cabai Hibrida"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori ATPH *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas Sasaran *
                  </label>
                  <select
                    value={formData.targetClassId}
                    onChange={(e) => setFormData({ ...formData, targetClassId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="all">Semua Kelas</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status Publikasi *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'published' | 'draft' | 'archived',
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="published">Terbitkan Langsung (Published)</option>
                    <option value="draft">Simpan Draf (Siswa tidak melihat)</option>
                    <option value="archived">Arsipkan (Archived)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topik / Pokok Bahasan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Contoh: Media Semai Tray & Sungkup Plastik"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Singkat Materi
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ringkasan materi yang tampil pada kartu pratinjau siswa..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* ============================================================= */}
              {/* SEKSI PILIHAN SUMBER MATERI (URL, FILE UPLOAD, TEKS) */}
              {/* ============================================================= */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Sumber Pembelajaran Materi *</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih dan tambahkan sumber belajar melalui tautan URL, unggahan file modul, atau teks panduan.
                    </p>
                  </div>
                </div>

                {/* TAB PEMILIH TIPE SUMBER */}
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setActiveSourceSection('url')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeSourceSection === 'url'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Tautan URL</span>
                    {sources.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] flex items-center justify-center font-extrabold">
                        {sources.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSourceSection('upload')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeSourceSection === 'upload'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Unggah File</span>
                    {attachments.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] flex items-center justify-center font-extrabold">
                        {attachments.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSourceSection('text')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeSourceSection === 'text'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tulis Teks</span>
                  </button>
                </div>

                {/* 1. KONTEN TAB: SUMBER TAUTAN URL */}
                {activeSourceSection === 'url' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {editingSourceId ? 'Edit Tautan Sumber Materi' : 'Tambah Tautan Sumber Materi (URL)'}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                        PDF • YouTube • Google Drive • Dokumen • Web
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Judul Tautan / Sumber Materi
                        </label>
                        <input
                          type="text"
                          value={urlInputTitle}
                          onChange={(e) => setUrlInputTitle(e.target.value)}
                          placeholder="Contoh: Modul Pembelajaran Hidroponik (PDF) / Video Praktik NFT"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Alamat URL Sumber *
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              value={urlInputUrl}
                              onChange={(e) => {
                                setUrlInputUrl(e.target.value);
                                setUrlVerificationResult(null);
                                setUrlVerificationError(null);
                              }}
                              placeholder="https://edu-atph.vercel.app/materials/... atau https://drive.google.com/..."
                              className="w-full pl-3.5 pr-24 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyUrl}
                              disabled={isVerifyingUrl || !urlInputUrl.trim()}
                              className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-700 hover:text-emerald-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                              title="Periksa validitas URL, proteksi SSRF, dan tipe konten di server"
                            >
                              {isVerifyingUrl ? (
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                              ) : (
                                <RefreshCw className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>{isVerifyingUrl ? 'Memeriksa...' : 'Periksa'}</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Jenis Sumber
                          </label>
                          <select
                            value={urlInputType}
                            onChange={(e) => setUrlInputType(e.target.value as MaterialSourceType | 'auto')}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="auto">🔍 Otomatis (Deteksi)</option>
                            <option value="pdf">📄 Dokumen PDF (.pdf)</option>
                            <option value="youtube">▶️ Video YouTube</option>
                            <option value="gdrive">📁 Google Drive</option>
                            <option value="document">📑 Dokumen / Slide</option>
                            <option value="webpage">🌐 Halaman Web</option>
                          </select>
                        </div>
                      </div>

                      {/* HASIL PEMERIKSAAN TAUTAN (VERIFICATION BANNER) */}
                      {urlVerificationError && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{urlVerificationError}</span>
                        </div>
                      )}

                      {urlVerificationResult && (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-[11px] space-y-1">
                          <div className="flex items-center gap-2 font-bold">
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{urlVerificationResult.statusMessage}</span>
                            <span className="uppercase text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-200/80 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-extrabold">
                              {urlVerificationResult.sourceType}
                            </span>
                          </div>
                          {urlVerificationResult.warning && (
                            <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium pl-6">
                              ⚠️ {urlVerificationResult.warning}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        {editingSourceId && (
                          <button
                            type="button"
                            onClick={resetUrlSubForm}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                          >
                            Batal Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAddOrUpdateSource}
                          disabled={!urlInputUrl.trim()}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{editingSourceId ? 'Perbarui Tautan' : 'Tambah Tautan ke Materi'}</span>
                        </button>
                      </div>
                    </div>

                    {/* DAFTAR TAUTAN SUMBER YANG SUDAH DITAMBAHKAN */}
                    {sources.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40">
                        <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span>Daftar Tautan Sumber Terpasang ({sources.length}):</span>
                        </label>
                        <div className="grid gap-2">
                          {sources.map((src, idx) => (
                            <div
                              key={src.id}
                              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                                  {src.sourceType === 'pdf' ? (
                                    <FileText className="w-4 h-4 text-rose-500" />
                                  ) : src.sourceType === 'youtube' ? (
                                    <Video className="w-4 h-4 text-red-500" />
                                  ) : src.sourceType === 'gdrive' ? (
                                    <Folder className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <Globe className="w-4 h-4 text-teal-600" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {src.title}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-sm sm:max-w-md">
                                    {src.url}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Buka tautan di tab baru"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleEditSource(src)}
                                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Edit tautan ini"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSource(src.id)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                  title="Hapus tautan ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. KONTEN TAB: UNGGAH BERKAS FILE */}
                {activeSourceSection === 'upload' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <label className="text-xs font-bold text-slate-900 dark:text-white">
                          Unggah File Modul / Berkas Materi (PDF, Dokumen, dll.)
                        </label>
                      </div>
                      <button
                        type="button"
                        disabled={isUploadingFile}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-wait text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        {isUploadingFile ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingFile ? uploadProgress || 'Mengunggah...' : 'Pilih & Upload File'}</span>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt,.rar,.7z"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />

                    <p className="text-[11px] text-slate-500">
                      File diunggah ke Supabase Cloud Storage — siswa dapat langsung membaca/mengunduh (PDF, Word, PPTX, Excel, ZIP).
                    </p>

                    {/* Uploaded Attachments List */}
                    {attachments.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {att.name}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Ukuran: {att.fileSize} • Tipe: {att.fileType.toUpperCase()}
                                  {att.fileUrl?.includes('supabase.co') && (
                                    <span className="ml-1 text-emerald-600 font-semibold">• ☁ Cloud</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={att.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={att.name}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800"
                                title="Unduh Berkas"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(att.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800"
                                title="Hapus Lampiran"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          disabled={isUploadingFile}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full p-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
                        >
                          + Tambah file lainnya
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => !isUploadingFile && fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer bg-white dark:bg-slate-900 transition-all ${
                          isDragging
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.01]'
                            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        {isUploadingFile ? (
                          <>
                            <Loader2 className="w-6 h-6 mx-auto text-emerald-600 mb-2 animate-spin" />
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              {uploadProgress || 'Sedang mengunggah file ke cloud...'}
                            </p>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Klik atau seret file ke area ini untuk mengunggah
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Bisa pilih satu atau beberapa file sekaligus (maks. 50MB per file)
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. KONTEN TAB: TULIS TEKS / PANDUAN */}
                {activeSourceSection === 'text' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Isi Materi Pembelajaran (Teks Rich Markdown)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Opsional jika sudah ada sumber tautan URL atau file berkas
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Ketik modul pembelajaran di sini menggunakan format Markdown (# Judul, ## Subjudul, - Poin, **Tebal**)..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              {/* SEKSI UNGGAH GAMBAR COVER & ILUSTRASI */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Foto Cover / Ilustrasi Header</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Unggah dari Komputer
                  </button>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />

                {formData.imageUrl ? (
                  <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group">
                    <img
                      src={formData.imageUrl}
                      alt="Preview Cover"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-rose-600 text-white shadow-xs"
                      title="Hapus Foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 bg-white dark:bg-slate-900 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Klik untuk unggah foto dari komputer
                    </p>
                  </div>
                )}

                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Atau tempel URL foto online (https://...)"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tujuan Pembelajaran (1 baris per poin)
                </label>
                <textarea
                  rows={2}
                  value={formData.learningObjectivesText}
                  onChange={(e) => setFormData({ ...formData, learningObjectivesText: e.target.value })}
                  placeholder="1. Siswa mampu memahami...\n2. Siswa dapat mempraktikkan..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              {/* Save validation error banner */}
              {uploadError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                {editingMaterial ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingMaterial.id, editingMaterial.title)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Materi</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingFile || isSaving}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] flex items-center gap-2"
                  >
                    {(isUploadingFile || isSaving) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {isSaving
                        ? 'Menyimpan ke Supabase...'
                        : editingMaterial
                        ? 'Perbarui Materi'
                        : formData.status === 'published'
                        ? 'Terbitkan Materi'
                        : 'Simpan Draf Materi'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
