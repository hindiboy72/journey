// ==================== MODULE: Sound Engine ====================
const SoundEngine = {
    ctx: null,
    muted: false,

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.muted = localStorage.getItem('jeeRpgMuted') === 'true';
            this.updateMuteButton();
        } catch(e) { this.ctx = null; }
    },

    play(type) {
        if (this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0.15, now);
        switch(type) {
            case 'levelup': osc.type = 'square'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(800, now + 0.2); gain.gain.linearRampToValueAtTime(0, now + 0.3); osc.start(now); osc.stop(now + 0.3); break;
            case 'critical': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(600, now + 0.1); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.25); osc.start(now); osc.stop(now + 0.25); break;
            case 'quest': osc.type = 'sine'; osc.frequency.setValueAtTime(523, now); osc.frequency.setValueAtTime(659, now + 0.1); osc.frequency.setValueAtTime(784, now + 0.2); gain.gain.linearRampToValueAtTime(0, now + 0.4); osc.start(now); osc.stop(now + 0.4); break;
            case 'badge': osc.type = 'triangle'; osc.frequency.setValueAtTime(600, now); osc.frequency.linearRampToValueAtTime(1200, now + 0.15); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.35); osc.start(now); osc.stop(now + 0.35); break;
            case 'purchase': osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(550, now + 0.08); gain.gain.linearRampToValueAtTime(0, now + 0.2); osc.start(now); osc.stop(now + 0.2); break;
            case 'ping': osc.type = 'sine'; osc.frequency.setValueAtTime(880, now); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.15); osc.start(now); osc.stop(now + 0.15); break;
            default: osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); gain.gain.linearRampToValueAtTime(0, now + 0.15); osc.start(now); osc.stop(now + 0.15);
        }
    },

    toggle() {
        this.muted = !this.muted;
        localStorage.setItem('jeeRpgMuted', this.muted);
        this.updateMuteButton();
        UIRenderer.showToast(this.muted ? 'Sound muted 🔇' : 'Sound enabled 🔊', '🔊');
    },

    updateMuteButton() {
        const btn = document.getElementById('btnMuteToggle');
        if (!btn) return;
        btn.textContent = this.muted ? '🔇' : '🔊';
        if (this.muted) btn.classList.add('muted'); else btn.classList.remove('muted');
    }
};

// ==================== MODULE: Confetti Engine ====================
const ConfettiEngine = {
    canvas: null, ctx: null, particles: [], animating: false, animationId: null,

    init() { this.canvas = document.getElementById('confettiCanvas'); if (this.canvas) this.ctx = this.canvas.getContext('2d'); },

    fire() {
        if (!this.canvas || !this.ctx) return;
        this.canvas.style.display = 'block';
        this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight;
        this.particles = [];
        const colors = ['#f0c040','#ffb830','#c070f0','#4ac0e0','#55c070','#e05555','#ff9800','#e91e63'];
        for (let i = 0; i < 120; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height * 0.3,
                vx: (Math.random() - 0.5) * 12, vy: Math.random() * 8 + 4,
                size: Math.random() * 8 + 4, color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360, rotationSpeed: (Math.random() - 0.5) * 15,
                opacity: 1, gravity: 0.08 + Math.random() * 0.06
            });
        }
        this.animating = true; this.animate();
        setTimeout(() => { this.animating = false; if (this.canvas) this.canvas.style.display = 'none'; }, 3500);
    },

    animate() {
        if (!this.ctx || !this.canvas || !this.animating) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let active = false;
        this.particles.forEach(p => {
            p.x += p.vx; p.vy += p.gravity; p.y += p.vy;
            p.vx *= 0.99; p.rotation += p.rotationSpeed; p.opacity -= 0.004;
            if (p.opacity <= 0 || p.y > this.canvas.height + 20) return;
            active = true;
            this.ctx.save(); this.ctx.globalAlpha = p.opacity;
            this.ctx.translate(p.x, p.y); this.ctx.rotate(p.rotation * Math.PI / 180);
            this.ctx.fillStyle = p.color; this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            this.ctx.restore();
        });
        if (active) this.animationId = requestAnimationFrame(() => this.animate());
        else { this.animating = false; if (this.canvas) this.canvas.style.display = 'none'; }
    }
};

// ==================== MODULE: Theme Manager ====================
const ThemeManager = {
    themes: ['midnight-rpg','cyber-blue','emerald','crimson','light'],
    themeNames: {'midnight-rpg':'Midnight RPG','cyber-blue':'Cyber Blue','emerald':'Emerald','crimson':'Crimson','light':'Light Mode'},
    themeIcons: {'midnight-rpg':'🌙','cyber-blue':'💠','emerald':'🍀','crimson':'🔴','light':'☀️'},
    current: 'midnight-rpg',

    init() {
        const saved = localStorage.getItem('jeeRpgTheme');
        if (saved && this.themes.includes(saved)) this.current = saved;
        this.apply(); this.renderSwitcher();
    },

    apply() { document.body.setAttribute('data-theme', this.current); localStorage.setItem('jeeRpgTheme', this.current); },

    setTheme(theme) {
        if (!this.themes.includes(theme)) return;
        this.current = theme; this.apply(); this.renderSwitcher();
        UIRenderer.showToast(`Theme: ${this.themeNames[theme]} ${this.themeIcons[theme]}`, '🎨');
    },

    renderSwitcher() {
        const container = document.getElementById('themeSwitcherDropdown');
        if (!container) return;
        container.innerHTML = this.themes.map(t => `
            <button class="theme-option ${t===this.current?'active':''}" data-theme="${t}">
                <span class="theme-dot theme-${t}"></span>${this.themeIcons[t]} ${this.themeNames[t]}${t===this.current?' ✓':''}
            </button>`).join('');
        const btn = document.getElementById('themeToggleBtn');
        if (btn) btn.innerHTML = `${this.themeIcons[this.current]} Theme`;
    }
};

// ==================== MODULE: State Manager ====================
const SUBJECT_LEVEL_THRESHOLDS = [0,100,250,500,1000,2000,4000,7000,12000,20000,35000];
const SUBJECT_NAMES = {physics:'Physics',chemistry:'Chemistry',math:'Math'};
const SUBJECT_ICONS = {physics:'⚛️',chemistry:'🧪',math:'📐'};
const SUBJECT_COLORS = {physics:'#60a5fa',chemistry:'#f472b6',math:'#34d399'};

const DEFAULT_STATE = {
    gems:20,stars:50,xp:0,reputation:0,streak:0,maxStreak:0,lastCheckInDate:null,freezeTokens:0,
    totalStudyHours:0,questionsSolved:0,chaptersCompleted:0,pyqsSolved:0,mockTestsGiven:0,
    chaptersRevised:0,starsEarned:0,theoryLectures:0,notesCompleted:0,revisionsDone:0,
    dppCompleted:0,pyqSetsDone:0,testsAboveTarget:0,scoreImproved:0,sillyMistakesReduced:0,
    mockTestOver100:0,unlockedAchievements:[],unlockedBadges:[],unlockedStreakBadges:[],
    completedQuestIds:[],questProgress:{},purchasedItems:[],dailyStudyHours:{},
    prestigeLevel:0,prestigeBonuses:{xpBonus:0,starDiscount:0},studyHistory:{},examDate:'2027-01-10',
    subjectXP:{physics:0,chemistry:0,math:0},subjectLevels:{physics:1,chemistry:1,math:1},
    subjectStudyHours:{physics:0,chemistry:0,math:0},subjectQuestions:{physics:0,chemistry:0,math:0},
    sessionHistory:[],backlogItems:[],dailyReflections:{},comboSubject:null,comboCount:0,
    criticalHits:0,weeklyReports:[],lastWeeklyReportDate:null,pomodoroCompleted:0,totalFocusMinutes:0,
    spacedRepItems:[],partnerCode:null,partnerData:null
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let EXAM_DATE = new Date('2027-01-10T00:00:00');

const StateManager = {
    load() {
        try {
            const saved = localStorage.getItem('jeeRpgState');
            if (saved) {
                const parsed = JSON.parse(saved);
                state = {...JSON.parse(JSON.stringify(DEFAULT_STATE)), ...parsed};
                if (!state.spacedRepItems) state.spacedRepItems = [];
                if (!state.partnerCode) state.partnerCode = null;
                if (!state.partnerData) state.partnerData = null;
                if (!state.subjectXP) state.subjectXP = {physics:0,chemistry:0,math:0};
                if (!state.subjectLevels) state.subjectLevels = {physics:1,chemistry:1,math:1};
                if (!state.subjectStudyHours) state.subjectStudyHours = {physics:0,chemistry:0,math:0};
                if (!state.subjectQuestions) state.subjectQuestions = {physics:0,chemistry:0,math:0};
                if (!state.sessionHistory) state.sessionHistory = [];
                if (!state.backlogItems) state.backlogItems = [];
                if (!state.dailyReflections) state.dailyReflections = {};
                if (!state.reputation) state.reputation = 0;
                if (!state.criticalHits) state.criticalHits = 0;
                if (!state.weeklyReports) state.weeklyReports = [];
                if (!state.pomodoroCompleted) state.pomodoroCompleted = 0;
                if (!state.totalFocusMinutes) state.totalFocusMinutes = 0;
                if (state.examDate) EXAM_DATE = new Date(state.examDate+'T00:00:00');
            }
        } catch(e) { console.error('Failed to load state:', e); }
    },

    save() {
        try {
            state.examDate = EXAM_DATE.toISOString().split('T')[0];
            localStorage.setItem('jeeRpgState', JSON.stringify(state));
            UIRenderer.updateStorageSize();
        } catch(e) { console.error('Failed to save:', e); UIRenderer.showToast('Save failed! Storage may be full.', '⚠️'); }
    },

    getTodayKey() { return new Date().toISOString().split('T')[0]; },

    getDaysUntilExam() {
        const diff = EXAM_DATE.getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / 86400000));
    },

    getSubjectLevel(xp) {
        for (let i = SUBJECT_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (xp >= SUBJECT_LEVEL_THRESHOLDS[i]) return i + 1;
        }
        return 1;
    },

    getSubjectLevelXP(level) { return SUBJECT_LEVEL_THRESHOLDS[Math.min(level, SUBJECT_LEVEL_THRESHOLDS.length - 1)] || 0; },

    addSubjectXP(subject, amount) {
        if (!state.subjectXP[subject]) state.subjectXP[subject] = 0;
        state.subjectXP[subject] += amount;
        const newLevel = this.getSubjectLevel(state.subjectXP[subject]);
        const oldLevel = state.subjectLevels[subject] || 1;
        if (newLevel > oldLevel) {
            state.subjectLevels[subject] = newLevel;
            state.gems += newLevel * 3; state.xp += newLevel * 25;
            SoundEngine.play('levelup');
            UIRenderer.showToast(`${SUBJECT_ICONS[subject]} ${SUBJECT_NAMES[subject]} Level Up! Lv${newLevel}! +${newLevel*3}💎`, '⬆️');
        } else state.subjectLevels[subject] = newLevel;
        if (!state.subjectStudyHours[subject]) state.subjectStudyHours[subject] = 0;
    },

    addReputation(amount) { state.reputation += amount; },

    rollCriticalHit() { return Math.random() < (0.12 + (state.comboCount > 3 ? 0.05 : 0)); }
};

