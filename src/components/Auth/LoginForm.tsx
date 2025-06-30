import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChefHat, Mail, Lock, Eye, EyeOff, Crown } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuperAdminLogin, setIsSuperAdminLogin] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const regularAccounts = [
    { role: 'Admin', email: 'admin@smartkitchen.com', description: 'Manage assigned outlets and users' },
    { role: 'Manager', email: 'manager@smartkitchen.com', description: 'Manage inventory and reports' },
    { role: 'Storekeeper', email: 'storekeeper@smartkitchen.com', description: 'Add inventory and orders' },
  ];

  const superAdminAccount = {
    role: 'Super Admin',
    email: 'owner@smartkitchen.com',
    description: 'Global platform management'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-gradient-to-br ${
            isSuperAdminLogin 
              ? 'from-purple-500 to-indigo-600' 
              : 'from-orange-500 to-red-600'
          } rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            {isSuperAdminLogin ? (
              <Crown className="w-10 h-10 text-white" />
            ) : (
              <ChefHat className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSuperAdminLogin ? 'Super Admin Portal' : 'SmartKitchen'}
          </h1>
          <p className="text-gray-600">
            {isSuperAdminLogin ? 'Platform Owner Access' : 'Inventory Management System'}
          </p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => {
              setIsSuperAdminLogin(false);
              setEmail('');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              !isSuperAdminLogin
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Regular Login
          </button>
          <button
            onClick={() => {
              setIsSuperAdminLogin(true);
              setEmail('owner@smartkitchen.com');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              isSuperAdminLogin
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Crown className="w-4 h-4 inline mr-1" />
            Super Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r ${
              isSuperAdminLogin 
                ? 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700' 
                : 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
            } text-white py-3 px-4 rounded-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            {isSuperAdminLogin ? 'Super Admin Access' : 'Demo Accounts (Password: demo123)'}
          </h3>
          
          {isSuperAdminLogin ? (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">{superAdminAccount.role}</div>
                  <div className="text-purple-700 text-xs mt-1">{superAdminAccount.email}</div>
                  <div className="text-purple-600 text-xs mt-1">{superAdminAccount.description}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {regularAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('demo123');
                  }}
                  className="w-full text-left p-3 text-sm bg-white rounded-lg border hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="font-medium text-gray-900">{account.role}</div>
                  <div className="text-gray-600 text-xs mt-1">{account.email}</div>
                  <div className="text-gray-500 text-xs mt-1">{account.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}