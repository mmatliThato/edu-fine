
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-6">🚀</div>

        <h1 className="text-4xl font-bold text-teal-600">
          EDU-FINE
        </h1>

        <p className="text-gray-600 mt-4 mb-8">
          Learn money skills through fun and interactive games!
        </p>

        <button
          onClick={() => navigate('/register')}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700"
        >
          Get Started
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-3 border border-teal-600 text-teal-600 py-3 rounded-xl font-semibold"
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  );
}
