import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, AlertCircle, CheckCircle2, ArrowRight,
  BookOpen, Target, Sparkles, ChevronRight
} from 'lucide-react';
import { StudyScheduleData, Citation } from '../types';
import { api } from '../api/client';

interface StudyPlannerProps {
  courseId: string;
  onOpenCitation: (citation: Citation) => void;
  onStartPractice: (topic: string) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  courseId,
  onOpenCitation,
  onStartPractice,
}) => {
  const [scheduleData, setScheduleData] = useState<StudyScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [examDate, setExamDate] = useState('2026-11-20');

  useEffect(() => {
    loadSchedule();
  }, [courseId, examDate]);

  const loadSchedule = async () => {
    setIsLoading(true);
    try {
      const res = await api.getStudySchedule(courseId, 'student_default', examDate);
      setScheduleData(res);
    } catch (err: any) {
      console.error('Failed to load study schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === 'High') return 'badge-rose';
    if (urgency === 'Medium') return 'badge-amber';
    return 'badge-blue';
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: '54rem', margin: '0 auto', width: '100%' }}>
      {/* Header & Exam Countdown */}
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
            <Calendar size={20} style={{ color: 'var(--accent-indigo)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Adaptive Exam Countdown & Schedule</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Calibrated daily plan tailored to your mastery curve and forgetting decay rate.
          </p>
        </div>

        {/* Days Remaining Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: 'var(--accent-indigo)',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1,
              }}
            >
              {scheduleData?.days_remaining || 25}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Days to CS401 Exam
            </div>
          </div>
        </div>
      </div>

      {/* Target Goal Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-app)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          fontSize: '0.825rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={16} style={{ color: 'var(--accent-emerald)' }} />
          <span>Target Course Mastery Goal: <strong>90% Calibrated Mastery</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Exam Target Date:</span>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.375rem',
              color: '#ffffff',
              fontSize: '0.75rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Daily Schedule Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
          7-Day Adaptive Schedule Breakdown
        </h3>

        {scheduleData?.schedule.map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {/* Day of Week */}
              <div style={{ width: '5.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{item.day_of_week}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {item.date}
                </div>
              </div>

              {/* Task Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                    {item.topic}
                  </span>
                  <span className={`badge ${getUrgencyBadge(item.urgency)}`} style={{ fontSize: '0.65rem' }}>
                    {item.urgency} Urgency
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.activity} • {item.reason}
                </div>
              </div>
            </div>

            {/* Time & Action Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <Clock size={13} />
                <span>{item.estimated_minutes} mins</span>
              </div>

              <button
                onClick={() => onStartPractice(item.topic)}
                className="btn-primary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                <span>Study Now</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
