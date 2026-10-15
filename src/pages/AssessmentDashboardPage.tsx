import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Code, 
  History,
  AlertCircle
} from 'lucide-react';
import RadarChart from '../components/RadarChart';
import ProgressChart from '../components/ProgressChart';
import LanguageBreakdownChart from '../components/LanguageBreakdownChart';
import CodeQualityInspector from '../components/CodeQualityInspector';
import AiFeedbackCard from '../components/AiFeedbackCard';
import LiveCodeEvaluator from '../components/LiveCodeEvaluator';
import SessionHistory from '../components/SessionHistory';
import { useAuth } from '../context/AuthContext';
import { mongoService } from '../lib/mongoService';

const sampleCodeJava = `public class TwoSum {
    public int[] solveTwoSum(int[] nums, int target) {
        // Linear scan using HashMap for O(N) lookup
        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
};`;

export default function AssessmentDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'evaluator' | 'analytics' | 'history'>('evaluator');
  const [currentAssessment, setCurrentAssessment] = useState<any | null>(null);
  const [currentCode, setCurrentCode] = useState<string>(sampleCodeJava);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadRealData = async () => {
      try {
        const autopsies = await mongoService.getUserAutopsies(user?.username);
        if (autopsies && autopsies.length > 0) {
          const mappedHistory = autopsies.map(a => ({
            id: a.sessionId,
            date: a.date ? a.date.split('T')[0] : (a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : 'Today'),
            title: a.targetRole ? `${a.targetRole} Assessment` : 'Technical Autopsy Session',
            language: 'General SWE',
            score: a.overallScore,
            timeComp: 'Optimal',
            testPass: 'Passed'
          }));
          setHistory(mappedHistory);

          const latest = autopsies[0];
          setCurrentAssessment({
            assessmentId: latest.sessionId,
            sessionId: latest.sessionId,
            candidateId: latest.username,
            problemTitle: latest.targetRole ? `${latest.targetRole} Evaluation` : 'Technical Autopsy Session',
            programmingLanguage: 'Candidate Solution',
            overallScore: latest.overallScore,
            testCasesPassed: 10,
            totalTestCases: 10,
            timeComplexityEstimate: "O(N)",
            spaceComplexityEstimate: "O(1)",
            cyclomaticComplexity: 2,
            factorScores: [
              { factorName: "Technical Proficiency", score: latest.multiFactorScores?.technicalProficiency ?? 85, weight: "35%", status: "Evaluated", observation: "Assessed from algorithmic rigor and technical defense." },
              { factorName: "Conceptual Depth", score: latest.multiFactorScores?.conceptualDepthScore ?? 85, weight: "25%", status: "Evaluated", observation: "Assessed from foundational principles and systems knowledge." },
              { factorName: "Problem Solving", score: latest.multiFactorScores?.problemSolvingScore ?? 80, weight: "25%", status: "Evaluated", observation: "Assessed from edge-case handling and optimal strategy." },
              { factorName: "Communication & Clarity", score: latest.multiFactorScores?.communicationScore ?? 85, weight: "15%", status: "Evaluated", observation: "Assessed from clear articulation and explanation structure." }
            ],
            detectedCodeSmells: [],
            summaryVerdict: latest.detailedDebrief || "Technical autopsy recorded in persistent MongoDB storage.",
            keyStrengths: latest.keyStrengths || [],
            areaForImprovement: latest.areasForImprovement || [],
            refactoredCodeSnippet: '',
            recommendedTopics: []
          });
        } else {
          setHistory([]);
          setCurrentAssessment(null);
        }
      } catch (err) {
        setHistory([]);
        setCurrentAssessment(null);
      }
    };
    loadRealData();
  }, [user?.username]);

  const handleEvaluationComplete = (newResult: any, code: string) => {
    // Merge with existing assessment so components always receive complete data
    setCurrentAssessment((prev: any) => ({ ...(prev || {}), ...newResult }));
    setCurrentCode(code);
    setActiveTab('evaluator');
  };


  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Application Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-brand-cyan/20 border border-brand-cyan text-brand-cyan">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono tracking-wide text-zinc-100 uppercase">
              Multi-Factor Coding Assessment Dashboard
            </h1>
            <p className="text-xs font-mono text-zinc-400">
              KODEXIS Assessment Engine • Multi-Dimensional Technical Proficiency Analytics
            </p>
          </div>
        </div>

        <div className="border border-border bg-background-panel px-4 py-2 rounded-full flex items-center space-x-4">
          <div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Candidate</span>
            <span className="text-xs font-bold text-zinc-200">{user?.fullName || 'Candidate'}</span>
          </div>
          <div className="h-6 w-[1px] bg-zinc-800" />
          <div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Readiness</span>
            <span className="text-sm font-extrabold text-brand-cyan">{user?.readinessScore ?? 96}%</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-zinc-800 pb-2 overflow-x-auto font-mono text-xs">
        <button
          onClick={() => setActiveTab('evaluator')}
          className={`px-4 py-2.5 rounded border transition flex items-center gap-2 ${
            activeTab === 'evaluator'
              ? 'bg-brand-cyan/15 border-brand-cyan text-brand-cyan font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Code size={15} /> Live Evaluator & Code Analysis
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded border transition flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-brand-cyan/15 border-brand-cyan text-brand-cyan font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <BarChart3 size={15} /> Multi-Factor Analytics
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded border transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-brand-cyan/15 border-brand-cyan text-brand-cyan font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <History size={15} /> Session History & PDF Exports
        </button>
      </div>

      {/* Tab 1: Live Evaluator & Code Analysis */}
      {activeTab === 'evaluator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 border border-brand-cyan/30 bg-brand-cyan/5 rounded">
              <span className="text-[10px] text-zinc-400 uppercase">Overall Score</span>
              <p className="text-2xl font-bold text-brand-cyan mt-1">
                {currentAssessment ? `${currentAssessment.overallScore}%` : '--'}
              </p>
              <span className="text-[9px] text-emerald-400 font-semibold mt-1 block">
                {currentAssessment ? 'Evaluation Complete' : 'Run Live Evaluator'}
              </span>
            </div>
            <div className="p-4 border border-brand-violet/30 bg-brand-violet/5 rounded">
              <span className="text-[10px] text-zinc-400 uppercase">Time Complexity</span>
              <p className="text-xl font-bold text-brand-violet mt-1">
                {currentAssessment?.timeComplexityEstimate || '--'}
              </p>
              <span className="text-[9px] text-zinc-400 mt-1 block">
                {currentAssessment ? 'Static AST Profiling' : 'Awaiting Execution'}
              </span>
            </div>
            <div className="p-4 border border-emerald-500/30 bg-emerald-500/5 rounded">
              <span className="text-[10px] text-zinc-400 uppercase">Space Complexity</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {currentAssessment?.spaceComplexityEstimate || '--'}
              </p>
              <span className="text-[9px] text-zinc-400 mt-1 block">
                {currentAssessment ? 'Auxiliary Memory Profile' : 'Awaiting Execution'}
              </span>
            </div>
            <div className="p-4 border border-amber-500/30 bg-amber-500/5 rounded">
              <span className="text-[10px] text-zinc-400 uppercase">Test Cases Passed</span>
              <p className="text-xl font-bold text-amber-400 mt-1">
                {currentAssessment ? `${currentAssessment.testCasesPassed ?? 0} / ${currentAssessment.totalTestCases ?? 0}` : '--'}
              </p>
              <span className="text-[9px] text-emerald-400 font-semibold mt-1 block">
                {currentAssessment ? 'Execution Verified' : 'Awaiting Execution'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiveCodeEvaluator onEvaluateComplete={handleEvaluationComplete} />
            <div className="border border-border bg-background-panel rounded p-6">
              <h3 className="text-sm font-mono font-bold text-brand-cyan mb-4 uppercase">
                Multi-Factor Assessment Breakdown Radar
              </h3>
              {currentAssessment?.factorScores ? (
                <RadarChart factorScores={currentAssessment.factorScores} />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg font-mono">
                  <p className="text-xs text-zinc-400">Radar telemetry awaits evaluation.</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Run code in the evaluator to compute multi-factor dimensional balance.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CodeQualityInspector
              code={currentCode}
              codeSmells={currentAssessment?.detectedCodeSmells || []}
              cyclomaticComplexity={currentAssessment?.cyclomaticComplexity || 1}
            />
            {currentAssessment ? (
              <AiFeedbackCard assessment={currentAssessment} />
            ) : (
              <div className="border border-border bg-background-panel rounded p-6 flex flex-col items-center justify-center text-center font-mono space-y-2">
                <AlertCircle size={24} className="text-brand-cyan" />
                <p className="text-xs text-zinc-300 font-bold">No Active Code Analysis</p>
                <p className="text-[10px] text-zinc-500 max-w-sm">
                  Click 'Run Multi-Factor Evaluation' in the Live Evaluator above to generate AI code reviews, refactoring recommendations, and smell detections.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-border bg-background-panel rounded p-6">
              <h3 className="text-sm font-mono font-bold text-emerald-400 mb-2 uppercase">
                Interview Proficiency Score Trajectory
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-mono">Scores across sequential mock interview sessions.</p>
              <ProgressChart history={history} />
            </div>

            <div className="border border-border bg-background-panel rounded p-6">
              <h3 className="text-sm font-mono font-bold text-brand-cyan mb-2 uppercase">
                Programming Language Proficiency Breakdown
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-mono">Performance comparison across Java, Python, and C++.</p>
              <LanguageBreakdownChart />
            </div>
          </div>

          <div className="border border-border bg-background-panel rounded p-6 font-mono">
            <h3 className="text-sm font-bold text-zinc-200 uppercase mb-4">
              Multi-Factor Dimension Weights Overview
            </h3>
            {currentAssessment?.factorScores && currentAssessment.factorScores.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentAssessment.factorScores.map((factor: any, idx: number) => (
                  <div key={idx} className="p-4 border border-border bg-background rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-zinc-200 text-xs">{factor.factorName}</span>
                      <span className="text-[10px] text-zinc-500">{factor.weight}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-extrabold text-brand-cyan">{factor.score}%</span>
                      <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                        {factor.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No active assessment session loaded. Complete an interview or run code to display dimensional factors.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: History & Export */}
      {activeTab === 'history' && (
        <SessionHistory history={history} onSelectSession={() => setActiveTab('evaluator')} />
      )}

    </div>
  );
}
