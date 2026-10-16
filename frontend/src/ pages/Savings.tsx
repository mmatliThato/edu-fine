
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Wallet,
  Loader2,
} from 'lucide-react';

import { savingsQuestions } from '../savingsQuestions';
import { progressService } from '../Services/progressService';

export default function Savings() {
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const question = savingsQuestions[currentQuestion];

  const progress = completed
    ? 100
    : ((currentQuestion + 1) / savingsQuestions.length) * 100;

  // --------------------------------------
  // HANDLE ANSWER SELECTION
  // --------------------------------------
  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null || saving) return;

    setSelectedAnswer(index);

    // Store answers for NestJS
    setAnswers((previous) => [...previous, index]);

    // Calculate score for immediate feedback
    if (index === question.correctAnswer) {
      setScore((previous) => previous + 20);
    }
  };

  // --------------------------------------
  // NEXT QUESTION / SAVE FINAL RESULT
  // --------------------------------------
  const handleNext = async () => {
    if (selectedAnswer === null || saving) return;

    if (currentQuestion < savingsQuestions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      setSelectedAnswer(null);
      return;
    }

    // Final question: Save progress to NestJS
    setSaving(true);
    setSaveError('');

    try {
      const result = await progressService.saveSavings(answers);

      console.log('Savings progress saved:', result);

      // Use the verified backend score
      setScore(result.score);
      setBestScore(result.bestScore);
      setCompleted(true);
    } catch (error) {
      console.error('Unable to save Savings:', error);

      setSaveError(
        'Unable to save your progress. Check your connection and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------
  // RESTART GAME
  // --------------------------------------
  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setScore(0);
    setBestScore(0);
    setCompleted(false);
    setSaveError('');
    setSaving(false);
  };

  // --------------------------------------
  // COMPLETION SCREEN
  // --------------------------------------
  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full rounded-3xl shadow-lg p-10 text-center">

          <div className="flex justify-center mb-6">
            <div className="bg-amber-100 p-6 rounded-full">
              <Trophy className="text-amber-600" size={65} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Level Completed!
          </h1>

          <p className="text-slate-600 mt-3">
            Great effort! You've completed the Savings challenge.
          </p>

          <div className="bg-teal-50 rounded-2xl p-6 mt-8">
            <p className="text-slate-600">Your Score</p>

            <h2 className="text-5xl font-extrabold text-teal-700 mt-2">
              {score} / 100
            </h2>

            <p className="text-teal-700 font-semibold mt-4">
              🏆 Best Score: {bestScore} / 100
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
            <p className="text-green-700 font-semibold">
              ✓ Progress saved successfully!
            </p>

            <p className="text-green-700 mt-2">
              Level 2: Loans is now unlocked! 🎉
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700"
            >
              Continue to Dashboard
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleRestart}
              className="border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------
  // SAVINGS QUESTIONS SCREEN
  // --------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-teal-700"
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>

          <div className="flex items-center gap-2 text-teal-700 font-bold">
            <Wallet size={22} />
            Savings Challenge
          </div>
        </div>

        {/* PROGRESS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex justify-between mb-3">
            <span className="font-semibold text-slate-700">
              Question {currentQuestion + 1} of {savingsQuestions.length}
            </span>

            <span className="font-semibold text-teal-700">
              Score: {score}
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-teal-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* QUESTION CARD */}
        <div className="bg-white rounded-3xl shadow-sm p-7 md:p-10">

          {/* SCENARIO */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 mb-7">
            <p className="text-sm font-bold text-teal-700 mb-2">
              REAL-LIFE SCENARIO
            </p>

            <p className="text-slate-700 leading-relaxed">
              {question.scenario}
            </p>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-7">
            {question.question}
          </h1>

          {/* ANSWERS */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isCorrect = index === question.correctAnswer;
              const isSelected = index === selectedAnswer;
              const answered = selectedAnswer !== null;

              let styles =
                'border-slate-200 hover:border-teal-500';

              if (answered && isCorrect) {
                styles = 'border-green-500 bg-green-50';
              } else if (answered && isSelected) {
                styles = 'border-red-500 bg-red-50';
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectAnswer(index)}
                  disabled={answered || saving}
                  className={`w-full border-2 rounded-xl p-4 text-left flex items-center justify-between transition ${styles}`}
                >
                  <span className="text-slate-800">
                    {option}
                  </span>

                  {answered && isCorrect && (
                    <CheckCircle2
                      className="text-green-600"
                      size={22}
                    />
                  )}

                  {answered && isSelected && !isCorrect && (
                    <XCircle
                      className="text-red-600"
                      size={22}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* EXPLANATION */}
          {selectedAnswer !== null && (
            <div className="mt-7 bg-blue-50 rounded-xl p-5">
              <h3 className="font-bold text-blue-800 mb-2">
                {selectedAnswer === question.correctAnswer
                  ? '✅ Correct Answer!'
                  : "📘 Let's Learn"}
              </h3>

              <p className="text-blue-900">
                {question.explanation}
              </p>
            </div>
          )}

          {/* NEXT BUTTON */}
          <button
            type="button"
            onClick={handleNext}
            disabled={selectedAnswer === null || saving}
            className="mt-8 w-full bg-teal-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-700"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving Progress...
              </>
            ) : (
              <>
                {currentQuestion === savingsQuestions.length - 1
                  ? 'Finish Challenge'
                  : 'Next Question'}

                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* SAVE ERROR */}
          {saveError && (
            <div
              role="alert"
              className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 text-center"
            >
              <p className="text-red-700">
                {saveError}
              </p>

              <p className="text-sm text-red-600 mt-2">
                Click Finish Challenge again to retry.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
