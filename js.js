// ==================== MODULE: Theme Manager ====================
const ThemeManager = {
    themes: ['midnight-rpg', 'cyber-blue', 'emerald', 'crimson', 'light'],
    themeNames: {
        'midnight-rpg': 'Midnight RPG',
        'cyber-blue': 'Cyber Blue',
        'emerald': 'Emerald',
        'crimson': 'Crimson',
        'light': 'Light Mode'
    },
    themeIcons: {
        'midnight-rpg': '🌙',
        'cyber-blue': '💠',
        'emerald': '🍀',
        'crimson': '🔴',
        'light': '☀️'
    },
    current: 'midnight-rpg',

    init() {
        const saved = localStorage.getItem('jeeRpgTheme');
        if (saved && this.themes.includes(saved)) {
            this.current = saved;
        }
        this.apply();
        this.renderSwitcher();
    },

    apply() {
        document.body.setAttribute('data-theme', this.current);
        localStorage.setItem('jeeRpgTheme', this.current);
    },

    setTheme(theme) {
        if (!this.themes.includes(theme)) return;
        this.current = theme;
        this.apply();
        this.renderSwitcher();
        UIRenderer.showToast(`Theme: ${this.themeNames[theme]} ${this.themeIcons[theme]}`, '🎨');
    },

    renderSwitcher() {
        const container = document.getElementById('themeSwitcherDropdown');
        if (!container) return;
        container.innerHTML = this.themes.map(t => `
            <button class="theme-option ${t === this.current ? 'active' : ''}" 
                    data-theme="${t}" 
                    title="${this.themeNames[t]}">
                <span class="theme-dot theme-${t}"></span>
                <span>${this.themeIcons[t]} ${this.themeNames[t]}</span>
                ${t === this.current ? '<span style="margin-left:auto;">✓</span>' : ''}
            </button>
        `).join('');
        const currentBtn = document.getElementById('themeToggleBtn');
        if (currentBtn) {
            currentBtn.innerHTML = `${this.themeIcons[this.current]} Theme`;
        }
    }
};

// ==================== MODULE: State Manager ====================
const SUBJECT_LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 12000, 20000, 35000];
const SUBJECT_NAMES = { physics: 'Physics', chemistry: 'Chemistry', math: 'Math' };
const SUBJECT_ICONS = { physics: '⚛️', chemistry: '🧪', math: '📐' };
const SUBJECT_COLORS = { physics: '#60a5fa', chemistry: '#f472b6', math: '#34d399' };

const DEFAULT_STATE = {
    gems: 20,
    stars: 50,
    xp: 0,
    reputation: 0,
    streak: 0,
    maxStreak: 0,
    lastCheckInDate: null,
    freezeTokens: 0,
    totalStudyHours: 0,
    questionsSolved: 0,
    chaptersCompleted: 0,
    pyqsSolved: 0,
    mockTestsGiven: 0,
    chaptersRevised: 0,
    starsEarned: 0,
    theoryLectures: 0,
    notesCompleted: 0,
    revisionsDone: 0,
    dppCompleted: 0,
    pyqSetsDone: 0,
    testsAboveTarget: 0,
    scoreImproved: 0,
    sillyMistakesReduced: 0,
    mockTestOver100: 0,
    unlockedAchievements: [],
    unlockedBadges: [],
    unlockedStreakBadges: [],
    completedQuestIds: [],
    questProgress: {},
    purchasedItems: [],
    dailyStudyHours: {},
    prestigeLevel: 0,
    prestigeBonuses: { xpBonus: 0, starDiscount: 0 },
    studyHistory: {},
    examDate: '2027-01-10',
    subjectXP: { physics: 0, chemistry: 0, math: 0 },
    subjectLevels: { physics: 1, chemistry: 1, math: 1 },
    subjectStudyHours: { physics: 0, chemistry: 0, math: 0 },
    subjectQuestions: { physics: 0, chemistry: 0, math: 0 },
    sessionHistory: [],
    backlogItems: [],
    dailyReflections: {},
    comboSubject: null,
    comboCount: 0,
    criticalHits: 0,
    weeklyReports: [],
    lastWeeklyReportDate: null,
    pomodoroCompleted: 0,
    totalFocusMinutes: 0,
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let EXAM_DATE = new Date('2027-01-10T00:00:00');

const StateManager = {
    load() {
        try {
            const saved = localStorage.getItem('jeeRpgState');
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...JSON.parse(JSON.stringify(DEFAULT_STATE)), ...parsed };
                if (!state.subjectXP) state.subjectXP = { physics: 0, chemistry: 0, math: 0 };
                if (!state.subjectLevels) state.subjectLevels = { physics: 1, chemistry: 1, math: 1 };
                if (!state.subjectStudyHours) state.subjectStudyHours = { physics: 0, chemistry: 0, math: 0 };
                if (!state.subjectQuestions) state.subjectQuestions = { physics: 0, chemistry: 0, math: 0 };
                if (!state.sessionHistory) state.sessionHistory = [];
                if (!state.backlogItems) state.backlogItems = [];
                if (!state.dailyReflections) state.dailyReflections = {};
                if (!state.reputation) state.reputation = 0;
                if (!state.comboSubject) state.comboSubject = null;
                if (!state.comboCount) state.comboCount = 0;
                if (!state.criticalHits) state.criticalHits = 0;
                if (!state.weeklyReports) state.weeklyReports = [];
                if (!state.lastWeeklyReportDate) state.lastWeeklyReportDate = null;
                if (!state.pomodoroCompleted) state.pomodoroCompleted = 0;
                if (!state.totalFocusMinutes) state.totalFocusMinutes = 0;
                if (!state.prestigeBonuses) state.prestigeBonuses = { xpBonus: 0, starDiscount: 0 };
                if (!state.questProgress) state.questProgress = {};
                if (!state.completedQuestIds) state.completedQuestIds = [];
                if (!state.unlockedAchievements) state.unlockedAchievements = [];
                if (!state.unlockedBadges) state.unlockedBadges = [];
                if (!state.unlockedStreakBadges) state.unlockedStreakBadges = [];
                if (!state.purchasedItems) state.purchasedItems = [];
                if (!state.dailyStudyHours) state.dailyStudyHours = {};
                if (!state.studyHistory) state.studyHistory = {};
                if (state.examDate) EXAM_DATE = new Date(state.examDate + 'T00:00:00');
            }
        } catch (e) { console.error('Failed to load state:', e); }
    },

    save() {
        try {
            state.examDate = EXAM_DATE.toISOString().split('T')[0];
            localStorage.setItem('jeeRpgState', JSON.stringify(state));
            UIRenderer.updateStorageSize();
        } catch (e) {
            console.error('Failed to save:', e);
            UIRenderer.showToast('Failed to save! Storage may be full.', '⚠️');
        }
    },

    getTodayKey() { return new Date().toISOString().split('T')[0]; },

    getDaysUntilExam() {
        const diff = EXAM_DATE.getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    },

    getSubjectLevel(xp) {
        let level = 1;
        for (let i = SUBJECT_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (xp >= SUBJECT_LEVEL_THRESHOLDS[i]) { level = i + 1; break; }
        }
        return level;
    },

    getSubjectLevelXP(level) {
        return SUBJECT_LEVEL_THRESHOLDS[Math.min(level, SUBJECT_LEVEL_THRESHOLDS.length - 1)] || 0;
    },

    addSubjectXP(subject, amount) {
        if (!state.subjectXP[subject]) state.subjectXP[subject] = 0;
        state.subjectXP[subject] += amount;
        const newLevel = this.getSubjectLevel(state.subjectXP[subject]);
        const oldLevel = state.subjectLevels[subject] || 1;
        if (newLevel > oldLevel) {
            state.subjectLevels[subject] = newLevel;
            state.gems += newLevel * 3;
            state.xp += newLevel * 25;
            UIRenderer.showToast(
                `${SUBJECT_ICONS[subject]} ${SUBJECT_NAMES[subject]} Level Up! Level ${newLevel}! +${newLevel*3}💎`,
                '⬆️'
            );
        } else {
            state.subjectLevels[subject] = newLevel;
        }
        if (!state.subjectStudyHours[subject]) state.subjectStudyHours[subject] = 0;
    },

    addReputation(amount) {
        state.reputation += amount;
    },

    getCriticalHitChance() {
        return 0.12 + (state.comboCount > 3 ? 0.05 : 0) + (state.prestigeBonuses.xpBonus > 0 ? 0.03 : 0);
    },

    rollCriticalHit() {
        return Math.random() < this.getCriticalHitChance();
    },
};

// ==================== MODULE: Quest Engine ====================
const PHASES = [
    { id: 1, name: 'Foundation Recovery', daysRemaining: 150, cssClass: 'phase-1', icon: '🏗️' },
    { id: 2, name: 'Question Domination', daysRemaining: 60, cssClass: 'phase-2', icon: '⚔️' },
    { id: 3, name: 'Exam Mode', daysRemaining: 0, cssClass: 'phase-3', icon: '🔥' },
];

function getCurrentPhase() {
    const days = StateManager.getDaysUntilExam();
    if (days > 150) return PHASES[0];
    if (days > 60) return PHASES[1];
    return PHASES[2];
}

