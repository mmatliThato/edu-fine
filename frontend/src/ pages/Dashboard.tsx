
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Landmark,
  Receipt,
  Trophy,
  BookOpen,
  ArrowRight,
  LogOut,
  Sparkles,
  LockKeyhole,
  Target,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

import {
  progressService,
  type UserProgress,
} from '../Services/progressService';

// --------------------------------------
// Learning levels
// --------------------------------------
const levels = [
  {
    id: 1,
    key: 'savings' as const,
    title: 'Savings',
    description:
      'Learn how to save money, budget wisely, and reach your financial goals.',
    icon: Wallet,
    color: 'bg-teal-100 text-teal-700',
    route: '/levels/savings',
    available: true,
  },
  {
    id: 2,
    key: 'loans' as const,
    title: 'Loans',
    description:
      'Understand borrowing, interest rates, and responsible credit decisions.',
    icon: Landmark,
    color: 'bg-blue-100 text-blue-700',
    route: '/levels/loans',
    available: false,
  },
  {
    id: 3,
    key: 'vat' as const,
    title: 'VAT',
    description:
      'Discover how VAT works and how it affects everyday purchases.',
    icon: Receipt,
    color: 'bg-amber-100 text-amber-700',
    route: '/levels/vat',
    available: false,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  // --------------------------------------
  // State
  // --------------------------------------
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --------------------------------------
  // Load progress from NestJS
  // --------------------------------------
  useEffect(() => {
    let active = true;

    const loadProgress = async () => {
      try {
        const result = await progressService.getMyProgress();

        if (active) {
          setProgress(result);
          setError('');
        }
      } catch {
        if (active) {
          setError('Unable to load your learning progress.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProgress();

    return () => {
      active = false;
    };
  }, []);

  // --------------------------------------
  // Logout
  // --------------------------------------
  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    navigate('/login', { replace: true });
  };

  // --------------------------------------
  // Start a learning level
  // --------------------------------------
  

const handleStartLevel = (
  level: (typeof levels)[number],
) => {
  // Savings is always accessible
  if (level.key === 'savings') {
    navigate('/levels/savings');
    return;
  }

  // Check if the level is unlocked
  if (!progress?.levels[level.key].unlocked) {
    return;
  }

  // Navigate to the selected game
  if (level.key === 'loans') {
    navigate('/levels/loans');
  }

  if (level.key === 'vat') {
    navigate('/levels/vat');
  }
};



  // --------------------------------------
  // Loading screen
  // --------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <RefreshCw
          className="text-teal-600 animate-spin"
          size={34}
        />

        <p className="text-teal-700 font-semibold">
          Loading your learning progress...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-3 rounded-xl text-white">
              <Wallet size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-teal-700">
                EDU-FINE
              </h1>

              <p className="text-xs text-slate-500">
                Learn • Play • Grow
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl font-semibold transition"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6"
          >
            <p>{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="underline font-semibold mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* WELCOME SECTION */}
        <section className="bg-gradient-to-r from-teal-700 to-emerald-500 rounded-3xl p-8 md:p-12 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8">

            <div className="max-w-xl">

              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} />

                <span className="text-sm font-medium">
                  Your Financial Learning Journey
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
                Welcome back, {progress?.user.name ?? 'Learner'}! 👋
              </h2>

              <p className="text-teal-50 text-lg leading-relaxed">
                Complete fun challenges, earn points,
                and unlock new financial skills.
              </p>

              <button
                onClick={() => navigate('/levels/savings')}
                className="mt-7 flex items-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-xl font-bold hover:bg-teal-50 transition"
              >
                {progress?.levels.savings.completed
                  ? 'Replay Savings'
                  : 'Start Learning'}

                <ArrowRight size={19} />
              </button>
            </div>

            <div className="hidden md:flex w-44 h-44 rounded-full bg-white/15 items-center justify-center">
              <Trophy
                size={90}
                className="text-yellow-200"
              />
            </div>

          </div>
        </section>

        {/* STATISTICS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-teal-100 rounded-xl text-teal-700">
              <BookOpen size={25} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Levels Completed
              </p>

              <h3 className="text-2xl font-bold text-slate-900">
                {progress?.completedLevels ?? 0} / {progress?.totalLevels ?? 3}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-amber-100 rounded-xl text-amber-700">
              <Trophy size={25} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Points
              </p>

              <h3 className="text-2xl font-bold text-slate-900">
                {progress?.totalPoints ?? 0}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-xl text-blue-700">
              <Target size={25} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Overall Progress
              </p>

              <h3 className="text-2xl font-bold text-slate-900">
                {progress?.overallProgress ?? 0}%
              </h3>
            </div>
          </div>

        </section>

        {/* LEARNING LEVELS */}
        <section className="mt-12">

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Explore Learning Levels
          </h2>

          <p className="text-slate-600 mt-2 mb-7">
            Complete each level to unlock your next challenge.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {levels.map((level) => {
              const Icon = level.icon;

              const levelProgress = progress?.levels[level.key];

              // Savings is ALWAYS unlocked
              const isLocked =
                level.key === 'savings'
                  ? false
                  : !levelProgress?.unlocked;

              const isCompleted = levelProgress?.completed ?? false;

              // Only Savings game has been built
const isImplemented = true;
              return (
                <div
                  key={level.id}
                  className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-md transition flex flex-col"
                >

                  {/* LEVEL ICON AND STATUS */}
                  <div className="flex justify-between items-start mb-6">

                    <div className={`p-4 rounded-2xl ${level.color}`}>
                      <Icon size={30} />
                    </div>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle2 size={14} />
                        Completed
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-1 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-semibold">
                        <LockKeyhole size={13} />
                        Locked
                      </span>
                    ) : (
                      <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Unlocked
                      </span>
                    )}

                  </div>

                  {/* LEVEL DETAILS */}
                  <p className="text-sm text-teal-700 font-semibold mb-2">
                    LEVEL {level.id}
                  </p>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {level.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed flex-grow">
                    {level.description}
                  </p>

                  {/* BEST SCORE */}
                  {isCompleted && (
                    <p className="mt-4 text-green-700 font-semibold">
                      🏆 Best Score: {levelProgress?.bestScore ?? 0}/100
                    </p>
                  )}

                  {/* ACTION BUTTON */}
                  <button
                    onClick={() => handleStartLevel(level)}
                    disabled={isLocked || !isImplemented}
                    className={`mt-7 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${
                      isLocked || !isImplemented
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <LockKeyhole size={17} />
                        Locked
                      </>
                    ) : !isImplemented ? (
                      'Coming Soon'
                    ) : isCompleted ? (
                      <>
                        Play Again
                        <ArrowRight size={18} />
                      </>
                    ) : (
                      <>
                        Start Level
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                </div>
              );
            })}

          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center mt-16 pb-6 text-slate-500 text-sm">
          © {new Date().getFullYear()} Edu-Fine.
          Learn today, grow tomorrow.
        </footer>

      </main>
    </div>
  );
}
