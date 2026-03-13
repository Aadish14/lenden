import React, { useState } from 'react';
import { authService } from '../services/auth';
import { LogIn } from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      return setError('Please fill all fields');
    }

    if (!isLogin && password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await authService.login(username, password);
        // We don't need to call onLogin(user) manually anymore because App.jsx will listen to onAuthStateChange!
      } else {
        await authService.register(username, password);
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-container w-full max-w-[400px]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-input rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
            <LogIn className="w-8 h-8 text-accent-blue" />
          </div>
          <h1 className="text-2xl font-bold text-accent-blue mb-2">LenDen</h1>
          <p className="text-text-muted text-sm">Your Personal Money Ledger</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-input rounded-lg p-1 mb-6 border border-border">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${isLogin ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${!isLogin ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-muted text-xs font-medium mb-1.5 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-text-muted text-xs font-medium mb-1.5 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-text-muted text-xs font-medium mb-1.5 ml-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>
          )}

          {error && <p className="text-accent-red text-sm mt-1">{error}</p>}

          <button type="submit" disabled={isLoading} className={`btn-primary w-full mt-6 py-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isLoading ? 'Processing...' : (isLogin ? 'Login to Dashboard' : 'Create Account')}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthPage;
