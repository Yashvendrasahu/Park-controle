import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.jsx';

export default function LoginPage() {
  const { login, setCurrentPage } = useParking();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setMessage({ text: 'Please enter both email and password', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: 'Authenticating...', type: 'info' });

    const result = await login(email, password);
    if (result.success) {
      setMessage({ text: 'Login Successful! Redirecting...', type: 'success' });
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 800);
    } else {
      setMessage({
        text: `Error: ${result.error || 'Invalid login credentials'}`,
        type: 'error',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f9fafb] font-sans">
      <div className="text-center mb-8">
        <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg shadow-indigo-200">
          <span className="text-white text-2xl font-bold italic">P</span>
        </div>
        <h1 className="text-2xl font-bold text-indigo-900">ParkControl</h1>
        <p className="text-gray-500 text-sm">Enterprise Parking Management System</p>
      </div>

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Administrator Login</h2>
        <p className="text-gray-500 text-sm mb-6">Please enter your credentials to continue</p>

        {message.text && (
          <div
            className={`mb-5 text-center text-sm font-medium p-3.5 rounded-xl border transition-all ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : message.type === 'info'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            {message.type === 'error' && <i className="fa-solid fa-circle-exclamation mr-1.5"></i>}
            {message.type === 'success' && <i className="fa-solid fa-circle-check mr-1.5"></i>}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-sm"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Please use your Supabase Administrator credentials.');
                }}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Forgot?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition shadow-md shadow-indigo-100 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? 'Authenticating...' : 'Login'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Supabase Project ID: <code className="text-indigo-600 font-semibold">qgbgpyhenjblxyurxdny</code>
          </p>
        </div>
      </div>
    </div>
  );
}