const QuestEngine = {
    getPhaseQuests() {
        const phase = getCurrentPhase();
        let daily = [], weekly = [], boss = [];

        if (phase.id === 1) {
            daily = [
                { id: 'p1_daily_theory', name: 'Theory Foundation', desc: 'Study theory for 2 weak topics', icon: '📖', target: 2, unit: 'topics', progressKey: 'p1_theory_topics', difficulty: 'medium', rewardGems: 3, rewardStars: 10, rewardXp: 30, type: 'daily' },
                { id: 'p1_daily_backlog', name: 'Backlog Slayer', desc: 'Complete 1 pending chapter backlog', icon: '📚', target: 1, unit: 'chapters', progressKey: 'p1_backlog_chapters', difficulty: 'hard', rewardGems: 8, rewardStars: 25, rewardXp: 60, type: 'daily' },
                { id: 'p1_daily_questions', name: 'Concept Check', desc: 'Solve 20 basic questions from weak chapters', icon: '✏️', target: 20, unit: 'questions', progressKey: 'p1_basic_questions', difficulty: 'easy', rewardGems: 2, rewardStars: 8, rewardXp: 15, type: 'daily' },
                { id: 'p1_ncert_theory', name: 'NCERT Theory Master', desc: 'Complete NCERT theory of one chapter', icon: '📘', target: 1, unit: 'chapters', progressKey: 'p1_ncert_theory', difficulty: 'medium', rewardGems: 5, rewardStars: 12, rewardXp: 25, type: 'daily' },
                { id: 'p1_short_notes', name: 'Concise Notes', desc: 'Make short notes for one chapter', icon: '📝', target: 1, unit: 'chapters', progressKey: 'p1_short_notes', difficulty: 'medium', rewardGems: 4, rewardStars: 10, rewardXp: 20, type: 'daily' },
                { id: 'p1_doubt_session', name: 'Doubt Destroyer', desc: 'Attend a live doubt session', icon: '💬', target: 1, unit: 'session', progressKey: 'p1_doubt_session', difficulty: 'easy', rewardGems: 3, rewardStars: 8, rewardXp: 15, type: 'daily' },
            ];
            weekly = [
                { id: 'p1_weekly_chapter', name: 'Chapter Completion', desc: 'Finish 2 full chapters from backlog', icon: '📚', target: 2, unit: 'chapters', progressKey: 'p1_weekly_chapters', difficulty: 'hard', rewardGems: 10, rewardStars: 40, rewardXp: 80, type: 'weekly' },
                { id: 'p1_weekly_notes', name: 'Note Compilation', desc: 'Create revision notes for 3 chapters', icon: '📝', target: 3, unit: 'chapters', progressKey: 'p1_weekly_notes', difficulty: 'medium', rewardGems: 5, rewardStars: 20, rewardXp: 40, type: 'weekly' },
                { id: 'p1_exemplar_set', name: 'Exemplar Expert', desc: 'Solve one full Exemplar problem set', icon: '📐', target: 1, unit: 'set', progressKey: 'p1_exemplar_set', difficulty: 'hard', rewardGems: 12, rewardStars: 35, rewardXp: 70, type: 'weekly' },
            ];
            boss = [
                { id: 'p1_boss_backlog', name: 'Backlog Exterminator', desc: 'Clear ENTIRE backlog of one subject', icon: '🐉', target: 1, unit: 'subject', progressKey: 'p1_boss_subject', difficulty: 'boss', rewardGems: 25, rewardStars: 80, rewardXp: 150, type: 'boss', oneTime: true },
            ];
        } else if (phase.id === 2) {
            daily = [
                { id: 'p2_daily_pyq', name: 'PYQ Hunter', desc: 'Solve 15 PYQs from last 5 years', icon: '📜', target: 15, unit: 'pyqs', progressKey: 'p2_pyq_daily', difficulty: 'medium', rewardGems: 4, rewardStars: 15, rewardXp: 35, type: 'daily' },
                { id: 'p2_daily_mixed', name: 'Mixed Practice', desc: 'Solve 25 mixed-concept questions', icon: '🧩', target: 25, unit: 'questions', progressKey: 'p2_mixed_questions', difficulty: 'medium', rewardGems: 4, rewardStars: 15, rewardXp: 35, type: 'daily' },
                { id: 'p2_daily_timed', name: 'Timed Sprint', desc: 'Solve 10 questions in 15 minutes', icon: '⏱️', target: 10, unit: 'questions', progressKey: 'p2_timed_questions', difficulty: 'hard', rewardGems: 6, rewardStars: 20, rewardXp: 50, type: 'daily' },
                { id: 'p2_advanced_prob', name: 'Advanced Problem Solver', desc: 'Solve 30 advanced problems', icon: '⚡', target: 30, unit: 'problems', progressKey: 'p2_advanced_prob', difficulty: 'hard', rewardGems: 8, rewardStars: 25, rewardXp: 55, type: 'daily' },
                { id: 'p2_error_analysis', name: 'Error Analyst', desc: 'Analyse 5 mistakes from past tests', icon: '🔍', target: 5, unit: 'errors', progressKey: 'p2_error_analysis', difficulty: 'medium', rewardGems: 5, rewardStars: 18, rewardXp: 40, type: 'daily' },
                { id: 'p2_formula_rev', name: 'Formula Flash', desc: 'Revise formulas from 3 chapters', icon: '⚙️', target: 3, unit: 'chapters', progressKey: 'p2_formula_rev', difficulty: 'easy', rewardGems: 3, rewardStars: 12, rewardXp: 25, type: 'daily' },
                { id: 'p2_hots', name: 'HOTS Hunter', desc: 'Solve 2 HOTS problems', icon: '🔥', target: 2, unit: 'problems', progressKey: 'p2_hots', difficulty: 'hard', rewardGems: 7, rewardStars: 20, rewardXp: 45, type: 'daily' },
            ];
            weekly = [
                { id: 'p2_weekly_pyq_set', name: 'PYQ Set Complete', desc: 'Complete full PYQ set of one chapter', icon: '📜', target: 1, unit: 'chapter_pyqs', progressKey: 'p2_weekly_pyq', difficulty: 'hard', rewardGems: 10, rewardStars: 35, rewardXp: 75, type: 'weekly' },
                { id: 'p2_weekly_accuracy', name: 'Accuracy Master', desc: 'Maintain 85%+ accuracy on 100 questions', icon: '🎯', target: 85, unit: 'percent', progressKey: 'p2_weekly_accuracy', difficulty: 'hard', rewardGems: 8, rewardStars: 30, rewardXp: 65, type: 'weekly' },
                { id: 'p2_chapter_test', name: 'Chapter Test Champion', desc: 'Finish one full-length chapterwise test', icon: '📝', target: 1, unit: 'test', progressKey: 'p2_chapter_test', difficulty: 'hard', rewardGems: 12, rewardStars: 40, rewardXp: 85, type: 'weekly' },
            ];
            boss = [
                { id: 'p2_boss_pyq_500', name: '500 PYQs Milestone', desc: 'Complete 500 PYQs total', icon: '🐉', target: 500, unit: 'pyqs', progressKey: 'p2_boss_pyq_total', difficulty: 'boss', rewardGems: 20, rewardStars: 70, rewardXp: 130, type: 'boss', oneTime: true },
            ];
        } else {
            daily = [
                { id: 'p3_daily_revision', name: 'Revision Cycle', desc: 'Revise 2 chapters completely', icon: '🔄', target: 2, unit: 'chapters', progressKey: 'p3_revision_chapters', difficulty: 'medium', rewardGems: 5, rewardStars: 18, rewardXp: 40, type: 'daily' },
                { id: 'p3_daily_error', name: 'Error Notebook', desc: 'Review and solve 5 past errors', icon: '📕', target: 5, unit: 'errors', progressKey: 'p3_errors_reviewed', difficulty: 'medium', rewardGems: 4, rewardStars: 15, rewardXp: 35, type: 'daily' },
                { id: 'p3_daily_formula', name: 'Formula Flash', desc: 'Revise all formulas from 3 chapters', icon: '⚡', target: 3, unit: 'chapters', progressKey: 'p3_formula_chapters', difficulty: 'easy', rewardGems: 2, rewardStars: 8, rewardXp: 20, type: 'daily' },
                { id: 'p3_time_drill', name: 'Time Management Drill', desc: 'Complete 3 timed section drills', icon: '⏳', target: 3, unit: 'sections', progressKey: 'p3_time_drill', difficulty: 'hard', rewardGems: 8, rewardStars: 25, rewardXp: 55, type: 'daily' },
            ];
            weekly = [
                { id: 'p3_weekly_mock', name: 'Mock Test Warrior', desc: 'Give 2 full mock tests', icon: '📝', target: 2, unit: 'mock_tests', progressKey: 'p3_weekly_mocks', difficulty: 'hard', rewardGems: 12, rewardStars: 40, rewardXp: 90, type: 'weekly' },
                { id: 'p3_weekly_analysis', name: 'Post-Mortem Pro', desc: 'Analyze mock test errors thoroughly', icon: '🔍', target: 1, unit: 'analysis', progressKey: 'p3_weekly_analysis', difficulty: 'medium', rewardGems: 5, rewardStars: 20, rewardXp: 40, type: 'weekly' },
                { id: 'p3_mock_analysis', name: 'Mock Analysis Master', desc: 'Deep analysis of one full mock test', icon: '📊', target: 1, unit: 'analysis', progressKey: 'p3_mock_analysis', difficulty: 'medium', rewardGems: 6, rewardStars: 25, rewardXp: 50, type: 'weekly' },
                { id: 'p3_physics_rev', name: 'Physics Unit Revision', desc: 'Revise entire Physics – 1 Unit', icon: '⚛️', target: 1, unit: 'unit', progressKey: 'p3_physics_rev', difficulty: 'hard', rewardGems: 10, rewardStars: 35, rewardXp: 80, type: 'weekly' },
                { id: 'p3_chemistry_rev', name: 'Chemistry Unit Revision', desc: 'Revise entire Chemistry – 1 Unit', icon: '🧪', target: 1, unit: 'unit', progressKey: 'p3_chemistry_rev', difficulty: 'hard', rewardGems: 10, rewardStars: 35, rewardXp: 80, type: 'weekly' },
                { id: 'p3_maths_rev', name: 'Maths Unit Revision', desc: 'Revise entire Maths – 1 Unit', icon: '📐', target: 1, unit: 'unit', progressKey: 'p3_maths_rev', difficulty: 'hard', rewardGems: 10, rewardStars: 35, rewardXp: 80, type: 'weekly' },
            ];
            boss = [
                { id: 'p3_boss_rank', name: 'Top Rank Simulation', desc: 'Score 200+ in mock test', icon: '👾', target: 200, unit: 'marks', progressKey: 'p3_boss_marks', difficulty: 'boss', rewardGems: 25, rewardStars: 90, rewardXp: 180, type: 'boss' },
                { id: 'p3_boss_full_syllabus', name: 'Full Syllabus Revision', desc: 'Complete one full syllabus revision cycle', icon: '🐉', target: 1, unit: 'full_revision', progressKey: 'p3_boss_revision', difficulty: 'boss', rewardGems: 30, rewardStars: 100, rewardXp: 200, type: 'boss', oneTime: true },
            ];
        }
        return { daily, weekly, boss };
    },

    getRecoveryQuests() {
        return [
            { id: 'recovery_low_day', name: 'Phoenix Rise', desc: 'Study 2 hours after a 0-hour day', icon: '🦅', target: 2, unit: 'hours', progressKey: 'recovery_phoenix', difficulty: 'medium', rewardGems: 5, rewardStars: 20, rewardXp: 40, type: 'recovery', triggerLowDay: true },
            { id: 'recovery_weak_topic', name: 'Weakness Warrior', desc: 'Spend 4 hours on weakest topic', icon: '💪', target: 4, unit: 'hours', progressKey: 'recovery_weakness', difficulty: 'hard', rewardGems: 10, rewardStars: 30, rewardXp: 65, type: 'recovery' },
            { id: 'recovery_backlog_sprint', name: 'Backlog Blitz', desc: 'Complete 3 pending tasks in one day', icon: '⚡', target: 3, unit: 'tasks', progressKey: 'recovery_blitz', difficulty: 'hard', rewardGems: 8, rewardStars: 25, rewardXp: 55, type: 'recovery' },
            { id: 'recovery_early_wake', name: 'Early Riser', desc: 'Wake up early for 5 days streak', icon: '🌅', target: 5, unit: 'days', progressKey: 'recovery_early_wake', difficulty: 'medium', rewardGems: 8, rewardStars: 30, rewardXp: 60, type: 'recovery' },
            { id: 'recovery_no_distraction', name: 'Zero Distraction Day', desc: 'Phone away & focused study for whole day', icon: '🚫', target: 1, unit: 'day', progressKey: 'recovery_no_distraction', difficulty: 'hard', rewardGems: 12, rewardStars: 40, rewardXp: 80, type: 'recovery' },
            { id: 'recovery_backlog_x2', name: 'Backlog Overdrive', desc: 'Complete 2x backlog tasks (6 total)', icon: '⚡', target: 6, unit: 'tasks', progressKey: 'recovery_backlog_x2', difficulty: 'hard', rewardGems: 15, rewardStars: 50, rewardXp: 100, type: 'recovery' },
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
            state.gems += rewardGems;
            state.stars += rewardStars;
            state.starsEarned += rewardStars;
            const bonusXP = Math.floor(rewardXp * state.prestigeBonuses.xpBonus / 100);
            state.xp += rewardXp + bonusXP;
            state.reputation += Math.floor(rewardXp / 5);
            UIRenderer.showToast(`Quest Complete! +${rewardGems}💎 +${rewardStars}⭐ +${rewardXp}XP`, '✅');
            completedNow = true;
        } else {
            UIRenderer.showToast(`Progress: ${state.questProgress[progressKey]}/${target}`, '📋');
        }
        StateManager.save();
        UIRenderer.refreshAll();
        AchievementSystem.checkAll();
        if (completedNow) AchievementSystem.checkAll();
    },
};