// ==================== PHASES ====================
const PHASES = [
    { id:1, name:'Foundation Recovery', daysRemaining:150, cssClass:'phase-1', icon:'🏗️' },
    { id:2, name:'Question Domination', daysRemaining:60, cssClass:'phase-2', icon:'⚔️' },
    { id:3, name:'Exam Mode', daysRemaining:0, cssClass:'phase-3', icon:'🔥' },
];
function getCurrentPhase() {
    const days = StateManager.getDaysUntilExam();
    if (days > 150) return PHASES[0];
    if (days > 60) return PHASES[1];
    return PHASES[2];
}

// ==================== MODULE: Quest Engine ====================
const QuestEngine = {
    getPhaseQuests() {
        const phase = getCurrentPhase(); let daily=[], weekly=[], boss=[];
        if (phase.id === 1) {
            daily = [
                {id:'p1_daily_theory',name:'Theory Foundation',desc:'Study theory for 2 weak topics',icon:'📖',target:2,unit:'topics',progressKey:'p1_theory_topics',difficulty:'medium',rewardGems:3,rewardStars:10,rewardXp:30,type:'daily'},
                {id:'p1_daily_backlog',name:'Backlog Slayer',desc:'Complete 1 pending chapter',icon:'📚',target:1,unit:'chapters',progressKey:'p1_backlog_chapters',difficulty:'hard',rewardGems:8,rewardStars:25,rewardXp:60,type:'daily'},
                {id:'p1_daily_questions',name:'Concept Check',desc:'Solve 20 basic questions',icon:'✏️',target:20,unit:'questions',progressKey:'p1_basic_questions',difficulty:'easy',rewardGems:2,rewardStars:8,rewardXp:15,type:'daily'},
                {id:'p1_ncert_theory',name:'NCERT Theory Master',desc:'Complete NCERT theory of one chapter',icon:'📘',target:1,unit:'chapters',progressKey:'p1_ncert_theory',difficulty:'medium',rewardGems:5,rewardStars:12,rewardXp:25,type:'daily'},
                {id:'p1_short_notes',name:'Concise Notes',desc:'Make short notes for one chapter',icon:'📝',target:1,unit:'chapters',progressKey:'p1_short_notes',difficulty:'medium',rewardGems:4,rewardStars:10,rewardXp:20,type:'daily'},
                {id:'p1_doubt_session',name:'Doubt Destroyer',desc:'Attend a live doubt session',icon:'💬',target:1,unit:'session',progressKey:'p1_doubt_session',difficulty:'easy',rewardGems:3,rewardStars:8,rewardXp:15,type:'daily'},
            ];
            weekly = [
                {id:'p1_weekly_chapter',name:'Chapter Completion',desc:'Finish 2 full chapters',icon:'📚',target:2,unit:'chapters',progressKey:'p1_weekly_chapters',difficulty:'hard',rewardGems:10,rewardStars:40,rewardXp:80,type:'weekly'},
                {id:'p1_weekly_notes',name:'Note Compilation',desc:'Create revision notes for 3 chapters',icon:'📝',target:3,unit:'chapters',progressKey:'p1_weekly_notes',difficulty:'medium',rewardGems:5,rewardStars:20,rewardXp:40,type:'weekly'},
                {id:'p1_exemplar_set',name:'Exemplar Expert',desc:'Solve one full Exemplar set',icon:'📐',target:1,unit:'set',progressKey:'p1_exemplar_set',difficulty:'hard',rewardGems:12,rewardStars:35,rewardXp:70,type:'weekly'},
            ];
            boss = [
                {id:'p1_boss_backlog',name:'Backlog Exterminator',desc:'Clear ENTIRE backlog of one subject',icon:'🐉',target:1,unit:'subject',progressKey:'p1_boss_subject',difficulty:'boss',rewardGems:25,rewardStars:80,rewardXp:150,type:'boss',oneTime:true},
            ];
        } else if (phase.id === 2) {
            daily = [
                {id:'p2_daily_pyq',name:'PYQ Hunter',desc:'Solve 15 PYQs',icon:'📜',target:15,unit:'pyqs',progressKey:'p2_pyq_daily',difficulty:'medium',rewardGems:4,rewardStars:15,rewardXp:35,type:'daily'},
                {id:'p2_daily_mixed',name:'Mixed Practice',desc:'Solve 25 mixed questions',icon:'🧩',target:25,unit:'questions',progressKey:'p2_mixed_questions',difficulty:'medium',rewardGems:4,rewardStars:15,rewardXp:35,type:'daily'},
                {id:'p2_daily_timed',name:'Timed Sprint',desc:'Solve 10 questions in 15 min',icon:'⏱️',target:10,unit:'questions',progressKey:'p2_timed_questions',difficulty:'hard',rewardGems:6,rewardStars:20,rewardXp:50,type:'daily'},
                {id:'p2_advanced_prob',name:'Advanced Problem Solver',desc:'Solve 30 advanced problems',icon:'⚡',target:30,unit:'problems',progressKey:'p2_advanced_prob',difficulty:'hard',rewardGems:8,rewardStars:25,rewardXp:55,type:'daily'},
                {id:'p2_error_analysis',name:'Error Analyst',desc:'Analyse 5 past mistakes',icon:'🔍',target:5,unit:'errors',progressKey:'p2_error_analysis',difficulty:'medium',rewardGems:5,rewardStars:18,rewardXp:40,type:'daily'},
                {id:'p2_formula_rev',name:'Formula Flash',desc:'Revise formulas from 3 chapters',icon:'⚙️',target:3,unit:'chapters',progressKey:'p2_formula_rev',difficulty:'easy',rewardGems:3,rewardStars:12,rewardXp:25,type:'daily'},
                {id:'p2_hots',name:'HOTS Hunter',desc:'Solve 2 HOTS problems',icon:'🔥',target:2,unit:'problems',progressKey:'p2_hots',difficulty:'hard',rewardGems:7,rewardStars:20,rewardXp:45,type:'daily'},
            ];
            weekly = [
                {id:'p2_weekly_pyq_set',name:'PYQ Set Complete',desc:'Complete full PYQ set of one chapter',icon:'📜',target:1,unit:'chapter_pyqs',progressKey:'p2_weekly_pyq',difficulty:'hard',rewardGems:10,rewardStars:35,rewardXp:75,type:'weekly'},
                {id:'p2_weekly_accuracy',name:'Accuracy Master',desc:'Maintain 85%+ accuracy on 100 Qs',icon:'🎯',target:85,unit:'percent',progressKey:'p2_weekly_accuracy',difficulty:'hard',rewardGems:8,rewardStars:30,rewardXp:65,type:'weekly'},
                {id:'p2_chapter_test',name:'Chapter Test Champion',desc:'Finish one full-length chapter test',icon:'📝',target:1,unit:'test',progressKey:'p2_chapter_test',difficulty:'hard',rewardGems:12,rewardStars:40,rewardXp:85,type:'weekly'},
            ];
            boss = [
                {id:'p2_boss_pyq_500',name:'500 PYQs Milestone',desc:'Complete 500 PYQs total',icon:'🐉',target:500,unit:'pyqs',progressKey:'p2_boss_pyq_total',difficulty:'boss',rewardGems:20,rewardStars:70,rewardXp:130,type:'boss',oneTime:true},
            ];
        } else {
            daily = [
                {id:'p3_daily_revision',name:'Revision Cycle',desc:'Revise 2 chapters completely',icon:'🔄',target:2,unit:'chapters',progressKey:'p3_revision_chapters',difficulty:'medium',rewardGems:5,rewardStars:18,rewardXp:40,type:'daily'},
                {id:'p3_daily_error',name:'Error Notebook',desc:'Review and solve 5 past errors',icon:'📕',target:5,unit:'errors',progressKey:'p3_errors_reviewed',difficulty:'medium',rewardGems:4,rewardStars:15,rewardXp:35,type:'daily'},
                {id:'p3_daily_formula',name:'Formula Flash',desc:'Revise all formulas from 3 chapters',icon:'⚡',target:3,unit:'chapters',progressKey:'p3_formula_chapters',difficulty:'easy',rewardGems:2,rewardStars:8,rewardXp:20,type:'daily'},
                {id:'p3_time_drill',name:'Time Management Drill',desc:'Complete 3 timed section drills',icon:'⏳',target:3,unit:'sections',progressKey:'p3_time_drill',difficulty:'hard',rewardGems:8,rewardStars:25,rewardXp:55,type:'daily'},
            ];
            weekly = [
                {id:'p3_weekly_mock',name:'Mock Test Warrior',desc:'Give 2 full mock tests',icon:'📝',target:2,unit:'mock_tests',progressKey:'p3_weekly_mocks',difficulty:'hard',rewardGems:12,rewardStars:40,rewardXp:90,type:'weekly'},
                {id:'p3_weekly_analysis',name:'Post-Mortem Pro',desc:'Analyze mock test errors thoroughly',icon:'🔍',target:1,unit:'analysis',progressKey:'p3_weekly_analysis',difficulty:'medium',rewardGems:5,rewardStars:20,rewardXp:40,type:'weekly'},
                {id:'p3_mock_analysis',name:'Mock Analysis Master',desc:'Deep analysis of one full mock test',icon:'📊',target:1,unit:'analysis',progressKey:'p3_mock_analysis',difficulty:'medium',rewardGems:6,rewardStars:25,rewardXp:50,type:'weekly'},
                {id:'p3_physics_rev',name:'Physics Unit Revision',desc:'Revise entire Physics – 1 Unit',icon:'⚛️',target:1,unit:'unit',progressKey:'p3_physics_rev',difficulty:'hard',rewardGems:10,rewardStars:35,rewardXp:80,type:'weekly'},
                {id:'p3_chemistry_rev',name:'Chemistry Unit Revision',desc:'Revise entire Chemistry – 1 Unit',icon:'🧪',target:1,unit:'unit',progressKey:'p3_chemistry_rev',difficulty:'hard',rewardGems:10,rewardStars:35,rewardXp:80,type:'weekly'},
                {id:'p3_maths_rev',name:'Maths Unit Revision',desc:'Revise entire Maths – 1 Unit',icon:'📐',target:1,unit:'unit',progressKey:'p3_maths_rev',difficulty:'hard',rewardGems:10,rewardStars:35,rewardXp:80,type:'weekly'},
            ];
            boss = [
                {id:'p3_boss_rank',name:'Top Rank Simulation',desc:'Score 200+ in mock test',icon:'👾',target:200,unit:'marks',progressKey:'p3_boss_marks',difficulty:'boss',rewardGems:25,rewardStars:90,rewardXp:180,type:'boss'},
                {id:'p3_boss_full_syllabus',name:'Full Syllabus Revision',desc:'Complete one full syllabus revision',icon:'🐉',target:1,unit:'full_revision',progressKey:'p3_boss_revision',difficulty:'boss',rewardGems:30,rewardStars:100,rewardXp:200,type:'boss',oneTime:true},
            ];
        }
        return {daily, weekly, boss};
    },

    getRecoveryQuests() {
        return [
            {id:'recovery_low_day',name:'Phoenix Rise',desc:'Study 2 hours after a 0-hour day',icon:'🦅',target:2,unit:'hours',progressKey:'recovery_phoenix',difficulty:'medium',rewardGems:5,rewardStars:20,rewardXp:40,type:'recovery'},
            {id:'recovery_weak_topic',name:'Weakness Warrior',desc:'Spend 4 hours on weakest topic',icon:'💪',target:4,unit:'hours',progressKey:'recovery_weakness',difficulty:'hard',rewardGems:10,rewardStars:30,rewardXp:65,type:'recovery'},
            {id:'recovery_backlog_sprint',name:'Backlog Blitz',desc:'Complete 3 pending tasks in one day',icon:'⚡',target:3,unit:'tasks',progressKey:'recovery_blitz',difficulty:'hard',rewardGems:8,rewardStars:25,rewardXp:55,type:'recovery'},
            {id:'recovery_early_wake',name:'Early Riser',desc:'Wake up early for 5 days streak',icon:'🌅',target:5,unit:'days',progressKey:'recovery_early_wake',difficulty:'medium',rewardGems:8,rewardStars:30,rewardXp:60,type:'recovery'},
            {id:'recovery_no_distraction',name:'Zero Distraction Day',desc:'Phone away & focused study for whole day',icon:'🚫',target:1,unit:'day',progressKey:'recovery_no_distraction',difficulty:'hard',rewardGems:12,rewardStars:40,rewardXp:80,type:'recovery'},
            {id:'recovery_backlog_x2',name:'Backlog Overdrive',desc:'Complete 2x backlog tasks (6 total)',icon:'⚡',target:6,unit:'tasks',progressKey:'recovery_backlog_x2',difficulty:'hard',rewardGems:15,rewardStars:50,rewardXp:100,type:'recovery'},
        ];
    },

    getAllQuests() {
        const phase = this.getPhaseQuests();
        return [...phase.daily, ...phase.weekly, ...phase.boss, ...this.getRecoveryQuests()];
    },

    addProgress(progressKey, questId, target, rewardGems, rewardStars, rewardXp) {
        if (state.completedQuestIds.includes(questId)) return;
        if (!state.questProgress[progressKey]) state.questProgress[progressKey] = 0;
        state.questProgress[progressKey] += 1;
        let completedNow = false;
        if (state.questProgress[progressKey] >= target) {
            state.questProgress[progressKey] = target;
            state.completedQuestIds.push(questId);
            state.gems += rewardGems; state.stars += rewardStars; state.starsEarned += rewardStars;
            const bonusXP = Math.floor(rewardXp * state.prestigeBonuses.xpBonus / 100);
            state.xp += rewardXp + bonusXP; state.reputation += Math.floor(rewardXp / 5);
            SoundEngine.play('quest');
            UIRenderer.showToast(`Quest Complete! +${rewardGems}💎 +${rewardStars}⭐ +${rewardXp}XP`, '✅');
            completedNow = true;
        } else {
            UIRenderer.showToast(`Progress: ${state.questProgress[progressKey]}/${target}`, '📋');
        }
        StateManager.save(); UIRenderer.refreshAll();
        if (completedNow) AchievementSystem.checkAll();
    },
};

