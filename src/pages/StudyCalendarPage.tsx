import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LEARNING_API_BASE } from '../lib/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Sparkles,
  BookOpen,
  Play,
  GraduationCap,
  RotateCw,
  Layers,
  Flag,
  X,
  Filter
} from 'lucide-react';

export interface CalendarEvent {
  id: string;
  userId?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  durationMinutes: number;
  type: 'STUDY_SESSION' | 'MOCK_INTERVIEW' | 'ADAPTIVE_QUIZ' | 'SPACED_REVISION' | 'FLASHCARDS' | 'EXAM_DEADLINE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  concepts: string[];
  notes?: string;
  completed: boolean;
  createdAt?: number;
}

const EVENT_TYPE_CONFIG: Record<CalendarEvent['type'], { label: string; color: string; bg: string; border: string; icon: any }> = {
  STUDY_SESSION: {
    label: 'Deep Study',
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-500/40',
    icon: BookOpen
  },
  MOCK_INTERVIEW: {
    label: 'AI Interview',
    color: 'text-violet-400',
    bg: 'bg-violet-950/40',
    border: 'border-violet-500/40',
    icon: Play
  },
  ADAPTIVE_QUIZ: {
    label: 'Adaptive Quiz',
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/40',
    icon: GraduationCap
  },
  SPACED_REVISION: {
    label: 'Spaced Review',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    icon: RotateCw
  },
  FLASHCARDS: {
    label: 'Flashcards',
    color: 'text-indigo-400',
    bg: 'bg-indigo-950/40',
    border: 'border-indigo-500/40',
    icon: Layers
  },
  EXAM_DEADLINE: {
    label: 'Exam / Milestone',
    color: 'text-rose-400',
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/40',
    icon: Flag
  }
};