// ==================== MODULE: Achievement System ====================
const ACHIEVEMENTS = {
    study: [
        { id: 'theory_complete', name: 'Theory Warrior', desc: 'Completed full theory lecture', reward: 2, icon: '📖', condition: 'theoryLectures', target: 1 },
        { id: 'notes_done', name: 'Note Ninja', desc: 'Finished chapter notes', reward: 2, icon: '📝', condition: 'notesCompleted', target: 1 },
        { id: 'revision_done', name: 'Revision Master', desc: 'Completed chapter revision', reward: 5, icon: '🔄', condition: 'revisionsDone', target: 1 },
        { id: 'dpp_complete', name: 'DPP Dominator', desc: 'Completed one full DPP', reward: 3, icon: '📋', condition: 'dppCompleted', target: 1 },
        { id: 'pyq_set_done', name: 'PYQ Pro', desc: 'Completed one PYQ set', reward: 5, icon: '📜', condition: 'pyqSetsDone', target: 1 },
        { id: 'questions_100', name: 'Century Club', desc: 'Solved 100 questions', reward: 10, icon: '💯', condition: 'questionsSolved', target: 100 },
    ],
    test: [
        { id: 'above_target', name: 'Target Crusher', desc: 'Scored above target', reward: 10, icon: '🎯', condition: 'testsAboveTarget', target: 1 },
        { id: 'score_improved', name: 'Rising Star', desc: 'Improved test score by 10%+', reward: 5, icon: '📈', condition: 'scoreImproved', target: 1 },
        { id: 'silly_mistakes_reduced', name: 'Careful Calculator', desc: 'Reduced silly mistakes by 50%', reward: 20, icon: '🧮', condition: 'sillyMistakesReduced', target: 1 },
        { id: 'mock_test_100', name: 'Mock Test Warrior', desc: 'Scored 100+ in mock test', reward: 15, icon: '⚔️', condition: 'mockTestOver100', target: 1 },
    ],
    milestone: [
        { id: 'hours_100', name: 'Dedicated Scholar', desc: '100 study hours completed', reward: 20, icon: '⏰', condition: 'totalStudyHours', target: 100 },
        { id: 'hours_500', name: 'Elite Aspirant', desc: '500 study hours completed', reward: 50, icon: '⚡', condition: 'totalStudyHours', target: 500 },
        { id: 'questions_1000', name: 'Problem Solving Legend', desc: '1000 questions solved', reward: 30, icon: '🧠', condition: 'questionsSolved', target: 1000 },
        { id: 'chapters_10', name: 'Chapter Conqueror', desc: '10 chapters completed', reward: 15, icon: '📚', condition: 'chaptersCompleted', target: 10 },
        { id: 'reputation_100', name: 'Respected Scholar', desc: 'Earned 100 reputation', reward: 25, icon: '🏅', condition: 'reputation', target: 100 },
    ],
};

const BADGES = [
    { id: 'first_chapter', name: 'First Chapter Cleared', icon: '📖', condition: 'chaptersCompleted', target: 1, category: 'progress' },
    { id: 'chapter_master_5', name: 'Chapter Collector', icon: '📚', condition: 'chaptersCompleted', target: 5, category: 'progress' },
    { id: 'chapter_master_15', name: 'Syllabus Conqueror', icon: '🏆', condition: 'chaptersCompleted', target: 15, category: 'progress' },
    { id: 'hours_100_badge', name: 'Century Hours', icon: '⏰', condition: 'totalStudyHours', target: 100, category: 'hours' },
    { id: 'hours_500_badge', name: 'Dedication Demon', icon: '⚡', condition: 'totalStudyHours', target: 500, category: 'hours' },
    { id: 'hours_1000_badge', name: 'Immortal Scholar', icon: '👑', condition: 'totalStudyHours', target: 1000, category: 'hours' },
    { id: 'questions_1000_badge', name: 'Problem Solver', icon: '✏️', condition: 'questionsSolved', target: 1000, category: 'questions' },
    { id: 'pyq_100', name: 'PYQ Pioneer', icon: '📜', condition: 'pyqsSolved', target: 100, category: 'questions' },
    { id: 'mock_test_10', name: 'Mock Test Warrior', icon: '⚔️', condition: 'mockTestsGiven', target: 10, category: 'questions' },
    { id: 'revision_master', name: 'Revision Master', icon: '🔄', condition: 'chaptersRevised', target: 30, category: 'skill' },
    { id: 'streak_legend', name: 'Streak Legend', icon: '🔥', condition: 'maxStreak', target: 100, category: 'skill' },
    { id: 'economy_master', name: 'Economy Master', icon: '💰', condition: 'starsEarned', target: 1000, category: 'skill' },
    { id: 'combo_10', name: 'Combo King', icon: '🔗', condition: 'comboCount', target: 10, category: 'skill' },
    { id: 'critical_5', name: 'Lucky Striker', icon: '🎯', condition: 'criticalHits', target: 5, category: 'skill' },
];

const STREAK_BADGES = [
    { days: 7, name: 'Weekly Warrior', icon: '🔥', gemReward: 10, starReward: 50 },
    { days: 30, name: 'Monthly Master', icon: '⚡', gemReward: 30, starReward: 150, title: 'Consistent' },
    { days: 60, name: 'Two-Month Titan', icon: '💪', gemReward: 60, starReward: 300 },
    { days: 100, name: 'Century Champion', icon: '👑', gemReward: 100, starReward: 500, title: 'Unshakable' },
    { days: 200, name: 'Legend of Consistency', icon: '🏅', gemReward: 200, starReward: 1000 },
    { days: 365, name: 'Eternal Scholar', icon: '🌟', gemReward: 500, starReward: 2500, title: 'The Eternal' },
];

const PRODUCTIVITY_RANKS = [
    { name: 'Bronze Scholar', icon: '🥉', xpRequired: 1000, benefits: 'Basic themes unlocked', color: '#cd7f32' },
    { name: 'Silver Scholar', icon: '🥈', xpRequired: 5000, benefits: 'Quest priority + 1 freeze token/week', color: '#c0c0c0' },
    { name: 'Gold Scholar', icon: '🥇', xpRequired: 15000, benefits: 'Custom quest creation + 2 freeze tokens/week', color: '#ffd700' },
    { name: 'Platinum Pro', icon: '💠', xpRequired: 35000, benefits: 'AI study plan + Priority support', color: '#e0e0ff' },
    { name: 'Diamond Legend', icon: '💎', xpRequired: 70000, benefits: 'All features unlocked + Mentor mode', color: '#b0f0ff' },
];

const AchievementSystem = {
    checkAll() {
        let newUnlocks = false;
        [...ACHIEVEMENTS.study, ...ACHIEVEMENTS.test, ...ACHIEVEMENTS.milestone].forEach(a => {
            if (state.unlockedAchievements.includes(a.id)) return;
            const val = state[a.condition] || 0;
            if (val >= a.target) {
                state.unlockedAchievements.push(a.id);
                state.gems += a.reward;
                state.xp += a.reward * 3;
                state.reputation += a.reward;
                UIRenderer.showToast(`Achievement: ${a.icon} ${a.name}! +${a.reward}💎`, '🏆');
                newUnlocks = true;
            }
        });
        BADGES.forEach(b => {
            if (state.unlockedBadges.includes(b.id)) return;
            const val = state[b.condition] || 0;
            if (val >= b.target) {
                state.unlockedBadges.push(b.id);
                state.xp += Math.min(b.target, 500);
                state.reputation += 5;
                UIRenderer.showToast(`Badge Earned: ${b.icon} ${b.name}!`, '🎖️');
                newUnlocks = true;
            }
        });
        if (newUnlocks) {
            StateManager.save();
            UIRenderer.refreshAll();
        }
    },
};

