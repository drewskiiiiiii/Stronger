        const { useState, useEffect, useRef, useMemo } = React;
        // ---- Inline icons (lucide, ISC license) so nothing loads from a CDN ----
        const ICONS = {
            'history': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /> <path d="M3 3v5h5" /> <path d="M12 7v5l4 2" />',
            'bar-chart-3': '<line x1="12" x2="12" y1="20" y2="10" /> <line x1="18" x2="18" y1="20" y2="4" /> <line x1="6" x2="6" y1="20" y2="16" />',
            'calendar': '<path d="M8 2v4" /> <path d="M16 2v4" /> <rect width="18" height="18" x="3" y="4" rx="2" /> <path d="M3 10h18" />',
            'check': '<path d="M20 6 9 17l-5-5" />',
            'check-circle-2': '<path d="M21.801 10A10 10 0 1 1 17 3.335" /> <path d="m9 11 3 3L22 4" />',
            'chevron-right': '<path d="m9 18 6-6-6-6" />',
            'dumbbell': '<path d="M14.4 14.4 9.6 9.6" /> <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" /> <path d="m21.5 21.5-1.4-1.4" /> <path d="M3.9 3.9 2.5 2.5" /> <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />',
            'home': '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /> <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />',
            'layers': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /> <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /> <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />',
            'play': '<polygon points="6 3 20 12 6 21 6 3" />',
            'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /> <path d="M21 3v5h-5" /> <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /> <path d="M8 16H3v5" />',
            'sparkles': '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /> <path d="M20 3v4" /> <path d="M22 5h-4" /> <path d="M4 17v2" /> <path d="M5 18H3" />',
            'utensils': '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /> <path d="M7 2v20" /> <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />',
            'x': '<path d="M18 6 6 18" /> <path d="m6 6 12 12" />'
        };
        const Icon = ({ name, className }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />;



        const EXERCISE_LIBRARY = []; // no built-in exercises; substitutions come from the program source or your own entries

        // Every colour in the UI comes from these tokens (CSS variables), so a theme changes the whole app.
        const THEMES = {
            ember:    { name: 'Stealth Ember',  bg: '#0A0A0B', bg2: '#101012', card: '#161618', elevated: '#1F1F22', line: '#2C2C31', accent: '#FF4D1F', accentHover: '#FF6B3D', ink: '#F5F5F4', muted: '#9C9CA4', onAccent: '#0A0A0B' },
            steel:    { name: 'Steel Blue',     bg: '#090B0E', bg2: '#0F1317', card: '#151A20', elevated: '#1D242C', line: '#2A333D', accent: '#4DB8FF', accentHover: '#7FCBFF', ink: '#F1F5F9', muted: '#94A3B3', onAccent: '#06121C' },
            graphite: { name: 'Graphite',       bg: '#0A0A0A', bg2: '#111111', card: '#171717', elevated: '#212121', line: '#303030', accent: '#E8E8EA', accentHover: '#FFFFFF', ink: '#FAFAFA', muted: '#9E9E9E', onAccent: '#0A0A0A' },
            blood:    { name: 'Blood Red',      bg: '#0B0909', bg2: '#121010', card: '#191515', elevated: '#232020', line: '#352E2E', accent: '#F0343C', accentHover: '#FF5A60', ink: '#FAF5F5', muted: '#A39A9A', onAccent: '#FFFFFF' },
            gold:     { name: 'Titan Gold',     bg: '#0B0A08', bg2: '#12110E', card: '#181612', elevated: '#22201A', line: '#35322A', accent: '#E0A526', accentHover: '#F0BC45', ink: '#FBF8F1', muted: '#A39E92', onAccent: '#140E02' }
        };
        const DEFAULT_THEME = 'ember';
        const LEGACY_THEME_KEYS = { blue: 'ember', emerald: 'steel', crimson: 'blood', gold: 'gold', violet: 'graphite' }; // keys from earlier versions
        const resolveTheme = (k) => (THEMES[k] ? k : (LEGACY_THEME_KEYS[k] || DEFAULT_THEME));
        const hexToRgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(' ');
        const applyTheme = (key) => {
            const t = THEMES[resolveTheme(key)];
            const dark = '#' + [1, 3, 5].map(i => Math.round(parseInt(t.accent.slice(i, i + 2), 16) * 0.55).toString(16).padStart(2, '0')).join('');
            const vars = { bg: t.bg, bg2: t.bg2, card: t.card, elevated: t.elevated, line: t.line, accent: t.accent, 'accent-hover': t.accentHover, 'accent-dark': dark, ink: t.ink, muted: t.muted, 'on-accent': t.onAccent };
            Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(`--c-${k}`, hexToRgb(v)));
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', t.bg);
        };

        const INITIAL_WORKOUT_LOGS = []; // history starts empty; nothing is pre-filled

        // ---- Program library components ----
        const restLabel = (r) => r ? r.raw.replace(/MIN$/i, ' min').toLowerCase().replace(/\s+/g, ' ') : 'unspecified';
        const intensityLabel = (i) => i ? (i.type === 'RPE' ? `RPE ${i.raw}` : i.type === 'RIR' ? `RIR ${i.raw}` : i.type === '%1RM' ? `${i.raw} 1RM` : i.raw) : 'unspecified';
        const STATUS_META = {
            not_started: { label: 'Not Started', cls: 'bg-th-elevated text-th-muted' },
            in_progress: { label: 'In Progress', cls: 'bg-th-accent/20 text-th-accent' },
            paused: { label: 'Paused', cls: 'bg-[#F59E0B]/20 text-[#F59E0B]' },
            completed: { label: 'Completed', cls: 'bg-[#31D583]/20 text-[#31D583]' }
        };
        const StatusBadge = ({ status }) => {
            const m = STATUS_META[status] || STATUS_META.not_started;
            return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${m.cls}`}>{m.label}</span>;
        };

        const ProgramCard = ({ program, state, isActive, onOpen }) => {
            const m = program.metadata;
            const flagged = program.flags.length;
            return (
                <button onClick={onOpen} className="w-full text-left bg-th-card border border-th-line rounded-xl p-4 space-y-2.5 active:bg-th-elevated">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-black text-white leading-snug">{program.name}</h3>
                        <StatusBadge status={state.status} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-th-muted">
                        {m.totalWeeks && <span className="px-2 py-0.5 rounded-md bg-th-bg border border-th-line">{m.totalWeeks} weeks</span>}
                        {m.daysPerWeek && <span className="px-2 py-0.5 rounded-md bg-th-bg border border-th-line">{m.daysPerWeek} days/week</span>}
                        {m.split && <span className="px-2 py-0.5 rounded-md bg-th-bg border border-th-line">{m.split}</span>}
                        {m.level && <span className="px-2 py-0.5 rounded-md bg-th-bg border border-th-line">{m.level}</span>}
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                        {isActive ? <span className="font-bold text-[#31D583]">● Active program</span> : <span className="text-th-muted">Level, focus &amp; equipment: unspecified in source</span>}
                        {flagged > 0 && <span className="text-[#F59E0B] font-semibold">⚠ {flagged} to review</span>}
                    </div>
                </button>
            );
        };

        const ProgramDetail = ({ program, state, isActive, unit, onBack, onRemove, children }) => {
            const [week, setWeek] = useState(program.weeks[0] ? program.weeks[0].week : 1);
            const [showFlags, setShowFlags] = useState(false);
            const [showInstr, setShowInstr] = useState(false);
            const [openSection, setOpenSection] = useState(null);
            const wk = program.weeks.find(w => w.week === week);
            const m = program.metadata;
            return (
                <div className="space-y-4">
                    <button onClick={onBack} className="min-h-[44px] text-xs font-bold text-th-accent">‹ Program Library</button>
                    <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                            <h2 className="text-lg font-black text-white leading-snug">{program.name}</h2>
                            <StatusBadge status={state.status} />
                        </div>
                        <p className="text-[11px] text-th-muted">{[m.totalWeeks && `${m.totalWeeks} weeks`, m.daysPerWeek && `${m.daysPerWeek} training days/week`, m.split].filter(Boolean).join(' · ')}</p>
                        <p className="text-[10px] text-th-muted">Source: {program.source.fileName} · imported {program.source.importedAt.split('T')[0]} · level, focus &amp; equipment are not stated in a structured form in the PDF</p>
                    </div>
                    {m.suggestedSchedule && <div className="text-[11px] text-th-ink/80 bg-th-card border border-th-line rounded-xl p-3"><span className="font-bold text-white">Weekly layout in the PDF:</span> {m.suggestedSchedule}</div>}
                    {m.restNote && <div className="text-[10px] text-th-muted">{m.restNote}</div>}
                    {children}
                    {program.flags.length > 0 && (
                        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-3 space-y-2">
                            <button onClick={() => setShowFlags(!showFlags)} className="w-full min-h-[44px] flex items-center justify-between text-xs font-bold text-[#F59E0B]">
                                <span>⚠ {program.flags.length} item(s) flagged for review</span><span>{showFlags ? '▲' : '▼'}</span>
                            </button>
                            {showFlags && program.flags.map((f, i) => (
                                <div key={i} className="text-[11px] text-th-ink leading-snug">{f.page ? <span className="text-th-muted">p.{f.page} · </span> : f.ref ? <span className="text-th-muted">{f.ref} · </span> : null}{f.msg}</div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {program.weeks.map(w => (
                            <button key={w.week} onClick={() => setWeek(w.week)} className={`min-h-[44px] px-4 rounded-xl text-xs font-bold shrink-0 border ${w.week === week ? 'bg-th-accent border-th-accent text-th-on-accent' : 'bg-th-card border-th-line text-th-muted'}`}>Week {w.week}{w.deload ? ' ↓' : ''}</button>
                        ))}
                    </div>
                    {wk && (wk.phase || wk.deload) && <div className="text-[11px] text-th-muted">{wk.phase}{wk.deload ? ' · deload week (from the source)' : ''}</div>}
                    {wk && wk.note && <div className="text-[11px] text-th-ink/80 bg-th-card border border-th-line rounded-xl p-3">{wk.note}</div>}
                    {wk && wk.days.map(d => (
                        <div key={d.day} className="bg-th-card border border-th-line rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div><div className="text-[10px] font-bold uppercase tracking-wider text-th-accent">Day {d.day}</div><h3 className="text-sm font-black text-white">{d.label}</h3></div>
                                <span className="text-[10px] text-th-muted">{d.page ? `PDF p.${d.page}` : d.ref}</span>
                            </div>
                            {d.exercises.map(e => (
                                <div key={e.order} className="border-t border-th-line pt-2.5 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="text-base font-black text-white leading-snug"><span className="text-th-accent mr-1.5">{e.order}.</span>{e.name}{e.flags.length > 0 && <span className="ml-1.5 text-[#F59E0B]">⚠</span>}</div>
                                        <div className="text-xs font-bold text-white tabular-nums shrink-0">{e.workingSets ?? '?'} × {e.reps ?? '?'}</div>
                                    </div>
                                    <div className="text-[11px] text-th-muted">
                                        {e.warmupText ? `${e.warmupText} warm-up set(s) · ` : e.warmupSets != null ? `${e.warmupSets} warm-up set(s) · ` : ''}Intensity {intensityLabel(e.intensity)} · Rest: {restLabel(e.rest)}
                                    </div>
                                    {e.technique && <div className="text-[11px] font-semibold text-[#F59E0B]">Last-set technique: {e.technique}</div>}
                                    {e.notes && <div className="text-[11px] text-th-ink/80 leading-snug">{e.notes}</div>}
                                    {e.sourceSubstitutions && e.sourceSubstitutions.length > 0 && !e.sourceGuidance && <div className="text-[10px] text-th-muted">Substitutes in source: {e.sourceSubstitutions.join(' · ')}</div>}
                                    {e.videoUrl && <a href={e.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-[11px] font-semibold text-th-accent">▶ Technique video (from the source)</a>}
                                </div>
                            ))}
                        </div>
                    ))}
                    {program.instructions.length > 0 && (
                        <div className="space-y-2">
                            <button onClick={() => setShowInstr(!showInstr)} className="w-full min-h-[44px] flex items-center justify-between text-xs font-bold text-white"><span>Instructions from the source ({program.instructions.length} {program.source.kind === 'spreadsheet' ? 'notes' : 'pages'})</span><span className="text-th-muted">{showInstr ? '▲' : '▼'}</span></button>
                            {showInstr && program.instructions.map((sec, si) => (
                                <div key={si} className="bg-th-card border border-th-line rounded-xl">
                                    <button onClick={() => setOpenSection(openSection === si ? null : si)} className="w-full min-h-[44px] px-4 flex items-center justify-between text-left text-xs font-bold text-white">
                                        <span className="truncate">{sec.title || sec.lines[0]}</span><span className="text-th-muted ml-2 shrink-0">{sec.page ? `p.${sec.page} ` : ''}{openSection === si ? '▲' : '▼'}</span>
                                    </button>
                                    {openSection === si && <div className="px-3 pb-3 text-[11px] text-th-ink/80 leading-relaxed whitespace-pre-line">{sec.lines.join('\n')}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                    <button onClick={onRemove} className="w-full min-h-[44px] rounded-xl bg-th-elevated border border-th-line text-[#F43F5E] text-xs font-bold">Remove program…</button>
                </div>
            );
        };

        // ---- Program scheduling helpers (pure) ----
        const pad2 = (n) => String(n).padStart(2, '0');
        const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
        const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return toDateStr(d); };
        const todayStr = () => toDateStr(new Date());
        const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const fmtShort = (s) => { const d = parseDate(s); return `${WEEKDAYS[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`; };
        const normName = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const sessionKeyOf = (week, day) => `w${week}d${day}`;
        const defaultWeekdays = (n) => ({ 1: [1], 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6] }[n] || [1, 2, 3, 4, 5, 6].slice(0, n));

        // Planned dates come from the user's start date and chosen weekdays; the program order itself is never altered.
        function buildSessions(program, prog) {
            const out = [];
            const today = todayStr();
            const weekdays = (prog.weekdays || []).slice().sort((a, b) => a - b);
            program.weeks.forEach((w, wi) => {
                const windowDates = [];
                if (prog.startDate) for (let i = 0; i < 7; i++) { const ds = addDays(prog.startDate, wi * 7 + i); if (weekdays.includes(parseDate(ds).getDay())) windowDates.push(ds); }
                w.days.forEach((d, k) => {
                    const key = sessionKeyOf(w.week, d.day);
                    const rec = (prog.sessions || {})[key] || {};
                    const status = rec.status || 'planned';
                    const basePlanned = windowDates[k] || windowDates[windowDates.length - 1] || null;
                    const plannedDate = rec.plannedDate || basePlanned;
                    out.push({ key, week: w.week, deload: !!w.deload, day: d.day, label: d.label, page: d.page, exercises: d.exercises, status, plannedDate,
                        rescheduled: !!rec.plannedDate && rec.plannedDate !== basePlanned, completedDate: rec.completedDate || null, logId: rec.logId || null,
                        missed: status === 'planned' && !!plannedDate && plannedDate < today });
                });
            });
            return out;
        }

        // ---- Start program sheet ----
        const StartProgramSheet = ({ program, owned, onCancel, onConfirm }) => {
            const missing = missingEquipment(program, owned);
            const need = program.metadata.daysPerWeek || 0;
            const [startDate, setStartDate] = useState(todayStr());
            const fromPdf = program.metadata.suggestedWeekdays && program.metadata.suggestedWeekdays.length === need ? program.metadata.suggestedWeekdays : null;
            const [weekdays, setWeekdays] = useState(fromPdf || defaultWeekdays(need));
            const toggle = (d) => setWeekdays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
            const valid = weekdays.length === need && !!startDate;
            const preview = valid ? buildSessions(program, { startDate, weekdays, sessions: {} }) : [];
            const lastDate = preview.length ? preview[preview.length - 1].plannedDate : null;
            return (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-end justify-center">
                    <div className="bg-th-card border-t border-th-line rounded-t-3xl max-w-lg w-full p-4 space-y-4 max-h-[88dvh] overflow-y-auto safe-bottom">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">Start: {program.name}</h3>
                            <button onClick={onCancel} aria-label="Close" className="min-w-[44px] min-h-[44px] text-th-muted">✕</button>
                        </div>
                        <div>
                            <label className="text-[11px] text-th-muted block mb-1">Start date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full min-h-[44px] bg-th-bg border border-th-line rounded-xl px-3 text-white" />
                        </div>
                        <div>
                            <label className="text-[11px] text-th-muted block mb-1">Training weekdays — choose {need}{fromPdf ? ` (pre-selected from the PDF's example week: ${program.metadata.suggestedSchedule})` : ' (the PDF does not say which days)'}</label>
                            <div className="grid grid-cols-7 gap-1.5">
                                {WEEKDAYS.map((n, d) => (
                                    <button key={d} onClick={() => toggle(d)} className={`min-h-[44px] rounded-xl text-xs font-bold border ${weekdays.includes(d) ? 'bg-th-accent border-th-accent text-th-on-accent' : 'bg-th-bg border-th-line text-th-muted'}`}>{n}</button>
                                ))}
                            </div>
                            {!valid && <div className="text-[11px] text-[#F59E0B] mt-1.5">Select exactly {need} days ({weekdays.length} selected).</div>}
                        </div>
                        {missing.length > 0 && (
                            <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-3 space-y-1">
                                <div className="text-[11px] font-bold text-[#F59E0B]">Equipment you haven't marked as available (estimated from exercise names)</div>
                                {missing.map(m => <div key={m.equipment} className="text-[11px] text-white"><span className="font-bold">{m.equipment}:</span> {m.exercises.join(', ')}</div>)}
                                <div className="text-[10px] text-th-muted">You can substitute individual exercises during the workout. Update “My equipment” in Settings if this is wrong.</div>
                            </div>
                        )}
                        {valid && (
                            <div className="space-y-1.5">
                                <div className="text-xs font-bold text-white">Calendar preview · ends {fmtShort(lastDate)}</div>
                                <div className="bg-th-bg border border-th-line rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                                    {preview.map(s => <div key={s.key} className="flex justify-between text-[11px]"><span className="text-th-muted">{fmtShort(s.plannedDate)}</span><span className="text-white">W{s.week} D{s.day} · {s.label}</span></div>)}
                                </div>
                                <p className="text-[10px] text-th-muted">Other days are rest days. Workouts never advance or complete just because a date passes.</p>
                            </div>
                        )}
                        <button disabled={!valid} onClick={() => onConfirm({ startDate, weekdays: weekdays.slice().sort((a, b) => a - b) })} className="w-full min-h-[48px] rounded-xl bg-th-accent text-th-on-accent text-sm font-black disabled:opacity-40">Start Program</button>
                    </div>
                </div>
            );
        };

        // ---- Calendar ----
        const CalendarView = ({ program, prog, sessions, logs, hasActiveWorkout, onStart, onReschedule, onSkip, onUnskip, onOpenProgram }) => {
            const firstPending = sessions.find(x => x.status === 'planned' && x.plannedDate);
            const initialDate = firstPending ? firstPending.plannedDate : todayStr();
            const [month, setMonth] = useState(() => { const t = parseDate(initialDate); return new Date(t.getFullYear(), t.getMonth(), 1); });
            const [selected, setSelected] = useState(initialDate);
            const today = todayStr();
            const first = month.getDay();
            const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
            const cells = [];
            for (let i = 0; i < first; i++) cells.push(null);
            for (let d = 1; d <= dim; d++) cells.push(`${month.getFullYear()}-${pad2(month.getMonth() + 1)}-${pad2(d)}`);
            const byDate = {};
            sessions.forEach(s => { const k = s.status === 'completed' && s.completedDate ? s.completedDate : s.plannedDate; if (k) (byDate[k] = byDate[k] || []).push(s); });
            const logDates = new Set(logs.map(l => l.date));
            const nextKey = (sessions.find(s => s.status === 'planned') || {}).key;
            const dotCls = (s) => s.status === 'completed' ? 'bg-[#31D583]' : s.status === 'skipped' ? 'bg-th-muted' : s.missed ? 'bg-[#F43F5E]' : 'bg-th-accent';
            const daySessions = byDate[selected] || [];
            const doneCount = sessions.filter(s => s.status === 'completed').length;
            const nextSession = sessions.find(s => s.status === 'planned');
            const wkNow = nextSession ? nextSession.week : (program ? program.weeks.length : 0);
            return (
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-white">Calendar</h2>
                    {!program ? (
                        <div className="bg-th-card border border-dashed border-th-line rounded-xl p-5 text-center space-y-3">
                            <p className="text-xs text-th-muted">No program is active. Start one from the Program Library to see its schedule here.</p>
                            <button onClick={onOpenProgram} className="min-h-[44px] px-4 rounded-xl bg-th-accent text-th-on-accent text-xs font-bold">Open Program Library</button>
                        </div>
                    ) : (
                        <div className="bg-th-card border border-th-line rounded-xl p-4 space-y-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-th-accent">Active program</div>
                            <div className="text-sm font-black text-white">{program.name}</div>
                            <div className="text-[11px] text-th-muted">Week {wkNow} of {program.weeks.length} · {doneCount}/{sessions.length} workouts completed</div>
                        </div>
                    )}
                    <div className="bg-th-card border border-th-line rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                            <button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="min-w-[44px] min-h-[44px] text-white text-lg">‹</button>
                            <div className="text-sm font-bold text-white">{month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
                            <button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="min-w-[44px] min-h-[44px] text-white text-lg">›</button>
                        </div>
                        <div className="grid grid-cols-7 text-center text-[10px] text-th-muted mb-1">{WEEKDAYS.map(w => <div key={w}>{w}</div>)}</div>
                        <div className="grid grid-cols-7 gap-1">
                            {cells.map((ds, i) => ds ? (
                                <button key={ds} onClick={() => setSelected(ds)} className={`min-h-[44px] rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold border ${selected === ds ? 'border-th-accent bg-th-accent/10' : 'border-transparent'} ${ds === today ? 'text-th-accent' : 'text-white'}`}>
                                    <span>{parseInt(ds.slice(8), 10)}</span>
                                    <span className="flex gap-0.5 h-1.5">
                                        {(byDate[ds] || []).slice(0, 3).map(s => <span key={s.key} className={`w-1.5 h-1.5 rounded-full ${dotCls(s)}`}></span>)}
                                        {!(byDate[ds] || []).length && logDates.has(ds) && <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>}
                                    </span>
                                </button>
                            ) : <div key={`e${i}`}></div>)}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-th-muted">
                            <span><span className="inline-block w-2 h-2 rounded-full bg-th-accent mr-1"></span>Scheduled</span>
                            <span><span className="inline-block w-2 h-2 rounded-full bg-[#31D583] mr-1"></span>Completed</span>
                            <span><span className="inline-block w-2 h-2 rounded-full bg-[#F43F5E] mr-1"></span>Missed</span>
                            <span><span className="inline-block w-2 h-2 rounded-full bg-th-muted mr-1"></span>Skipped</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-white">{fmtShort(selected)}{selected === today ? ' · Today' : ''}</div>
                        {daySessions.length === 0 && <div className="text-[11px] text-th-muted">{program ? 'Rest day — no program workout scheduled.' : 'Nothing scheduled.'}</div>}
                        {daySessions.map(s => (
                            <div key={s.key} className="bg-th-card border border-th-line rounded-xl p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="text-sm font-bold text-white">{s.label}</div>
                                        <div className="text-[11px] text-th-muted">Week {s.week}{s.deload ? ' (deload)' : ''} · Day {s.day} · {s.exercises.length} exercises</div>
                                        {s.rescheduled && <div className="text-[10px] text-[#F59E0B]">Rescheduled</div>}
                                        {s.status === 'completed' && <div className="text-[10px] text-[#31D583]">Completed {s.completedDate}{s.completedDate !== s.plannedDate ? ` (planned ${s.plannedDate})` : ''}</div>}
                                        {s.missed && <div className="text-[10px] text-[#F43F5E]">Missed — still pending; nothing was skipped automatically</div>}
                                        {s.status === 'skipped' && <div className="text-[10px] text-th-muted">Skipped by you</div>}
                                    </div>
                                    {s.key === nextKey && <span className="text-[10px] font-bold text-th-accent uppercase">Up next</span>}
                                </div>
                                {s.status === 'planned' && (
                                    <div className="grid grid-cols-[1fr_auto] gap-2">
                                        <button onClick={() => onStart(s)} className="col-span-2 min-h-[48px] px-4 rounded-xl bg-th-accent text-th-on-accent text-sm font-bold">{hasActiveWorkout ? 'Return to workout' : 'Start workout'}</button>
                                        <label className="min-h-[44px] px-4 rounded-xl bg-th-elevated border border-th-line text-white text-xs font-bold flex items-center gap-2">Move to
                                            <input type="date" value={s.plannedDate || ''} onChange={e => e.target.value && onReschedule(s, e.target.value)} className="bg-transparent text-white w-[130px]" />
                                        </label>
                                        <button onClick={() => onSkip(s)} className="min-h-[44px] px-4 rounded-xl bg-th-elevated border border-th-line text-th-muted text-xs font-bold">Skip</button>
                                    </div>
                                )}
                                {s.status === 'skipped' && <button onClick={() => onUnskip(s)} className="min-h-[44px] px-4 rounded-xl bg-th-elevated border border-th-line text-white text-xs font-bold">Undo skip</button>}
                            </div>
                        ))}
                        {logs.filter(l => l.date === selected).map(l => (
                            <div key={l.id} className="bg-th-card border border-th-line rounded-xl p-3 text-[11px] text-th-muted"><span className="text-white font-bold">{l.workoutName}</span> · logged · {l.durationMin} min{l.programName ? ` · ${l.programName}` : ''}</div>
                        ))}
                    </div>
                </div>
            );
        };

        // ---- Exercise substitution (program workouts) ----
        const SubstituteModal = ({ item, library, onPick, onRestore, onClose }) => {
            const [q, setQ] = useState('');
            const [custom, setCustom] = useState('');
            const suggestions = item.prescribed.sourceSubstitutions || [];
            const matches = library.filter(x => (x.name + ' ' + x.equipment + ' ' + x.primaryMuscle).toLowerCase().includes(q.toLowerCase()));
            return (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-end justify-center">
                    <div className="bg-th-card border-t border-th-line rounded-t-3xl max-w-lg w-full p-4 space-y-4 max-h-[88dvh] overflow-y-auto safe-bottom">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">Substitute exercise</h3>
                            <button onClick={onClose} aria-label="Close" className="min-w-[44px] min-h-[44px] text-th-muted">✕</button>
                        </div>
                        <div className="bg-th-bg border border-th-line rounded-xl p-3 text-[11px] space-y-0.5">
                            <div className="text-th-muted">Prescribed (stays on record)</div>
                            <div className="text-white font-bold">{item.name} · {item.prescribed.workingSets ?? '?'} × {item.prescribed.reps ?? '?'}</div>
                        </div>
                        {item.substitution && <button onClick={onRestore} className="w-full min-h-[44px] rounded-xl bg-th-elevated border border-[#31D583]/40 text-[#31D583] text-xs font-bold">Restore original: {item.name}</button>}
                        {(item.prescribed.sourceGuidance || []).length > 0 && (
                            <div className="bg-th-bg border border-th-line rounded-xl p-3 space-y-1.5">
                                <div className="text-[11px] font-bold text-white">What the program PDF says</div>
                                {item.prescribed.sourceGuidance.map((g, i) => <div key={i} className="text-[11px] text-th-ink/80 leading-snug"><span className="font-bold">{g.name}:</span> {g.text}</div>)}
                                {item.prescribed.sourceGuidance.some(g => normName(g.name) !== normName(item.name)) && <div className="text-[10px] text-[#F59E0B]">Linked by partial name match — check the wording applies to this exercise.</div>}
                            </div>
                        )}
                        {suggestions.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="text-[11px] font-bold text-white">Alternatives listed in the program PDF</div>
                                {suggestions.map(n => <button key={n} onClick={() => onPick({ name: n, exerciseId: (library.find(x => normName(x.name) === normName(n)) || {}).id || null, origin: 'program-pdf' })} className="w-full text-left min-h-[44px] px-4 rounded-xl bg-th-bg border border-th-line text-xs text-white">{n}</button>)}
                            </div>
                        )}
                        {library.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-white">Your exercise library <span className="text-th-muted font-normal">(not verified as equivalent — your choice)</span></div>
                            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, equipment, muscle" className="w-full min-h-[44px] bg-th-bg border border-th-line rounded-xl px-3 text-white" />
                            <div className="max-h-44 overflow-y-auto space-y-1.5">
                                {matches.map(x => <button key={x.id} onClick={() => onPick({ name: x.name, exerciseId: x.id, origin: 'library' })} className="w-full text-left min-h-[44px] px-4 rounded-xl bg-th-bg border border-th-line text-xs text-white flex justify-between gap-2"><span>{x.name}</span><span className="text-th-muted">{x.equipment}</span></button>)}
                                {matches.length === 0 && <div className="text-[11px] text-th-muted">No match. Type a custom exercise below.</div>}
                            </div>
                        </div>
                        )}
                        <div className="flex gap-2">
                            <input value={custom} onChange={e => setCustom(e.target.value)} placeholder="Custom exercise name" className="flex-1 min-h-[44px] bg-th-bg border border-th-line rounded-xl px-3 text-white" />
                            <button disabled={!custom.trim()} onClick={() => onPick({ name: custom.trim(), exerciseId: null, origin: 'custom' })} className="min-h-[44px] px-4 rounded-xl bg-th-accent text-th-on-accent text-xs font-bold disabled:opacity-40">Use</button>
                        </div>
                    </div>
                </div>
            );
        };

        // ---- Equipment (estimated from exercise names; never a claim of equivalence) ----
        const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbells', 'Bench', 'Pull-Up Bar', 'Cable Machine', 'Machines', 'Swiss Ball', 'Box/Step', 'Kettlebell'];
        const DEFAULT_EQUIPMENT = ['Dumbbells', 'Bench', 'Pull-Up Bar'];
        const equipmentFor = (name) => {
            const n = (name || '').toLowerCase();
            if (/dumbbell|\bdb\b/.test(n)) return 'Dumbbells';
            if (/cable|rope|pushdown|crossover|face ?pull|lat pull/.test(n)) return 'Cable Machine';
            if (/machine|leg press|leg extension|leg curl|pec deck|t-bar|smith|hack/.test(n)) return 'Machines';
            if (/pull[- ]?up|chin[- ]?up/.test(n)) return 'Pull-Up Bar';
            if (/swiss ball/.test(n)) return 'Swiss Ball';
            if (/step up/.test(n)) return 'Box/Step';
            if (/barbell|squat|deadlift|ez bar|overhead press|bench press|\brow\b/.test(n)) return 'Barbell';
            return null;
        };
        const missingEquipment = (program, owned) => {
            const found = {};
            program.weeks.forEach(w => w.days.forEach(d => d.exercises.forEach(e => {
                const eq = equipmentFor(e.name);
                if (eq && !owned.includes(eq)) (found[eq] = found[eq] || new Set()).add(e.name);
            })));
            return Object.entries(found).map(([eq, set]) => ({ equipment: eq, exercises: [...set] }));
        };

        // ---- Workout history (real logs only) ----
        const HistoryView = ({ logs, unit }) => {
            const [open, setOpen] = useState(null);
            const toUnit = (lb) => Math.round(unit === 'kg' ? lb / 2.20462 : lb).toLocaleString();
            return (
                <div className="space-y-4">
                    <div><h2 className="text-lg font-black text-white">History</h2><p className="text-[11px] text-th-muted">Every workout you finished, with the sets you actually logged.</p></div>
                    {logs.length === 0 && <div className="bg-th-card border border-dashed border-th-line rounded-xl p-5 text-center text-xs text-th-muted">No workouts logged yet. Finish a workout and it will appear here.</div>}
                    {logs.map(l => (
                        <div key={l.id} className="bg-th-card border border-th-line rounded-xl">
                            <button onClick={() => setOpen(open === l.id ? null : l.id)} className="w-full min-h-[56px] p-3 flex items-start justify-between gap-2 text-left">
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-white">{l.workoutName}</div>
                                    <div className="text-[10px] text-th-muted">{l.date}{l.week ? ` · Week ${l.week} Day ${l.day}` : ''}{l.programName ? ` · ${l.programName}` : ''}</div>
                                </div>
                                <div className="text-[11px] text-th-muted text-right tabular-nums shrink-0">{l.durationMin} min<br />{toUnit(l.totalVolumeLb || 0)} {unit}</div>
                            </button>
                            {open === l.id && (
                                <div className="px-3 pb-3 space-y-2 border-t border-th-line pt-2">
                                    {l.exercises.map((e, i) => (
                                        <div key={i} className="text-[11px]">
                                            <div className="text-sm font-bold text-white">{e.name}{e.substituted ? <span className="text-[#F59E0B]"> (substitute for {e.prescribedName})</span> : null}</div>
                                            <div className="text-th-muted tabular-nums">{e.sets.map(x => `${x.type === 'warmup' ? 'W ' : x.type === 'drop' ? 'D ' : x.type === 'myo' ? 'M ' : ''}${x.weight || 0}×${x.reps}`).join(' · ')}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        };

        // ---- Program progress ----
        const ProgramProgress = ({ library, workoutLogs, unit }) => {
            const ids = Object.keys(library.progress).filter(id => library.programs[id] && library.progress[id].status !== 'not_started');
            const [sel, setSel] = useState(library.activeProgramId || ids[0] || 'all');
            const [exName, setExName] = useState('');
            const program = sel !== 'all' ? library.programs[sel] : null;
            const prog = sel !== 'all' ? library.progress[sel] : null;
            const logs = sel === 'all' ? workoutLogs : workoutLogs.filter(l => l.programId === sel);
            const sessions = program && prog ? buildSessions(program, prog) : [];
            const done = sessions.filter(x => x.status === 'completed').length;
            const skipped = sessions.filter(x => x.status === 'skipped').length;
            const toUnit = (lb) => unit === 'kg' ? lb / 2.20462 : lb;
            const byWeek = {};
            logs.forEach(l => { const k = l.week ? `W${l.week}` : l.date.slice(0, 7); byWeek[k] = (byWeek[k] || 0) + (l.totalVolumeLb || 0); });
            const weekKeys = Object.keys(byWeek);
            const maxVol = Math.max(1, ...Object.values(byWeek));
            const perf = {}; // exercise -> [{date, best}]
            logs.slice().reverse().forEach(l => l.exercises.forEach(e => {
                const work = e.sets.filter(x => x.type !== 'warmup' && x.reps > 0);
                if (!work.length) return;
                const best = work.reduce((a, b) => (b.weight || 0) > (a.weight || 0) || ((b.weight || 0) === (a.weight || 0) && b.reps > a.reps) ? b : a);
                (perf[e.name] = perf[e.name] || []).push({ date: l.date, weight: best.weight || 0, reps: best.reps, unit: best.unit || 'lb' });
            }));
            const exNames = Object.keys(perf).sort();
            const chosen = perf[exName] ? exName : exNames[0];
            const series = chosen ? perf[chosen] : [];
            const prWeight = series.length ? Math.max(...series.map(x => x.weight)) : 0;
            const deloadLines = program ? [...(program.weeks.filter(w => w.deload).length ? [`Deload week(s): ${program.weeks.filter(w => w.deload).map(w => w.week).join(', ')}`] : []), ...program.instructions.flatMap(sec => sec.lines.filter(l => /deload/i.test(l)).map(l => `${sec.page ? 'p.' + sec.page : (sec.title || 'note')}: ${l}`))] : [];
            return (
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-white">Progress</h2>
                    <select value={sel} onChange={e => setSel(e.target.value)} className="w-full min-h-[44px] bg-th-card border border-th-line rounded-xl px-3 text-white">
                        <option value="all">All workouts (overall history)</option>
                        {ids.map(id => <option key={id} value={id}>{library.programs[id] ? library.programs[id].name : id}</option>)}
                    </select>
                    {program && (
                        <div className="bg-th-card border border-th-line rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between"><div className="text-sm font-black text-white">{program.name}</div><StatusBadge status={prog.status} /></div>
                            <div className="text-[11px] text-th-muted">Week {(sessions.find(x => x.status === 'planned') || { week: program.weeks.length }).week} of {program.weeks.length} · {done} of {sessions.length} workouts completed{skipped ? ` · ${skipped} skipped` : ''}</div>
                            <div className="w-full bg-th-bg h-2 rounded-full overflow-hidden"><div className="bg-[#31D583] h-full" style={{ width: `${sessions.length ? (done / sessions.length) * 100 : 0}%` }}></div></div>
                            <div className="text-[11px] text-th-muted">{sessions.length ? Math.round((done / sessions.length) * 100) : 0}% complete</div>
                            <div className="text-[11px] text-th-muted">Deload / progression: {deloadLines.length ? deloadLines.join(' · ') : 'no deload instructions found in the imported text; weekly changes follow the prescriptions in the program detail.'}</div>
                        </div>
                    )}
                    <div className="bg-th-card border border-th-line rounded-xl p-4 space-y-2">
                        <div className="text-xs font-bold text-white">Training volume (working sets you logged)</div>
                        {weekKeys.length === 0 ? <div className="text-[11px] text-th-muted">No logged workouts yet.</div> : (
                            <div className="h-32 flex items-end gap-2">
                                {weekKeys.map(k => <div key={k} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                                    <div className="w-full bg-th-accent rounded-t-sm" style={{ height: `${Math.max(4, (byWeek[k] / maxVol) * 80)}%` }}></div>
                                    <div className="text-[10px] text-th-muted">{k}</div></div>)}
                            </div>
                        )}
                        {weekKeys.length > 0 && <div className="text-[10px] text-th-muted">Total {Math.round(toUnit(Object.values(byWeek).reduce((a, b) => a + b, 0))).toLocaleString()} {unit}</div>}
                    </div>
                    <div className="bg-th-card border border-th-line rounded-xl p-4 space-y-2">
                        <div className="text-xs font-bold text-white">Exercise performance</div>
                        {exNames.length === 0 ? <div className="text-[11px] text-th-muted">Log a workout to see exercise trends.</div> : (<>
                            <select value={chosen} onChange={e => setExName(e.target.value)} className="w-full min-h-[44px] bg-th-bg border border-th-line rounded-xl px-3 text-white">{exNames.map(n => <option key={n} value={n}>{n}</option>)}</select>
                            {series.map((x, i) => <div key={i} className="flex justify-between text-[11px]"><span className="text-th-muted">{x.date}</span><span className="text-white tabular-nums">{x.weight} {x.unit} × {x.reps}{x.weight === prWeight && prWeight > 0 && series.length > 1 ? ' · best logged' : ''}</span></div>)}
                            <div className="text-[10px] text-th-muted">Best set per session, from your logged working sets only.</div>
                        </>)}
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-white">Recent workouts</div>
                        {logs.length === 0 && <div className="text-[11px] text-th-muted">Nothing logged yet.</div>}
                        {logs.slice(0, 10).map(l => (
                            <div key={l.id} className="bg-th-card border border-th-line rounded-xl p-3 flex justify-between gap-2">
                                <div><div className="text-xs font-bold text-white">{l.workoutName}</div><div className="text-[10px] text-th-muted">{l.date}{l.week ? ` · Week ${l.week} Day ${l.day}` : ''}{l.programName && sel === 'all' ? ` · ${l.programName}` : ''}</div></div>
                                <div className="text-[11px] text-th-muted text-right tabular-nums">{l.durationMin} min<br />{Math.round(toUnit(l.totalVolumeLb || 0)).toLocaleString()} {unit}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        // ---- Local persistence (browser localStorage only; no cloud sync) ----
        const STORE_KEY = 'stronger.state';
        const SCHEMA_VERSION = 3;
        const migrate = (data) => {
            // Schema upgrades are keyed on data.schemaVersion.
            if (!data.schemaVersion || data.schemaVersion < 2) {
                // v2 removed the demo data that shipped with the first version of the app.
                if (Array.isArray(data.workoutLogs)) data.workoutLogs = data.workoutLogs.filter(l => !(l.id === 'log-1' && l.workoutName === 'Upper Body Strength' && l.date === '2026-09-20'));
                if (data.program && data.program.name === '12 Week Strength Builder' && data.program.phase === 'Phase 2 · Intensification') data.program = undefined;
                data.schemaVersion = 2;
            }
            if (data.schemaVersion < 3) {
                // v3 removed all built-in sample content (sample exercises, sample plan, placeholder name).
                delete data.program; delete data.selectedDayId; delete data.exercises;
                if (Array.isArray(data.workoutLogs)) data.workoutLogs = data.workoutLogs.filter(l => !(l.id === 'log-1' && l.workoutName === 'Upper Body Strength' && l.date === '2026-09-20'));
                if (data.userSettings && (data.userSettings.name === 'John' || data.userSettings.name === 'Athlete')) data.userSettings.name = '';
                if (data.activeSession && !data.activeSession.program) { data.activeSession = null; data.restEndsAt = null; } // a sample workout in progress
                data.schemaVersion = 3;
            }
            return data;
        };
        const loadStore = () => {
            try {
                const raw = localStorage.getItem(STORE_KEY);
                return raw ? migrate(JSON.parse(raw)) : {};
            } catch (e) { return {}; }
        };
        const STORED = loadStore();
        const fmtClock = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

        function App() {
            const [activeNav, setActiveNav] = useState('Home');
            const [selectedTheme, setSelectedTheme] = useState(resolveTheme(STORED.selectedTheme));
            useEffect(() => { applyTheme(selectedTheme); }, [selectedTheme]);

            const exercises = EXERCISE_LIBRARY;
            const [workoutLogs, setWorkoutLogs] = useState(STORED.workoutLogs || INITIAL_WORKOUT_LOGS);
            const [userSettings, setUserSettings] = useState(STORED.userSettings || { name: '', unit: 'lb', equipment: DEFAULT_EQUIPMENT });

            const [activeSession, setActiveSession] = useState(STORED.activeSession || null);
            // Workout view is a layer over the app; the session itself lives here regardless of the page shown.
            const [workoutOpen, setWorkoutOpen] = useState(false);
            const [confirmDiscard, setConfirmDiscard] = useState(false);
            // Timers derive from timestamps so they stay accurate when Safari is backgrounded or the phone locks.
            const [now, setNow] = useState(Date.now());
            const [restEndsAt, setRestEndsAt] = useState(STORED.restEndsAt || null);
            const timerSeconds = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0;
            const timerRunning = timerSeconds > 0;
            const startRest = (sec) => { const t = Date.now(); setNow(t); setRestEndsAt(t + sec * 1000); };
            const elapsedSeconds = activeSession ? Math.max(0, Math.floor((now - activeSession.startTime) / 1000)) : 0;
            const importInputRef = useRef(null);
            // Program library: original imported programs stay untouched; per-program progress is stored separately.
            const [library, setLibrary] = useState(STORED.library || { programs: {}, progress: {}, activeProgramId: null });
            const [openProgramId, setOpenProgramId] = useState(null);
            const [libraryQuery, setLibraryQuery] = useState('');
            const [libDays, setLibDays] = useState('all');
            const [manageMode, setManageMode] = useState(false);
            const [libStatus, setLibStatus] = useState('all');
            const [importing, setImporting] = useState(false);
            const [importReport, setImportReport] = useState(null);
            const pdfInputRef = useRef(null);
            const progressOf = (id) => library.progress[id] || { status: 'not_started' };

            const ownedEquipment = userSettings.equipment || DEFAULT_EQUIPMENT;
            const [startSheetId, setStartSheetId] = useState(null);
            const [subModalIdx, setSubModalIdx] = useState(null);
            const [confirmDialog, setConfirmDialog] = useState(null);
            const activeProgram = library.activeProgramId ? library.programs[library.activeProgramId] : null;
            const activeProg = activeProgram ? progressOf(library.activeProgramId) : null;
            const activeSessions = useMemo(() => activeProgram && activeProg ? buildSessions(activeProgram, activeProg) : [], [activeProgram, activeProg]);
            const nextProgramSession = activeSessions.find(x => x.status === 'planned') || null;
            const curWeekNum = nextProgramSession ? nextProgramSession.week : (activeSessions.length ? activeSessions[activeSessions.length - 1].week : null);
            const weekSessions = activeSessions.filter(x => x.week === curWeekNum);
            const programDone = activeSessions.filter(x => x.status === 'completed').length;
            const daysSince = (iso) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
            const hasData = Object.keys(library.programs).length > 0 || workoutLogs.length > 0;
            const showBackupReminder = hasData && !(userSettings.backupSnoozeUntil && userSettings.backupSnoozeUntil > Date.now()) && (!userSettings.lastBackupAt || daysSince(userSettings.lastBackupAt) >= 7);

            const patchProgress = (id, fn) => setLibrary(prev => ({ ...prev, progress: { ...prev.progress, [id]: fn(prev.progress[id] || { status: 'not_started' }) } }));
            const askOpenWorkout = () => setConfirmDialog({ title: 'A workout is already in progress', body: 'Return to it (or discard it from inside the workout screen) before starting another.', confirmLabel: 'Return to workout', onConfirm: () => setWorkoutOpen(true) });
            const requestStartProgram = (id) => { if (activeSession) return askOpenWorkout(); setStartSheetId(id); };
            const pauseOthers = (progress, activeId, exceptId) => {
                if (activeId && activeId !== exceptId && progress[activeId] && progress[activeId].status === 'in_progress')
                    progress[activeId] = { ...progress[activeId], status: 'paused' };
            };
            const activateProgram = (id, { startDate, weekdays }) => {
                setLibrary(prev => {
                    const progress = { ...prev.progress };
                    pauseOthers(progress, prev.activeProgramId, id);
                    progress[id] = { status: 'in_progress', startDate, weekdays, sessions: {}, startedAt: new Date().toISOString() };
                    return { ...prev, progress, activeProgramId: id };
                });
                setStartSheetId(null); setOpenProgramId(null); setActiveNav('Calendar');
                triggerToast('Program started', 'Your schedule is on the Calendar.');
            };
            const resumeProgram = (id) => {
                if (activeSession && activeSession.program && activeSession.program.programId !== id) return askOpenWorkout();
                setLibrary(prev => {
                    const progress = { ...prev.progress };
                    pauseOthers(progress, prev.activeProgramId, id);
                    progress[id] = { ...progress[id], status: 'in_progress' };
                    return { ...prev, progress, activeProgramId: id };
                });
                setOpenProgramId(null); setActiveNav('Calendar');
            };
            const pauseProgram = (id) => patchProgress(id, p => ({ ...p, status: 'paused' }));
            const rescheduleSession = (sess, date) => patchProgress(library.activeProgramId, p => ({ ...p, sessions: { ...p.sessions, [sess.key]: { ...(p.sessions || {})[sess.key], plannedDate: date } } }));
            const skipSession = (sess) => setConfirmDialog({ title: `Skip ${sess.label}?`, body: 'It will be marked skipped (not completed) and the program moves on to the next workout. Nothing is logged.', confirmLabel: 'Skip workout', danger: true,
                onConfirm: () => patchProgress(library.activeProgramId, p => ({ ...p, sessions: { ...p.sessions, [sess.key]: { ...(p.sessions || {})[sess.key], status: 'skipped' } } })) });

            const lastPerformance = (name) => {
                const n = normName(name);
                for (const log of workoutLogs) {
                    const ex = log.exercises.find(e => normName(e.name) === n && e.sets.some(x => x.reps));
                    if (ex) return `${log.date}: ` + ex.sets.filter(x => x.reps && x.type !== 'warmup').map(x => `${x.weight || 0}×${x.reps}`).join(', ');
                }
                return null;
            };
            const lastSetsFor = (name) => {
                const n = normName(name);
                for (const log of workoutLogs) {
                    const ex = log.exercises.find(e => normName(e.name) === n && e.sets.some(x => x.reps));
                    if (ex) return ex.sets.filter(x => x.type !== 'warmup' && x.reps);
                }
                return [];
            };
            const startProgramWorkout = (sess) => {
                if (activeSession) return askOpenWorkout();
                const prog = library.programs[library.activeProgramId];
                const go = () => {
                    const exs = sess.exercises.map(e => {
                        const sets = [];
                        const mk = (type, n) => ({ id: `${sess.key}-${e.order}-${type}-${n}`, setNumber: n, type, completed: false, weight: '', reps: '', rpe: '' });
                        for (let i = 1; i <= (e.warmupSets || 0); i++) sets.push(mk('warmup', i));
                        for (let i = 1; i <= (e.workingSets || 0); i++) sets.push(mk('working', i));
                        const lib = exercises.find(x => normName(x.name) === normName(e.name));
                        return { exerciseId: lib ? lib.id : null, name: e.name, key: normName(e.name), substitution: null,
                            prescribed: { warmupText: e.warmupText || null, technique: e.technique || null, ref: e.ref || null, warmupSets: e.warmupSets, workingSets: e.workingSets, reps: e.reps, intensity: e.intensity, rest: e.rest || null, notes: e.notes, page: e.page, flags: e.flags, sourceSubstitutions: e.sourceSubstitutions || [], sourceGuidance: e.sourceGuidance || [], videoUrl: e.videoUrl || null }, sets };
                    });
                    setRestEndsAt(null);
                    setActiveSession({ id: `session-${Date.now()}`, dayId: null, workoutName: sess.label, startTime: Date.now(), exercises: exs,
                        program: { programId: prog.id, programName: prog.name, week: sess.week, day: sess.day, key: sess.key, label: sess.label, plannedDate: sess.plannedDate } });
                    setWorkoutOpen(true);
                };
                const nxt = activeSessions.find(x => x.status === 'planned');
                if (nxt && nxt.key !== sess.key) setConfirmDialog({ title: 'Start out of order?', body: `Your next scheduled workout is Week ${nxt.week} Day ${nxt.day} (${nxt.label}).`, confirmLabel: 'Start anyway', onConfirm: go });
                else go();
            };
            const updateSet = (exIdx, setIdx, patch) => setActiveSession(prev => ({ ...prev, exercises: prev.exercises.map((e, i) => i !== exIdx ? e : { ...e, sets: e.sets.map((st, j) => j !== setIdx ? st : { ...st, ...patch }) }) }));
            const addSet = (exIdx, type = 'working') => setActiveSession(prev => ({ ...prev, exercises: prev.exercises.map((e, i) => {
                if (i !== exIdx) return e;
                const blank = { completed: false, weight: '', reps: '', rpe: '' };
                if (type === 'warmup') { // warm-ups stay at the top of the list
                    const w = e.sets.filter(x => x.type === 'warmup');
                    return { ...e, sets: [...w, { ...blank, id: `${e.key}-wu-${Date.now()}`, setNumber: w.length + 1, type: 'warmup' }, ...e.sets.filter(x => x.type !== 'warmup')] };
                }
                if (type === 'drop' || type === 'myo') return { ...e, sets: [...e.sets, { ...blank, id: `${e.key}-${type}-${Date.now()}`, setNumber: e.sets.filter(x => x.type === type).length + 1, type, extra: true }] };
                return { ...e, sets: [...e.sets, { ...blank, id: `${e.key}-extra-${Date.now()}`, setNumber: e.sets.filter(x => x.type === 'working').length + 1, type: 'working', extra: true }] };
            }) }));
            const setSubstitution = (exIdx, sub) => { setActiveSession(prev => ({ ...prev, exercises: prev.exercises.map((e, i) => i !== exIdx ? e : { ...e, substitution: sub }) })); setSubModalIdx(null); };
            const toggleProgramSet = (exIdx, setIdx) => {
                const st = activeSession.exercises[exIdx].sets[setIdx];
                if (!st.completed && !String(st.reps).trim()) { triggerToast('Enter reps first', 'Record what you actually performed before checking the set off.'); return; }
                updateSet(exIdx, setIdx, { completed: !st.completed });
            };

            const handlePdfFiles = async (fileList) => {
                const files = Array.from(fileList || []);
                if (!files.length) return;
                setImporting(true);
                const report = [];
                let next = library;
                for (const file of files) {
                    try {
                        const { programs, flags } = await window.StrongerImport.importFile(file);
                        if (!programs.length) { report.push({ file: file.name, ok: false, msg: flags.map(f => f.msg).join('; ') }); continue; }
                        for (const prog of programs) {
                            const existing = next.programs[prog.id];
                            if (existing && existing.source.sha256 === prog.source.sha256 && (existing.parserVersion || 1) >= prog.parserVersion) { report.push({ file: file.name, ok: false, msg: `"${prog.name}" is already in your library (identical file).` }); continue; }
                            next = { ...next, programs: { ...next.programs, [prog.id]: prog }, progress: { ...next.progress, [prog.id]: next.progress[prog.id] || { status: 'not_started' } } };
                            report.push({ file: file.name, ok: true, msg: `${existing ? 'Updated' : 'Imported'} "${prog.name}" — ${prog.metadata.totalWeeks} weeks, ${prog.metadata.daysPerWeek} days/week${prog.flags.length ? `, ${prog.flags.length} item(s) flagged` : ''}.` });
                        }
                    } catch (err) { report.push({ file: file.name, ok: false, msg: err.message || String(err) }); }
                }
                setLibrary(next);
                setImportReport(report);
                setImporting(false);
            };
            // Removing a program never touches workout history unless you choose to delete it too.
            const performRemove = (id, deleteHistory) => {
                setLibrary(prev => {
                    const programs = { ...prev.programs }; delete programs[id];
                    const progress = { ...prev.progress };
                    if (deleteHistory) delete progress[id]; // otherwise your place is kept, so re-importing the file restores it
                    return { ...prev, programs, progress, activeProgramId: prev.activeProgramId === id ? null : prev.activeProgramId };
                });
                if (deleteHistory) setWorkoutLogs(prev => prev.filter(l => l.programId !== id));
                setOpenProgramId(null);
                triggerToast('Program removed', deleteHistory ? 'Its workout history was deleted too.' : 'Your workout history was kept.');
            };
            const removeProgram = (id) => {
                const prog = library.programs[id];
                if (!prog) return;
                if (activeSession && activeSession.program && activeSession.program.programId === id) { askOpenWorkout(); return; }
                const logCount = workoutLogs.filter(l => l.programId === id).length;
                setConfirmDialog({
                    title: `Remove "${prog.name}"?`,
                    body: `You can import the file again at any time.${logCount ? ` You have ${logCount} logged workout(s) from this program.` : ''}`,
                    confirmLabel: logCount ? 'Remove and delete its history' : 'Remove program',
                    danger: true,
                    onConfirm: () => performRemove(id, true),
                    ...(logCount ? { secondaryLabel: 'Remove, keep my workout history', onSecondary: () => performRemove(id, false) } : {})
                });
            };

            const [toast, setToast] = useState(null);
            const triggerToast = (title, message) => {
                setToast({ title, message });
                setTimeout(() => setToast(null), 3500);
            };

            useEffect(() => {
                if (!activeSession && !restEndsAt) return;
                const tick = () => setNow(Date.now());
                const interval = setInterval(tick, 1000);
                document.addEventListener('visibilitychange', tick);
                return () => { clearInterval(interval); document.removeEventListener('visibilitychange', tick); };
            }, [!!activeSession, !!restEndsAt]);

            // Persist everything incrementally (including the in-progress session).
            useEffect(() => {
                try {
                    localStorage.setItem(STORE_KEY, JSON.stringify({
                        schemaVersion: SCHEMA_VERSION,
                        selectedTheme, workoutLogs, userSettings, activeSession, restEndsAt, library
                    }));
                } catch (e) { /* storage full or unavailable */ }
            }, [selectedTheme, workoutLogs, userSettings, activeSession, restEndsAt, library]);

            useEffect(() => { // iOS: scroll a focused field into view once the keyboard is up
                const onFocus = (e) => { const t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) setTimeout(() => t.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350); };
                document.addEventListener('focusin', onFocus);
                return () => document.removeEventListener('focusin', onFocus);
            }, []);
            const [storagePersisted, setStoragePersisted] = useState(null);
            useEffect(() => { // ask the browser not to evict our data (Safari grants this mainly to home-screen apps)
                if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(setStoragePersisted).catch(() => {});
            }, []);
            const exportBackup = () => {
                const data = { app: 'STRONGER', exportedAt: new Date().toISOString(), ...loadStore() };
                const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
                const a = document.createElement('a');
                a.href = url; a.download = `stronger-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click(); URL.revokeObjectURL(url);
                setUserSettings(prev => ({ ...prev, lastBackupAt: new Date().toISOString(), backupSnoozeUntil: null }));
            };
            const importBackup = (file) => {
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const d = migrate(JSON.parse(reader.result));
                        if (d.app !== 'STRONGER' && !d.workoutLogs) throw new Error('not a STRONGER backup');
                        localStorage.setItem(STORE_KEY, JSON.stringify(d));
                        location.reload();
                    } catch (e) { triggerToast('Restore failed', 'That file is not a valid STRONGER backup.'); }
                };
                reader.readAsText(file);
            };

            const finishProgramWorkout = () => {
                const sess = activeSession;
                const unit = userSettings.unit, toLb = unit === 'kg' ? 2.20462 : 1;
                let vol = 0, doneSets = 0;
                const exLogs = sess.exercises.map(e => {
                    const done = e.sets.filter(x => x.completed);
                    doneSets += done.length;
                    done.forEach(x => { if (x.type !== 'warmup') vol += (parseFloat(x.weight) || 0) * (parseInt(x.reps, 10) || 0) * toLb; });
                    return { exerciseId: e.substitution ? e.substitution.exerciseId : e.exerciseId, name: e.substitution ? e.substitution.name : e.name,
                        prescribedName: e.name, substituted: !!e.substitution, substitutionOrigin: e.substitution ? e.substitution.origin : null, prescribed: e.prescribed,
                        sets: done.map(x => ({ setNumber: x.setNumber, type: x.type, weight: parseFloat(x.weight) || 0, unit, reps: parseInt(x.reps, 10) || 0, rpe: x.rpe === '' ? null : parseFloat(x.rpe) })) };
                }).filter(e => e.sets.length);
                if (!doneSets) { triggerToast('Nothing to log', 'Complete at least one set, or discard the workout.'); return; }
                const completedDate = todayStr();
                const log = { id: `log-${sess.id}`, sessionId: sess.id, date: completedDate, workoutName: sess.workoutName, durationMin: Math.max(1, Math.round(elapsedSeconds / 60)),
                    totalVolumeLb: Math.round(vol), programId: sess.program.programId, programName: sess.program.programName, week: sess.program.week, day: sess.program.day,
                    sessionKey: sess.program.key, plannedDate: sess.program.plannedDate, completedDate, exercises: exLogs };
                setWorkoutLogs(prev => prev.some(l => l.sessionId === sess.id) ? prev : [log, ...prev]);
                setLibrary(prev => {
                    const pr = prev.progress[sess.program.programId] || { status: 'in_progress' };
                    const sessions = { ...(pr.sessions || {}), [sess.program.key]: { ...((pr.sessions || {})[sess.program.key] || {}), status: 'completed', completedDate, logId: log.id } };
                    const prog = prev.programs[sess.program.programId];
                    const all = prog ? buildSessions(prog, { ...pr, sessions }) : [];
                    const complete = all.length > 0 && all.every(x => x.status === 'completed');
                    return { ...prev, progress: { ...prev.progress, [sess.program.programId]: { ...pr, sessions, status: complete ? 'completed' : 'in_progress' } } };
                });
                setActiveSession(null); setWorkoutOpen(false); setRestEndsAt(null);
                triggerToast('Workout Completed!', `Logged ${doneSets} set(s) for ${sess.workoutName}.`);
            };
            const requestFinish = () => {
                if (!activeSession) return;
                const left = activeSession.exercises.reduce((n, e) => n + e.sets.filter(x => !x.completed && x.type === 'working').length, 0);
                if (left > 0) setConfirmDialog({ title: 'Finish with sets remaining?', body: `${left} working set(s) are not checked off. They will not be logged, and only the work you completed is saved.`, confirmLabel: 'Finish workout', onConfirm: finishProgramWorkout });
                else finishProgramWorkout();
            };

            const renderProgramExercise = (item, exIdx) => {
                const pr = item.prescribed;
                const display = item.substitution ? item.substitution.name : item.name;
                const prev = lastPerformance(display);
                const lastSets = lastSetsFor(display);
                const workIdx = (setIdx) => item.sets.slice(0, setIdx).filter(x => x.type === 'working').length;
                const placeholderWeight = (st, setIdx) => (st.type === 'working' && lastSets.length ? String(lastSets[Math.min(workIdx(setIdx), lastSets.length - 1)].weight || userSettings.unit) : userSettings.unit);
                const fillLast = () => item.sets.forEach((st, i) => { if (st.type === 'working' && st.weight === '' && lastSets.length) updateSet(exIdx, i, { weight: String(lastSets[Math.min(workIdx(i), lastSets.length - 1)].weight || '') }); });
                const canAddWarm = !!pr.warmupText && !pr.warmupSets; // warm-ups given as a range: you decide how many
                const addWarmBtn = <button onClick={() => addSet(exIdx, 'warmup')} className="w-full min-h-[44px] rounded-xl border border-dashed border-th-line text-xs font-bold text-th-muted">＋ Add warm-up set</button>;
                const tech = pr.technique || '';
                const holdSec = (tech.match(/static hold[^0-9]*(\d+)\s*sec/i) || [])[1];
                const dropPct = (tech.match(/(\d+)\s*%/) || [])[1];
                const lastDone = [...item.sets].reverse().find(x => x.completed && x.type !== 'warmup' && x.weight !== '');
                const dropHint = lastDone && dropPct ? String(Math.round(parseFloat(lastDone.weight) * (1 - parseInt(dropPct, 10) / 100) * 2) / 2) : userSettings.unit;
                return (
                    <div key={exIdx} className="bg-th-card border border-th-line rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-th-accent">Exercise {exIdx + 1} of {activeSession.exercises.length}</div>
                                <h3 className="text-xl font-black text-white leading-tight mt-0.5">{display}</h3>
                                {item.substitution && <div className="text-[10px] text-[#F59E0B]">Your substitution · prescribed: {item.name}</div>}
                            </div>
                            <button onClick={() => setSubModalIdx(exIdx)} aria-label="Substitute exercise" className="min-w-[44px] min-h-[44px] rounded-xl bg-th-elevated text-th-muted text-base shrink-0">⇄</button>
                        </div>
                        <div className="bg-th-bg border border-th-line rounded-xl p-2.5 text-[11px] space-y-0.5">
                            <div className="text-th-muted uppercase text-[10px] font-bold tracking-wide">Prescribed by program</div>
                            <div className="text-white font-bold">{pr.workingSets ?? '?'} × {pr.reps ?? '?'}{pr.warmupText ? ` · ${pr.warmupText} warm-up` : pr.warmupSets ? ` · ${pr.warmupSets} warm-up` : ''} · {intensityLabel(pr.intensity)}{pr.rest ? ` · rest ${restLabel(pr.rest)}` : ''}</div>
                            {pr.technique && <div className="text-[#F59E0B] font-semibold">Last-set technique: {pr.technique}</div>}
                            {pr.notes && <div className="text-th-ink/80 leading-snug">{pr.notes}</div>}
                            {pr.rest && pr.rest.maxSeconds && <button onClick={() => startRest(pr.rest.maxSeconds)} className="min-h-[44px] px-4 rounded-xl bg-th-elevated border border-th-line text-xs font-bold text-white">⏱ Start prescribed rest ({restLabel(pr.rest)})</button>}
                            {pr.videoUrl && <a href={pr.videoUrl} target="_blank" rel="noopener noreferrer" className="block text-[11px] font-semibold text-th-accent">▶ Technique video</a>}
                            {!item.substitution && equipmentFor(item.name) && !ownedEquipment.includes(equipmentFor(item.name)) && <div className="text-[#F59E0B]">⚠ May need {equipmentFor(item.name)} (not in your equipment list) — tap ⇄ to substitute</div>}
                            {pr.flags.length > 0 && <div className="text-[#F59E0B]">⚠ Uncertain extraction — check {pr.page ? `PDF p.${pr.page}` : pr.ref}</div>}
                        </div>
                        {prev && <div className="flex items-center justify-between gap-2"><div className="text-[11px] text-th-muted">Last time · {prev}</div>{lastSets.length > 0 && <button onClick={fillLast} className="min-h-[44px] px-4 rounded-xl bg-th-elevated border border-th-line text-xs font-bold text-white shrink-0">Use last weights</button>}</div>}
                        <div className="space-y-2">
                            {canAddWarm && !item.sets.some(x => x.type === 'warmup') && (
                                <>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-th-elevated text-th-muted">Warm-up sets</span>
                                        <span className="text-[10px] text-th-muted">{pr.warmupText} per the program · not counted in volume</span>
                                    </div>
                                    {addWarmBtn}
                                </>
                            )}
                            {item.sets.map((st, setIdx) => {
                                const catOf = (x) => (x.type === 'warmup' ? 'warmup' : (x.type === 'drop' || x.type === 'myo') ? 'technique' : 'working');
                                const cat = catOf(st), isWarm = cat === 'warmup', isTech = cat === 'technique';
                                const header = setIdx === 0 || catOf(item.sets[setIdx - 1]) !== cat;
                                const word = isWarm ? 'Warm-up' : st.type === 'drop' ? 'Drop' : st.type === 'myo' ? 'Myo-rep' : st.extra ? 'Extra' : 'Working';
                                const rowCls = isWarm
                                    ? (st.completed ? 'bg-th-elevated border-dashed border-th-line' : 'bg-th-bg/40 border-dashed border-th-line')
                                    : (st.completed ? 'bg-[#31D583]/10 border-[#31D583]/30' : 'bg-th-bg border-th-line') + ' border-l-4 ' + (isTech ? 'border-l-[#F59E0B]' : 'border-l-th-accent');
                                const wordCls = isWarm ? 'text-th-muted' : isTech ? 'text-[#F59E0B]' : 'text-th-accent';
                                const doneCls = isWarm ? 'bg-th-muted text-th-bg' : 'bg-[#31D583] text-th-bg';
                                return (
                                    <React.Fragment key={st.id}>
                                        {header && (
                                            <div className="flex items-center gap-2 pt-1">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${isWarm ? 'bg-th-elevated text-th-muted' : isTech ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'bg-th-accent/20 text-th-accent'}`}>{isWarm ? 'Warm-up sets' : isTech ? 'Technique sets' : 'Working sets'}</span>
                                                <span className="text-[10px] text-th-muted">{isWarm ? `${pr.warmupText ? pr.warmupText + ' per the program · ' : ''}not counted in volume` : isTech ? 'extra sets for the last-set technique' : `${pr.workingSets ?? '?'} × ${pr.reps ?? '?'} · ${intensityLabel(pr.intensity)}`}</span>
                                            </div>
                                        )}
                                        <div className={`grid grid-cols-[56px_1fr_1fr_44px] gap-2 items-center p-2 rounded-xl border ${rowCls}`}>
                                            <span className="leading-tight"><span className={`block text-[10px] font-black uppercase tracking-wide ${wordCls}`}>{word}</span><span className="block text-sm font-black text-white">{st.setNumber}</span></span>
                                            <input type="number" inputMode="decimal" value={st.weight} placeholder={st.type === 'drop' ? dropHint : placeholderWeight(st, setIdx)} aria-label={`${word} set ${st.setNumber} weight`} onChange={e => updateSet(exIdx, setIdx, { weight: e.target.value })} className="w-full min-w-0 min-h-[44px] bg-th-card border border-th-line rounded-xl px-2 text-center text-white tabular-nums font-bold" />
                                            <input type="number" inputMode="numeric" value={st.reps} placeholder={isWarm ? 'reps' : (pr.reps || 'reps')} aria-label={`${word} set ${st.setNumber} reps`} onChange={e => updateSet(exIdx, setIdx, { reps: e.target.value })} className="w-full min-w-0 min-h-[44px] bg-th-card border border-th-line rounded-xl px-2 text-center text-white tabular-nums font-bold" />
                                            <button onClick={() => toggleProgramSet(exIdx, setIdx)} aria-label={`Complete set (${word} ${st.setNumber})`} className={`h-11 w-11 rounded-xl text-base font-black ${st.completed ? doneCls : 'bg-th-elevated text-th-muted'}`}>✓</button>
                                        </div>
                                        {isWarm && canAddWarm && (!item.sets[setIdx + 1] || item.sets[setIdx + 1].type !== 'warmup') && addWarmBtn}
                                    </React.Fragment>
                                );
                            })}
                            {(/myo/i.test(tech) || /drop/i.test(tech) || holdSec) && (
                                <div className="flex gap-2 flex-wrap">
                                    {/myo/i.test(tech) && <button onClick={() => addSet(exIdx, 'myo')} className="flex-1 min-h-[44px] rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-xs font-bold text-[#F59E0B]">＋ Myo-rep set</button>}
                                    {/drop/i.test(tech) && <button onClick={() => addSet(exIdx, 'drop')} className="flex-1 min-h-[44px] rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-xs font-bold text-[#F59E0B]">＋ Drop set{dropPct ? ` (−${dropPct}%)` : ''}</button>}
                                    {holdSec && <button onClick={() => startRest(parseInt(holdSec, 10))} className="flex-1 min-h-[44px] rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-xs font-bold text-[#F59E0B]">⏱ Start {holdSec}s hold timer</button>}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button onClick={() => addSet(exIdx)} className="flex-1 min-h-[44px] rounded-xl border border-dashed border-th-line text-xs font-bold text-th-muted">＋ Add extra set</button>
                            </div>
                        </div>
                    </div>
                );
            };

            return (
                <div className="bg-th-bg text-th-ink min-h-screen flex flex-col w-full font-sans antialiased pb-24 md:pb-0">
                    
                    {/* TOP HEADER (Optimized for iPhone notch & touch) */}
                    <header className="px-4 py-2.5 border-b border-th-line bg-th-bg2/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-3 safe-top">
                        <div className="flex items-center gap-2.5">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-th-accent to-th-accent-dark flex items-center justify-center shadow-md shadow-th-accent/25 shrink-0">
                                <Icon name="dumbbell" className="w-5 h-5 text-th-on-accent" />
                            </div>
                            <div>
                                <h1 className="text-xs font-black tracking-wider text-white">STRONGER</h1>
                                <p className="text-[10px] text-th-muted truncate">{userSettings.name ? `Hey, ${userSettings.name} 👋` : 'Welcome 👋'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setActiveNav('Settings')} aria-label="Settings" className="w-11 h-11 rounded-xl bg-th-accent text-th-on-accent font-bold flex items-center justify-center text-xs shadow cursor-pointer">
                                {(userSettings.name || 'S')[0].toUpperCase()}
                            </button>
                        </div>
                    </header>

                    {/* ACTIVE WORKOUT OVERLAY (Optimized for gym thumb usage) */}
                    {activeSession && workoutOpen && (
                        <div className="fixed inset-0 z-50 bg-th-bg/95 backdrop-blur-xl flex flex-col p-4 overflow-y-auto safe-top safe-bottom">
                            <div className="max-w-xl mx-auto w-full space-y-4">
                                <div className="bg-th-card border border-th-line rounded-xl p-4 flex items-center justify-between gap-3 sticky top-0 z-20 shadow-xl">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-th-accent">Active Workout</div>
                                        <h2 className="text-lg font-black text-white">{activeSession.workoutName}</h2>
                                        {activeSession.program && <div className="text-[11px] text-th-muted">{activeSession.program.programName} · Week {activeSession.program.week} · Day {activeSession.program.day}</div>}
                                        <div className="text-[11px] text-th-muted flex items-center gap-2 mt-0.5">
                                            <span>Time: <strong className="text-white tabular-nums">{Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</strong></span>
                                            <span>·</span>
                                            <span>Rest: <strong className="text-[#31D583] tabular-nums">{fmtClock(timerSeconds)}</strong></span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setWorkoutOpen(false); setActiveNav('Home'); }} aria-label="Back to Home, keep workout running" className="min-h-[44px] px-4 rounded-xl bg-th-elevated border border-th-line text-white text-xs font-bold">⌂ Home</button>
                                        <button onClick={requestFinish} className="px-4 min-h-[44px] rounded-xl bg-[#31D583] hover:bg-[#25B86F] text-th-bg text-xs font-black shadow cursor-pointer">
                                            Finish
                                        </button>
                                        <button onClick={() => setConfirmDiscard(true)} aria-label="Discard workout" className="min-w-[44px] min-h-[44px] rounded-xl bg-th-elevated text-[#F43F5E] text-sm font-black">✕</button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                    <span className="text-[11px] text-th-muted shrink-0">Rest timer</span>
                                    {[60, 90, 120, 180].map(sec => <button key={sec} onClick={() => startRest(sec)} className="min-h-[44px] px-4 rounded-xl bg-th-elevated border border-th-line text-xs font-bold text-white shrink-0">{sec >= 120 ? `${sec / 60} min` : `${sec}s`}</button>)}
                                    {timerRunning && <button onClick={() => setRestEndsAt(null)} className="min-h-[44px] px-4 rounded-xl bg-th-elevated border border-[#F43F5E]/40 text-xs font-bold text-[#F43F5E] shrink-0">Stop {fmtClock(timerSeconds)}</button>}
                                </div>

                                <div className="space-y-4">
                                    {activeSession.exercises.map((item, exIdx) => renderProgramExercise(item, exIdx))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MAIN CONTAINER */}
                    <main className={`flex-1 flex flex-col p-4 max-w-xl mx-auto w-full space-y-6 ${activeSession ? 'pb-16' : ''}`}>
                        {activeNav === 'Home' && (
                            <div className="space-y-5">
                                {showBackupReminder && (
                                    <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl p-4 space-y-2">
                                        <div className="text-xs font-bold text-[#F59E0B]">Back up your data</div>
                                        <p className="text-[11px] text-th-ink/80">Your programs and workout history live only in this browser. {userSettings.lastBackupAt ? `Last backup ${daysSince(userSettings.lastBackupAt)} day(s) ago.` : 'You have never exported a backup.'}</p>
                                        <div className="flex gap-2">
                                            <button onClick={exportBackup} className="flex-1 min-h-[44px] rounded-xl bg-[#F59E0B] text-th-bg text-xs font-black">Export backup now</button>
                                            <button onClick={() => setUserSettings({ ...userSettings, backupSnoozeUntil: Date.now() + 3 * 86400000 })} className="min-h-[44px] px-4 rounded-xl bg-th-elevated border border-th-line text-white text-xs font-bold">Later</button>
                                        </div>
                                    </div>
                                )}
                                {!activeProgram && (
                                    <div className="bg-th-card border border-dashed border-th-line rounded-xl p-5 text-center space-y-3">
                                        <p className="text-xs text-th-muted">{Object.keys(library.programs).length ? 'No program is active. Pick one from your library to put it on the calendar.' : 'Import a program (PDF or Excel) to follow it here, step by step.'}</p>
                                        <button onClick={() => setActiveNav('Program')} className="min-h-[44px] px-4 rounded-xl bg-th-accent text-th-on-accent text-xs font-bold">Open Program Library</button>
                                    </div>
                                )}
                                {activeProgram && (
                                    <div className="bg-th-card border border-th-accent/40 rounded-xl p-4 space-y-2">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-th-accent">Active program · {activeProgram.name}</div>
                                        {nextProgramSession ? (<>
                                            <div className="text-sm font-black text-white">Week {nextProgramSession.week} · Day {nextProgramSession.day} · {nextProgramSession.label}</div>
                                            <div className="text-[11px] text-th-muted">{nextProgramSession.plannedDate ? (nextProgramSession.plannedDate === todayStr() ? 'Scheduled today' : nextProgramSession.missed ? `Missed — was planned ${fmtShort(nextProgramSession.plannedDate)} (still pending)` : `Planned ${fmtShort(nextProgramSession.plannedDate)}`) : ''}</div>
                                            <div className="flex gap-2 pt-1">
                                                <button onClick={() => startProgramWorkout(nextProgramSession)} className="flex-1 min-h-[48px] rounded-xl bg-th-accent text-th-on-accent text-sm font-bold">{activeSession ? 'Return to workout' : 'Start workout'}</button>
                                                <button onClick={() => setActiveNav('Calendar')} className="min-h-[44px] px-4 rounded-xl bg-th-elevated border border-th-line text-white text-xs font-bold">Calendar</button>
                                            </div>
                                        </>) : <div className="text-xs text-th-muted">No pending workouts left in this program.</div>}
                                        {weekSessions.length > 0 && (
                                            <div className="pt-1">
                                                <div className="text-[10px] text-th-muted mb-1.5">Week {curWeekNum}{weekSessions[0].deload ? ' (deload)' : ''} · {weekSessions.filter(x => x.status === 'completed').length}/{weekSessions.length} done · {programDone}/{activeSessions.length} overall</div>
                                                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${weekSessions.length}, minmax(0, 1fr))` }}>
                                                    {weekSessions.map(ws => {
                                                        const isToday = ws.plannedDate === todayStr();
                                                        const cls = ws.status === 'completed' ? 'bg-[#31D583]/20 border-[#31D583]/50 text-[#31D583]' : ws.status === 'skipped' ? 'bg-th-elevated border-th-line text-th-muted' : ws.missed ? 'bg-[#F43F5E]/15 border-[#F43F5E]/50 text-[#F43F5E]' : isToday ? 'bg-th-accent/20 border-th-accent text-white' : 'bg-th-bg border-th-line text-th-muted';
                                                        return (
                                                            <button key={ws.key} onClick={() => setActiveNav('Calendar')} aria-label={`${ws.label} ${ws.status}`} className={`min-h-[52px] rounded-xl border px-1 py-1 flex flex-col items-center justify-center text-[10px] leading-tight ${cls}`}>
                                                                <span className="font-black text-[11px]">{ws.status === 'completed' ? '✓' : `D${ws.day}`}</span>
                                                                <span className="truncate w-full text-center">{ws.plannedDate ? fmtShort(ws.plannedDate).split(' ')[0] : ''}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SUMMARY METRICS (real data) */}
                                {activeProgram && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 rounded-xl bg-th-card border border-th-line space-y-2">
                                            <div className="flex items-center justify-between text-[11px] text-th-muted"><span>Program progress</span><Icon name="layers" className="w-3.5 h-3.5 text-th-accent" /></div>
                                            <div className="text-lg font-extrabold text-white tabular-nums">{programDone} / {activeSessions.length}</div>
                                            <div className="w-full bg-th-bg h-1.5 rounded-full overflow-hidden"><div className="bg-th-accent h-full rounded-full" style={{ width: `${activeSessions.length ? (programDone / activeSessions.length) * 100 : 0}%` }}></div></div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-th-card border border-th-line space-y-2">
                                            <div className="flex items-center justify-between text-[11px] text-th-muted"><span>This week</span><Icon name="check-circle-2" className="w-3.5 h-3.5 text-[#31D583]" /></div>
                                            <div className="text-lg font-extrabold text-white tabular-nums">{weekSessions.filter(x => x.status === 'completed').length} / {weekSessions.length}</div>
                                            <div className="flex items-center gap-1">{weekSessions.map(x => <div key={x.key} className={`h-1.5 flex-1 rounded-full ${x.status === 'completed' ? 'bg-[#31D583]' : 'bg-th-line'}`}></div>)}</div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                        {activeNav === 'History' && <HistoryView logs={workoutLogs} unit={userSettings.unit} />}

                        {activeNav === 'Program' && openProgramId && library.programs[openProgramId] && (
                            <ProgramDetail program={library.programs[openProgramId]} state={progressOf(openProgramId)} isActive={library.activeProgramId === openProgramId} unit={userSettings.unit}
                                onBack={() => setOpenProgramId(null)} onRemove={() => removeProgram(openProgramId)}>
                                {(() => {
                                    const st = progressOf(openProgramId).status, id = openProgramId;
                                    const btn = 'w-full min-h-[48px] rounded-xl text-sm font-black ';
                                    if (st === 'not_started') return <button onClick={() => requestStartProgram(id)} className={btn + 'bg-th-accent text-white'}>Start Program</button>;
                                    if (st === 'completed') return <div className="text-xs font-bold text-[#31D583]">✓ All workouts completed</div>;
                                    return (
                                        <div className="flex gap-2">
                                            <button onClick={() => resumeProgram(id)} className={btn + 'flex-1 bg-th-accent text-white'}>Resume Program</button>
                                            {st === 'in_progress' && <button onClick={() => pauseProgram(id)} className="min-h-[48px] px-4 rounded-xl bg-th-elevated border border-th-line text-white text-xs font-bold">Pause</button>}
                                        </div>
                                    );
                                })()}
                            </ProgramDetail>
                        )}

                        {activeNav === 'Program' && !(openProgramId && library.programs[openProgramId]) && (
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-black text-white">Program Library</h2>
                                    <p className="text-[11px] text-th-muted mt-0.5">Import your Jeff Nippard program PDFs or spreadsheets. Each program is followed exactly as written.</p>
                                </div>
                                <button onClick={() => pdfInputRef.current && pdfInputRef.current.click()} disabled={importing} className="w-full min-h-[48px] rounded-xl bg-th-accent text-th-on-accent text-sm font-black disabled:opacity-60">{importing ? 'Reading file…' : '＋ Import program file(s) (PDF or Excel)'}</button>
                                <input ref={pdfInputRef} type="file" multiple className="hidden" onChange={e => { handlePdfFiles(e.target.files); e.target.value = ''; }} />
                                {importReport && (
                                    <div className="bg-th-card border border-th-line rounded-xl p-3 space-y-1.5">
                                        {importReport.map((r, i) => <div key={i} className={`text-[11px] leading-snug ${r.ok ? 'text-[#31D583]' : 'text-[#F43F5E]'}`}>{r.ok ? '✓' : '✕'} {r.file}: {r.msg}</div>)}
                                        <button onClick={() => setImportReport(null)} className="text-xs text-th-muted min-h-[44px]">Dismiss</button>
                                    </div>
                                )}
                                {Object.keys(library.programs).length > 1 && (() => {
                                    const dayOpts = [...new Set(Object.values(library.programs).map(pr => pr.metadata.daysPerWeek).filter(Boolean))].sort((a, b) => a - b);
                                    const chip = (on) => `min-h-[44px] px-4 rounded-xl border text-xs font-bold shrink-0 ${on ? 'bg-th-accent border-th-accent text-th-on-accent' : 'bg-th-card border-th-line text-th-muted'}`;
                                    return (
                                        <div className="space-y-2">
                                            <input type="search" value={libraryQuery} onChange={e => setLibraryQuery(e.target.value)} placeholder="Search programs" className="w-full min-h-[44px] bg-th-card border border-th-line rounded-xl px-3 text-white" />
                                            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter by training days per week">
                                                <button onClick={() => setLibDays('all')} className={chip(libDays === 'all')}>Any days</button>
                                                {dayOpts.map(n => <button key={n} onClick={() => setLibDays(n)} className={chip(libDays === n)}>{n} days/week</button>)}
                                            </div>
                                            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter by status">
                                                {[['all', 'All'], ['not_started', 'Not started'], ['in_progress', 'In progress'], ['paused', 'Paused'], ['completed', 'Completed']].map(([k, l]) => <button key={k} onClick={() => setLibStatus(k)} className={chip(libStatus === k)}>{l}</button>)}
                                            </div>
                                        </div>
                                    );
                                })()}
                                {Object.keys(library.programs).length > 0 && (
                                    <div className="flex justify-end"><button onClick={() => setManageMode(!manageMode)} className={`min-h-[44px] px-4 rounded-xl border text-xs font-bold ${manageMode ? 'bg-[#F43F5E] border-[#F43F5E] text-white' : 'bg-th-card border-th-line text-th-muted'}`}>{manageMode ? 'Done' : 'Manage / remove'}</button></div>
                                )}
                                {Object.keys(library.programs).length === 0 && !importing && (
                                    <div className="bg-th-card border border-dashed border-th-line rounded-xl p-5 text-center text-xs text-th-muted">No programs imported yet. Tap “Import program file(s)” to add one.</div>
                                )}
                                {Object.values(library.programs).filter(pr => pr.name.toLowerCase().includes(libraryQuery.toLowerCase()) && (libDays === 'all' || pr.metadata.daysPerWeek === libDays) && (libStatus === 'all' || progressOf(pr.id).status === libStatus)).map(pr => (
                                    <div key={pr.id} className="space-y-1.5">
                                        <ProgramCard program={pr} state={progressOf(pr.id)} isActive={library.activeProgramId === pr.id} onOpen={() => setOpenProgramId(pr.id)} />
                                        {manageMode && <button onClick={() => removeProgram(pr.id)} className="w-full min-h-[44px] rounded-xl bg-th-elevated border border-[#F43F5E]/50 text-[#F43F5E] text-xs font-bold">Remove “{pr.name}”</button>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeNav === 'Progress' && <ProgramProgress key={library.activeProgramId || 'none'} library={library} workoutLogs={workoutLogs} unit={userSettings.unit} />}

                        {activeNav === 'Calendar' && (
                            <CalendarView program={activeProgram} prog={activeProg} sessions={activeSessions} logs={workoutLogs} hasActiveWorkout={!!activeSession}
                                onStart={startProgramWorkout} onReschedule={rescheduleSession} onSkip={skipSession}
                                onUnskip={(sess) => patchProgress(library.activeProgramId, p => ({ ...p, sessions: { ...p.sessions, [sess.key]: { ...(p.sessions || {})[sess.key], status: 'planned' } } }))}
                                onOpenProgram={() => setActiveNav('Program')} />
                        )}

                        {activeNav === 'Settings' && (
                            <div className="space-y-4">
                                <h2 className="text-base font-black text-white">Settings</h2>
                                <div className="bg-th-card border border-th-line rounded-xl p-4 space-y-3">
                                    <div>
                                        <label className="text-[11px] text-th-muted block mb-1">Your name</label>
                                        <input type="text" value={userSettings.name} placeholder="Your name (optional)" onChange={e => setUserSettings({ ...userSettings, name: e.target.value })} className="w-full bg-th-bg border border-th-line rounded-xl px-3 min-h-[44px] text-white" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-th-muted block mb-1">Weight Unit</label>
                                        <select value={userSettings.unit} onChange={e => setUserSettings({ ...userSettings, unit: e.target.value })} className="w-full bg-th-bg border border-th-line rounded-xl px-3 min-h-[44px] text-white">
                                            <option value="lb">Pounds (lb)</option>
                                            <option value="kg">Kilograms (kg)</option>
                                        </select>
                                    </div>
                                    <div className="pt-3 border-t border-th-line space-y-2">
                                        <div className="text-xs font-bold text-white">Appearance</div>
                                        <div className="flex items-center gap-3" role="radiogroup" aria-label="Colour theme">
                                            {Object.entries(THEMES).map(([key, t]) => (
                                                <button key={key} role="radio" aria-checked={selectedTheme === key} aria-label={t.name} title={t.name} onClick={() => setSelectedTheme(key)}
                                                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center ${selectedTheme === key ? 'border-white' : 'border-th-line'}`} style={{ background: `linear-gradient(135deg, ${t.card} 50%, ${t.accent} 50%)` }}></button>
                                            ))}
                                        </div>
                                        <p className="text-[11px] text-th-muted">{THEMES[selectedTheme].name}</p>
                                    </div>
                                    <div className="pt-3 border-t border-th-line space-y-2">
                                        <div className="text-xs font-bold text-white">My equipment</div>
                                        <p className="text-[11px] text-th-muted">Used to flag program exercises you may not be able to do. You choose any substitutions; nothing is changed automatically.</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {EQUIPMENT_OPTIONS.map(eq => { const on = ownedEquipment.includes(eq); return (
                                                <button key={eq} onClick={() => setUserSettings({ ...userSettings, equipment: on ? ownedEquipment.filter(x => x !== eq) : [...ownedEquipment, eq] })} className={`min-h-[44px] rounded-xl border text-xs font-bold ${on ? 'bg-th-accent border-th-accent text-th-on-accent' : 'bg-th-bg border-th-line text-th-muted'}`}>{on ? '✓ ' : ''}{eq}</button>); })}
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-th-line space-y-2">
                                        <div className="text-xs font-bold text-white">Backup</div>
                                        <p className="text-[11px] text-th-muted">Data is stored only in this browser on this device (no cloud sync). Export a backup to keep it safe.{userSettings.lastBackupAt ? ` Last backup: ${userSettings.lastBackupAt.split('T')[0]}.` : ' You have not exported a backup yet.'}</p>
                                        <p className="text-[11px] text-th-muted">Browser storage protection: {storagePersisted === true ? 'granted — the browser will not clear this data automatically.' : 'not guaranteed. On iPhone, add the app to your Home Screen (Share → Add to Home Screen) for the best protection, and keep backups.'}</p>
                                        <div className="flex gap-2">
                                            <button onClick={exportBackup} className="flex-1 min-h-[44px] rounded-xl bg-th-accent text-th-on-accent text-xs font-bold">Export backup</button>
                                            <button onClick={() => importInputRef.current && importInputRef.current.click()} className="flex-1 min-h-[44px] rounded-xl bg-th-elevated border border-th-line text-white text-xs font-bold">Restore backup</button>
                                            <input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={e => { importBackup(e.target.files[0]); e.target.value = ''; }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>

                    {/* IPHONE BOTTOM TAB BAR (Thumb friendly navigation) */}
                    <div className="fixed bottom-0 left-0 right-0 z-40">
                    {activeSession && !workoutOpen && (
                        <button onClick={() => setWorkoutOpen(true)} aria-label="Return to active workout" className="w-full flex items-center justify-between gap-3 px-4 min-h-[48px] bg-th-accent text-th-on-accent text-left">
                            <span className="flex items-center gap-2 min-w-0">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0"></span>
                                <span className="text-xs font-black truncate">{activeSession.workoutName}</span>
                            </span>
                            <span className="flex items-center gap-3 shrink-0 text-xs tabular-nums font-bold">
                                <span>{Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')}</span>
                                {timerRunning && <span className="px-1.5 py-0.5 rounded bg-white/20">Rest {fmtClock(timerSeconds)}</span>}
                                <span>Resume ›</span>
                            </span>
                        </button>
                    )}
                    <nav aria-label="Bottom Navigation" className="bg-th-bg2/95 backdrop-blur-xl border-t border-th-line px-2 py-1.5 flex items-center justify-around safe-bottom">
                        {[
                            { id: 'Home', label: 'Home', icon: 'home' },
                            { id: 'History', label: 'History', icon: 'history' },
                            { id: 'Program', label: 'Program', icon: 'layers' },
                            { id: 'Calendar', label: 'Calendar', icon: 'calendar' },
                            { id: 'Progress', label: 'Progress', icon: 'bar-chart-3' }
                        ].map(item => {
                            const isActive = activeNav === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveNav(item.id)}
                                    className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all cursor-pointer ${
                                        isActive ? 'text-th-accent' : 'text-th-muted hover:text-white'
                                    }`}
                                >
                                    <Icon name={item.icon} className="w-5 h-5" />
                                    <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                    </div>

                    {confirmDiscard && (
                        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
                            <div className="bg-th-card border border-th-line rounded-xl max-w-sm w-full p-4 space-y-4">
                                <h3 className="text-sm font-bold text-white">Discard this workout?</h3>
                                <p className="text-xs text-th-muted">All sets logged in this session will be lost. Nothing will be saved to your history.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setConfirmDiscard(false)} className="flex-1 min-h-[44px] rounded-xl bg-th-elevated text-white text-xs font-bold">Keep Workout</button>
                                    <button onClick={() => { setActiveSession(null); setWorkoutOpen(false); setRestEndsAt(null); setConfirmDiscard(false); }} className="flex-1 min-h-[44px] rounded-xl bg-[#F43F5E] text-white text-xs font-black">Discard</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {startSheetId && library.programs[startSheetId] && <StartProgramSheet program={library.programs[startSheetId]} owned={ownedEquipment} onCancel={() => setStartSheetId(null)} onConfirm={(cfg) => activateProgram(startSheetId, cfg)} />}
                    {subModalIdx !== null && activeSession && activeSession.exercises[subModalIdx] && (
                        <SubstituteModal item={activeSession.exercises[subModalIdx]} library={exercises} onClose={() => setSubModalIdx(null)}
                            onPick={(sub) => setSubstitution(subModalIdx, sub)} onRestore={() => setSubstitution(subModalIdx, null)} />
                    )}
                    {confirmDialog && (
                        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
                            <div className="bg-th-card border border-th-line rounded-xl max-w-sm w-full p-4 space-y-4">
                                <h3 className="text-sm font-bold text-white">{confirmDialog.title}</h3>
                                <p className="text-xs text-th-muted">{confirmDialog.body}</p>
                                <div className={confirmDialog.secondaryLabel ? 'flex flex-col gap-2' : 'flex gap-2'}>
                                    {confirmDialog.secondaryLabel && <button onClick={() => { const fn = confirmDialog.onSecondary; setConfirmDialog(null); fn(); }} className="min-h-[44px] rounded-xl bg-th-elevated border border-th-line text-white text-xs font-bold">{confirmDialog.secondaryLabel}</button>}
                                    <button onClick={() => setConfirmDialog(null)} className="flex-1 min-h-[44px] rounded-xl bg-th-elevated text-white text-xs font-bold">Cancel</button>
                                    <button onClick={() => { const fn = confirmDialog.onConfirm; setConfirmDialog(null); fn(); }} className={`flex-1 min-h-[44px] rounded-xl text-xs font-black ${confirmDialog.danger ? 'bg-[#F43F5E] text-white' : 'bg-th-accent text-th-on-accent'}`}>{confirmDialog.confirmLabel}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODALS */}
                    {toast && (
                        <div className="fixed bottom-20 left-4 right-4 z-50 bg-th-card border border-th-accent text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-th-accent animate-ping"></div>
                            <div>
                                <div className="text-xs font-bold">{toast.title}</div>
                                <div className="text-[10px] text-th-muted">{toast.message}</div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        applyTheme(resolveTheme(STORED.selectedTheme)); // before first render, so there is no colour flash
        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    