// ==================== MODULE: Achievement System ====================
const ACHIEVEMENTS = {
    study: [
        {id:'theory_complete',name:'Theory Warrior',desc:'Completed full theory lecture',reward:2,icon:'📖',condition:'theoryLectures',target:1},
        {id:'notes_done',name:'Note Ninja',desc:'Finished chapter notes',reward:2,icon:'📝',condition:'notesCompleted',target:1},
        {id:'revision_done',name:'Revision Master',desc:'Completed chapter revision',reward:5,icon:'🔄',condition:'revisionsDone',target:1},
        {id:'dpp_complete',name:'DPP Dominator',desc:'Completed one full DPP',reward:3,icon:'📋',condition:'dppCompleted',target:1},
        {id:'pyq_set_done',name:'PYQ Pro',desc:'Completed one PYQ set',reward:5,icon:'📜',condition:'pyqSetsDone',target:1},
        {id:'questions_100',name:'Century Club',desc:'Solved 100 questions',reward:10,icon:'💯',condition:'questionsSolved',target:100},
    ],
    test: [
        {id:'above_target',name:'Target Crusher',desc:'Scored above target',reward:10,icon:'🎯',condition:'testsAboveTarget',target:1},
        {id:'score_improved',name:'Rising Star',desc:'Improved test score by 10%+',reward:5,icon:'📈',condition:'scoreImproved',target:1},
        {id:'silly_mistakes_reduced',name:'Careful Calculator',desc:'Reduced silly mistakes by 50%',reward:20,icon:'🧮',condition:'sillyMistakesReduced',target:1},
        {id:'mock_test_100',name:'Mock Test Warrior',desc:'Scored 100+ in mock test',reward:15,icon:'⚔️',condition:'mockTestOver100',target:1},
    ],
    milestone: [
        {id:'hours_100',name:'Dedicated Scholar',desc:'100 study hours completed',reward:20,icon:'⏰',condition:'totalStudyHours',target:100},
        {id:'hours_500',name:'Elite Aspirant',desc:'500 study hours completed',reward:50,icon:'⚡',condition:'totalStudyHours',target:500},
        {id:'questions_1000',name:'Problem Solving Legend',desc:'1000 questions solved',reward:30,icon:'🧠',condition:'questionsSolved',target:1000},
        {id:'chapters_10',name:'Chapter Conqueror',desc:'10 chapters completed',reward:15,icon:'📚',condition:'chaptersCompleted',target:10},
        {id:'reputation_100',name:'Respected Scholar',desc:'Earned 100 reputation',reward:25,icon:'🏅',condition:'reputation',target:100},
    ],
};

const BADGES = [
    {id:'first_chapter',name:'First Chapter Cleared',icon:'📖',condition:'chaptersCompleted',target:1,category:'progress'},
    {id:'chapter_master_5',name:'Chapter Collector',icon:'📚',condition:'chaptersCompleted',target:5,category:'progress'},
    {id:'chapter_master_15',name:'Syllabus Conqueror',icon:'🏆',condition:'chaptersCompleted',target:15,category:'progress'},
    {id:'hours_100_badge',name:'Century Hours',icon:'⏰',condition:'totalStudyHours',target:100,category:'hours'},
    {id:'hours_500_badge',name:'Dedication Demon',icon:'⚡',condition:'totalStudyHours',target:500,category:'hours'},
    {id:'hours_1000_badge',name:'Immortal Scholar',icon:'👑',condition:'totalStudyHours',target:1000,category:'hours'},
    {id:'questions_1000_badge',name:'Problem Solver',icon:'✏️',condition:'questionsSolved',target:1000,category:'questions'},
    {id:'pyq_100',name:'PYQ Pioneer',icon:'📜',condition:'pyqsSolved',target:100,category:'questions'},
    {id:'mock_test_10',name:'Mock Test Warrior',icon:'⚔️',condition:'mockTestsGiven',target:10,category:'questions'},
    {id:'revision_master',name:'Revision Master',icon:'🔄',condition:'chaptersRevised',target:30,category:'skill'},
    {id:'streak_legend',name:'Streak Legend',icon:'🔥',condition:'maxStreak',target:100,category:'skill'},
    {id:'economy_master',name:'Economy Master',icon:'💰',condition:'starsEarned',target:1000,category:'skill'},
    {id:'combo_10',name:'Combo King',icon:'🔗',condition:'comboCount',target:10,category:'skill'},
    {id:'critical_5',name:'Lucky Striker',icon:'🎯',condition:'criticalHits',target:5,category:'skill'},
];

const STREAK_BADGES = [
    {days:7,name:'Weekly Warrior',icon:'🔥',gemReward:10,starReward:50},
    {days:30,name:'Monthly Master',icon:'⚡',gemReward:30,starReward:150,title:'Consistent'},
    {days:60,name:'Two-Month Titan',icon:'💪',gemReward:60,starReward:300},
    {days:100,name:'Century Champion',icon:'👑',gemReward:100,starReward:500,title:'Unshakable'},
    {days:200,name:'Legend of Consistency',icon:'🏅',gemReward:200,starReward:1000},
    {days:365,name:'Eternal Scholar',icon:'🌟',gemReward:500,starReward:2500,title:'The Eternal'},
];

const PRODUCTIVITY_RANKS = [
    {name:'Bronze Scholar',icon:'🥉',xpRequired:1000,benefits:'Basic themes unlocked',color:'#cd7f32'},
    {name:'Silver Scholar',icon:'🥈',xpRequired:5000,benefits:'Quest priority + 1 freeze token/week',color:'#c0c0c0'},
    {name:'Gold Scholar',icon:'🥇',xpRequired:15000,benefits:'Custom quest creation + 2 freeze tokens/week',color:'#ffd700'},
    {name:'Platinum Pro',icon:'💠',xpRequired:35000,benefits:'AI study plan + Priority support',color:'#e0e0ff'},
    {name:'Diamond Legend',icon:'💎',xpRequired:70000,benefits:'All features unlocked + Mentor mode',color:'#b0f0ff'},
];

const AchievementSystem = {
    checkAll() {
        let newUnlocks = false;
        [...ACHIEVEMENTS.study, ...ACHIEVEMENTS.test, ...ACHIEVEMENTS.milestone].forEach(a => {
            if (state.unlockedAchievements.includes(a.id)) return;
            const val = state[a.condition] || 0;
            if (val >= a.target) {
                state.unlockedAchievements.push(a.id);
                state.gems += a.reward; state.xp += a.reward * 3; state.reputation += a.reward;
                UIRenderer.showToast(`Achievement: ${a.icon} ${a.name}! +${a.reward}💎`, '🏆');
                newUnlocks = true;
            }
        });
        BADGES.forEach(b => {
            if (state.unlockedBadges.includes(b.id)) return;
            const val = state[b.condition] || 0;
            if (val >= b.target) {
                state.unlockedBadges.push(b.id);
                state.xp += Math.min(b.target, 500); state.reputation += 5;
                SoundEngine.play('badge');
                ConfettiEngine.fire();
                UIRenderer.showBadgeUnlock(b);
                UIRenderer.showToast(`Badge Earned: ${b.icon} ${b.name}!`, '🎖️');
                newUnlocks = true;
            }
        });
        if (newUnlocks) { StateManager.save(); UIRenderer.refreshAll(); }
    },
};

// ==================== MODULE: Spaced Repetition ====================
const SpacedRepSystem = {
    intervals: [1, 3, 7, 21, 45, 90],

    scheduleFromBacklog(item) {
        const existing = state.spacedRepItems.find(s => s.backlogId === item.id);
        if (existing) return;
        const repItem = {
            id: 'sr_' + Date.now(),
            backlogId: item.id,
            name: item.name,
            subject: item.subject || 'general',
            addedDate: StateManager.getTodayKey(),
            stage: 0,
            nextReviewDate: this.getNextReviewDate(0),
            completedReviews: 0,
            totalReviews: this.intervals.length,
        };
        state.spacedRepItems.push(repItem);
        StateManager.save();
    },

    getNextReviewDate(stage) {
        const d = new Date();
        d.setDate(d.getDate() + this.intervals[Math.min(stage, this.intervals.length - 1)]);
        return d.toISOString().split('T')[0];
    },

    completeReview(itemId) {
        const item = state.spacedRepItems.find(s => s.id === itemId);
        if (!item) return;
        const today = StateManager.getTodayKey();
        item.stage++;
        item.completedReviews++;
        item.nextReviewDate = item.stage < this.intervals.length ? this.getNextReviewDate(item.stage) : null;
        state.xp += 20 + item.stage * 5;
        state.reputation += 2;
        if (item.subject && state.subjectXP[item.subject] !== undefined) {
            StateManager.addSubjectXP(item.subject, 30);
        }
        SoundEngine.play('quest');
        UIRenderer.showToast(`Spaced review complete! +${20+item.stage*5}XP`, '🧠');
        StateManager.save();
        UIRenderer.refreshAll();
    },

    getOverdueCount() {
        const today = StateManager.getTodayKey();
        return state.spacedRepItems.filter(s => s.nextReviewDate && s.nextReviewDate < today).length;
    },

    getDueTodayCount() {
        const today = StateManager.getTodayKey();
        return state.spacedRepItems.filter(s => s.nextReviewDate === today).length;
    },
};

