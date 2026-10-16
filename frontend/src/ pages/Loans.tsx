
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { progressService } from '../Services/progressService';

type PuzzleTile = {
  id: number;
  title: string;
  emoji: string;
};

type LoansResult = {
  score: number;
  bestScore: number;
  loansCompleted: boolean;
  vatUnlocked: boolean;
};

const correctOrder: PuzzleTile[] = [
  { id: 1, title: 'Amount?', emoji: '💵' },
  { id: 2, title: 'Interest', emoji: '📈' },
  { id: 3, title: 'Borrow', emoji: '🏦' },
  { id: 4, title: 'Get', emoji: '🤝' },
  { id: 5, title: 'Buy', emoji: '🛍️' },
  { id: 6, title: 'Pay type', emoji: '📅' },
  { id: 7, title: 'Pay', emoji: '💳' },
  { id: 8, title: 'Done', emoji: '🎉' },
];

const GAME_TIME = 90;

const shuffleTiles = (): PuzzleTile[] => {
  const shuffled = [...correctOrder];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  if (shuffled.every((tile, index) =>
    tile.id === correctOrder[index].id
  )) {
    [shuffled[0], shuffled[1]] = [
      shuffled[1], shuffled[0],
    ];
  }

  return shuffled;
};

const calculateScore = (tiles: PuzzleTile[]) => {
  const correct = tiles.filter(
    (tile, index) => tile.id === correctOrder[index].id
  ).length;

  return Math.round((correct / 8) * 100);
};

const isSolved = (tiles: PuzzleTile[]) =>
  tiles.every(
    (tile, index) => tile.id === correctOrder[index].id
  );

