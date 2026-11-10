'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import DashboardHeader from '@/components/layout/DashboardHeader';
import {
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Award,
  AlertCircle,
  AlertTriangle,
  Send,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Database,
  Loader2,
  RefreshCw,
  FileText,
  Lock,
  Shield,
  Maximize2,
  EyeOff,
  Check,
  CloudOff,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import {
  Quiz,
  QuizQuestion,
  UserProfile,
  ControlledExamConfig,
  ExamViolationEvent,
} from '@/types';

const DEFAULT_EXAM_CONFIG: ControlledExamConfig = {
  enabled: true,
  requireFullscreen: true,
  maxViolations: 3,
  violationAction: 'warn_only',
};

export default function StudentQuizTakerPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(true);

  // Controlled Exam Mode state
  const [controlledConfig, setControlledConfig] =
    useState<ControlledExamConfig>(DEFAULT_EXAM_CONFIG);
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [startingExam, setStartingExam] = useState<boolean>(false);
  const [sessionResumed, setSessionResumed] = useState<boolean>(false);
  const [resumedByTeacherInfo, setResumedByTeacherInfo] = useState<{
    teacherName: string;
    resumedAt: string;
    note?: string;
  } | null>(null);

  // Fullscreen & browser capability state
  const [fullscreenSupported, setFullscreenSupported] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fullscreenNotice, setFullscreenNotice] = useState<string>('');

  // Violation tracking state
  const [violationCount, setViolationCount] = useState<number>(0);
  const [violationEvents, setViolationEvents] = useState<ExamViolationEvent[]>([]);
  const [activeWarningBanner, setActiveWarningBanner] = useState<{
    title: string;
    detail: string;
    count: number;
    maxViolations: number;
  } | null>(null);

  // Quiz active state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // in seconds
  const [quizStartTime, setQuizStartTime] = useState<string>(new Date().toISOString());
  const [sessionDeadlineAt, setSessionDeadlineAt] = useState<string | null>(null);
  const serverClockOffsetRef = useRef<number>(0);

  // Autosave & submission state
  const [autosaveStatus, setAutosaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'unsynced'
  >('idle');
  const [lastSavedTimeLabel, setLastSavedTimeLabel] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<any | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'saving' | 'synced' | 'local_only' | 'failed'
  >('idle');
  const [syncErrorDetail, setSyncErrorDetail] = useState<string>('');

  // Refs for event coalescing & avoiding stale closures
  const selectedAnswersRef = useRef<Record<string, string>>({});
  const examStartedRef = useRef<boolean>(false);
  const isSubmittedRef = useRef<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const wasFullscreenRef = useRef<boolean>(false);
  const lastEpisodeClosedAtRef = useRef<number>(0);
  const activeAwayEpisodeRef = useRef<{
    id: string;
    type: 'tab_hidden' | 'fullscreen_exit' | 'extended_blur';
    startedAtMs: number;
    occurredAt: string;
    signals: Set<string>;
  } | null>(null);
  const blurCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUnsyncedChangesRef = useRef<boolean>(false);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    examStartedRef.current = examStarted;
  }, [examStarted]);

  useEffect(() => {
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  const getLocalDraftKey = useCallback(
    (uId?: string) => `eduatph_exam_draft_${quizId}_${uId || currentUser?.id || 'usr-student-dimas'}`,
    [quizId, currentUser?.id]
  );

  const getStudentHeaders = useCallback((user?: UserProfile | null): Record<string, string> => {
    const active = user || DataProvider.getCurrentUser();
    const sessionPayload = encodeURIComponent(
      JSON.stringify({
        id: active?.id || 'usr-student-dimas',
        email: active?.email || 'dimas.anggoro@siswa.eduatph.sch.id',
        fullName: active?.fullName || 'Dimas Anggoro',
        role: 'student',
        classId: active?.classId || 'cls-xi-at-1',
        className: active?.className || 'XI AT 1',
        nisn: active?.nisn || '0068129401',
      })
    );
    return {
      'Content-Type': 'application/json',
      'x-edu-session': sessionPayload,
      'x-edu-role-hint': 'student',
    };
  }, []);

  // Check fullscreen API support on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const supported = Boolean(
        typeof document.documentElement?.requestFullscreen === 'function' &&
          (document.fullscreenEnabled === undefined || document.fullscreenEnabled)
      );
      setFullscreenSupported(supported);
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  }, []);

  // Load quiz, questions, and check existing server exam session
  useEffect(() => {
    let activeUser = DataProvider.getCurrentUser();
    if (activeUser) {
      setCurrentUser(activeUser);
    } else {
      fetch('/api/auth/student-session')
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            DataProvider.setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    }

    const loadQuizAndSession = async () => {
      setLoadingQuiz(true);
      const studentId = activeUser?.id || 'usr-student-dimas';

      // 1. Read local draft backup first
      let localDrafts: Record<string, string> = {};
      try {
        const rawLocal = localStorage.getItem(`eduatph_exam_draft_${quizId}_${studentId}`);
        if (rawLocal) {
          const parsedLocal = JSON.parse(rawLocal);
          if (parsedLocal && typeof parsedLocal.answers === 'object') {
            localDrafts = parsedLocal.answers;
          }
        }
      } catch {}

      try {
        // 2. Fetch quiz metadata & sanitized questions
        const res = await fetch(`/api/quizzes/${quizId}`, {
          headers: getStudentHeaders(activeUser),
          cache: 'no-store',
        });
        const json = await res.json();
        if (res.ok && json.success && json.quiz) {
          setQuiz(json.quiz);
          setTimeLeft((json.quiz.durationMinutes || 30) * 60);
          setQuestions(json.questions || []);
          if (json.quiz.controlledExamConfig) {
            setControlledConfig({
              ...DEFAULT_EXAM_CONFIG,
              ...json.quiz.controlledExamConfig,
            });
          }
        } else {
          throw new Error('Fallback to local quiz');
        }
      } catch {
        const localQuiz = DataProvider.getQuizById(quizId);
        if (localQuiz) {
          setQuiz(localQuiz);
          setTimeLeft(localQuiz.durationMinutes * 60);
          const localQuestions = DataProvider.getQuizQuestions(localQuiz.id).map((q) => ({
            ...q,
            correctAnswer: undefined,
            explanation: undefined,
            rubric: undefined,
          }));
          setQuestions(localQuestions);
        }
      }

      // 3. Check if an active or locked exam session already exists on server
      try {
        const sessRes = await fetch(
          `/api/quizzes/session?quizId=${encodeURIComponent(quizId)}&studentId=${encodeURIComponent(studentId)}`,
          {
            headers: getStudentHeaders(activeUser),
            cache: 'no-store',
          }
        );
        const sessJson = await sessRes.json();
        if (sessRes.ok && sessJson.success) {
          if (sessJson.serverNow) {
            serverClockOffsetRef.current =
              new Date(sessJson.serverNow).getTime() - Date.now();
          }
          if (sessJson.controlledExamConfig) {
            setControlledConfig({
              ...DEFAULT_EXAM_CONFIG,
              ...sessJson.controlledExamConfig,
            });
          }

          const existingSession = sessJson.session;
          if (existingSession) {
            setViolationCount(existingSession.violationCount || 0);
            setViolationEvents(existingSession.violationEvents || []);
            if (existingSession.resumedByTeacher) {
              setResumedByTeacherInfo(existingSession.resumedByTeacher);
            }

            if (
              (existingSession.status === 'auto_submitted' ||
                existingSession.status === 'submitted') &&
              sessJson.lockedAttempt
            ) {
              setAttemptResult(sessJson.lockedAttempt);
              setIsSubmitted(true);
              setSyncStatus('synced');
              setLoadingQuiz(false);
              return;
            }

            if (existingSession.status === 'in_progress') {
              const mergedAnswers = {
                ...(existingSession.draftAnswers || {}),
                ...localDrafts,
              };
              setSelectedAnswers(mergedAnswers);
              selectedAnswersRef.current = mergedAnswers;
              setQuizStartTime(existingSession.startedAt);
              setSessionDeadlineAt(existingSession.deadlineAt);
              setExamStarted(true);
              setSessionResumed(true);
              setAutosaveStatus('saved');
              if (existingSession.lastSavedAt) {
                setLastSavedTimeLabel(
                  new Date(existingSession.lastSavedAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                );
              }
            }
          } else if (Object.keys(localDrafts).length > 0) {
            setSelectedAnswers(localDrafts);
            selectedAnswersRef.current = localDrafts;
          }
        }
      } catch {
        if (Object.keys(localDrafts).length > 0) {
          setSelectedAnswers(localDrafts);
          selectedAnswersRef.current = localDrafts;
        }
      }

      setLoadingQuiz(false);
    };

    loadQuizAndSession();
  }, [quizId, getStudentHeaders]);

  // Request fullscreen helper (must be triggered by student click gesture)
  const requestExamFullscreen = async (): Promise<boolean> => {
    if (typeof document === 'undefined') return false;
    if (typeof document.documentElement?.requestFullscreen !== 'function') {
      setFullscreenSupported(false);
      setFullscreenNotice(
        'Perangkat atau browser Anda tidak mendukung API Layar Penuh (Fullscreen). Anda tetap dapat melanjutkan pengerjaan dengan pemantauan visibilitas halaman.'
      );
      return false;
    }
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      wasFullscreenRef.current = true;
      setFullscreenNotice('');
      return true;
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setFullscreenNotice(
        'Permintaan layar penuh ditolak atau dibatasi oleh browser. Pemantauan perpindahan tab tetap aktif sesuai kebijakan guru.'
      );
      return false;
    }
  };

  // Start or resume quiz handler (triggered by student clicking "Mulai Kuis")
  const handleStartExam = async () => {
    if (startingExam) return;
    setStartingExam(true);

    // 1. Request fullscreen directly inside user click handler if enabled
    let fsSupported = fullscreenSupported;
    if (controlledConfig.enabled && controlledConfig.requireFullscreen && fullscreenSupported) {
      await requestExamFullscreen();
    } else if (!fullscreenSupported) {
      fsSupported = false;
    }

    const activeUser = currentUser || DataProvider.getCurrentUser();
    const studentId = activeUser?.id || 'usr-student-dimas';

    // 2. Initialize or resume server-backed exam session
    try {
      const res = await fetch('/api/quizzes/session', {
        method: 'POST',
        headers: getStudentHeaders(activeUser),
        body: JSON.stringify({
          action: 'start',
          quizId,
          studentId,
          studentName: activeUser?.fullName || 'Dimas Anggoro',
          studentNisn: activeUser?.nisn || '0068129401',
          className: activeUser?.className || 'XI AT 1',
          fullscreenSupported: fsSupported,
          draftAnswers: selectedAnswersRef.current,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.serverNow) {
          serverClockOffsetRef.current = new Date(json.serverNow).getTime() - Date.now();
        }
        if (json.isLocked && json.attempt) {
          setAttemptResult(json.attempt);
          setIsSubmitted(true);
          setSyncStatus('synced');
          setStartingExam(false);
          return;
        }
        if (json.session) {
          setQuizStartTime(json.session.startedAt);
          setSessionDeadlineAt(json.session.deadlineAt);
          setViolationCount(json.session.violationCount || 0);
          setViolationEvents(json.session.violationEvents || []);
          if (json.session.draftAnswers) {
            const merged = {
              ...json.session.draftAnswers,
              ...selectedAnswersRef.current,
            };
            setSelectedAnswers(merged);
            selectedAnswersRef.current = merged;
          }
          setSessionResumed(Boolean(json.resumed));
          setAutosaveStatus('saved');
          setLastSavedTimeLabel(
            new Date(json.session.lastSavedAt || Date.now()).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      }
    } catch {
      // Offline fallback: set local deadline based on quiz duration
      const fallbackDeadline = new Date(
        Date.now() + (quiz?.durationMinutes || 30) * 60 * 1000
      ).toISOString();
      setSessionDeadlineAt(fallbackDeadline);
      setAutosaveStatus('unsynced');
    }

    setExamStarted(true);
    setStartingExam(false);
  };

  // Sync draft answers to server
  const syncDraftAnswersToServer = useCallback(
    async (answersToSync: Record<string, string>) => {
      if (!examStartedRef.current || isSubmittedRef.current || isSubmittingRef.current) return;
      const activeUser = currentUser || DataProvider.getCurrentUser();
      const studentId = activeUser?.id || 'usr-student-dimas';

      // Always write to localStorage first as immediate offline safeguard
      try {
        localStorage.setItem(
          getLocalDraftKey(studentId),
          JSON.stringify({
            quizId,
            studentId,
            updatedAt: new Date().toISOString(),
            answers: answersToSync,
          })
        );
      } catch {}

      setAutosaveStatus('saving');
      try {
        const res = await fetch('/api/quizzes/session', {
          method: 'POST',
          headers: getStudentHeaders(activeUser),
          body: JSON.stringify({
            action: 'autosave',
            quizId,
            studentId,
            studentName: activeUser?.fullName || 'Dimas Anggoro',
            className: activeUser?.className || 'XI AT 1',
            draftAnswers: answersToSync,
          }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          hasUnsyncedChangesRef.current = false;
          setAutosaveStatus('saved');
          setLastSavedTimeLabel(
            new Date(json.lastSavedAt || Date.now()).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        } else {
          hasUnsyncedChangesRef.current = true;
          setAutosaveStatus('unsynced');
        }
      } catch {
        hasUnsyncedChangesRef.current = true;
        setAutosaveStatus('unsynced');
      }
    },
    [currentUser, getLocalDraftKey, getStudentHeaders, quizId]
  );

  // Periodic autosave (every 15 seconds) & online reconnection listener
  useEffect(() => {
    if (!examStarted || isSubmitted) return;

    const handleOnline = () => {
      if (hasUnsyncedChangesRef.current) {
        syncDraftAnswersToServer(selectedAnswersRef.current);
      }
    };

    window.addEventListener('online', handleOnline);
    const interval = setInterval(() => {
      if (
        hasUnsyncedChangesRef.current ||
        Object.keys(selectedAnswersRef.current).length > 0
      ) {
        syncDraftAnswersToServer(selectedAnswersRef.current);
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, [examStarted, isSubmitted, syncDraftAnswersToServer]);

  // Report a single coalesced violation episode to the server
  const reportViolationEpisodeToServer = useCallback(
    async (episode: {
      id: string;
      type: 'tab_hidden' | 'fullscreen_exit' | 'extended_blur';
      occurredAt: string;
      returnedAt: string;
      durationSeconds: number;
      mergedSignals: string[];
    }) => {
      if (!examStartedRef.current || isSubmittedRef.current) return;
      const activeUser = currentUser || DataProvider.getCurrentUser();
      const studentId = activeUser?.id || 'usr-student-dimas';

      const labelMap: Record<'tab_hidden' | 'fullscreen_exit' | 'extended_blur', string> = {
        tab_hidden: 'Halaman kuis menjadi tersembunyi (pindah tab / minimalkan jendela)',
        fullscreen_exit: 'Keluar dari mode layar penuh (fullscreen)',
        extended_blur: 'Kehilangan fokus jendela ujian melebihi batas toleransi',
      };

      try {
        const res = await fetch('/api/quizzes/session', {
          method: 'POST',
          headers: getStudentHeaders(activeUser),
          body: JSON.stringify({
            action: 'violation',
            quizId,
            studentId,
            draftAnswers: selectedAnswersRef.current,
            event: {
              id: episode.id,
              type: episode.type,
              label: labelMap[episode.type],
              occurredAt: episode.occurredAt,
              returnedAt: episode.returnedAt,
              durationSeconds: episode.durationSeconds,
              mergedSignals: episode.mergedSignals,
            },
          }),
        });
        const json = await res.json();
        if (res.ok && json.success && json.session) {
          const nextCount = json.session.violationCount || 0;
          setViolationCount(nextCount);
          setViolationEvents(json.session.violationEvents || []);

          if (json.autoSubmitted && json.attempt) {
            // Auto-submitted & locked by server according to teacher policy
            if (typeof document !== 'undefined' && document.fullscreenElement) {
              document.exitFullscreen?.().catch(() => {});
            }
            setAttemptResult(json.attempt);
            setIsSubmitted(true);
            setSyncStatus('synced');
            return;
          }

          setActiveWarningBanner({
            title: `Peringatan Mode Ujian Terkontrol (${nextCount} / ${controlledConfig.maxViolations})`,
            detail: `${labelMap[episode.type]} selama ${episode.durationSeconds} detik telah tercatat pada log ujian.`,
            count: nextCount,
            maxViolations: controlledConfig.maxViolations,
          });
        }
      } catch {
        // Offline fallback warning
        setViolationCount((prev) => {
          const next = prev + 1;
          setActiveWarningBanner({
            title: `Peringatan Mode Ujian Terkontrol (${next} / ${controlledConfig.maxViolations})`,
            detail: `${labelMap[episode.type]} selama ${episode.durationSeconds} detik tercatat secara lokal.`,
            count: next,
            maxViolations: controlledConfig.maxViolations,
          });
          return next;
        });
      }
    },
    [controlledConfig.maxViolations, currentUser, getStudentHeaders, quizId]
  );

  // Activate browser visibility / fullscreen / focus monitoring ONLY when examStarted && !isSubmitted
  useEffect(() => {
    if (!examStarted || isSubmitted || !controlledConfig.enabled) {
      return;
    }

    const openOrMergeAwayEpisode = (
      type: 'tab_hidden' | 'fullscreen_exit' | 'extended_blur',
      signalName: string
    ) => {
      if (!examStartedRef.current || isSubmittedRef.current || isSubmittingRef.current) return;

      const nowMs = Date.now();
      // If an episode is already active, merge the signal so multiple events in one transition are NOT double-counted
      if (activeAwayEpisodeRef.current) {
        activeAwayEpisodeRef.current.signals.add(signalName);
        if (
          activeAwayEpisodeRef.current.type === 'extended_blur' &&
          (type === 'tab_hidden' || type === 'fullscreen_exit')
        ) {
          activeAwayEpisodeRef.current.type = type;
        }
        return;
      }

      // Cooldown window (2 seconds) after an episode closes so rapid coupled events are not double-counted
      if (nowMs - lastEpisodeClosedAtRef.current < 2000) {
        return;
      }

      activeAwayEpisodeRef.current = {
        id: `viol-${nowMs}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        startedAtMs: nowMs,
        occurredAt: new Date(nowMs).toISOString(),
        signals: new Set([signalName]),
      };
    };

    const closeActiveAwayEpisode = () => {
      if (blurCheckTimerRef.current) {
        clearTimeout(blurCheckTimerRef.current);
        blurCheckTimerRef.current = null;
      }
      const ep = activeAwayEpisodeRef.current;
      if (!ep) return;

      activeAwayEpisodeRef.current = null;
      const nowMs = Date.now();
      lastEpisodeClosedAtRef.current = nowMs;
      const durationSeconds = Math.max(1, Math.round((nowMs - ep.startedAtMs) / 1000));

      reportViolationEpisodeToServer({
        id: ep.id,
        type: ep.type,
        occurredAt: ep.occurredAt,
        returnedAt: new Date(nowMs).toISOString(),
        durationSeconds,
        mergedSignals: Array.from(ep.signals),
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        openOrMergeAwayEpisode('tab_hidden', 'visibilitychange:hidden');
      } else if (document.visibilityState === 'visible') {
        closeActiveAwayEpisode();
      }
    };

    const handleFullscreenChange = () => {
      const currentlyFs = Boolean(document.fullscreenElement);
      setIsFullscreen(currentlyFs);

      if (wasFullscreenRef.current && !currentlyFs && !isSubmittedRef.current) {
        openOrMergeAwayEpisode('fullscreen_exit', 'fullscreenchange:exit');
        // If page is still visible when exiting fullscreen, record immediately after 600ms
        // (allowing time to merge if visibilitychange also fires right after)
        setTimeout(() => {
          if (document.visibilityState === 'visible' && activeAwayEpisodeRef.current) {
            closeActiveAwayEpisode();
          }
        }, 600);
      }
      wasFullscreenRef.current = currentlyFs;
    };

    const handleWindowBlur = () => {
      // IMPORTANT: Blur alone is NOT immediate proof of a violation because browser/system dialogs can trigger blur.
      // If an away episode is already open (e.g. tab_hidden), attach 'window:blur' as an auxiliary signal.
      if (activeAwayEpisodeRef.current) {
        activeAwayEpisodeRef.current.signals.add('window:blur');
        return;
      }

      if (blurCheckTimerRef.current) {
        clearTimeout(blurCheckTimerRef.current);
      }

      // Only if visibility also becomes hidden during the check window do we open a tab_hidden episode;
      // brief blur while visible (such as a browser alert/permission dialog) is ignored.
      blurCheckTimerRef.current = setTimeout(() => {
        if (document.visibilityState === 'hidden') {
          openOrMergeAwayEpisode('tab_hidden', 'window:blur+hidden');
        }
      }, 1500);
    };

    const handleWindowFocus = () => {
      if (blurCheckTimerRef.current) {
        clearTimeout(blurCheckTimerRef.current);
        blurCheckTimerRef.current = null;
      }
      if (document.visibilityState === 'visible' && activeAwayEpisodeRef.current) {
        closeActiveAwayEpisode();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (blurCheckTimerRef.current) {
        clearTimeout(blurCheckTimerRef.current);
      }
    };
  }, [examStarted, isSubmitted, controlledConfig.enabled, reportViolationEpisodeToServer]);

  // Server-backed countdown timer (continues running even when student leaves tab or refreshes)
  useEffect(() => {
    if (!examStarted || isSubmitted || loadingQuiz) return;

    const updateTimer = () => {
      if (sessionDeadlineAt) {
        const nowServerMs = Date.now() + serverClockOffsetRef.current;
        const deadlineMs = new Date(sessionDeadlineAt).getTime();
        const remaining = Math.max(0, Math.floor((deadlineMs - nowServerMs) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0 && !isSubmittedRef.current && !isSubmittingRef.current) {
          handleSubmitQuiz();
        }
      } else {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [examStarted, isSubmitted, loadingQuiz, sessionDeadlineAt]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, answerValue: string) => {
    if (isSubmitted || isSubmitting) return;
    const nextAnswers = {
      ...selectedAnswersRef.current,
      [questionId]: answerValue,
    };
    setSelectedAnswers(nextAnswers);
    selectedAnswersRef.current = nextAnswers;
    hasUnsyncedChangesRef.current = true;
    setAutosaveStatus('saving');

    // Save immediately to localStorage
    const activeUser = currentUser || DataProvider.getCurrentUser();
    try {
      localStorage.setItem(
        getLocalDraftKey(activeUser?.id),
        JSON.stringify({
          quizId,
          studentId: activeUser?.id || 'usr-student-dimas',
          updatedAt: new Date().toISOString(),
          answers: nextAnswers,
        })
      );
    } catch {}

    // Debounce server autosave (800ms)
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      syncDraftAnswersToServer(selectedAnswersRef.current);
    }, 800);
  };

  const handleRefreshAttemptStatus = async () => {
    if (!attemptResult?.id) return;
    try {
      const res = await fetch(
        `/api/admin/quiz-attempts?attemptId=${encodeURIComponent(attemptResult.id)}`,
        {
          headers: getStudentHeaders(currentUser),
          cache: 'no-store',
        }
      );
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data) && json.data[0]) {
        setAttemptResult(json.data[0]);
      }
    } catch {}
  };

  const handleSubmitQuiz = async () => {
    if (isSubmittingRef.current || isSubmittedRef.current) return;

    const activeUser = currentUser || DataProvider.getCurrentUser();
    if (!activeUser) {
      alert('Sesi Anda telah kedaluwarsa. Silakan masuk kembali ke portal siswa.');
      router.push('/login');
      return;
    }

    if (!quiz) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    setIsSubmitting(true);
    isSubmittingRef.current = true;
    setSyncStatus('saving');
    setSyncErrorDetail('');

    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      userAnswer: selectedAnswersRef.current[q.id] || '',
    }));

    try {
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: getStudentHeaders(activeUser),
        body: JSON.stringify({
          quizId: quiz.id,
          studentId: activeUser.id,
          studentName: activeUser.fullName,
          studentEmail: activeUser.email || '',
          studentNisn: activeUser.nisn || '-',
          className: activeUser.className || 'XI AT 1',
          answers: formattedAnswers,
          startedAt: quizStartTime,
          violationCount,
          violationEvents,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Exit fullscreen cleanly after submission
        if (typeof document !== 'undefined' && document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
        try {
          localStorage.removeItem(getLocalDraftKey(activeUser.id));
        } catch {}

        setAttemptResult(data.attempt);
        setIsSubmitted(true);
        isSubmittedRef.current = true;

        if (data.synced) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('local_only');
          if (data.syncError) setSyncErrorDetail(data.syncError);
        }

        try {
          DataProvider.submitQuizAttempt(quiz.id, activeUser.id, formattedAnswers);
        } catch {}
      } else {
        throw new Error(data.error || 'Gagal mengirim data ke server');
      }
    } catch (err: any) {
      console.warn('Submission fallback to local:', err);
      const fallbackResult = DataProvider.submitQuizAttempt(
        quiz.id,
        activeUser.id,
        formattedAnswers
      );
      setAttemptResult(fallbackResult);
      setIsSubmitted(true);
      isSubmittedRef.current = true;
      setSyncStatus('local_only');
      setSyncErrorDetail(err.message || 'Koneksi ke server terputus');
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleRetrySync = async () => {
    if (!attemptResult || !currentUser || !quiz) return;
    setSyncStatus('saving');
    setSyncErrorDetail('');

    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      userAnswer: selectedAnswersRef.current[q.id] || '',
    }));

    try {
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: getStudentHeaders(currentUser),
        body: JSON.stringify({
          quizId: quiz.id,
          studentId: currentUser.id,
          studentName: currentUser.fullName,
          studentEmail: currentUser.email || '',
          studentNisn: currentUser.nisn || '-',
          className: currentUser.className || 'XI AT 1',
          answers: formattedAnswers,
          startedAt: quizStartTime,
          violationCount,
          violationEvents,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.synced) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('failed');
        setSyncErrorDetail(data.syncError || 'Gagal tersambung ke server');
      }
    } catch (err: any) {
      setSyncStatus('failed');
      setSyncErrorDetail(err.message || 'Koneksi gagal');
    }
  };

  if (loadingQuiz) {
    return (
      <div className="flex-1 p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <p>Memuat soal evaluasi kejuruan ATPH...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex-1 p-8 text-center text-xs text-slate-500">
        <p>Kuis tidak ditemukan.</p>
        <Link
          href="/student/quizzes"
          className="text-emerald-600 font-bold underline mt-2 inline-block"
        >
          Kembali ke Daftar Kuis
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.values(selectedAnswers).filter(
    (v) => v && v.trim().length > 0
  ).length;
  const mcqCount = questions.filter(
    (q) => !q.questionType || q.questionType === 'multiple_choice' || q.questionType === 'true_false'
  ).length;
  const hasSubjective = questions.some(
    (q) => q.questionType === 'essay' || q.questionType === 'case_study'
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <DashboardHeader
        title={quiz.title}
        subtitle={`Kuis Evaluasi ATPH • Kelas ${quiz.targetClassName || 'Semua Kelas'}`}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Top Floating Quiz Tracker */}
        <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/student/quizzes"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Keluar Kuis</span>
            </Link>

            {quiz.pdfUrl && (
              <a
                href={quiz.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Materi Hidroponik</span>
              </a>
            )}

            {controlledConfig.enabled && examStarted && !isSubmitted && (
              <span
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
                  violationCount > 0
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>
                  Ujian Terkontrol • Pelanggaran: {violationCount}/{controlledConfig.maxViolations}
                </span>
              </span>
            )}
          </div>

          {examStarted && !isSubmitted && (
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Live Autosave Status Badge */}
              <div
                aria-live="polite"
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
                  autosaveStatus === 'saving'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : autosaveStatus === 'unsynced'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {autosaveStatus === 'saving' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : autosaveStatus === 'unsynced' ? (
                  <>
                    <CloudOff className="w-3.5 h-3.5" />
                    <span>Belum tersinkron</span>
                    <button
                      type="button"
                      onClick={() => syncDraftAnswersToServer(selectedAnswersRef.current)}
                      className="ml-1 underline cursor-pointer"
                    >
                      Sinkronkan
                    </button>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      Tersimpan{lastSavedTimeLabel ? ` (${lastSavedTimeLabel})` : ''}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-mono text-sm font-bold">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Sisa Waktu: {formatTimer(timeLeft)}</span>
              </div>
            </div>
          )}

          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Terjawab: <span className="text-emerald-600">{answeredCount}</span> / {questions.length}{' '}
            Soal
          </div>
        </div>

        {/* PRE-START CONTROLLED EXAM RULES SCREEN (Before examStarted and not submitted) */}
        {!examStarted && !isSubmitted ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  <span>
                    {controlledConfig.enabled
                      ? 'Mode Ujian Terkontrol Aktif'
                      : 'Evaluasi Pembelajaran ATPH'}
                  </span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {quiz.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{quiz.description}</p>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                  Durasi: {quiz.durationMinutes} Menit
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                  Total: {questions.length} Soal ({mcqCount} PG
                  {hasSubjective ? ', 5 Uraian, 2 Studi Kasus' : ''})
                </span>
              </div>
            </div>

            {controlledConfig.enabled && (
              <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
                    <h3 className="text-sm font-black text-amber-900 dark:text-amber-200">
                      Aturan Pengerjaan Mode Ujian Terkontrol (Harap Dibaca Sebelum Memulai)
                    </h3>
                    <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
                      <li>
                        <strong>Tetap berada pada halaman kuis</strong> selama waktu pengerjaan
                        berlangsung.
                      </li>
                      <li>
                        <strong>
                          Jangan berpindah tab, membuka aplikasi atau jendela lain, atau keluar dari
                          mode layar penuh (fullscreen).
                        </strong>
                      </li>
                      <li>
                        <strong>
                          Setiap perpindahan halaman yang terdeteksi akan dicatat otomatis
                        </strong>{' '}
                        beserta waktu dan durasinya untuk ditinjau oleh Guru.
                      </li>
                      <li>
                        <strong>Batas Pelanggaran: {controlledConfig.maxViolations} kali.</strong>{' '}
                        {controlledConfig.violationAction === 'auto_submit' ? (
                          <span className="text-rose-700 dark:text-rose-300 font-bold">
                            Pengaturan Guru: Jika batas pelanggaran ({controlledConfig.maxViolations}{' '}
                            kali) tercapai, ujian akan diakhiri dan jawaban dikumpulkan serta
                            dikunci secara otomatis oleh server.
                          </span>
                        ) : (
                          <span>
                            Pengaturan Guru: Mencatat riwayat perpindahan dan menampilkan peringatan
                            serta tanda <em>&ldquo;Perlu ditinjau&rdquo;</em> pada lembar evaluasi guru.
                          </span>
                        )}
                      </li>
                      <li>
                        <strong>Penyimpanan & Timer Server:</strong> Jawaban Anda disimpan otomatis
                        secara berkala. Timer tetap berjalan berdasarkan waktu server meskipun Anda
                        meninggalkan halaman atau me-refresh browser.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Fullscreen capability status box */}
                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Status Dukungan Layar Penuh:{' '}
                      {fullscreenSupported ? (
                        <strong className="text-emerald-700 dark:text-emerald-400">
                          Didukung oleh Browser/Perangkat (Tombol Mulai Kuis akan mengaktifkan
                          Fullscreen)
                        </strong>
                      ) : (
                        <strong className="text-amber-700 dark:text-amber-400">
                          Tidak didukung pada perangkat ini — Anda tetap dapat mengerjakan kuis
                          dengan pemantauan visibilitas halaman
                        </strong>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dengan menekan tombol <strong>&ldquo;Mulai Kuis&rdquo;</strong>, sesi waktu ujian
                dan pemantauan halaman akan dimulai.
              </p>
              <button
                type="button"
                onClick={handleStartExam}
                disabled={startingExam}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {startingExam ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyiapkan Sesi Ujian...</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Mulai Kuis Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : isSubmitted && attemptResult ? (
          /* QUIZ RESULT SCREEN (When submitted) */
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
            {/* AUTO-SUBMITTED NOTICE IF TRIGGERED BY VIOLATION LIMIT */}
            {attemptResult.autoSubmitted && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-black">
                    Ujian Diakhiri & Dikumpulkan Otomatis (Batas Pelanggaran Tercapai)
                  </strong>
                  <p>
                    Sistem mendeteksi {attemptResult.violationCount} kali perpindahan halaman
                    (mencapai batas {controlledConfig.maxViolations} kali). Seluruh jawaban yang
                    telah Anda isi tetap tersimpan aman di server dan ditandai{' '}
                    <strong>&ldquo;Perlu ditinjau&rdquo;</strong> untuk diperiksa oleh Guru. Jika
                    terjadi kendala teknis, silakan hubungi Guru pengampu untuk membuka kembali sesi
                    ujian Anda.
                  </p>
                </div>
              </div>
            )}

            {/* HONEST SERVER STORAGE STATUS BANNER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border text-xs">
              {syncStatus === 'saving' && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Menyimpan jawaban evaluasi ke server...</span>
                </div>
              )}

              {syncStatus === 'synced' && (
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    Tersimpan di server • Jawaban evaluasi telah tercatat di dashboard guru
                  </span>
                </div>
              )}

              {syncStatus === 'local_only' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>
                      Belum tersinkronisasi ke server pusat (Jawaban tersimpan aman di perangkat
                      Anda).
                    </span>
                  </div>
                  <button
                    onClick={handleRetrySync}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sinkronkan ke Server</span>
                  </button>
                </div>
              )}

              {syncStatus === 'failed' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-medium">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>
                      Gagal menyimpan ke server {syncErrorDetail ? `(${syncErrorDetail})` : ''} —
                      coba lagi
                    </span>
                  </div>
                  <button
                    onClick={handleRetrySync}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Coba Lagi Sekarang</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Database className="w-3.5 h-3.5" />
                <span>ID Siswa: {currentUser?.id || attemptResult.studentId}</span>
                {hasSubjective && (
                  <button
                    type="button"
                    onClick={handleRefreshAttemptStatus}
                    className="ml-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Cek Publikasi Guru</span>
                  </button>
                )}
              </div>
            </div>

            {/* RINGKASAN SKOR & STATUS PUBLIKASI */}
            <div className="text-center space-y-4">
              <div
                className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl ${
                  hasSubjective && !attemptResult.isPublished
                    ? 'bg-amber-500 shadow-amber-500/30'
                    : attemptResult.passed
                    ? 'bg-emerald-600 shadow-emerald-600/30'
                    : 'bg-rose-600 shadow-rose-600/30'
                }`}
              >
                {hasSubjective && !attemptResult.isPublished ? (
                  <Clock className="w-10 h-10" />
                ) : attemptResult.passed ? (
                  <Award className="w-10 h-10" />
                ) : (
                  <AlertCircle className="w-10 h-10" />
                )}
              </div>

              {hasSubjective && !attemptResult.isPublished ? (
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Menunggu Pemeriksaan & Publikasi Guru (Status: Draf)
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                    Nilai Pilihan Ganda: {attemptResult.mcqScore ?? attemptResult.score} / 100
                  </h2>
                  <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
                    Pilihan ganda Anda telah dinilai otomatis (
                    {attemptResult.mcqCorrectCount ?? attemptResult.correctCount} benar ÷ 10 × 100).
                    Nilai akhir beserta umpan balik untuk 5 soal uraian dan 2 studi kasus akan
                    tampil setelah diperiksa dan diterbitkan oleh Guru.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      attemptResult.passed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {attemptResult.passed ? 'Tuntas (Lulus KKM)' : 'Belum Tuntas (Perlu Remidi)'}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3">
                    Nilai Akhir Anda: {attemptResult.finalWeightedScore ?? attemptResult.percentage}{' '}
                    / 100
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    KKM Ketuntasan: {quiz.passingScore} • Diterbitkan oleh:{' '}
                    {attemptResult.publishedBy || attemptResult.gradedBy || 'Guru ATPH'}
                  </p>
                </div>
              )}

              {/* Rincian Komponen Nilai Berbobot (Jika Kuis Hidroponik XI) */}
              {hasSubjective && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Pilihan Ganda ({attemptResult.weightsConfig?.mcqWeight ?? 30}%)
                    </span>
                    <strong className="text-lg font-black text-slate-900 dark:text-white">
                      {attemptResult.mcqScore ?? attemptResult.score}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      {attemptResult.mcqCorrectCount ?? attemptResult.correctCount} benar dari 10
                      soal
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Rata-rata Uraian ({attemptResult.weightsConfig?.essayWeight ?? 40}%)
                    </span>
                    <strong className="text-lg font-black text-slate-900 dark:text-white">
                      {attemptResult.isPublished && attemptResult.essayAverageScore !== null
                        ? attemptResult.essayAverageScore
                        : 'Menunggu Guru'}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">5 Soal Uraian</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Studi Kasus ({attemptResult.weightsConfig?.caseStudyWeight ?? 30}%)
                    </span>
                    <strong className="text-lg font-black text-slate-900 dark:text-white">
                      {attemptResult.isPublished && attemptResult.caseStudyAverageScore !== null
                        ? attemptResult.caseStudyAverageScore
                        : 'Menunggu Guru'}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">2 Studi Kasus</span>
                  </div>
                </div>
              )}

              {attemptResult.isPublished && attemptResult.teacherNotes && (
                <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-left">
                  <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">
                    Catatan & Umpan Balik Guru:
                  </strong>
                  <p className="text-slate-700 dark:text-slate-200">{attemptResult.teacherNotes}</p>
                </div>
              )}
            </div>

            {/* Rincian Jawaban Siswa */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Rekap Jawaban Anda:
                </h3>
                {hasSubjective && !attemptResult.allowStudentReview && (
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Kunci jawaban & pembahasan dikunci sesuai pengaturan guru</span>
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const userAnswer = attemptResult.answers?.find(
                    (a: any) => a.questionId === q.id
                  );
                  const isMcq =
                    !q.questionType ||
                    q.questionType === 'multiple_choice' ||
                    q.questionType === 'true_false';
                  const isCorrect = userAnswer?.isCorrect;
                  const canSeeExplanation = Boolean(
                    (!hasSubjective && q.explanation) ||
                      (attemptResult.allowStudentReview && userAnswer?.explanation)
                  );

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border text-xs space-y-3 ${
                        isMcq
                          ? isCorrect
                            ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20'
                            : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-bold text-slate-900 dark:text-white text-sm whitespace-pre-line">
                          {idx + 1}. {q.questionText}
                        </p>
                        {isMcq ? (
                          isCorrect ? (
                            <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>+1 Poin</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-bold text-rose-600 bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>0 Poin</span>
                            </span>
                          )
                        ) : attemptResult.isPublished &&
                          userAnswer?.teacherScore !== null &&
                          userAnswer?.teacherScore !== undefined ? (
                          <span className="font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full whitespace-nowrap">
                            Nilai Guru: {userAnswer.teacherScore} / 100
                          </span>
                        ) : (
                          <span className="font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full whitespace-nowrap">
                            Belum diterbitkan
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px]">
                        <span className="text-slate-600 dark:text-slate-400">
                          Jawaban Anda:{' '}
                          <strong className="text-slate-900 dark:text-white whitespace-pre-line">
                            {userAnswer?.userAnswer || '(Tidak dijawab)'}
                          </strong>
                        </span>
                        {userAnswer?.correctAnswer && (
                          <span className="text-slate-600 dark:text-slate-400">
                            Kunci Benar:{' '}
                            <strong className="text-emerald-600">
                              {userAnswer.correctAnswer}
                            </strong>
                          </span>
                        )}
                      </div>

                      {attemptResult.isPublished && userAnswer?.teacherNote && (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200">
                          <strong>Umpan Balik Guru:</strong> {userAnswer.teacherNote}
                        </div>
                      )}

                      {canSeeExplanation && (
                        <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                          <strong>Pembahasan Ilmiah:</strong>{' '}
                          {userAnswer?.explanation || q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link
                href="/student/quizzes"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Kembali ke Daftar Kuis
              </Link>
              <Link
                href="/student/grades"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
              >
                Lihat Nilai di Transkrip Saya
              </Link>
            </div>
          </div>
        ) : (
          /* ACTIVE QUIZ QUESTION CARD */
          <div className="space-y-6">
            {/* Resumed Session / Teacher Unlock Banner */}
            {(sessionResumed || resumedByTeacherInfo) && (
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-wrap items-center justify-between gap-2 text-xs text-teal-900 dark:text-teal-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    {resumedByTeacherInfo ? (
                      <>
                        <strong>Sesi Dilanjutkan oleh Guru ({resumedByTeacherInfo.teacherName}):</strong>{' '}
                        {resumedByTeacherInfo.note || 'Anda dapat melanjutkan pengerjaan ujian.'}
                      </>
                    ) : (
                      <>
                        <strong>Sesi Ujian Dilanjutkan:</strong> Jawaban tersimpan dan sisa waktu
                        dari server telah dipulihkan.
                      </>
                    )}
                  </span>
                </div>
                {controlledConfig.enabled &&
                  controlledConfig.requireFullscreen &&
                  fullscreenSupported &&
                  !isFullscreen && (
                    <button
                      type="button"
                      onClick={requestExamFullscreen}
                      className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Aktifkan Layar Penuh</span>
                    </button>
                  )}
              </div>
            )}

            {/* Fullscreen Notice if Unsupported or Exited */}
            {fullscreenNotice && (
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-3">
                <span>{fullscreenNotice}</span>
                <button
                  type="button"
                  onClick={() => setFullscreenNotice('')}
                  className="text-[11px] font-bold underline cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Violation Warning Banner when Student Returns */}
            {activeWarningBanner && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 text-xs text-amber-950 dark:text-amber-100 space-y-2 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-300 text-sm">
                    <EyeOff className="w-4 h-4 shrink-0" />
                    <span>{activeWarningBanner.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveWarningBanner(null)}
                    className="px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold text-[11px] cursor-pointer"
                  >
                    Saya Mengerti
                  </button>
                </div>
                <p className="leading-relaxed">{activeWarningBanner.detail}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    Harap tetap berada di halaman kuis hingga menekan tombol Kumpulkan Jawaban.
                  </span>
                  {controlledConfig.requireFullscreen && fullscreenSupported && !isFullscreen && (
                    <button
                      type="button"
                      onClick={requestExamFullscreen}
                      className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Kembali ke Layar Penuh</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Number Navigation Strip Grouped by Question Type */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Navigasi Butir Soal Evaluasi</span>
                {hasSubjective && (
                  <span>1–10: Pilihan Ganda • 11–15: Soal Uraian • 16–17: Studi Kasus</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {questions.map((q, idx) => {
                  const ansVal = selectedAnswers[q.id];
                  const isAnswered = Boolean(ansVal && ansVal.trim().length > 0);
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Card */}
            {currentQ && (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-10 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-emerald-600">
                      Soal Nomor {currentQuestionIndex + 1} dari {questions.length}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        currentQ.questionType === 'case_study'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : currentQ.questionType === 'essay'
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {currentQ.questionType === 'case_study'
                        ? 'Studi Kasus Pemecahan Masalah'
                        : currentQ.questionType === 'essay'
                        ? 'Soal Uraian'
                        : 'Pilihan Ganda'}
                    </span>
                  </div>
                  <span>
                    {currentQ.questionType === 'essay' || currentQ.questionType === 'case_study'
                      ? 'Skor Rubrik: 0–100'
                      : `Bobot: ${currentQ.points} Poin`}
                  </span>
                </div>

                {/* Case Study Context Box */}
                {currentQ.caseStudyContext && (
                  <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/70 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                    {currentQ.caseStudyContext}
                  </div>
                )}

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                  {currentQ.questionText}
                </h3>

                {/* Input Area Based on Question Type */}
                {currentQ.questionType === 'essay' || currentQ.questionType === 'case_study' ? (
                  <div className="space-y-2 pt-2">
                    <label
                      htmlFor={`answer-textarea-${currentQ.id}`}
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Tuliskan Jawaban{' '}
                      {currentQ.questionType === 'case_study' ? 'Analisis Studi Kasus' : 'Uraian'}{' '}
                      Anda:
                    </label>
                    <textarea
                      id={`answer-textarea-${currentQ.id}`}
                      rows={currentQ.questionType === 'case_study' ? 8 : 5}
                      disabled={isSubmitting}
                      value={selectedAnswers[currentQ.id] || ''}
                      onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                      placeholder="Uraikan jawaban Anda secara jelas mencakup konsep hidroponik, parameter teknis, dan langkah pemecahan masalah..."
                      className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400">
                      Dinilai menggunakan rubrik: Ketepatan Konsep (0–40), Kelengkapan Jawaban
                      (0–30), Penalaran & Penerapan (0–20), Kejelasan Penyampaian (0–10).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {currentQ.options?.map((opt) => {
                      const isSelected = selectedAnswers[currentQ.id] === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSelectOption(currentQ.id, opt.id)}
                          className={`w-full p-4 rounded-2xl border text-left text-xs font-semibold flex items-center gap-4 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Footer Navigation Buttons */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0 || isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                      }
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mengirim ke Server...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kumpulkan Jawaban</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