// ==================== MODULE: Shop System ====================
const SHOP_ITEMS = {
    common: [
        { name: 'YouTube Short', cost: 3, icon: '📱', duration: '1 video', category: 'break' },
        { name: 'Telegram Scroll', cost: 3, icon: '💬', duration: '1 minute', category: 'break' },
        { name: 'Instagram Reel', cost: 3, icon: '📷', duration: '1 reel', category: 'break' },
        { name: 'Random Browsing', cost: 8, icon: '🌐', duration: '10 minutes', category: 'break' },
    ],
    entertainment: [
        { name: 'Cartoon Episode', cost: 10, icon: '📺', duration: '~20 minutes', category: 'entertainment' },
        { name: 'Anime Episode', cost: 12, icon: '🎬', duration: '~24 minutes', category: 'entertainment' },
        { name: 'YouTube Video', cost: 8, icon: '▶️', duration: '~10-15 minutes', category: 'entertainment' },
        { name: 'Gaming Session', cost: 25, icon: '🎮', duration: '30 minutes', category: 'entertainment' },
    ],
    premium: [
        { name: 'Movie Night', cost: 60, icon: '🎥', duration: 'full movie', category: 'premium', requiresStreak: 0 },
        { name: 'Half-Day Relaxation', cost: 100, icon: '🏖️', duration: '4-5 hours', category: 'premium', requiresStreak: 0 },
        { name: 'Favorite Food Treat', cost: 80, icon: '🍕', duration: 'meal time', category: 'premium', requiresStreak: 0 },
        { name: 'Weekend Off', cost: 250, icon: '🎉', duration: 'full day', category: 'premium', requiresStreak: 30 },
    ],
};

const ShopSystem = {
    purchase(name, cost, icon, duration) {
        if (state.stars < cost) {
            UIRenderer.showToast('Not enough stars! Complete quests to earn more.', '⚠️');
            return;
        }
        state.stars -= cost;
        state.purchasedItems.push({ name, cost, icon, duration, date: StateManager.getTodayKey() });
        UIRenderer.showToast(`Purchased: ${icon} ${name} for ⭐${cost}! Enjoy your ${duration}.`, '🛒');
        StateManager.save();
        UIRenderer.refreshAll();
    },

    buyFreezeToken() {
        if (state.gems < 15) {
            UIRenderer.showToast('Not enough gems! Need 15💎.', '⚠️');
            return;
        }
        if (state.freezeTokens >= 3) {
            UIRenderer.showToast('Max 3 freeze tokens stored!', '⚠️');
            return;
        }
        state.gems -= 15;
        state.freezeTokens += 1;
        UIRenderer.showToast('Freeze Token purchased! 🛡️ Streak protected.', '🛡️');
        StateManager.save();
        UIRenderer.refreshAll();
    },
};

// ==================== MODULE: Timer / Pomodoro ====================
const TimerManager = {
    interval: null,
    seconds: 0,
    total: 0,
    bonusActive: false,
    isPomodoro: false,
    pomodoroPhase: 'work',
    pomodoroCount: 0,
    pomodoroWorkDuration: 25,
    pomodoroBreakDuration: 5,
    pomodoroLongBreakDuration: 15,
    pomodoroSessionsBeforeLong: 4,

    start(minutes, isPomodoro = false) {
        this.stop(false);
        this.total = minutes * 60;
        this.seconds = this.total;
        this.bonusActive = !isPomodoro;
        this.isPomodoro = isPomodoro;
        if (isPomodoro) {
            this.pomodoroPhase = 'work';
            this.pomodoroWorkDuration = minutes;
        }
        this.updateDisplay();
        const stopBtn = document.getElementById('btnTimerStop');
        if (stopBtn) stopBtn.style.display = 'inline-block';
        document.querySelectorAll('.timer-preset-btn').forEach(b => b.style.display = 'none');
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = isPomodoro ? '🍅 Pomodoro work session active!' : '🔒 Focus Safe active! Complete the session for bonus stars.';
        this.interval = setInterval(() => this.tick(), 1000);
    },

    tick() {
        this.seconds--;
        this.updateDisplay();
        if (this.seconds <= 0) {
            if (this.isPomodoro && this.pomodoroPhase === 'work') {
                this.completePomodoroWork();
            } else if (this.isPomodoro && this.pomodoroPhase === 'break') {
                this.completePomodoroBreak();
            } else {
                this.complete();
            }
        }
    },

    completePomodoroWork() {
        clearInterval(this.interval);
        this.interval = null;
        this.pomodoroCount++;
        state.pomodoroCompleted++;
        state.totalFocusMinutes += this.pomodoroWorkDuration;
        const bonusStars = Math.floor(this.pomodoroWorkDuration * 0.8);
        state.stars += bonusStars;
        state.starsEarned += bonusStars;
        state.totalStudyHours += this.pomodoroWorkDuration / 60;
        const today = StateManager.getTodayKey();
        if (!state.dailyStudyHours[today]) state.dailyStudyHours[today] = 0;
        state.dailyStudyHours[today] += this.pomodoroWorkDuration / 60;
        state.xp += Math.floor(this.pomodoroWorkDuration * 1.5);
        state.reputation += 1;
        UIRenderer.showToast(`🍅 Pomodoro #${this.pomodoroCount} complete! +${bonusStars}⭐`, '✅');
        StateManager.save();
        UIRenderer.refreshAll();
        AchievementSystem.checkAll();
        const isLongBreak = this.pomodoroCount % this.pomodoroSessionsBeforeLong === 0;
        const breakMin = isLongBreak ? this.pomodoroLongBreakDuration : this.pomodoroBreakDuration;
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = isLongBreak ? `☕ Long break! ${breakMin} min rest.` : `☕ Short break! ${breakMin} min rest.`;
        this.startBreak(breakMin);
    },

    startBreak(minutes) {
        this.total = minutes * 60;
        this.seconds = this.total;
        this.pomodoroPhase = 'break';
        this.bonusActive = false;
        this.updateDisplay();
        this.interval = setInterval(() => this.tickBreak(), 1000);
    },

    tickBreak() {
        this.seconds--;
        this.updateDisplay();
        if (this.seconds <= 0) {
            this.completePomodoroBreak();
        }
    },

    completePomodoroBreak() {
        clearInterval(this.interval);
        this.interval = null;
        this.seconds = 0;
        this.pomodoroPhase = 'work';
        this.updateDisplay();
        const stopBtn = document.getElementById('btnTimerStop');
        if (stopBtn) stopBtn.style.display = 'none';
        document.querySelectorAll('.timer-preset-btn').forEach(b => b.style.display = 'inline-block');
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = '🍅 Break over! Ready for the next Pomodoro?';
        UIRenderer.showToast('☕ Break complete! Ready to focus again.', '✅');
    },

    stop(showToast = true) {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
        const completed = this.total - this.seconds;
        const completedMin = Math.round(completed / 60);
        if (completedMin >= 5 && this.bonusActive && !this.isPomodoro) {
            const bonusStars = Math.floor(completedMin * 1.5);
            state.stars += bonusStars;
            state.starsEarned += bonusStars;
            state.totalStudyHours += completedMin / 60;
            state.totalFocusMinutes += completedMin;
            const today = StateManager.getTodayKey();
            if (!state.dailyStudyHours[today]) state.dailyStudyHours[today] = 0;
            state.dailyStudyHours[today] += completedMin / 60;
            state.xp += Math.floor(completedMin * 1.2);
            state.reputation += Math.floor(completedMin / 10);
            if (showToast) UIRenderer.showToast(`Focus session complete! +${bonusStars}⭐ (1.5x bonus!)`, '🔓');
        } else if (completedMin > 0 && showToast) {
            UIRenderer.showToast('Session ended early. Partial credit earned.', '⏹️');
        }
        this.bonusActive = false;
        this.isPomodoro = false;
        this.seconds = 0;
        this.updateDisplay();
        const stopBtn = document.getElementById('btnTimerStop');
        if (stopBtn) stopBtn.style.display = 'none';
        document.querySelectorAll('.timer-preset-btn').forEach(b => b.style.display = 'inline-block');
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = 'Select a duration to start a focused session.';
        StateManager.save();
        UIRenderer.refreshAll();
        AchievementSystem.checkAll();
    },

    complete() {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
        const bonusStars = Math.floor((this.total / 60) * 1.5);
        state.stars += bonusStars;
        state.starsEarned += bonusStars;
        state.totalStudyHours += this.total / 3600;
        state.totalFocusMinutes += this.total / 60;
        const today = StateManager.getTodayKey();
        if (!state.dailyStudyHours[today]) state.dailyStudyHours[today] = 0;
        state.dailyStudyHours[today] += this.total / 3600;
        state.xp += Math.floor((this.total / 60) * 1.2);
        state.reputation += Math.floor(this.total / 600);
        UIRenderer.showToast(`Focus Safe complete! +${bonusStars}⭐ (1.5x bonus!) 🎉`, '🔓');
        this.bonusActive = false;
        this.seconds = 0;
        this.updateDisplay();
        const stopBtn = document.getElementById('btnTimerStop');
        if (stopBtn) stopBtn.style.display = 'none';
        document.querySelectorAll('.timer-preset-btn').forEach(b => b.style.display = 'inline-block');
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = 'Great focus session! Select another to continue.';
        StateManager.save();
        UIRenderer.refreshAll();
        AchievementSystem.checkAll();
    },

    updateDisplay() {
        const mins = Math.floor(Math.abs(this.seconds) / 60);
        const secs = Math.abs(this.seconds) % 60;
        const display = document.getElementById('timerDisplay');
        if (display) {
            display.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        }
    },

    getStatus() {
        if (this.interval) return 'running';
        return 'idle';
    },
};

