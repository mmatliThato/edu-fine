
import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { authService } from '../Services/authService';

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

const navigate = useNavigate();
const [loading, setLoading] = useState(false);


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await authService.login({
      email: form.email,
      password: form.password,
    });

    if (!response.accessToken) {
      throw new Error('No access token returned');
    }

    // Temporary authentication storage for local development.
    // We'll improve session security before deployment.
    sessionStorage.setItem('accessToken', response.accessToken);

    navigate('/dashboard');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      setError(
        typeof message === 'string'
          ? message
          : 'Invalid email or password',
      );
    } else {
      setError('Login failed. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">💰</div>

          <h1 className="text-3xl font-bold text-teal-600">
            Welcome Back!
          </h1>

          <p className="text-gray-500 mt-2">
            Sign in to continue learning with Edu-Fine
          </p>
        </div>

        {error && (
          <p role="alert" className="text-red-600 mb-4">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block font-medium mb-2">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block font-medium mb-2">
            Password
          </label>

          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

       <button
  type="submit"
  disabled={loading}
  className="w-full bg-teal-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
>
  {loading ? 'Signing In...' : 'Sign In'}
</button>

        <p className="text-center mt-5 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 font-semibold">
            Register
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link to="/" className="text-gray-500 hover:text-teal-600">
            ← Back to Home
          </Link>
        </p>
      </form>
    </div>
  );
}
