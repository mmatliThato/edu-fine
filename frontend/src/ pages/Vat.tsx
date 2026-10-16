
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Clock3,
  Wallet,
  Receipt,
  Trophy,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

import {
  vatProducts,
  type VatProduct,
} from '../vatProducts';

const BUDGET = 500;
const VAT_RATE = 0.15;
const GAME_TIME = 180;
const REQUIRED_ITEMS = 3;

const formatMoney = (value: number) =>
  `R${value.toFixed(2)}`;

export default function VAT() {
  const navigate = useNavigate();

  const [basket, setBasket] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [stage, setStage] = useState<'shop' | 'checkout' | 'result'>(
    'shop'
  );

  const [vatAnswer, setVatAnswer] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [score, setScore] = useState(0);

  // Selected products
  const selectedProducts = vatProducts.filter(
    (product) => basket.includes(product.id)
  );

  // Shopping calculations
  const subtotal = selectedProducts.reduce(
    (sum, product) => sum + product.price,
    0
  );

  const vat = Number((subtotal * VAT_RATE).toFixed(2));
  const total = Number((subtotal + vat).toFixed(2));
  const remaining = Number((BUDGET - total).toFixed(2));

  const overBudget = total > BUDGET;
  const enoughItems = basket.length >= REQUIRED_ITEMS;
  const timeExpired = timeLeft === 0;
  const gameFinished = stage === 'result' || timeExpired;

  // Countdown timer
  useEffect(() => {
    if (stage === 'result' || timeLeft === 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage, timeLeft === 0]);

  // Add or remove product
  const toggleProduct = (product: VatProduct) => {
    if (gameFinished) return;

    setBasket((previous) =>
      previous.includes(product.id)
        ? previous.filter((id) => id !== product.id)
        : [...previous, product.id]
    );

    setVatAnswer('');
    setAnswerError('');
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (overBudget || !enoughItems || gameFinished) return;

    setAnswerError('');
    setStage('checkout');
  };

  // Validate learner's VAT calculation
  const handleComplete = () => {
    if (gameFinished) return;

    const enteredAmount = Number(vatAnswer);

    if (
      vatAnswer.trim() === '' ||
      !Number.isFinite(enteredAmount) ||
      enteredAmount < 0
    ) {
      setAnswerError('Please enter a valid VAT amount.');
      return;
    }

    if (Math.abs(enteredAmount - vat) >= 0.005) {
      setAnswerError(
        'Not quite right! Try multiplying the subtotal by 0.15.'
      );
      return;
    }

    // Scoring:
    // 40 points for selecting at least 3 products within budget
    // 40 points for calculating VAT correctly
    // 20 points for completing within the first 120 seconds
    const finalScore =
      40 + 40 + (timeLeft >= 60 ? 20 : 0);

    setScore(finalScore);
    setAnswerError('');
    setStage('result');
  };

  // Restart game
  const restartGame = () => {
    setBasket([]);
    setTimeLeft(GAME_TIME);
    setStage('shop');
    setVatAnswer('');
    setAnswerError('');
    setScore(0);
  };

  const displayTime = `${Math.floor(timeLeft / 60)}:${String(
    timeLeft % 60
  ).padStart(2, '0')}`;

  // Results screen
  if (stage === 'result' || timeExpired) {
    const succeeded = stage === 'result';

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full rounded-3xl shadow-lg p-8 md:p-10 text-center">

          <div className="bg-amber-100 rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-6">
            <Trophy size={60} className="text-amber-600" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900">
            {succeeded
              ? 'Shopping Challenge Completed!'
              : "Time's Up!"}
          </h1>

          <p className="text-slate-600 mt-3">
            {succeeded
              ? 'Excellent! You managed your budget and calculated VAT.'
              : 'Try again and complete your checkout before time runs out.'}
          </p>

          <div className="bg-teal-50 rounded-2xl p-6 mt-7">
            <p className="text-slate-600">Your Final Score</p>
            <h2 className="text-5xl font-extrabold text-teal-700 mt-2">
              {succeeded ? score : 0}/100
            </h2>
          </div>

          {succeeded && (
            <div className="mt-6 text-left bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="text-teal-700" />
                <h3 className="font-bold text-slate-900">
                  Your Shopping Receipt
                </h3>
              </div>

              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between text-slate-700 py-2"
                >
                  <span>{product.emoji} {product.name}</span>
                  <span>{formatMoney(product.price)}</span>
                </div>
              ))}

              <div className="border-t border-slate-200 mt-3 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>VAT (15%)</span>
                  <span>{formatMoney(vat)}</span>
                </div>

                <div className="flex justify-between font-bold text-teal-700 text-lg">
                  <span>Total Paid</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-500 mt-5">
            This version does not save VAT scores to MongoDB yet.
          </p>

          <button
            onClick={restartGame}
            className="mt-7 w-full bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Play Again
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="mt-3 w-full border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-5 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="flex flex-wrap justify-between items-center gap-4 mb-7">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-700 hover:text-teal-700"
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>

          <h1 className="text-xl md:text-2xl font-bold text-teal-700">
            🛒 Edu-Fine Supermarket
          </h1>
        </header>

        {/* GAME STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-7">
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 text-teal-700">
              <Wallet size={21} />
              <span className="text-sm font-medium">Budget</span>
            </div>
            <h2 className="text-2xl font-extrabold mt-2">
              R500
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 text-orange-600">
              <Clock3 size={21} />
              <span className="text-sm font-medium">Time Left</span>
            </div>
            <h2 className={`text-2xl font-extrabold mt-2 ${
              timeLeft <= 30 ? 'text-red-600' : 'text-slate-900'
            }`}>
              {displayTime}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-blue-700">
              <ShoppingCart size={21} />
              <span className="text-sm font-medium">Items Selected</span>
            </div>
            <h2 className="text-2xl font-extrabold mt-2">
              {basket.length}
            </h2>
          </div>
        </div>

        {/* GAME INSTRUCTIONS */}
        <section className="bg-gradient-to-r from-teal-700 to-emerald-500 text-white rounded-3xl p-7 mb-8">
          <h2 className="text-2xl font-bold">
            Level 3: VAT Shopping Challenge
          </h2>
          <p className="mt-3 text-teal-50">
            You have R500! Select at least 3 products,
            stay within your budget including VAT,
            and calculate the VAT at checkout.
          </p>
          <p className="mt-2 text-sm text-teal-50">
            Prices displayed exclude 15% practice VAT.
            Finish quickly to earn bonus points!
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

          {/* SHOPPING AREA */}
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-5">
              {stage === 'shop'
                ? 'Choose Your Products'
                : 'Review Your Shopping'}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {vatProducts.map((product) => {
                const selected = basket.includes(product.id);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product)}
                    disabled={stage !== 'shop'}
                    aria-pressed={selected}
                    className={`bg-white border-2 rounded-2xl p-5 text-left transition disabled:cursor-not-allowed ${
                      selected
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-slate-200 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-4xl">
                        {product.emoji}
                      </span>

                      {selected ? (
                        <Minus className="text-teal-700" size={20} />
                      ) : (
                        <Plus className="text-slate-400" size={20} />
                      )}
                    </div>

                    <h3 className="font-bold mt-5 text-slate-900">
                      {product.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      {product.category}
                    </p>

                    <p className="text-xl font-bold text-teal-700 mt-4">
                      {formatMoney(product.price)}
                    </p>

                    <span className="text-xs text-slate-500">
                      Excluding VAT
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SHOPPING BASKET */}
          <aside className="bg-white border border-slate-200 rounded-3xl p-6 h-fit">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingCart className="text-teal-700" />
              <h2 className="text-xl font-bold">
                Your Basket
              </h2>
            </div>

            {selectedProducts.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">
                Your basket is empty. Choose some products!
              </p>
            ) : (
              <div className="space-y-3">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span>{product.emoji} {product.name}</span>
                    <span className="font-semibold">
                      {formatMoney(product.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-200 mt-5 pt-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold">
                  {formatMoney(subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">VAT (15%)</span>
                <span className="font-semibold">
                  {formatMoney(vat)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>

              <div className={`flex justify-between font-bold ${
                remaining < 0 ? 'text-red-600' : 'text-teal-700'
              }`}>
                <span>Remaining</span>
                <span>{formatMoney(remaining)}</span>
              </div>
            </div>

            {overBudget && (
              <div className="flex gap-2 items-start bg-red-50 text-red-700 rounded-xl p-3 mt-5 text-sm">
                <AlertCircle size={18} />
                You're over budget! Remove a product.
              </div>
            )}

            {/* CHECKOUT */}
            {stage === 'shop' && (
              <>
                {!enoughItems && (
                  <p className="text-slate-500 text-sm mt-4">
                    Select at least 3 products to continue.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!enoughItems || overBudget}
                  className="w-full mt-6 bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Go to Checkout
                  <ArrowRight size={19} />
                </button>
              </>
            )}

            {/* VAT CHECKOUT CHALLENGE */}
            {stage === 'checkout' && (
              <div className="mt-6 bg-amber-50 rounded-2xl p-4">
                <h3 className="font-bold text-amber-900">
                  🧮 Cashier VAT Challenge
                </h3>

                <p className="text-slate-700 text-sm mt-2">
                  Calculate 15% VAT on a subtotal of{' '}
                  <strong>{formatMoney(subtotal)}</strong>.
                  Enter the VAT amount below.
                </p>

                <label
                  htmlFor="vat-answer"
                  className="block text-sm font-semibold mt-4 mb-2"
                >
                  VAT amount (R)
                </label>

                <input
                  id="vat-answer"
                  type="number"
                  min="0"
                  step="0.01"
                  value={vatAnswer}
                  onChange={(event) => {
                    setVatAnswer(event.target.value);
                    setAnswerError('');
                  }}
                  placeholder="e.g. 45.00"
                  className="w-full border border-slate-300 bg-white rounded-xl p-3 text-slate-900"
                />

                {answerError && (
                  <p role="alert" className="text-red-600 text-sm mt-3">
                    {answerError}
                  </p>
                )}

                <button
                  onClick={handleComplete}
                  className="w-full mt-4 bg-amber-500 text-slate-950 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={19} />
                  Complete Purchase
                </button>

                <button
                  onClick={() => {
                    setStage('shop');
                    setAnswerError('');
                  }}
                  className="w-full mt-3 text-teal-700 font-semibold"
                >
                  Edit Basket
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
