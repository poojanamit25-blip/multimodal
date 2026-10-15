import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { withFastTimeout } from '../lib/api';
import {
  Shield, Database, Plus, Trash2, Edit2, Code, Activity, Users,
  Sliders, Search, Eye, RefreshCw, X, Award, Flame, BookOpen
} from 'lucide-react';
import {
  getFeatures, toggleFeature, addFeature, removeFeature,
  resetFeaturesToDefault
} from '../lib/featureFlags';
import type { PlatformFeature } from '../lib/featureFlags';
import { getAuditUsers } from '../lib/auditLogs';
import type { CandidateUsageLog, CandidateActivity } from '../lib/auditLogs';

interface TestCase {
  id?: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface Question {
  id?: number;
  title: string;
  description: string;
  difficulty: string;
  topic: string;
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  optimalSolutionConcept: string;
  javaTemplate: string;
  pythonTemplate: string;
  javascriptTemplate: string;
  testCases: TestCase[];
}

type AdminTab = 'questions' | 'audit-logs' | 'features';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('questions');

  // ================= QUESTIONS STATE =================
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [questionSearch, setQuestionSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  // Form States for creating/updating
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [topic, setTopic] = useState('Arrays');
  const [expectedTimeComplexity, setExpectedTimeComplexity] = useState('O(n)');
  const [expectedSpaceComplexity, setExpectedSpaceComplexity] = useState('O(1)');
  const [optimalSolutionConcept, setOptimalSolutionConcept] = useState('');
  const [javaTemplate, setJavaTemplate] = useState('');
  const [pythonTemplate, setPythonTemplate] = useState('');
  const [javascriptTemplate, setJavascriptTemplate] = useState('');

  // Test cases states
  const [tc1Input, setTc1Input] = useState('');
  const [tc1Output, setTc1Output] = useState('');
  const [tc2Input, setTc2Input] = useState('');
  const [tc2Output, setTc2Output] = useState('');

  // ================= AUDIT LOGS STATE =================
  const [candidateUsers, setCandidateUsers] = useState<CandidateUsageLog[]>([]);
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<CandidateUsageLog | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [regularityFilter, setRegularityFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [activityTypeFilter, setActivityTypeFilter] = useState('ALL');

  // ================= FEATURES STATE =================
  const [features, setFeatures] = useState<PlatformFeature[]>([]);
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState('ALL');
  const [showAddFeatureModal, setShowAddFeatureModal] = useState<boolean>(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');
  const [newFeatureCategory, setNewFeatureCategory] = useState<'Proctoring' | 'AI Interviewer' | 'Assessment' | 'Interface' | 'General'>('Proctoring');
  const [newFeatureEnabled, setNewFeatureEnabled] = useState(true);

  const loadQuestions = () => {
    const cached = localStorage.getItem('kodexis_admin_questions');
    if (cached) {
      try {
        setQuestions(JSON.parse(cached));
        setLoading(false);
      } catch {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }

    withFastTimeout(axios.get('/api/admin/questions'), 2500, 'Questions repository fetch')
      .then((res) => {
        setQuestions(res.data);
        localStorage.setItem('kodexis_admin_questions', JSON.stringify(res.data));
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Backend unavailable, seeding mock questions repository:', err);
        if (!cached) {
          const fallbackQuestions: Question[] = [
            {
              id: 1,
              title: "Two Sum",
              description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
              difficulty: "EASY",
              topic: "Arrays / Hashing",
              expectedTimeComplexity: "O(n)",
              expectedSpaceComplexity: "O(n)",
              optimalSolutionConcept: "Use Hash Map for one-pass complement lookup.",
              javaTemplate: "",
              pythonTemplate: "",
              javascriptTemplate: "",
              testCases: [
                { input: "9\n2,7,11,15", expectedOutput: "0,1", isHidden: false },
                { input: "6\n3,2,4", expectedOutput: "1,2", isHidden: true }
              ]
            },
            {
              id: 2,
              title: "Longest Subarray With Target Sum",
              description: "Find the maximum length of contiguous subarray whose elements sum to `k`.",
              difficulty: "MEDIUM",
              topic: "Arrays / Hashing",
              expectedTimeComplexity: "O(n)",
              expectedSpaceComplexity: "O(n)",
              optimalSolutionConcept: "Prefix sums stored in a HashMap mapped to first seen index.",
              javaTemplate: "",
              pythonTemplate: "",
              javascriptTemplate: "",
              testCases: [
                { input: "15\n1,2,3,7,5", expectedOutput: "3", isHidden: false },
                { input: "3\n-1,2,3", expectedOutput: "1", isHidden: true }
              ]
            },
            {
              id: 3,
              title: "Merge K Sorted Lists",
              description: "Merge `k` sorted linked lists and return it as one sorted list.",
              difficulty: "HARD",
              topic: "Heaps & Priority Queues",
              expectedTimeComplexity: "O(N log k)",
              expectedSpaceComplexity: "O(k)",
              optimalSolutionConcept: "Min-Heap storing list head nodes.",
              javaTemplate: "",
              pythonTemplate: "",
              javascriptTemplate: "",
              testCases: [
                { input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]", isHidden: false }
              ]
            }
          ];
          setQuestions(fallbackQuestions);
          localStorage.setItem('kodexis_admin_questions', JSON.stringify(fallbackQuestions));
        }
        setLoading(false);
      });
  };

  const loadAuditLogs = () => {
    const data = getAuditUsers();
    setCandidateUsers(data);
  };

  const loadFeaturesList = () => {
    setFeatures(getFeatures());
  };

  useEffect(() => {
    loadQuestions();
    loadAuditLogs();
    loadFeaturesList();

    const handleFeaturesUpdated = () => {
      setFeatures(getFeatures());
    };
    window.addEventListener('kodexis_features_updated', handleFeaturesUpdated);
    return () => {
      window.removeEventListener('kodexis_features_updated', handleFeaturesUpdated);
    };
  }, []);

  // Save question
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !topic) {
      alert("Please fill in key question details.");
      return;
    }

    const payload: Question = {
      title,
      description,
      difficulty,
      topic,
      expectedTimeComplexity,
      expectedSpaceComplexity,
      optimalSolutionConcept,
      javaTemplate,
      pythonTemplate,
      javascriptTemplate,
      testCases: [
        { input: tc1Input, expectedOutput: tc1Output, isHidden: false },
        { input: tc2Input, expectedOutput: tc2Output, isHidden: true }
      ]
    };

    try {
      if (editId) {
        await withFastTimeout(axios.put(`/api/admin/questions/${editId}`, payload), 2500, 'Question update');
      } else {
        await withFastTimeout(axios.post('/api/admin/questions', payload), 2500, 'Question create');
      }
      resetForm();
      loadQuestions();
    } catch (error) {
      console.warn('Backend unavailable or slow, updating questions locally:', error);
      let updated: Question[];
      if (editId) {
        updated = questions.map(q => q.id === editId ? { ...payload, id: editId } : q);
      } else {
        updated = [...questions, { ...payload, id: Date.now() }];
      }
      setQuestions(updated);
      localStorage.setItem('kodexis_admin_questions', JSON.stringify(updated));
      resetForm();
    }
  };

  const handleEdit = (q: Question) => {
    setIsEditing(true);
    setEditId(q.id || null);
    setTitle(q.title);
    setDescription(q.description);
    setDifficulty(q.difficulty);
    setTopic(q.topic);
    setExpectedTimeComplexity(q.expectedTimeComplexity || 'O(n)');
    setExpectedSpaceComplexity(q.expectedSpaceComplexity || 'O(1)');
    setOptimalSolutionConcept(q.optimalSolutionConcept || '');
    setJavaTemplate(q.javaTemplate || '');
    setPythonTemplate(q.pythonTemplate || '');
    setJavascriptTemplate(q.javascriptTemplate || '');

    if (q.testCases && q.testCases.length >= 2) {
      setTc1Input(q.testCases[0].input);
      setTc1Output(q.testCases[0].expectedOutput);
      setTc2Input(q.testCases[1].input);
      setTc2Output(q.testCases[1].expectedOutput);
    } else if (q.testCases && q.testCases.length === 1) {
      setTc1Input(q.testCases[0].input);
      setTc1Output(q.testCases[0].expectedOutput);
      setTc2Input('');
      setTc2Output('');
    } else {
      setTc1Input('');
      setTc1Output('');
      setTc2Input('');
      setTc2Output('');
    }
  };

  const handleDelete = async (qid: number) => {
    if (!window.confirm("Permanently delete this question and all its test cases?")) return;
    try {
      await withFastTimeout(axios.delete(`/api/admin/questions/${qid}`), 2500, 'Question delete');
      loadQuestions();
    } catch (error) {
      console.warn('Backend unavailable or slow, deleting locally:', error);
      const updated = questions.filter(q => q.id !== qid);
      setQuestions(updated);
      localStorage.setItem('kodexis_admin_questions', JSON.stringify(updated));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle('');
    setDescription('');
    setDifficulty('MEDIUM');
    setTopic('Arrays');
    setExpectedTimeComplexity('O(n)');
    setExpectedSpaceComplexity('O(1)');
    setOptimalSolutionConcept('');
    setJavaTemplate('');
    setPythonTemplate('');
    setJavascriptTemplate('');
    setTc1Input('');
    setTc1Output('');
    setTc2Input('');
    setTc2Output('');
  };

  // Feature flag handlers
  const handleToggleFeature = (keyOrId: string) => {
    toggleFeature(keyOrId);
    setFeatures(getFeatures());
  };

  const handleRemoveFeature = (keyOrId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the feature "${name}" from the platform?`)) return;
    removeFeature(keyOrId);
    setFeatures(getFeatures());
  };

  const handleAddFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim() || !newFeatureKey.trim()) {
      alert("Please provide both Feature Name and Feature Key.");
      return;
    }

    const formattedKey = newFeatureKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    addFeature({
      name: newFeatureName.trim(),
      key: formattedKey,
      description: newFeatureDesc.trim() || 'Custom platform feature flag.',
      category: newFeatureCategory,
      enabled: newFeatureEnabled
    });

    setFeatures(getFeatures());
    setShowAddFeatureModal(false);
    setNewFeatureName('');
    setNewFeatureKey('');
    setNewFeatureDesc('');
    setNewFeatureEnabled(true);
  };

  // Filtered lists
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(questionSearch.toLowerCase()) || q.topic.toLowerCase().includes(questionSearch.toLowerCase());
    const matchesDiff = difficultyFilter === 'ALL' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const filteredCandidates = candidateUsers.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(userSearch.toLowerCase()) || c.username.toLowerCase().includes(userSearch.toLowerCase());
    const matchesReg = regularityFilter === 'ALL' || c.regularity.tier === regularityFilter;
    const matchesLvl = levelFilter === 'ALL' || `Level ${c.level.number}` === levelFilter;
    return matchesSearch && matchesReg && matchesLvl;
  });

  // Extract all activity events across candidates for chronological feed
  const allActivities: (CandidateActivity & { username: string; fullName: string })[] = [];
  candidateUsers.forEach(u => {
    u.recentActivities.forEach(a => {
      allActivities.push({
        ...a,
        username: u.username,
        fullName: u.fullName
      });
    });
  });

  const filteredActivities = allActivities.filter(a => {
    if (activityTypeFilter === 'ALL') return true;
    return a.actionType === activityTypeFilter;
  });

  const filteredFeatures = features.filter(f => {
    if (featureCategoryFilter === 'ALL') return true;
    return f.category === featureCategoryFilter;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* HEADER & NAVIGATION TABS */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase flex items-center gap-2">
            <Shield className="text-red-400" size={20} />
            Administrator Laboratory & Governance
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            Platform audit telemetry, user regularity, skill levels, and dynamic feature management
          </p>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex items-center gap-2 bg-zinc-950/70 p-1.5 rounded-xl border border-border/80 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'questions'
                ? 'bg-brand-cyan text-zinc-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Database size={13} />
            <span>Questions Repository</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit-logs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'audit-logs'
                ? 'bg-brand-violet text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Users size={13} />
            <span>User Activity & Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'features'
                ? 'bg-brand-emerald text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Sliders size={13} />
            <span>Feature Management</span>
          </button>
        </div>
      </div>

      {/* METRIC READOUT STRIPS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        {[
          { label: 'Active Sandboxes', val: '5 ONLINE', color: 'text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5' },
          { label: 'Total Questions', val: `${questions.length} AVAILABLE`, color: 'text-brand-violet border-brand-violet/20 bg-brand-violet/5' },
          { label: 'Platform Users', val: `${candidateUsers.length} REGISTERED`, color: 'text-amber-400 border-amber-400/20 bg-amber-400/5' },
          { label: 'Live Features', val: `${features.filter(f => f.enabled).length} / ${features.length} ACTIVE`, color: 'text-brand-emerald border-brand-emerald/20 bg-brand-emerald/5' }
        ].map((m, i) => (
          <div key={i} className={`p-4 border rounded-xl shadow-sm ${m.color}`}>
            <span className="text-[9px] text-zinc-500 uppercase block tracking-wider">{m.label}</span>
            <span className="text-sm font-bold block mt-1">{m.val}</span>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: QUESTIONS REPOSITORY */}
      {/* ========================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="relative w-full sm:w-72">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search question title or topic..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950/70 border border-border rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-zinc-500 text-[10px] uppercase">Difficulty:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-zinc-950 border border-border text-zinc-300 rounded px-2.5 py-1.5 focus:outline-none text-xs"
              >
                <option value="ALL">All Levels</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-cyan text-zinc-950 font-bold text-xs rounded hover:bg-brand-cyan/90 transition shadow-sm ml-2"
                >
                  <Plus size={12} />
                  <span>Add Question</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* QUESTIONS LIST */}
            <div className="lg:col-span-6 space-y-3">
              {loading ? (
                <div className="text-center p-8 font-mono text-xs text-zinc-500">Querying question bank...</div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center p-8 font-mono text-xs text-zinc-500 border border-border rounded-xl">No matching questions found.</div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {filteredQuestions.map((q) => (
                    <div key={q.id} className="p-4 border border-border bg-background-panel rounded-xl flex justify-between items-start gap-4 hover:border-zinc-700 transition">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-zinc-200 truncate">{q.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            q.difficulty === 'EASY' ? 'text-green-400 bg-green-500/10 border border-green-500/20' :
                            q.difficulty === 'MEDIUM' ? 'text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20' : 'text-brand-violet bg-brand-violet/10 border border-brand-violet/20'
                          }`}>{q.difficulty}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          Topic: <span className="text-zinc-400">{q.topic}</span> | Time: <span className="text-zinc-400">{q.expectedTimeComplexity}</span> | Space: <span className="text-zinc-400">{q.expectedSpaceComplexity}</span>
                        </p>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 font-sans pt-1">
                          {q.description}
                        </p>
                      </div>
                      <div className="flex space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(q)}
                          className="p-2 border border-border hover:bg-zinc-800 text-zinc-400 hover:text-brand-cyan rounded-lg transition"
                          title="Edit Question"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id || 0)}
                          className="p-2 border border-border hover:bg-red-500/15 text-zinc-400 hover:text-red-400 rounded-lg transition"
                          title="Delete Question"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* EDITOR FORM */}
            <div className="lg:col-span-6">
              {isEditing ? (
                <form onSubmit={handleSave} className="border border-border bg-background-panel rounded-xl p-6 space-y-4 font-mono text-xs shadow-md">
                  <div className="flex justify-between items-center border-b border-border pb-3 mb-2">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Code size={14} className="text-brand-cyan" />
                      {editId ? 'UPDATE QUESTION DETAILS' : 'CREATE NEW QUESTION'}
                    </span>
                    <button type="button" onClick={resetForm} className="text-[10px] text-zinc-500 hover:text-zinc-300">
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 uppercase font-bold">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Two Sum"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-brand-cyan"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 uppercase font-bold">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none"
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 uppercase font-bold">Topic</label>
                      <input
                        type="text"
                        placeholder="e.g. Arrays / Hashing"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 uppercase font-bold">Expected Time Complexity</label>
                      <input
                        type="text"
                        placeholder="O(n)"
                        value={expectedTimeComplexity}
                        onChange={(e) => setExpectedTimeComplexity(e.target.value)}
                        className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 uppercase font-bold">Expected Space Complexity</label>
                      <input
                        type="text"
                        placeholder="O(1)"
                        value={expectedSpaceComplexity}
                        onChange={(e) => setExpectedSpaceComplexity(e.target.value)}
                        className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 uppercase font-bold">Description (Markdown Supported)</label>
                    <textarea
                      placeholder="Enter detailed problem description, constraints, and test case examples..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-brand-cyan"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 uppercase font-bold">Optimal Solution Concept</label>
                    <textarea
                      placeholder="Describe optimal algorithm used by defense evaluator..."
                      value={optimalSolutionConcept}
                      onChange={(e) => setOptimalSolutionConcept(e.target.value)}
                      rows={2}
                      className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none"
                    />
                  </div>

                  {/* Seed Test Cases */}
                  <div className="border border-border/80 rounded-lg p-3 bg-zinc-950/40 space-y-3">
                    <span className="text-[9px] text-brand-cyan uppercase font-bold block">Seeded Test Cases</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Case 1 Input (Public)</label>
                        <input
                          type="text"
                          placeholder="9\n2,7,11,15"
                          value={tc1Input}
                          onChange={(e) => setTc1Input(e.target.value)}
                          className="w-full bg-background border border-border rounded p-1 text-[10px] text-zinc-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Case 1 Expected Output</label>
                        <input
                          type="text"
                          placeholder="0,1"
                          value={tc1Output}
                          onChange={(e) => setTc1Output(e.target.value)}
                          className="w-full bg-background border border-border rounded p-1 text-[10px] text-zinc-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Case 2 Input (Hidden)</label>
                        <input
                          type="text"
                          placeholder="6\n3,3"
                          value={tc2Input}
                          onChange={(e) => setTc2Input(e.target.value)}
                          className="w-full bg-background border border-border rounded p-1 text-[10px] text-zinc-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Case 2 Expected Output</label>
                        <input
                          type="text"
                          placeholder="0,1"
                          value={tc2Output}
                          onChange={(e) => setTc2Output(e.target.value)}
                          className="w-full bg-background border border-border rounded p-1 text-[10px] text-zinc-200"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded bg-brand-cyan text-zinc-950 font-bold text-xs uppercase hover:bg-brand-cyan/90 transition shadow-sm"
                  >
                    Save Question Record
                  </button>
                </form>
              ) : (
                <div className="border border-border bg-background-panel rounded-xl p-8 text-center font-mono text-xs text-zinc-500 space-y-3">
                  <Activity className="mx-auto text-zinc-700" size={28} />
                  <h4 className="text-zinc-300 font-bold">Question Configuration Panel</h4>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    Select a question to edit its templates, or click Add Question to introduce new test targets to the repository.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CANDIDATE ACTIVITY & AUDIT LOGS */}
      {/* ========================================================= */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-8 animate-fade-in font-mono">
          {/* Top KPI Cards for Regularity & Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-zinc-950/60 border border-brand-violet/30 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
                <Users size={12} className="text-brand-violet" />
                <span>Active Candidates</span>
              </span>
              <span className="text-xl font-bold text-zinc-100 block">{candidateUsers.length}</span>
              <span className="text-[10px] text-zinc-400">Regularly practiced candidates</span>
            </div>

            <div className="p-4 bg-zinc-950/60 border border-brand-cyan/30 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
                <Flame size={12} className="text-brand-cyan" />
                <span>Platform Regularity</span>
              </span>
              <span className="text-xl font-bold text-brand-cyan block">
                {candidateUsers.filter(u => u.regularity.tier === 'Daily Active' || u.regularity.tier === 'Frequent').length} High Regularity
              </span>
              <span className="text-[10px] text-zinc-400">Streak active ≥ 3 days</span>
            </div>

            <div className="p-4 bg-zinc-950/60 border border-amber-400/30 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
                <Award size={12} className="text-amber-400" />
                <span>Total Practice Sessions</span>
              </span>
              <span className="text-xl font-bold text-amber-400 block">
                {candidateUsers.reduce((sum, u) => sum + u.regularity.sessionsCount, 0)} Completed
              </span>
              <span className="text-[10px] text-zinc-400">Full mock interviews conducted</span>
            </div>

            <div className="p-4 bg-zinc-950/60 border border-brand-emerald/30 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
                <Shield size={12} className="text-brand-emerald" />
                <span>Integrity Compliance</span>
              </span>
              <span className="text-xl font-bold text-brand-emerald block">96.8% Clean</span>
              <span className="text-[10px] text-zinc-400">Tab switch infraction audit</span>
            </div>
          </div>

          {/* CANDIDATES USAGE & LEVEL TABLE */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={15} className="text-brand-violet" />
                  <span>Candidates Regularity & Skill Tier Matrix</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Inspect who uses the platform regularly, their candidate level, and recent actions.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search candidate..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-7 pr-2.5 py-1.5 bg-zinc-950 border border-border rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                  />
                </div>

                <select
                  value={regularityFilter}
                  onChange={(e) => setRegularityFilter(e.target.value)}
                  className="bg-zinc-950 border border-border text-zinc-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="ALL">All Regularities</option>
                  <option value="Daily Active">Daily Active</option>
                  <option value="Frequent">Frequent</option>
                  <option value="Occasional">Occasional</option>
                  <option value="Newcomer">Newcomer</option>
                </select>

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="bg-zinc-950 border border-border text-zinc-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="ALL">All Levels</option>
                  <option value="Level 5">Level 5 (Staff)</option>
                  <option value="Level 4">Level 4 (Senior)</option>
                  <option value="Level 3">Level 3 (Mid)</option>
                  <option value="Level 2">Level 2 (Junior)</option>
                  <option value="Level 1">Level 1 (Novice)</option>
                </select>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-background-panel shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 border-b border-border text-zinc-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Candidate & Alias</th>
                      <th className="py-3 px-4">Usage Regularity</th>
                      <th className="py-3 px-4">Candidate Level</th>
                      <th className="py-3 px-4">What They Did (Recent Action)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                          No candidate activity records found. Registered candidates will appear here as they interact with the platform.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c) => {
                        const latestAction = c.recentActivities[0];
                        return (
                        <tr key={c.id} className="hover:bg-zinc-900/50 transition">
                          {/* Name & Target */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-brand-violet/20 border border-brand-violet/40 text-brand-violet font-bold flex items-center justify-center text-xs">
                                {c.username.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-zinc-100 block">{c.fullName}</span>
                                <span className="text-[10px] text-zinc-500">@{c.username} • {c.targetRole}</span>
                              </div>
                            </div>
                          </td>

                          {/* Regularity */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                c.regularity.tier === 'Daily Active' ? 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/30' :
                                c.regularity.tier === 'Frequent' ? 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/30' :
                                c.regularity.tier === 'Occasional' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                                'text-zinc-400 bg-zinc-800 border-zinc-700'
                              }`}>
                                {c.regularity.tier === 'Daily Active' && <Flame size={10} className="text-amber-400" />}
                                <span>{c.regularity.tier}</span>
                              </span>
                              <div className="text-[10px] text-zinc-400">
                                {c.regularity.sessionsCount} sessions • {c.regularity.streakDays}d streak • Last active {c.regularity.lastActive}
                              </div>
                            </div>
                          </td>

                          {/* Level */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${c.level.badgeColor}`}>
                                {c.level.title}
                              </span>
                              <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                                <span>Readiness: <strong className="text-zinc-200">{c.level.readinessScore}%</strong></span>
                                <span>XP: <strong className="text-zinc-200">{c.level.xp}</strong></span>
                              </div>
                            </div>
                          </td>

                          {/* Recent Activity */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {latestAction ? (
                              <div className="space-y-0.5">
                                <span className="text-zinc-200 font-semibold truncate block">
                                  {latestAction.questionTitle} ({latestAction.difficulty})
                                </span>
                                <p className="text-[11px] text-zinc-400 line-clamp-1 font-sans">
                                  {latestAction.description}
                                </p>
                                {latestAction.metrics?.tabSwitches != null && latestAction.metrics.tabSwitches > 0 && (
                                  <span className="text-[9px] text-red-400 font-bold inline-block">
                                    ⚠️ {latestAction.metrics.tabSwitches} Tab Switch Violation(s)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-zinc-600 italic">No recent sessions recorded</span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedUserForLogs(c)}
                              className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-border hover:border-brand-violet/50 text-brand-violet text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm"
                            >
                              <Eye size={12} />
                              <span>View Logs</span>
                            </button>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* GLOBAL CHRONOLOGICAL AUDIT ACTION STREAM */}
          <div className="space-y-4 pt-4 border-t border-border/80">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={15} className="text-brand-cyan" />
                  <span>Real-Time Platform Audit Stream</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Global chronological log of candidate actions, logic approvals, code runs, and integrity warnings.
                </p>
              </div>

              {/* Event Type Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500 text-[10px] uppercase">Filter Event:</span>
                <select
                  value={activityTypeFilter}
                  onChange={(e) => setActivityTypeFilter(e.target.value)}
                  className="bg-zinc-950 border border-border text-zinc-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="ALL">All Activity Events</option>
                  <option value="SOLVE">Problem Solved</option>
                  <option value="TAB_SWITCH">Tab Switch Infraction</option>
                  <option value="LOGIC_GATE">Logic Defense</option>
                  <option value="FULLSCREEN">Fullscreen Prompt</option>
                  <option value="RUN_CODE">Code Execution</option>
                  <option value="SUBMIT">Interview Submission</option>
                </select>
              </div>
            </div>

            {/* Event Stream Feed */}
            <div className="border border-border/80 bg-zinc-950/60 rounded-xl p-4 space-y-3 max-h-[420px] overflow-y-auto">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">No activity records match the selected filter.</div>
              ) : (
                filteredActivities.map((act) => (
                  <div key={act.id} className="p-3 bg-zinc-900/60 border border-border/50 rounded-lg flex items-start justify-between gap-3 text-xs hover:border-zinc-700 transition">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 mt-0.5 border ${
                        act.actionType === 'SOLVE' ? 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/30' :
                        act.actionType === 'TAB_SWITCH' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                        act.actionType === 'LOGIC_GATE' ? 'text-brand-violet bg-brand-violet/10 border-brand-violet/30' :
                        act.actionType === 'FULLSCREEN' ? 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/30' :
                        'text-zinc-300 bg-zinc-800 border-zinc-700'
                      }`}>
                        {act.actionType}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-zinc-200">
                          <strong className="text-zinc-100">{act.fullName}</strong>
                          <span className="text-zinc-500">(@{act.username})</span>
                          <span className="text-zinc-400">•</span>
                          <span className="text-brand-cyan font-bold">{act.questionTitle}</span>
                        </div>
                        <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">{act.description}</p>
                        {act.metrics && (
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 pt-0.5">
                            {act.metrics.runtimeMs != null && <span>⏱️ Runtime: {act.metrics.runtimeMs}ms</span>}
                            {act.metrics.testCasesPassed && <span>🧪 Test Cases: {act.metrics.testCasesPassed}</span>}
                            {act.metrics.tabSwitches != null && <span className={act.metrics.tabSwitches > 0 ? "text-red-400 font-bold" : ""}>⚠️ Tab Switches: {act.metrics.tabSwitches}</span>}
                            {act.metrics.logicVerdict && <span>🧠 Logic: {act.metrics.logicVerdict}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">{act.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* INDIVIDUAL CANDIDATE AUDIT MODAL */}
          {selectedUserForLogs && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="w-full max-w-2xl bg-background-panel border border-brand-violet/40 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.25)] p-6 space-y-5 relative max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-violet/20 border border-brand-violet/40 text-brand-violet font-bold flex items-center justify-center text-sm">
                      {selectedUserForLogs.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <span>{selectedUserForLogs.fullName}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${selectedUserForLogs.level.badgeColor}`}>
                          {selectedUserForLogs.level.title}
                        </span>
                      </h3>
                      <p className="text-[10px] text-zinc-500">
                        @{selectedUserForLogs.username} • {selectedUserForLogs.targetRole}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUserForLogs(null)}
                    className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Regularity and Skills Chips */}
                <div className="p-3 bg-zinc-950/70 border border-border/60 rounded-xl space-y-2 shrink-0 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span>Regularity Tier: <strong className="text-brand-emerald">{selectedUserForLogs.regularity.tier}</strong></span>
                    <span>Practice Streak: <strong className="text-amber-400">{selectedUserForLogs.regularity.streakDays} Days</strong></span>
                    <span>Total Sessions: <strong className="text-zinc-200">{selectedUserForLogs.regularity.sessionsCount}</strong></span>
                    <span>Hours Practiced: <strong className="text-brand-cyan">{selectedUserForLogs.regularity.hoursPracticed}h</strong></span>
                  </div>
                  <div className="pt-2 border-t border-zinc-900 flex flex-wrap gap-1.5">
                    {selectedUserForLogs.skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {s.domain}: <strong className="text-brand-cyan">{s.proficiency}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Candidate Action Log Feed */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">
                    Chronological Action & Session Timeline
                  </span>
                  {selectedUserForLogs.recentActivities.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs">No logged sessions recorded yet for this candidate.</div>
                  ) : (
                    selectedUserForLogs.recentActivities.map((act) => (
                      <div key={act.id} className="p-3 bg-zinc-900/50 border border-border/50 rounded-lg space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            act.actionType === 'SOLVE' ? 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/30' :
                            act.actionType === 'TAB_SWITCH' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                            act.actionType === 'LOGIC_GATE' ? 'text-brand-violet bg-brand-violet/10 border-brand-violet/30' :
                            'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/30'
                          }`}>
                            {act.actionType}
                          </span>
                          <span className="text-[10px] text-zinc-500">{act.timestamp}</span>
                        </div>
                        <div className="text-zinc-200 font-semibold text-xs">
                          {act.questionTitle} <span className="text-zinc-500 text-[10px]">({act.difficulty})</span>
                        </div>
                        <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">{act.description}</p>
                        {act.metrics && (
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 pt-1">
                            {act.metrics.runtimeMs != null && <span>Runtime: {act.metrics.runtimeMs}ms</span>}
                            {act.metrics.testCasesPassed && <span>Cases: {act.metrics.testCasesPassed}</span>}
                            {act.metrics.tabSwitches != null && <span className={act.metrics.tabSwitches > 0 ? "text-red-400 font-bold" : ""}>Tab Switches: {act.metrics.tabSwitches}</span>}
                            {act.metrics.logicVerdict && <span>Verdict: {act.metrics.logicVerdict}</span>}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-border flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForLogs(null)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-border text-zinc-300 rounded text-xs font-bold transition"
                  >
                    Close Log Inspector
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PLATFORM FEATURE FLAGS & DYNAMIC CONTROLS */}
      {/* ========================================================= */}
      {activeTab === 'features' && (
        <div className="space-y-6 animate-fade-in font-mono">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={16} className="text-brand-emerald" />
                <span>Platform Feature Flags & Dynamic Modules</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Add, toggle on/off, or remove platform features in real time. Changes immediately affect candidate interview rooms.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Reset all platform features to default settings?")) {
                    resetFeaturesToDefault();
                    setFeatures(getFeatures());
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-border bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5"
                title="Reset to default system features"
              >
                <RefreshCw size={12} />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddFeatureModal(true)}
                className="px-4 py-1.5 rounded-lg bg-brand-emerald hover:bg-brand-emerald/90 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              >
                <Plus size={13} />
                <span>Add Feature</span>
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['ALL', 'Proctoring', 'AI Interviewer', 'Assessment', 'Interface', 'General'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFeatureCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition ${
                  featureCategoryFilter === cat
                    ? 'bg-zinc-800 border-brand-emerald text-brand-emerald shadow-sm'
                    : 'bg-zinc-950/80 border-border text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatures.map((f) => (
              <div
                key={f.id}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm ${
                  f.enabled
                    ? 'bg-zinc-950/80 border-brand-emerald/40 hover:border-brand-emerald shadow-[0_0_20px_rgba(16,185,129,0.06)]'
                    : 'bg-zinc-950/40 border-border/60 hover:border-zinc-700 opacity-75'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                      f.category === 'Proctoring' ? 'text-amber-400 bg-amber-400/10 border-amber-400/30' :
                      f.category === 'AI Interviewer' ? 'text-brand-violet bg-brand-violet/10 border-brand-violet/30' :
                      f.category === 'Assessment' ? 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/30' :
                      'text-zinc-400 bg-zinc-800 border-zinc-700'
                    }`}>
                      {f.category}
                    </span>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeature(f.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        f.enabled ? 'bg-brand-emerald' : 'bg-zinc-800'
                      }`}
                      title={f.enabled ? 'Click to disable feature' : 'Click to enable feature'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          f.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                      <span>{f.name}</span>
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{f.key}</span>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    {f.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between text-[10px]">
                  <span className={`font-bold uppercase ${f.enabled ? 'text-brand-emerald' : 'text-zinc-500'}`}>
                    {f.enabled ? '● Active in Sandboxes' : '○ Deactivated'}
                  </span>

                  {/* Remove Feature Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(f.id, f.name)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Remove this feature flag"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ADD FEATURE MODAL */}
          {showAddFeatureModal && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="w-full max-w-md bg-background-panel border border-brand-emerald/40 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-brand-emerald" />
                    <h3 className="text-sm font-mono font-bold text-zinc-100">ADD NEW PLATFORM FEATURE</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddFeatureModal(false)}
                    className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddFeatureSubmit} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Feature Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AI Eyetracking Sentinel"
                      value={newFeatureName}
                      onChange={(e) => {
                        setNewFeatureName(e.target.value);
                        if (!newFeatureKey || newFeatureKey.startsWith('FEATURE_')) {
                          setNewFeatureKey('FEATURE_' + e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '_'));
                        }
                      }}
                      className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-brand-emerald"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Feature Key (Unique Identifier)</label>
                    <input
                      type="text"
                      placeholder="e.g. FEATURE_AI_EYETRACKING"
                      value={newFeatureKey}
                      onChange={(e) => setNewFeatureKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                      className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-brand-emerald font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Category</label>
                    <select
                      value={newFeatureCategory}
                      onChange={(e) => setNewFeatureCategory(e.target.value as any)}
                      className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none"
                    >
                      <option value="Proctoring">Proctoring</option>
                      <option value="AI Interviewer">AI Interviewer</option>
                      <option value="Assessment">Assessment</option>
                      <option value="Interface">Interface</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Description</label>
                    <textarea
                      placeholder="Explain what this feature controls across candidate sandboxes..."
                      value={newFeatureDesc}
                      onChange={(e) => setNewFeatureDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-background border border-border rounded p-2 text-zinc-200 focus:outline-none focus:border-brand-emerald font-sans"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="newFeatureEnabled"
                      checked={newFeatureEnabled}
                      onChange={(e) => setNewFeatureEnabled(e.target.checked)}
                      className="rounded border-border text-brand-emerald focus:ring-0"
                    />
                    <label htmlFor="newFeatureEnabled" className="text-zinc-300 text-xs">
                      Enable this feature immediately upon creation
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowAddFeatureModal(false)}
                      className="px-4 py-2 border border-border rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-emerald hover:bg-brand-emerald/90 text-zinc-950 font-bold rounded transition shadow-sm"
                    >
                      Create Feature Flag
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