export default function Loans() {
  const navigate = useNavigate();

  const [tiles, setTiles] = useState<PuzzleTile[]>(shuffleTiles);
  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [result, setResult] = useState<LoansResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [message, setMessage] = useState('');

  const submittingRef = useRef(false);

  // Save the puzzle arrangement to MongoDB
  const submitPuzzle = useCallback(async (
    currentTiles: PuzzleTile[],
    solved: boolean
  ) => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSaving(true);
    setSaveError('');

    try {
      const tileOrder = currentTiles.map(tile => tile.id);

      const response = await progressService.saveLoans(tileOrder);

      setResult({
        score: response.score,
        bestScore: response.bestScore,
        loansCompleted: response.loansCompleted,
        vatUnlocked: response.vatUnlocked,
      });

      setMessage(solved ? 'Puzzle Solved!' : 'Time is up!');
      setSelectedIndex(null);

    } catch (error) {
      console.error('Error saving Loans progress:', error);
      setSaveError(
        'Failed to save your progress. Please try again.'
      );
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (result || saving || timeLeft === 0 || saveError) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (timeLeft === 1) {
        setTimeLeft(0);
        void submitPuzzle(tiles, false);
      } else {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [timeLeft, result, saving, saveError, tiles, submitPuzzle]);

  const gameOver =
    result !== null ||
    timeLeft === 0 ||
    saving ||
    Boolean(saveError);

  const currentScore = calculateScore(tiles);
  const displayedScore = result?.score ?? currentScore;

  // Select and swap two tiles
  const handleTileClick = (index: number) => {
    if (gameOver) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }

    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    const updatedTiles = [...tiles];

    [updatedTiles[selectedIndex], updatedTiles[index]] = [
      updatedTiles[index],
      updatedTiles[selectedIndex],
    ];

    setTiles(updatedTiles);
    setSelectedIndex(null);

    if (isSolved(updatedTiles)) {
      void submitPuzzle(updatedTiles, true);
    }
  };

  const restartGame = () => {
    if (saving) return;

    setTiles(shuffleTiles());
    setSelectedIndex(null);
    setTimeLeft(GAME_TIME);
    setResult(null);
    setSaveError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-5 md:p-10">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-700 hover:text-teal-700"
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>

          <h1 className="text-xl font-bold text-teal-700">
            🏦 Loan Puzzle
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-5 md:p-8">

          {/* GAME STATS */}
          <div className="flex justify-between items-center mb-5">
            <div className={`flex items-center gap-2 ${
              timeLeft <= 15
                ? 'text-red-600'
                : 'text-orange-600'
            }`}>
              <Clock3 size={22} />
              <span className="font-bold">{timeLeft}s</span>
            </div>

            <span className="font-bold text-teal-700">
              Score: {displayedScore}%
            </span>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full bg-slate-200 rounded-full h-3 mb-7 overflow-hidden">
            <div
              className="bg-teal-600 h-3 rounded-full transition-all"
              style={{ width: `${displayedScore}%` }}
            />
          </div>

          {/* INSTRUCTIONS */}
          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Arrange the Loan Process
            </h2>

            <p className="text-slate-600 mt-2">
              Select one tile and then another to swap
              their positions.
            </p>

            <p className="text-teal-700 font-medium mt-3">
              Complete the puzzle before time runs out!
            </p>
          </div>

          {/* PUZZLE GRID */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {tiles.map((tile, index) => {
              const selected = selectedIndex === index;

              const correct =
                tile.id === correctOrder[index].id;

              let styles =
                'border-slate-200 bg-white hover:border-teal-500';

              if (selected) {
                styles = 'border-blue-600 bg-blue-100';
              } else if (correct) {
                styles = 'border-green-400 bg-green-50';
              }

              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => handleTileClick(index)}
                  disabled={gameOver}
                  aria-pressed={selected}
                  className={`relative min-h-28 md:min-h-36 p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition disabled:cursor-not-allowed ${styles}`}
                >
                  <span className="text-3xl md:text-4xl">
                    {tile.emoji}
                  </span>

                  <span className="font-semibold text-slate-900 text-sm md:text-base text-center">
                    {tile.title}
                  </span>

                  {correct && (
                    <CheckCircle2
                      size={16}
                      className="absolute top-2 right-2 text-green-600"
                    />
                  )}
                </button>
              );
            })}

            <div className="min-h-28 md:min-h-36 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50 flex flex-col items-center justify-center gap-2 p-3">
              <Trophy size={34} className="text-amber-500" />
              <span className="font-bold text-teal-700">
                Finish!
              </span>
            </div>
          </div>

          {/* LOW TIME WARNING */}
          {!gameOver && timeLeft <= 15 && (
            <div className="mt-6 bg-red-50 text-red-700 rounded-xl p-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Hurry! Only {timeLeft} seconds remaining.
            </div>
          )}

          {/* SAVING */}
          {saving && (
            <p className="mt-6 text-center text-teal-700 font-semibold">
              Saving your progress to MongoDB...
            </p>
          )}

          {/* ERROR */}
          {saveError && (
            <div role="alert" className="mt-6 bg-red-50 rounded-xl p-5 text-center">
              <p className="text-red-700">{saveError}</p>

              <button
                onClick={() => void submitPuzzle(tiles, isSolved(tiles))}
                disabled={saving}
                className="mt-3 bg-red-600 text-white px-5 py-2 rounded-xl disabled:opacity-50"
              >
                Retry Save
              </button>
            </div>
          )}

          {/* RESULT */}
          {result && (
            <div className="mt-8 bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center">
              <Trophy
                size={45}
                className="text-amber-500 mx-auto mb-3"
              />

              <h3 className="text-2xl font-bold text-slate-900">
                {message}
              </h3>

              <p className="text-slate-600 mt-3">
                Final Score
              </p>

              <p className="text-4xl font-extrabold text-teal-700 mt-1">
                {result.score}%
              </p>

              <p className="text-slate-600 mt-3">
                Best Score: {result.bestScore}%
              </p>

              {result.vatUnlocked ? (
                <p className="text-green-700 font-bold mt-4">
                  🎉 Level 3: VAT Unlocked!
                </p>
              ) : (
                <p className="text-amber-700 mt-4">
                  Solve the full puzzle to unlock VAT.
                </p>
              )}

              <p className="text-green-700 mt-3 text-sm">
                Your progress has been saved!
              </p>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={restartGame}
              disabled={saving}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 disabled:opacity-50"
            >
              <RotateCcw size={18} />
              Restart Puzzle
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-100"
            >
              Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