// ==================== MODULE: Partner System (Manual Sync) ====================
const PartnerSystem = {
    generateCode() {
        if (state.partnerCode) return state.partnerCode;
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
        state.partnerCode = code;
        StateManager.save();
        return code;
    },

    exportPartnerData() {
        const today = StateManager.getTodayKey();
        const todayHours = state.dailyStudyHours[today] || 0;
        const todaySessions = state.sessionHistory.filter(s => s.date === today);
        const todayQuestions = todaySessions.reduce((sum, s) => sum + s.questions, 0);
        
        const partnerPayload = {
            version: '3.0',
            type: 'partner-progress',
            partnerCode: state.partnerCode,
            exportDate: new Date().toISOString(),
            data: {
                todayHours: Math.round(todayHours * 10) / 10,
                todayQuestions: todayQuestions,
                streak: state.streak,
            }
        };

        try {
            const blob = new Blob([JSON.stringify(partnerPayload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `partner-progress-${today}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            UIRenderer.showToast('Partner progress exported! Send this file to them. 📤', '🤝');
        } catch (e) {
            UIRenderer.showToast('Export failed. Please try again.', '⚠️');
        }
    },

    importPartnerData(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (!imported || imported.type !== 'partner-progress' || !imported.data) {
                throw new Error('Invalid partner file format.');
            }
            state.partnerData = {
                code: imported.partnerCode || 'unknown',
                lastSync: new Date().toISOString(),
                todayHours: imported.data.todayHours || 0,
                todayQuestions: imported.data.todayQuestions || 0,
                streak: imported.data.streak || 0,
            };
            StateManager.save();
            UIRenderer.refreshAll();
            UIRenderer.showToast('Partner progress updated! Compare your stats. 📊', '✅');
        } catch (e) {
            console.error('Partner import failed:', e);
            UIRenderer.showToast('Invalid partner data. Make sure you pasted the correct file.', '❌');
        }
    },

    disconnect() {
        state.partnerData = null;
        StateManager.save();
        UIRenderer.showToast('Partner disconnected.', '👋');
        UIRenderer.refreshAll();
    }
};

// ==================== MODULE: Timer ====================
const TimerManager = {
    interval: null, seconds: 0, total: 0, bonusActive: false,
    isPomodoro: false, pomodoroPhase: 'work', pomodoroCount: 0,

    start(minutes, isPomodoro = false) {
        this.stop(false);
        this.total = minutes * 60; this.seconds = this.total;
        this.bonusActive = !isPomodoro; this.isPomodoro = isPomodoro;
        this.updateDisplay();
        const stopBtn = document.getElementById('btnTimerStop');
        if (stopBtn) stopBtn.style.display = 'inline-block';
        document.querySelectorAll('.timer-preset-btn').forEach(b => b.style.display = 'none');
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = isPomodoro ? '🍅 Pomodoro work session active!' : '🔒 Focus Safe active!';
        this.interval = setInterval(() => this.tick(), 1000);
    },

    tick() {
        this.seconds--;
        this.updateDisplay();
        if (this.seconds <= 0) {
            if (this.isPomodoro && this.pomodoroPhase === 'work') this.completePomodoroWork();
            else if (this.isPomodoro && this.pomodoroPhase === 'break') this.completePomodoroBreak();
            else this.complete();
        }
    },

    completePomodoroWork() {
        clearInterval(this.interval); this.interval = null;
        this.pomodoroCount++; state.pomodoroCompleted++;
        state.totalFocusMinutes += 25;
        const bonusStars = Math.floor(25 * 0.8);
        state.stars += bonusStars; state.starsEarned += bonusStars;
        state.totalStudyHours += 25 / 60;
        const today = StateManager.getTodayKey();
        if (!state.dailyStudyHours[today]) state.dailyStudyHours[today] = 0;
        state.dailyStudyHours[today] += 25 / 60;
        state.xp += Math.floor(25 * 1.5); state.reputation += 1;
        UIRenderer.showToast(`🍅 Pomodoro #${this.pomodoroCount} complete! +${bonusStars}⭐`, '✅');
        StateManager.save(); UIRenderer.refreshAll(); AchievementSystem.checkAll();
        const isLongBreak = this.pomodoroCount % 4 === 0;
        const breakMin = isLongBreak ? 15 : 5;
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = isLongBreak ? `☕ Long break! ${breakMin} min.` : `☕ Short break! ${breakMin} min.`;
        this.startBreak(breakMin);
    },

    startBreak(minutes) {
        this.total = minutes * 60; this.seconds = this.total;
        this.pomodoroPhase = 'break'; this.bonusActive = false;
        this.updateDisplay();
        this.interval = setInterval(() => this.tickBreak(), 1000);
    },

    tickBreak() {
        this.seconds--;
        this.updateDisplay();
        if (this.seconds <= 0) this.completePomodoroBreak();
    },

    completePomodoroBreak() {
        clearInterval(this.interval); this.interval = null;
        this.seconds = 0; this.pomodoroPhase = 'work'; this.updateDisplay();
        const stopBtn = document.getElementById('btnTimerStop');
        if (stopBtn) stopBtn.style.display = 'none';
        document.querySelectorAll('.timer-preset-btn').forEach(b => b.style.display = 'inline-block');
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = '🍅 Break over! Ready for the next Pomodoro?';
        UIRenderer.showToast('☕ Break complete! Ready to focus again.', '✅');
    },

    stop(showToast = true) {
        if (this.interval) clearInterval(this.interval); this.interval = null;
        const completed = this.total - this.seconds;
        const completedMin = Math.round(completed / 60);
        if (completedMin >= 5 && this.bonusActive && !this.isPomodoro) {
            const bonusStars = Math.floor(completedMin * 1.5);
            state.stars += bonusStars; state.starsEarned += bonusStars;
            state.totalStudyHours += completedMin / 60; state.totalFocusMinutes += completedMin;
            const today = StateManager.getTodayKey();
            if (!state.dailyStudyHours[today]) state.dailyStudyHours[today] = 0;
            state.dailyStudyHours[today] += completedMin / 60;
            state.xp += Math.floor(completedMin * 1.2); state.reputation += Math.floor(completedMin / 10);
            if (showToast) UIRenderer.showToast(`Focus session complete! +${bonusStars}⭐ (1.5x bonus!)`, '🔓');
        } else if (completedMin > 0 && showToast) {
            UIRenderer.showToast('Session ended early. Partial credit earned.', '⏹️');
        }
        this.bonusActive = false; this.isPomodoro = false; this.seconds = 0; this.updateDisplay();
        const stopBtn = document.getElementById('btnTimerStop');
        if (stopBtn) stopBtn.style.display = 'none';
        document.querySelectorAll('.timer-preset-btn').forEach(b => b.style.display = 'inline-block');
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = 'Select a duration to start a focused session.';
        StateManager.save(); UIRenderer.refreshAll(); AchievementSystem.checkAll();
    },

    complete() {
        if (this.interval) clearInterval(this.interval); this.interval = null;
        const bonusStars = Math.floor((this.total / 60) * 1.5);
        state.stars += bonusStars; state.starsEarned += bonusStars;
        state.totalStudyHours += this.total / 3600; state.totalFocusMinutes += this.total / 60;
        const today = StateManager.getTodayKey();
        if (!state.dailyStudyHours[today]) state.dailyStudyHours[today] = 0;
        state.dailyStudyHours[today] += this.total / 3600;
        state.xp += Math.floor((this.total / 60) * 1.2); state.reputation += Math.floor(this.total / 600);
        SoundEngine.play('quest');
        UIRenderer.showToast(`Focus Safe complete! +${bonusStars}⭐ (1.5x bonus!) 🎉`, '🔓');
        this.bonusActive = false; this.seconds = 0; this.updateDisplay();
        const stopBtn = document.getElementById('btnTimerStop');
        if (stopBtn) stopBtn.style.display = 'none';
        document.querySelectorAll('.timer-preset-btn').forEach(b => b.style.display = 'inline-block');
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = 'Great focus session! Select another to continue.';
        StateManager.save(); UIRenderer.refreshAll(); AchievementSystem.checkAll();
    },

    updateDisplay() {
        const mins = Math.floor(Math.abs(this.seconds) / 60);
        const secs = Math.abs(this.seconds) % 60;
        const display = document.getElementById('timerDisplay');
        if (display) display.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    },
};

// ==================== MODULE: UI Renderer ====================
const UIRenderer = {
    updateHeaderStats() {
        const setSpan = (id, val) => { const el = document.querySelector(id); if (el) el.textContent = val; };
        setSpan('#headerGems span', state.gems);
        setSpan('#headerStars span', state.stars);
        setSpan('#headerStreak span', state.streak);
        setSpan('#headerXP span', state.xp);
        setSpan('#headerReputation', state.reputation);
        const shopFreeze = document.getElementById('shopFreezeInfo');
        if (shopFreeze) shopFreeze.textContent = 'Tokens: ' + state.freezeTokens;
        const freezeInfo = document.getElementById('freezeInfo');
        if (freezeInfo) freezeInfo.innerHTML = 'Freeze Tokens: <strong>' + state.freezeTokens + '</strong>';
    },

    showToast(message, icon = '🎉') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = icon + ' ' + message;
        container.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3200);
    },

    showBadgeUnlock(badge) {
        const modal = document.getElementById('badgeUnlockModal');
        const icon = document.getElementById('badgeUnlockIcon');
        const title = document.getElementById('badgeUnlockTitle');
        const desc = document.getElementById('badgeUnlockDesc');
        if (!modal || !icon || !title || !desc) return;
        icon.textContent = badge.icon;
        title.textContent = badge.name;
        desc.textContent = 'You earned this badge! Keep up the great work.';
        modal.style.display = 'flex';
        setTimeout(() => { modal.style.display = 'none'; }, 4000);
    },

    updateStorageSize() {
        const el = document.getElementById('storageSize');
        if (!el) return;
        try {
            const data = localStorage.getItem('jeeRpgState');
            if (data) { const sizeKB = (new Blob([data]).size / 1024).toFixed(1); el.textContent = sizeKB + ' KB'; }
            else el.textContent = '0 KB';
        } catch(e) { el.textContent = 'Unknown'; }
    },

    renderDashboard() {
        const days = StateManager.getDaysUntilExam();
        const cd = document.getElementById('countdownDisplay');
        if (cd) { cd.textContent = days; if (days < 30) cd.classList.add('countdown-urgent'); else cd.classList.remove('countdown-urgent'); }
        const se = document.getElementById('streakDisplay'); if (se) se.textContent = state.streak + ' 🔥';
        const the = document.getElementById('totalHoursDisplay'); if (the) the.textContent = Math.round(state.totalStudyHours * 10) / 10 + 'h';
        const qe = document.getElementById('questionsDisplay'); if (qe) qe.textContent = state.questionsSolved;
        const phase = getCurrentPhase();
        const pb = document.getElementById('phaseBadge');
        if (pb) { pb.textContent = 'Phase ' + phase.id + ': ' + phase.name; pb.className = 'phase-badge ' + phase.cssClass; }
        const today = StateManager.getTodayKey();
        const checkedIn = state.lastCheckInDate === today;
        const btn = document.getElementById('btnCheckIn');
        if (btn) { btn.textContent = checkedIn ? '✅ Checked In Today!' : '✅ Check In for Today'; btn.disabled = checkedIn; btn.style.opacity = checkedIn ? '0.6' : '1'; }
        const cm = document.getElementById('checkinMsg');
        if (cm) cm.textContent = checkedIn ? 'Great job! Come back tomorrow.' : (state.streak === 0 ? 'Start your streak today!' : 'Keep your ' + state.streak + '-day streak going!');
        this.renderMotivationalMessage();
        this.renderHeatmap();
        const ei = document.getElementById('examDateInput'); if (ei) ei.value = EXAM_DATE.toISOString().split('T')[0];
        this.updateStorageSize();
    },

    renderMotivationalMessage() {
        const el = document.getElementById('motivationalMsg'); if (!el) return;
        const streak = state.streak; const todayHours = state.dailyStudyHours[StateManager.getTodayKey()] || 0;
        const days = StateManager.getDaysUntilExam(); let msg;
        if (streak >= 100) msg = 'LEGEND STATUS. Unstoppable! 👑';
        else if (streak >= 30) msg = 'Top 5% aspirant. Keep going! 💪';
        else if (streak >= 7) msg = 'Momentum built. Don\'t break the chain! 🔥';
        else if (streak > 0) msg = 'Building momentum... Keep it alive! ⚡';
        else msg = 'Every great journey starts today. Start now! 🌟';
        if (todayHours > 6) msg = 'Beast mode! Remember to take breaks. 🏋️';
        if (days < 30) msg = 'Final sprint. Every minute counts! 🏃';
        el.textContent = msg;
    },

    renderHeatmap() {
        const container = document.getElementById('heatmapContainer'); if (!container) return;
        const cells = [];
        for (let i = 27; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const hours = state.dailyStudyHours[key] || 0;
            let cls = '';
            if (hours >= 6) cls = 'h4'; else if (hours >= 4) cls = 'h3';
            else if (hours >= 2) cls = 'h2'; else if (hours > 0) cls = 'h1';
            cells.push(`<span class="heatmap-cell ${cls}" title="${key}: ${hours}h"></span>`);
        }
        container.innerHTML = cells.join('');
    },

    renderQuests() {
        const pq = QuestEngine.getPhaseQuests();
        this.renderQuestGroup('dailyQuestsContainer', pq.daily);
        this.renderQuestGroup('weeklyQuestsContainer', pq.weekly);
        this.renderQuestGroup('bossQuestsContainer', pq.boss);
        this.renderQuestGroup('recoveryQuestsContainer', QuestEngine.getRecoveryQuests());
        this.renderCompletedQuests();
    },

    renderQuestGroup(containerId, quests) {
        const container = document.getElementById(containerId); if (!container) return;
        let html = '';
        quests.forEach(q => {
            const progress = state.questProgress[q.progressKey] || 0;
            const completed = state.completedQuestIds.includes(q.id);
            const pct = Math.min(100, Math.round((progress / q.target) * 100));
            const locked = q.oneTime && completed;
            const cls = completed ? 'completed' : (locked ? 'locked' : '');
            html += `<div class="quest-item ${cls}">
                <span class="quest-icon">${q.icon}</span>
                <div class="quest-info"><div class="quest-name">${q.name} ${completed?'✓':(locked?'🔒':'')}</div>
                <div class="quest-desc">${q.desc} • <span class="difficulty-tag difficulty-${q.difficulty}">${q.difficulty.toUpperCase()}</span></div></div>
                <div class="quest-progress-bar"><div class="quest-progress-fill ${completed?'completed-fill':''}" style="width:${pct}%;"></div></div>
                <span class="quest-progress-text">${progress}/${q.target} ${q.unit}</span>
                <span class="quest-reward">+${q.rewardGems}💎</span>
                <div class="quest-actions">${!completed&&!locked?`<button class="btn btn-quest small" onclick="window.addQuestProgress('${q.progressKey}','${q.id}',${q.target},${q.rewardGems},${q.rewardStars},${q.rewardXp})">+1</button>`:''}${completed?'<span class="quest-claimed">CLAIMED</span>':''}</div></div>`;
        });
        if (!html) html = '<p class="empty-state-text">No quests available.</p>';
        container.innerHTML = html;
    },

    renderCompletedQuests() {
        const container = document.getElementById('completedQuestsContainer'); if (!container) return;
        const all = QuestEngine.getAllQuests();
        const completed = all.filter(q => state.completedQuestIds.includes(q.id));
        if (!completed.length) { container.innerHTML = '<p class="empty-state-text">Complete quests to see them here!</p>'; return; }
        container.innerHTML = completed.slice(-8).reverse().map(q => `<div class="quest-item completed"><span class="quest-icon">${q.icon}</span><div class="quest-info"><div class="quest-name">${q.name} ✓</div></div><span class="quest-reward">+${q.rewardGems}💎</span></div>`).join('');
    },

    renderShop() {
        this.renderShopGroup('shopCommonContainer', SHOP_ITEMS.common);
        this.renderShopGroup('shopEntertainmentContainer', SHOP_ITEMS.entertainment);
        this.renderShopGroup('shopPremiumContainer', SHOP_ITEMS.premium);
    },

    renderShopGroup(containerId, items) {
        const container = document.getElementById(containerId); if (!container) return;
        container.innerHTML = items.map(item => {
            const canAfford = state.stars >= item.cost;
            const streakReqMet = !item.requiresStreak || state.streak >= item.requiresStreak;
            const disabled = !canAfford || !streakReqMet;
            let reason = ''; if (!canAfford) reason = 'Not enough stars'; if (!streakReqMet) reason = 'Need ' + item.requiresStreak + '-day streak';
            return `<div class="shop-item"><span class="shop-item-icon">${item.icon}</span><div class="shop-item-info"><div class="shop-item-name">${item.name}</div><div class="shop-item-desc">${item.duration} • ${item.category}</div></div><span class="shop-cost">⭐ ${item.cost}</span><button class="btn gold small" ${disabled?'disabled style="opacity:0.4;"':''} onclick="window.purchaseItem('${item.name}',${item.cost},'${item.icon}','${item.duration}')" title="${reason}">🛒 Buy</button></div>`;
        }).join('');
    },

    renderAchievements() {
        this.renderAchGroup('achStudyContainer', ACHIEVEMENTS.study);
        this.renderAchGroup('achTestContainer', ACHIEVEMENTS.test);
        this.renderAchGroup('achMilestoneContainer', ACHIEVEMENTS.milestone);
    },

    renderAchGroup(containerId, achievements) {
        const container = document.getElementById(containerId); if (!container) return;
        container.innerHTML = achievements.map(a => {
            const earned = state.unlockedAchievements.includes(a.id);
            const currentVal = state[a.condition] || 0; const pct = Math.min(100, Math.round((currentVal / a.target) * 100));
            return `<div class="ach-item ${earned?'earned':''}"><span class="ach-icon">${a.icon}</span><div class="ach-info"><div class="ach-name">${a.name} ${earned?'✅':''}</div><div class="ach-desc">${a.desc}</div><div class="ach-progress-mini">${Math.min(currentVal,a.target)}/${a.target} (${pct}%)</div></div><span class="ach-reward">+${a.reward}💎</span></div>`;
        }).join('');
    },

    renderBadges() {
        const container = document.getElementById('badgesContainer'); if (!container) return;
        container.innerHTML = BADGES.map(b => {
            const earned = state.unlockedBadges.includes(b.id);
            const currentVal = state[b.condition] || 0;
            return `<div class="badge-item ${earned?'earned':'locked-badge'}"><div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div><div class="badge-progress-text">${earned?'Earned!':currentVal+'/'+b.target}</div></div>`;
        }).join('');
        this.renderBadgeOfTheDay();
    },

    renderBadgeOfTheDay() {
        const container = document.getElementById('badgeOfTheDayContainer'); if (!container) return;
        const locked = BADGES.filter(b => !state.unlockedBadges.includes(b.id));
        if (!locked.length) { container.innerHTML = '<p class="empty-state-text">All badges collected! 🏆</p>'; return; }
        const dayIndex = new Date().getDate() % locked.length;
        const badge = locked[dayIndex];
        container.innerHTML = `<div class="badge-item locked-badge" style="max-width:200px;margin:0 auto;"><div class="badge-icon">${badge.icon}</div><div class="badge-name">${badge.name}</div><div class="badge-progress-text">${state[badge.condition]||0}/${badge.target}</div></div><p class="empty-state-text" style="margin-top:8px;">Keep working to unlock this badge!</p>`;
    },

    renderRank() {
        const xp = state.xp;
        let currentRank = PRODUCTIVITY_RANKS[0], nextRank = PRODUCTIVITY_RANKS[1];
        for (let i = PRODUCTIVITY_RANKS.length - 1; i >= 0; i--) { if (xp >= PRODUCTIVITY_RANKS[i].xpRequired) { currentRank = PRODUCTIVITY_RANKS[i]; nextRank = PRODUCTIVITY_RANKS[i + 1] || null; break; } }
        const container = document.getElementById('rankDisplay'); if (!container) return;
        const prevXp = currentRank.xpRequired, nextXp = nextRank ? nextRank.xpRequired : currentRank.xpRequired * 2;
        const pct = Math.min(100, Math.round(((xp - prevXp) / (nextXp - prevXp)) * 100));
        container.innerHTML = `<p class="rank-name">${currentRank.icon} ${currentRank.name}</p><p class="rank-benefits">${currentRank.benefits}</p><div class="rank-bar-bg"><div class="rank-bar-fill" style="width:${pct}%;background:${currentRank.color};"></div></div><p class="rank-xp-text">${xp} / ${nextXp} XP ${nextRank?'→ '+nextRank.name:'(MAX)'}</p><p class="rank-reputation">🏅 Reputation: ${state.reputation}</p>`;
        const containerVault = document.getElementById('rankDisplayVault'); if (containerVault) containerVault.innerHTML = container.innerHTML;
    },

    renderVault() {
        const statusEl = document.getElementById('timerStatus'); if (statusEl) statusEl.textContent = 'Select a duration to start.';
        const display = document.getElementById('timerDisplay'); if (display) display.textContent = '00:00';
        const stopBtn = document.getElementById('btnTimerStop'); if (stopBtn) stopBtn.style.display = 'none';
        document.querySelectorAll('.timer-preset-btn').forEach(b => { if (b) b.style.display = 'inline-block'; });
        const pomCount = document.getElementById('pomodoroCount'); if (pomCount) pomCount.textContent = state.pomodoroCompleted;
    },

    renderSubjects() {
        const container = document.getElementById('subjectsContainer'); if (!container) return;
        let html = '';
        ['physics','chemistry','math'].forEach(subj => {
            const xp = state.subjectXP[subj] || 0; const level = state.subjectLevels[subj] || 1;
            const hours = state.subjectStudyHours[subj] || 0; const questions = state.subjectQuestions[subj] || 0;
            const currentLevelXP = StateManager.getSubjectLevelXP(level - 1);
            const nextLevelXP = StateManager.getSubjectLevelXP(level);
            const xpInLevel = xp - currentLevelXP, xpNeeded = nextLevelXP - currentLevelXP;
            const pct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
            html += `<div class="subject-card"><div class="subject-header"><span class="subject-icon">${SUBJECT_ICONS[subj]}</span><div><div class="subject-name">${SUBJECT_NAMES[subj]}</div><div class="subject-level">Level ${level}</div></div><span class="subject-xp-badge">${xp} XP</span></div><div class="subject-progress-bar"><div class="subject-progress-fill" style="width:${pct}%;background:${SUBJECT_COLORS[subj]};"></div></div><div class="subject-stats-row"><div class="subject-stat"><span>${Math.round(hours*10)/10}h</span><small>Hours</small></div><div class="subject-stat"><span>${questions}</span><small>Questions</small></div></div></div>`;
        });
        container.innerHTML = html;
    },

    renderCalendar(monthOffset = 0) {
        const container = document.getElementById('calendarGrid'); const titleEl = document.getElementById('calendarTitle');
        if (!container || !titleEl) return;
        const now = new Date();
        const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
        const year = targetMonth.getFullYear(), month = targetMonth.getMonth();
        titleEl.textContent = targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let html = ''; const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        dayNames.forEach(d => { html += `<div class="calendar-day-header">${d}</div>`; });
        for (let i = 0; i < firstDay; i++) html += '<div class="calendar-cell empty"></div>';
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const hours = state.dailyStudyHours[dateKey] || 0;
            let cls = 'calendar-cell';
            if (dateKey === StateManager.getTodayKey()) cls += ' today';
            if (hours >= 6) cls += ' cal-h4'; else if (hours >= 4) cls += ' cal-h3';
            else if (hours >= 2) cls += ' cal-h2'; else if (hours > 0) cls += ' cal-h1';
            html += `<div class="${cls}" title="${dateKey}: ${hours}h"><span class="calendar-day-num">${day}</span>${hours>0?`<span class="calendar-hours">${hours}h</span>`:''}</div>`;
        }
        container.innerHTML = html;
        const totalMonthHours = Object.entries(state.dailyStudyHours).filter(([key]) => key.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).reduce((sum,[,h]) => sum + h, 0);
        const summaryEl = document.getElementById('calendarSummary');
        if (summaryEl) summaryEl.textContent = `📊 ${targetMonth.toLocaleDateString('en-US',{month:'long'})} Total: ${Math.round(totalMonthHours*10)/10}h`;
        window._calendarOffset = monthOffset;
    },

    renderBacklog() {
        const container = document.getElementById('backlogList'); if (!container) return;
        const activeItems = state.backlogItems.filter(i => !i.completed);
        const completedItems = state.backlogItems.filter(i => i.completed);
        if (!activeItems.length && !completedItems.length) { container.innerHTML = '<p class="empty-state-text">No backlog items yet.</p>'; return; }
        let html = '<div class="backlog-section-title">📋 Active Backlog</div>';
        if (!activeItems.length) html += '<p class="empty-state-text">All caught up! 🎉</p>';
        activeItems.sort((a,b) => { const order = {high:0,medium:1,low:2}; return (order[a.priority]||1) - (order[b.priority]||1); }).forEach(item => {
            html += `<div class="backlog-item priority-${item.priority}"><span class="backlog-subject">${SUBJECT_ICONS[item.subject]||'📚'} ${item.subject||'General'}</span><span class="backlog-name">${item.name}</span><span class="backlog-priority-tag priority-${item.priority}">${item.priority}</span><div class="backlog-actions"><button class="btn success small" onclick="window.backlogToggle('${item.id}')">✓</button><button class="btn danger small" onclick="window.backlogDelete('${item.id}')">✕</button></div></div>`;
        });
        if (completedItems.length) {
            html += '<div class="backlog-section-title">✅ Recently Completed</div>';
            completedItems.slice(-5).reverse().forEach(item => {
                html += `<div class="backlog-item completed-item"><span class="backlog-subject">${SUBJECT_ICONS[item.subject]||'📚'} ${item.subject||'General'}</span><span class="backlog-name" style="text-decoration:line-through;">${item.name}</span><span class="backlog-completed-date">${item.completedDate}</span></div>`;
            });
        }
        container.innerHTML = html;
    },

    renderSpacedRep() {
        const container = document.getElementById('spacedRepList'); if (!container) return;
        const today = StateManager.getTodayKey();
        const items = state.spacedRepItems.filter(s => s.nextReviewDate || s.stage < SpacedRepSystem.intervals.length);
        if (!items.length) { container.innerHTML = '<p class="empty-state-text">No reviews scheduled. Complete backlog items to add them!</p>'; return; }
        const sorted = [...items].sort((a,b) => {
            if (!a.nextReviewDate) return 1; if (!b.nextReviewDate) return -1;
            if (a.nextReviewDate < today && b.nextReviewDate >= today) return -1;
            if (b.nextReviewDate < today && a.nextReviewDate >= today) return 1;
            return a.nextReviewDate.localeCompare(b.nextReviewDate);
        });
        container.innerHTML = sorted.map(s => {
            let status = ''; let cls = '';
            if (!s.nextReviewDate) { status = '✅ Completed!'; cls = 'completed'; }
            else if (s.nextReviewDate < today) { status = '⚠️ Overdue!'; cls = 'overdue'; }
            else if (s.nextReviewDate === today) { status = '📅 Due today!'; cls = 'due-today'; }
            else status = '📅 ' + s.nextReviewDate;
            return `<div class="spaced-rep-item ${cls}"><div class="spaced-rep-info"><div class="spaced-rep-name">${SUBJECT_ICONS[s.subject]||'📚'} ${s.name}</div><div class="spaced-rep-schedule">${status} • Stage ${s.stage+1}/${s.totalReviews}</div></div><span class="spaced-rep-stage">${s.stage}/${s.totalReviews-1}</span>${s.nextReviewDate&&s.nextReviewDate<=today?`<button class="btn success small" onclick="window.spacedRepComplete('${s.id}')">✓ Review</button>`:''}</div>`;
        }).join('');
        const overdueCount = SpacedRepSystem.getOverdueCount();
        const alertEl = document.getElementById('overdueAlert');
        const overdueCountEl = document.getElementById('overdueCount');
        if (alertEl && overdueCountEl) {
            if (overdueCount > 0) { alertEl.style.display = 'block'; overdueCountEl.textContent = overdueCount; }
            else alertEl.style.display = 'none';
        }
    },

    renderPartner() {
        const codeEl = document.getElementById('myShareCode');
        if (codeEl) codeEl.textContent = state.partnerCode || PartnerSystem.generateCode();

        const statusText = document.getElementById('partnerStatusText');
        const comparisonCard = document.getElementById('partnerComparisonCard');

        if (state.partnerData) {
            if (statusText) statusText.textContent = `🤝 Connected to: ${state.partnerData.code} (Last sync: ${new Date(state.partnerData.lastSync).toLocaleDateString()})`;
            if (comparisonCard) comparisonCard.style.display = 'block';
            this.renderPartnerComparison();
        } else {
            if (statusText) statusText.textContent = 'No partner data imported yet. Import their file to see comparison!';
            if (comparisonCard) comparisonCard.style.display = 'none';
        }
    },

    renderPartnerComparison() {
        const today = StateManager.getTodayKey();
        const youHours = state.dailyStudyHours[today] || 0;
        const youQuestions = state.sessionHistory
            .filter(s => s.date === today)
            .reduce((sum, s) => sum + s.questions, 0);
        const youStreak = state.streak;

        const theyHours = state.partnerData?.todayHours ?? '?';
        const theyQuestions = state.partnerData?.todayQuestions ?? '?';
        const theyStreak = state.partnerData?.streak ?? '?';

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setVal('partnerYouHours', youHours);
        setVal('partnerYouQuestions', youQuestions);
        setVal('partnerYouStreak', youStreak);
        setVal('partnerTheyHours', theyHours);
        setVal('partnerTheyQuestions', theyQuestions);
        setVal('partnerTheyStreak', theyStreak);
    },

    renderSessionHistory() {
        const container = document.getElementById('sessionHistoryList'); if (!container) return;
        const sessions = state.sessionHistory.slice(0, 30);
        if (!sessions.length) { container.innerHTML = '<p class="empty-state-text">No sessions recorded yet.</p>'; return; }
        container.innerHTML = `<div class="history-table"><div class="history-row history-header"><span>Date</span><span>Subject</span><span>Hours</span><span>Questions</span><span>Notes</span></div>${sessions.map(s => `<div class="history-row ${s.criticalHit?'critical-hit-row':''}"><span>${s.date}</span><span>${SUBJECT_ICONS[s.subject]||'📚'} ${s.subject||'General'}</span><span>${s.hours}h</span><span>${s.questions}</span><span>${s.criticalHit?'💥 Critical!':(s.notes||'-')}</span></div>`).join('')}</div>`;
        const statsEl = document.getElementById('sessionStats');
        if (statsEl) {
            const total = state.sessionHistory.length;
            const avg = total > 0 ? Math.round((state.totalStudyHours / total) * 100) / 100 : 0;
            statsEl.textContent = `📈 ${total} sessions | Avg: ${avg}h/session | 💥 Critical Hits: ${state.criticalHits}`;
        }
    },

    renderWeeklyReports() {
        const container = document.getElementById('weeklyReportsList'); if (!container) return;
        const reports = state.weeklyReports.slice(-10).reverse();
        if (!reports.length) { container.innerHTML = '<p class="empty-state-text">Weekly reports will appear here automatically.</p>'; return; }
        container.innerHTML = reports.map(r => `<div class="report-item"><span class="report-date">📅 ${r.weekStart} → ${r.weekEnd}</span><span>⏰ ${r.totalHours}h</span><span>✏️ ${r.totalQuestions} Qs</span><span>📋 ${r.sessionsCount} sessions</span>${r.criticalHits>0?`<span>💥 ${r.criticalHits} crits</span>`:''}</div>`).join('');
    },

    renderInsights() {
        this.renderWeeklyChart();
        this.renderPerformanceInsights();
    },

    renderWeeklyChart() {
        const svg = document.getElementById('weeklyChart'); if (!svg) return;
        const days = []; const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today); d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), hours: state.dailyStudyHours[key] || 0, key });
        }
        const maxHours = Math.max(...days.map(d => d.hours), 2);
        const w = 600, h = 200, pad = 30, barW = (w - pad * 2) / days.length - 8;
        let bars = '', labels = '', gridLines = '';
        for (let i = 0; i <= 4; i++) {
            const y = h - pad - (i / 4) * (h - pad * 2);
            gridLines += `<line x1="${pad}" y1="${y}" x2="${w-pad}" y2="${y}" stroke="var(--chart-grid)" stroke-width="1" stroke-dasharray="4,4"/>`;
            gridLines += `<text x="${pad-5}" y="${y+4}" fill="var(--text-dim)" font-size="10" text-anchor="end">${Math.round(maxHours*i/4)}h</text>`;
        }
        days.forEach((d, i) => {
            const barH = maxHours > 0 ? ((d.hours / maxHours) * (h - pad * 2)) : 0;
            const x = pad + i * ((w - pad * 2) / days.length) + 4;
            const y = h - pad - barH;
            bars += `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(barH,1)}" rx="3" fill="var(--accent)" opacity="0.85"><title>${d.key}: ${d.hours}h</title></rect>`;
            labels += `<text x="${x+barW/2}" y="${h-8}" fill="var(--text-dim)" font-size="11" text-anchor="middle">${d.label}</text>`;
        });
        svg.innerHTML = gridLines + bars + labels;
        const totalWeek = days.reduce((s, d) => s + d.hours, 0);
        const summary = document.getElementById('chartSummary');
        if (summary) summary.textContent = `📊 This week: ${Math.round(totalWeek*10)/10}h total • Avg: ${Math.round(totalWeek/7*10)/10}h/day`;
    },

    renderPerformanceInsights() {
        const container = document.getElementById('insightsContent'); if (!container) return;
        const sessions = state.sessionHistory;
        if (sessions.length < 3) { container.innerHTML = '<p class="empty-state-text">Log more study sessions to see insights!</p>'; return; }
        const insights = [];
        const dayCounts = {};
        sessions.forEach(s => { const day = new Date(s.date).getDay(); dayCounts[day] = (dayCounts[day] || 0) + s.hours; });
        let bestDay = 0, bestHours = 0;
        Object.entries(dayCounts).forEach(([day, hours]) => { if (hours > bestHours) { bestHours = hours; bestDay = parseInt(day); } });
        const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        if (bestHours > 0) insights.push(`📌 You study best on <strong>${dayNames[bestDay]}s</strong> (${Math.round(bestHours*10)/10}h total).`);
        const todayHours = state.dailyStudyHours[StateManager.getTodayKey()] || 0;
        if (todayHours < 2 && state.streak > 0) insights.push(`⚠️ Study <strong>${Math.round((2-todayHours)*10)/10}h more</strong> today to keep your ${state.streak}-day streak strong.`);
        const lastWeekSessions = sessions.filter(s => { const d = new Date(s.date); const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7); return d >= weekAgo; });
        const lastWeekHours = lastWeekSessions.reduce((s, r) => s + r.hours, 0);
        insights.push(`📊 Last 7 days: <strong>${Math.round(lastWeekHours*10)/10}h</strong> studied across <strong>${lastWeekSessions.length}</strong> sessions.`);
        if (!insights.length) insights.push('Keep logging sessions to unlock personalized insights!');
        container.innerHTML = insights.map(i => `<div class="insight-item">${i}</div>`).join('');
    },

    refreshAll() {
        this.updateHeaderStats();
        const activePanel = document.querySelector('.tab-panel.active');
        if (!activePanel) return;
        const panelId = activePanel.id;
        switch (panelId) {
            case 'panel-dashboard': this.renderDashboard(); break;
            case 'panel-quests': this.renderQuests(); break;
            case 'panel-subjects': this.renderSubjects(); break;
            case 'panel-calendar': this.renderCalendar(window._calendarOffset || 0); break;
            case 'panel-shop': this.renderShop(); break;
            case 'panel-hall': this.renderAchievements(); this.renderBadges(); this.renderRank(); break;
            case 'panel-vault': this.renderRank(); this.renderVault(); break;
            case 'panel-backlog': this.renderBacklog(); break;
            case 'panel-spaced-rep': this.renderSpacedRep(); break;
            case 'panel-partner': this.renderPartner(); break;
            case 'panel-insights': this.renderSessionHistory(); this.renderWeeklyReports(); this.renderInsights(); break;
            case 'panel-settings': this.updateStorageSize();
                const ei = document.getElementById('examDateInput'); if (ei) ei.value = EXAM_DATE.toISOString().split('T')[0]; break;
        }
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const panel = document.getElementById('panel-' + tabName);
        if (panel) panel.classList.add('active');
        const btn = document.querySelector(`[data-tab="${tabName}"]`);
        if (btn) btn.classList.add('active');
        if (tabName === 'calendar') this.renderCalendar(window._calendarOffset || 0);
        if (tabName === 'subjects') this.renderSubjects();
        if (tabName === 'backlog') this.renderBacklog();
        if (tabName === 'spaced-rep') this.renderSpacedRep();
        if (tabName === 'partner') this.renderPartner();
        if (tabName === 'insights') { this.renderSessionHistory(); this.renderWeeklyReports(); this.renderInsights(); }
        this.refreshAll();
    },
};