// ==================== MODULE: Backlog System ====================
const BacklogSystem = {
    addItem(name, subject, priority) {
        const item = {
            id: 'backlog_' + Date.now(),
            name,
            subject,
            priority: priority || 'medium',
            completed: false,
            addedDate: StateManager.getTodayKey(),
            completedDate: null,
        };
        state.backlogItems.push(item);
        StateManager.save();
        UIRenderer.refreshAll();
        UIRenderer.showToast(`Backlog item added: ${name}`, '📝');
    },

    toggleComplete(itemId) {
        const item = state.backlogItems.find(i => i.id === itemId);
        if (!item) return;
        item.completed = !item.completed;
        item.completedDate = item.completed ? StateManager.getTodayKey() : null;
        if (item.completed) {
            state.xp += 15;
            state.reputation += 2;
            if (item.subject && state.subjectXP[item.subject] !== undefined) {
                StateManager.addSubjectXP(item.subject, 20);
            }
            state.chaptersCompleted += 1;
            UIRenderer.showToast(`Backlog item completed! +15XP`, '✅');
        }
        StateManager.save();
        UIRenderer.refreshAll();
        AchievementSystem.checkAll();
    },

    deleteItem(itemId) {
        state.backlogItems = state.backlogItems.filter(i => i.id !== itemId);
        StateManager.save();
        UIRenderer.refreshAll();
        UIRenderer.showToast('Backlog item removed.', '🗑️');
    },

    getActiveCount() {
        return state.backlogItems.filter(i => !i.completed).length;
    },

    getBySubject(subject) {
        return state.backlogItems.filter(i => i.subject === subject && !i.completed);
    },
};

// ==================== MODULE: Session History ====================
const SessionHistory = {
    addSession(hours, questions, subject, notes) {
        const session = {
            id: 'session_' + Date.now(),
            date: StateManager.getTodayKey(),
            timestamp: new Date().toISOString(),
            hours: hours || 0,
            questions: questions || 0,
            subject: subject || 'general',
            notes: notes || '',
            criticalHit: false,
        };
        if (StateManager.rollCriticalHit() && hours > 0) {
            session.criticalHit = true;
            state.criticalHits += 1;
            const bonusXP = Math.floor(hours * 25);
            state.xp += bonusXP;
            UIRenderer.showToast(`💥 CRITICAL HIT! +${bonusXP} bonus XP!`, '💥');
        }
        state.sessionHistory.unshift(session);
        if (state.sessionHistory.length > 200) state.sessionHistory = state.sessionHistory.slice(0, 200);
        if (subject && state.subjectXP[subject] !== undefined) {
            StateManager.addSubjectXP(subject, Math.floor(hours * 15 + questions * 0.5));
            if (!state.subjectStudyHours[subject]) state.subjectStudyHours[subject] = 0;
            state.subjectStudyHours[subject] += hours;
            if (!state.subjectQuestions[subject]) state.subjectQuestions[subject] = 0;
            state.subjectQuestions[subject] += questions;
        }
        if (state.comboSubject === subject && hours > 0) {
            state.comboCount += 1;
            if (state.comboCount >= 5) {
                const comboBonus = state.comboCount * 5;
                state.xp += comboBonus;
                UIRenderer.showToast(`🔗 ${state.comboCount}-day ${SUBJECT_NAMES[subject] || 'Study'} Combo! +${comboBonus}XP`, '🔗');
            }
        } else if (hours > 0 && subject !== 'general') {
            state.comboSubject = subject;
            state.comboCount = 1;
        }
        StateManager.save();
        this.checkWeeklyReport();
    },

    checkWeeklyReport() {
        const today = StateManager.getTodayKey();
        const todayDate = new Date(today);
        const dayOfWeek = todayDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) return;
        if (state.lastWeeklyReportDate === today) return;
        state.lastWeeklyReportDate = today;
        const weekStart = new Date(todayDate);
        weekStart.setDate(weekStart.getDate() - 7);
        const weekKey = weekStart.toISOString().split('T')[0];
        const weekSessions = state.sessionHistory.filter(s => s.date >= weekKey && s.date <= today);
        const totalHours = weekSessions.reduce((sum, s) => sum + s.hours, 0);
        const totalQuestions = weekSessions.reduce((sum, s) => sum + s.questions, 0);
        const report = {
            weekStart: weekKey,
            weekEnd: today,
            totalHours: Math.round(totalHours * 10) / 10,
            totalQuestions,
            sessionsCount: weekSessions.length,
            criticalHits: weekSessions.filter(s => s.criticalHit).length,
        };
        state.weeklyReports.push(report);
        if (state.weeklyReports.length > 50) state.weeklyReports = state.weeklyReports.slice(-50);
        if (totalHours >= 20) {
            state.gems += 5;
            state.reputation += 10;
            UIRenderer.showToast(`📊 Weekly Report: ${totalHours}h studied! Outstanding week! +5💎`, '📊');
        } else if (totalHours >= 10) {
            state.reputation += 5;
            UIRenderer.showToast(`📊 Weekly Report: ${totalHours}h studied! Good consistency.`, '📊');
        }
        StateManager.save();
    },
};

