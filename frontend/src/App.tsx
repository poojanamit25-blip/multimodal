import React, { useState, useEffect } from 'react';
import {
  MessageSquare, BookOpen, CheckSquare, GitFork, Flame, Calendar,
  BarChart2, ShieldCheck, Columns, Maximize2, Sparkles
} from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TutorChat } from './components/TutorChat';
import { SourceViewer } from './components/SourceViewer';
import { AssessmentRunner } from './components/AssessmentRunner';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { RevisionCenter } from './components/RevisionCenter';
import { StudyPlanner } from './components/StudyPlanner';
import { LearnerDashboard } from './components/LearnerDashboard';
import { EvaluationSuite } from './components/EvaluationSuite';
import { DocumentManager } from './components/DocumentManager';
import { WorkspaceHome } from './components/WorkspaceHome';
import { CommandPalette } from './components/CommandPalette';
import { LoginPage } from './components/LoginPage';
import { PreparationSetupPage } from './components/PreparationSetupPage';
import { Course, DocumentItem, LearnerProfile, Citation, GoogleUser } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  // Authentication & Preparation Setup State
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(() => {
    try {
      const saved = localStorage.getItem('synapse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isSetupCompleted, setIsSetupCompleted] = useState<boolean>(() => {
    return localStorage.getItem('synapse_setup_completed') === 'true';
  });

  const [isSetupMode, setIsSetupMode] = useState<boolean>(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course_cs401');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [dueFlashcardsCount, setDueFlashcardsCount] = useState<number>(4);

  // Active View Navigation State (Defaults to Study Workspace Launchpad)
  const [activeView, setActiveView] = useState<string>('workspace');
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<string>('All Topics (Adaptive)');
  const [initialTutorQuestion, setInitialTutorQuestion] = useState<string | null>(null);

  // Grounded Source Inspector State
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [activeCitation, setActiveCitation] = useState<Citation | null>({
    source_title: 'Designing Data-Intensive Applications: Distributed Foundations',
    document_id: 'doc_textbook_ddia',
    file_type: 'textbook',
    page_number: 24,
    direct_quote:
      'The CAP theorem states that when a network partition (P) occurs, a distributed data store must choose between Consistency and Availability.',
    relevance_score: 1.0,
  });

  const [preferredLanguage, setPreferredLanguage] = useState<string>('en');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    checkHealthAndLoadData();
  }, [selectedCourseId]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Ctrl+B -> Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkHealthAndLoadData = async () => {
    try {
      const healthRes = await fetch('/health').catch(() => null);
      if (healthRes && healthRes.ok) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }

      // Load courses
      const courseList = await api.listCourses().catch(() => []);
      if (courseList.length > 0) {
        setCourses(courseList);
      } else {
        setCourses([
          {
            id: 'course_cs401',
            code: 'CS401',
            title: 'Distributed Systems & Cloud Computing',
            created_at: new Date().toISOString(),
          },
        ]);
      }

      // Load documents
      const docs = await api.listDocuments(selectedCourseId).catch(() => []);
      setDocuments(docs);

      // Load learner profile
      const studentId = currentUser?.studentId || 'student_default';
      const prof = await api.getLearnerProfile(studentId, selectedCourseId).catch(() => null);
      if (prof && currentUser?.name) {
        prof.name = currentUser.name;
      }
      setProfile(prof);

      // Load flashcards count
      const cards = await api.getFlashcards(selectedCourseId).catch(() => []);
      setDueFlashcardsCount(cards.length);
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  const handleOpenCitation = (cit: Citation) => {
    setActiveCitation(cit);
    setIsInspectorOpen(true); // Automatically ensure inspector is open when user clicks a citation
    if (activeView !== 'tutor') {
      setActiveView('tutor');
    }
  };

  const handleOpenDocument = (doc: DocumentItem) => {
    const newCitation: Citation = {
      source_title: doc.title,
      document_id: doc.id,
      file_type: doc.file_type,
      page_number: doc.file_type === 'textbook' ? 1 : undefined,
      slide_number: doc.file_type === 'slides' ? 1 : undefined,
      direct_quote: `Opened ${doc.title} from Course Library`,
      relevance_score: 1.0,
    };
    setActiveCitation(newCitation);
    setIsInspectorOpen(true);
    setActiveView('tutor');
  };

  const handleStartQuizForTopic = (topic: string) => {
    setSelectedTopicForQuiz(topic);
    setActiveView('quiz');
  };

  const handleAskQuestion = (query: string) => {
    setInitialTutorQuestion(query);
    setActiveView('tutor');
  };

  // 1. If not authenticated, render Google Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user, isNewStudent) => {
          setCurrentUser(user);
          localStorage.setItem('synapse_user', JSON.stringify(user));
          if (isNewStudent || !localStorage.getItem('synapse_setup_completed')) {
            setIsSetupMode(true);
          }
        }}
      />
    );
  }

  // 2. If authenticated but hasn't configured study preparation goals (or requested re-configuration), render Preparation Setup
  if (!isSetupCompleted || isSetupMode) {
    return (
      <PreparationSetupPage
        userName={currentUser.name}
        userEmail={currentUser.email}
        studentId={currentUser.studentId}
        courses={courses}
        onCompleteSetup={(config) => {
          setSelectedCourseId(config.courseId);
          setIsSetupCompleted(true);
          setIsSetupMode(false);
          localStorage.setItem('synapse_setup_completed', 'true');
          localStorage.setItem('synapse_prep_config', JSON.stringify(config));
          if (config.goal === 'diagnostic_mock_test' || config.goal === 'exam_prep') {
            setActiveView('quiz');
          } else if (config.goal === 'quick_revision') {
            setActiveView('revision');
          } else if (config.goal === 'concept_mastery') {
            setActiveView('tutor');
          } else {
            setActiveView('workspace');
          }
        }}
      />
    );
  }

  return (
    <div
      className={isDarkTheme ? '' : 'light-theme'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        position: 'relative',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Ambient Orbs */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />

      {/* 1. TOP HEADER */}
      <Header
        courses={courses}
        selectedCourseId={selectedCourseId}
        onSelectCourse={setSelectedCourseId}
        profile={profile}
        currentUser={currentUser}
        activeView={activeView}
        preferredLanguage={preferredLanguage}
        onToggleLanguage={() => setPreferredLanguage((l) => (l === 'en' ? 'hi' : 'en'))}
        isDarkTheme={isDarkTheme}
        onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
        backendOnline={backendOnline}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onRunPractice={() => handleStartQuizForTopic('All Topics (Adaptive)')}
        onOpenSetup={() => setIsSetupMode(true)}
        onNavigate={setActiveView}
        onSignOut={() => {
          localStorage.removeItem('synapse_user');
          localStorage.removeItem('synapse_setup_completed');
          localStorage.removeItem('synapse_prep_config');
          setCurrentUser(null);
          setIsSetupMode(false);
          setIsSetupCompleted(false);
        }}
      />

      {/* 2. MAIN WORKSPACE */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          dueFlashcardsCount={dueFlashcardsCount}
          profile={profile}
        />

        {/* Central & Split Content Viewport */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-app)',
            position: 'relative',
          }}
        >
          {/* VIEW 0: Central Study Workspace Hub */}
          {activeView === 'workspace' && (
            <WorkspaceHome
              courseId={selectedCourseId}
              courses={courses}
              profile={profile}
              documents={documents}
              onNavigate={setActiveView}
              onAskQuestion={handleAskQuestion}
              onOpenDocument={handleOpenDocument}
              onStartPracticeTopic={handleStartQuizForTopic}
              isDarkTheme={isDarkTheme}
            />
          )}

          {/* VIEW 1: AI Tutor with Grounded Split Document Inspector */}
          {activeView === 'tutor' && (
            <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
              {/* Tutor Chat Column */}
              <div
                style={{
                  flex: isInspectorOpen ? 1 : 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  minWidth: '22rem',
                }}
              >
                {/* Secondary Action Bar: Inspector Toggle */}
                <div
                  style={{
                    height: '2.5rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1.25rem',
                    backgroundColor: 'rgba(14, 16, 23, 0.4)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontWeight: 600 }}>Source-Grounded AI Tutoring</span>
                    <span style={{ color: 'var(--text-dim)' }}>•</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Strict course material boundary</span>
                  </div>

                  <button
                    onClick={() => setIsInspectorOpen(!isInspectorOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: isInspectorOpen ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                      color: isInspectorOpen ? '#a5b4fc' : 'var(--text-muted)',
                      border: `1px solid ${isInspectorOpen ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-subtle)'}`,
                      borderRadius: '0.45rem',
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Columns size={12} />
                    <span>{isInspectorOpen ? 'Hide Source Inspector' : 'Show Source Inspector'}</span>
                  </button>
                </div>

                {/* Tutor Chat Body */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <TutorChat
                    courseId={selectedCourseId}
                    preferredLanguage={preferredLanguage}
                    initialQuestion={initialTutorQuestion}
                    onClearInitialQuestion={() => setInitialTutorQuestion(null)}
                    onSelectCitation={handleOpenCitation}
                  />
                </div>
              </div>

              {/* Right Grounded Source Inspector */}
              {isInspectorOpen && (
                <div
                  style={{
                    width: '46%',
                    height: '100%',
                    minWidth: '22rem',
                    borderLeft: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <SourceViewer
                    activeCitation={activeCitation}
                    documents={documents}
                    onClose={() => setIsInspectorOpen(false)}
                  />
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: Course Library & Multimodal Ingestion */}
          {activeView === 'materials' && (
            <DocumentManager
              courseId={selectedCourseId}
              onOpenViewerWithDoc={handleOpenDocument}
              onDocumentsChanged={checkHealthAndLoadData}
            />
          )}

          {/* VIEW 3: Adaptive Quizzes & Mock Exams */}
          {activeView === 'quiz' && (
            <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}>
              <AssessmentRunner
                courseId={selectedCourseId}
                initialTopic={selectedTopicForQuiz}
                onOpenCitation={handleOpenCitation}
                onAssessmentCompleted={checkHealthAndLoadData}
              />
            </div>
          )}

          {/* VIEW 4: Concept Map & Knowledge Graph */}
          {activeView === 'map' && (
            <KnowledgeGraph
              courseId={selectedCourseId}
              onAskTutorAboutTopic={handleAskQuestion}
              onStartQuizForTopic={handleStartQuizForTopic}
            />
          )}

          {/* VIEW 5: Smart Revision Centre */}
          {activeView === 'revision' && (
            <RevisionCenter
              courseId={selectedCourseId}
              onOpenCitation={handleOpenCitation}
              onCardReviewed={checkHealthAndLoadData}
            />
          )}

          {/* VIEW 6: Study Planner & Exam Countdown */}
          {activeView === 'planner' && (
            <StudyPlanner
              courseId={selectedCourseId}
              onOpenCitation={handleOpenCitation}
              onStartPractice={handleStartQuizForTopic}
            />
          )}

          {/* VIEW 7: Learner Analytics & BKT Profile */}
          {activeView === 'learner' && (
            <LearnerDashboard
              courseId={selectedCourseId}
              onStartQuizForTopic={handleStartQuizForTopic}
            />
          )}

          {/* VIEW 8: QA & System Evaluation Benchmark */}
          {activeView === 'eval' && <EvaluationSuite />}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K / ⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveView}
        onAskTutor={(query) => setActiveView('tutor')}
        onToggleLanguage={() => setPreferredLanguage((l) => (l === 'en' ? 'hi' : 'en'))}
        onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
      />
    </div>
  );
};

export default App;