// ==================== SHOP ITEMS ====================
const SHOP_ITEMS = {
    common: [
        {name:'YouTube Short',cost:3,icon:'📱',duration:'1 video',category:'break'},
        {name:'Telegram Scroll',cost:3,icon:'💬',duration:'1 minute',category:'break'},
        {name:'Instagram Reel',cost:3,icon:'📷',duration:'1 reel',category:'break'},
        {name:'Random Browsing',cost:8,icon:'🌐',duration:'10 minutes',category:'break'},
    ],
    entertainment: [
        {name:'Cartoon Episode',cost:10,icon:'📺',duration:'~20 minutes',category:'entertainment'},
        {name:'Anime Episode',cost:12,icon:'🎬',duration:'~24 minutes',category:'entertainment'},
        {name:'YouTube Video',cost:8,icon:'▶️',duration:'~10-15 minutes',category:'entertainment'},
        {name:'Gaming Session',cost:25,icon:'🎮',duration:'30 minutes',category:'entertainment'},
    ],
    premium: [
        {name:'Movie Night',cost:60,icon:'🎥',duration:'full movie',category:'premium',requiresStreak:0},
        {name:'Half-Day Relaxation',cost:100,icon:'🏖️',duration:'4-5 hours',category:'premium',requiresStreak:0},
        {name:'Favorite Food Treat',cost:80,icon:'🍕',duration:'meal time',category:'premium',requiresStreak:0},
        {name:'Weekend Off',cost:250,icon:'🎉',duration:'full day',category:'premium',requiresStreak:30},
    ],
};

