import React from 'react';
import { useTheme, THEME_PRESETS, type UiTheme, type ThemeConfig } from '../context/ThemeContext';
import { Palette, Layout, Type, Check, X, Sparkles, Monitor, Shapes, Moon, Sun } from 'lucide-react';

interface UiSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  showLayoutOptions?: boolean;
}

export const UiSwitcherModal: React.FC<UiSwitcherModalProps> = ({ isOpen, onClose, showLayoutOptions = true }) => {
  const { theme, setTheme, layout, setLayout, fontSize, setFontSize } = useTheme();

  if (!isOpen) return null;

  const themesList: ThemeConfig[] = Object.values(THEME_PRESETS);

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div 
        className="w-full max-w-2xl bg-background-panel border border-border shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]"
        style={{ borderRadius: 'var(--theme-radius, 14px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-background shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-[0_0_15px_rgba(34,211,238,0.25)]">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                EXECUTIVE THEME & WORKSPACE STUDIO
                <span className="text-[9px] px-2 py-0.5 rounded bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan uppercase tracking-wider font-semibold">
                  Professional Dual Mode
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Switch between Obsidian Luxe (Executive Dark) and Professional White & Black (Executive Light).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SECTION 1: THEME SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Sparkles size={13} className="text-brand-cyan" />
                <span>1. Select Interface Appearance</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                Active: <strong className="text-brand-cyan">{THEME_PRESETS[theme]?.name || 'Obsidian Luxe'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themesList.map((preset) => {
                const isSelected = theme === preset.id;
                const isLight = preset.id === 'professional-light';

                return (
                  <button
                    key={preset.id}
                    onClick={() => setTheme(preset.id as UiTheme)}
                    style={{
                      borderRadius: preset.borderRadius,
                      fontFamily: preset.fontFamily
                    }}
                    className={`p-5 border text-left transition relative flex flex-col justify-between group ${
                      isSelected
                        ? 'border-brand-cyan bg-brand-cyan/10 ring-2 ring-brand-cyan/60 shadow-[0_0_25px_rgba(34,211,238,0.2)]'
                        : 'border-border/80 bg-background hover:border-zinc-500 hover:bg-background-elevated/70'
                    }`}
                  >
                    {/* Header info */}
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2.5">
                          <div 
                            className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center shrink-0 shadow-sm"
                            style={{ 
                              backgroundColor: isLight ? '#ffffff' : '#08090b',
                              color: isLight ? '#09090b' : '#38bdf8'
                            }}
                          >
                            {isLight ? <Sun size={15} /> : <Moon size={15} />}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-zinc-100 block leading-tight">
                              {preset.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 block font-mono">
                              {preset.category}
                            </span>
                          </div>
                        </div>

                        <span 
                          className="text-[9px] font-semibold px-2 py-0.5 border uppercase tracking-wider shrink-0 rounded-full font-mono"
                          style={{
                            borderColor: preset.accentColor + '50',
                            backgroundColor: preset.accentColor + '15',
                            color: preset.accentColor
                          }}
                        >
                          {preset.badge}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                        {preset.description}
                      </p>

                      {/* Badges */}
                      <div className="space-y-2 mb-4 text-[10px] font-mono">
                        <div className="p-2 rounded bg-background-elevated border border-border flex items-center gap-2 text-zinc-300">
                          <Type size={12} className="text-brand-cyan shrink-0" />
                          <span className="truncate">{preset.typography}</span>
                        </div>
                        <div className="p-2 rounded bg-background-elevated border border-border flex items-center gap-2 text-zinc-300">
                          <Shapes size={12} className="text-brand-violet shrink-0" />
                          <span className="truncate">{preset.shape}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3.5 h-3.5 rounded border border-white/20 shadow-sm" style={{ backgroundColor: preset.bgPreview }} title="Background" />
                        <span className="w-3.5 h-3.5 rounded border border-white/20 shadow-sm" style={{ backgroundColor: preset.accentColor }} title="Primary Action" />
                        <span className="w-3.5 h-3.5 rounded border border-white/20 shadow-sm" style={{ backgroundColor: preset.secondaryAccent }} title="Secondary Accent" />
                      </div>

                      {isSelected ? (
                        <span className="font-bold flex items-center gap-1 text-brand-cyan">
                          <Check size={14} /> Active Mode
                        </span>
                      ) : (
                        <span className="text-zinc-500 group-hover:text-zinc-300">Click to apply</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: WORKSPACE LAYOUT PRESETS */}
          {showLayoutOptions && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Layout size={13} className="text-brand-cyan" />
                  <span>2. Workspace Layout Preset</span>
                </label>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {layout === 'standard-3panel' ? '3-Panel Cockpit' : layout === 'dual-split' ? 'Dual-Split' : 'Zen Focus'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* PRESET 1: 3-Panel Cockpit */}
                <button
                  onClick={() => setLayout('standard-3panel')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    layout === 'standard-3panel'
                      ? 'border-brand-violet bg-brand-violet/10 ring-1 ring-brand-violet shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                      : 'border-border bg-background hover:border-zinc-600'
                  }`}
                >
                  <div>
                    <div className="h-14 border border-zinc-700/80 rounded bg-zinc-950 p-1 flex gap-1 mb-2.5">
                      <div className="w-1/4 h-full bg-brand-violet/20 border border-brand-violet/40 rounded flex items-center justify-center text-[7px] font-mono text-brand-violet font-bold">
                        CHAT
                      </div>
                      <div className="flex-1 h-full bg-brand-cyan/20 border border-brand-cyan/40 rounded flex items-center justify-center text-[7px] font-mono text-brand-cyan font-bold">
                        CODE
                      </div>
                      <div className="w-1/4 h-full bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center text-[7px] font-mono text-zinc-400 font-bold">
                        SIGNALS
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-100 block mb-0.5">3-Panel Cockpit</span>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      Full view with AI dialogue, Monaco code editor, and live telemetry signals.
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-border/40 text-[9px] font-mono">
                    {layout === 'standard-3panel' ? <span className="text-brand-violet font-bold">✓ Selected</span> : <span className="text-zinc-500">Select</span>}
                  </div>
                </button>

                {/* PRESET 2: Dual Split */}
                <button
                  onClick={() => setLayout('dual-split')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    layout === 'dual-split'
                      ? 'border-brand-cyan bg-brand-cyan/10 ring-1 ring-brand-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                      : 'border-border bg-background hover:border-zinc-600'
                  }`}
                >
                  <div>
                    <div className="h-14 border border-zinc-700/80 rounded bg-zinc-950 p-1 flex gap-1 mb-2.5">
                      <div className="w-1/2 h-full bg-zinc-800/80 border border-zinc-700 rounded flex items-center justify-center text-[7px] font-mono text-zinc-300 font-bold">
                        PROBLEM
                      </div>
                      <div className="w-1/2 h-full bg-brand-cyan/20 border border-brand-cyan/40 rounded flex flex-col justify-between p-0.5">
                        <div className="flex-1 bg-brand-cyan/10 rounded flex items-center justify-center text-[7px] font-mono text-brand-cyan font-bold">CODE</div>
                        <div className="h-2 bg-zinc-800 rounded"></div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-100 block mb-0.5">Dual-Split Classic</span>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      Competitive programming layout: side-by-side problem and editor.
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-border/40 text-[9px] font-mono">
                    {layout === 'dual-split' ? <span className="text-brand-cyan font-bold">✓ Selected</span> : <span className="text-zinc-500">Select</span>}
                  </div>
                </button>

                {/* PRESET 3: Zen Focus */}
                <button
                  onClick={() => setLayout('zen-focus')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    layout === 'zen-focus'
                      ? 'border-brand-emerald bg-brand-emerald/10 ring-1 ring-brand-emerald shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                      : 'border-border bg-background hover:border-zinc-600'
                  }`}
                >
                  <div>
                    <div className="h-14 border border-zinc-700/80 rounded bg-zinc-950 p-1 flex flex-col justify-between mb-2.5">
                      <div className="h-2 bg-zinc-800/60 rounded"></div>
                      <div className="flex-1 bg-brand-emerald/15 border border-brand-emerald/30 rounded my-0.5 flex items-center justify-center text-[7px] font-mono text-brand-emerald font-bold">
                        FULLSCREEN EDITOR
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-100 block mb-0.5">Zen Focus Mode</span>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      Distraction-free coding with sidebars collapsed and minimal floating HUD.
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-border/40 text-[9px] font-mono">
                    {layout === 'zen-focus' ? <span className="text-brand-emerald font-bold">✓ Selected</span> : <span className="text-zinc-500">Select</span>}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: EDITOR FONT SIZE */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Type size={13} className="text-brand-cyan" />
                <span>3. Monaco Code Editor Font Size</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">{fontSize}px</span>
            </div>

            <div className="flex items-center gap-2">
              {[12, 13, 14, 15, 16].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-2 rounded-lg border font-mono text-xs font-bold transition ${
                    fontSize === size
                      ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm'
                      : 'bg-background border-border text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-border bg-background flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-400">
            <Monitor size={12} className="text-brand-cyan" />
            <span>Theme and styling persist automatically across page reloads</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-brand-cyan text-zinc-950 font-mono text-xs font-bold hover:bg-brand-cyan/90 transition shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
export default UiSwitcherModal;