const PRIORITY_BADGES: Record<CalendarEvent['priority'], { label: string; color: string }> = {
  HIGH: { label: 'High Priority', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  MEDIUM: { label: 'Medium Priority', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  LOW: { label: 'Low Priority', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' }
};

export const StudyCalendarPage: React.FC = () => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'MONTH' | 'AGENDA'>('MONTH');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    date: string;
    time: string;
    durationMinutes: number;
    type: CalendarEvent['type'];
    priority: CalendarEvent['priority'];
    concepts: string;
    notes: string;
  }>({
    title: '',
    date: todayStr,
    time: '10:00 AM',
    durationMinutes: 45,
    type: 'STUDY_SESSION',
    priority: 'HIGH',
    concepts: '',
    notes: ''
  });

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    // Instant cache hydration for zero-latency display
    const cached = localStorage.getItem('kodexis_study_calendar_events');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const dummyIds = new Set(['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5', 'evt-6', 'evt-7', 'evt-8']);
          const clean = parsed.filter((e: any) => e && !dummyIds.has(e.id));
          setEvents(clean);
          localStorage.setItem('kodexis_study_calendar_events', JSON.stringify(clean));
        }
      } catch {}
    } else {
      loadFallbackEvents();
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${LEARNING_API_BASE}/calendar/events`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const dummyIds = new Set(['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5', 'evt-6', 'evt-7', 'evt-8']);
        const clean = res.data.filter((e: any) => e && !dummyIds.has(e.id));
        setEvents(clean);
        localStorage.setItem('kodexis_study_calendar_events', JSON.stringify(clean));
      }
    } catch {
      // Retain active events
    }
  };

  const loadFallbackEvents = () => {
    const cached = localStorage.getItem('kodexis_study_calendar_events');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const dummyIds = new Set(['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5', 'evt-6', 'evt-7', 'evt-8']);
          const clean = parsed.filter((e: any) => e && !dummyIds.has(e.id));
          setEvents(clean);
          localStorage.setItem('kodexis_study_calendar_events', JSON.stringify(clean));
          return;
        }
      } catch {
        // ignore
      }
    }

    setEvents([]);
    localStorage.setItem('kodexis_study_calendar_events', JSON.stringify([]));
  };

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(todayStr);
  };

  // Open modal to add event for a specific date
  const openAddModalForDate = (dateString: string) => {
    setEditingEventId(null);
    setFormData({
      title: '',
      date: dateString,
      time: '10:00 AM',
      durationMinutes: 45,
      type: 'STUDY_SESSION',
      priority: 'HIGH',
      concepts: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Open modal to edit existing event
  const openEditModal = (evt: CalendarEvent) => {
    setEditingEventId(evt.id);
    setFormData({
      title: evt.title,
      date: evt.date,
      time: evt.time || '10:00 AM',
      durationMinutes: evt.durationMinutes || 45,
      type: evt.type,
      priority: evt.priority,
      concepts: (evt.concepts || []).join(', '),
      notes: evt.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide an event title or focus topic.');
      return;
    }

    const conceptsList = formData.concepts
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const payload: CalendarEvent = {
      id: editingEventId || `evt-${Date.now()}`,
      title: formData.title.trim(),
      date: formData.date,
      time: formData.time,
      durationMinutes: Number(formData.durationMinutes) || 45,
      type: formData.type,
      priority: formData.priority,
      concepts: conceptsList,
      notes: formData.notes.trim(),
      completed: false
    };

    // Optimistic UI update
    let updatedEvents: CalendarEvent[];
    if (editingEventId) {
      updatedEvents = events.map((ev) => (ev.id === editingEventId ? { ...payload, completed: ev.completed } : ev));
      showToast(`Updated event: "${payload.title}"`);
    } else {
      updatedEvents = [...events, payload];
      showToast(`Scheduled new event for ${payload.date}!`);
    }

    setEvents(updatedEvents);
    localStorage.setItem('kodexis_study_calendar_events', JSON.stringify(updatedEvents));
    setSelectedDateStr(payload.date);
    setIsModalOpen(false);

    // Backend sync
    try {
      if (editingEventId) {
        await axios.put(`${LEARNING_API_BASE}/calendar/events/${editingEventId}`, payload);
      } else {
        await axios.post(`${LEARNING_API_BASE}/calendar/events`, payload);
      }
    } catch {
      // Local copy already preserved
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return;
    const filtered = events.filter((e) => e.id !== id);
    setEvents(filtered);
    localStorage.setItem('kodexis_study_calendar_events', JSON.stringify(filtered));
    showToast(`Removed event: "${title}"`);

    try {
      await axios.delete(`${LEARNING_API_BASE}/calendar/events/${id}`);
    } catch {
      // fallback handled
    }
  };

  const handleToggleCompleted = async (id: string) => {
    const updated = events.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e));
    setEvents(updated);
    localStorage.setItem('kodexis_study_calendar_events', JSON.stringify(updated));

    const item = updated.find((e) => e.id === id);
    if (item?.completed) {
      showToast(`Completed: "${item.title}"!`);
    }

    try {
      await axios.patch(`${LEARNING_API_BASE}/calendar/events/${id}/toggle`);
    } catch {
      // fallback handled
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: Array<{
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
  }> = [];

  // Previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDateStr
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateObj = new Date(year, month, d);
    // Format YYYY-MM-DD cleanly accounting for timezone
    const yStr = dateObj.getFullYear();
    const mStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dStr = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDateStr
    });
  }

  // Next month padding to make full 35 or 42 grid cells
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    const dateStr = nextMonthDate.toISOString().split('T')[0];
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDateStr
    });
  }

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (filterType !== 'ALL' && e.type !== filterType) return false;
    return true;
  });

  const selectedDateEvents = filteredEvents.filter((e) => e.date === selectedDateStr);

  const selectedDateObj = new Date(selectedDateStr + 'T00:00:00');
  const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Global metrics
  const totalEventsCount = events.length;
  const completedEventsCount = events.filter((e) => e.completed).length;
  const totalDurationMinutes = events.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const completionRate = totalEventsCount > 0 ? Math.round((completedEventsCount / totalEventsCount) * 100) : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* NOTIFICATION TOAST */}
      {notificationMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl bg-brand-cyan/20 border border-brand-cyan/50 backdrop-blur-md text-zinc-100 font-mono text-xs shadow-2xl animate-in fade-in slide-in-from-top-4">
          <Sparkles size={16} className="text-brand-cyan shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* HEADER HERO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center space-x-2 text-brand-cyan text-xs font-mono uppercase tracking-wider mb-1">
            <CalendarIcon size={14} />
            <span>Interactive Learning Schedule & Spaced Milestones</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono text-zinc-100 tracking-tight">
            Study Calendar & Milestones
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Plan study sessions, mock interviews, and spaced repetition drills. Click any date on the calendar to view or add events.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => openAddModalForDate(selectedDateStr)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-cyan text-zinc-950 font-mono text-xs font-bold hover:bg-brand-cyan/90 transition shadow-lg shadow-brand-cyan/20"
          >
            <Plus size={16} />
            <span>Add Event on Selected Date</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-border">
          <span className="text-[11px] font-mono text-zinc-400 uppercase block">Total Scheduled</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono text-zinc-100">{totalEventsCount}</span>
            <span className="text-[10px] font-mono text-zinc-500">sessions</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border">
          <span className="text-[11px] font-mono text-zinc-400 uppercase block">Completed Sessions</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">{completedEventsCount}</span>
            <span className="text-[10px] font-mono text-emerald-500/80">({completionRate}%)</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border">
          <span className="text-[11px] font-mono text-zinc-400 uppercase block">Total Planned Time</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono text-brand-violet">
              {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border">
          <span className="text-[11px] font-mono text-zinc-400 uppercase block">Selected Date Plan</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">{selectedDateEvents.length}</span>
            <span className="text-[10px] font-mono text-zinc-500">events on {selectedDateStr}</span>
          </div>
        </div>
      </div>

      {/* FILTER & VIEW TOGGLES */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 p-3 rounded-xl border border-border">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-zinc-500 text-[11px] flex items-center mr-1">
            <Filter size={12} className="mr-1" /> Filter:
          </span>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg transition ${
              filterType === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            All Events
          </button>
          {Object.entries(EVENT_TYPE_CONFIG).map(([typeKey, cfg]) => (
            <button
              key={typeKey}
              onClick={() => setFilterType(typeKey)}
              className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5 ${
                filterType === typeKey
                  ? `${cfg.bg} ${cfg.color} font-bold border ${cfg.border}`
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{cfg.label}</span>
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-lg border border-border text-xs font-mono">
          <button
            onClick={() => setViewMode('MONTH')}
            className={`px-3 py-1 rounded ${viewMode === 'MONTH' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Month Grid
          </button>
          <button
            onClick={() => setViewMode('AGENDA')}
            className={`px-3 py-1 rounded ${viewMode === 'AGENDA' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            All Agenda
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: CALENDAR GRID + SELECTED DATE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: INTERACTIVE CALENDAR GRID */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-border space-y-4">
          {/* CALENDAR CONTROLS */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg md:text-xl font-bold font-mono text-zinc-100">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border border-border bg-background hover:bg-zinc-800 text-zinc-300 transition"
              >
                Today
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg border border-border bg-background hover:bg-zinc-800 text-zinc-300 transition"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg border border-border bg-background hover:bg-zinc-800 text-zinc-300 transition"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* DAY NAMES HEADER */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-zinc-500 uppercase tracking-wider py-1">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* CALENDAR DAYS GRID */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              const dayEvents = filteredEvents.filter((e) => e.date === cell.dateStr);
              const isSelected = cell.dateStr === selectedDateStr;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[92px] p-2 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between group relative ${
                    isSelected
                      ? 'bg-zinc-900/90 border-brand-cyan shadow-lg shadow-brand-cyan/10 ring-1 ring-brand-cyan/50'
                      : cell.isCurrentMonth
                      ? 'bg-zinc-950/40 border-border/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                      : 'bg-zinc-950/10 border-border/40 opacity-40 hover:opacity-80'
                  }`}
                >
                  {/* Top Bar: Date number + Quick Add Button */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                        cell.isToday
                          ? 'bg-brand-cyan text-zinc-950 font-bold'
                          : isSelected
                          ? 'text-brand-cyan font-bold'
                          : cell.isCurrentMonth
                          ? 'text-zinc-300'
                          : 'text-zinc-600'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Quick hover add button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddModalForDate(cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-brand-cyan/20 text-brand-cyan transition"
                      title={`Add event on ${cell.dateStr}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Event Chips List */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const cfg = EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.STUDY_SESSION;
                      return (
                        <div
                          key={ev.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono truncate border flex items-center space-x-1 ${
                            ev.completed
                              ? 'line-through opacity-50 bg-zinc-900 text-zinc-500 border-zinc-800'
                              : `${cfg.bg} ${cfg.color} ${cfg.border}`
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-mono text-zinc-500 block pl-1">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Dot indicator if events exist */}
                  {dayEvents.length > 0 && (
                    <div className="flex items-center space-x-1 pt-1">
                      {dayEvents.map((ev, i) => (
                        <span
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            ev.completed ? 'bg-zinc-600' : 'bg-brand-cyan'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED DATE EVENT INSPECTOR */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-border space-y-4 flex-1">
            {/* Header with Selected Date & Add button */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono text-brand-cyan uppercase font-bold tracking-wider block">
                  {selectedDateStr === todayStr ? 'TODAY · SELECTED' : 'SELECTED DATE'}
                </span>
                <h3 className="text-base font-bold font-mono text-zinc-100 mt-0.5">
                  {selectedDateFormatted}
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {selectedDateEvents.length} event{selectedDateEvents.length === 1 ? '' : 's'} scheduled
                </p>
              </div>

              <button
                onClick={() => openAddModalForDate(selectedDateStr)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-cyan text-zinc-950 font-mono text-xs font-bold hover:bg-brand-cyan/90 transition shadow-md shadow-brand-cyan/20 shrink-0"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            {/* List of events on this selected date */}
            {selectedDateEvents.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <p className="text-sm font-mono text-zinc-300 font-bold">No Events on This Date</p>
                  <p className="text-xs text-zinc-500 font-sans mt-1 max-w-xs mx-auto">
                    Take advantage of this day to plan a deep study session, mock interview, or revision drill.
                  </p>
                </div>
                <div className="pt-2 flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setFormData({
                        title: 'Targeted Algorithm Study Session',
                        date: selectedDateStr,
                        time: '10:00 AM',
                        durationMinutes: 45,
                        type: 'STUDY_SESSION',
                        priority: 'HIGH',
                        concepts: 'Weak topics, Core complexity',
                        notes: 'Study focus session'
                      });
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-border bg-background hover:border-brand-cyan/40 hover:bg-zinc-900 text-xs font-mono text-zinc-300 transition text-left flex items-center justify-between"
                  >
                    <span>+ Schedule Deep Study Session</span>
                    <Plus size={12} className="text-brand-cyan" />
                  </button>

                  <button
                    onClick={() => {
                      setFormData({
                        title: 'AI Mock Interview & Logic Defense',
                        date: selectedDateStr,
                        time: '02:00 PM',
                        durationMinutes: 60,
                        type: 'MOCK_INTERVIEW',
                        priority: 'HIGH',
                        concepts: 'Logic reasoning, Gated implementation',
                        notes: 'AI Mock Interview practice'
                      });
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-border bg-background hover:border-brand-violet/40 hover:bg-zinc-900 text-xs font-mono text-zinc-300 transition text-left flex items-center justify-between"
                  >
                    <span>+ Schedule AI Mock Interview</span>
                    <Plus size={12} className="text-brand-violet" />
                  </button>

                  <button
                    onClick={() => {
                      setFormData({
                        title: 'Adaptive Assessment & Quiz Drill',
                        date: selectedDateStr,
                        time: '04:00 PM',
                        durationMinutes: 30,
                        type: 'ADAPTIVE_QUIZ',
                        priority: 'MEDIUM',
                        concepts: 'Adaptive testing, Diagnostic calibration',
                        notes: 'Quick quiz to update BKT mastery'
                      });
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-border bg-background hover:border-amber-400/40 hover:bg-zinc-900 text-xs font-mono text-zinc-300 transition text-left flex items-center justify-between"
                  >
                    <span>+ Schedule Adaptive Quiz</span>
                    <Plus size={12} className="text-amber-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                {selectedDateEvents.map((evt) => {
                  const cfg = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.STUDY_SESSION;
                  const prio = PRIORITY_BADGES[evt.priority] || PRIORITY_BADGES.MEDIUM;
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={evt.id}
                      className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                        evt.completed
                          ? 'bg-zinc-950/60 border-zinc-800 opacity-60'
                          : `${cfg.bg} border-border hover:border-zinc-700`
                      }`}
                    >
                      {/* Event Type & Priority Row */}
                      <div className="flex items-center justify-between">
                        <span className={`flex items-center space-x-1.5 text-[10px] font-mono font-bold uppercase ${cfg.color}`}>
                          <Icon size={12} />
                          <span>{cfg.label}</span>
                        </span>

                        <div className="flex items-center space-x-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${prio.color}`}>
                            {prio.label}
                          </span>
                        </div>
                      </div>

                      {/* Title & Checkbox */}
                      <div className="flex items-start space-x-2.5">
                        <button
                          onClick={() => handleToggleCompleted(evt.id)}
                          className={`mt-0.5 transition ${evt.completed ? 'text-emerald-400' : 'text-zinc-500 hover:text-brand-cyan'}`}
                          title={evt.completed ? 'Mark pending' : 'Mark completed'}
                        >
                          {evt.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-xs font-mono font-bold leading-snug break-words ${
                              evt.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                            }`}
                          >
                            {evt.title}
                          </h4>

                          <div className="flex items-center space-x-3 text-[11px] font-mono text-zinc-400 mt-1">
                            <span className="flex items-center space-x-1">
                              <Clock size={11} className="text-zinc-500" />
                              <span>{evt.time || '10:00 AM'}</span>
                            </span>
                            <span>•</span>
                            <span>{evt.durationMinutes} mins</span>
                          </div>
                        </div>
                      </div>

                      {/* Concepts Tags */}
                      {evt.concepts && evt.concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {evt.concepts.map((concept, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes / Goals */}
                      {evt.notes && (
                        <p className="text-[11px] text-zinc-400 font-sans border-t border-border/50 pt-2 leading-relaxed">
                          {evt.notes}
                        </p>
                      )}

                      {/* Action buttons footer */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border/40">
                        <button
                          onClick={() => openEditModal(evt)}
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition text-[11px] font-mono flex items-center space-x-1"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition text-[11px] font-mono flex items-center space-x-1"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ALL UPCOMING AGENDA VIEW (when toggled or in list) */}
      {viewMode === 'AGENDA' && (
        <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-lg font-mono font-bold text-zinc-100">All Scheduled Milestones & Agenda</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Chronological timeline of all study and interview events</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">{filteredEvents.length} Total Events</span>
          </div>

          <div className="divide-y divide-border">
            {filteredEvents
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((ev) => {
                const cfg = EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.STUDY_SESSION;
                return (
                  <div key={ev.id} className="py-3 flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="flex items-center space-x-3 min-w-0">
                      <button
                        onClick={() => handleToggleCompleted(ev.id)}
                        className={ev.completed ? 'text-emerald-400' : 'text-zinc-500 hover:text-brand-cyan'}
                      >
                        {ev.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </button>

                      <div className="min-w-0">
                        <span
                          className={`font-bold block truncate ${
                            ev.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                          }`}
                        >
                          {ev.title}
                        </span>
                        <div className="flex items-center space-x-2 text-[11px] text-zinc-500 mt-0.5">
                          <span>{ev.date}</span>
                          <span>•</span>
                          <span>{ev.time}</span>
                          <span>•</span>
                          <span>{ev.durationMinutes}m</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                      <button
                        onClick={() => openEditModal(ev)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev.id, ev.title)}
                        className="p-1 rounded hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ADD / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-border shadow-2xl bg-zinc-950/95 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon size={18} className="text-brand-cyan" />
                <h3 className="text-base font-bold font-mono text-zinc-100">
                  {editingEventId ? 'Edit Scheduled Event' : 'Add New Event to Calendar'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEvent} className="space-y-4 font-mono text-xs">
              {/* Title / Focus Topic */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold block">
                  Event Title / Focus Topic <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dynamic Programming & Memoization"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">
                    Event Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">Start Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Event Type & Duration Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="STUDY_SESSION">Deep Study Session</option>
                    <option value="MOCK_INTERVIEW">AI Mock Interview</option>
                    <option value="ADAPTIVE_QUIZ">Adaptive Diagnostic Quiz</option>
                    <option value="SPACED_REVISION">Ebbinghaus Spaced Review</option>
                    <option value="FLASHCARDS">Flashcard Drill</option>
                    <option value="EXAM_DEADLINE">Exam / Milestone</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">Duration (Minutes)</label>
                  <select
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-cyan"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes (1 hr)</option>
                    <option value={90}>90 minutes (1.5 hrs)</option>
                    <option value={120}>120 minutes (2 hrs)</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold block">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-2 rounded-xl border text-center transition font-bold ${
                        formData.priority === p
                          ? p === 'HIGH'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : p === 'MEDIUM'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-zinc-700 border-zinc-500 text-zinc-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concepts Tags */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold block">
                  High-Yield Concepts (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Memoization, Subproblem Overlap, Space Bounds"
                  value={formData.concepts}
                  onChange={(e) => setFormData({ ...formData, concepts: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold block">Notes / Study Goals</label>
                <textarea
                  rows={2}
                  placeholder="Additional goals or specific problems to cover..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-cyan font-sans"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-zinc-800 text-zinc-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-cyan text-zinc-950 font-bold hover:bg-brand-cyan/90 transition shadow-lg shadow-brand-cyan/20"
                >
                  {editingEventId ? 'Update Event' : 'Save Event to Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
