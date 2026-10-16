
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { authService } from '../Services/authService';
// import { authService } from '../services/authService';
export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

const navigate = useNavigate();
const [loading, setLoading] = useState(false);


  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

 
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError('');

  if (form.password !== form.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  if (form.password.length < 8) {
    setError('Password must be at least 8 characters');
    return;
  }

  setLoading(true);

  try {
    await authService.register({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    // Send the new user to the login page
    navigate('/login');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      setError(
        typeof message === 'string'
          ? message
          : 'Registration failed. Please try again.',
      );
    } else {
      setError('Something went wrong.');
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
        <h1 className="text-3xl font-bold text-teal-600 text-center">
          Create Account
        </h1>

        <p className="text-gray-500 text-center mt-2 mb-6">
          Join Edu-Fine and start learning!
        </p>

        {error && (
          <p role="alert" className="text-red-600 mb-4">
            {error}
          </p>
        )}

        {[
          { name: 'name', label: 'Full Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'password', label: 'Password', type: 'password' },
          {
            name: 'confirmPassword',
            label: 'Confirm Password',
            type: 'password',
          },
        ].map((field) => (
          <div key={field.name} className="mb-4">
            <label
              htmlFor={field.name}
              className="block font-medium mb-2"
            >
              {field.label}
            </label>

            <input
              id={field.name}
              type={field.type}
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ))}

        <button
  type="submit"
  disabled={loading}
  className="w-full bg-teal-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
>
  {loading ? 'Creating Account...' : 'Register'}
</button>

        <p className="text-center mt-5 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