// ==================== GLOBAL FUNCTIONS ====================
window.addQuestProgress = function(progressKey, questId, target, rewardGems, rewardStars, rewardXp) {
    QuestEngine.addProgress(progressKey, questId, target, rewardGems, rewardStars, rewardXp);
};
window.purchaseItem = function(name, cost, icon, duration) {
    if (state.stars < cost) { UIRenderer.showToast('Not enough stars!', '⚠️'); return; }
    state.stars -= cost;
    state.purchasedItems.push({name, cost, icon, duration, date: StateManager.getTodayKey()});
    SoundEngine.play('purchase');
    UIRenderer.showToast(`Purchased: ${icon} ${name} for ⭐${cost}!`, '🛒');
    StateManager.save(); UIRenderer.refreshAll();
};
window.backlogToggle = function(itemId) {
    const item = state.backlogItems.find(i => i.id === itemId); if (!item) return;
    item.completed = !item.completed;
    item.completedDate = item.completed ? StateManager.getTodayKey() : null;
    if (item.completed) {
        state.xp += 15; state.reputation += 2;
        if (item.subject && state.subjectXP[item.subject] !== undefined) StateManager.addSubjectXP(item.subject, 20);
        state.chaptersCompleted += 1;
        SpacedRepSystem.scheduleFromBacklog(item);
        UIRenderer.showToast(`Backlog item completed! +15XP`, '✅');
    }
    StateManager.save(); UIRenderer.refreshAll(); AchievementSystem.checkAll();
};
window.backlogDelete = function(itemId) {
    state.backlogItems = state.backlogItems.filter(i => i.id !== itemId);
    StateManager.save(); UIRenderer.refreshAll();
};
window.spacedRepComplete = function(itemId) {
    SpacedRepSystem.completeReview(itemId);
};