// ==================== MODULE: UI Renderer ====================
const UIRenderer = {
    updateHeaderStats() {
        const gemsSpan = document.querySelector('#headerGems span');
        const starsSpan = document.querySelector('#headerStars span');
        const streakSpan = document.querySelector('#headerStreak span');
        const xpSpan = document.querySelector('#headerXP span');
        if (gemsSpan) gemsSpan.textContent = state.gems;
        if (starsSpan) starsSpan.textContent = state.stars;
        if (streakSpan) streakSpan.textContent = state.streak;
        if (xpSpan) xpSpan.textContent = state.xp;
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
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 3200);
    },

    updateStorageSize() {
        const el = document.getElementById('storageSize');
        if (!el) return;
        try {
            const data = localStorage.getItem('jeeRpgState');
            if (data) {
                const sizeKB = (new Blob([data]).size / 1024).toFixed(1);
                el.textContent = sizeKB + ' KB';
            } else {
                el.textContent = '0 KB';
            }
        } catch (e) {
            el.textContent = 'Unknown';
        }
    },

    renderDashboard() {
        const days = StateManager.getDaysUntilExam();
        const countdownEl = document.getElementById('countdownDisplay');
        if (countdownEl) {
            countdownEl.textContent = days;
            if (days < 30) countdownEl.classList.add('countdown-urgent');
            else countdownEl.classList.remove('countdown-urgent');
        }
        const streakEl = document.getElementById('streakDisplay');
        if (streakEl) streakEl.textContent = state.streak + ' 🔥';
        const hoursEl = document.getElementById('totalHoursDisplay');
        if (hoursEl) hoursEl.textContent = Math.round(state.totalStudyHours * 10) / 10 + 'h';
        const questionsEl = document.getElementById('questionsDisplay');
        if (questionsEl) questionsEl.textContent = state.questionsSolved;
        const phase = getCurrentPhase();
        const phaseBadge = document.getElementById('phaseBadge');
        if (phaseBadge) {
            phaseBadge.textContent = 'Phase ' + phase.id + ': ' + phase.name;
            phaseBadge.className = 'phase-badge ' + phase.cssClass;
        }
        const today = StateManager.getTodayKey();
        const checkedIn = state.lastCheckInDate === today;
        const btnCheckIn = document.getElementById('btnCheckIn');
        if (btnCheckIn) {
            if (checkedIn) {
                btnCheckIn.textContent = '✅ Checked In Today!';
                btnCheckIn.disabled = true;
                btnCheckIn.style.opacity = '0.6';
            } else {
                btnCheckIn.textContent = '✅ Check In for Today';
                btnCheckIn.disabled = false;
                btnCheckIn.style.opacity = '1';
            }
        }
        const checkinMsg = document.getElementById('checkinMsg');
        if (checkinMsg) {
            checkinMsg.textContent = checkedIn ? 'Great job! Come back tomorrow.' :
                (state.streak === 0 ? 'Start your streak today! Every day counts.' : 'Keep your ' + state.streak + '-day streak going!');
        }
        this.renderMotivationalMessage();
        this.renderHeatmap();
        const examInput = document.getElementById('examDateInput');
        if (examInput) examInput.value = EXAM_DATE.toISOString().split('T')[0];
        this.updateStorageSize();
    },

    renderMotivationalMessage() {
        const el = document.getElementById('motivationalMsg');
        if (!el) return;
        const streak = state.streak;
        const todayHours = state.dailyStudyHours[StateManager.getTodayKey()] || 0;
        const days = StateManager.getDaysUntilExam();
        let msg;
        if (streak >= 100) msg = 'LEGEND STATUS. You\'re unstoppable! 👑';
        else if (streak >= 30) msg = 'You\'re in the top 5% of aspirants. Keep going! 💪';
        else if (streak >= 7) msg = 'You\'ve built momentum. Don\'t break the chain! 🔥';
        else if (streak < 3 && streak > 0) msg = 'Building momentum... Keep the chain alive! ⚡';
        else msg = 'Every great journey starts with a single day. Start today! 🌟';
        if (todayHours > 6) msg = 'Beast mode activated! Remember to take breaks. 🏋️';
        if (days < 30) msg = 'Final sprint. Every minute counts now! 🏃';
        if (todayHours < 0.5 && streak > 0) msg = 'One small session today keeps the backlog away. 💪';
        el.textContent = msg;
    },

    renderHeatmap() {
        const container = document.getElementById('heatmapContainer');
        if (!container) return;
        const cells = [];
        for (let i = 27; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const hours = state.dailyStudyHours[key] || 0;
            let cls = '';
            if (hours >= 6) cls = 'h4';
            else if (hours >= 4) cls = 'h3';
            else if (hours >= 2) cls = 'h2';
            else if (hours > 0) cls = 'h1';
            cells.push(`<span class="heatmap-cell ${cls}" title="${key}: ${hours}h"></span>`);
        }
        container.innerHTML = cells.join('');
    },

    renderQuests() {
        const phaseQuests = QuestEngine.getPhaseQuests();
        const recoveryQuests = QuestEngine.getRecoveryQuests();
        this.renderQuestGroup('dailyQuestsContainer', phaseQuests.daily);
        this.renderQuestGroup('weeklyQuestsContainer', phaseQuests.weekly);
        this.renderQuestGroup('bossQuestsContainer', phaseQuests.boss);
        this.renderQuestGroup('recoveryQuestsContainer', recoveryQuests);
        this.renderCompletedQuests();
    },

    renderQuestGroup(containerId, quests) {
        const container = document.getElementById(containerId);
        if (!container) return;
        let html = '';
        quests.forEach(q => {
            const progress = state.questProgress[q.progressKey] || 0;
            const completed = state.completedQuestIds.includes(q.id);
            const pct = Math.min(100, Math.round((progress / q.target) * 100));
            const locked = q.oneTime && completed;
            const cls = completed ? 'completed' : (locked ? 'locked' : '');
            html += `
                <div class="quest-item ${cls}">
                  <span class="quest-icon">${q.icon}</span>
                  <div class="quest-info">
                    <div class="quest-name">${q.name} ${completed ? '✓' : (locked ? '🔒' : '')}</div>
                    <div class="quest-desc">${q.desc} • <span class="difficulty-tag difficulty-${q.difficulty}">${q.difficulty.toUpperCase()}</span></div>
                  </div>
                  <div class="quest-progress-bar">
                    <div class="quest-progress-fill ${completed ? 'completed-fill' : ''}" style="width:${pct}%;"></div>
                  </div>
                  <span class="quest-progress-text">${progress}/${q.target} ${q.unit}</span>
                  <span class="quest-reward">+${q.rewardGems}💎</span>
                  <div class="quest-actions">
                    ${!completed && !locked ? `<button class="btn btn-quest small" onclick="window.addQuestProgress('${q.progressKey}', '${q.id}', ${q.target}, ${q.rewardGems}, ${q.rewardStars}, ${q.rewardXp})">+1</button>` : ''}
                    ${completed ? '<span class="quest-claimed">CLAIMED</span>' : ''}
                  </div>
                </div>`;
        });
        if (html === '') html = '<p class="empty-state-text">No quests available for this phase.</p>';
        container.innerHTML = html;
    },

    renderCompletedQuests() {
        const container = document.getElementById('completedQuestsContainer');
        if (!container) return;
        const allQuests = QuestEngine.getAllQuests();
        const completed = allQuests.filter(q => state.completedQuestIds.includes(q.id));
        if (completed.length === 0) {
            container.innerHTML = '<p class="empty-state-text">Complete quests to see them here!</p>';
            return;
        }
        container.innerHTML = completed.slice(-8).reverse().map(q =>
            `<div class="quest-item completed" style="margin-bottom:4px;">
                <span class="quest-icon">${q.icon}</span>
                <div class="quest-info"><div class="quest-name">${q.name} ✓</div></div>
                <span class="quest-reward">+${q.rewardGems}💎</span>
              </div>`
        ).join('');
    },

    renderShop() {
        this.renderShopGroup('shopCommonContainer', SHOP_ITEMS.common);
        this.renderShopGroup('shopEntertainmentContainer', SHOP_ITEMS.entertainment);
        this.renderShopGroup('shopPremiumContainer', SHOP_ITEMS.premium);
    },

    renderShopGroup(containerId, items) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = items.map(item => {
            const canAfford = state.stars >= item.cost;
            const streakReqMet = !item.requiresStreak || state.streak >= item.requiresStreak;
            const disabled = !canAfford || !streakReqMet;
            let reason = '';
            if (!canAfford) reason = 'Not enough stars';
            if (!streakReqMet) reason = 'Need ' + item.requiresStreak + '-day streak';
            return `
                <div class="shop-item">
                  <span class="shop-item-icon">${item.icon}</span>
                  <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.duration} • ${item.category}</div>
                  </div>
                  <span class="shop-cost">⭐ ${item.cost}</span>
                  <button class="btn gold small" ${disabled ? 'disabled style="opacity:0.4;"' : ''}
                    onclick="window.purchaseItem('${item.name}', ${item.cost}, '${item.icon}', '${item.duration}')"
                    title="${reason}">
                    🛒 Buy
                  </button>
                </div>`;
        }).join('');
    },

    renderAchievements() {
        this.renderAchGroup('achStudyContainer', ACHIEVEMENTS.study);
        this.renderAchGroup('achTestContainer', ACHIEVEMENTS.test);
        this.renderAchGroup('achMilestoneContainer', ACHIEVEMENTS.milestone);
    },

    renderAchGroup(containerId, achievements) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = achievements.map(a => {
            const earned = state.unlockedAchievements.includes(a.id);
            const currentVal = state[a.condition] || 0;
            const pct = Math.min(100, Math.round((currentVal / a.target) * 100));
            return `
                <div class="ach-item ${earned ? 'earned' : ''}">
                  <span class="ach-icon">${a.icon}</span>
                  <div class="ach-info">
                    <div class="ach-name">${a.name} ${earned ? '✅' : ''}</div>
                    <div class="ach-desc">${a.desc}</div>
                    <div class="ach-progress-mini">${Math.min(currentVal, a.target)}/${a.target} (${pct}%)</div>
                  </div>
                  <span class="ach-reward">+${a.reward}💎</span>
                </div>`;
        }).join('');
    },

    renderBadges() {
        const container = document.getElementById('badgesContainer');
        if (!container) return;
        container.innerHTML = BADGES.map(b => {
            const earned = state.unlockedBadges.includes(b.id);
            const currentVal = state[b.condition] || 0;
            return `
                <div class="badge-item ${earned ? 'earned' : 'locked-badge'}">
                  <div class="badge-icon">${b.icon}</div>
                  <div class="badge-name">${b.name}</div>
                  <div class="badge-progress-text">${earned ? 'Earned!' : currentVal + '/' + b.target}</div>
                </div>`;
        }).join('');
    },

    renderRank() {
        const xp = state.xp;
        let currentRank = PRODUCTIVITY_RANKS[0];
        let nextRank = PRODUCTIVITY_RANKS[1];
        for (let i = PRODUCTIVITY_RANKS.length - 1; i >= 0; i--) {
            if (xp >= PRODUCTIVITY_RANKS[i].xpRequired) {
                currentRank = PRODUCTIVITY_RANKS[i];
                nextRank = PRODUCTIVITY_RANKS[i + 1] || null;
                break;
            }
        }
        const container = document.getElementById('rankDisplay');
        if (!container) return;
        const prevXp = currentRank.xpRequired;
        const nextXp = nextRank ? nextRank.xpRequired : currentRank.xpRequired * 2;
        const pct = Math.min(100, Math.round(((xp - prevXp) / (nextXp - prevXp)) * 100));
        container.innerHTML = `
            <p class="rank-name">${currentRank.icon} ${currentRank.name}</p>
            <p class="rank-benefits">${currentRank.benefits}</p>
            <div class="rank-bar-bg"><div class="rank-bar-fill" style="width:${pct}%;background:${currentRank.color};"></div></div>
            <p class="rank-xp-text">${xp} / ${nextXp} XP ${nextRank ? '→ ' + nextRank.name : '(MAX)'}</p>
            <p class="rank-reputation">🏅 Reputation: ${state.reputation}</p>
        `;
    },

    renderVault() {
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) statusEl.textContent = 'Select a duration to start a focused session.';
        const display = document.getElementById('timerDisplay');
        if (display) display.textContent = '00:00';
        const stopBtn = document.getElementById('btnTimerStop');
        if (stopBtn) stopBtn.style.display = 'none';
        document.querySelectorAll('.timer-preset-btn').forEach(b => {
            if (b) b.style.display = 'inline-block';
        });
    },

    renderSubjects() {
        const container = document.getElementById('subjectsContainer');
        if (!container) return;
        let html = '';
        ['physics', 'chemistry', 'math'].forEach(subj => {
            const xp = state.subjectXP[subj] || 0;
            const level = state.subjectLevels[subj] || 1;
            const hours = state.subjectStudyHours[subj] || 0;
            const questions = state.subjectQuestions[subj] || 0;
            const nextLevelXP = StateManager.getSubjectLevelXP(level);
            const currentLevelXP = StateManager.getSubjectLevelXP(level - 1);
            const xpInLevel = xp - currentLevelXP;
            const xpNeeded = nextLevelXP - currentLevelXP;
            const pct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
            const backlogCount = BacklogSystem.getBySubject(subj).length;
            html += `
                <div class="subject-card">
                    <div class="subject-header">
                        <span class="subject-icon">${SUBJECT_ICONS[subj]}</span>
                        <div>
                            <div class="subject-name">${SUBJECT_NAMES[subj]}</div>
                            <div class="subject-level">Level ${level}</div>
                        </div>
                        <span class="subject-xp-badge">${xp} XP</span>
                    </div>
                    <div class="subject-progress-bar">
                        <div class="subject-progress-fill" style="width:${pct}%;background:${SUBJECT_COLORS[subj]};"></div>
                    </div>
                    <div class="subject-stats-row">
                        <div class="subject-stat"><span>${Math.round(hours * 10) / 10}h</span><small>Study Hours</small></div>
                        <div class="subject-stat"><span>${questions}</span><small>Questions</small></div>
                        <div class="subject-stat"><span>${backlogCount}</span><small>Backlog Items</small></div>
                    </div>
                </div>`;
        });
        container.innerHTML = html;
    },

    renderCalendar(monthOffset = 0) {
        const container = document.getElementById('calendarGrid');
        const titleEl = document.getElementById('calendarTitle');
        if (!container || !titleEl) return;
        const now = new Date();
        const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
        const year = targetMonth.getFullYear();
        const month = targetMonth.getMonth();
        titleEl.textContent = targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let html = '';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(d => { html += `<div class="calendar-day-header">${d}</div>`; });
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-cell empty"></div>';
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hours = state.dailyStudyHours[dateKey] || 0;
            let cls = 'calendar-cell';
            if (dateKey === StateManager.getTodayKey()) cls += ' today';
            if (hours >= 6) cls += ' cal-h4';
            else if (hours >= 4) cls += ' cal-h3';
            else if (hours >= 2) cls += ' cal-h2';
            else if (hours > 0) cls += ' cal-h1';
            const hasReflection = state.dailyReflections[dateKey] ? ' 📝' : '';
            html += `<div class="${cls}" title="${dateKey}: ${hours}h${hasReflection}">
                <span class="calendar-day-num">${day}</span>
                ${hours > 0 ? `<span class="calendar-hours">${hours}h</span>` : ''}
            </div>`;
        }
        container.innerHTML = html;
        const totalMonthHours = Object.entries(state.dailyStudyHours)
            .filter(([key]) => key.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
            .reduce((sum, [, h]) => sum + h, 0);
        const summaryEl = document.getElementById('calendarSummary');
        if (summaryEl) summaryEl.textContent = `📊 ${targetMonth.toLocaleDateString('en-US', { month: 'long' })} Total: ${Math.round(totalMonthHours * 10) / 10}h`;
        window._calendarOffset = monthOffset;
    },

    renderBacklog() {
        const container = document.getElementById('backlogList');
        if (!container) return;
        const activeItems = state.backlogItems.filter(i => !i.completed);
        const completedItems = state.backlogItems.filter(i => i.completed);
        if (activeItems.length === 0 && completedItems.length === 0) {
            container.innerHTML = '<p class="empty-state-text">No backlog items yet. Add your first pending task!</p>';
            return;
        }
        let html = '<div class="backlog-section-title">📋 Active Backlog</div>';
        if (activeItems.length === 0) html += '<p class="empty-state-text">All caught up! 🎉</p>';
        activeItems.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
        }).forEach(item => {
            const subjIcon = SUBJECT_ICONS[item.subject] || '📚';
            html += `
                <div class="backlog-item priority-${item.priority}">
                    <span class="backlog-subject">${subjIcon} ${item.subject || 'General'}</span>
                    <span class="backlog-name">${item.name}</span>
                    <span class="backlog-priority-tag priority-${item.priority}">${item.priority}</span>
                    <div class="backlog-actions">
                        <button class="btn success small" onclick="window.backlogToggle('${item.id}')">✓</button>
                        <button class="btn danger small" onclick="window.backlogDelete('${item.id}')">✕</button>
                    </div>
                </div>`;
        });
        if (completedItems.length > 0) {
            html += '<div class="backlog-section-title">✅ Recently Completed</div>';
            completedItems.slice(-5).reverse().forEach(item => {
                html += `
                <div class="backlog-item completed-item">
                    <span class="backlog-subject">${SUBJECT_ICONS[item.subject] || '📚'} ${item.subject || 'General'}</span>
                    <span class="backlog-name" style="text-decoration:line-through;">${item.name}</span>
                    <span class="backlog-completed-date">${item.completedDate}</span>
                </div>`;
            });
        }
        container.innerHTML = html;
    },

    renderSessionHistory() {
        const container = document.getElementById('sessionHistoryList');
        if (!container) return;
        const sessions = state.sessionHistory.slice(0, 30);
        if (sessions.length === 0) {
            container.innerHTML = '<p class="empty-state-text">No study sessions recorded yet.</p>';
            return;
        }
        container.innerHTML = `
            <div class="history-table">
                <div class="history-row history-header">
                    <span>Date</span><span>Subject</span><span>Hours</span><span>Questions</span><span>Notes</span>
                </div>
                ${sessions.map(s => `
                <div class="history-row ${s.criticalHit ? 'critical-hit-row' : ''}">
                    <span>${s.date}</span>
                    <span>${SUBJECT_ICONS[s.subject] || '📚'} ${s.subject || 'General'}</span>
                    <span>${s.hours}h</span>
                    <span>${s.questions}</span>
                    <span>${s.criticalHit ? '💥 Critical!' : (s.notes || '-')}</span>
                </div>`).join('')}
            </div>
        `;
        const statsEl = document.getElementById('sessionStats');
        if (statsEl) {
            const totalSessions = state.sessionHistory.length;
            const avgHours = totalSessions > 0 ? Math.round((state.totalStudyHours / totalSessions) * 100) / 100 : 0;
            statsEl.textContent = `📈 ${totalSessions} sessions | Avg: ${avgHours}h/session | 💥 Critical Hits: ${state.criticalHits}`;
        }
    },

    renderWeeklyReports() {
        const container = document.getElementById('weeklyReportsList');
        if (!container) return;
        const reports = state.weeklyReports.slice(-10).reverse();
        if (reports.length === 0) {
            container.innerHTML = '<p class="empty-state-text">Weekly reports will appear here automatically.</p>';
            return;
        }
        container.innerHTML = reports.map(r => `
            <div class="report-item">
                <span class="report-date">📅 ${r.weekStart} → ${r.weekEnd}</span>
                <span>⏰ ${r.totalHours}h</span>
                <span>✏️ ${r.totalQuestions} Qs</span>
                <span>📋 ${r.sessionsCount} sessions</span>
                ${r.criticalHits > 0 ? `<span>💥 ${r.criticalHits} crits</span>` : ''}
            </div>
        `).join('');
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
            case 'panel-history': this.renderSessionHistory(); this.renderWeeklyReports(); break;
            case 'panel-settings': this.updateStorageSize();
                const examInput = document.getElementById('examDateInput');
                if (examInput) examInput.value = EXAM_DATE.toISOString().split('T')[0];
                break;
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
        if (tabName === 'history') { this.renderSessionHistory(); this.renderWeeklyReports(); }
        this.refreshAll();
    },
};

