'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Save,
  Send,
  BookOpen,
  FileText,
  UserCheck,
  Clock,
  Sliders,
  Eye,
  EyeOff,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  AlertTriangle,
  Unlock,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import {
  QuizQuestion,
  QuizWeightsConfig,
  ControlledExamConfig,
  ExamSessionRecord,
  RubricBreakdown,
} from '@/types';
import {
  HIDROPONIK_XI_QUIZ,
  HIDROPONIK_XI_QUESTIONS,
} from '@/lib/hidroponik-xi-data';

interface EditableGradeItem {
  teacherScore: number | null; // null = "Belum dinilai"
  teacherNote: string;
}

export default function HidroponikTeacherGradingPanel() {
  const [activeTab, setActiveTab] = useState<'grading' | 'controlled_exam' | 'key_rubric'>('grading');
  const [attempts, setAttempts] = useState<any[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSessionRecord[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>('');
  const [loadingAttempts, setLoadingAttempts] = useState<boolean>(true);

  // Controlled Exam Mode config state for teacher
  const [examConfig, setExamConfig] = useState<ControlledExamConfig>({
    enabled: true,
    requireFullscreen: true,
    maxViolations: 3,
    violationAction: 'warn_only',
  });
  const [examConfigStatus, setExamConfigStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [examConfigMessage, setExamConfigMessage] = useState<string>('');
  const [resumingStudentId, setResumingStudentId] = useState<string | null>(null);

  // Editable state per questionId for the currently selected attempt
  const [gradeEdits, setGradeEdits] = useState<Record<string, EditableGradeItem>>({});
  const [weights, setWeights] = useState<QuizWeightsConfig>({
    mcqWeight: 30,
    essayWeight: 40,
    caseStudyWeight: 30,
  });
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [allowStudentReview, setAllowStudentReview] = useState<boolean>(false);

  // AI grading status
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [aiMessage, setAiMessage] = useState<string>('');
  const [aiLoadingQuestionId, setAiLoadingQuestionId] = useState<string | null>(null);

  // Save / Publish status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'published' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Collapsible key/rubric per question in grading view
  const [openRubricMap, setOpenRubricMap] = useState<Record<string, boolean>>({});

  const questionsMap = useMemo(() => {
    const map = new Map<string, QuizQuestion>();
    HIDROPONIK_XI_QUESTIONS.forEach((q) => map.set(q.id, q));
    return map;
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const user = DataProvider.getCurrentUser();
    const sessionHeader = encodeURIComponent(
      JSON.stringify({
        id: user?.id || 'usr-admin-okta',
        email: user?.email || 'okta.nofiyanto@eduatph.sch.id',
        fullName: user?.fullName || 'Okta Nofiyanto',
        role: user?.role === 'student' ? 'teacher' : user?.role || 'admin',
      })
    );
    return {
      'Content-Type': 'application/json',
      'x-edu-session': sessionHeader,
      'x-edu-role-hint': 'teacher',
    };
  }, []);

  const hydrateAttemptIntoForm = useCallback((att: any) => {
    if (!att) return;
    const map: Record<string, EditableGradeItem> = {};
    (att.answers || []).forEach((ans: any) => {
      const q = HIDROPONIK_XI_QUESTIONS.find((item) => item.id === ans.questionId);
      const qType = ans.questionType || q?.questionType || 'multiple_choice';
      if (qType === 'essay' || qType === 'case_study') {
        const hasValidScore =
          ans.teacherScore !== null &&
          ans.teacherScore !== undefined &&
          ans.teacherScore !== '' &&
          !Number.isNaN(Number(ans.teacherScore));
        map[ans.questionId] = {
          teacherScore: hasValidScore ? Math.round(Number(ans.teacherScore)) : null,
          teacherNote: ans.teacherNote || '',
        };
      }
    });
    setGradeEdits(map);
    if (att.weightsConfig) {
      setWeights({
        mcqWeight: Number(att.weightsConfig.mcqWeight ?? 30),
        essayWeight: Number(att.weightsConfig.essayWeight ?? 40),
        caseStudyWeight: Number(att.weightsConfig.caseStudyWeight ?? 30),
      });
    }
    setTeacherNotes(att.teacherNotes || '');
    setAllowStudentReview(Boolean(att.allowStudentReview));
  }, []);

  const fetchAttempts = useCallback(
    async (keepSelectedId?: string) => {
      setLoadingAttempts(true);
      try {
        const res = await fetch('/api/admin/quiz-attempts?quizId=quiz-hidroponik-xi', {
          headers: getAuthHeaders(),
          cache: 'no-store',
        });
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data)) {
          setAttempts(json.data);
          if (Array.isArray(json.examSessions)) {
            setExamSessions(json.examSessions);
          }
          const targetId =
            keepSelectedId && json.data.some((a: any) => a.id === keepSelectedId)
              ? keepSelectedId
              : selectedAttemptId && json.data.some((a: any) => a.id === selectedAttemptId)
              ? selectedAttemptId
              : json.data[0]?.id || '';
          if (targetId) {
            setSelectedAttemptId(targetId);
            const found = json.data.find((a: any) => a.id === targetId);
            if (found) hydrateAttemptIntoForm(found);
          }
        }

        // Also fetch current quiz settings including controlledExamConfig
        const quizRes = await fetch('/api/quizzes/quiz-hidroponik-xi', {
          headers: getAuthHeaders(),
          cache: 'no-store',
        });
        const quizJson = await quizRes.json();
        if (quizRes.ok && quizJson.success && quizJson.quiz?.controlledExamConfig) {
          setExamConfig(quizJson.quiz.controlledExamConfig);
        }
      } catch (err) {
        console.warn('Failed to fetch Hidroponik attempts:', err);
      } finally {
        setLoadingAttempts(false);
      }
    },
    [getAuthHeaders, hydrateAttemptIntoForm, selectedAttemptId]
  );

  useEffect(() => {
    fetchAttempts();
  }, []);

  const selectedAttempt = useMemo(
    () => attempts.find((a) => a.id === selectedAttemptId) || null,
    [attempts, selectedAttemptId]
  );

  const handleSelectAttempt = (id: string) => {
    setSelectedAttemptId(id);
    setAiStatus('idle');
    setAiMessage('');
    setSaveStatus('idle');
    setSaveMessage('');
    const found = attempts.find((a) => a.id === id);
    if (found) {
      hydrateAttemptIntoForm(found);
    }
  };

  // --- KONTROL NILAI GURU (Input Angka + Tombol ▲ +1 dan ▼ -1) ---
  const handleSetScoreDirect = (questionId: string, rawValue: string) => {
    if (rawValue.trim() === '') {
      setGradeEdits((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId] || { teacherNote: '' }),
          teacherScore: null, // "Belum dinilai"
        },
      }));
      setSaveStatus('idle');
      return;
    }

    const parsed = parseInt(rawValue, 10);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(0, Math.min(100, parsed));
    setGradeEdits((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { teacherNote: '' }),
        teacherScore: clamped,
      },
    }));
    setSaveStatus('idle');
  };

  const handleStepScore = (questionId: string, delta: 1 | -1, fallbackAiScore?: number | null) => {
    setGradeEdits((prev) => {
      const currentObj = prev[questionId] || { teacherScore: null, teacherNote: '' };
      const baseValue =
        currentObj.teacherScore !== null && currentObj.teacherScore !== undefined
          ? currentObj.teacherScore
          : fallbackAiScore !== null && fallbackAiScore !== undefined
          ? fallbackAiScore
          : delta > 0
          ? 0
          : 0;
      const nextValue = Math.max(0, Math.min(100, Math.round(baseValue + delta)));
      return {
        ...prev,
        [questionId]: {
          ...currentObj,
          teacherScore: nextValue,
        },
      };
    });
    setSaveStatus('idle');
  };

  const handleUseAiSuggestion = (questionId: string, aiScore: number | null | undefined) => {
    if (aiScore === null || aiScore === undefined) return;
    const clamped = Math.max(0, Math.min(100, Math.round(Number(aiScore))));
    setGradeEdits((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { teacherNote: '' }),
        teacherScore: clamped,
      },
    }));
    setSaveStatus('idle');
  };

  const handleSetTeacherNote = (questionId: string, note: string) => {
    setGradeEdits((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { teacherScore: null }),
        teacherNote: note,
      },
    }));
    setSaveStatus('idle');
  };

  // --- PRATINJAU REKAP NILAI SECARA REAL-TIME ---
  const livePreview = useMemo(() => {
    if (!selectedAttempt) {
      return null;
    }

    const answers = selectedAttempt.answers || [];
    const mcqAnswers = answers.filter((a: any) => {
      const q = questionsMap.get(a.questionId);
      const t = a.questionType || q?.questionType || 'multiple_choice';
      return t === 'multiple_choice' || t === 'true_false';
    });

    const mcqCorrectCount =
      selectedAttempt.mcqCorrectCount ??
      mcqAnswers.filter((a: any) => a.isCorrect).length;
    const mcqTotalCount = mcqAnswers.length || 10;

    // Rumus sesuai instruksi: Nilai pilihan ganda = jumlah jawaban benar ÷ 10 × 100
    const rawMcqFormula = (mcqCorrectCount / 10) * 100;
    const mcqScore = Math.max(0, Math.min(100, Math.round(rawMcqFormula * 100) / 100));

    const essayQuestions = HIDROPONIK_XI_QUESTIONS.filter((q) => q.questionType === 'essay');
    const caseQuestions = HIDROPONIK_XI_QUESTIONS.filter((q) => q.questionType === 'case_study');

    const essayScores: number[] = [];
    let ungradedEssays = 0;
    essayQuestions.forEach((q) => {
      const s = gradeEdits[q.id]?.teacherScore;
      if (s === null || s === undefined || Number.isNaN(Number(s))) {
        ungradedEssays++;
      } else {
        essayScores.push(Number(s));
      }
    });

    const caseScores: number[] = [];
    let ungradedCases = 0;
    caseQuestions.forEach((q) => {
      const s = gradeEdits[q.id]?.teacherScore;
      if (s === null || s === undefined || Number.isNaN(Number(s))) {
        ungradedCases++;
      } else {
        caseScores.push(Number(s));
      }
    });

    const ungradedTotal = ungradedEssays + ungradedCases;
    const isComplete = ungradedTotal === 0;

    const essayAvg =
      essayScores.length === essayQuestions.length && essayQuestions.length > 0
        ? Math.round((essayScores.reduce((a, b) => a + b, 0) / essayQuestions.length) * 100) / 100
        : null;

    const caseAvg =
      caseScores.length === caseQuestions.length && caseQuestions.length > 0
        ? Math.round((caseScores.reduce((a, b) => a + b, 0) / caseQuestions.length) * 100) / 100
        : null;

    const weightSum =
      Math.round(
        (Number(weights.mcqWeight) || 0) +
          (Number(weights.essayWeight) || 0) +
          (Number(weights.caseStudyWeight) || 0)
      );
    const isWeightValid = weightSum === 100;

    let finalScore: number | null = null;
    if (isComplete && isWeightValid && essayAvg !== null && caseAvg !== null) {
      const weighted =
        mcqScore * (Number(weights.mcqWeight) / 100) +
        essayAvg * (Number(weights.essayWeight) / 100) +
        caseAvg * (Number(weights.caseStudyWeight) / 100);
      finalScore = Math.round(weighted * 100) / 100;
    }

    return {
      mcqCorrectCount,
      mcqTotalCount,
      rawMcqFormula: Math.round(rawMcqFormula * 100) / 100,
      mcqScore,
      essayAvg,
      caseAvg,
      gradedEssayCount: essayScores.length,
      totalEssayCount: essayQuestions.length,
      gradedCaseCount: caseScores.length,
      totalCaseCount: caseQuestions.length,
      ungradedTotal,
      isComplete,
      weightSum,
      isWeightValid,
      finalScore,
    };
  }, [selectedAttempt, gradeEdits, weights, questionsMap]);

  // --- BUAT PENILAIAN AI (Tanpa Menimpa Nilai Akhir Guru!) ---
  const handleRunAiGrading = async (targetQuestionId?: string) => {
    if (!selectedAttempt) return;
    setAiStatus('loading');
    setAiMessage('Menganalisis jawaban siswa berdasarkan materi PDF, kunci jawaban, dan rubrik 4 aspek...');
    if (targetQuestionId) setAiLoadingQuestionId(targetQuestionId);

    try {
      const res = await fetch('/api/quizzes/ai-grade', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          attemptId: selectedAttempt.id,
          questionId: targetQuestionId,
          clientAttemptSnapshot: selectedAttempt,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal membuat penilaian AI.');
      }

      // Perbarui data attempt (aiScore, aiRubricBreakdown, aiReasoning, aiImprovement)
      // PENTING: JANGAN menimpa gradeEdits (teacherScore) yang sudah diisi guru!
      const updatedAttempt = json.attempt;
      setAttempts((prev) =>
        prev.map((a) => (a.id === updatedAttempt.id ? updatedAttempt : a))
      );

      setAiStatus('success');
      setAiMessage(
        json.message ||
          'Saran Penilaian AI berhasil dibuat! Nilai akhir guru yang telah diisi tidak ditimpa.'
      );
    } catch (err: any) {
      setAiStatus('error');
      setAiMessage(
        err?.message ||
          'Penilaian AI gagal dijalankan. Silakan klik "Coba Lagi" atau lanjutkan penilaian manual.'
      );
    } finally {
      setAiLoadingQuestionId(null);
    }
  };

  // --- SIMPAN PENILAIAN / TERBITKAN NILAI ---
  const handleSaveOrPublish = async (action: 'save' | 'publish') => {
    if (!selectedAttempt) return;

    if (!livePreview?.isWeightValid) {
      setSaveStatus('error');
      setSaveMessage(
        `Gagal menyimpan: Total bobot saat ini ${livePreview?.weightSum ?? 0}%. Jumlah bobot PG, Uraian, dan Studi Kasus harus tepat 100%.`
      );
      return;
    }

    if (action === 'publish' && !livePreview?.isComplete) {
      setSaveStatus('error');
      setSaveMessage(
        `Tidak dapat menerbitkan nilai: Penilaian belum lengkap (${livePreview?.ungradedTotal} jawaban masih "Belum dinilai").`
      );
      return;
    }

    setSaveStatus('saving');
    setSaveMessage(
      action === 'publish'
        ? 'Menyimpan dan menerbitkan nilai akhir ke portal siswa...'
        : 'Menyimpan penilaian guru ke server...'
    );

    const user = DataProvider.getCurrentUser();
    const graderName = user?.fullName || 'Okta Nofiyanto (Guru ATPH)';

    const gradesPayload = Object.entries(gradeEdits).map(([questionId, item]) => ({
      questionId,
      teacherScore: item.teacherScore,
      teacherNote: item.teacherNote,
    }));

    try {
      const res = await fetch('/api/quizzes/grade', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          attemptId: selectedAttempt.id,
          action,
          grades: gradesPayload,
          weightsConfig: weights,
          teacherNotes,
          allowStudentReview,
          graderName,
          clientAttemptSnapshot: selectedAttempt,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan penilaian ke server.');
      }

      const updatedAttempt = json.attempt;
      setAttempts((prev) =>
        prev.map((a) => (a.id === updatedAttempt.id ? updatedAttempt : a))
      );
      hydrateAttemptIntoForm(updatedAttempt);

      setSaveStatus(action === 'publish' ? 'published' : 'saved');
      setSaveMessage(json.message || 'Penilaian berhasil disimpan.');
    } catch (err: any) {
      // Pertahankan input guru jika penyimpanan gagal!
      setSaveStatus('error');
      setSaveMessage(
        err?.message || 'Gagal menyimpan penilaian. Input nilai Anda tetap dipertahankan.'
      );
    }
  };

  // --- PENGATURAN MODE UJIAN TERKONTROL & IZINKAN SISWA LANJUT ---
  const handleSaveExamConfig = async () => {
    setExamConfigStatus('saving');
    setExamConfigMessage('Menyimpan pengaturan Mode Ujian Terkontrol...');
    try {
      const res = await fetch('/api/quizzes/quiz-hidroponik-xi', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          controlledExamConfig: examConfig,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan pengaturan ujian.');
      }
      if (json.settings?.controlledExamConfig) {
        setExamConfig(json.settings.controlledExamConfig);
      }
      setExamConfigStatus('saved');
      setExamConfigMessage('Pengaturan Mode Ujian Terkontrol berhasil disimpan.');
    } catch (err: any) {
      setExamConfigStatus('error');
      setExamConfigMessage(err?.message || 'Gagal menyimpan pengaturan Mode Ujian Terkontrol.');
    }
  };

  const handleAllowStudentResume = async (studentId: string, studentName?: string) => {
    setResumingStudentId(studentId);
    try {
      const res = await fetch('/api/quizzes/session', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'teacher_resume',
          quizId: 'quiz-hidroponik-xi',
          studentId,
          extraMinutes: 20,
          note: `Diizinkan melanjutkan pengerjaan oleh Guru setelah peninjauan kendala teknis`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal membuka kembali sesi ujian siswa.');
      }
      await fetchAttempts(selectedAttemptId);
      setSaveStatus('saved');
      setSaveMessage(
        `Sesi ujian ${studentName || 'siswa'} berhasil dibuka kembali (+20 menit waktu pengerjaan).`
      );
    } catch (err: any) {
      setSaveStatus('error');
      setSaveMessage(err?.message || 'Gagal membuka kembali sesi ujian.');
    } finally {
      setResumingStudentId(null);
    }
  };

  const subjectiveAnswers = useMemo(() => {
    if (!selectedAttempt) return [];
    const essayAndCaseQuestions = HIDROPONIK_XI_QUESTIONS.filter(
      (q) => q.questionType === 'essay' || q.questionType === 'case_study'
    );
    return essayAndCaseQuestions.map((q) => {
      const ans =
        (selectedAttempt.answers || []).find((a: any) => a.questionId === q.id) || {
          questionId: q.id,
          questionType: q.questionType,
          questionText: q.questionText,
          userAnswer: '',
          aiScore: null,
          aiRubricBreakdown: null,
          aiReasoning: null,
          aiImprovement: null,
          teacherScore: null,
          teacherNote: '',
        };
      return { question: q, answer: ans };
    });
  }, [selectedAttempt]);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-sky-200 dark:border-sky-800/70 shadow-lg overflow-hidden">
      {/* Header Banner Materi & Evaluasi Hidroponik Kelas XI */}
      <div className="p-6 bg-gradient-to-r from-sky-900 via-teal-900 to-emerald-900 text-white space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                Kelas XI SMK ATPH • Evaluasi Terpadu
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-sky-400/20 text-sky-200 border border-sky-400/30">
                10 PG (30%) • 5 Uraian (40%) • 2 Studi Kasus (30%)
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Mode Ujian Terkontrol</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {HIDROPONIK_XI_QUIZ.title}
            </h2>
            <p className="text-xs text-sky-100/80 max-w-3xl leading-relaxed">
              Dilengkapi Mode Ujian Terkontrol (Fullscreen & Pemantauan Perpindahan Halaman), koreksi otomatis Pilihan Ganda, Penilaian AI berbasis Rubrik 4 Aspek, Kontrol Nilai Guru (▲/▼ ±1 poin), dan Publikasi Nilai Terkontrol.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/materials/modul-hidroponik-kelas-xi-atph.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>Buka PDF Materi Hidroponik</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
            <Link
              href="/student/materials/mat-hidroponik-xi"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Halaman Modul Siswa</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/15">
          <button
            type="button"
            onClick={() => setActiveTab('grading')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'grading'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Penilaian Jawaban Siswa & AI ({attempts.length} Submisi)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('controlled_exam')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'controlled_exam'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Pengaturan & Pemantauan Mode Ujian Terkontrol</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('key_rubric')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'key_rubric'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Kunci Jawaban, Rubrik & Pembahasan Guru (17 Soal)</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: PENILAIAN JAWABAN SISWA, SARAN AI, KONTROL NILAI GURU, & REKAP */}
      {/* ===================================================================== */}
      {activeTab === 'grading' && (
        <div className="p-6 space-y-6">
          {/* Bar Pemilihan Submisi Siswa & Tombol Buat Penilaian AI */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <label
                htmlFor="select-student-attempt"
                className="text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap"
              >
                Pilih Jawaban Siswa:
              </label>
              <select
                id="select-student-attempt"
                value={selectedAttemptId}
                onChange={(e) => handleSelectAttempt(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white flex-1 max-w-md"
              >
                {attempts.map((att) => (
                  <option key={att.id} value={att.id}>
                    {att.studentName} ({att.className || 'XI AT 1'}) —{' '}
                    {att.isPublished
                      ? `Diterbitkan (${att.finalWeightedScore ?? att.score})`
                      : att.gradingStatus === 'complete'
                      ? `Draf Lengkap (${att.finalWeightedScore ?? '-'})`
                      : 'Penilaian belum lengkap'}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => fetchAttempts(selectedAttemptId)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                title="Muat ulang data dari server"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loadingAttempts ? 'animate-spin' : ''}`} />
                <span>Muat Ulang</span>
              </button>
            </div>

            {selectedAttempt && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={aiStatus === 'loading'}
                  onClick={() => handleRunAiGrading()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {aiStatus === 'loading' && !aiLoadingQuestionId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menilai dengan AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Buat Penilaian AI</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Banner Status Penilaian AI (Termasuk Tombol Coba Lagi jika gagal) */}
          {aiStatus !== 'idle' && (
            <div
              className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                aiStatus === 'loading'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
                  : aiStatus === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2.5 font-bold">
                {aiStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                {aiStatus === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {aiStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{aiMessage}</span>
              </div>
              {aiStatus === 'error' && (
                <button
                  type="button"
                  onClick={() => handleRunAiGrading()}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Coba Lagi</span>
                </button>
              )}
            </div>
          )}

          {selectedAttempt && livePreview ? (
            <>
              {/* ================================================================= */}
              {/* PANEL PEMANTAUAN MODE UJIAN TERKONTROL (DETAIL PENGERJAAN SISWA) */}
              {/* ================================================================= */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                        <span>Log Pemantauan Mode Ujian Terkontrol: {selectedAttempt.studentName}</span>
                        {(selectedAttempt.needsReview ||
                          (selectedAttempt.violationCount ?? 0) > 0 ||
                          selectedAttempt.autoSubmitted) && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Perlu ditinjau (Tidak otomatis nilai 0)</span>
                          </span>
                        )}
                        {selectedAttempt.autoSubmitted && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                            Dikumpulkan Otomatis (Batas Pelanggaran)
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Status Pengerjaan:{' '}
                        <strong>
                          {selectedAttempt.examSessionStatus === 'auto_submitted' ||
                          selectedAttempt.autoSubmitted
                            ? 'Dikumpulkan Otomatis oleh Sistem'
                            : selectedAttempt.examSessionStatus === 'resumed'
                            ? 'Diizinkan Melanjutkan Ujian'
                            : 'Terkumpul Normal'}
                        </strong>{' '}
                        • Perpindahan Terdeteksi:{' '}
                        <strong
                          className={
                            (selectedAttempt.violationCount ?? 0) > 0
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-emerald-600'
                          }
                        >
                          {selectedAttempt.violationCount ?? 0} / {examConfig.maxViolations} kali
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={resumingStudentId === selectedAttempt.studentId}
                      onClick={() =>
                        handleAllowStudentResume(
                          selectedAttempt.studentId,
                          selectedAttempt.studentName
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      title="Buka kunci sesi ujian dan beri waktu tambahan jika siswa mengalami kendala teknis"
                    >
                      {resumingStudentId === selectedAttempt.studentId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                      <span>Izinkan Siswa Lanjutkan Ujian</span>
                    </button>
                  </div>
                </div>

                {Array.isArray(selectedAttempt.violationEvents) &&
                selectedAttempt.violationEvents.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                      Riwayat Waktu, Durasi, dan Jenis Kejadian Perpindahan:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedAttempt.violationEvents.map((ev: any, idx: number) => (
                        <div
                          key={ev.id || idx}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[10px]">
                              #{idx + 1} •{' '}
                              {ev.type === 'fullscreen_exit'
                                ? 'Keluar Fullscreen'
                                : ev.type === 'extended_blur'
                                ? 'Fokus Hilang'
                                : 'Tab Tersembunyi'}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {ev.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span>
                              Waktu:{' '}
                              <strong>
                                {ev.occurredAt
                                  ? new Date(ev.occurredAt).toLocaleTimeString('id-ID')
                                  : '-'}
                              </strong>
                            </span>
                            {ev.durationSeconds !== undefined && ev.durationSeconds !== null && (
                              <span>
                                Durasi: <strong>{ev.durationSeconds} detik</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    Tidak ada perpindahan tab atau keluar layar penuh yang terdeteksi selama pengerjaan.
                  </p>
                )}
              </div>

              {/* ================================================================= */}
              {/* PANEL REKAP NILAI & PENGATURAN BOBOT (30% PG, 40% Uraian, 30% SK) */}
              {/* ================================================================= */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-teal-600" />
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Rekap Nilai Berbobot & Pratinjau Nilai Akhir
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Rumus: (Nilai PG × Bobot PG) + (Rata-rata Nilai Guru Uraian × Bobot Uraian) + (Rata-rata Nilai Guru Studi Kasus × Bobot Studi Kasus)
                      </p>
                    </div>
                  </div>

                  {/* Status Kelengkapan & Publikasi */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!livePreview.isComplete ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Penilaian belum lengkap ({livePreview.ungradedTotal} belum dinilai)</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Seluruh Jawaban Lengkap Dinilai</span>
                      </span>
                    )}

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border ${
                        selectedAttempt.isPublished
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300'
                      }`}
                    >
                      {selectedAttempt.isPublished ? 'Status: Nilai Diterbitkan' : 'Status: Draf Guru'}
                    </span>
                  </div>
                </div>

                {/* Pengaturan Bobot (Wajib berjumlah tepat 100%) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Card 1: Pilihan Ganda */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">1. Pilihan Ganda (10 Soal)</span>
                      <div className="flex items-center gap-1">
                        <label htmlFor="weight-mcq" className="text-[10px] font-bold text-slate-400">
                          Bobot:
                        </label>
                        <input
                          id="weight-mcq"
                          type="number"
                          min={0}
                          max={100}
                          value={weights.mcqWeight}
                          onChange={(e) =>
                            setWeights((w) => ({ ...w, mcqWeight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))
                          }
                          className="w-14 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-black text-center bg-slate-50 dark:bg-slate-800"
                        />
                        <span className="text-xs font-bold">%</span>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {livePreview.mcqScore}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Benar: <strong>{livePreview.mcqCorrectCount}</strong> dari {livePreview.mcqTotalCount} soal ({livePreview.mcqCorrectCount} ÷ 10 × 100 = {livePreview.rawMcqFormula})
                    </p>
                  </div>

                  {/* Card 2: Rata-rata Uraian */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">2. Rata-rata Uraian (5 Soal)</span>
                      <div className="flex items-center gap-1">
                        <label htmlFor="weight-essay" className="text-[10px] font-bold text-slate-400">
                          Bobot:
                        </label>
                        <input
                          id="weight-essay"
                          type="number"
                          min={0}
                          max={100}
                          value={weights.essayWeight}
                          onChange={(e) =>
                            setWeights((w) => ({ ...w, essayWeight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))
                          }
                          className="w-14 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-black text-center bg-slate-50 dark:bg-slate-800"
                        />
                        <span className="text-xs font-bold">%</span>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {livePreview.essayAvg !== null ? (
                        livePreview.essayAvg
                      ) : (
                        <span className="text-sm font-bold text-amber-600">Belum dinilai</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Terperiksa: <strong>{livePreview.gradedEssayCount}</strong> / {livePreview.totalEssayCount} jawaban uraian
                    </p>
                  </div>

                  {/* Card 3: Rata-rata Studi Kasus */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">3. Studi Kasus (2 Soal)</span>
                      <div className="flex items-center gap-1">
                        <label htmlFor="weight-case" className="text-[10px] font-bold text-slate-400">
                          Bobot:
                        </label>
                        <input
                          id="weight-case"
                          type="number"
                          min={0}
                          max={100}
                          value={weights.caseStudyWeight}
                          onChange={(e) =>
                            setWeights((w) => ({
                              ...w,
                              caseStudyWeight: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                            }))
                          }
                          className="w-14 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-black text-center bg-slate-50 dark:bg-slate-800"
                        />
                        <span className="text-xs font-bold">%</span>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {livePreview.caseAvg !== null ? (
                        livePreview.caseAvg
                      ) : (
                        <span className="text-sm font-bold text-amber-600">Belum dinilai</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Terperiksa: <strong>{livePreview.gradedCaseCount}</strong> / {livePreview.totalCaseCount} studi kasus
                    </p>
                  </div>

                  {/* Card 4: Pratinjau Nilai Akhir */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-300 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                        Pratinjau Nilai Akhir
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          livePreview.isWeightValid
                            ? 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        Total Bobot: {livePreview.weightSum}%
                      </span>
                    </div>

                    {livePreview.finalScore !== null ? (
                      <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                        {livePreview.finalScore}
                      </div>
                    ) : (
                      <div className="text-sm font-black text-amber-700 dark:text-amber-300 py-1">
                        Penilaian belum lengkap
                      </div>
                    )}

                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {!livePreview.isWeightValid
                        ? 'Jumlah bobot wajib tepat 100%!'
                        : livePreview.finalScore !== null
                        ? `${livePreview.finalScore >= 75 ? 'Tuntas (≥ 75)' : 'Belum Tuntas (< 75)'}`
                        : 'Nilai akhir dihitung setelah semua soal dinilai.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* DAFTAR 5 JAWABAN URAIAN & 2 STUDI KASUS BESERTA KONTROL NILAI GURU */}
              {/* ================================================================= */}
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Pemeriksaan Jawaban Uraian (5 Soal) & Studi Kasus Pemecahan Masalah (2 Soal)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      subjectiveAnswers.forEach(({ question, answer }) => {
                        if (answer.aiScore !== null && answer.aiScore !== undefined) {
                          handleUseAiSuggestion(question.id, answer.aiScore);
                        }
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gunakan Semua Saran AI yang Tersedia</span>
                  </button>
                </div>

                {subjectiveAnswers.map(({ question, answer }, index) => {
                  const editState = gradeEdits[question.id] || {
                    teacherScore: null,
                    teacherNote: '',
                  };
                  const currentTeacherScore = editState.teacherScore;
                  const isGraded =
                    currentTeacherScore !== null &&
                    currentTeacherScore !== undefined &&
                    !Number.isNaN(Number(currentTeacherScore));

                  const breakdown: RubricBreakdown | null =
                    answer.aiRubricBreakdown || null;
                  const hasAiScore =
                    answer.aiScore !== null && answer.aiScore !== undefined;
                  const isRubricOpen = Boolean(openRubricMap[question.id]);

                  return (
                    <div
                      key={question.id}
                      data-testid={`grading-card-${question.id}`}
                      className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
                    >
                      {/* Card Top Bar */}
                      <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                              question.questionType === 'case_study'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300'
                                : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300'
                            }`}
                          >
                            {question.questionType === 'case_study'
                              ? `Studi Kasus ${index - 4}`
                              : `Soal Uraian ${index + 1}`}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            Skala Nilai: 0–100
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenRubricMap((prev) => ({
                                ...prev,
                                [question.id]: !prev[question.id],
                              }))
                            }
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Kunci & Rubrik</span>
                            {isRubricOpen ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isGraded ? (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                              Nilai Guru: {currentTeacherScore} / 100
                            </span>
                          ) : (
                            <span
                              data-testid={`status-ungraded-${question.id}`}
                              className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                            >
                              Belum dinilai
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        {/* Konteks Studi Kasus & Pertanyaan */}
                        {question.caseStudyContext && (
                          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/70 text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                            {question.caseStudyContext}
                          </div>
                        )}
                        <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-pre-line leading-relaxed">
                          {question.questionText}
                        </p>

                        {/* Collapsible Kunci Jawaban & Rubrik Guru */}
                        {isRubricOpen && (
                          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs">
                            <p className="font-black text-amber-900 dark:text-amber-300">
                              Kunci Jawaban Ideal Guru:
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                              {question.correctAnswer}
                            </p>
                            {question.rubric && (
                              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                <div>
                                  <strong>• Ketepatan Konsep (0–40):</strong>{' '}
                                  {question.rubric.conceptAccuracy}
                                </div>
                                <div>
                                  <strong>• Kelengkapan Jawaban (0–30):</strong>{' '}
                                  {question.rubric.completeness}
                                </div>
                                <div>
                                  <strong>• Penalaran & Penerapan (0–20):</strong>{' '}
                                  {question.rubric.reasoning}
                                </div>
                                <div>
                                  <strong>• Kejelasan Penyampaian (0–10):</strong>{' '}
                                  {question.rubric.clarity}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Jawaban Siswa */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                            Jawaban Siswa:
                          </span>
                          {answer.userAnswer && answer.userAnswer.trim().length > 0 ? (
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed font-medium">
                              {answer.userAnswer}
                            </p>
                          ) : (
                            <p className="text-xs italic text-rose-600 dark:text-rose-400 font-semibold">
                              (Jawaban kosong — siswa tidak mengisi jawaban pada soal ini)
                            </p>
                          )}
                        </div>

                        {/* Grid: Panel Saran AI (Kiri) & Kontrol Nilai Akhir Guru (Kanan) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
                          {/* KIRI: Rincian Penilaian AI (7 Kolom) */}
                          <div className="lg:col-span-7 p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                                  Penilaian Saran AI (Rubrik Total 100)
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {hasAiScore && (
                                  <span
                                    data-testid={`ai-score-badge-${question.id}`}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-black"
                                  >
                                    Saran AI: {answer.aiScore} / 100
                                  </span>
                                )}
                                <button
                                  type="button"
                                  disabled={aiStatus === 'loading'}
                                  onClick={() => handleRunAiGrading(question.id)}
                                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 cursor-pointer"
                                >
                                  {aiLoadingQuestionId === question.id
                                    ? 'Menilai...'
                                    : hasAiScore
                                    ? 'Nilai Ulang AI'
                                    : 'Nilai Soal Ini (AI)'}
                                </button>
                              </div>
                            </div>

                            {hasAiScore && breakdown ? (
                              <div className="space-y-3 text-xs">
                                {/* 4 Aspek Rubrik */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60">
                                    <span className="text-[10px] text-slate-500 block">
                                      Ketepatan Konsep
                                    </span>
                                    <strong className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                                      {breakdown.conceptAccuracy} / 40
                                    </strong>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60">
                                    <span className="text-[10px] text-slate-500 block">
                                      Kelengkapan
                                    </span>
                                    <strong className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                                      {breakdown.completeness} / 30
                                    </strong>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60">
                                    <span className="text-[10px] text-slate-500 block">
                                      Penalaran & Terapan
                                    </span>
                                    <strong className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                                      {breakdown.reasoning} / 20
                                    </strong>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60">
                                    <span className="text-[10px] text-slate-500 block">
                                      Kejelasan Bahasa
                                    </span>
                                    <strong className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                                      {breakdown.clarity} / 10
                                    </strong>
                                  </div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 text-[11px]">
                                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                                    <strong className="text-indigo-700 dark:text-indigo-300">
                                      Alasan Penilaian AI:
                                    </strong>{' '}
                                    {answer.aiReasoning}
                                  </p>
                                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    <strong className="text-teal-700 dark:text-teal-300">
                                      Saran Perbaikan Singkat:
                                    </strong>{' '}
                                    {answer.aiImprovement}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  data-testid={`use-ai-btn-${question.id}`}
                                  onClick={() =>
                                    handleUseAiSuggestion(question.id, answer.aiScore)
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Gunakan Saran AI ({answer.aiScore})</span>
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic py-2">
                                Klik tombol <strong>&ldquo;Buat Penilaian AI&rdquo;</strong> di atas untuk menghasilkan rincian skor rubrik, nilai saran AI (0–100), alasan penilaian, dan saran perbaikan.
                              </p>
                            )}
                          </div>

                          {/* KANAN: Kontrol Nilai Akhir Guru + Tombol Vertikal ▲ dan ▼ (5 Kolom) */}
                          <div className="lg:col-span-5 p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label
                                  htmlFor={`teacher-score-input-${question.id}`}
                                  className="text-xs font-black text-slate-900 dark:text-white"
                                >
                                  Nilai Akhir Guru (0–100)
                                </label>
                                <span className="text-[11px] font-bold text-slate-500">
                                  {isGraded ? `Tersimpan/Aktif: ${currentTeacherScore}` : 'Status: Belum dinilai'}
                                </span>
                              </div>

                              {/* Input Angka + Dua Tombol Vertikal ▲ (+1) dan ▼ (-1) */}
                              <div className="flex items-stretch gap-2.5">
                                <div className="relative flex-1">
                                  <input
                                    id={`teacher-score-input-${question.id}`}
                                    data-testid={`teacher-score-input-${question.id}`}
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={1}
                                    placeholder="Belum dinilai (0-100)"
                                    value={
                                      currentTeacherScore !== null &&
                                      currentTeacherScore !== undefined
                                        ? String(currentTeacherScore)
                                        : ''
                                    }
                                    onChange={(e) =>
                                      handleSetScoreDirect(question.id, e.target.value)
                                    }
                                    aria-label={`Nilai Akhir Guru untuk ${question.id}`}
                                    className="w-full h-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg font-black text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none"
                                  />
                                </div>

                                {/* Dua Tombol Vertikal ▲ (Atas: +1) dan ▼ (Bawah: -1) */}
                                <div className="flex flex-col gap-1">
                                  <button
                                    type="button"
                                    data-testid={`btn-inc-${question.id}`}
                                    aria-label="Tambah nilai 1 poin (▲)"
                                    title="Tambah 1 poin (+1)"
                                    disabled={currentTeacherScore !== null && currentTeacherScore >= 100}
                                    onClick={() =>
                                      handleStepScore(question.id, 1, answer.aiScore)
                                    }
                                    className="min-w-[44px] min-h-[28px] px-3 py-1 rounded-t-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs flex items-center justify-center shadow-xs disabled:opacity-35 disabled:pointer-events-none cursor-pointer select-none"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    data-testid={`btn-dec-${question.id}`}
                                    aria-label="Kurangi nilai 1 poin (▼)"
                                    title="Kurangi 1 poin (-1)"
                                    disabled={currentTeacherScore !== null && currentTeacherScore <= 0}
                                    onClick={() =>
                                      handleStepScore(question.id, -1, answer.aiScore)
                                    }
                                    className="min-w-[44px] min-h-[28px] px-3 py-1 rounded-b-xl bg-slate-700 hover:bg-slate-800 active:scale-95 text-white font-black text-xs flex items-center justify-center shadow-xs disabled:opacity-35 disabled:pointer-events-none cursor-pointer select-none"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-500">
                                Ketik langsung bilangan bulat <strong>0–100</strong> atau gunakan tombol <strong>▲</strong> (+1 poin) dan <strong>▼</strong> (-1 poin).
                              </p>

                              {/* Catatan Guru per Jawaban */}
                              <div>
                                <label
                                  htmlFor={`teacher-note-${question.id}`}
                                  className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1"
                                >
                                  Catatan / Umpan Balik Guru (Opsional):
                                </label>
                                <input
                                  id={`teacher-note-${question.id}`}
                                  type="text"
                                  value={editState.teacherNote}
                                  onChange={(e) =>
                                    handleSetTeacherNote(question.id, e.target.value)
                                  }
                                  placeholder="Tambahkan catatan umpan balik untuk jawaban ini..."
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ================================================================= */}
              {/* CATATAN GURU, IDENTITAS PENILAI, PENGATURAN PEMBAHASAN & TOMBOL   */}
              {/* ================================================================= */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="general-teacher-notes"
                      className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Catatan Evaluasi Keseluruhan Guru:
                    </label>
                    <textarea
                      id="general-teacher-notes"
                      rows={2}
                      value={teacherNotes}
                      onChange={(e) => setTeacherNotes(e.target.value)}
                      placeholder="Tuliskan evaluasi umum atas penguasaan materi Hidroponik Kelas XI oleh siswa..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <div className="space-y-3 flex flex-col justify-between">
                    {/*Pengaturan Izin Siswa Melihat Pembahasan */}
                    <label className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowStudentReview}
                        onChange={(e) => setAllowStudentReview(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded accent-emerald-600"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                        <strong className="block text-slate-900 dark:text-white">
                          Izinkan Siswa Melihat Kunci Jawaban & Pembahasan Setelah Diterbitkan
                        </strong>
                        Kunci jawaban tidak pernah dikirim ke siswa sebelum nilai diterbitkan dan opsi ini diaktifkan guru.
                      </span>
                    </label>

                    {/* Info Identitas Penilai & Waktu Perubahan */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 px-1">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Penilai Terakhir:{' '}
                          <strong className="text-slate-700 dark:text-slate-200">
                            {selectedAttempt.gradedBy || 'Belum disimpan'}
                          </strong>
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>
                          Waktu Perubahan:{' '}
                          <strong className="text-slate-700 dark:text-slate-200">
                            {selectedAttempt.gradedAt
                              ? new Date(selectedAttempt.gradedAt).toLocaleString('id-ID')
                              : '-'}
                          </strong>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Penyimpanan / Publikasi */}
                {saveStatus !== 'idle' && (
                  <div
                    data-testid="save-status-banner"
                    className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                      saveStatus === 'saving'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : saveStatus === 'saved' || saveStatus === 'published'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-200'
                    }`}
                  >
                    {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {(saveStatus === 'saved' || saveStatus === 'published') && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    {saveStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{saveMessage}</span>
                  </div>
                )}

                {/* Action Buttons: Simpan Penilaian (Draf) & Terbitkan Nilai */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    data-testid="btn-save-grades"
                    disabled={saveStatus === 'saving' || !livePreview.isWeightValid}
                    onClick={() => handleSaveOrPublish('save')}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-black flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Penilaian</span>
                  </button>

                  <button
                    type="button"
                    data-testid="btn-publish-grades"
                    disabled={
                      saveStatus === 'saving' ||
                      !livePreview.isComplete ||
                      !livePreview.isWeightValid
                    }
                    onClick={() => handleSaveOrPublish('publish')}
                    title={
                      !livePreview.isComplete
                        ? 'Lengkapi seluruh penilaian uraian dan studi kasus terlebih dahulu'
                        : 'Terbitkan nilai agar dapat dilihat siswa'
                    }
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Terbitkan Nilai</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              {loadingAttempts
                ? 'Memuat data evaluasi Hidroponik Kelas XI...'
                : 'Belum ada data submisi siswa untuk evaluasi ini.'}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PENGATURAN & PEMANTAUAN MODE UJIAN TERKONTROL GURU */}
      {/* ===================================================================== */}
      {activeTab === 'controlled_exam' && (
        <div className="p-6 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Pengaturan Mode Ujian Terkontrol (Per Kuis)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Mencegah serta mencatat siswa meninggalkan halaman kuis sejauh kemampuan browser standar (visibilitychange, fullscreenchange, dan sinyal fokus).
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveExamConfig}
                disabled={examConfigStatus === 'saving'}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {examConfigStatus === 'saving' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Simpan Pengaturan Ujian</span>
              </button>
            </div>

            {examConfigStatus !== 'idle' && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  examConfigStatus === 'saved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200'
                    : examConfigStatus === 'saving'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{examConfigMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <label className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={examConfig.enabled}
                  onChange={(e) =>
                    setExamConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <strong className="text-slate-900 dark:text-white block">
                    Aktifkan Mode Ujian Terkontrol
                  </strong>
                  <span className="text-slate-500">
                    Tampilkan aturan sebelum mulai dan catat perpindahan halaman selama ujian berlangsung.
                  </span>
                </div>
              </label>

              <label className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={examConfig.requireFullscreen}
                  onChange={(e) =>
                    setExamConfig((prev) => ({ ...prev, requireFullscreen: e.target.checked }))
                  }
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <strong className="text-slate-900 dark:text-white block">
                    Wajib Layar Penuh (Fullscreen) Jika Didukung
                  </strong>
                  <span className="text-slate-500">
                    Meminta mode layar penuh saat siswa menekan tombol &ldquo;Mulai Kuis&rdquo;.
                  </span>
                </div>
              </label>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <label
                  htmlFor="input-max-violations"
                  className="font-bold text-slate-900 dark:text-white block"
                >
                  Batas Pelanggaran (Default: 3 kali)
                </label>
                <input
                  id="input-max-violations"
                  type="number"
                  min={1}
                  max={20}
                  value={examConfig.maxViolations}
                  onChange={(e) =>
                    setExamConfig((prev) => ({
                      ...prev,
                      maxViolations: Math.max(1, Math.min(20, Number(e.target.value) || 3)),
                    }))
                  }
                  className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-500">
                  Jumlah perpindahan tab/keluar layar penuh sebelum tindakan batas pelanggaran dijalankan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <label
                  htmlFor="select-violation-action"
                  className="font-bold text-slate-900 dark:text-white block"
                >
                  Tindakan Saat Batas Pelanggaran Tercapai
                </label>
                <select
                  id="select-violation-action"
                  value={examConfig.violationAction}
                  onChange={(e) =>
                    setExamConfig((prev) => ({
                      ...prev,
                      violationAction:
                        e.target.value === 'auto_submit' ? 'auto_submit' : 'warn_only',
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="warn_only">
                    a. Catat dan beri peringatan saja (Default — Aman dari gangguan teknis)
                  </option>
                  <option value="auto_submit">
                    b. Akhiri serta kumpulkan jawaban otomatis (Dikunci di server)
                  </option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Default menggunakan peringatan saja agar gangguan teknis tidak langsung mengakhiri ujian.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
              <strong>Catatan Kemampuan & Batasan Teknis Browser:</strong> Aplikasi web standar dapat mendeteksi saat tab disembunyikan (<code>visibilitychange</code>), keluar dari layar penuh (<code>fullscreenchange</code>), dan kehilangan fokus jendela, namun <strong>tidak dapat memblokir pintasan sistem operasi (seperti Alt+Tab) atau mengetahui aplikasi eksternal apa yang dibuka siswa</strong>. Catatan perpindahan digunakan sebagai indikator tinjauan guru (bukan bukti mutlak kecurangan). Untuk penguncian penuh tingkat perangkat diperlukan <em>Safe Exam Browser (SEB)</em> atau mode Kiosk sistem operasi.
            </div>
          </div>

          {/* Daftar Sesi Pengerjaan Siswa Aktif / Terkumpul */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Daftar Sesi Ujian & Riwayat Perpindahan Siswa
            </h3>
            <div className="space-y-3">
              {attempts.map((att) => (
                <div
                  key={att.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm font-black text-slate-900 dark:text-white">
                        {att.studentName} ({att.className || 'XI AT 1'})
                      </strong>
                      {(att.needsReview || (att.violationCount ?? 0) > 0 || att.autoSubmitted) && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
                          Perlu ditinjau
                        </span>
                      )}
                      {att.autoSubmitted && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                          Dikumpulkan Otomatis
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500">
                      Perpindahan Terdeteksi: <strong>{att.violationCount ?? 0}</strong> kali • Status:{' '}
                      <strong>
                        {att.autoSubmitted
                          ? 'Dikumpulkan Otomatis'
                          : att.examSessionStatus === 'resumed'
                          ? 'Diizinkan Lanjut'
                          : 'Terkumpul'}
                      </strong>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectAttempt(att.id);
                        setActiveTab('grading');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
                    >
                      Lihat Detail & Nilai
                    </button>
                    <button
                      type="button"
                      disabled={resumingStudentId === att.studentId}
                      onClick={() => handleAllowStudentResume(att.studentId, att.studentName)}
                      className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Izinkan Lanjut</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: KUNCI JAWABAN, RUBRIK & PEMBAHASAN GURU (10 PG + 5 URAIAN + 2 SK) */}
      {/* ===================================================================== */}
      {activeTab === 'key_rubric' && (
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                Dokumen Kunci Jawaban, Rubrik Penilaian, & Pembahasan Resmi Guru
              </h3>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                Seluruh soal disusun berdasarkan PDF Modul Pembelajaran Hidroponik Kelas XI SMK ATPH. Kunci jawaban ini dilindungi di server dan tidak dikirim ke API siswa sebelum diizinkan.
              </p>
            </div>
            <a
              href="/materials/modul-hidroponik-kelas-xi-atph.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>Unduh PDF Materi Acuan</span>
            </a>
          </div>

          <div className="space-y-3">
            {HIDROPONIK_XI_QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-teal-700 dark:text-teal-300 uppercase">
                    {q.questionType === 'multiple_choice'
                      ? `Pilihan Ganda #${idx + 1}`
                      : q.questionType === 'essay'
                      ? `Soal Uraian #${idx - 9}`
                      : `Studi Kasus #${idx - 14}`}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    {q.questionType === 'multiple_choice' ? '1 Poin (Benar=1, Salah=0)' : 'Rubrik 0–100'}
                  </span>
                </div>

                {q.caseStudyContext && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {q.caseStudyContext}
                  </div>
                )}

                <p className="font-bold text-slate-900 dark:text-white whitespace-pre-line">
                  {q.questionText}
                </p>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                  <p>
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      Kunci Jawaban:
                    </strong>{' '}
                    <span className="whitespace-pre-line">{q.correctAnswer}</span>
                  </p>
                  {q.explanation && (
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong>Pembahasan:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