// ==================== EVENT HANDLERS ====================
function initEventHandlers() {
    document.getElementById('tabNav')?.addEventListener('click', function(e) {
        const btn = e.target.closest('.tab-btn'); if (!btn) return;
        const tab = btn.getAttribute('data-tab'); if (tab) UIRenderer.switchTab(tab);
    });

    document.getElementById('btnCheckIn')?.addEventListener('click', () => {
        const today = StateManager.getTodayKey();
        if (state.lastCheckInDate === today) { UIRenderer.showToast('Already checked in today!', '📅'); return; }
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];
        if (state.lastCheckInDate === yesterdayKey) state.streak += 1;
        else if (state.lastCheckInDate && state.lastCheckInDate !== yesterdayKey && state.streak > 0) {
            if (state.freezeTokens > 0) { state.freezeTokens -= 1; state.streak += 1; UIRenderer.showToast('Freeze token used! ❄️', '🛡️'); }
            else { state.streak = 1; UIRenderer.showToast('Streak reset.', '🔄'); }
        } else state.streak = 1;
        state.lastCheckInDate = today;
        if (state.streak > state.maxStreak) state.maxStreak = state.streak;
        state.xp += state.streak; state.reputation += 1;
        STREAK_BADGES.forEach(sb => {
            if (state.streak >= sb.days && !state.unlockedStreakBadges.includes(sb.days)) {
                state.unlockedStreakBadges.push(sb.days);
                state.gems += sb.gemReward; state.stars += sb.starReward; state.starsEarned += sb.starReward;
                state.xp += sb.gemReward * 3; state.reputation += sb.gemReward;
                SoundEngine.play('badge');
                UIRenderer.showToast(`Streak Badge: ${sb.icon} ${sb.name}! +${sb.gemReward}💎`, sb.icon);
            }
        });
        UIRenderer.showToast(`Checked in! Streak: ${state.streak} days 🔥`, '✅');
        StateManager.save(); UIRenderer.refreshAll(); AchievementSystem.checkAll();
    });

    document.getElementById('btnBuyFreeze')?.addEventListener('click', () => {
        if (state.gems < 15) { UIRenderer.showToast('Not enough gems! Need 15💎.', '⚠️'); return; }
        if (state.freezeTokens >= 3) { UIRenderer.showToast('Max 3 freeze tokens!', '⚠️'); return; }
        state.gems -= 15; state.freezeTokens += 1;
        UIRenderer.showToast('Freeze Token purchased! 🛡️', '🛡️');
        StateManager.save(); UIRenderer.refreshAll();
    });

    document.getElementById('btnLogStudy')?.addEventListener('click', () => {
        const hours = parseFloat(document.getElementById('logHours')?.value) || 0;
        const questions = parseInt(document.getElementById('logQuestions')?.value) || 0;
        const subject = document.getElementById('logSubject')?.value || 'general';
        const notes = document.getElementById('logNotes')?.value || '';
        if (hours === 0 && questions === 0) { UIRenderer.showToast('Enter study hours or questions.', '⚠️'); return; }
        const today = StateManager.getTodayKey();
        state.totalStudyHours += hours; state.questionsSolved += questions;
        if (!state.dailyStudyHours[today]) state.dailyStudyHours[today] = 0;
        state.dailyStudyHours[today] += hours;
        state.xp += Math.floor(hours * 15 + questions * 0.5); state.reputation += Math.floor(hours * 2);
        const session = {id:'session_'+Date.now(),date:today,timestamp:new Date().toISOString(),hours,questions,subject,notes,criticalHit:false};
        if (StateManager.rollCriticalHit() && hours > 0) {
            session.criticalHit = true; state.criticalHits++;
            const bonusXP = Math.floor(hours * 25); state.xp += bonusXP;
            SoundEngine.play('critical');
            UIRenderer.showToast(`💥 CRITICAL HIT! +${bonusXP} bonus XP!`, '💥');
        }
        state.sessionHistory.unshift(session);
        if (state.sessionHistory.length > 200) state.sessionHistory = state.sessionHistory.slice(0, 200);
        if (subject !== 'general' && state.subjectXP[subject] !== undefined) {
            StateManager.addSubjectXP(subject, Math.floor(hours * 15 + questions * 0.5));
            if (!state.subjectStudyHours[subject]) state.subjectStudyHours[subject] = 0;
            state.subjectStudyHours[subject] += hours;
            if (!state.subjectQuestions[subject]) state.subjectQuestions[subject] = 0;
            state.subjectQuestions[subject] += questions;
        }
        if (state.comboSubject === subject && hours > 0) { state.comboCount++; if (state.comboCount >= 5) { const bonus = state.comboCount * 5; state.xp += bonus; UIRenderer.showToast(`🔗 ${state.comboCount}-day combo! +${bonus}XP`, '🔗'); } }
        else if (hours > 0 && subject !== 'general') { state.comboSubject = subject; state.comboCount = 1; }
        const allQuests = QuestEngine.getAllQuests();
        allQuests.forEach(q => {
            if (state.completedQuestIds.includes(q.id)) return;
            const pk = q.progressKey; if (!state.questProgress[pk]) state.questProgress[pk] = 0;
            if (['hours','topics','chapters','subjects','chapter_pyqs','full_revision','unit','sections','analysis','tasks','days','day','set','problems','errors','test','session','topic'].includes(q.unit)) state.questProgress[pk] += hours;
            if (['questions','pyqs','problems','errors'].includes(q.unit)) state.questProgress[pk] += questions;
            if (state.questProgress[pk] >= q.target) {
                state.questProgress[pk] = q.target; state.completedQuestIds.push(q.id);
                state.gems += q.rewardGems; state.stars += q.rewardStars; state.starsEarned += q.rewardStars;
                state.xp += q.rewardXp + Math.floor(q.rewardXp * state.prestigeBonuses.xpBonus / 100);
                state.reputation += Math.floor(q.rewardXp / 5);
                SoundEngine.play('quest');
                UIRenderer.showToast(`Quest auto-completed: ${q.name}! +${q.rewardGems}💎`, '✅');
            }
        });
        UIRenderer.showToast(`Logged: ${hours}h study, ${questions} questions!`, '📥');
        document.getElementById('logHours').value = ''; document.getElementById('logQuestions').value = '';
        document.getElementById('logNotes').value = '';
        StateManager.save(); UIRenderer.refreshAll(); AchievementSystem.checkAll();
    });

    document.getElementById('btnSaveReflection')?.addEventListener('click', () => {
        const input = document.getElementById('reflectionInput'); if (!input || !input.value.trim()) return;
        state.dailyReflections[StateManager.getTodayKey()] = input.value.trim();
        UIRenderer.showToast('Reflection saved! 📝', '💭'); input.value = ''; StateManager.save();
    });

    document.getElementById('btnTimer30')?.addEventListener('click', () => TimerManager.start(30));
    document.getElementById('btnTimer60')?.addEventListener('click', () => TimerManager.start(60));
    document.getElementById('btnTimer120')?.addEventListener('click', () => TimerManager.start(120));
    document.getElementById('btnTimer240')?.addEventListener('click', () => TimerManager.start(240));
    document.getElementById('btnTimerStop')?.addEventListener('click', () => TimerManager.stop());
    document.getElementById('btnPomodoro')?.addEventListener('click', () => TimerManager.start(25, true));
    document.getElementById('btnPomodoro50')?.addEventListener('click', () => TimerManager.start(50, true));

    document.getElementById('btnAddBacklog')?.addEventListener('click', () => {
        const name = document.getElementById('backlogNameInput')?.value.trim();
        if (!name) { UIRenderer.showToast('Enter a task name.', '⚠️'); return; }
        const subject = document.getElementById('backlogSubjectSelect')?.value || 'general';
        const priority = document.getElementById('backlogPrioritySelect')?.value || 'medium';
        state.backlogItems.push({id:'backlog_'+Date.now(),name,subject,priority,completed:false,addedDate:StateManager.getTodayKey(),completedDate:null});
        document.getElementById('backlogNameInput').value = '';
        StateManager.save(); UIRenderer.refreshAll();
        UIRenderer.showToast(`Backlog item added: ${name}`, '📝');
    });

    // Partner System Event Handlers
    document.getElementById('btnExportPartnerData')?.addEventListener('click', () => PartnerSystem.exportPartnerData());
    
    document.getElementById('btnImportPartnerTrigger')?.addEventListener('click', () => {
        document.getElementById('partnerImportModal').style.display = 'flex';
        document.getElementById('partnerImportDataText').value = '';
        document.getElementById('partnerImportDataText').focus();
    });
    
    document.getElementById('btnPartnerImportCancel')?.addEventListener('click', () => {
        document.getElementById('partnerImportModal').style.display = 'none';
    });
    
    document.getElementById('btnPartnerImportConfirm')?.addEventListener('click', () => {
        const text = document.getElementById('partnerImportDataText').value.trim();
        if (!text) {
            UIRenderer.showToast('Paste your partner\'s data first.', '⚠️');
            return;
        }
        PartnerSystem.importPartnerData(text);
        document.getElementById('partnerImportModal').style.display = 'none';
    });
    
    document.getElementById('partnerImportModal')?.addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });

    document.getElementById('btnCopyCode')?.addEventListener('click', () => {
        const code = state.partnerCode || PartnerSystem.generateCode();
        navigator.clipboard?.writeText(code).then(() => UIRenderer.showToast('Code copied! 📋', '📋'));
    });
    
    document.getElementById('btnDisconnectPartner')?.addEventListener('click', () => PartnerSystem.disconnect());

    document.getElementById('btnBadgeUnlockClose')?.addEventListener('click', () => {
        document.getElementById('badgeUnlockModal').style.display = 'none';
    });

    document.getElementById('btnExport')?.addEventListener('click', () => {
        try {
            const exportObj = {version:'3.0',exportDate:new Date().toISOString(),examDate:EXAM_DATE.toISOString().split('T')[0],state:JSON.parse(JSON.stringify(state))};
            const blob = new Blob([JSON.stringify(exportObj,null,2)],{type:'application/json'});
            const url = URL.createObjectURL(blob); const a = document.createElement('a');
            a.href = url; a.download = 'jee-rpg-save-'+StateManager.getTodayKey()+'.json';
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            UIRenderer.showToast('Save exported! 📤', '💾');
        } catch(e) { UIRenderer.showToast('Export failed.', '⚠️'); }
    });

    document.getElementById('btnImportTrigger')?.addEventListener('click', () => {
        document.getElementById('importModal').style.display = 'flex';
        document.getElementById('importDataText').value = '';
        document.getElementById('importDataText').focus();
    });
    document.getElementById('btnImportCancel')?.addEventListener('click', () => { document.getElementById('importModal').style.display = 'none'; });
    document.getElementById('btnImportConfirm')?.addEventListener('click', () => {
        const text = document.getElementById('importDataText').value.trim();
        if (!text) { UIRenderer.showToast('Paste your save data first.', '⚠️'); return; }
        try {
            const imported = JSON.parse(text);
            if (!imported.state) throw new Error('Invalid format');
            if (!confirm('⚠️ Overwrite ALL progress?')) return;
            state = {...JSON.parse(JSON.stringify(DEFAULT_STATE)), ...imported.state};
            if (imported.examDate) { EXAM_DATE = new Date(imported.examDate+'T00:00:00'); state.examDate = imported.examDate; }
            StateManager.save(); document.getElementById('importModal').style.display = 'none';
            UIRenderer.refreshAll(); UIRenderer.showToast('Data imported! 📥', '✅');
        } catch(e) { UIRenderer.showToast('Invalid save data.', '❌'); }
    });

    document.getElementById('btnReset')?.addEventListener('click', () => {
        if (!confirm('🗑️ DELETE all progress?')) return;
        if (prompt('Type RESET:') !== 'RESET') { UIRenderer.showToast('Reset cancelled.', '✅'); return; }
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        EXAM_DATE = new Date('2027-01-10T00:00:00'); state.examDate = '2027-01-10';
        StateManager.save(); UIRenderer.refreshAll();
        document.getElementById('examDateInput').value = '2027-01-10';
        UIRenderer.showToast('All data reset! 🌟', '🗑️');
    });

    document.getElementById('btnUpdateExamDate')?.addEventListener('click', () => {
        const val = document.getElementById('examDateInput')?.value;
        if (!val) return;
        const parsed = new Date(val+'T00:00:00');
        if (isNaN(parsed.getTime()) || parsed < new Date()) { UIRenderer.showToast('Invalid date.', '⚠️'); return; }
        EXAM_DATE = parsed; state.examDate = val;
        StateManager.save(); UIRenderer.refreshAll();
        UIRenderer.showToast('Exam date updated! 📅', '✅');
    });

    document.getElementById('importModal')?.addEventListener('click', function(e) { if (e.target === this) this.style.display = 'none'; });

    document.getElementById('btnPrevMonth')?.addEventListener('click', () => { window._calendarOffset = (window._calendarOffset||0)-1; UIRenderer.renderCalendar(window._calendarOffset); });
    document.getElementById('btnNextMonth')?.addEventListener('click', () => { window._calendarOffset = (window._calendarOffset||0)+1; UIRenderer.renderCalendar(window._calendarOffset); });

    document.getElementById('btnMuteToggle')?.addEventListener('click', () => SoundEngine.toggle());

    document.getElementById('themeToggleBtn')?.addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('themeSwitcherDropdown')?.classList.toggle('visible');
    });
    document.getElementById('themeSwitcherDropdown')?.addEventListener('click', function(e) {
        const option = e.target.closest('.theme-option');
        if (option) { ThemeManager.setTheme(option.getAttribute('data-theme')); this.classList.remove('visible'); }
    });
    document.addEventListener('click', function(e) {
        const dd = document.getElementById('themeSwitcherDropdown');
        const btn = document.getElementById('themeToggleBtn');
        if (dd && dd.classList.contains('visible') && !dd.contains(e.target) && e.target !== btn) dd.classList.remove('visible');
    });
}