// ==================== MODULE: Data Manager ====================
const DataManager = {
    exportData() {
        try {
            const exportObj = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                examDate: EXAM_DATE.toISOString().split('T')[0],
                state: JSON.parse(JSON.stringify(state)),
            };
            const jsonStr = JSON.stringify(exportObj, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'jee-rpg-save-' + StateManager.getTodayKey() + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            UIRenderer.showToast('Save data exported successfully! 📤', '💾');
        } catch (e) {
            console.error('Export failed:', e);
            UIRenderer.showToast('Export failed. Please try again.', '⚠️');
        }
    },

    showImportModal() {
        const modal = document.getElementById('importModal');
        const textarea = document.getElementById('importDataText');
        if (modal) modal.style.display = 'flex';
        if (textarea) { textarea.value = ''; textarea.focus(); }
    },

    hideImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) modal.style.display = 'none';
    },

    importData() {
        const textarea = document.getElementById('importDataText');
        if (!textarea) return;
        const text = textarea.value.trim();
        if (!text) { UIRenderer.showToast('Please paste your save data first.', '⚠️'); return; }
        try {
            const imported = JSON.parse(text);
            if (!imported.state || typeof imported.state !== 'object') throw new Error('Invalid format');
            if (!confirm('⚠️ This will overwrite ALL your current progress. Are you sure?')) return;
            const backup = JSON.parse(JSON.stringify(state));
            try {
                state = { ...JSON.parse(JSON.stringify(DEFAULT_STATE)), ...imported.state };
                if (imported.examDate) {
                    EXAM_DATE = new Date(imported.examDate + 'T00:00:00');
                    state.examDate = imported.examDate;
                }
                if (!state.subjectXP) state.subjectXP = { physics: 0, chemistry: 0, math: 0 };
                if (!state.subjectLevels) state.subjectLevels = { physics: 1, chemistry: 1, math: 1 };
                if (!state.subjectStudyHours) state.subjectStudyHours = { physics: 0, chemistry: 0, math: 0 };
                if (!state.subjectQuestions) state.subjectQuestions = { physics: 0, chemistry: 0, math: 0 };
                if (!state.sessionHistory) state.sessionHistory = [];
                if (!state.backlogItems) state.backlogItems = [];
                if (!state.dailyReflections) state.dailyReflections = {};
                if (!state.reputation) state.reputation = 0;
                if (!state.criticalHits) state.criticalHits = 0;
                if (!state.weeklyReports) state.weeklyReports = [];
                if (!state.pomodoroCompleted) state.pomodoroCompleted = 0;
                if (!state.totalFocusMinutes) state.totalFocusMinutes = 0;
                StateManager.save();
                this.hideImportModal();
                UIRenderer.refreshAll();
                UIRenderer.showToast('Save data imported successfully! 📥', '✅');
            } catch (mergeError) {
                state = backup;
                StateManager.save();
                throw mergeError;
            }
        } catch (e) {
            console.error('Import failed:', e);
            UIRenderer.showToast('Invalid save data. Please check the format.', '❌');
        }
    },

    resetAllData() {
        if (!confirm('🗑️ This will DELETE all your progress. This cannot be undone. Are you sure?')) return;
        if (!confirm('Type "RESET" in the next dialog.') || prompt('Type RESET to confirm:') !== 'RESET') {
            UIRenderer.showToast('Reset cancelled.', '✅');
            return;
        }
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        EXAM_DATE = new Date('2027-01-10T00:00:00');
        state.examDate = '2027-01-10';
        StateManager.save();
        UIRenderer.refreshAll();
        const examInput = document.getElementById('examDateInput');
        if (examInput) examInput.value = '2027-01-10';
        UIRenderer.showToast('All data has been reset. Fresh start! 🌟', '🗑️');
    },
};

// ==================== MODULE: Check-In System ====================
const CheckInSystem = {
    checkIn() {
        const today = StateManager.getTodayKey();
        if (state.lastCheckInDate === today) {
            UIRenderer.showToast('Already checked in today! Come back tomorrow.', '📅');
            return;
        }
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];
        if (state.lastCheckInDate === yesterdayKey) {
            state.streak += 1;
        } else if (state.lastCheckInDate && state.lastCheckInDate !== yesterdayKey && state.streak > 0) {
            if (state.freezeTokens > 0) {
                state.freezeTokens -= 1;
                state.streak += 1;
                UIRenderer.showToast('Freeze token used! Streak protected. ❄️', '🛡️');
            } else {
                state.streak = 1;
                UIRenderer.showToast('Streak reset. Start a new chain!', '🔄');
            }
        } else {
            state.streak = 1;
        }
        state.lastCheckInDate = today;
        if (state.streak > state.maxStreak) state.maxStreak = state.streak;
        state.xp += state.streak;
        state.reputation += 1;
        STREAK_BADGES.forEach(sb => {
            if (state.streak >= sb.days && !state.unlockedStreakBadges.includes(sb.days)) {
                state.unlockedStreakBadges.push(sb.days);
                state.gems += sb.gemReward;
                state.stars += sb.starReward;
                state.starsEarned += sb.starReward;
                state.xp += sb.gemReward * 3;
                state.reputation += sb.gemReward;
                UIRenderer.showToast(`Streak Badge: ${sb.icon} ${sb.name}! +${sb.gemReward}💎 +${sb.starReward}⭐`, sb.icon);
            }
        });
        UIRenderer.showToast(`Checked in! Streak: ${state.streak} days 🔥`, '✅');
        StateManager.save();
        UIRenderer.refreshAll();
        AchievementSystem.checkAll();
    },
};

