import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      navigate('/form'); // Redirect to form after login
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">Login</h1>
          <p className="mt-2 text-gray-500">Welcome back! Please login to your account.</p>
        </div>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="relative">
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-lg p-2"
              required
            />
            <label
              htmlFor="email"
              className="absolute left-2 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:top-2 peer-focus:text-sm"
            >
              Email
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-lg p-2"
              required
            />
            <label
              htmlFor="password"
              className="absolute left-2 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:top-2 peer-focus:text-sm"
            >
              Password
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-500 transition duration-300 ease-in-out"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-500">
          Don’t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
        <p className="text-center text-gray-500 mt-4">
          <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
