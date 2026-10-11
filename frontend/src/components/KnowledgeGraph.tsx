import React, { useState, useEffect } from 'react';
import {
  GitFork, CheckCircle2, Lock, ArrowRight, BookOpen,
  MessageSquare, Sparkles, ChevronRight, RefreshCw
} from 'lucide-react';
import { KnowledgeGraphData, KnowledgeGraphNode } from '../types';
import { api } from '../api/client';

interface KnowledgeGraphProps {
  courseId: string;
  onAskTutorAboutTopic: (topic: string) => void;
  onStartQuizForTopic: (topic: string) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  courseId,
  onAskTutorAboutTopic,
  onStartQuizForTopic,
}) => {
  const [data, setData] = useState<KnowledgeGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGraph();
  }, [courseId]);

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const res = await api.getKnowledgeGraph(courseId);
      setData(res);
      if (res.nodes.length > 0) {
        setSelectedNode(res.nodes[0]);
      }
    } catch (err: any) {
      console.error('Failed to load knowledge graph:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getNodeColor = (status: string, mastery: number) => {
    if (status === 'mastered') return '#10b981'; // emerald
    if (status === 'in_progress') return '#3b82f6'; // blue
    if (status === 'ready') return '#8b5cf6'; // purple
    return '#64748b'; // slate locked
  };

  if (isLoading || !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw className="spin" size={24} style={{ margin: '0 auto 1rem auto' }} />
        <div>Building Concept Knowledge Graph & Prerequisite Map...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left Canvas: Interactive Visual Node Tree */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-panel)',
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
              Concept Map & Prerequisite Tree
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Structured prerequisite graph derived from your textbooks and lecture syllabi.
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.7rem' }}>
            <span className="badge badge-emerald">Mastered (&gt;75%)</span>
            <span className="badge badge-blue">In Progress (40-75%)</span>
            <span className="badge badge-indigo">Ready to Learn</span>
            <span className="badge" style={{ background: '#334155', color: '#94a3b8' }}>Prereq Needed</span>
          </div>
        </div>

        {/* Graph Nodes Grid Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
            gap: '1rem',
          }}
        >
          {data.nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const nodeColor = getNodeColor(node.status, node.mastery_level);
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  border: `2px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                  borderRadius: '0.75rem',
                  padding: '1.15rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    {node.category}
                  </div>
                  <div
                    style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      borderRadius: '50%',
                      backgroundColor: nodeColor,
                      boxShadow: `0 0 8px ${nodeColor}`,
                    }}
                  />
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                  {node.topic_name}
                </h4>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                  {node.description.length > 90 ? node.description.substring(0, 90) + '...' : node.description}
                </p>

                {/* Mastery Bar */}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Calibrated Mastery</span>
                    <span style={{ fontWeight: 700, color: nodeColor, fontFamily: 'var(--font-mono)' }}>
                      {Math.round(node.mastery_level * 100)}%
                    </span>
                  </div>
                  <div style={{ height: '5px', backgroundColor: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round(node.mastery_level * 100)}%`,
                        height: '100%',
                        backgroundColor: nodeColor,
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>

                {/* Prerequisites Badge Row */}
                {node.prerequisites && node.prerequisites.length > 0 && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    Requires: {node.prerequisites.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Drawer: Selected Node Details & Direct Learning Triggers */}
      {selectedNode && (
        <div
          style={{
            width: '22rem',
            backgroundColor: 'var(--bg-card)',
            borderLeft: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-indigo)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              {selectedNode.category}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
              {selectedNode.topic_name}
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Description & Core Theory
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {selectedNode.description}
              </p>
            </div>

            {/* Subtopics Checklist */}
            {selectedNode.subtopics && selectedNode.subtopics.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Key Subtopics
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {selectedNode.subtopics.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)',
                        backgroundColor: 'var(--bg-app)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '0.375rem',
                      }}
                    >
                      <CheckCircle2 size={13} style={{ color: 'var(--accent-cyan)' }} />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <button
              onClick={() => onAskTutorAboutTopic(selectedNode.topic_name)}
              className="btn-primary"
              style={{ width: '100%', fontSize: '0.825rem' }}
            >
              <MessageSquare size={14} />
              <span>Ask Tutor About This</span>
            </button>

            <button
              onClick={() => onStartQuizForTopic(selectedNode.topic_name)}
              className="btn-secondary"
              style={{ width: '100%', fontSize: '0.825rem' }}
            >
              <CheckCircle2 size={14} />
              <span>Practice This Concept</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