// ==================== MODULE: Study Logger ====================
const StudyLogger = {
    logStudy() {
        const hoursInput = document.getElementById('logHours');
        const questionsInput = document.getElementById('logQuestions');
        const subjectSelect = document.getElementById('logSubject');
        const notesInput = document.getElementById('logNotes');
        const hours = parseFloat(hoursInput?.value) || 0;
        const questions = parseInt(questionsInput?.value) || 0;
        const subject = subjectSelect?.value || 'general';
        const notes = notesInput?.value || '';
        if (hours === 0 && questions === 0) {
            UIRenderer.showToast('Enter study hours or questions solved.', '⚠️');
            return;
        }
        const today = StateManager.getTodayKey();
        state.totalStudyHours += hours;
        state.questionsSolved += questions;
        if (!state.dailyStudyHours[today]) state.dailyStudyHours[today] = 0;
        state.dailyStudyHours[today] += hours;
        state.xp += Math.floor(hours * 15 + questions * 0.5);
        state.reputation += Math.floor(hours * 2);
        SessionHistory.addSession(hours, questions, subject, notes);
        const allQuests = QuestEngine.getAllQuests();
        allQuests.forEach(q => {
            if (state.completedQuestIds.includes(q.id)) return;
            const pk = q.progressKey;
            if (!state.questProgress[pk]) state.questProgress[pk] = 0;
            if (['hours', 'topics', 'chapters', 'subjects', 'chapter_pyqs', 'full_revision', 'unit', 'sections', 'analysis', 'tasks', 'days', 'day', 'set', 'problems', 'errors', 'test', 'session', 'topic'].includes(q.unit)) {
                state.questProgress[pk] += hours;
            }
            if (['questions', 'pyqs', 'problems', 'errors'].includes(q.unit)) {
                state.questProgress[pk] += questions;
            }
            if (state.questProgress[pk] >= q.target && !state.completedQuestIds.includes(q.id)) {
                state.questProgress[pk] = q.target;
                state.completedQuestIds.push(q.id);
                state.gems += q.rewardGems;
                state.stars += q.rewardStars;
                state.starsEarned += q.rewardStars;
                state.xp += q.rewardXp + Math.floor(q.rewardXp * state.prestigeBonuses.xpBonus / 100);
                state.reputation += Math.floor(q.rewardXp / 5);
                UIRenderer.showToast(`Quest auto-completed: ${q.name}! +${q.rewardGems}💎`, '✅');
            }
        });
        UIRenderer.showToast(`Logged: ${hours}h study, ${questions} questions! +XP`, '📥');
        if (hoursInput) hoursInput.value = '';
        if (questionsInput) questionsInput.value = '';
        if (notesInput) notesInput.value = '';
        StateManager.save();
        UIRenderer.refreshAll();
        AchievementSystem.checkAll();
    },

    saveReflection() {
        const input = document.getElementById('reflectionInput');
        if (!input || !input.value.trim()) return;
        state.dailyReflections[StateManager.getTodayKey()] = input.value.trim();
        UIRenderer.showToast('Daily reflection saved! 📝', '💭');
        input.value = '';
        StateManager.save();
    },
};

// ==================== EVENT HANDLERS ====================
function initEventHandlers() {
    document.getElementById('tabNav')?.addEventListener('click', function(e) {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        const tab = btn.getAttribute('data-tab');
        if (tab) UIRenderer.switchTab(tab);
    });

    document.getElementById('btnCheckIn')?.addEventListener('click', () => CheckInSystem.checkIn());
    document.getElementById('btnBuyFreeze')?.addEventListener('click', () => ShopSystem.buyFreezeToken());
    document.getElementById('btnLogStudy')?.addEventListener('click', () => StudyLogger.logStudy());
    document.getElementById('btnSaveReflection')?.addEventListener('click', () => StudyLogger.saveReflection());

    document.getElementById('btnTimer30')?.addEventListener('click', () => TimerManager.start(30));
    document.getElementById('btnTimer60')?.addEventListener('click', () => TimerManager.start(60));
    document.getElementById('btnTimer120')?.addEventListener('click', () => TimerManager.start(120));
    document.getElementById('btnTimer240')?.addEventListener('click', () => TimerManager.start(240));
    document.getElementById('btnTimerStop')?.addEventListener('click', () => TimerManager.stop());
    document.getElementById('btnPomodoro')?.addEventListener('click', () => TimerManager.start(25, true));
    document.getElementById('btnPomodoro50')?.addEventListener('click', () => TimerManager.start(50, true));

    document.getElementById('btnExport')?.addEventListener('click', () => DataManager.exportData());
    document.getElementById('btnImportTrigger')?.addEventListener('click', () => DataManager.showImportModal());
    document.getElementById('btnImportCancel')?.addEventListener('click', () => DataManager.hideImportModal());
    document.getElementById('btnImportConfirm')?.addEventListener('click', () => DataManager.importData());
    document.getElementById('btnReset')?.addEventListener('click', () => DataManager.resetAllData());
    document.getElementById('btnUpdateExamDate')?.addEventListener('click', () => {
        const input = document.getElementById('examDateInput');
        if (!input || !input.value) { UIRenderer.showToast('Please select a valid date.', '⚠️'); return; }
        const parsed = new Date(input.value + 'T00:00:00');
        if (isNaN(parsed.getTime())) { UIRenderer.showToast('Invalid date format.', '⚠️'); return; }
        if (parsed < new Date()) { UIRenderer.showToast('Exam date cannot be in the past!', '⚠️'); return; }
        EXAM_DATE = parsed;
        state.examDate = input.value;
        StateManager.save();
        UIRenderer.refreshAll();
        UIRenderer.showToast('Exam date updated! 📅', '✅');
    });

    document.getElementById('btnAddBacklog')?.addEventListener('click', () => {
        const nameInput = document.getElementById('backlogNameInput');
        const subjectSelect = document.getElementById('backlogSubjectSelect');
        const prioritySelect = document.getElementById('backlogPrioritySelect');
        if (!nameInput || !nameInput.value.trim()) {
            UIRenderer.showToast('Enter a task name.', '⚠️');
            return;
        }
        BacklogSystem.addItem(nameInput.value.trim(), subjectSelect?.value || 'general', prioritySelect?.value || 'medium');
        nameInput.value = '';
    });

    document.getElementById('importModal')?.addEventListener('click', function(e) {
        if (e.target === this) DataManager.hideImportModal();
    });

    document.getElementById('themeToggleBtn')?.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('themeSwitcherDropdown');
        if (dropdown) dropdown.classList.toggle('visible');
    });

    document.getElementById('themeSwitcherDropdown')?.addEventListener('click', function(e) {
        const option = e.target.closest('.theme-option');
        if (option) {
            const theme = option.getAttribute('data-theme');
            if (theme) ThemeManager.setTheme(theme);
            this.classList.remove('visible');
        }
    });

    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('themeSwitcherDropdown');
        const btn = document.getElementById('themeToggleBtn');
        if (dropdown && dropdown.classList.contains('visible') && !dropdown.contains(e.target) && e.target !== btn) {
            dropdown.classList.remove('visible');
        }
    });

    document.getElementById('btnPrevMonth')?.addEventListener('click', () => {
        window._calendarOffset = (window._calendarOffset || 0) - 1;
        UIRenderer.renderCalendar(window._calendarOffset);
    });
    document.getElementById('btnNextMonth')?.addEventListener('click', () => {
        window._calendarOffset = (window._calendarOffset || 0) + 1;
        UIRenderer.renderCalendar(window._calendarOffset);
    });
}

// ==================== GLOBAL EXPOSURES ====================
window.addQuestProgress = function(progressKey, questId, target, rewardGems, rewardStars, rewardXp) {
    QuestEngine.addProgress(progressKey, questId, target, rewardGems, rewardStars, rewardXp);
};
window.purchaseItem = function(name, cost, icon, duration) {
    ShopSystem.purchase(name, cost, icon, duration);
};
window.backlogToggle = function(itemId) {
    BacklogSystem.toggleComplete(itemId);
};
window.backlogDelete = function(itemId) {
    BacklogSystem.deleteItem(itemId);
};

// ==================== INITIALIZATION ====================
function init() {
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
    UIRenderer.renderSessionHistory();
    UIRenderer.renderWeeklyReports();
    AchievementSystem.checkAll();
    StateManager.save();
    window._calendarOffset = 0;
    const examInput = document.getElementById('examDateInput');
    if (examInput) examInput.value = EXAM_DATE.toISOString().split('T')[0];
    UIRenderer.updateStorageSize();

    setInterval(() => {
        if (document.getElementById('panel-dashboard')?.classList.contains('active')) {
            UIRenderer.renderDashboard();
        }
    }, 3600000);

    console.log('⚔️ JEE RPG v2.0 Productivity System initialized!');
    console.log('📅 Days until JEE Main:', StateManager.getDaysUntilExam());
    console.log('📋 Current Phase:', getCurrentPhase().name);
    console.log('💎 Gems:', state.gems, '⭐ Stars:', state.stars, '🔥 Streak:', state.streak);
    console.log('📚 Subject Levels:', state.subjectLevels);
    console.log('🏅 Reputation:', state.reputation);
    console.log('🎨 Theme:', ThemeManager.current);
    console.log('💾 Data management: Export/Import available in Settings tab');
}

document.addEventListener('DOMContentLoaded', init);