// ==================== INITIALIZATION ====================
function init() {
    SoundEngine.init();
    ConfettiEngine.init();
    StateManager.load();
    ThemeManager.init();
    initEventHandlers();
    UIRenderer.updateHeaderStats();
    UIRenderer.renderDashboard();
    UIRenderer.renderShop();
    UIRenderer.renderAchievements();
    UIRenderer.renderBadges();
    UIRenderer.renderRank();
    UIRenderer.renderVault();
    UIRenderer.renderSubjects();
    UIRenderer.renderCalendar(0);
    UIRenderer.renderBacklog();
    UIRenderer.renderSpacedRep();
    UIRenderer.renderPartner();
    UIRenderer.renderSessionHistory();
    UIRenderer.renderWeeklyReports();
    UIRenderer.renderInsights();
    AchievementSystem.checkAll();
    StateManager.save();
    window._calendarOffset = 0;
    const examInput = document.getElementById('examDateInput');
    if (examInput) examInput.value = EXAM_DATE.toISOString().split('T')[0];
    UIRenderer.updateStorageSize();

    setInterval(() => {
        if (document.getElementById('panel-dashboard')?.classList.contains('active')) UIRenderer.renderDashboard();
    }, 3600000);

    console.log('⚔️ JEE RPG v3.0 initialized!');
    console.log('📅 Days until JEE Main:', StateManager.getDaysUntilExam());
    console.log('📋 Phase:', getCurrentPhase().name);
    console.log('🔊 Sound:', SoundEngine.muted ? 'Muted' : 'On');
    console.log('🎨 Theme:', ThemeManager.current);
    console.log('🤝 Partner sync: Manual file-based (Export/Import)');
}

document.addEventListener('DOMContentLoaded', init);